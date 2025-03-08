
import React from 'react';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';

export default function ActivitySelector() {
  const { 
    selectedActivity,
    activities,
    selectActivity,
    isLoading,
    activeTimer
  } = useTimesheet();
  
  if (isLoading) {
    return (
      <Card className="w-full shadow-sm border">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium flex items-center">
            <Activity size={16} className="mr-2 text-primary" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base font-medium flex items-center">
          <Activity size={16} className="mr-2 text-primary" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Select
          value={selectedActivity?.name || ''}
          onValueChange={selectActivity}
          disabled={!!activeTimer}
        >
          <SelectTrigger id="activity" className={cn(
            "w-full",
            !selectedActivity && "text-muted-foreground"
          )}>
            <SelectValue placeholder="Select an activity" />
          </SelectTrigger>
          <SelectContent position="popper">
            {activities.map((activity) => (
              <SelectItem key={activity.name} value={activity.name}>
                {activity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
