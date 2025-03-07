import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Building, Phone } from 'lucide-react';

export default function Profile() {
  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Redtra',
    phone: '+1 234 567 890',
    avatarUrl: null
  };

  return (
    <div className="min-h-screen bg-background flex flex-col animate-in">
      <NavBar />
      
      <main className="flex-1 container max-w-2xl mx-auto pt-20 pb-4 px-4">
        <Card className="w-full shadow-sm border">
          <CardHeader className="text-center pb-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatarUrl || ''} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-semibold">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </Label>
                <Input id="name" defaultValue={user.name} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input id="email" type="email" defaultValue={user.email} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" /> Company
                </Label>
                <Input id="company" defaultValue={user.company} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </Label>
                <Input id="phone" type="tel" defaultValue={user.phone} />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}