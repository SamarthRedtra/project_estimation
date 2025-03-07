
import React from 'react';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SubmitTimesheet() {
  const { currentTimesheet, submitTimesheet, activeTimer } = useTimesheet();
  
  // If there are no entries, don't enable the submit button
  const hasEntries = currentTimesheet && currentTimesheet.entries.length > 0;
  
  if (!hasEntries && !activeTimer) {
    return null;
  }
  
  return (
    <div className="mt-4 sticky bottom-4">
      <Button 
        variant="default"
        size="lg"
        className={cn(
          "w-full shadow-lg border border-primary/10",
          hasEntries ? "animate-pulse" : "opacity-50"
        )}
        disabled={!hasEntries || !!activeTimer}
        onClick={submitTimesheet}
      >
        <Send size={16} className="mr-2" />
        Submit Timesheet
      </Button>
      
      {!!activeTimer && (
        <p className="text-xs text-center mt-2 text-muted-foreground">
          Stop current timer before submitting timesheet
        </p>
      )}
      
      {!hasEntries && !activeTimer && (
        <p className="text-xs text-center mt-2 text-muted-foreground">
          Add at least one activity to submit
        </p>
      )}
    </div>
  );
}
