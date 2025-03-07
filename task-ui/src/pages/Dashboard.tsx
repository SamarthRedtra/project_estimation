
import React from 'react';
import NavBar from '@/components/NavBar';
import DailyTimer from '@/components/DailyTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart2, Users } from 'lucide-react';
import { TimesheetProvider } from '@/contexts/TimesheetContext';

const Dashboard = () => {
  return (
    <TimesheetProvider>
      <div className="min-h-screen bg-background flex flex-col animate-in">
        <NavBar />
        
        <main className="flex-1 container pt-14 pb-4">
          <DailyTimer />
          
          <div className="grid grid-cols-1 gap-3 mt-3">
            <Card className="w-full shadow-sm border">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-base font-medium flex items-center">
                  <PieChart size={16} className="mr-2 text-primary" />
                  Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-40 flex items-center justify-center text-muted-foreground">
                Coming Soon: Charts and Analytics
              </CardContent>
            </Card>
            
            <Card className="w-full shadow-sm border">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-base font-medium flex items-center">
                  <BarChart2 size={16} className="mr-2 text-primary" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-40 flex items-center justify-center text-muted-foreground">
                Coming Soon: Weekly Progress Charts
              </CardContent>
            </Card>
            
            <Card className="w-full shadow-sm border">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-base font-medium flex items-center">
                  <Users size={16} className="mr-2 text-primary" />
                  Team Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-40 flex items-center justify-center text-muted-foreground">
                Coming Soon: Team Activity Overview
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </TimesheetProvider>
  );
};

export default Dashboard;
