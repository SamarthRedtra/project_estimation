
import React from 'react';
import { cn } from '@/lib/utils';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase } from 'lucide-react';

export default function ProjectList() {
  const { 
    projects, 
    selectedProject, 
    selectProject, 
    isLoading,
    activeTimer 
  } = useTimesheet();
  
  if (isLoading) {
    return (
      <Card className="w-full shadow-sm border">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-14 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base font-medium">Projects</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {projects.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
              <Briefcase className="h-8 w-8 mb-2 opacity-30" />
              <p>No projects assigned</p>
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.name}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md flex items-center transition-colors",
                  selectedProject?.name === project.name
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
                  activeTimer && "opacity-80 pointer-events-none"
                )}
                onClick={() => selectProject(project.name)}
                disabled={!!activeTimer}
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-xs text-muted-foreground">{project.project_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {project.tasks.length} {project.tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
