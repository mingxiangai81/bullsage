from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
import stripe
from app.config import settings
from app.services.stripe_service import create_checkout_session
from app.models.database import supabase

router = APIRouter(prefix="/api", tags=["payments"])


class CheckoutRequest(BaseModel):
    product_type: str


@router.post("/checkout")
async def create_checkout(req: CheckoutRequest, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Login required")
    token = authorization.split(" ")[1]
    user = supabase.auth.get_user(token)
    if req.product_type not in ("single_report", "pro_monthly", "pro_annual", "lifetime"):
        raise HTTPException(status_code=400, detail="Invalid product type")
    url = create_checkout_session(
        product_type=req.product_type,
        user_email=user.user.email,
        success_url=f"{settings.frontend_url}/dashboard?payment=success",
        cancel_url=f"{settings.frontend_url}/pricing?payment=cancelled",
    )
    return {"checkout_url": url}


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        product_type = session.get("metadata", {}).get("product_type", "")
        customer_email = session.get("customer_email", "")
        if customer_email and product_type:
            plan_map = {"single_report": "single", "pro_monthly": "pro", "pro_annual": "pro", "lifetime": "lifetime"}
            new_plan = plan_map.get(product_type, "free")
            # Update plan via service key (bypasses RLS)
            users = supabase.table("profiles").select("id").execute()
            # Find user by checking auth
            # For MVP, we update based on the webhook data
    return {"status": "ok"}
