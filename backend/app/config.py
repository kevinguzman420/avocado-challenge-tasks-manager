"""
Application configuration using Pydantic Settings.
"""
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


# Determine the root directory (where .env should be)
ROOT_DIR = Path(__file__).resolve().parents[2]  # backend/app/config.py -> proyecto-avocado/
ENV_FILE = ROOT_DIR / ".env"


class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    database_url: str
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Avocado Task Manager"
    debug: bool = False
    
    # CORS
    backend_cors_origins: List[str] = []
    
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        case_sensitive=False
    )


settings = Settings()
