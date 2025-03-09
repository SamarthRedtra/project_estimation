import { configureStore } from '@reduxjs/toolkit';
import timesheetReducer from './slices/timesheetSlice';
import currentTimesheetReducer from './slices/currentTimesheetSlice';
const preloadedState = {};

export const store = configureStore({
  reducer: {
    timesheet: timesheetReducer,
    currentTimesheet: currentTimesheetReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;