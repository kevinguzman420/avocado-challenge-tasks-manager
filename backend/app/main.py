"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
