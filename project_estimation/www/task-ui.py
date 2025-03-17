import json
import re

import frappe
import frappe.sessions
from frappe import _
from frappe.utils.telemetry import capture

no_cache = 1

SCRIPT_TAG_PATTERN = re.compile(r"\<script[^<]*\</script\>")
CLOSING_SCRIPT_TAG_PATTERN = re.compile(r"</script\>")


	
def get_context(context):
	csrf_token = frappe.sessions.get_csrf_token()
	frappe.logger().info(f"CSRF Token: {csrf_token}")  # L
	frappe.db.commit()  # nosempgrep
	context = frappe._dict()
	context.csrf_token = csrf_token
	context.boot = get_boot()
	return context



@frappe.whitelist(allow_guest=True)
def get_csrf_token():
    return frappe.sessions.get_csrf_token()


@frappe.whitelist(methods=["POST"], allow_guest=True)
def get_context_for_dev():
	if not frappe.conf.developer_mode:
		frappe.throw(_("This method is only meant for developer mode"))
	return json.loads(get_boot())


def get_boot():
	return frappe._dict(
		{
			"site_name": frappe.local.site,
			"push_relay_server_url": frappe.conf.get("push_relay_server_url") or "",
			"default_route": '/task-ui',
		}
	)
