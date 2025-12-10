"""
API v1 router aggregation.
"""
from fastapi import APIRouter

from app.api.v1 import auth, tasks, comments

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(comments.router, tags=["Comments"])
