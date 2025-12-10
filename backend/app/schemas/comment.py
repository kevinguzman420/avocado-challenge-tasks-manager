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


class CommentOut(CommentBase):
    """Schema for comment response."""
    id: int
    task_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class CommentWithUser(CommentOut):
    """Schema for comment with user details."""
    user_email: str
