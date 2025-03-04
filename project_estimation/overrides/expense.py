
import frappe
from erpnext.accounts.doctype.journal_entry.journal_entry import JournalEntry
from frappe.query_builder import DocType
from frappe.query_builder.functions import Sum, Min, Max
from frappe.utils import flt

class CustomJournalEntry(JournalEntry): 
    def on_submit(self):
        super().on_submit()
        self.update_expense_claim()
        
    def on_cancel(self):
        super().on_cancel()
        self.update_expense_claim()
    
    def update_expense_claim(self):
        JournalEntryAccount = DocType("Journal Entry Account")

        query = (
            frappe.qb.from_(JournalEntryAccount)
            .select(JournalEntryAccount.project, Sum(JournalEntryAccount.debit).as_("debit_in_account_currency"))
            .where(
                (JournalEntryAccount.project != "")  # Project should not be empty
                & (JournalEntryAccount.debit_in_account_currency > 0)  # Debit should be greater than 0
                & (JournalEntryAccount.docstatus == 1)  # Only submitted records
            )
            .groupby(JournalEntryAccount.project)
        )
        
        result = query.run(as_dict=True)
        if not result and not self.docstatus == 2:
            row_project = [ r.get('project') for r in self.accounts if r.get('project') and r.get('debit_in_account_currency') > 0 ]
            unique_project = list(set(row_project))
            for project in unique_project:
                frappe.get_doc("Project", project).update_project()
            
        for r in result:
            project = frappe.get_doc("Project", r.get('project')).update_project()
            
        frappe.db.commit()    
            

def get_expense(project):
    ExpenseClaim = frappe.qb.DocType("Expense Claim")
    return (
            frappe.qb.from_(ExpenseClaim)
            .select(Sum(ExpenseClaim.total_sanctioned_amount))
            .where((ExpenseClaim.docstatus == 1) & (ExpenseClaim.project == project))
        ).run()[0][0]   
    


from hrms.overrides.employee_project import EmployeeProject
from erpnext.projects.doctype.project.project import Project



def custom_update_costing(self):
    ExpenseClaim = frappe.qb.DocType("Expense Claim")
    self.total_expense_claim = (
        frappe.qb.from_(ExpenseClaim)
        .select(Sum(ExpenseClaim.total_sanctioned_amount))
        .where((ExpenseClaim.docstatus == 1) & (ExpenseClaim.project == self.name))
    ).run()[0][0]
    JournalEntryAccount = DocType("Journal Entry Account")
    
    jvexpense = (
        frappe.qb.from_(JournalEntryAccount)
        .select(Sum(JournalEntryAccount.debit_in_account_currency))
        .where((JournalEntryAccount.docstatus == 1) & (JournalEntryAccount.project == self.name))
    ).run()[0][0]
    
    if jvexpense :
        self.total_expense_claim = flt(self.total_expense_claim) + flt(jvexpense)
    

    TimesheetDetail = frappe.qb.DocType("Timesheet Detail")
    from_time_sheet = (
        frappe.qb.from_(TimesheetDetail)
        .select(
            Sum(TimesheetDetail.costing_amount).as_("costing_amount"),
            Sum(TimesheetDetail.billing_amount).as_("billing_amount"),
            Min(TimesheetDetail.from_time).as_("start_date"),
            Max(TimesheetDetail.to_time).as_("end_date"),
            Sum(TimesheetDetail.hours).as_("time"),
        )
        .where((TimesheetDetail.project == self.name) & (TimesheetDetail.docstatus == 1))
    ).run(as_dict=True)[0]

    self.actual_start_date = from_time_sheet.start_date
    self.actual_end_date = from_time_sheet.end_date

    self.total_costing_amount = from_time_sheet.costing_amount
    self.total_billable_amount = from_time_sheet.billing_amount
    self.actual_time = from_time_sheet.time

    self.update_purchase_costing()
    self.update_sales_amount()
    self.update_billed_amount()
    self.calculate_gross_margin()

EmployeeProject.update_costing = custom_update_costing    

                    