"""
Pydantic schemas for Task model.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.task import TaskPriority


# Base schema with common attributes
class TaskBase(BaseModel):
    """Base task schema."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    assigned_to: Optional[int] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[int] = None


class TaskOut(TaskBase):
    """Schema for task response."""
    id: int
    completed: bool
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskWithDetails(TaskOut):
    """Schema for task with creator/assignee details."""
    creator_email: Optional[str] = None
    assignee_email: Optional[str] = None


# Filter and pagination schemas
class TaskFilter(BaseModel):
    """Schema for filtering tasks."""
    completed: Optional[bool] = None
    priority: Optional[TaskPriority] = None
    created_by: Optional[int] = None
    assigned_to: Optional[int] = None
    search: Optional[str] = Field(None, description="Search in title and description")
    

class TaskSort(BaseModel):
    """Schema for sorting tasks."""
    field: str = Field("created_at", description="Field to sort by")
    order: str = Field("desc", description="Sort order: asc or desc")


# Statistics schema
class TaskStatistics(BaseModel):
    """Schema for task statistics."""
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    high_priority: int
    medium_priority: int
    low_priority: int
    completion_rate: float
    overdue_tasks: int
