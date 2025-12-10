"""
User model for authentication and authorization.
"""
from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    REGULAR = "regular"


class User(Base):
    """User model for authentication and task management."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(
        SQLEnum(UserRole),
        default=UserRole.REGULAR,
        nullable=False
    )
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    created_tasks = relationship(
        "Task",
        back_populates="creator",
        foreign_keys="Task.created_by"
    )
    assigned_tasks = relationship(
        "Task",
        back_populates="assignee",
        foreign_keys="Task.assigned_to"
    )
    comments = relationship(
        "Comment",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
