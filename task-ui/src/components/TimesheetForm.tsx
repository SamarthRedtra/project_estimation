
import React from 'react';
import { CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { formatDate, formatDuration, getTodayDate } from '@/lib/timeUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';

export default function TimesheetForm() {
  const { 
    currentTimesheet, 
    projects,
    activities,
    removeEntry, 
    submitTimesheet,
    isLoading 
  } = useTimesheet();
  
  // Helper function to get project name
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.name === projectId);
    return project ? project.name : 'Unknown Project';
  };
  
  // Helper function to get task name
  const getTaskName = (projectId: string, taskId: string) => {
    const project = projects.find(p => p.name === projectId);
    if (!project) return 'Unknown Task';
    
    const task = project.tasks.find(t => t.name === taskId);
    return task ? task.name : 'Unknown Task';
  };
  
  // Helper function to get activity name
  const getActivityName = (activityId: string) => {
    const activity = activities.find(a => a.name === activityId);
    return activity ? activity.name : 'Unknown Activity';
  };
  
  if (isLoading) {
    return (
      <Card className="w-full shadow-sm border">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Today's Timesheet</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-64 w-full" />
        </CardContent>
        <CardFooter className="px-4 py-3 border-t">
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }
  
  const today = getTodayDate();
  const displayDate = currentTimesheet ? formatDate(currentTimesheet.date) : formatDate(today);
  
  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Today's Timesheet</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon size={14} className="mr-1" />
            {displayDate}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {!currentTimesheet || currentTimesheet.time_logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
            <Clock className="h-8 w-8 mb-2 opacity-30" />
            <p>No time time_logs recorded today</p>
            <p className="text-sm">Use the timer to track your work</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto -mx-4 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Project/Task</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTimesheet.time_logs.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="align-top">
                        <div className="font-medium">{getProjectName(entry.project)}</div>
                        <div className="text-xs text-muted-foreground">{getTaskName(entry.project, entry.task)}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        {getActivityName(entry.activity_type)}
                      </TableCell>
                      <TableCell className="text-right font-mono align-top">
                        {formatDuration(entry.duration)}
                      </TableCell>
                      <TableCell className="align-top">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeEntry(entry.id)}
                        >
                          <Trash2 size={14} />
                          <span className="sr-only">Remove entry</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-sm py-1">
              <span className="font-medium">Total Working Hours</span>
              <span className="font-semibold">{currentTimesheet.totalHours.toFixed(2)} hours</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t">
        <Button 
          className="w-full"
          disabled={!currentTimesheet || currentTimesheet.time_logs.length === 0}
          onClick={submitTimesheet}
        >
          Submit Timesheet
        </Button>
      </CardFooter>
    </Card>
  );
}
