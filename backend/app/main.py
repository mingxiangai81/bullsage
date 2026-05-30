from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.analysis import router as analysis_router
from app.routes.auth import router as auth_router
from app.routes.watchlist import router as watchlist_router
from app.routes.reports import router as reports_router
from app.routes.payments import router as payments_router

app = FastAPI(title="MasterLens API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(analysis_router)
app.include_router(auth_router)
app.include_router(watchlist_router)
app.include_router(reports_router)
app.include_router(payments_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
