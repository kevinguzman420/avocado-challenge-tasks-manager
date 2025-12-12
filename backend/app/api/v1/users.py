"""
User management endpoints.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.schemas.common import MessageResponse
from app.core.exceptions import NotFoundException
from app.crud.user import get_user, update_user, delete_user

router = APIRouter()


@router.get("/", response_model=list[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of all users.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of all users
    """
    users = db.query(User).all()
    return users


@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific user by ID.
    
    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        User information
        
    Raises:
        NotFoundException: If user not found
    """
    user = get_user(db, user_id)
    if not user:
        raise NotFoundException(resource="User")
    
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user_info(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user information.
    
    Args:
        user_id: User ID
        user_update: User update data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Updated user information
        
    Raises:
        NotFoundException: If user not found
    """
    user = get_user(db, user_id)
    if not user:
        raise NotFoundException(resource="User")
    
    updated_user = update_user(db, user_id, user_update)
    return updated_user


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a user.
    
    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        NotFoundException: If user not found
    """
    user = get_user(db, user_id)
    if not user:
        raise NotFoundException(resource="User")
    
    delete_user(db, user_id)
    return MessageResponse(message="User deleted successfully")
