
import React from 'react';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ClockIcon, Trash2 } from 'lucide-react';
import { formatDuration, formatTimeForDisplay } from '@/lib/timeUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CompletedActivities() {
  const { currentTimesheet, removeEntry } = useTimesheet();
  
  // If there are no entries, don't render anything
  if (!currentTimesheet || currentTimesheet.entries.length === 0) {
    return null;
  }
  
  return (
    <Card className="w-full shadow-sm border mt-4">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base font-medium flex items-center">
          <CheckCircle size={16} className="mr-2 text-primary" />
          Completed Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 max-h-[200px] overflow-y-auto">
        <div className="divide-y">
          {currentTimesheet.entries.map((entry) => (
            <div key={entry.id} className="p-3 hover:bg-muted/30">
              <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col">
                  <Badge variant="outline" className="mb-1 text-xs inline-flex w-fit">
                    {entry.projectName}
                  </Badge>
                  <span className="font-medium text-sm">{entry.taskName}</span>
                  <span className="text-xs text-muted-foreground">{entry.activityName}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEntry(entry.id)}
                >
                  <Trash2 size={14} />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <ClockIcon size={12} className="mr-1" />
                  <span>
                    {formatTimeForDisplay(entry.startTime)} - {formatTimeForDisplay(entry.endTime || '')}
                  </span>
                </div>
                <span className="font-medium">{formatDuration(entry.duration)}</span>
              </div>
              
              {entry.notes && (
                <p className="mt-2 text-xs italic text-muted-foreground">{entry.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
