import frappe

from frappe import _

@frappe.whitelist(methods=['GET'])
def get_user_info(user=None):
    if not user:
        user = frappe.session.user
     
    # fetching the employee details    
    employeedetails= frappe.db.get_value(
        'Employee',
        {
            'user_id':user
        },
        ['name','employee_name','company','designation','user_id','holiday_list','expense_approver','shift_request_approver','default_shift','bio']
    )    
    
    
    if not employeedetails:
        frappe.throw(_(
            'Employee not found for user {0}'.format(user)
        ), frappe.DoesNotExistError)
        
    
    project_details = get_all_details_of_projects_assigned(user)
    
    activity_type = frappe.get_all('Activity Type',{'disabled':0},['name','costing_rate','billing_rate'])
    
    user = frappe.db.get_value('User',user,['name','full_name','email','time_zone','user_image','mobile_no'])
    user = list(user)
    user.append(employeedetails[2])
    
    return {'employeedetails':employeedetails,'project_details':project_details,'activity_type':activity_type,'user':user}
    


def get_all_details_of_projects_assigned(user):
    # Fetch all tasks assigned to user in a single query
    tasks = frappe.get_all('Task',
        filters={
            '_assign': ['like', f'%"{user}"%']  # JSON array format match
        },
        fields=['project','status','priority','task_weight','exp_start_date', 'exp_end_date' , 'expected_time', 'progress'],  # Get all fields in one request
        order_by='project'  # Optional: Sort by project for grouped results
    )
    
    # Organize tasks by project
    projects = {}
    for task in tasks:
        # Convert to dict if not already (frappe.get_all returns dicts)
        task_data = dict(task)
        
        # Handle unassigned to project
        project_name = task_data.get('project') or "Unassigned"
        
        # Initialize project list if needed
        projects.setdefault(project_name, []).append(task_data)
    
    return projects  
