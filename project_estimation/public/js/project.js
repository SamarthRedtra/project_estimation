frappe.ui.form.on('Project', {
    refresh: async function(frm) {
      var setting = await frappe.db.get_single_value('Project Estimation Setting', 'enable_task_level_activity');
      if (setting == "1") {
        frm.set_df_property('custom_project_estimation', 'reqd', 1);
      }
    }
  });