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
        var me = this;  

        console.log('inside onload')
        if(frm.doc.docstatus == 1){
            console.log('inside onload')
            frm.add_custom_button(__('Project'), function() {
                frappe.set_route('project', 'new',{
                    custom_project_estimation: frm.doc.name
                });   
            },__('Create')).addClass('btn-primary')

            frm.add_custom_button(__('Project Budget'), function() {
                frappe.set_route('budget', 'new',{
                    'budget_against': 'Project'
                });   
            },__('Create')).addClass('btn-primary')

            frm.add_custom_button(
                __("BOQ"),
                () => {
                    make_boq(frm);
                },  
                __("Create")
            );

            frm.page.set_inner_btn_group_as_primary(__("Create"));
        }

        let total_hours = 0;
        let total_material_cost = 0;
        let total_material_cost_cost = 0;
        let total_amount = 0;
        let total_amount_cost = 0;
        let total_labour_cost =0;
        let total_labour_cost_cost =0;

    
        if (frm.doc.items && frm.doc.items.length > 0) {
            frm.doc.items.forEach(item => {
                total_hours += item.total_man_power_hours || 0;
                total_material_cost += item.amount || 0;
                total_material_cost_cost += item.cost_amount || 0;
                total_amount += item.total_amount || 0;
                total_amount_cost += item.total_amount_cost || 0;
                total_labour_cost += item.total_labour_cost_billing || 0;
                total_labour_cost_cost += item.total_labour_cost_cost || 0;
            });
            console.log("inside items", total_hours, total_material_cost, total_material_cost_cost, total_amount, total_amount_cost, total_labour_cost, total_labour_cost_cost)
        }
    
        if(frm.doc.total_hours !== total_hours) {
            frm.set_value('total_hours', total_hours);
            console.log(total_hours,frm.doc.total_hours !== total_hours)
        }
        if(frm.doc.total_material_cost !== total_material_cost) {
            frm.set_value('total_material_cost', total_material_cost);
            console.log((frm.doc.total_material_cost !== total_material_cost),total_material_cost)
        }

        if(frm.doc.total_material_cost_cost !== total_material_cost_cost) {
            frm.set_value('total_material_cost_cost', total_material_cost_cost);
            console.log((frm.doc.total_material_cost_cost !== total_material_cost_cost),total_material_cost_cost)
        }
    
    
       
        if (frm.doc.hourly_rate > 0) {
            total_amount = total_hours * frm.doc.hourly_rate;
            if(total_amount !== frm.doc.total_amount){  
                frm.set_value('total_amount', total_amount);
                console.log("inside hourly",total_amount !== frm.doc.total_amount)
            }
           
        }
        if(total_amount !== frm.doc.total_amount){  
            frm.set_value('total_amount', total_amount);
            console.log("inside hourly",total_amount !== frm.doc.total_amount)
        }
        if(total_amount_cost !== frm.doc.total_amount_cost){  
            frm.set_value('total_amount_cost', total_amount_cost);
            console.log("inside hourly cost",total_amount_cost !== frm.doc.total_amount_cost)
        }
        if(total_labour_cost !== frm.doc.total_labour_cost){  
            frm.set_value('total_labour_cost', total_labour_cost);
            console.log("inside labour",total_labour_cost !== frm.doc.total_labour_cost)
        }
        if(total_labour_cost_cost !== frm.doc.total_labour_cost_cost){  
            frm.set_value('total_labour_cost_cost', total_labour_cost_cost);
            console.log("inside labour cost",total_labour_cost_cost !== frm.doc.total_labour_cost_cost)
        }

    
        if (frm.doc.overhead > 0) {
            let overhead_value = frm.doc.total_amount * (frm.doc.overhead / 100);
            if (frm.doc.ovehead_value !== overhead_value)
            {
                frm.set_value('ovehead_value', overhead_value);
                console.log("inside overhead2",frm.doc.ovehead_value !== overhead_value)
            }

            let total_estimated_value = frm.doc.total_amount + overhead_value 
            if(total_estimated_value !== frm.doc.total_estimated_value){
                console.log(total_estimated_value !== frm.doc.total_estimated_value,total_estimated_value, frm.doc.total_estimated_value)
                frm.set_value('total_estimated_value', total_estimated_value);
                console.log("inside overhea1d",total_estimated_value !== frm.doc.total_estimated_value,total_estimated_value,frm.doc.total_estimated_value)
            }
            let total_estimated_value_cost = frm.doc.total_amount_cost + overhead_value 
            if(total_estimated_value_cost !== frm.doc.total_estimated_amount_cost){
                frm.set_value('total_estimated_amount_cost', total_estimated_value_cost);
                console.log("inside overhead cost",total_estimated_value_cost !== frm.doc.total_estimated_amount_cost)
            }
           
            console.log("inside overhead",total_estimated_value !== frm.doc.total_estimated_value,overhead_value,total_amount_cost,total_estimated_value_cost , total_estimated_value)
        }
    
        // if (frm.doc.items && frm.doc.items.length > 0) {
        //     frm.doc.items.forEach(item => {
        //         if(item.total_hourly_rate !== frm.doc.hourly_rate){
        //             frappe.model.set_value(item.doctype, item.name, 'total_hourly_rate', frm.doc.hourly_rate);
        //         }
        //         if(item.total_amount !== frm.doc.hourly_rate * item.total_man_power_hours){
        //            frappe.model.set_value(item.doctype, item.name, 'total_amount', frm.doc.hourly_rate * item.total_man_power_hours);
        //         }
    
        //         if (frm.doc.project_start_date && frm.doc.project_end_date) {
        //             const total_days = frappe.datetime.get_day_diff(frm.doc.project_end_date, frm.doc.project_start_date) + 1;
        //             if (total_days > 0) {
        //                 const per_day_est_hours = (item.total_man_power_hours || 0) / total_days;
        //                 if(per_day_est_hours !== item.per_day_est_hours){
        //                     frappe.model.set_value(item.doctype, item.name, 'per_day_est_hours', per_day_est_hours);
        //                 }
        //             } else {
        //                 frappe.msgprint(__('Project Start Date and End Date must define a valid range.'));
        //             }
        //         }
        //     });
        //     console.log("inside items2")
            
        // }
       
    },
    total_amount: function(frm) {
        if( frm.doc.total_amount !== frm.doc.total_labour_cost){
            frm.set_value('total_labour_cost', frm.doc.total_amount);
        }
       
    },
    hourly_rate: function(frm) {
        let total_amount = 0
        if(frm.doc.hourly_rate>0){
            total_amount = frm.doc.total_hours * frm.doc.hourly_rate;
            frm.set_value('total_amount', total_amount);
        }
        let total_material_cost = 0;
        frm.doc.items.forEach(item => {
            total_material_cost += item.amount;
        })
        if(frm.doc.overhead>0){
           // overhead is a percentage of total amount
            overhead_value = total_amount * (frm.doc.overhead/100);
            frm.set_value('ovehead_value', overhead_value);
            total_estimated_value = total_amount + overhead_value + total_material_cost;
            frm.set_value('total_estimated_value', total_estimated_value);
        }
    },
    overhead: function(frm) {
        if (frm.doc.overhead > 0) {
            let overhead_value = frm.doc.total_amount * (frm.doc.overhead / 100);
            if (frm.doc.ovehead_value !== overhead_value)
            {
                frm.set_value('ovehead_value', overhead_value);
                console.log("inside overhead2",frm.doc.ovehead_value !== overhead_value)
            }

            let total_estimated_value = frm.doc.total_amount + overhead_value 
            if(total_estimated_value !== frm.doc.total_estimated_value){
                console.log(total_estimated_value !== frm.doc.total_estimated_value,total_estimated_value, frm.doc.total_estimated_value)
                frm.set_value('total_estimated_value', total_estimated_value);
              
            }
            let total_estimated_value_cost = frm.doc.total_amount_cost + overhead_value 
            if(total_estimated_value_cost !== frm.doc.total_estimated_amount_cost){
                frm.set_value('total_estimated_amount_cost', total_estimated_value_cost);
                console.log("inside overhead cost",total_estimated_value_cost !== frm.doc.total_estimated_amount_cost)
            }
           
            console.log("inside overhead")
        }
    },
    make_boq: function(frm) {
        frappe.model.open_mapped_doc({
            method: "project_estimation.redtra_project_estimation.doctype.project_estimation.project_estimation.make_boq",
            frm: this.frm,
            freeze_message: __("Creating BOQ..."),
        });
    }

});
function make_boq(frm) {
    frappe.model.open_mapped_doc({
        method: "project_estimation.redtra_project_estimation.doctype.project_estimation.project_estimation.make_boq",
        frm: frm,
        freeze_message: __("Creating BOQ..."),
    });
}

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


