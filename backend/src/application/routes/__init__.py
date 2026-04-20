from fastapi import APIRouter
from .user import router as user_router

root_router = APIRouter()
root_router.include_router(user_router)
