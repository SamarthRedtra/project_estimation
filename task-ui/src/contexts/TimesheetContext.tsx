import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Task, Activity, TimeEntry, Timesheet, fetchProjects, fetchActivities, fetchTimesheets } from '@/lib/mockData';
import { getTodayDate, formatDecimalHours } from '@/lib/timeUtils';
import { toast } from 'sonner';

// Context types
interface TimesheetContextType {
  projects: Project[];
  activities: Activity[];
  isLoading: boolean;
  currentTimesheet: Timesheet | null;
  timesheetHistory: Timesheet[];
  activeTimer: TimeEntry | null;
  selectedProject: Project | null;
  selectedTask: Task | null;
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
}

// Create context
const TimesheetContext = createContext<TimesheetContextType | undefined>(undefined);

// Provider component
export const TimesheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [currentTimesheet, setCurrentTimesheet] = useState<Timesheet | null>(null);
  const [timesheetHistory, setTimesheetHistory] = useState<Timesheet[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data
        const [projectsData, activitiesData, timesheetsData] = await Promise.all([
          fetchProjects(),
          fetchActivities(),
          fetchTimesheets()
        ]);
        
        setProjects(projectsData);
        setActivities(activitiesData);
        
        // Set default selections if available
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0]);
          if (projectsData[0].tasks.length > 0) {
            setSelectedTask(projectsData[0].tasks[0]);
          }
        }
        
        if (activitiesData.length > 0) {
          setSelectedActivity(activitiesData[0]);
        }
        
        // Check for today's timesheet in history or create a new one
        const today = getTodayDate();
        const todayTimesheet = timesheetsData.find(ts => ts.date === today);
        
        if (todayTimesheet) {
          setCurrentTimesheet(todayTimesheet);
        } else {
          setCurrentTimesheet({
            id: `ts-${Date.now()}`,
            date: today,
            entries: [],
            totalHours: 0,
            status: 'draft'
          });
        }
        
        // Set history (excluding today's timesheet)
        setTimesheetHistory(timesheetsData.filter(ts => ts.date !== today));
        
        // Load active timer from localStorage
        const savedTimer = localStorage.getItem('activeTimer');
        if (savedTimer) {
          const timer = JSON.parse(savedTimer);
          setActiveTimer(timer);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save active timer to localStorage when it changes
  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [activeTimer]);

  // Actions
  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || null;
    setSelectedProject(project);
    
    // Reset task selection
    setSelectedTask(project && project.tasks.length > 0 ? project.tasks[0] : null);
  };
  
  const selectTask = (taskId: string) => {
    if (!selectedProject) return;
    
    const task = selectedProject.tasks.find(t => t.id === taskId) || null;
    setSelectedTask(task);
  };
  
  const selectActivity = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId) || null;
    setSelectedActivity(activity);
  };
  
  const startTimer = (notes = '') => {
    if (!selectedProject || !selectedTask || !selectedActivity) {
      toast.error('Please select a project, task, and activity');
      return;
    }
    
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    setActiveTimer({
      id: `entry-${Date.now()}`,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      taskId: selectedTask.id,
      taskName: selectedTask.name,
      activityId: selectedActivity.id,
      activityName: selectedActivity.name,
      date: getTodayDate(),
      startTime: timeString,
      endTime: null,
      duration: 0,
      notes
    });
    
    toast.success('Timer started');
  };
  
  const stopTimer = () => {
    if (!activeTimer) return;
    
    const now = new Date();
    const endTime = now.toTimeString().split(' ')[0];
    
    // Calculate duration
    const start = new Date(`${activeTimer.date}T${activeTimer.startTime}`);
    const end = new Date(`${activeTimer.date}T${endTime}`);
    const durationInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    const completedEntry: TimeEntry = {
      ...activeTimer,
      endTime,
      duration: durationInSeconds
    };
    
    // Add to current timesheet
    if (currentTimesheet) {
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
      status: 'draft'
    });
    
    toast.success('Timesheet submitted successfully');
  };

  // Context value
  const contextValue: TimesheetContextType = {
    projects,
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
    submitTimesheet
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
