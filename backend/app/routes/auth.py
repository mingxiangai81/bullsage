from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from app.models.database import supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user_id: str
    email: str


@router.post("/register", response_model=AuthResponse)
async def register(req: AuthRequest):
    try:
        result = supabase.auth.sign_up({"email": req.email, "password": req.password})
        if result.user is None:
            raise HTTPException(status_code=400, detail="Registration failed")
        return AuthResponse(
            access_token=result.session.access_token,
            user_id=str(result.user.id),
            email=result.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(req: AuthRequest):
    try:
        result = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        if result.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return AuthResponse(
            access_token=result.session.access_token,
            user_id=str(result.user.id),
            email=result.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
async def get_me(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        profile = supabase.table("profiles").select("*").eq("id", str(user.user.id)).single().execute()
        return {
            "id": str(user.user.id),
            "email": user.user.email,
            **profile.data,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
