import frappe
from frappe import _

def execute(filters=None):
    """Main function to execute the report."""
    columns = get_columns()
    data, category_totals = get_data(filters)
    chart = get_chart(category_totals)
    return columns, data, None, chart

def get_columns():
    """Define the columns for the report table."""
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
    """Fetch and organize data for the report."""
    project = filters.get("project")
    estimates = get_estimates(project) or {"material": {}, "labour": {}, "overheads": 0}
    actuals = get_actuals(project) or {"material": {}, "labour": {}, "overheads": 0}
    data = []
    
    # Define categories and their fields
    categories = [
        {"name": "material", "qty_field": "quantity", "rate_field": "rate", "amount_field": "amount", "is_overheads": False},
        {"name": "labour", "qty_field": "hours", "rate_field": "rate", "amount_field": "total", "is_overheads": False},
        {"name": "overheads", "is_overheads": True}
    ]
    
    category_totals = {}
    for category in categories:
        if category["is_overheads"]:
            # Handle Overheads (no quantities, only amounts)
            totals = {
                "estimated_amount": estimates.get("overheads", 0),
                "actual_amount": actuals.get("overheads", 0),
                "amount_variance": estimates.get("overheads", 0) - actuals.get("overheads", 0)
            }
            data.append({
                "category": "Overheads",
                "estimated_amount": totals["estimated_amount"],
                "actual_amount": totals["actual_amount"],
                "amount_variance": totals["amount_variance"],
                "variance_percent": calculate_percent(totals["amount_variance"], totals["estimated_amount"]),
                "remarks": "Administrative and other costs",
                "indent": 1,
                "parent": "<b>Total Project Cost</b>",
                "is_group": 0,
                "estimated_qty": 0,
                "actual_qty": 0,
                "qty_variance": 0
            })
            category_totals["overheads"] = totals
        else:
            # Handle Material and Labour with sub-items
            child_rows, totals = add_items(
                estimates.get(category["name"], {}),
                actuals.get(category["name"], {}),
                category["qty_field"],
                category["rate_field"],
                category["amount_field"]
            )
            category_totals[category["name"]] = totals
            data.append({
                "category": f"<b>{category['name'].capitalize()} Costs</b>",
                "estimated_qty": totals["estimated_qty"],
                "actual_qty": totals["actual_qty"],
                "qty_variance": totals["estimated_qty"] - totals["actual_qty"],
                "estimated_amount": totals["estimated_amount"],
                "actual_amount": totals["actual_amount"],
                "amount_variance": totals["amount_variance"],
                "variance_percent": calculate_percent(totals["amount_variance"], totals["estimated_amount"]),
                "indent": 1,
                "parent": "<b>Total Project Cost</b>",
                "is_group": 1
            })
            for row in child_rows:
                row["indent"] = 2
                row["parent"] = f"<b>{category['name'].capitalize()} Costs</b>"
                data.append(row)
    
    # Calculate and add Total Project Cost
    total_project_cost = {
        "estimated_amount": sum(t["estimated_amount"] for t in category_totals.values()),
        "actual_amount": sum(t["actual_amount"] for t in category_totals.values()),
        "amount_variance": sum(t["amount_variance"] for t in category_totals.values())
    }
    data.insert(0, {
        "category": "<b>Total Project Cost</b>",
        "estimated_amount": total_project_cost["estimated_amount"],
        "actual_amount": total_project_cost["actual_amount"],
        "amount_variance": total_project_cost["amount_variance"],
        "variance_percent": calculate_percent(total_project_cost["amount_variance"], total_project_cost["estimated_amount"]),
        "indent": 0,
        "is_group": 1,
        "estimated_qty": 0,
        "actual_qty": 0,
        "qty_variance": 0
    })
    
    return data, category_totals

def get_chart(category_totals):
    """Generate a stacked bar chart for estimated vs actual costs."""
    chart = {
        "title": "Estimated vs Actual Costs",
        "data": {
            "labels": ["Material Costs", "Labour Costs", "Overheads"],
            "datasets": [
                {
                    "name": "Estimated",
                    "values": [
                        category_totals["material"]["estimated_amount"],
                        category_totals["labour"]["estimated_amount"],
                        category_totals["overheads"]["estimated_amount"]
                    ]
                },
                {
                    "name": "Actual",
                    "values": [
                        category_totals["material"]["actual_amount"],
                        category_totals["labour"]["actual_amount"],
                        category_totals["overheads"]["actual_amount"]
                    ]
                }
            ]
        },
        "type": "bar",
        "height": 300,
        "barOptions": {"stacked": True},
        "colors": ["#7cd6fd", "#5e64ff"]
    }
    return chart

def add_items(estimates, actuals, qty_field, rate_field, amount_field):
    """Add sub-items for Material or Labour categories and calculate totals."""
    child_rows = []
    total = {"estimated_qty": 0, "actual_qty": 0, "estimated_amount": 0, "actual_amount": 0, "amount_variance": 0}
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
        
        child_rows.append({
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
        })
        
        total["estimated_qty"] += est_qty
        total["actual_qty"] += act_qty
        total["estimated_amount"] += est_amount
        total["actual_amount"] += act_amount
        total["amount_variance"] += amount_variance
    
    return child_rows, total

def calculate_percent(variance, base):
    """Calculate percentage variance safely."""
    return (variance / base * 100) if base != 0 else 0

def get_estimates(project):
    """Fetch estimated costs from Project Estimation document."""
    estimation_code = frappe.db.get_value('Project', project, 'custom_project_estimation') or \
                      frappe.db.get_value('Bill of Quantity', {'project': project}, 'project_estimation')
    if not estimation_code:
        return None
    estimation = frappe.get_doc("Project Estimation", estimation_code)
    return {
        "material": {item.item: {"quantity": item.quantity, "rate": item.rate, "amount": item.amount}
                     for item in estimation.items if item.item},
        "labour": {item.activity_type: {"hours": item.total_man_power_hours, "rate": item.billing_rate,
                                        "total": item.total_labour_cost_billing}
                   for item in estimation.items if item.activity_type},
        "overheads": estimation.ovehead_value
    }

def get_actuals(project):
    """Fetch actual costs from various transactions."""
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

    total_overheads = sum(row[0] for row in overheads)
    return {
        "material": {item.item_code: item for item in material_items},
        "labour": {item.activity_type: item for item in labour_items},
        "overheads": total_overheads
    }