// Add this code to Sales Invoice's client-side script (form.js)

frappe.ui.form.on('Sales Invoice', {
    refresh: function(frm) {
        // Add custom button to fetch BOM items
        // frm.add_custom_button(__('Get Items from BOM'), function() {
        //     // Prompt user to select BOM
        //     frappe.prompt({
        //         fieldtype: 'Link',
        //         label: __('Select Bill of Quantity'),
        //         fieldname: 'bom',
        //         options: 'Bill of Quantity',
        //         reqd: 1,
        //         filters: {
        //             'docstatus': 1  // Only show submitted BOMs
        //         }
        //     }, (values) => {
        //         if(values.bom) {
        //             // Call server method to get BOM items
        //             frm.call({
        //                 method: 'get_bom_items',
        //                 doc: frm.doc,
        //                 args: {
        //                     'bom': values.bom
        //                 },
        //                 callback: function(r) {
        //                     if(r.message) {
        //                         // Add items to the items table
        //                         add_bom_items_to_table(frm, r.message);
        //                     }
        //                 }
        //             });
        //         }
        //     }, __('Select BOM'), __('Get Items'));
        // });
        
        frm.add_custom_button(__('Bill of Quantity'), function() {
            erpnext.utils.map_current_doc({
                method: "project_estimation.redtra_project_estimation.doctype.bill_of_quantity.bill_of_quantity.make_sales_invoice",
                source_doctype: "Bill of Quantity",
                target: frm,
                setters: {
                    customer: frm.doc.customer || undefined,
                },
                get_query: function () {
                    var filters = {
                        docstatus: 1,
                        company: frm.doc.company,
                    };
                    if (frm.doc.customer) filters["customer"] = frm.doc.customer;
                    return {
                        filters: filters,
                    };
                },
            });
        }, __('Get Items From'));
    }
});

function add_bom_items_to_table(frm, items) {
    // Clear existing items if needed (uncomment if required)
    // frm.clear_table('items');
    
    // Add new items
    $.each(items, function(i, item) {
        let child = frm.add_child('items');
        frappe.model.set_value(child.doctype, child.name, 'item_code', item.item_code);
        frappe.model.set_value(child.doctype, child.name, 'qty', item.qty);
        frappe.model.set_value(child.doctype, child.name, 'rate', item.rate);
        // Add other fields as needed
    });
    
    frm.refresh_field('items');
}