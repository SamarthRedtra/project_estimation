
import React from 'react';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SubmitTimesheet() {
  const { submitTimesheet, activeTimer } = useTimesheet();
  const { currentTimesheet } = useSelector((state: RootState) => state.currentTimesheet);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async () => {
    await submitTimesheet();
    // Clear all timer data
    localStorage.removeItem('globalTimerStartTime');
    localStorage.removeItem('dailyTotalSeconds');
    localStorage.removeItem('individualTimerStartTime');
    localStorage.removeItem('isTimerActive');
    localStorage.removeItem('activeTaskId');
    setIsDialogOpen(false);
  };

  // If there are no time_logs, don't enable the submit button
  const hastime_logs = currentTimesheet && currentTimesheet.time_logs.length > 0;

  if (!hastime_logs && !activeTimer) {
    return null;
  }

  return (
    <div className="mt-4 sticky bottom-4">
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className={cn(
              "w-full shadow-lg border border-primary/10",
              hastime_logs ? "animate-pulse" : "opacity-50"
            )}
            disabled={!hastime_logs || !!activeTimer}
          >
            <Send size={16} className="mr-2" />
            Submit Timesheet
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Timesheet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this timesheet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!!activeTimer && (
        <p className="text-xs text-center mt-2 text-muted-foreground">
          Stop current timer before submitting timesheet
        </p>
      )}

      {!hastime_logs && !activeTimer && (
        <p className="text-xs text-center mt-2 text-muted-foreground">
          Add at least one activity to submit
        </p>
      )}
    </div>
  );
}
