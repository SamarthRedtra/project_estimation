# Copyright (c) 2025, samarth.upare@redtra.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt



class BillofQuantity(Document):
	def before_save(self):
		total_material_cost = 0
		total_labour_cost = 0
		total_material_cost_cost = 0
		total_labour_cost_cost = 0
		for item in self.items:
			total_material_cost += item.amount
			total_labour_cost += item.total_labour_cost_billing 
			total_material_cost_cost += item.cost_amount
			total_labour_cost_cost += item.total_labour_cost_cost

		if self.total_material_cost != total_material_cost:
			self.total_material_cost = total_material_cost
		if self.total_labour_cost != total_labour_cost:
			self.total_labour_cost = total_labour_cost
		if self.total_material_cost_cost != total_material_cost_cost:
			self.total_material_cost_cost = total_material_cost_cost
		if self.total_labour_cost_cost != total_labour_cost_cost:
			self.total_labour_cost_cost = total_labour_cost_cost
		
		vl = self.total_amount + (self.ovehead_value if self.ovehead_value else 0)  + (self.total_amount * (self.grand_markup / 100) if self.grand_markup > 0  else 0 )
		vl2 = self.total_amount_cost + (self.ovehead_value if self.ovehead_value else 0) + (self.total_amount_cost * (self.grand_markup / 100) if self.grand_markup > 0  else 0 )
		
		if vl != self.total_estimated_value:
			self.total_estimated_value = vl
		if vl2 != self.total_estimated_amount_cost:
			self.total_estimated_amount_cost = vl2
	
		if len(self.items)>0:
			for item in self.items:
				print(item.costing_rate, item.billing_rate, item.activity_type)
				if item.costing_rate and item.billing_rate and item.activity_type:
					print('sn',frappe.db.exists('Activity Type', {'name': item.activity_type, 'costing_rate': item.costing_rate, 'billing_rate': item.billing_rate}))
					if not frappe.db.exists('Activity Type', {'name': item.activity_type, 'costing_rate': item.costing_rate, 'billing_rate': item.billing_rate}):
						print('hs',item.activity_type)
						frappe.db.set_value('Activity Type', item.activity_type, 'costing_rate', item.costing_rate)
						frappe.db.set_value('Activity Type', item.activity_type, 'billing_rate', item.billing_rate)
      
				if not frappe.db.exists('Item Price', {'item_code': item.item, 'uom': item.uom, 'selling': 1}):
					frappe.get_doc({
						'doctype': 'Item Price',
						'item_code': item.item,
						'price_list': 'Standard Selling',
						'price_list_rate': item.rate,
						'uom': item.uom,
						'selling': 1
					}).insert(ignore_permissions=True)
				else:
					frappe.db.set_value('Item Price', {'item_code': item.item, 'uom': item.uom, 'selling': 1}, 'price_list_rate', item.rate)
					
	@frappe.whitelist()
	def update_activity_type(self,activity_type,costing_rate,billing_rate):
		if not frappe.db.exists('Activity Type', {'name': activity_type, 'costing_rate': costing_rate, 'billing_rate': billing_rate}):
			print('hs',activity_type)
			frappe.db.set_value('Activity Type', activity_type, 'costing_rate', costing_rate)
			frappe.db.set_value('Activity Type', activity_type, 'billing_rate', billing_rate)



    
@frappe.whitelist()
def make_budget(source_name, target_doc=None):
	def post_process(source_doc, target_doc):
		target_doc.budget_against = "Project"
		target_doc.applicable_on_material_request = 1
		target_doc.applicable_on_booking_actual_expenses = 1
		target_doc.applicable_on_purchase_order = 1
		project_settings = frappe.get_doc('Project Estimation Setting')
		if project_settings.default_payable_account:  # Example account type
			target_doc.append("accounts", {
				"account": project_settings.default_payable_account,
				"budget_amount": 0,  # Set your desired amount or logic
				# Add other necessary fields
			})


			

	doc = get_mapped_doc(
		"Bill of Quantity",
		source_name,
		{
			"Bill of Quantity": {
				"doctype": "Budget",
			},
			"Project Account": {
				"doctype": "Budget Account",
				"field_map": {
					"account": "account",
					"amount": "budget_amount"
				},
			
			},
		},
		target_doc,
		postprocess=post_process
	)

	return doc   


		
    	


@frappe.whitelist()
def make_sales_invoice(source_name, target_doc=None, args=None):
	doc = frappe.get_doc("Bill of Quantity", source_name)
	doc = get_mapped_doc(
		"Bill of Quantity",
		source_name,
		{
			"Bill of Quantity": {
				"doctype": "Sales Invoice",
				"field_map": {"is_return": "is_return"},
				"validation": {"docstatus": ["=", 1]},
			},
			"Project Estimation Items": {
				"doctype": "Sales Invoice Item",
				"field_map": {
					"item": "item_code",
					"quantity": "qty",
					"rate": "rate",
					"amount": "amount",
				},
			},
		},
		target_doc,
	)
	return doc

