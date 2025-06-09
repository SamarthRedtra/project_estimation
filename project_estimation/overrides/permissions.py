import frappe

SUPPLIER_ROLES = {"Supplier User"}

def get_supplier_for_user(user: str) -> str | None:
    """Get the linked Supplier for the given user."""
    if not user:
        user = frappe.session.user
    return frappe.db.get_value("Portal User", {"user": user, "parenttype": "Supplier"}, "parent")

def is_supplier_user(user: str) -> bool:
    """Check if the user has a Supplier-related role."""
    roles = frappe.get_roles(user)
    if "Administrator" in roles:
        return False
    return bool(SUPPLIER_ROLES.intersection(set()))

def rfq_query(user: str) -> str:
    supplier = get_supplier_for_user(user)
    if supplier and is_supplier_user(user):
        return f"""
            EXISTS (
                SELECT 1 FROM `tabRequest for Quotation Supplier` rfq_supp
                WHERE rfq_supp.parent = `tabRequest for Quotation`.name
                AND rfq_supp.supplier = {frappe.db.escape(supplier)}
            )
        """
    return ""

def po_query(user: str) -> str:
    supplier = get_supplier_for_user(user)
    if supplier and is_supplier_user(user):
        return f"`tabPurchase Order`.supplier = {frappe.db.escape(supplier)}"
    return ""

def pi_query(user: str) -> str:
    supplier = get_supplier_for_user(user)
    if supplier and is_supplier_user(user):
        return f"`tabPurchase Invoice`.supplier = {frappe.db.escape(supplier)}"
    return ""

def task_query(user: str) -> str:
    supplier = get_supplier_for_user(user)
    if supplier and is_supplier_user(user):
        return f"`tabTask`.custom_supplier = {frappe.db.escape(supplier)}"
    return ""