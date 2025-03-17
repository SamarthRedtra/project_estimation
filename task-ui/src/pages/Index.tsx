
import React, { useEffect } from 'react';
import NavBar from '@/components/NavBar';
import Timer from '@/components/Timer';
import ProjectList from '@/components/ProjectList';
import TaskSelection from '@/components/TaskSelection';
import ActivitySelector from '@/components/ActivitySelector';
import { TimesheetProvider } from '@/contexts/TimesheetContext';
import DailyTimer from '@/components/DailyTimer';
import CompletedActivities from '@/components/CompletedActivities';
import SubmitTimesheet from '@/components/SubmitTimesheet';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Loader } from '@/components/Loader';
import {  useUser } from '@/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { setTimesheetData, setLoading, setError } from '@/store/slices/timesheetSlice';
import { time } from 'console';


const Index = () => {
  const dispatch = useDispatch();
  const { user,setUser } = useUser();
  const { data, error, isLoading } = useFrappeGetCall(
    'project_estimation.api.get_user_info'
  );

  useEffect(() => {
    if (data?.message) {
      dispatch(setTimesheetData(data.message));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(setError(error.message || 'An error occurred'));
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (data?.message?.user) {
      const userInfo = data.message.user;
      console.log(userInfo);
      const user = {
        name: userInfo[1],
        email: userInfo[2],
        avatarUrl: userInfo[4],
        company:userInfo[6]? userInfo[6] : '',
        phone:userInfo[5]? userInfo[5] : '',
        employeeId:userInfo[7]? userInfo[7] : '',
        timezone:userInfo[3]? userInfo[3] : '',
      };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

    }
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    console.error(error);
  }

  return (
    <TimesheetProvider>
      <div className="min-h-screen bg-background flex flex-col animate-in">
        <NavBar />
        
        <main className={`flex-1 container max-w-md mx-auto pt-14 pb-4 px-3 ${error ? 'flex items-center justify-center': ''}`}>
          {error ? (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 w-full">
              <p className="text-red-700 text-center font-medium">No Employee is mapped to this user</p>
            </div>
          ) : (
            <>
              <DailyTimer />
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div className="space-y-3">
                  <ProjectList />
                  <TaskSelection />
                  <ActivitySelector />
                  <Timer />
                </div>
                <CompletedActivities />
                <SubmitTimesheet />
              </div>
            </>
          )}
        </main>
      </div>
    </TimesheetProvider>
  );
};

export default Index;
