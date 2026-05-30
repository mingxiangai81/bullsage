from fastapi import APIRouter, HTTPException, Header
from app.models.database import supabase

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


def get_user_id(authorization: str) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = supabase.auth.get_user(token)
    return str(user.user.id)


@router.get("")
async def list_watchlist(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("watchlist").select("*").eq("user_id", user_id).order("added_at", desc=True).execute()
    return result.data


@router.post("/{ticker}")
async def add_to_watchlist(ticker: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    existing = supabase.table("watchlist").select("id").eq("user_id", user_id).execute()
    if len(existing.data) >= 10:
        profile = supabase.table("profiles").select("plan").eq("id", user_id).single().execute()
        if profile.data["plan"] == "free":
            raise HTTPException(status_code=403, detail="Free plan limited to 10 watchlist items. Upgrade to Pro.")
    try:
        supabase.table("watchlist").insert({"user_id": user_id, "ticker": ticker.upper()}).execute()
        return {"status": "added", "ticker": ticker.upper()}
    except Exception:
        raise HTTPException(status_code=409, detail="Already in watchlist")


@router.delete("/{ticker}")
async def remove_from_watchlist(ticker: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    supabase.table("watchlist").delete().eq("user_id", user_id).eq("ticker", ticker.upper()).execute()
    return {"status": "removed", "ticker": ticker.upper()}
