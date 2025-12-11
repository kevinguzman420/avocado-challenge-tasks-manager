"""
Pydantic schemas for Comment model.
"""
from datetime import datetime
from pydantic import BaseModel, Field


class CommentBase(BaseModel):
    """Base comment schema."""
    content: str = Field(..., min_length=1, description="Comment content")


class CommentCreate(CommentBase):
    """Schema for creating a new comment."""
    pass


class CommentUpdate(BaseModel):
    """Schema for updating a comment."""
    content: str = Field(..., min_length=1, description="Updated comment content")


class UserInComment(BaseModel):
    """Schema for user information in comments."""
    id: int
    email: str
    full_name: str
    
    class Config:
        from_attributes = True


class CommentOut(CommentBase):
    """Schema for comment response."""
    id: int
    task_id: int
    user_id: int
    created_at: datetime
    user: UserInComment
    
    class Config:
        from_attributes = True


class CommentWithUser(CommentOut):
    """Schema for comment with user details."""
    user_email: str
