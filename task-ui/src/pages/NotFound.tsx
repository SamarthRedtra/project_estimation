
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { TimesheetProvider } from '@/contexts/TimesheetContext';
import DailyTimer from '@/components/DailyTimer';

const NotFound = () => {
  return (
    <TimesheetProvider>
      <div className="min-h-screen bg-background flex flex-col animate-in">
        <NavBar />
        
        <main className="flex-1 container pt-14 pb-4 flex flex-col items-center justify-center">
          <DailyTimer />
          
          <div className="text-center mt-12">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl mt-2 mb-6">Page not found</p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </main>
      </div>
    </TimesheetProvider>
  );
};

export default NotFound;
