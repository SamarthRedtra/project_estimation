import frappe
from frappe import _

from erpnext.buying.doctype.purchase_order.purchase_order import PurchaseOrder



class CustomPurchaseOrder(PurchaseOrder):
    def on_submit(self):
        frappe.throw("hello")    
    def validate(self):
        super().validate()
        is_project_mand = frappe.get_doc('Project Estimation Setting').get('allow_multiple_purchase_price')
        if is_project_mand:
            for i in self.items:
                if not i.get('project'):
                    frappe.throw(_("Project is mandatory Please select Project at row {0}".format(i.idx)))
        
            for item in self.items:
                create_price_list(item, self.supplier, item.project,self.buying_price_list)  
                
            frappe.db.commit()           
           
    


def create_price_list(item,supplier,project,price_list):
    item_prices = frappe.db.exists('Item Price',{'item_code':item.item_code,'supplier':supplier,'custom_project':project,'buying':1}) 
    if not item_prices:
        frappe.get_doc({
            'doctype':'Item Price',
            'item_code':item.item_code,
            'supplier':supplier,
            'custom_project':project,
            'price_list':price_list or 'Standard Buying',
            'buying':1,
            'price_list_rate':item.rate
        }).insert(ignore_permissions=True) 
    else:
        frappe.db.set_value('Item Price',item_prices,'price_list_rate',item.rate)  
       