
import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, BellRing, Shield, UserCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TimesheetProvider } from '@/contexts/TimesheetContext';
import DailyTimer from '@/components/DailyTimer';

const Settings = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col animate-in">
      <NavBar />
      
      <main className="flex-1 container pt-14 pb-4">
        <DailyTimer />
        
        <Card className="w-full shadow-sm border mt-3">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base font-medium flex items-center">
              <SettingsIcon size={16} className="mr-2 text-primary" />
              Settings
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <UserCircle size={16} className="mr-2 text-primary" />
                    <Label htmlFor="profile" className="font-medium">Profile Settings</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Manage your profile information and preferences
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Coming Soon
                </div>
              </div>
            </div>
            
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <BellRing size={16} className="mr-2 text-primary" />
                    <Label htmlFor="notifications" className="font-medium">Notifications</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enable notifications for timer and reminders
                  </p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Shield size={16} className="mr-2 text-primary" />
                    <Label htmlFor="privacy" className="font-medium">Privacy Settings</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Manage data sharing and privacy options
                  </p>
                </div>
                <Switch id="privacy" />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// We need to wrap the Settings component with the TimesheetProvider
const SettingsWithProvider = () => (
  <TimesheetProvider>
    <Settings />
  </TimesheetProvider>
);

export default SettingsWithProvider;
