"""
Comment endpoints for tasks.
"""
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.crud import comment as crud_comment
from app.crud import task as crud_task
from app.crud.user import is_admin
from app.schemas.comment import CommentCreate, CommentUpdate, CommentOut
from app.schemas.common import MessageResponse, PaginatedResponse
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()


@router.post("/tasks/{task_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    task_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a comment to a task (only if task is assigned to current user).
    
    Args:
        task_id: Task ID
        comment: Comment creation data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Created comment information
        
    Raises:
        NotFoundException: If task not found or not assigned to user
    """
    # Check if task exists and is assigned to current user
    task = crud_task.get_task(db, task_id)
    if not task:
        raise NotFoundException(resource="Task")
    
    if task.assigned_to != current_user.id:
        raise NotFoundException(resource="Task")
    
    # Create comment
    new_comment = crud_comment.create_comment(
        db,
        comment,
        task_id=task_id,
        user_id=current_user.id
    )
    return new_comment


@router.get("/tasks/{task_id}/comments", response_model=PaginatedResponse[CommentOut])
def get_task_comments(
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all comments for a specific task (only if task is assigned to current user).
    
    Args:
        task_id: Task ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Paginated list of comments
        
    Raises:
        NotFoundException: If task not found or not assigned to user
    """
    # Check if task exists and is assigned to current user
    task = crud_task.get_task(db, task_id)
    if not task:
        raise NotFoundException(resource="Task")
    
    if task.assigned_to != current_user.id:
        raise NotFoundException(resource="Task")
    
    # Get comments
    comments, total = crud_comment.get_task_comments(db, task_id, skip=skip, limit=limit)
    
    return PaginatedResponse.create(
        items=comments,
        total=total,
        skip=skip,
        limit=limit
    )


@router.put("/tasks/{task_id}/comments/{comment_id}", response_model=CommentOut)
def update_comment(
    task_id: int,
    comment_id: int,
    comment_update: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a comment (only if task is assigned to current user and user is comment author).
    
    Args:
        task_id: Task ID
        comment_id: Comment ID
        comment_update: Comment update data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Updated comment
        
    Raises:
        NotFoundException: If comment not found or task not assigned to user
        ForbiddenException: If user doesn't have permission
    """
    # Get comment
    comment = crud_comment.get_comment(db, comment_id)
    if not comment:
        raise NotFoundException(resource="Comment")
    
    # Verify comment belongs to this task
    if comment.task_id != task_id:
        raise NotFoundException(resource="Comment")
    
    # Check if task is assigned to current user
    task = crud_task.get_task(db, task_id)
    if not task or task.assigned_to != current_user.id:
        raise NotFoundException(resource="Task")
    
    # Check permissions (only comment author can update)
    if comment.user_id != current_user.id:
        raise ForbiddenException(detail="You don't have permission to update this comment")
    
    # Update comment
    updated_comment = crud_comment.update_comment(db, comment_id, comment_update)
    return updated_comment


@router.delete("/tasks/{task_id}/comments/{comment_id}", response_model=MessageResponse)
def delete_comment(
    task_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a comment (only if task is assigned to current user and user is comment author).
    
    Args:
        task_id: Task ID
        comment_id: Comment ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        NotFoundException: If comment not found or task not assigned to user
        ForbiddenException: If user doesn't have permission
    """
    # Get comment
    comment = crud_comment.get_comment(db, comment_id)
    if not comment:
        raise NotFoundException(resource="Comment")
    
    # Verify comment belongs to this task
    if comment.task_id != task_id:
        raise NotFoundException(resource="Comment")
    
    # Check if task is assigned to current user
    task = crud_task.get_task(db, task_id)
    if not task or task.assigned_to != current_user.id:
        raise NotFoundException(resource="Task")
    
    # Check permissions (only comment author can delete)
    if comment.user_id != current_user.id:
        raise ForbiddenException(detail="You don't have permission to delete this comment")
    
    # Delete comment
    crud_comment.delete_comment(db, comment_id)
    return MessageResponse(message="Comment deleted successfully")
