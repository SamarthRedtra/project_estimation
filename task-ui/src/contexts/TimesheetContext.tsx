import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectTask, Activity, TimeEntry, Timesheet,  } from '@/lib/mockData';
import { getTodayDate, formatDecimalHours,convertTimeToDateTime } from '@/lib/timeUtils';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

// Add this import at the top
import { useFrappeAuth, useFrappeGetCall, useFrappeGetDoc, FrappeContext ,useFrappeGetDocList, useFrappePostCall, useFrappePrefetchCall } from 'frappe-react-sdk';

// Add this import at the top
import { Loader } from '@/components/Loader'; // Assuming you have a Loader component

// Context types
interface TimesheetContextType {
  projects: Project[];
  activities: Activity[];
  isLoading: boolean;
  currentTimesheet: Timesheet | null;
  timesheetHistory: Timesheet[];
  activeTimer: TimeEntry | null;
  selectedProject: Project | null;
  selectedTask: ProjectTask | null;
  selectedActivity: Activity | null;
  
  // Actions
  selectProject: (projectId: string) => void;
  selectTask: (taskId: string) => void;
  selectActivity: (activityId: string) => void;
  startTimer: (notes?: string) => void;
  stopTimer: () => void;
  discardTimer: () => void;
  addEntry: (entry: TimeEntry) => void;
  removeEntry: (entryId: string) => void;
  submitTimesheet: () => void;
  isAuthenticated: boolean;
  currentUser: string | null;
  isLoadingAuth: boolean;
  isAppLoading: boolean;
}

// Create context
const TimesheetContext = createContext<TimesheetContextType | undefined>(undefined);

// Provider component
import { useDispatch, useSelector } from 'react-redux';
import { 
  setCurrentTimesheet as setCurrentTimesheetStore,
  updateCurrentTimesheet as updateCurrentTimesheetStore,
  setTimesheetLoading as setCurrentTimesheetLoading,
  setTimesheetError as setCurrentTimesheetError
} from '@/store/slices/currentTimesheetSlice';
import { RootState } from '@/store';

// Add these imports at the top
import { useFrappeCreateDoc, useFrappeUpdateDoc } from 'frappe-react-sdk';

export const TimesheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add these near the top of the component with other hooks
  const { createDoc } = useFrappeCreateDoc();
  const { user } = useUser();
  const { updateDoc } = useFrappeUpdateDoc();
  const { call,} = useContext(FrappeContext) as any;

  const {data:timesheet_data}= useFrappeGetDocList('Timesheet', {
    fields: ['*'],
    filters: [
      ['employee', '=', user?.employeeId || ''],
      ['start_date', '<=', getTodayDate()],
      ['end_date', '>=', getTodayDate()],
    ['docstatus','<',1]
    ]
  });

  


  const dispatch = useDispatch();
  const { projects, activities, isLoading,  } = useSelector((state: RootState) => state.timesheet);
  const { currentTimesheet: storeTimesheet } = useSelector((state: RootState) => state.currentTimesheet);
  
  
  const set_timesheet = async (name:string) => {
    const timesheet = await call.get('project_estimation.api.get_timesheet_doc', {
      name: name
    });
    console.log(timesheet,'timesheet',storeTimesheet)
    dispatch(setCurrentTimesheetStore({...timesheet.message,id:timesheet.message.name}));
    console.log(timesheet,'timesheet',storeTimesheet)
    setCurrentTimesheet({...timesheet.message,id:timesheet.message.name});
  }
 

  // Convert projects object to array and format it correctly
  const projectsArray = Object.values(projects);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [currentTimesheet, setCurrentTimesheet] = useState<Timesheet | null>(null);
  const [timesheetHistory, setTimesheetHistory] = useState<Timesheet[]>([]);

  useEffect(() => {

    if (timesheet_data?.length) {
      set_timesheet(timesheet_data[0].name);

    }
    else if (storeTimesheet) {
      setCurrentTimesheet(storeTimesheet);
    }  else if (!currentTimesheet && user) {
      const newTimesheet: Timesheet = {
        id: `ts-${Date.now()}`,
        date: getTodayDate(),
        time_logs: [],
        name: `TS-${Date.now()}`,
        totalHours: 0,
        status: 'draft',
        parent_project: selectedProject?.name || '',
        employee: user.employeeId || '',
        customer: selectedProject?.customer || ''
      };
      dispatch(setCurrentTimesheetStore(newTimesheet));
    }
  }, [user, timesheet_data]);
  
  
  // Add selectActivity implementation
  const selectActivity = (activityName: string) => {
    const activity = activities.find(a => a.name === activityName);
    if (activity) {
      setSelectedActivity(activity);
    }
  };

  const selectProject = (projectId: string) => {
    const project = projects[projectId];
    if (project) {
      setSelectedProject(project);
      
      // Reset task selection and set first task if available
      if (project.tasks && project.tasks.length > 0) {
        setSelectedTask(project.tasks[0]);
      } else {
        setSelectedTask(null);
      }
    }
  };
  
  const selectTask = (taskSubject: string) => {
    if (!selectedProject?.tasks) return;
    
    const task = selectedProject.tasks.find(t => t.name === taskSubject);
    if (task) {
      setSelectedTask(task);
    }
  };

  const startTimer = (notes: string = '') => {
    if (!selectedProject || !selectedTask || !selectedActivity) {
      toast.error('Please select a project, task, and activity');
      return;
    }
    
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    setActiveTimer({
      id: `entry-${Date.now()}`,
      project: selectedProject.name,
      task: selectedTask.name,
      activity_type: selectedActivity.name,
      date: getTodayDate(),
      from_time: timeString,
      name: `Entry-${Date.now()}`,
      to_time: null,
      duration: 0,
      description: notes,
      is_billable: true
    });
    
    toast.success('Timer started');
  };
 
  const discardTimer = () => {
    setActiveTimer(null);
    toast.info('Timer discarded');
  };
  
  const addEntry = async (entry: TimeEntry) => {
    if (!storeTimesheet) return;
    
    const updatedtime_logs = [...storeTimesheet.time_logs, entry];
    const totalSeconds = updatedtime_logs.reduce((total, entry) => total + entry.duration, 0);
    
    const updatedTimesheet = {
      ...storeTimesheet,
      time_logs: updatedtime_logs,
      totalHours: formatDecimalHours(totalSeconds)
    };
    
    // Create new timesheet if this is the first entry, otherwise update
    await handleTimesheetOperation(updatedTimesheet, storeTimesheet.time_logs.length === 0);
    toast.success('Entry added');
  };

  // Add this function before the other operation functions
  const handleTimesheetOperation = async (timesheet: Timesheet, isNew: boolean = false) => {
    dispatch(setCurrentTimesheetLoading(true));
    try {
      if (isNew) {
        const response = await createDoc(
          'Timesheet',
          {
            doctype: 'Timesheet',
            employee: timesheet.employee,
            date: timesheet.date,
            parent_project: timesheet.parent_project,
            customer: timesheet.customer,
            time_logs: timesheet.time_logs.map(entry => {
              const fromDate = new Date();
              const [fromHours, fromMinutes, fromSeconds] = entry.from_time.split(':');
              fromDate.setHours(parseInt(fromHours), parseInt(fromMinutes), parseInt(fromSeconds));

              let toDate;
              if (entry.to_time) {
                toDate = new Date();
                const [toHours, toMinutes, toSeconds] = entry.to_time.split(':');
                toDate.setHours(parseInt(toHours), parseInt(toMinutes), parseInt(toSeconds));
              }

              return {
                activity_type: entry.activity_type,
                from_time: fromDate.toISOString().replace('Z', ''),
                to_time: toDate ? toDate.toISOString().replace('Z', '') : null,
                hours: entry.duration / 3600,
                project: entry.project,
                task: entry.task,
                billable: entry.is_billable ? 1 : 0,
                description: entry.description
              };
            })
          }
        );
        dispatch(setCurrentTimesheetStore({ ...timesheet, id: response.name }));
        setCurrentTimesheet({
          ...timesheet,
          id: response.name
        });
      } else {
        await updateDoc('Timesheet', timesheet.id, {
          ...timesheet,
          time_logs: timesheet.time_logs.map((log) => {
            const fromDate = new Date();
            const [fromHours, fromMinutes, fromSeconds] = log.from_time.split(':');
            fromDate.setHours(parseInt(fromHours), parseInt(fromMinutes), parseInt(fromSeconds));

            let toDate;
            if (log.to_time) {
              toDate = new Date();
              const [toHours, toMinutes, toSeconds] = log.to_time.split(':');
              toDate.setHours(parseInt(toHours), parseInt(toMinutes), parseInt(toSeconds));
            }

            return {
              ...log,
              name: log.name.startsWith("Entry") ? undefined : log.name,
              from_time: fromDate.toISOString().replace('Z', ''),
              to_time: toDate ? toDate.toISOString().replace('Z', '') : undefined,
              id: undefined
            };
          })
        });
        dispatch(updateCurrentTimesheetStore(timesheet));
        setCurrentTimesheet({
          ...timesheet
        });
      }
    } catch (error: any) {
      console.error('Timesheet operation failed:', error);
      dispatch(setCurrentTimesheetError(error.message));
      
      toast.error('Failed to save timesheet');
    } finally {
      dispatch(setCurrentTimesheetLoading(false));
    }
  };

  // Modify stopTimer to use handleTimesheetOperation
  const stopTimer = async () => {
    if (!activeTimer || !storeTimesheet) return;
    
    const now = new Date();
    const endTime = now.toTimeString().split(' ')[0];
    
    // Calculate duration
    const start = new Date(`${activeTimer.date}T${activeTimer.from_time}`);
    const end = new Date(`${activeTimer.date}T${endTime}`);
    const durationInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    const completedEntry: TimeEntry = {
      ...activeTimer,
      to_time: endTime,
      duration: durationInSeconds
    };
    
    const updatedtime_logs = [...storeTimesheet.time_logs, completedEntry];
    const totalSeconds = updatedtime_logs.reduce((total, entry) => total + entry.duration, 0);
    
    const updatedTimesheet = {
      ...storeTimesheet,
      time_logs: updatedtime_logs,
      totalHours: formatDecimalHours(totalSeconds)
    };

    await handleTimesheetOperation(updatedTimesheet, storeTimesheet.time_logs.length === 0);
    setActiveTimer(null);
    toast.success('Time entry saved');
  };

  const removeEntry = async (entryId: string) => {
    if (!storeTimesheet) return;
    
    const updatedtime_logs = storeTimesheet.time_logs.filter(entry => entry.id !== entryId);
    const totalSeconds = updatedtime_logs.reduce((total, entry) => total + entry.duration, 0);
    
    const updatedTimesheet = {
      ...storeTimesheet,
      time_logs: updatedtime_logs,
      totalHours: formatDecimalHours(totalSeconds)
    };
    
    await handleTimesheetOperation(updatedTimesheet, false);
    toast.success('Entry removed');
  };
  
  const submitTimesheet = () => {
    if (!currentTimesheet || currentTimesheet.time_logs.length === 0) {
      toast.error('No time time_logs to submit');
      return;
    }
    
    // Simulate API submission
    const submittedTimesheet: Timesheet = {
      ...currentTimesheet,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };
    
    // Update history
    setTimesheetHistory([submittedTimesheet, ...timesheetHistory]);
    
    // Create a new timesheet for today
    setCurrentTimesheet({
      id: `ts-${Date.now()}`,
      date: getTodayDate(),
      time_logs: [],
      totalHours: 0,
      name: `ts-${Date.now()}`,
      status: 'draft',
      parent_project: selectedProject?.name || '', // Add required parent_project field
      employee: user?.employeeId || '', // Add required employee field
      customer: selectedProject?.customer || '' // Add required customer field
    });
    
    toast.success('Timesheet submitted successfully');
  };

  // Add Frappe auth state
  const {  currentUser, isLoading: isLoadingAuth } = useFrappeAuth();

  // Add auth methods

  // Update context value
  const contextValue: TimesheetContextType = {
    projects: projectsArray,
    activities,
    isLoading,
    currentTimesheet:storeTimesheet,
    timesheetHistory,
    activeTimer,
    selectedProject,
    selectedTask,
    selectedActivity,
    selectProject,
    selectTask,
    selectActivity,
    startTimer,
    stopTimer,
    discardTimer,
    addEntry,
    removeEntry,
    submitTimesheet,
    isAuthenticated: !!currentUser,
    currentUser: currentUser || null,
    isLoadingAuth,
  
    isAppLoading: isLoading || isLoadingAuth
  };

  return (
    <TimesheetContext.Provider value={contextValue}>
      {children}
    </TimesheetContext.Provider>
  );
};




// Custom hook
export const useTimesheet = () => {
  const context = useContext(TimesheetContext);
  if (context === undefined) {
    throw new Error('useTimesheet must be used within a TimesheetProvider');
  }
  return context;
};
