# Copyright (c) 2024, samarth.upare@redtra.com and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class ProjectEstimation(Document):
	def before_save(self):
		total_material_cost = 0
		total_labour_cost = 0
		for item in self.items:
			total_material_cost += item.amount
			total_labour_cost += item.total_man_power_hours
		self.total_material_cost = total_material_cost
		self.total_labour_cost = total_labour_cost

		
