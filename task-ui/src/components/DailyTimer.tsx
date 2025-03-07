import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { formatTime, getTodayDate, formatDate } from '@/lib/timeUtils';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { Card, CardContent } from '@/components/ui/card';

export default function DailyTimer() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { currentTimesheet } = useTimesheet();
  const today = getTodayDate();
  
  // Start the daily timer as soon as the component mounts
  useEffect(() => {
    if (currentTimesheet && currentTimesheet.entries.length > 0) {
      // Start interval
      intervalRef.current = setInterval(() => {
        setTotalSeconds(prev => prev + 1);
      }, 1000);
    }
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentTimesheet?.entries]);
  
  // Update the total seconds when entries change
  useEffect(() => {
    if (currentTimesheet && currentTimesheet.entries.length > 0) {
      const entriesTotal = currentTimesheet.entries.reduce((total, entry) => total + entry.duration, 0);
      
      // Only update if entries total is greater than current total
      // This prevents resetting the counter when entries are removed
      if (entriesTotal > totalSeconds) {
        setTotalSeconds(entriesTotal);
      }
    }
  }, [currentTimesheet?.entries]);
  
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
                {currentTimesheet?.entries.length || 0} {(currentTimesheet?.entries.length || 0) === 1 ? 'entry' : 'entries'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
