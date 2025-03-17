import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  activity_type: string;
  date: string;
  from_time: string;
  to_time: string | null;
  duration: number;
  description: string;
  is_billable: boolean;
  name: string;
  ofrom_time: string | null;
  oto_time: string | null;
  completed:  0|1;
}

interface Timesheet {
  id: string;
  date: string;
  time_logs: TimeEntry[];
  totalHours: number;
  status: 'draft' | 'submitted';
  parent_project: string;
  employee: string;
  customer: string;
  submittedAt?: string;
  name: string;
}

interface CurrentTimesheetState {
  currentTimesheet: Timesheet | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CurrentTimesheetState = {
  currentTimesheet: null,
  isLoading: false,
  error: null,
};

const currentTimesheetSlice = createSlice({
  name: 'currentTimesheet',
  initialState,
  reducers: {
    setCurrentTimesheet: (state, action: PayloadAction<Timesheet>) => {
      state.currentTimesheet = action.payload;
    },
    updateCurrentTimesheet: (state, action: PayloadAction<Timesheet>) => {
      state.currentTimesheet = action.payload;
    },
    clearCurrentTimesheet: (state) => {
      state.currentTimesheet = null;
    },
    setTimesheetLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTimesheetError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentTimesheet,
  updateCurrentTimesheet,
  clearCurrentTimesheet,
  setTimesheetLoading,
  setTimesheetError,
} = currentTimesheetSlice.actions;

export default currentTimesheetSlice.reducer;