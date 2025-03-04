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
   
		vl = self.total_amount + self.ovehead_value
		vl2 = self.total_amount_cost + self.ovehead_value
		if vl != self.total_estimated_value:
			self.total_estimated_value = vl
		if vl2 != self.total_estimated_amount_cost:
			self.total_estimated_amount_cost = vl2
   
   


@frappe.whitelist()
def make_boq(source_name, target_doc=None):
	doc = get_mapped_doc(
		"Project Estimation",
		source_name,
		{
			"Project Estimation": {
				"doctype": "Bill of Quantity",
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
					"rate":"rate",
					"cost_rate":"cost_rate",
					"amount":"amount",
					"cost_amount":"cost_amount",
					"total_man_power_hours":"total_man_power_hours",
					"per_day_est_hours":"per_day_est_hours",
 
				},
			},
		},
		target_doc,
	)

	return doc   
   

		
