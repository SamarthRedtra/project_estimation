import { configureStore } from '@reduxjs/toolkit';
import timesheetReducer from './slices/timesheetSlice';

const preloadedState = {};

export const store = configureStore({
  reducer: {
    timesheet: timesheetReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;