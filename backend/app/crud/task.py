"""
CRUD operations for Task model.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, and_

from app.models.task import Task, TaskPriority
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskFilter


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """
    Get task by ID with relationships loaded.
    
    Args:
        db: Database session
        task_id: Task ID
        
    Returns:
        Task object or None if not found
    """
    return db.query(Task).options(
        joinedload(Task.creator),
        joinedload(Task.assignee)
    ).filter(Task.id == task_id).first()


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    filters: Optional[TaskFilter] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc"
) -> List[Task]:
    """
    Get list of tasks with filtering, sorting, and pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        filters: Task filter schema
        sort_by: Field to sort by
        sort_order: Sort order (asc/desc)
        
    Returns:
        List of Task objects
    """
    query = db.query(Task).options(
        joinedload(Task.creator),
        joinedload(Task.assignee)
    )
    
    # Apply filters
    if filters:
        if filters.completed is not None:
            query = query.filter(Task.completed == filters.completed)
        if filters.priority:
            query = query.filter(Task.priority == filters.priority)
        if filters.created_by:
            query = query.filter(Task.created_by == filters.created_by)
        if filters.assigned_to:
            query = query.filter(Task.assigned_to == filters.assigned_to)
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term)
                )
            )
    
    # Apply sorting
    sort_column = getattr(Task, sort_by, Task.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
    
    return query.offset(skip).limit(limit).all()


def get_tasks_count(db: Session, filters: Optional[TaskFilter] = None) -> int:
    """
    Get total count of tasks matching filters.
    
    Args:
        db: Database session
        filters: Task filter schema
        
    Returns:
        Count of tasks
    """
    query = db.query(func.count(Task.id))
    
    if filters:
        if filters.completed is not None:
            query = query.filter(Task.completed == filters.completed)
        if filters.priority:
            query = query.filter(Task.priority == filters.priority)
        if filters.created_by:
            query = query.filter(Task.created_by == filters.created_by)
        if filters.assigned_to:
            query = query.filter(Task.assigned_to == filters.assigned_to)
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term)
                )
            )
    
    return query.scalar()


def create_task(db: Session, task: TaskCreate, creator_id: int) -> Task:
    """
    Create a new task.
    
    Args:
        db: Database session
        task: Task creation schema
        creator_id: ID of the user creating the task
        
    Returns:
        Created Task object
    """
    db_task = Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        assigned_to=task.assigned_to,
        created_by=creator_id,
        completed=False
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(
    db: Session,
    task_id: int,
    task_update: TaskUpdate
) -> Optional[Task]:
    """
    Update task information.
    
    Args:
        db: Database session
        task_id: Task ID
        task_update: Task update schema
        
    Returns:
        Updated Task object or None if not found
    """
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    # Update timestamp
    db_task.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """
    Delete a task.
    
    Args:
        db: Database session
        task_id: Task ID
        
    Returns:
        True if deleted, False if not found
    """
    db_task = get_task(db, task_id)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True


def get_task_statistics(db: Session, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Get task statistics.
    
    Args:
        db: Database session
        user_id: Optional user ID to filter statistics
        
    Returns:
        Dictionary with statistics
    """
    query = db.query(Task)
    
    # Filter by user if provided
    if user_id:
        query = query.filter(
            or_(Task.created_by == user_id, Task.assigned_to == user_id)
        )
    
    total_tasks = query.count()
    completed_tasks = query.filter(Task.completed == True).count()
    pending_tasks = query.filter(Task.completed == False).count()
    
    # Priority statistics
    high_priority = query.filter(Task.priority == TaskPriority.HIGH).count()
    medium_priority = query.filter(Task.priority == TaskPriority.MEDIUM).count()
    low_priority = query.filter(Task.priority == TaskPriority.LOW).count()
    
    # Overdue tasks (pending and past due date)
    now = datetime.now(timezone.utc)
    overdue_tasks = query.filter(
        and_(
            Task.completed == False,
            Task.due_date < now
        )
    ).count()
    
    # Calculate completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "high_priority": high_priority,
        "medium_priority": medium_priority,
        "low_priority": low_priority,
        "completion_rate": round(completion_rate, 2),
        "overdue_tasks": overdue_tasks
    }
