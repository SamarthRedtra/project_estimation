

// Format seconds to HH:MM:SS
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

// Format seconds to "X hours Y minutes"
export const formatDuration = (seconds: number): string => {
  console.log(seconds)
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  if (minutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
};

// Format seconds to decimal hours (e.g., 1.5 hours)
export const formatDecimalHours = (seconds: number): number => {
  return parseFloat((seconds / 3600).toFixed(2));
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  const userTimezone = JSON.parse(localStorage.getItem('user') || '{}').timezone || 'Asia/Kolkata';
  const today = new Date().toLocaleString('en-US', { timeZone: userTimezone });
  return today.toLocaleLowerCase().split('T')[0];
};


// Format date to display format (e.g., Apr 3, 2025)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getFormattedDateOnly = (date:Date, timezone: string): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

export const getFormattedDateTime = (date:Date,timezone: string): string => {
  const dateTimeParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(date));

  // Manually format YYYY-MM-DD HH:mm:ss
  const datePart = `${dateTimeParts[0].value}-${dateTimeParts[2].value}-${dateTimeParts[4].value}`;
  const timePart = `${dateTimeParts[6].value}:${dateTimeParts[8].value}:${dateTimeParts[10].value}`;

  return `${datePart} ${timePart}`;
};

// Format time for display (e.g., 09:45 AM)
export const formatTimeForDisplay = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hoursNum = parseInt(hours, 10);
  const period = hoursNum >= 12 ? 'PM' : 'AM';
  const hours12 = hoursNum % 12 || 12;
  
  return `${hours12}:${minutes} ${period}`;
};

// Convert time string (HH:mm:ss) to datetime format
export const convertTimeToDateTime = (timeString: string, date?: string): string => {
  const currentDate = date || getTodayDate();
  return `${currentDate} ${timeString}`;
};
