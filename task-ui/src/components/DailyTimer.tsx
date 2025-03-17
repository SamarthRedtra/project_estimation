import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { formatTime, getTodayDate, formatDate } from '@/lib/timeUtils';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Card, CardContent } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';


export default function DailyTimer() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const today = getTodayDate();
  const {  activeTimer } = useTimesheet();
  const {currentTimesheet} = useSelector((state:RootState) => state.currentTimesheet);


  // Initialize and resume global timer
  useEffect(() => {
    const savedDailyTotal = localStorage.getItem('dailyTotalSeconds');
    const savedStartTime = localStorage.getItem('globalTimerStartTime');
    const isAnyTimerActive = localStorage.getItem('isTimerActive') === 'true';
   

    if ((isAnyTimerActive && savedStartTime) || activeTimer) {
      try {
        const start = new Date(savedStartTime || new Date().toISOString());
        const now = new Date();
        const initialElapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        const totalTime = savedDailyTotal && !isNaN(Number(savedDailyTotal))? parseInt(savedDailyTotal) : 0;
        if (!isNaN(initialElapsed) && !isNaN(totalTime)) {
          setTotalSeconds(Math.max(initialElapsed, totalTime));

          if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
              setTotalSeconds(prev => {
                const newTotal = prev + 1;
                localStorage.setItem('dailyTotalSeconds', newTotal.toString());
                return newTotal;
              });
            }, 1000);
          }
        } else {
          console.error('Invalid timer values detected');
          setTotalSeconds(0);
        }
      } catch (error) {
        console.error('Error initializing timer:', error);
        setTotalSeconds(0);
      }
    }

    return () => {
      if (intervalRef.current && !activeTimer) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Initialize global timer on first task
  useEffect(() => {
    if (currentTimesheet?.time_logs && currentTimesheet.time_logs.length > 0) {
      const firstTask = currentTimesheet.time_logs[0];
      const hasGlobalTimer = localStorage.getItem('globalTimerStartTime');
      
      if (!hasGlobalTimer) {
        try {
          // Parse the time string
          const [hours, minutes, seconds] = firstTask.from_time.split(':').map(Number);
          const startTime = new Date();
          startTime.setHours(hours, minutes, seconds);
          
          // Store the valid date
          localStorage.setItem('globalTimerStartTime', startTime.toISOString());
        } catch (error) {
          console.error('Error setting global timer:', error);
          // Set current time as fallback
          localStorage.setItem('globalTimerStartTime', new Date().toISOString());
        }
      }

      // Calculate and set total seconds
      try {
        const savedTotal = localStorage.getItem('dailyTotalSeconds');
        const startTimeStr = localStorage.getItem('globalTimerStartTime');
        const startTime = startTimeStr ? new Date(startTimeStr) : new Date();
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        const timeLogsTotal = currentTimesheet.time_logs.reduce((total: number, entry: { duration: number; }) => {
          const duration = entry.duration || 0;
          return total + Math.floor(duration);
        }, 0);

        const validElapsed = !isNaN(elapsedSeconds) ? elapsedSeconds : 0;
        const validSavedTotal = savedTotal ? parseInt(savedTotal) : 0;
        
        setTotalSeconds(Math.max(
          validElapsed,
          !isNaN(validSavedTotal) ? validSavedTotal : 0,
          !isNaN(timeLogsTotal) ? timeLogsTotal : 0
        ));

        // Start or resume interval
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            setTotalSeconds(prev => {
              const newTotal = prev + 1;
              localStorage.setItem('dailyTotalSeconds', newTotal.toString());
              return newTotal;
            });
          }, 1000);
        }
      } catch (error) {
        console.error('Error calculating timer:', error);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentTimesheet?.time_logs, activeTimer]);

  // Update total when time_logs change
  useEffect(() => {
    if (currentTimesheet?.time_logs && currentTimesheet?.time_logs.length > 0) {
      const time_logsTotal = currentTimesheet.time_logs.reduce((total: number, entry: { duration: number; }) => 
        total + Math.floor(entry.duration), 0
      );
      
      setTotalSeconds(prev => Math.max(prev, time_logsTotal));
      localStorage.setItem('dailyTotalSeconds', time_logsTotal.toString());
    }
  }, [currentTimesheet?.time_logs]);
  
  return (
    <Card className="w-full border-0 bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm sticky top-14 z-10">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center">
              <Calendar size={12} className="mr-1" />
              {formatDate(today)}
            </span>
            <div className="text-xl font-mono font-medium mt-1">
              {formatTime(totalSeconds)}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Daily Progress</span>
            <div className="text-sm mt-1 flex items-center">
              <Clock size={14} className="mr-1 text-primary" />
              <span>
                {currentTimesheet?.time_logs.length || 0} {(currentTimesheet?.time_logs.length || 0) === 1 ? 'entry' : 'entries'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
