
// Mock data for development purposes

export interface Project {
  id: string;
  code: string;
  name: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  name: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId: string;
  activityId: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
  notes: string;
}

export interface Timesheet {
  id: string;
  date: string;
  entries: TimeEntry[];
  totalHours: number;
  status: 'draft' | 'submitted';
  submittedAt?: string;
}

export const activities: Activity[] = [
  { id: 'act-1', name: 'Planning' },
  { id: 'act-2', name: 'Development' },
  { id: 'act-3', name: 'Testing' },
  { id: 'act-4', name: 'Documentation' },
  { id: 'act-5', name: 'Meeting' },
];

export const projects: Project[] = [
  {
    id: 'proj-1',
    code: 'PROJ-0001',
    name: 'Website Redesign',
    tasks: [
      { id: 'task-1-1', name: 'Design UI Components' },
      { id: 'task-1-2', name: 'Implement Responsive Layout' },
      { id: 'task-1-3', name: 'Browser Testing' },
    ],
  },
  {
    id: 'proj-2',
    code: 'PROJ-0002',
    name: 'Redtra',
    tasks: [
      { id: 'task-2-1', name: 'API Integration' },
      { id: 'task-2-2', name: 'Database Schema Design' },
      { id: 'task-2-3', name: 'Performance Optimization' },
    ],
  },
  {
    id: 'proj-3',
    code: 'PROJ-0003',
    name: 'Mobile App Development',
    tasks: [
      { id: 'task-3-1', name: 'Authentication Flow' },
      { id: 'task-3-2', name: 'Push Notification System' },
      { id: 'task-3-3', name: 'Offline Mode Support' },
    ],
  },
];

export const timesheets: Timesheet[] = [
  {
    id: 'ts-1',
    date: '2025-03-03',
    entries: [
      {
        id: 'entry-1',
        projectId: 'proj-1',
        taskId: 'task-1-1',
        activityId: 'act-2',
        date: '2025-03-03',
        startTime: '09:00:00',
        endTime: '12:00:00',
        duration: 10800, // 3 hours in seconds
        notes: 'Created initial mockups for homepage',
      },
      {
        id: 'entry-2',
        projectId: 'proj-2',
        taskId: 'task-2-1',
        activityId: 'act-3',
        date: '2025-03-03',
        startTime: '13:00:00',
        endTime: '17:00:00',
        duration: 14400, // 4 hours in seconds
        notes: 'Fixed authentication issues',
      },
    ],
    totalHours: 7,
    status: 'submitted',
    submittedAt: '2025-03-03T17:30:00Z',
  },
  {
    id: 'ts-2',
    date: '2025-03-04',
    entries: [
      {
        id: 'entry-3',
        projectId: 'proj-3',
        taskId: 'task-3-1',
        activityId: 'act-1',
        date: '2025-03-04',
        startTime: '08:30:00',
        endTime: '11:30:00',
        duration: 10800, // 3 hours in seconds
        notes: 'Planning session for new features',
      },
      {
        id: 'entry-4',
        projectId: 'proj-1',
        taskId: 'task-1-3',
        activityId: 'act-3',
        date: '2025-03-04',
        startTime: '12:30:00',
        endTime: '16:30:00',
        duration: 14400, // 4 hours in seconds
        notes: 'Cross-browser testing completed',
      },
      {
        id: 'entry-5',
        projectId: 'proj-2',
        taskId: 'task-2-2',
        activityId: 'act-2',
        date: '2025-03-04',
        startTime: '16:45:00',
        endTime: '19:45:00',
        duration: 10800, // 3 hours in seconds
        notes: 'Updated database schema',
      },
    ],
    totalHours: 10,
    status: 'submitted',
    submittedAt: '2025-03-04T20:00:00Z',
  },
];

// Simulates fetching data from an API
export const fetchProjects = (): Promise<Project[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(projects);
    }, 500);
  });
};

export const fetchActivities = (): Promise<Activity[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(activities);
    }, 300);
  });
};

export const fetchTimesheets = (): Promise<Timesheet[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(timesheets);
    }, 700);
  });
};
