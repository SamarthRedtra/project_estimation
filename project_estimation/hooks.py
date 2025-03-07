app_name = "project_estimation"
app_title = "Redtra Project Estimation"
app_publisher = "samarth.upare@redtra.com"
app_description = "Its a Project Estimation Tool"
app_email = "samarth.upare@redtra.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "project_estimation",
# 		"logo": "/assets/project_estimation/logo.png",
# 		"title": "Redtra Project Estimation",
# 		"route": "/project_estimation",
# 		"has_permission": "project_estimation.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/project_estimation/css/project_estimation.css"
# app_include_js = "/assets/project_estimation/js/project_estimation.js"

# include js, css files in header of web template
# web_include_css = "/assets/project_estimation/css/project_estimation.css"
# web_include_js = "/assets/project_estimation/js/project_estimation.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "project_estimation/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "project_estimation/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "project_estimation.utils.jinja_methods",
# 	"filters": "project_estimation.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "project_estimation.install.before_install"
# after_install = "project_estimation.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "project_estimation.uninstall.before_uninstall"
# after_uninstall = "project_estimation.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "project_estimation.utils.before_app_install"
# after_app_install = "project_estimation.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "project_estimation.utils.before_app_uninstall"
# after_app_uninstall = "project_estimation.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "project_estimation.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
	"Purchase Order": "project_estimation.overrides.purchase_order.CustomPurchaseOrder",
    "Purchase Invoice": "project_estimation.overrides.purchase_invoice.CustomPurchaseInvoice",
    "Journal Entry": "project_estimation.overrides.expense.CustomJournalEntry",
    "Item Price":"project_estimation.overrides.item_price.CustomItemPrice",
    "Material Request": "project_estimation.overrides.material_request.CustomMaterialRequest",
}

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"project_estimation.tasks.all"
# 	],
# 	"daily": [
# 		"project_estimation.tasks.daily"
# 	],
# 	"hourly": [
# 		"project_estimation.tasks.hourly"
# 	],
# 	"weekly": [
# 		"project_estimation.tasks.weekly"
# 	],
# 	"monthly": [
# 		"project_estimation.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "project_estimation.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "project_estimation.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "project_estimation.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["project_estimation.utils.before_request"]
# after_request = ["project_estimation.utils.after_request"]

# Job Events
# ----------
# before_job = ["project_estimation.utils.before_job"]
# after_job = ["project_estimation.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"project_estimation.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

import project_estimation.overrides.expense

fixtures = [ {
    "doctype": "Workspace",
    "filters": [
        [
            "name",
            "=",
            "Projects"
        ]
    ]
}  ]


website_route_rules = [{'from_route': '/task-ui/<path:app_path>', 'to_route': 'task-ui'},]