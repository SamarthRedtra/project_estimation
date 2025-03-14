import React, { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import { useTimesheet } from '@/contexts/TimesheetContext';
import { CalendarIcon, CheckCircle2, Clock, FileText, Eye, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/timeUtils';
import { Badge } from '@/components/ui/badge';
import DailyTimer from '@/components/DailyTimer';
import { TimesheetProvider } from '@/contexts/TimesheetContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFrappeGetCall, FrappeContext } from 'frappe-react-sdk';

const History = () => {
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const { call } = useContext(FrappeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [timesheetData, setTimesheetData] = useState([]);

  const getFilter = () => {
    let filters = [['employee', '=', user?.employeeId || '']];

    if (dateFilter === 'week') filters.push(['creation', 'Timespan', 'last_week']);
    if (dateFilter === 'month') filters.push(['creation', 'Timespan', 'last_month']);
    if (searchQuery) filters.push(['name', 'like', `%${searchQuery}%`]);

    return filters;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await call.get('project_estimation.api.get_timesheet_records', {
          fields: ['*'],
          filters: getFilter(),
          orderBy: { field: 'creation', order: 'desc' },
          limit_start: (page - 1) * pageSize,
          limit: pageSize,
          asDict: true,
        });
        setTimesheetData(response.message || []);
      } catch (error) {
        console.error('Error fetching timesheet data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page, pageSize, dateFilter, searchQuery]);

  const getStatusBadge = (docstatus) => {
    const statuses = {
      0: { label: 'Draft', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      1: { label: 'Submitted', className: 'bg-green-50 text-green-700 border-green-200' },
      2: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    return statuses[docstatus] || { label: 'Unknown', className: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col animate-in">
      <NavBar />
      <main className="flex-1 container pt-14 pb-4">
        <DailyTimer />
        <Card className="w-full shadow-sm border mt-3">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base font-medium flex items-center">
              <FileText size={16} className="mr-2 text-primary" />
              Timesheet History
            </CardTitle>
            <div className="flex gap-3 mt-3">
              <Input placeholder="Search timesheets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by date" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="week">Last week</SelectItem>
                  <SelectItem value="month">Last month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : timesheetData.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No timesheet history found</p>
            ) : (
              timesheetData.map((timesheet) => {
                const status = getStatusBadge(timesheet.docstatus);
                return (
                  <Card key={timesheet.name} className="border border-border/50 shadow-none mt-2">
                    <CardContent className="p-3">
                      <div className="flex justify-between mb-2">
                        <p>{formatDate(timesheet.start_date)}</p>
                        <Badge variant="outline" className={status.className}><CheckCircle2 size={12} />{status.label}</Badge>
                      </div>
                      <p>Total Hours: {timesheet.total_hours?.toFixed(2)} hrs</p>
                      <p>Entries: {timesheet.times_logs.length}</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Eye size={14} /> View Details</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-auto p-4">
                          <DialogHeader><DialogTitle>Timesheet Details</DialogTitle></DialogHeader>
                          <p>ID: {timesheet.name}</p>
                          <p>Employee: {timesheet.employee_name}</p>
                          <p>Billable Amount: {timesheet.currency} {timesheet.total_billable_amount?.toFixed(2)}</p>
                          <p>Activities:</p>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Activity</TableHead>
                                <TableHead>Task</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Billing</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {timesheet.times_logs.map((log) => (
                                <TableRow key={log.name}>
                                  <TableCell>{log.activity_type}</TableCell>
                                  <TableCell>{log.task}</TableCell>
                                  <TableCell>{log.hours?.toFixed(2)} hrs</TableCell>
                                  <TableCell>{log.billing_amount?.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default () => (
  <TimesheetProvider>
    <History />
  </TimesheetProvider>
);
