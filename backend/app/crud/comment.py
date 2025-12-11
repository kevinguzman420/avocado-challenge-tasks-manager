"""
CRUD operations for Comment model.
"""
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload

from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate


def get_comment(db: Session, comment_id: int) -> Optional[Comment]:
    """
    Get comment by ID with relationships loaded.
    
    Args:
        db: Database session
        comment_id: Comment ID
        
    Returns:
        Comment object or None if not found
    """
    return db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(Comment.id == comment_id).first()


def get_task_comments(
    db: Session,
    task_id: int,
    skip: int = 0,
    limit: int = 100
) -> tuple[List[Comment], int]:
    """
    Get all comments for a specific task with total count.
    
    Args:
        db: Database session
        task_id: Task ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        Tuple of (List of Comment objects, total count)
    """
    query = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(Comment.task_id == task_id)
    
    total = query.count()
    
    comments = query.order_by(
        Comment.created_at.asc()
    ).offset(skip).limit(limit).all()
    
    return comments, total


def create_comment(
    db: Session,
    comment: CommentCreate,
    task_id: int,
    user_id: int
) -> Comment:
    """
    Create a new comment on a task.
    
    Args:
        db: Database session
        comment: Comment creation schema
        task_id: Task ID
        user_id: ID of the user creating the comment
        
    Returns:
        Created Comment object
    """
    db_comment = Comment(
        content=comment.content,
        task_id=task_id,
        user_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def update_comment(
    db: Session,
    comment_id: int,
    comment_update: CommentUpdate
) -> Optional[Comment]:
    """
    Update a comment.
    
    Args:
        db: Database session
        comment_id: Comment ID
        comment_update: Comment update schema
        
    Returns:
        Updated Comment object or None if not found
    """
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return None
    
    # Update only provided fields
    update_data = comment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_comment, field, value)
    
    db.commit()
    db.refresh(db_comment)
    return db_comment


def delete_comment(db: Session, comment_id: int) -> bool:
    """
    Delete a comment.
    
    Args:
        db: Database session
        comment_id: Comment ID
        
    Returns:
        True if deleted, False if not found
    """
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return False
    
    db.delete(db_comment)
    db.commit()
    return True
