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
from app.schemas.comment import CommentCreate, CommentOut
from app.schemas.common import MessageResponse
from app.core.exceptions import NotFoundException

router = APIRouter()


@router.post("/tasks/{task_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    task_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a comment to a task.
    
    Args:
        task_id: Task ID
        comment: Comment creation data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Created comment information
        
    Raises:
        NotFoundException: If task not found
    """
    # Check if task exists
    task = crud_task.get_task(db, task_id)
    if not task:
        raise NotFoundException(resource="Task")
    
    # Create comment
    new_comment = crud_comment.create_comment(
        db,
        comment,
        task_id=task_id,
        user_id=current_user.id
    )
    return new_comment


@router.get("/tasks/{task_id}/comments", response_model=list[CommentOut])
def get_task_comments(
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all comments for a specific task.
    
    Args:
        task_id: Task ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of comments
        
    Raises:
        NotFoundException: If task not found
    """
    # Check if task exists
    task = crud_task.get_task(db, task_id)
    if not task:
        raise NotFoundException(resource="Task")
    
    # Get comments
    comments = crud_comment.get_task_comments(db, task_id, skip=skip, limit=limit)
    return comments


@router.delete("/comments/{comment_id}", response_model=MessageResponse)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a comment.
    
    Args:
        comment_id: Comment ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        NotFoundException: If comment not found
    """
    # Get comment
    comment = crud_comment.get_comment(db, comment_id)
    if not comment:
        raise NotFoundException(resource="Comment")
    
    # Check permissions (only comment author can delete)
    if comment.user_id != current_user.id:
        from app.crud.user import is_admin
        if not is_admin(current_user):
            from app.core.exceptions import ForbiddenException
            raise ForbiddenException(detail="You don't have permission to delete this comment")
    
    # Delete comment
    crud_comment.delete_comment(db, comment_id)
    return MessageResponse(message="Comment deleted successfully")
