
import React from 'react';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ClockIcon, Trash2 } from 'lucide-react';
import { formatDuration, formatTimeForDisplay } from '@/lib/timeUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import { TimeEntry} from '@/lib/mockData';
import { RootState } from '@/store';

export default function CompletedActivities() {
  const {  removeEntry } = useTimesheet();
  const { currentTimesheet } = useSelector((state:RootState) => state.currentTimesheet);
  
  
  // If there are no time_logs, don't render anything
  if (!currentTimesheet || currentTimesheet.time_logs.length === 0) {
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
          {currentTimesheet.time_logs.map((entry:TimeEntry) => (
            <div key={entry.id + '14' + Date()} className="p-3 hover:bg-muted/30">
              <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col">
                  <Badge variant="outline" className="mb-1 text-xs inline-flex w-fit">
                    {entry.project}
                  </Badge>
                  <span className="font-medium text-sm">{entry.task}</span>
                  <span className="text-xs text-muted-foreground">{entry.activity_type}</span>
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
                    {formatTimeForDisplay(entry.from_time)} - {formatTimeForDisplay(entry.to_time || '')}
                  </span>
                </div>
                <span className="font-medium">{formatDuration(entry.duration)}</span>
              </div>
              
              {entry.description && (
                <p className="mt-2 text-xs italic text-muted-foreground">{entry.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
