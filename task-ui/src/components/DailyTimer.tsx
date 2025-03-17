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
  const { currentTimesheet } = useSelector((state: RootState) => state.currentTimesheet);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTotalSeconds((prev) => {
        const newTotal = prev + 1;
        localStorage.setItem('dailyTotalSeconds', newTotal.toString());
        return newTotal;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    localStorage.removeItem('dailyTotalSeconds');
    localStorage.removeItem('globalTimerStartTime');
    localStorage.setItem('isTimerActive', 'false');
  };

  useEffect(() => {
    const savedDailyTotal = localStorage.getItem('dailyTotalSeconds');
    const savedStartTime = localStorage.getItem('globalTimerStartTime');
    const isTimerActive = localStorage.getItem('isTimerActive') === 'true';

    try {
      let savedTotal = savedDailyTotal ? parseInt(savedDailyTotal) : 0;
      let elapsedSeconds = 0;

      if (savedStartTime && isTimerActive) {
        const start = new Date(savedStartTime);
        const now = new Date();
        elapsedSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
      }

      setTotalSeconds(isTimerActive ?  elapsedSeconds : elapsedSeconds);

      if (isTimerActive && !intervalRef.current) startTimer();
    } catch (error) {
      console.error('Error initializing timer:', error);
      setTotalSeconds(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentTimesheet?.status === 'submitted') {
      stopTimer();
      setTotalSeconds(0);
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