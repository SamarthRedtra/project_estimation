// Copyright (c) 2025, samarth.upare@redtra.com and contributors
// For license information, please see license.txt

frappe.ui.form.on("Bill of Quantity", {
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
                    doctype: 'Bill of Quantity',
                    filters: {
                        project: frm.doc.project,
                        name: ['!=', frm.doc.name] // Exclude current document
                    },
                    fields: ['name']
                },
                callback: function(response) {
                    if (response.message.length > 0) {
                        frappe.msgprint(__('The selected Project is already linked to another BOQ.'));
                        frm.set_value('project', null); // Clear the field
                    }
                }
            });
        }
    },
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

            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'Item Price',
                    filters: {
                        item_code: row.item,
                        price_list:'Standard Buying'
                    },
                    fieldname: 'price_list_rate'
                },
                callback: function(response) {
                    const rate = response.message?.price_list_rate || 0;
                    frappe.model.set_value(cdt, cdn, 'cost_rate', rate);
                    calculate_item_amount_for_costing(frm, row);
                }
            });
        }
        
    
    },
    quantity: function(frm, cdt, cdn) {
        // Trigger on Quantity change
        const row = locals[cdt][cdn];
        calculate_item_amount(frm, row);
        calculate_item_amount_for_costing(frm, row);
    },
    rate: function(frm, cdt, cdn) {
        // Trigger on Rate change
        const row = locals[cdt][cdn];
        calculate_item_amount(frm, row);
    },
    cost_rate: function(frm, cdt, cdn) {
        // Trigger on Cost Rate change
        const row = locals[cdt][cdn];
        calculate_item_amount_for_costing(frm, row);
    },
    amount: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        setcalculations(frm,row);
        
    },
    cost_amount: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        setcalculations(frm,row);
    },
    total_man_power_hours: function(frm, cdt, cdn) {
        // Trigger on Total Man Power Hours change
        const row = locals[cdt][cdn];
        console.log("inside man power hours")
        setcalculations(frm,row);
        if( parseInt(frm.estimated_duration)>0){
            row.per_day_est_hours = parseFloat(row.total_man_power_hours) / parseInt(frm.estimated_duration);   
        }
       
    },
    cost_rate: function(frm, cdt, cdn) {
        // Trigger on Cost Rate change
        const row = locals[cdt][cdn];
        setcalculations(frm, row);
    },
    billing_rate: function(frm, cdt, cdn) {
        // Trigger on Billing Rate change
        const row = locals[cdt][cdn];
        setcalculations(frm, row);
    }
});

// Helper function to calculate item-wise amount
function calculate_item_amount(frm, row) {
    const amount = (row.rate || 0) * (row.quantity || 0);
    frappe.model.set_value(row.doctype, row.name, 'amount', amount);
}

function calculate_item_amount_for_costing(frm, row) {
    const amount = (row.cost_rate || 0) * (row.quantity || 0);
    frappe.model.set_value(row.doctype, row.name, 'cost_amount', amount);
}

function setcalculations(frm,row){
    if( row.cost_amount > 0 && row.cost_amount != row.total_material_cost_cost ){
        row.total_material_cost_cost = row.cost_amount;
        frappe.model.set_value(row.doctype, row.name, 'total_material_cost_cost', row.cost_amount);
    }
    if( row.amount > 0 && row.amount != row.total_material_cost_billing){

        row.total_material_cost_billing = row.amount;
        frappe.model.set_value(row.doctype, row.name, 'total_material_cost_billing', row.amount);
    }
    if( row.total_man_power_hours > 0 && row.costing_rate > 0){
        row.total_labour_cost_cost = parseFloat(row.total_man_power_hours) * parseFloat(row.costing_rate);
        frappe.model.set_value(row.doctype, row.name, 'total_labour_cost_cost', parseFloat(row.total_man_power_hours) * parseFloat(row.costing_rate));
        console.log("inside manpower")
    }
    if( row.total_man_power_hours > 0 && row.billing_rate > 0){
        row.total_labour_cost_billing = parseFloat(row.total_man_power_hours) * parseFloat(row.billing_rate);
        frappe.model.set_value(row.doctype, row.name, 'total_labour_cost_billing',parseFloat(row.total_man_power_hours) * parseFloat(row.billing_rate));
    }
    if( row.total_material_cost_cost > 0 && row.total_material_cost_billing > 0){
        row.total_amount = row.total_material_cost_billing + row.total_labour_cost_billing ;
        frappe.model.set_value(row.doctype, row.name, 'total_amount', row.total_amount);
        row.total_amount_cost = row.total_material_cost_cost + row.total_labour_cost_cost;
        frappe.model.set_value(row.doctype, row.name, 'total_amount_cost', row.total_amount_cost);
    }
    frm.refresh_field("items")
}