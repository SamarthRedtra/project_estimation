frappe.form.on('Purchase Order Item', {
    refresh:async function(frm, cdt, cdn) {
       const row = locals[cdt][cdn];
       if(frm.doc.supplier){
         const item_price_doc = await frappe.db.get_doc("Item Price", {
            item_code: row.item,
            price_list: frm.doc.price_list || 'Standard Buying',
            custom_project: frm.doc.project,
            supplier: frm.doc.supplier
         })

         if(item_price_doc && item_price_doc.price_list_rate){
            frappe.model.set_value(cdt, cdn, 'rate', item_price_doc.price_list_rate)
         }
          
       }

    }
})