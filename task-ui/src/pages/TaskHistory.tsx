import React, { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, FileText, Eye, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate,getFormattedDateTime } from '@/lib/timeUtils';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FrappeContext ,useFrappePutCall} from 'frappe-react-sdk';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from '@/components/Loader';

const TaskHistory = () => {
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { call } = useContext(FrappeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [taskData, setTaskData] = useState([]);

  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
const [pendingStatusUpdate, setPendingStatusUpdate] = useState({ taskId: '', newStatus: '' });

  const { call:updatecall, result, loading, error, reset, isCompleted } = useFrappePutCall(
    /** method **/
    'frappe.client.set_value'
  );
 
  const getFilter = () => {
    let filters = [];

    if (statusFilter !== 'all') filters.push(['status', '=', statusFilter]);
    if (searchQuery) filters.push(['subject', 'like', `%${searchQuery}%`]);

    return filters;
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await call.get('project_estimation.api.get_task_records', {
        fields: ['*'],
        filters: getFilter(),
        orderBy: { field: 'creation', order: 'desc' },
        limit_start: (page - 1) * pageSize,
        limit: pageSize,
        asDict: true,
      });
      setTaskData(response.message || []);
    } catch (error) {
      console.error('Error fetching task data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, pageSize, statusFilter, searchQuery]);

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setPendingStatusUpdate({ taskId, newStatus });
    setIsStatusUpdateDialogOpen(true);
  };
  
  const confirmStatusUpdate = async () => {
    try {
      await updateTaskStatus(pendingStatusUpdate.taskId, pendingStatusUpdate.newStatus);
      setIsStatusUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updatecall({
        doctype: 'Task',
        name: taskId,
        fieldname: 'status',
        value: newStatus
      });
      await updatecall({
        doctype: 'Task',
        name: taskId,
        fieldname: 'completed_on',
        value: getFormattedDateTime(new Date(), user?.timezone)
      });
      await updatecall({
        doctype: 'Task',
        name: taskId,
        fieldname: 'completed_by',
        value: user?.name
      });
      toast({
        title: "Status Updated",
        description: "Task status has been successfully updated.",
      });
      fetchTasks(); // Refresh the task list
    } catch (exception) {
    console.error(exception);
      toast({
        title: "Error",
        description: error?.exception,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string, className: string }> = {
      'Open': { label: 'Open', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      'Working': { label: 'Working', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      'Completed': { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-200' },
      'Cancelled': { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    return statuses[status] || { label: status, className: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  if(loading){
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col animate-in">
      <NavBar />
      <main className="flex-1 container pt-14 pb-4">
        <Card className="w-full shadow-sm border mt-3">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base font-medium flex items-center">
              <FileText size={16} className="mr-2 text-primary" />
              Task History
            </CardTitle>
            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <Input 
                  placeholder="Search tasks..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Working">Working</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : taskData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <CalendarIcon className="h-8 w-8 mb-2 opacity-30" />
                <p>No tasks found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {taskData.map((task) => {
                  const status = getStatusBadge(task.status);
                  return (
                    <Card key={task.name} className="border border-border/50 shadow-none">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">{task.subject}</h3>
                            <p className="text-sm text-muted-foreground">{task.project_name}</p>
                          </div>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p>{formatDate(task.exp_end_date)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Priority</p>
                            <p>{task.priority}</p>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye size={14} className="mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] p-0">
                            <DialogHeader className="px-6 py-4 border-b">
                              <DialogTitle>
                                <div className='flex justify-start gap-2'>
                                    <span>Task Details</span>
                                </div>
                              </DialogTitle>
                            
                            </DialogHeader>
                            <ScrollArea className="max-h-[calc(90vh-8rem)]">
                              <div className="px-6 py-4">
                              
                                <div className="space-y-6">
                                
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className='w-full'>
                                    <Badge variant="outline"  className={status.className}>
                                        {status.label}
                                     </Badge>
                                    </div>
                                   
                                    <div>
                                      <h4 className="font-medium mb-3">Basic Details</h4>
                                      <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                                        <div>
                                          <span className="text-sm text-muted-foreground">Task ID</span>
                                          <p className="text-sm font-medium">{task.name} </p>
                                        </div>
                                        <div>
                                          <span className="text-sm text-muted-foreground">Project</span>
                                          <p className="text-sm font-medium">{task.project_name}</p>
                                        </div>
                                        <div>
                                          <span className="text-sm text-muted-foreground">Status</span>
                                          <div className="mt-1">
                                            <Select
                                              value={task.status}
                                              onValueChange={(value) => handleStatusChange(task.name, value)}
                                              disabled={true}
                                            >
                                              <SelectTrigger className="w-full">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="Working">Working</SelectItem>
                                                <SelectItem value="Overdue">Overdue</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                               
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-3">Timeline</h4>
                                      <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                                        <div>
                                          <span className="text-sm text-muted-foreground">Start Date</span>
                                          <p className="text-sm font-medium">{formatDate(task.exp_start_date)}</p>
                                        </div>
                                        <div>
                                          <span className="text-sm text-muted-foreground">Due Date</span>
                                          <p className="text-sm font-medium">{formatDate(task.exp_end_date)}</p>
                                        </div>
                                        <div>
                                          <span className="text-sm text-muted-foreground">Priority</span>
                                          <p className="text-sm font-medium">{task.priority}</p>
                                        </div>
                                      </div>
                                    </div>
                                
                                  </div>
                                  
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil((taskData?.length || 0) / pageSize)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * pageSize >= (taskData?.length || 0)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Status Update</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to update the task status to {pendingStatusUpdate.newStatus}?</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsStatusUpdateDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmStatusUpdate}>Update Status</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default TaskHistory;



