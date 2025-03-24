frappe.ui.form.on('Project', {
   onload: async function(frm) {
     const setting = await frappe.db.get_single_value('Project Estimation Setting', 'enable_task_level_activity');
     if (setting === "1") {
       frm.set_df_property('custom_project_estimation', 'reqd', 1);
     }
   },
 
   refresh: async function(frm) {
     const setting = await frappe.db.get_single_value('Project Estimation Setting', 'enable_task_level_activity');
     if (setting === "1") {
       frm.set_df_property('custom_project_estimation', 'reqd', 1);
     }
   }
 });