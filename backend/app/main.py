"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis
import os

from app.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.project_name,
    version="0.1.0",
    description="Task management API with authentication",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
if settings.backend_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.backend_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.on_event("startup")
async def startup():
    REDIS_HOST = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT = os.getenv("REDIS_PORT", "6379")
    redis_instance = redis.from_url(f"redis://{REDIS_HOST}:{REDIS_PORT}", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_instance)

@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "project": settings.project_name,
        "version": "0.1.0"
    }


# Include API v1 router
app.include_router(api_router, prefix=settings.api_v1_prefix)
