import frappe  
from frappe import _
from erpnext.stock.doctype.material_request.material_request import MaterialRequest
from frappe.query_builder.functions import Sum
from frappe.query_builder import DocType

class CustomMaterialRequest(MaterialRequest):
    def before_submit(self):
        material_check = frappe.get_doc('Project Estimation Setting').get('material_check')
        if material_check and self.material_request_type == 'Purchase':
            for item in self.items:
                if not item.get('project'):
                    frappe.throw(_("Project is mandatory Please select Project at row {0}".format(item.idx)))
                else:
                    total_quantity = get_boq_and_allowed_quantity_to_purchase(item, item.project)
                    print(total_quantity, 'total_quantity')
                    if item.qty > total_quantity:
                        frappe.throw(_("Purchase quantity is greater than BOQ quantity at row {0} Allowed quantity to purchase {1} for item {2}".format(item.idx, total_quantity, item.item_code)))       
        super().before_submit()                
                        


def get_boq_and_allowed_quantity_to_purchase(item, project):
    if frappe.db.exists('Bill of Quantity', {'project': project}):
        boq = frappe.get_doc('Bill of Quantity', {'project': project})
        print(boq,'boq')
        for boq_item in boq.items:
            if boq_item.item == item.item_code:   
                purchase_qty = get_purchase_quantity_for_item(item,project)
                print('purchase_qty',purchase_qty)
                total_quantity = boq_item.quantity - purchase_qty
                return total_quantity
    return 0


def get_purchase_quantity_for_item(item, project):
    purchase_invoice_item = DocType('Purchase Invoice Item')
    
    query = (
        frappe.qb.from_(purchase_invoice_item)
        .select(Sum(purchase_invoice_item.qty))
        .where(
            (purchase_invoice_item.item_code == item.item_code) &
            (purchase_invoice_item.project == project) & (purchase_invoice_item.docstatus == 1)
        )
    )
    
    result = query.run(as_dict=False)
    
    return result[0][0] if result and result[0][0] is not None else 0 
    
                