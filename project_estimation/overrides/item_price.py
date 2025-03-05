from erpnext.stock.doctype.item_price.item_price import ItemPrice, ItemPriceDuplicateItem
import frappe
from frappe import _, bold
from frappe.model.document import Document
from frappe.query_builder import Criterion
from frappe.query_builder.functions import Cast_


class CustomItemPrice(ItemPrice):
    def validate(self):
        self.validate_item()
        self.validate_from_to_dates("valid_from", "valid_upto")
        self.update_price_list_details()
        self.update_item_details()
        self.check_duplicates_custom()
        self.validate_item_template()
    
    def check_duplicates_custom(self):
        item_price = frappe.qb.DocType("Item Price")

        query = (
            frappe.qb.from_(item_price)
            .select(item_price.price_list_rate)
            .where(
                (item_price.item_code == self.item_code)
                & (item_price.price_list == self.price_list)
                & (item_price.name != self.name)
            )
        )
        data_fields = (
            "uom",
            "valid_from",
            "valid_upto",
            "customer",
            "supplier",
            "batch_no",
        )
        is_project_mand = frappe.get_doc('Project Estimation Setting').get('allow_multiple_purchase_price')
        if is_project_mand and self.buying == 1:
            data_fields = (
            "uom",
            "valid_from",
            "valid_upto",
            "customer",
            "supplier",
            "batch_no",
            "custom_project"
        )
        print(data_fields,"--")    
            

        number_fields = ["packing_unit"]

        for field in data_fields:
            if self.get(field):
                query = query.where(item_price[field] == self.get(field))
            else:
                query = query.where(
                    Criterion.any(
                        [
                            item_price[field].isnull(),
                            Cast_(item_price[field], "varchar") == "",
                        ]
                    )
                )

        for field in number_fields:
            if self.get(field):
                query = query.where(item_price[field] == self.get(field))
            else:
                query = query.where(
                    Criterion.any(
                        [
                            item_price[field].isnull(),
                            item_price[field] == 0,
                        ]
                    )
                )

        price_list_rate = query.run(as_dict=True)

        if price_list_rate:
            frappe.throw(
                _(
                    "Item Price appears multiple times based on Price List, Supplier/Customer, Currency, Item, Batch, UOM, Qty, and Dates."
                ),
                ItemPriceDuplicateItem,
            )

    