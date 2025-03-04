frappe.query_reports["Project Estimation Variance Report"] = {
    "filters": [
        {
            "fieldname": "project",
            "label": __("Project"),
            "fieldtype": "Link",
            "options": "Project",
            "reqd": 1
        },
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.add_months(frappe.datetime.get_today(), -1)
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today()
        }
    ],
    "formatter": function(value, row, column, data, default_formatter) {
        value = default_formatter(value, row, column, data);
        
        // Style headers
        if (data.indent === 0) {
            value = $(value).css("font-weight", "bold").wrap("<div></div>").parent().html();
        }
        
        // Highlight negative variances
        if (column.id === "variance_cost" && data.variance_cost < 0) {
            value = $(value).css("color", "red").wrap("<div></div>").parent().html();
        }
        
        return value;
    }
};