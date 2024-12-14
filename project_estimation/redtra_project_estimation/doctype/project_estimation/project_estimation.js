// Copyright (c) 2024, samarth.upare@redtra.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('Project Estimation', {
    validate: function(frm) {
        if (!frm.doc.items || frm.doc.items.length === 0) {
            frappe.msgprint(__('Please add at least one item in the "Items" table.'));
            frappe.validated = false;
        }
        if (frm.doc.project_start_date && frappe.datetime.get_diff(frm.doc.project_start_date, frappe.datetime.nowdate()) < 0) {
            frappe.msgprint(__('Project Start Date cannot be in the past.'));
            frappe.validated = false;
        }
        if (frm.doc.project_start_date && frm.doc.project_end_date) {
            if (frappe.datetime.get_diff(frm.doc.project_end_date, frm.doc.project_start_date) < 0) {
                frappe.msgprint(__('Project End Date must be after Project Start Date.'));
                frappe.validated = false;
            }
        }
    },
    project: function(frm) {
        if (frm.doc.project) {
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'Project Estimation',
                    filters: {
                        project: frm.doc.project,
                        name: ['!=', frm.doc.name] // Exclude current document
                    },
                    fields: ['name']
                },
                callback: function(response) {
                    if (response.message.length > 0) {
                        frappe.msgprint(__('The selected Project is already linked to another Project Estimation.'));
                        frm.set_value('project', null); // Clear the field
                    }
                }
            });
        }
    },
    refresh: function(frm) {   
        let total_hours = 0;
        let total_material_cost = 0;
        frm.doc.items.forEach(item => {
            total_hours += item.total_man_power_hours;
            total_material_cost += item.amount;
        })
        frm.set_value('total_hours', total_hours);
        frm.set_value('total_material_cost', total_material_cost);

        let total_amount = 0;
        if(frm.doc.hourly_rate>0){
            total_amount = frm.doc.total_hours  * frm.doc.hourly_rate;
            frm.set_value('total_amount', total_amount);
        }
        if(frm.doc.overhead > 0){
           // overhead is a percentage of total amount
            overhead_value = total_amount * (frm.doc.overhead/100);
            frm.set_value('ovehead_value', overhead_value);
            total_estimated_value = total_amount + overhead_value;
            frm.set_value('total_estimated_value', total_estimated_value);
        }
        frm.doc.items.forEach(item => {
            frappe.model.set_value(item.doctype, item.name, 'total_hourly_rate', frm.doc.hourly_rate); // Share in percentage
            frappe.model.set_value(item.doctype, item.name, 'total_amount', frm.doc.hourly_rate * item.total_man_power_hours);
            if (frm.doc.project_start_date && frm.doc.project_end_date) {
                const total_days = frappe.datetime.get_day_diff(frm.doc.project_end_date, frm.doc.project_start_date) + 1;
                if (total_days > 0) {
                    const per_day_est_hours = (item.total_man_power_hours || 0) / total_days;
                    frappe.model.set_value(item.doctype, item.name, 'per_day_est_hours', per_day_est_hours);
                } else {
                    frappe.msgprint(__('Project Start Date and End Date must define a valid range.'));
                }
            }
        });

    },
    total_amount: function(frm) {
        
        frm.set_value('total_labour_cost', frm.doc.total_amount);
    },
    hourly_rate: function(frm) {
        let total_amount = 0
        if(frm.doc.hourly_rate>0){
            total_amount = frm.doc.total_hours * frm.doc.hourly_rate;
            frm.set_value('total_amount', total_amount);
        }
        if(frm.doc.overhead>0){
           // overhead is a percentage of total amount
            overhead_value = total_amount * (frm.doc.overhead/100);
            frm.set_value('ovehead_value', overhead_value);
            total_estimated_value = total_amount + overhead_value;
            frm.set_value('total_estimated_value', total_estimated_value);
        }
    },
    overhead: function(frm) {
        let total_amount = 0
        if(frm.doc.hourly_rate>0){
            total_amount = frm.doc.total_hours * frm.doc.hourly_rate;
            frm.set_value('total_amount', total_amount);
        }
        if(frm.doc.overhead>0){
           // overhead is a percentage of total amount
            overhead_value = total_amount * (frm.doc.overhead/100);
            frm.set_value('ovehead_value', overhead_value);
            total_estimated_value = total_amount + overhead_value;
            frm.set_value('total_estimated_value', total_estimated_value);
        }
    }

});

frappe.ui.form.on('Project Estimation Items', {
    item: function(frm, cdt, cdn) {
        // Trigger on Item selection
        const row = locals[cdt][cdn];
        if (row.item) {
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'Item Price',
                    filters: {
                        item_code: row.item,
                        price_list: frm.doc.price_list || 'Standard Selling'
                    },
                    fieldname: 'price_list_rate'
                },
                callback: function(response) {
                    const rate = response.message?.price_list_rate || 0;
                    frappe.model.set_value(cdt, cdn, 'rate', rate);
                    calculate_item_amount(frm, row);
                }
            });
        }
    },
    quantity: function(frm, cdt, cdn) {
        // Trigger on Quantity change
        const row = locals[cdt][cdn];
        calculate_item_amount(frm, row);
    },
    rate: function(frm, cdt, cdn) {
        // Trigger on Rate change
        const row = locals[cdt][cdn];
        calculate_item_amount(frm, row);
    }
});

// Helper function to calculate item-wise amount
function calculate_item_amount(frm, row) {
    const amount = (row.rate || 0) * (row.quantity || 0);
    frappe.model.set_value(row.doctype, row.name, 'amount', amount);
}
