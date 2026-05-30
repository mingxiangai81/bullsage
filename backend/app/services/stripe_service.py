import stripe
from app.config import settings

stripe.api_key = settings.stripe_secret_key

PRODUCTS = {
    "single_report": {"name": "MasterLens Single Report", "amount": 900, "mode": "payment"},
    "pro_monthly": {"name": "MasterLens Pro Monthly", "amount": 1900, "mode": "subscription"},
    "pro_annual": {"name": "MasterLens Pro Annual", "amount": 17900, "mode": "subscription"},
    "lifetime": {"name": "MasterLens Founding Member", "amount": 29900, "mode": "payment"},
}


def create_checkout_session(product_type: str, user_email: str, success_url: str, cancel_url: str) -> str:
    product = PRODUCTS[product_type]
    params = {
        "customer_email": user_email,
        "success_url": success_url,
        "cancel_url": cancel_url,
        "metadata": {"product_type": product_type},
    }
    if product["mode"] == "subscription":
        params["mode"] = "subscription"
        params["line_items"] = [{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": product["name"]},
                "unit_amount": product["amount"],
                "recurring": {"interval": "month" if "monthly" in product_type else "year"},
            },
            "quantity": 1,
        }]
    else:
        params["mode"] = "payment"
        params["line_items"] = [{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": product["name"]},
                "unit_amount": product["amount"],
            },
            "quantity": 1,
        }]
    session = stripe.checkout.Session.create(**params)
    return session.url
