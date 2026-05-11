from fastapi import APIRouter

from backend.app.api.routes import auth, participants, public, surveys

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(participants.router, prefix="/participants", tags=["participants"])
api_router.include_router(surveys.router, prefix="/surveys", tags=["surveys"])
api_router.include_router(public.router, prefix="/public", tags=["public"])
