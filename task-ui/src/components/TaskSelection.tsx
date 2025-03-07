
import React from 'react';
import { cn } from '@/lib/utils';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function TaskSelection() {
  const { 
    selectedProject, 
    selectedTask,
    selectTask,
    isLoading,
    activeTimer
  } = useTimesheet();
  
  if (isLoading) {
    return (
      <Card className="w-full shadow-sm border">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Task</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!selectedProject) {
    return (
      <Card className="w-full shadow-sm border">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Task</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-2 text-muted-foreground">
            Select a project first
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base font-medium">Task</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Select
          value={selectedTask?.id || ''}
          onValueChange={selectTask}
          disabled={!!activeTimer}
        >
          <SelectTrigger id="task" className={cn(
            "w-full",
            !selectedTask && "text-muted-foreground"
          )}>
            <SelectValue placeholder="Select a task" />
          </SelectTrigger>
          <SelectContent position="popper">
            {selectedProject.tasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
