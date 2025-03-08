
// Mock data for development purposes
export interface Project {
  name: string;
  project_name: string;
  expected_end_date: string | null;
  expected_start_date: string | null;
  status: string;
  is_active: string;
  percent_complete_method: string;
  percent_complete: number;
  customer: string | null;
  tasks: ProjectTask[];
}

export interface ProjectTask {
  name: string;
  project: string;
  status: string;
  priority: string;
  task_weight: number;
  exp_start_date: string | null;
  exp_end_date: string | null;
  expected_time: number;
  progress: number;
  _assign: string[];
  subject: string;
}

export interface Activity {
  name: string;
  costing_rate: number;
  billing_rate: number;
}

export interface TimeEntry {
  id: string;
  project: string;
  task: string;
  activity_type: string;
  date: string;
  from_time: string;
  to_time: string | null;
  duration: number;
  description: string;
  is_billable: boolean;
}

export interface Timesheet {
  id: string;
  date: string;
  entries: TimeEntry[];
  parent_project: string;
  employee: string;
  customer: string;
  status: 'draft' | 'submitted';
  submittedAt?: string;
  totalHours: number;
}

