import React, { createContext, useContext, useState, useEffect, ReactNode, use } from 'react';
import { Project, ProjectTask, Activity, TimeEntry, Timesheet, } from '@/lib/mockData';
import { getTodayDate, formatDecimalHours,getFormattedDateTime,getFormattedDateOnly } from '@/lib/timeUtils';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
// Add this import at the top
import { useFrappeAuth, FrappeContext, useFrappeGetDocList } from 'frappe-react-sdk';
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
  stopTimer: (isTaskComplete:boolean) => void;
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
import { get } from 'http';


export const TimesheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add these near the top of the component with other hooks
  const { createDoc } = useFrappeCreateDoc();
  const { user } = useUser();
  const { updateDoc } = useFrappeUpdateDoc();
  const { call, } = useContext(FrappeContext) as any;

  const { data: timesheet_data } = useFrappeGetDocList('Timesheet', {
    fields: ['*'],
    filters: [
      ['employee', '=', user?.employeeId || ''],
      ['start_date', '<=', getFormattedDateOnly(new Date(), JSON.parse(localStorage.getItem('user') || '{}').timezone || 'Asia/Kolkata')],
      ['end_date', '>=', getFormattedDateOnly(new Date(), JSON.parse(localStorage.getItem('user') || '{}').timezone || 'Asia/Kolkata')],
      ['docstatus', '=', 0]
    ]
  });




  const dispatch = useDispatch();
  const { projects, activities, isLoading, } = useSelector((state: RootState) => state.timesheet);
  const { currentTimesheet: storeTimesheet } = useSelector((state: RootState) => state.currentTimesheet);


  // setting the timesheet store if not already set from backend
  const set_timesheet = async (name: string) => {
    try {
        const timesheet = await call.get('project_estimation.api.get_timesheet_doc', { name });
        
        if (!timesheet?.message) {
            console.error('Invalid timesheet response:', timesheet);
            return;
        }

        const updatedTimesheet = {
            ...timesheet.message,
            time_logs: timesheet.message.time_logs.map((log: any) => ({
                ...log,
                ofrom_time: log.from_time,
                oto_time: log.to_time,
                from_time: log.from_time ? log.from_time.toString().split(' ')[1] : null,
                to_time: log.to_time ? log.to_time.toString().split(' ')[1].split(".")[0] : null,
            }))
        };

        dispatch(setCurrentTimesheetStore({ ...updatedTimesheet, id: updatedTimesheet.name }));
        console.log('Updated Timesheet:', updatedTimesheet);
    } catch (error) {
        console.error('Error fetching timesheet:', error);
    }
};



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
    } else if (!currentTimesheet && user) {
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

    // Start global timer if this is the first task
    if (!localStorage.getItem('globalTimerStartTime')) {
      localStorage.setItem('globalTimerStartTime', now.toISOString());
      localStorage.setItem('isTimerActive', 'true');
    }

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
      is_billable: true,
      ofrom_time:null,
      oto_time:null,
      completed:0
    });
    // Save to localStorage
    localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
    // Update timesheet
    if (storeTimesheet && activeTimer) {
      console.log('Store_timesheet')
      const updatedtime_logs = [...storeTimesheet.time_logs, activeTimer];
      const totalSeconds = updatedtime_logs.reduce((total, entry) => total + (entry?.duration || 0), 0);
      const updatedTimesheet = {
        ...storeTimesheet,
        time_logs: updatedtime_logs.filter((entry): entry is TimeEntry => entry !== null),
        totalHours: formatDecimalHours(totalSeconds)
      };
      dispatch(updateCurrentTimesheetStore(updatedTimesheet));
    }

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
  

  // Add this utility function at the top of the file
  const convertToTimezone = (date: Date, timezone: string) => {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  };
  
  // Update the handleTimesheetOperation function
  const handleTimesheetOperation = async (timesheet: Timesheet, isNew: boolean = false, isSubmit:boolean = false) => {
    dispatch(setCurrentTimesheetLoading(true));
    try {
      const userTimezone = JSON.parse(localStorage.getItem('user') || '{}').timezone || 'Asia/Kolkata';
  
      if (isNew) {
        try {
          const response = await createDoc(
            'Timesheet',
            {
              doctype: 'Timesheet',
              employee: timesheet.employee,
              date: timesheet.date,
              start_date: getFormattedDateOnly(new Date(),userTimezone),
              parent_project: timesheet.parent_project,
              customer: timesheet.customer,
              time_logs: timesheet.time_logs.map(entry => {
                const fromDate = new Date();
                const [fromHours, fromMinutes, fromSeconds] = entry.from_time.split(':');
                fromDate.setHours(parseInt(fromHours), parseInt(fromMinutes), parseInt(fromSeconds));
                const tzFromDate = getFormattedDateTime(fromDate,userTimezone);
    
                return {
                  activity_type: entry.activity_type,
                  from_time: tzFromDate,
                  to_time: getFormattedDateTime(new Date(),userTimezone),
                  hours: entry.duration / 3600,
                  project: entry.project,
                  task: entry.task,
                  is_billable: entry.is_billable ? 1 : 0,
                  description: entry.description
                };
              })
            }
          );

          let logss = response.time_logs.map((log:any) => ({...log,ofrom_time:log.from_time,oto_time: log.to_time, duration: Math.ceil(Math.abs(log.hours * 3600))}))
          dispatch(setCurrentTimesheetStore({ ...response, time_logs: logss, id: response.name }));
        } catch (error: any) {
          if (error.httpStatus === 409) {
            toast.error('A timesheet already exists for this period');
          } else if (error.httpStatus === 403) {
            toast.error('You do not have permission to create timesheets');
          } else if (error.message?.includes('ValidationError')) {
            toast.error('Please check all required fields are filled correctly');
          } else {
            toast.error('Failed to create timesheet: ' + (error?.exception || 'Unknown error'));
          }
          throw error;
        }
      } else {
        try {
          const res = await updateDoc('Timesheet', timesheet.id, {
            ...timesheet,
            start_date: timesheet.date,
            docstatus: isSubmit ? 1 : 0,
            time_logs: timesheet.time_logs.map((log) => {
              if(!log.name.startsWith("Entry")){
                return {
                  ...log,
                  from_time: log.ofrom_time,
                  to_time: log.oto_time,
                  ofrom_time: undefined,
                  oto_time: undefined
                }
              }
              const fromDate = new Date();
              const [fromHours, fromMinutes, fromSeconds] = log.from_time.split(':');
              fromDate.setHours(parseInt(fromHours), parseInt(fromMinutes), parseInt(fromSeconds));
              const tzFromDate = getFormattedDateTime(fromDate,userTimezone);
           
              let tzToDate = null;
              if (log.to_time) {
                const toDate = new Date();
                const [toHours, toMinutes, toSeconds] = log.to_time.split(':');
                toDate.setHours(parseInt(toHours), parseInt(toMinutes), parseInt(toSeconds));
                tzToDate = getFormattedDateTime(toDate,userTimezone);
              }
    
              return {
                ...log,
                name: log.name.startsWith("Entry") ? undefined : log.name,
                from_time: tzFromDate,
                to_time: tzToDate ? tzToDate : getFormattedDateTime(new Date(),userTimezone),
                id: undefined,
              };
            })
          });
          console.log('res update', res )
          let logs = res.time_logs.map((log:any) => ({...log,ofrom_time:log.from_time,oto_time: log.to_time, duration: Math.ceil(Math.abs(log.hours * 3600))}))
          console.log(logs,"logs")
          dispatch(updateCurrentTimesheetStore({...res,id: res.name, time_logs:logs , status: res.docstatus === 1? 'submitted' : 'draft'}));
        } catch (error: any) {
          if (error.httpStatus === 404) {
            toast.error('Timesheet not found. It may have been deleted');
          } else if (error.httpStatus === 403) {
            toast.error('You do not have permission to update this timesheet');
          } else if (error.message?.includes('Cannot edit submitted timesheet')) {
            toast.error('Cannot modify a submitted timesheet');
          } else if (error.message?.includes('ValidationError')) {
            toast.error('Please check all required fields are filled correctly');
          } else {
            toast.error('Failed to update timesheet: ' + (error?.exception || 'Unknown error'));
          }
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Timesheet operation failed:', error);
      dispatch(setCurrentTimesheetError(error.message || 'An unexpected error occurred'));
      throw error; // Re-throw to handle in the calling function
    } finally {
      dispatch(setCurrentTimesheetLoading(false));
    }
  };

  // Modify stopTimer to use handleTimesheetOperation
  const stopTimer = async (isTaskComplete:boolean) => {
    if (!activeTimer || !storeTimesheet) return;

    const now = new Date();
    const endTime = now.toTimeString().split(' ')[0];
    console.log(endTime, 'endTime')

    // Calculate duration
    const start = new Date(`${activeTimer.date}T${activeTimer.from_time}`);
    const end = new Date(`${activeTimer.date}T${endTime}`);
    console.log(start, 'start', 'end', end)
    const durationInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    const completedEntry: TimeEntry = {
      ...activeTimer,
      duration: durationInSeconds,
      is_billable: true,
      completed: isTaskComplete ? 1: 0
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
    setSelectedProject(null);
    setSelectedTask(null);
    setSelectedActivity(null);
    toast.success('Time entry saved');

    localStorage.removeItem('individualTimerStartTime');
    localStorage.removeItem('activeTaskId');
  };

  const removeEntry = async (entryId: string) => {
    if (!storeTimesheet) return;

    const updatedtime_logs = storeTimesheet.time_logs.filter(entry => entry.name !== entryId);
    const totalSeconds = updatedtime_logs.reduce((total, entry) => total + entry.duration, 0);

   
    const updatedTimesheet = {
      ...storeTimesheet,
      time_logs: updatedtime_logs,
      totalHours: formatDecimalHours(totalSeconds)
    };

    await handleTimesheetOperation(updatedTimesheet, false);
    toast.success('Entry removed');
  };

  // Restore state from localStorage
  useEffect(() => {
    const restoreState = () => {
      try {
        const savedProject = localStorage.getItem('selectedProject');
        const savedTask = localStorage.getItem('selectedTask');
        const savedActivity = localStorage.getItem('selectedActivity');
        const savedTimer = localStorage.getItem('activeTimer');
        const isTimerActive = localStorage.getItem('isTimerActive') === 'true';

        if (savedProject) {
          const project = JSON.parse(savedProject);
          setSelectedProject(project);
        }

        if (savedTask) {
          const task = JSON.parse(savedTask);
          setSelectedTask(task);
        }

        if (savedActivity) {
          const activity = JSON.parse(savedActivity);
          setSelectedActivity(activity);
        }

        if (savedTimer && isTimerActive) {
          const timer = JSON.parse(savedTimer);
          setActiveTimer(timer);
        }
      } catch (error) {
        console.error('Error restoring state:', error);
      }
    };

    restoreState();
  }, []);

  // Store active timer when it changes
  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [activeTimer]);

  // Modify submitTimesheet to clear all stored data
  const submitTimesheet = async () => {
    if (!storeTimesheet || storeTimesheet.time_logs.length === 0) {
      toast.error('No time logs to submit');
      return;
    }

    const submittedTimesheet: Timesheet = {
      ...storeTimesheet,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    try {
      await handleTimesheetOperation(submittedTimesheet, false, true);

   
      
      // Clear all localStorage data
      localStorage.removeItem('selectedProject');
      localStorage.removeItem('selectedTask');
      localStorage.removeItem('selectedActivity');
      localStorage.removeItem('activeTimer');
      localStorage.removeItem('isTimerActive');
      localStorage.removeItem('individualTimerStartTime');
      localStorage.removeItem('globalTimerStartTime');
      localStorage.removeItem('dailyTotalSeconds');
      localStorage.removeItem('activeTaskId');

      // Reset states
      setSelectedProject(null);
      setSelectedTask(null);
      setSelectedActivity(null);
      setActiveTimer(null);

      // Create new timesheet
      dispatch(setCurrentTimesheetStore({
        id: `ts-${Date.now()}`,
        date: getTodayDate(),
        time_logs: [],
        totalHours: 0,
        name: `ts-${Date.now()}`,
        status: 'draft',
        parent_project: '',
        employee: user?.employeeId || '',
        customer: ''
      }));

      toast.success('Timesheet submitted successfully');
    } catch (error) {
      toast.error('Failed to submit timesheet');
      console.error(error);
    }
  };

  // Add Frappe auth state
  const { currentUser, isLoading: isLoadingAuth } = useFrappeAuth();

  const contextValue: TimesheetContextType = {
    projects: projectsArray,
    activities,
    isLoading,
    currentTimesheet: storeTimesheet,
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
