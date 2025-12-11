"""
Task management endpoints.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.crud import task as crud_task
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskOut, TaskWithDetails,
    TaskFilter, TaskStatistics
)
from app.schemas.common import PaginatedResponse, MessageResponse
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()


@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task assigned to the current user.
    
    Args:
        task: Task creation data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Created task information
    """
    # Override assigned_to to always be the current user
    task_data = task.model_copy(update={"assigned_to": current_user.id})
    new_task = crud_task.create_task(db, task_data, creator_id=current_user.id)
    return new_task


@router.get("/", response_model=PaginatedResponse[TaskOut])
def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of tasks assigned to the current user with filtering, sorting, and pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        completed: Filter by completion status
        priority: Filter by priority
        search: Search term for title and description
        sort_by: Field to sort by
        sort_order: Sort order (asc/desc)
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Paginated list of tasks assigned to the current user
    """
    # Build filters - always filter by current user's assigned tasks
    filters = TaskFilter(
        completed=completed,
        priority=priority,
        created_by=None,
        assigned_to=current_user.id,
        search=search
    )
    
    # Get tasks
    tasks = crud_task.get_tasks(
        db,
        skip=skip,
        limit=limit,
        filters=filters,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    # Get total count
    total = crud_task.get_tasks_count(db, filters=filters)
    
    return PaginatedResponse.create(
        items=tasks,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/statistics", response_model=TaskStatistics)
def get_task_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get task statistics for the current user.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Task statistics for the current user
    """
    stats = crud_task.get_task_statistics(db, user_id=current_user.id)
    return stats


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific task by ID (only if assigned to current user).
    
    Args:
        task_id: Task ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Task information
        
    Raises:
        NotFoundException: If task not found or not assigned to user
    """
    task = crud_task.get_task(db, task_id)
    if not task:
        raise NotFoundException(resource="Task")
    
    # Check if task is assigned to current user
    if task.assigned_to != current_user.id:
        raise NotFoundException(resource="Task")
    
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a task (only if assigned to current user).
    
    Args:
        task_id: Task ID
        task_update: Task update data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Updated task information
        
    Raises:
        NotFoundException: If task not found or not assigned to user
        ForbiddenException: If user doesn't have permission
    """
    # Get existing task
    existing_task = crud_task.get_task(db, task_id)
    if not existing_task:
        raise NotFoundException(resource="Task")
    
    # Check permissions (only assigned user can update)
    if existing_task.assigned_to != current_user.id:
        raise ForbiddenException(detail="You don't have permission to update this task")
    
    # Update task
    updated_task = crud_task.update_task(db, task_id, task_update)
    return updated_task


@router.delete("/{task_id}", response_model=MessageResponse)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a task (only if assigned to current user).
    
    Args:
        task_id: Task ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        NotFoundException: If task not found or not assigned to user
        ForbiddenException: If user doesn't have permission
    """
    # Get existing task
    existing_task = crud_task.get_task(db, task_id)
    if not existing_task:
        raise NotFoundException(resource="Task")
    
    # Check permissions (only assigned user can delete)
    if existing_task.assigned_to != current_user.id:
        raise ForbiddenException(detail="You don't have permission to delete this task")
    
    # Delete task
    crud_task.delete_task(db, task_id)
    return MessageResponse(message="Task deleted successfully")
