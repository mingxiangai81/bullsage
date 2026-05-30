from fastapi import APIRouter, HTTPException, Header
from app.models.database import supabase

router = APIRouter(prefix="/api/reports", tags=["reports"])


def get_user_id(authorization: str) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = supabase.auth.get_user(token)
    return str(user.user.id)


@router.get("")
async def list_reports(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("reports").select(
        "id, ticker, language, created_at"
    ).eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
    return result.data


@router.get("/{report_id}")
async def get_report(report_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("reports").select("*").eq("id", report_id).eq("user_id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return result.data
