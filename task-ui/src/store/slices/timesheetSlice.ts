import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActivityType {
  name: string;
  costing_rate: number;
  billing_rate: number;
}

interface ProjectTask {
  project: string;
  name: string;
  status: string;
  priority: string;
  task_weight: number;
  exp_start_date: string | null;
  exp_end_date: string | null;
  expected_time: number;
  progress: number;
  _assign: string[];
  subject: string;
}

interface Project extends Record<string, any> {
  name: string;
  project_name: string;
  expected_end_date: string | null;
  expected_start_date: string | null;
  status: string;
  is_active: string;
  percent_complete_method: string;
  percent_complete: number;
  customer: string | null;
  tasks: ProjectTask[];
}

interface TimesheetState {
  user: {
    email: string;
    name: string;
    timezone: string;
    avatarUrl: string;
    phone: string;
    company: string;
  } | null;
  employeedetails: string[];
  projects: Record<string, Project>;
  activities: ActivityType[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TimesheetState = {
  user: null,
  employeedetails: [],
  projects: {},
  activities: [],
  isLoading: false,
  error: null,
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    setTimesheetData: (state, action: PayloadAction<any>) => {
      const { user, project_task_details, activity_type, employeedetails } = action.payload;
      
      state.user = {
        email: user[0],
        name: user[1],
        timezone: user[3],
        avatarUrl: user[4],
        phone: user[5] || '',
        company: user[6] || '',
      };
      
      state.employeedetails = employeedetails;
      state.projects = project_task_details;
      state.activities = activity_type;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTimesheetData, setLoading, setError } = timesheetSlice.actions;
export default timesheetSlice.reducer;