
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, X, Timer as TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/timeUtils';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function Timer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    activeTimer, 
    selectedProject, 
    selectedTask, 
    selectedActivity,
    startTimer, 
    stopTimer, 
    discardTimer 
  } = useTimesheet();
  
  // Start/stop interval based on activeTimer
  useEffect(() => {
    if (activeTimer) {
      // Calculate initial elapsed time if the timer was already running
      if (activeTimer.from_time) {
        const start = new Date(`${activeTimer.date}T${activeTimer.from_time}`);
        const now = new Date();
        const initialElapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedSeconds(initialElapsed > 0 ? initialElapsed : 0);
      }
      
      // Start interval
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      // Clear interval and reset when not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedSeconds(0);
      setNotes('');
    }
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTimer]);
  
  const handleStart = () => {
    startTimer(notes);
  };
  
  const handleStop = () => {
    stopTimer();
  };
  
  const handleDiscard = () => {
    discardTimer();
  };
  
  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <div className="flex items-center">
            <TimerIcon size={16} className="mr-2 text-primary" />
            <span>Time Tracker</span>
          </div>
          {activeTimer && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDiscard} 
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X size={16} />
              <span className="sr-only">Discard timer</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Timer display */}
        <div className="flex items-center justify-center">
          <div className={cn(
            "text-4xl font-mono font-medium tracking-tight transition-colors",
            activeTimer ? "text-primary" : "text-muted-foreground"
          )}>
            {formatTime(elapsedSeconds)}
          </div>
        </div>
        
        {/* Current activity display */}
        {activeTimer && (
          <div className="bg-muted/30 p-3 rounded-md space-y-2">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Project</p>
                <Badge variant="outline" className="font-medium truncate">
                  {selectedProject?.name || 'Not selected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Task</p>
                <Badge variant="outline" className="font-medium truncate">
                  {selectedTask?.name || 'Not selected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Activity</p>
                <Badge variant="outline" className="font-medium truncate bg-primary/10">
                  {selectedActivity?.name || 'Not selected'}
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Notes field - only editable when timer is not running */}
        {!activeTimer && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Notes</p>
            <Textarea
              placeholder="What are you working on?"
              className="resize-none min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
        
        {/* Notes display when timer is running */}
        {activeTimer && activeTimer.description && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Notes</p>
            <p className="text-sm">{activeTimer.description}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t">
        {!activeTimer ? (
          <Button 
            className="w-full group"
            onClick={handleStart}
            disabled={!selectedProject || !selectedTask || !selectedActivity}
          >
            <Play size={16} className="mr-2 group-hover:animate-pulse" />
            Start Timer
          </Button>
        ) : (
          <div className="flex w-full space-x-2">
            <Button 
              variant="outline" 
              className="w-1/2"
              onClick={() => {
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                } else {
                  intervalRef.current = setInterval(() => {
                    setElapsedSeconds(prev => prev + 1);
                  }, 1000);
                }
              }}
            >
              {intervalRef.current ? (
                <>
                  <Pause size={16} className="mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button 
              variant="default" 
              className="w-1/2"
              onClick={handleStop}
            >
              <StopCircle size={16} className="mr-2" />
              Stop
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
