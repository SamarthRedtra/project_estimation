
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, X, Timer as TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/timeUtils';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSelector } from'react-redux';
import { TimeEntry} from '@/lib/mockData';
import { RootState } from '@/store';


export default function Timer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const {currentTimesheet} = useSelector((state:RootState) => state.currentTimesheet);
  
  const { 
    activeTimer, 
    selectedProject, 
    selectedTask, 
    selectedActivity,
    startTimer, 
    stopTimer, 
    discardTimer ,

  } = useTimesheet();

  // Initialize and resume individual timer
  useEffect(() => {
    if (activeTimer) {
      const savedStartTime = localStorage.getItem('individualTimerStartTime');
      const savedTaskId = localStorage.getItem('activeTaskId');
      
      if (savedStartTime && savedTaskId === activeTimer.id) {
        const start = new Date(savedStartTime);
        const now = new Date();
        const initialElapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedSeconds(initialElapsed > 0 ? initialElapsed : 0);
        
        intervalRef.current = setInterval(() => {
          setElapsedSeconds(prev => prev + 1);
        }, 1000);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle timer state changes
  useEffect(() => {
    if (activeTimer) {
      if (activeTimer.from_time) {
        const startTime = new Date();
        const [hours, minutes, seconds] = activeTimer.from_time.split(':');
        startTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        
        localStorage.setItem('individualTimerStartTime', startTime.toISOString());
        localStorage.setItem('isTimerActive', 'true');
        localStorage.setItem('activeTaskId', activeTimer.id);

        if (!intervalRef.current) {
          const now = new Date();
          const initialElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          setElapsedSeconds(initialElapsed > 0 ? initialElapsed : 0);
          
          intervalRef.current = setInterval(() => {
            const currentTime = new Date();
            const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
            setElapsedSeconds(elapsed);
          }, 1000);
        }
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedSeconds(0);
      setNotes('');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTimer]);

  // Store selected items when they change
  useEffect(() => {
    if (selectedProject && selectedTask && selectedActivity) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject));
      localStorage.setItem('selectedTask', JSON.stringify(selectedTask));
      localStorage.setItem('selectedActivity', JSON.stringify(selectedActivity));
    }
  }, [selectedProject, selectedTask, selectedActivity]);

  const handleStop = async () => {
    await stopTimer();
    localStorage.removeItem('individualTimerStartTime');
    localStorage.removeItem('activeTaskId');
    
    // Only remove isTimerActive if there are no other active timers
    if (!currentTimesheet?.time_logs.some((log: { to_time: string | null }) => !log.to_time)) {
      localStorage.removeItem('isTimerActive');
    }
  };

  const handleStart = () => {
    startTimer(notes);
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
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* <div className="text-sm text-muted-foreground">Global Time Today</div>
          <div className="text-2xl font-mono font-medium tracking-tight text-primary/70">
            {formatTime(0)}
          </div> */}
          <div className="text-sm text-muted-foreground mt-4">Current Task</div>
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
