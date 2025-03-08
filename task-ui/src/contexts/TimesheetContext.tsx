import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectTask, Activity, TimeEntry, Timesheet,  } from '@/lib/mockData';
import { getTodayDate, formatDecimalHours } from '@/lib/timeUtils';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

// Add this import at the top
import { useFrappeAuth, useFrappeGetDocList } from 'frappe-react-sdk';

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
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const TimesheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { projects, activities, isLoading, error } = useSelector((state: RootState) => state.timesheet);
  const { user } = useUser();
  
  // Convert projects object to array and format it correctly
  const projectsArray = Object.values(projects);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [currentTimesheet, setCurrentTimesheet] = useState<Timesheet | null>(null);
  const [timesheetHistory, setTimesheetHistory] = useState<Timesheet[]>([]);

  useEffect(() => {
    if (!currentTimesheet && user) {
      setCurrentTimesheet({
        id: `ts-${Date.now()}`,
        date: getTodayDate(),
        entries: [],
        totalHours: 0,
        status: 'draft',
        parent_project: '',
        employee: user.employeeId || '',
        customer: ''
      });
    }
  }, [currentTimesheet, user]);
  
  
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
    
    const task = selectedProject.tasks.find(t => t.subject === taskSubject);
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
      task: selectedTask.subject,
      activity_type: selectedActivity.name,
      date: getTodayDate(),
      from_time: timeString,
      to_time: null,
      duration: 0,
      description: notes,
      is_billable: true
    });
    
    toast.success('Timer started');
  };
  
  const stopTimer = () => {
    if (!activeTimer) return;
    
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
    
    console.log(currentTimesheet,'99')
    // Add to current timesheet
    if (currentTimesheet) {
      console.log(currentTimesheet,'99')
      const updatedEntries = [...currentTimesheet.entries, completedEntry];
      const totalSeconds = updatedEntries.reduce((total, entry) => total + entry.duration, 0);
      
      setCurrentTimesheet({
        ...currentTimesheet,
        entries: updatedEntries,
        totalHours: formatDecimalHours(totalSeconds)
      });
    }
    
    // Clear active timer
    setActiveTimer(null);
    toast.success('Time entry saved');
  };
  
  const discardTimer = () => {
    setActiveTimer(null);
    toast.info('Timer discarded');
  };
  
  const addEntry = (entry: TimeEntry) => {
    if (!currentTimesheet) return;
    
    const updatedEntries = [...currentTimesheet.entries, entry];
    const totalSeconds = updatedEntries.reduce((total, entry) => total + entry.duration, 0);
    console.log(updatedEntries,'99')
    
    setCurrentTimesheet({
      ...currentTimesheet,
      entries: updatedEntries,
      totalHours: formatDecimalHours(totalSeconds)
    });
    
    toast.success('Entry added');
  };
  
  const removeEntry = (entryId: string) => {
    if (!currentTimesheet) return;
    
    const updatedEntries = currentTimesheet.entries.filter(entry => entry.id !== entryId);
    const totalSeconds = updatedEntries.reduce((total, entry) => total + entry.duration, 0);
    
    setCurrentTimesheet({
      ...currentTimesheet,
      entries: updatedEntries,
      totalHours: formatDecimalHours(totalSeconds)
    });
    
    toast.success('Entry removed');
  };
  
  const submitTimesheet = () => {
    if (!currentTimesheet || currentTimesheet.entries.length === 0) {
      toast.error('No time entries to submit');
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
      entries: [],
      totalHours: 0,
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
    currentTimesheet,
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
