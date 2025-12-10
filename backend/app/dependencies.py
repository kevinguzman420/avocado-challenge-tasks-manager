"""
Common dependencies for the application.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import decode_access_token
from app.core.exceptions import CredentialsException, ForbiddenException
from app.crud.user import get_user_by_email, is_admin
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user.
    
    Args:
        token: JWT token from request header
        db: Database session
        
    Returns:
        User: Current authenticated user
        
    Raises:
        CredentialsException: If token is invalid or user not found
    """
    payload = decode_access_token(token)
    
    if payload is None:
        raise CredentialsException()
    
    email: Optional[str] = payload.get("sub")
    if email is None:
        raise CredentialsException()
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise CredentialsException()
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure the current user is an admin.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current admin user
        
    Raises:
        ForbiddenException: If user is not an admin
    """
    if not is_admin(current_user):
        raise ForbiddenException(detail="Admin privileges required")
    
    return current_user
