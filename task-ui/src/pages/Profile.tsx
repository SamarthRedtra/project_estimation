import React , {useState}from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Building, Phone } from 'lucide-react';
import {useNavigate} from 'react-router-dom'
import { Loader } from '@/components/Loader';

import { toast } from 'sonner';

import { useUser } from '@/contexts/UserContext';

import { useFrappePutCall } from 'frappe-react-sdk';

export default function Profile() {
  // Mock user data - replace with actual user data from your auth system
  const { user } = useUser();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(user?.phone || '');
  const {call, loading, error } = useFrappePutCall('frappe.client.set_value');

  const handleCancel = () => {
    navigate('/');
    
  };

 



  const saveChanges = async () => {
    if(!phone) return;
    if (loading) return;
    if (phone === user?.phone){
      toast.success('No changes made');
      return;
    }
    try {
      await call({
        doctype: 'User',
        name: user?.email ,
        fieldname: 'mobile_no',
        value: phone
      });
      toast.success('Changes saved successfully');
    } catch (error:any ) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data:'+ error.toString());
    }
  };

  if(loading){
    return <Loader />;
  }



  return (
    <div className="min-h-screen bg-background flex flex-col animate-in">
      <NavBar />
      
      <main className="flex-1 container max-w-2xl mx-auto pt-20 pb-4 px-4">
        <Card className="w-full shadow-sm border">
          <CardHeader className="text-center pb-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.avatarUrl || ''} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-semibold">{user?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </Label>
                <Input id="name" defaultValue={user?.name} disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" /> Employee ID
                </Label>
                <Input id="company" defaultValue={user?.employeeId} disabled />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input id="email" type="email" defaultValue={user?.email}  disabled />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" /> Company
                </Label>
                <Input id="company" defaultValue={user?.company} disabled />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </Label>
                <Input id="phone" type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                 />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={saveChanges}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}