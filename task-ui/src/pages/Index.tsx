
import React from 'react';
import NavBar from '@/components/NavBar';
import Timer from '@/components/Timer';
import ProjectList from '@/components/ProjectList';
import TaskSelection from '@/components/TaskSelection';
import ActivitySelector from '@/components/ActivitySelector';
import { TimesheetProvider } from '@/contexts/TimesheetContext';
import DailyTimer from '@/components/DailyTimer';
import CompletedActivities from '@/components/CompletedActivities';
import SubmitTimesheet from '@/components/SubmitTimesheet';

const Index = () => {
  return (
    <TimesheetProvider>
      <div className="min-h-screen bg-background flex flex-col animate-in">
        <NavBar />
        
        <main className="flex-1 container max-w-md mx-auto pt-14 pb-4 px-3">
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
        </main>
      </div>
    </TimesheetProvider>
  );
};

export default Index;
