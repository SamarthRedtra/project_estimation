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
        
    activity_task_based = frappe.db.get_single_value('Project Estimation Setting','enable_task_level_activity')

    project_task_details = get_all_details_of_projects_assigned(user,activity_task_based)
    
    activity_type = frappe.get_all('Activity Type',{'disabled':0},['name','costing_rate','billing_rate'])
    
    user = frappe.db.get_value('User',user,['name','full_name','email','time_zone','user_image','mobile_no'])
    user = list(user)
    user.append(employeedetails[2])
    user.append(employeedetails[0])

    
    return {'employeedetails':employeedetails,'project_task_details':project_task_details,'activity_type':activity_type,'user':user,'activity_task_based': True if activity_task_based else False}
    


def get_all_details_of_projects_assigned(user,activity_task_based):
    # Fetch all tasks assigned to user in a single query
    tasks = frappe.get_all('Task',
        filters={
            '_assign': ['like', f'%"{user}"%']  # JSON array format match
        },
        fields=['project','name','status','priority','task_weight','exp_start_date', 'exp_end_date' , 'expected_time', 'progress','_assign','subject'],  # Get all fields in one request
        order_by='project'  # Optional: Sort by project for grouped results
    )
    # Organize tasks by project
        
    project_details = frappe.get_all("Project",{'name':['in',[i['project'] for i in tasks ]]},['name','project_name','expected_end_date','expected_start_date','status','is_active','custom_project_estimation','percent_complete_method','percent_complete','customer'])
    project_details = {i['name']:i for i in project_details}
    
    projects = {}
    for task in tasks:
        # Convert to dict if not already (frappe.get_all returns dicts)
        task_data = dict(task)
        
        task_data['_assign'] = frappe.parse_json(task_data.get('_assign')) if task_data.get('_assign') else []
       
        
        # Handle unassigned to project
        project_name = task_data.get('project') or "Unassigned"
        
        
        if activity_task_based:
            task_data['activity_type'] = get_activity_for_task(task_data['name'],project_name)
        
        # Initialize project list if needed
        projects.setdefault(project_name, []).append(task_data)
    
    for project,details in project_details.items():
        details['tasks'] = projects.get(project, [])
    return project_details  



@frappe.whitelist()
def get_timesheet_doc(name):
    res = frappe.get_doc("Timesheet",name).as_dict()
    for i in res.time_logs:
        i['duration'] = i.get('hours') * 3600
        
    return res   

def get_activity_for_task(task,project):
    boq = frappe.db.get_value('Bill of Quantity',fieldname='name',filters={'project':project})
    print(task,project,boq)
    if not boq:
        return []
    return  frappe.get_all('Project Estimation Items',filters={'parent':boq,'task':task},fields=['activity_type as name','costing_rate','billing_rate'])
    



@frappe.whitelist()
def get_timesheet_records(fields, filters, orderBy, limit_start=0, limit=10, asDict=True):
        orderBy = frappe.parse_json(orderBy) if orderBy else {}
        filters = frappe.parse_json(filters) if filters else {}

        # Ensure orderBy has valid field and order values
        order_field = orderBy.get("field", "modified")  # Default field to sort by
        order_type = orderBy.get("order", "desc")  # Default sorting order

        # Fetch Timesheet records
        timesheets = frappe.db.get_list(
            "Timesheet",
            fields=fields,
            filters=filters,
            order_by=f"{order_field} {order_type}",
            limit_start=limit_start,
            limit_page_length=limit,
        )

        # Fetch Timesheet Details for each Timesheet
        if timesheets:
            for timesheet in timesheets:
                timesheet["times_logs"] = frappe.db.get_list(
                    "Timesheet Detail",
                    filters={"parent": timesheet["name"]},
                    fields=["*"],
                    parent_doctype="Timesheet"
                )

        return timesheets



@frappe.whitelist()
def get_task_records(fields=None, filters=None, orderBy=None, limit_start=0, limit=10, asDict=True):
    """
    Fetch Task records with optional filtering, ordering, and pagination.
    Includes a condition where tasks completed by the current session user are included.
    """

    # Ensure inputs are parsed correctly
    fields = frappe.parse_json(fields) if fields else ["name", "subject", "status"]
    filters = frappe.parse_json(filters) if filters else []
    orderBy = frappe.parse_json(orderBy) if orderBy else {}
    filters.append(["_assign", "like", f"%{frappe.session.user}%"])

    # Set default order by values
    order_field = orderBy.get("field", "modified")
    order_type = orderBy.get("order", "desc")

    # Construct OR filter for user-specific tasks
    or_filters = [
        ["completed_by", "=",frappe.session.user],
        ["status", "=", "Completed"]
    ]

    # Fetch records
    tasks = frappe.db.get_list(
        "Task",
        fields=fields,
        filters=filters,
        order_by=f"`{order_field}` {order_type}",
        start=limit_start,
        page_length=limit,
    )
    
    task2 = frappe.get_all('Task',filters=or_filters,fields=fields)
    
    tasks.extend(task2)
    return tasks
    
    