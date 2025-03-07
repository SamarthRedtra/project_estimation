
import React from 'react';
import { format } from 'date-fns';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { CalendarIcon, CheckCircle2, Clock, FileText } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from '@/lib/timeUtils';
import { Badge } from '@/components/ui/badge';
import DailyTimer from '@/components/DailyTimer';
import { TimesheetProvider } from '@/contexts/TimesheetContext';

const History = () => {
  const { timesheetHistory, isLoading } = useTimesheet();

  return (
    <div className="min-h-screen bg-background flex flex-col animate-in">
      <NavBar />
      
      <main className="flex-1 container pt-14 pb-4">
        <DailyTimer />
        
        <Card className="w-full shadow-sm border mt-3">
          <CardHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center">
                <FileText size={16} className="mr-2 text-primary" />
                Timesheet History
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !timesheetHistory || timesheetHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <CalendarIcon className="h-8 w-8 mb-2 opacity-30" />
                <p>No timesheet history found</p>
                <p className="text-sm">Submit your first timesheet to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timesheetHistory.map((timesheet) => (
                  <Card key={timesheet.id} className="border border-border/50 shadow-none">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium flex items-center">
                          <CalendarIcon size={14} className="mr-1.5 text-muted-foreground" />
                          {formatDate(timesheet.date)}
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 size={12} className="mr-1" />
                          Submitted
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Entries</p>
                          <p className="font-medium">
                            {timesheet.entries.length} {timesheet.entries.length === 1 ? 'entry' : 'entries'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Hours</p>
                          <p className="font-mono font-medium">{timesheet.totalHours.toFixed(2)} hrs</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Submitted At</p>
                        <p className="text-xs flex items-center">
                          <Clock size={12} className="mr-1" />
                          {timesheet.submittedAt ? format(new Date(timesheet.submittedAt), 'MMM d, yyyy HH:mm') : 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// We need to wrap the History component with the TimesheetProvider for it to access the timesheet context
const HistoryWithProvider = () => (
  <TimesheetProvider>
    <History />
  </TimesheetProvider>
);

export default HistoryWithProvider;
