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
    refresh: function(frm) { 

        var me = this;  
        let total_overheads = 0;

        if(frm.doc.overheads.length>0){
            frm.doc.overheads.forEach(overhead => {
                total_overheads += overhead.amount;
            })
            frm.set_value('ovehead_value', total_overheads);
        }


        console.log('inside onload')
        if(frm.doc.docstatus == 1){
           
            frm.add_custom_button(__('Project Budget'), function() {
               make_budget(frm)  
            },__('Create')).addClass('btn-primary')

        

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
                total_hours += (item.total_man_power_hours || 0 ) * ( item.quantity || 1);;
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

    
        if (frm.doc.ovehead_value > 0 && frm.doc.docstatus == 0) {
            let overhead_value = frm.doc.ovehead_value
            let total_estimated_value = frm.doc.total_amount + overhead_value + (frm.doc.grand_markup > 0 ? (frm.doc.total_amount * (frm.doc.grand_markup / 100)) : 0);
            if(total_estimated_value !== frm.doc.total_estimated_value){
                console.log(total_estimated_value !== frm.doc.total_estimated_value,total_estimated_value, frm.doc.total_estimated_value)
                frm.set_value('total_estimated_value', total_estimated_value);
                console.log("inside overhea1d",total_estimated_value !== frm.doc.total_estimated_value,total_estimated_value,frm.doc.total_estimated_value)
            }
            let total_estimated_value_cost = frm.doc.total_amount_cost + overhead_value  +  (frm.doc.grand_markup > 0 ? (frm.doc.total_amount_cost * (frm.doc.grand_markup / 100)) : 0);
            if(total_estimated_value_cost !== frm.doc.total_estimated_amount_cost){
                frm.set_value('total_estimated_amount_cost', total_estimated_value_cost);
                console.log("inside overhead cost",total_estimated_value_cost !== frm.doc.total_estimated_amount_cost)
            }
            let overheade_percentage = (overhead_value / frm.doc.total_amount) * 100;
            if(overheade_percentage !== frm.doc.overhead){
                frm.set_value('overhead', overheade_percentage);
                console.log("inside overhead percentage",overheade_percentage !== frm.doc.overhead)
            }
           
            console.log("inside overhead",total_estimated_value !== frm.doc.total_estimated_value,overhead_value,total_amount_cost,total_estimated_value_cost , total_estimated_value)
        }       
    },
    allow_line_wise_markup: function(frm) {
        // Ensure the child table exists
       if (!frm.fields_dict["items"] || !frm.fields_dict["items"].grid) {
           console.error("Child table 'items' not found or not initialized.");
           return;
       }

       let grid = frm.fields_dict["items"].grid;
       grid.update_docfield_property(
           'task',  
           'reqd', 1      
       );
       if (frm.doc.allow_line_wise_markup == 1) {
           grid.update_docfield_property(
               'markup',  
               'hidden', 0      
           );
           frm.set_value('grand_markup', 0);
           
           frm.trigger('grand_markup');

       } else {
           grid.update_docfield_property(
               'markup',  
               'hidden', 1      
           );
           frm.trigger('remove_child_markup');
       }
       console.log(grid.fields_map['task'],grid.fields_map['markup'])
       grid.refresh()
       // Refresh UI
       frm.refresh_field("items");
       
   },
   total_amount: function(frm) {
       if( frm.doc.total_amount !== frm.doc.total_labour_cost){
           frm.set_value('total_labour_cost', frm.doc.total_amount);
       }
   },
    remove_child_markup: function(frm) {
        if(frm.doc.items.length > 0){
                frm.doc.items.forEach(item => {
                    frappe.model.set_value(item.doctype, item.name, 'markup', 0);
                    frappe.model.set_value(item.doctype, item.name, 'total_amount', item.total_amount_billing);
                })
                frm.refresh_field('items');
                frm.trigger('refresh');
        }
        
    },
    grand_markup: function(frm) {
        let total_amount = frm.doc.total_amount + frm.doc.ovehead_value + (frm.doc.grand_markup > 0 ? (frm.doc.total_amount * (frm.doc.grand_markup / 100)) : 0);
        if (total_amount !== frm.doc.total_estimated_value) {
            frm.set_value('total_estimated_value', total_amount);
            console.log("inside markup")
        }
        let total_estimated_value_cost = frm.doc.total_amount_cost + frm.doc.ovehead_value + (frm.doc.grand_markup > 0 ? (frm.doc.total_amount_cost * (frm.doc.grand_markup / 100)) : 0);
        if(total_estimated_value_cost !== frm.doc.total_estimated_amount_cost){
            frm.set_value('total_estimated_amount_cost', total_estimated_value_cost);
            console.log("inside overhead cost",total_estimated_value_cost !== frm.doc.total_estimated_amount_cost)
        }
},
});



frappe.ui.form.on('Project Estimation Items', {


    form_render: function(frm, cdt, cdn) {
        console.log('form_render');
        setTimeout(() => {
            frm.trigger('allow_line_wise_markup')
        },50)
        
        
    },
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
    item_markup: function(frm,cdt, cdn){
        var row = locals[cdt][cdn]
        if (row.item_markup > 0){
            var  new_cost_rate = row.cost_rate + (row.cost_rate * (row.item_markup/100));
            frappe.model.set_value(row.doctype, row.name, 'rate', new_cost_rate);
        }
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
        row.labour_cost_per_unit = row.total_man_power_hours * row.billing_rate;
        frappe.model.set_value(row.doctype, row.name,'labour_cost_per_unit', row.labour_cost_per_unit);
        
        setcalculations(frm,row);
        if( parseInt(frm.estimated_duration)>0){
            row.per_day_est_hours = parseFloat(row.total_man_power_hours) / parseInt(frm.estimated_duration);   
        }

      

        frappe.call({
            method: 'update_activity_type',
            doc: frm.doc,
            args: {  // Proper args structure
                activity_type: row.activity_type,
                costing_rate: row.costing_rate,
                billing_rate: row.billing_rate
            },
            true: true,
            freeze_message: __('Updating rates...'),
            callback: function(response) {
                if (response.exc) {
                    frappe.msgprint(__("Error updating rates: {0}", [response.exc]));
                } else {
                    console.log('Values updated successfully', response.message);
                }
            },
            error: function(err) {
                console.error('API call failed:', err);
            }
        });
       
    },
    cost_rate: function(frm, cdt, cdn) {
        // Trigger on Cost Rate change
        const row = locals[cdt][cdn];
        setcalculations(frm, row);
        calculate_item_amount_for_costing(frm, row);
        if(!row.rate && row.rate <= 0){
            frappe.model.set_value(cdt, cdn, 'rate', row.cost_rate);
        }
        
    },
    billing_rate: function(frm, cdt, cdn) {
        // Trigger on Billing Rate change
        const row = locals[cdt][cdn];
        setcalculations(frm, row);
        frappe.model.set_value(row.doctype, row.name,'labour_cost_per_unit', row.billing_rate * row.total_man_power_hours);
    },
    refresh: function(frm, cdt , cdn){
        const row = locals[cdt][cdn];
        console.log("inside onloadd",row)

    },
    markup: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (row.markup > 0){
            row.total_amount = row.total_amount_billing + (row.total_amount_billing * (row.markup/100));
            frappe.model.set_value(row.doctype, row.name, 'total_amount', row.total_amount);
            frm.trigger('refresh');
        }
    }
});
const  make_budget = (frm) =>{
    frappe.model.open_mapped_doc({
        method: "project_estimation.redtra_project_estimation.doctype.bill_of_quantity.bill_of_quantity.make_budget",
        frm: frm,
        freeze_message: __("Creating BOQ..."),
    });

}

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
        row.total_labour_cost_cost = parseFloat(row.total_man_power_hours) * parseFloat(row.costing_rate) * (row.quantity?row.quantity:1);
        frappe.model.set_value(row.doctype, row.name, 'total_labour_cost_cost',row.total_labour_cost_cost );
        console.log("inside manpower")
    }
    if( row.total_man_power_hours > 0 && row.billing_rate ){
        row.total_labour_cost_billing = parseFloat(row.total_man_power_hours) * parseFloat(row.billing_rate) * (row.quantity?row.quantity:1);
        frappe.model.set_value(row.doctype, row.name, 'total_labour_cost_billing',row.total_labour_cost_billing);
    }
    if( row.total_material_cost_cost > 0 && row.total_material_cost_billing > 0){
        row.total_amount_billing = row.total_material_cost_billing + row.total_labour_cost_billing ;
        frappe.model.set_value(row.doctype, row.name, 'total_amount_billing', row.total_amount_billing);
        row.total_amount_cost = row.total_material_cost_cost + row.total_labour_cost_cost;
        frappe.model.set_value(row.doctype, row.name, 'total_amount_cost', row.total_amount_cost);
    }

    if(row.markup>0){

        row.total_amount = row.total_amount_billing + (row.total_amount_billing * (row.markup/100));
        row.unit_selling =  (row.total_amount / row.quantity)
        row.unit_markup =  (row.total_amount_billing * (row.markup/100)) / (row.quantity || 1)
        frappe.model.set_value(row.doctype, row.name, 'total_amount', row.total_amount);
        frappe.model.set_value(row.doctype, row.name, 'unit_selling', row.unit_selling);
        frappe.model.set_value(row.doctype, row.name, 'unit_markup', row.unit_markup);
    }
    else{
        row.total_amount = row.total_amount_billing;
        frappe.model.set_value(row.doctype, row.name, 'total_amount', row.total_amount);
    }
    frappe.model.set_value(row.doctype, row.name,'total_cost_per_unit',row.labour_cost_per_unit + row.rate )

    frm.refresh_field("items")
}

