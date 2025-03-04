import frappe
from frappe import _

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    chart = get_chart(filters)
    return columns, data, None, chart

def get_columns():
    return [
        {"fieldname": "category", "label": _("Item"), "fieldtype": "Data", "width": 300},
        {"fieldname": "estimated_qty", "label": _("Est. Qty/Hrs"), "fieldtype": "Float", "width": 120},
        {"fieldname": "actual_qty", "label": _("Actual Qty/Hrs"), "fieldtype": "Float", "width": 120},
        {"fieldname": "qty_variance", "label": _("Qty Variance"), "fieldtype": "Float", "width": 120},
        {"fieldname": "estimated_rate", "label": _("Rate"), "fieldtype": "Currency", "width": 100},
        {"fieldname": "estimated_amount", "label": _("Est. Amount"), "fieldtype": "Currency", "width": 120},
        {"fieldname": "actual_amount", "label": _("Actual Amount"), "fieldtype": "Currency", "width": 120},
        {"fieldname": "amount_variance", "label": _("Amount Var"), "fieldtype": "Currency", "width": 120},
        {"fieldname": "variance_percent", "label": _("Var %"), "fieldtype": "Percent", "width": 80},
        {"fieldname": "remarks", "label": _("Remarks"), "fieldtype": "Small Text", "width": 500}
    ]


def get_data(filters):
    project = filters.get("project")
    data = []
    
    # Fetch estimates and actuals
    estimates = get_estimates(project) or {"material": {}, "labour": {}, "overheads": 0}
    actuals = get_actuals(project) or {"material": {}, "labour": {}, "overheads": 0}

    # Material Costs
    material_child_rows, material_total = add_items(
        estimates.get("material", {}),
        actuals.get("material", {}),
        "quantity",
        "rate",
        "amount"
    )

    # Labour Costs
    labour_child_rows, labour_total = add_items(
        estimates.get("labour", {}),
        actuals.get("labour", {}),
        "hours",
        "rate",
        "total"
    )

    # Overheads
    overheads = {
        "estimated_amount": estimates.get("overheads", 0),
        "actual_amount": actuals.get("overheads", 0),
        "amount_variance": estimates.get("overheads", 0) - actuals.get("overheads", 0)
    }

    # Total Project Cost
    total_project_cost = {
        "estimated_amount": material_total["estimated_amount"] + labour_total["estimated_amount"] + overheads["estimated_amount"],
        "actual_amount": material_total["actual_amount"] + labour_total["actual_amount"] + overheads["actual_amount"],
        "amount_variance": material_total["amount_variance"] + labour_total["amount_variance"] + overheads["amount_variance"]
    }

    # Append Total Project Cost (Root)
    data.append({
        "category": "<b>Total Project Cost</b>",
        "estimated_amount": total_project_cost["estimated_amount"],
        "actual_amount": total_project_cost["actual_amount"],
        "amount_variance": total_project_cost["amount_variance"],
        "variance_percent": calculate_percent(total_project_cost["amount_variance"], total_project_cost["estimated_amount"]),
        "indent": 0,
        "is_group": 1,
        "estimated_qty": 0,  # Quantities not summed due to different units
        "actual_qty": 0,
        "qty_variance": 0
    })

    # Append Material Costs (Parent)
    data.append({
        "category": "<b>Material Costs</b>",
        "estimated_qty": material_total["estimated_qty"],
        "actual_qty": material_total["actual_qty"],
        "qty_variance": material_total["estimated_qty"] - material_total["actual_qty"],
        "estimated_amount": material_total["estimated_amount"],
        "actual_amount": material_total["actual_amount"],
        "amount_variance": material_total["amount_variance"],
        "variance_percent": calculate_percent(material_total["amount_variance"], material_total["estimated_amount"]),
        "indent": 1,
        "parent": "<b>Total Project Cost</b>",
        "is_group": 1
    })

    # Append Material Child Rows
    for row in material_child_rows:
        row["indent"] = 2
        row["parent"] = "<b>Material Costs</b>"
        data.append(row)

    # Append Labour Costs (Parent)
    data.append({
        "category": "<b>Labour Costs</b>",
        "estimated_qty": labour_total["estimated_qty"],
        "actual_qty": labour_total["actual_qty"],
        "qty_variance": labour_total["estimated_qty"] - labour_total["actual_qty"],
        "estimated_amount": labour_total["estimated_amount"],
        "actual_amount": labour_total["actual_amount"],
        "amount_variance": labour_total["amount_variance"],
        "variance_percent": calculate_percent(labour_total["amount_variance"], labour_total["estimated_amount"]),
        "indent": 1,
        "parent": "<b>Total Project Cost</b>",
        "is_group": 1
    })

    # Append Labour Child Rows
    for row in labour_child_rows:
        row["indent"] = 2
        row["parent"] = "<b>Labour Costs</b>"
        data.append(row)

    # Append Overheads
    data.append({
        "category": "Overheads",
        "estimated_amount": overheads["estimated_amount"],
        "actual_amount": overheads["actual_amount"],
        "amount_variance": overheads["amount_variance"],
        "variance_percent": calculate_percent(overheads["amount_variance"], overheads["estimated_amount"]),
        "remarks": "Administrative and other costs",
        "indent": 1,
        "parent": "<b>Total Project Cost</b>",
        "is_group": 0,
        "estimated_qty": 0,
        "actual_qty": 0,
        "qty_variance": 0
    })

    return data


def get_chart(filters):
    # Extract project from filters
    project = filters.get("project")
    
    # Fetch estimates and actuals (assuming these functions exist in your script)
    estimates = get_estimates(project) or {"material": {}, "labour": {}, "overheads": 0}
    actuals = get_actuals(project) or {"material": {}, "labour": {}, "overheads": 0}
    
    # Calculate totals for each category
    material_estimated = sum(item.get("amount", 0) for item in estimates.get("material", {}).values())
    material_actual = sum(item.get("amount", 0) for item in actuals.get("material", {}).values())
    
    labour_estimated = sum(item.get("total", 0) for item in estimates.get("labour", {}).values())
    labour_actual = sum(item.get("total", 0) for item in actuals.get("labour", {}).values())
    
    overheads_estimated = estimates.get("overheads", 0)
    overheads_actual = actuals.get("overheads", 0)
    
    # Define the chart configuration
    chart = {
        "title": "Estimated vs Actual Costs",
        "data": {
            "labels": ["Material Costs", "Labour Costs", "Overheads"],
            "datasets": [
                {
                    "name": "Estimated",
                    "values": [material_estimated, labour_estimated, overheads_estimated]
                },
                {
                    "name": "Actual",
                    "values": [material_actual, labour_actual, overheads_actual]
                }
            ]
        },
        "type": "bar",
        "height": 300,
        "barOptions": {
            "stacked": True  # Enables stacking
        },
        "colors": ["#7cd6fd", "#5e64ff"]  # Colors for Estimated and Actual
    }
    return chart

def add_items(estimates, actuals, qty_field, rate_field, amount_field):
    child_rows = []
    total = {
        "estimated_qty": 0,
        "actual_qty": 0,
        "estimated_amount": 0,
        "actual_amount": 0,
        "amount_variance": 0
    }
    for key in set(estimates.keys()).union(actuals.keys()):
        est = estimates.get(key, {})
        act = actuals.get(key, {})
        est_qty = est.get(qty_field, 0)
        act_qty = act.get(qty_field, 0)
        est_rate = est.get(rate_field, 0)
        act_rate = act.get(rate_field, 0)
        est_amount = est.get(amount_field, est_qty * est_rate)
        act_amount = act.get(amount_field, act_qty * act_rate)
        amount_variance = est_amount - act_amount
        
        child_row = {
            "category": key,
            "estimated_qty": est_qty,
            "actual_qty": act_qty,
            "qty_variance": est_qty - act_qty,
            "estimated_rate": est_rate,
            "estimated_amount": est_amount,
            "actual_amount": act_amount,
            "amount_variance": amount_variance,
            "variance_percent": calculate_percent(amount_variance, est_amount),
            "remarks": f"Est: {est_qty} {qty_field} @ {est_rate} | Actual: {act_qty} @ {act_rate}"
        }
        child_rows.append(child_row)
        
        total["estimated_qty"] += est_qty
        total["actual_qty"] += act_qty
        total["estimated_amount"] += est_amount
        total["actual_amount"] += act_amount
        total["amount_variance"] += amount_variance
    
    return child_rows, total
def format_total_row(title, totals, indent_level):
    return {
        "category": f"<b>{title}</b>",
        **totals,
        "variance_percent": calculate_percent(totals["amount_variance"], totals["estimated_amount"]),
        "indent": indent_level
    }

def calculate_percent(variance, base):
    return (variance / base * 100) if base != 0 else 0

def get_estimates(project):
    estimation_code = frappe.db.get_value('Project', project, 'custom_project_estimation') or \
                      frappe.db.get_value('Bill of Quantity', {'project': project}, 'project_estimation')

    if not estimation_code:
        return None

    estimation = frappe.get_doc("Project Estimation", estimation_code)

    return {
        "material": {item.item: {
            "quantity": item.quantity,
            "rate": item.rate,
            "amount": item.amount
        } for item in estimation.items if item.item},
        "labour": {item.activity_type: {
            "hours": item.total_man_power_hours,
            "rate": item.billing_rate,
            "total": item.total_labour_cost_billing
        } for item in estimation.items if item.activity_type},
        "overheads": estimation.ovehead_value,
        "total": estimation.total_estimated_value
    }

def get_actuals(project):
    material_items = frappe.db.sql("""
        SELECT item_code, SUM(qty) as qty, AVG(rate) as rate, SUM(amount) as total
        FROM `tabPurchase Invoice Item`
        WHERE project = %s AND docstatus = 1
        GROUP BY item_code
    """, project, as_dict=True)

    labour_items = frappe.db.sql("""
        SELECT activity_type, SUM(hours) as hours, AVG(billing_rate) as rate, SUM(billing_amount) as total
        FROM `tabTimesheet Detail`
        WHERE project = %s AND docstatus = 1
        GROUP BY activity_type
    """, project, as_dict=True)

    overheads = frappe.db.sql("""
        SELECT COALESCE(SUM(debit), 0) as total FROM `tabJournal Entry Account`
        WHERE project = %s AND docstatus = 1
        UNION ALL
        SELECT COALESCE(SUM(total_sanctioned_amount), 0) FROM `tabExpense Claim`
        WHERE project = %s AND docstatus = 1
    """, (project, project), as_list=True)

    total_overheads = sum([row[0] for row in overheads])

    return {
        "material": {item.item_code: item for item in material_items},
        "labour": {item.activity_type: item for item in labour_items},
        "overheads": total_overheads,
        "total": sum(item.total for item in material_items) + sum(item.total for item in labour_items)
    }