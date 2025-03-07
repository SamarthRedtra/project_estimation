# Copyright (c) 2024, samarth.upare@redtra.com and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import flt
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc



class ProjectEstimation(Document):
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
def make_boq(source_name, target_doc=None):
	doc = get_mapped_doc(
		"Project Estimation",
		source_name,
		{
			"Project Estimation": {
				"doctype": "Bill of Quantity",
				"field_map": {
					"estimated_duration":"estimated_duration",
					"total_material_cost":"total_material_cost",
					"total_labour_cost":"total_labour_cost",
					"total_material_cost_cost":"total_material_cost_cost",
					"total_labour_cost_cost":"total_labour_cost_cost",
					"total_amount":"total_amount",
					"total_amount_cost":"total_amount_cost",
					"total_estimated_value":"total_estimated_value",
					"total_estimated_amount_cost":"total_estimated_amount_cost",
					"grand_markup":"grand_markup",
					"ovehead_value":"ovehead_value",
					"overhead":"overhead",
					"total_hours":"total_hours",
					"allow_line_wise_markup":"allow_line_wise_markup"
				}
			},
			"Project Estimation Items": {
				"doctype": "Project Estimation Items",
				"field_map": {
					"activity_type": "activity_type",
					"name": "name",
					"task": "task",
					"costing_rate": "costing_rate",
					"billing_rate": "billing_rate",
					"item": "item",
					"quantity": "quantity",
					"total_material_cost_cost":"total_material_cost_cost",
					"total_labour_cost_cost":"total_labour_cost_cost",
					"total_amount_cost":"total_amount_cost",
					"total_material_cost_billing":"total_material_cost_billing",
					"total_labour_cost_billing":"total_labour_cost_billing",
					"total_amount":"total_amount",
					"item_markup":"item_markup",
					"uom":"uom",
					"brand":"brand",
					"markup":"markup",
					"total_amount_billing":"total_amount_billing",
					"rate":"rate",
					"cost_rate":"cost_rate",
					"amount":"amount",
					"cost_amount":"cost_amount",
					"total_man_power_hours":"total_man_power_hours",
					"per_day_est_hours":"per_day_est_hours",
 
				},
				"Project Account": {
				"doctype": "Project Account",
				"field_map": {
					"account": "account",
					"amount": "amount"
				}
			}
			},
		},
		target_doc,
	)

	return doc   
   

		
