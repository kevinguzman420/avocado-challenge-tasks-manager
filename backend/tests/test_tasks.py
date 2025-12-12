"""
Unit tests for task management endpoints.
"""
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority
from app.models.user import User


@pytest.fixture
def sample_task(db: Session, test_user: User) -> Task:
    """Create a sample task for testing."""
    task = Task(
        title="Sample Task",
        description="This is a sample task for testing",
        priority=TaskPriority.MEDIUM,
        completed=False,
        created_by=test_user.id,
        assigned_to=test_user.id,  # Assign to the creator for test purposes
        due_date=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@pytest.fixture
def multiple_tasks(db: Session, test_user: User, test_admin: User):
    """Create multiple tasks with different attributes."""
    tasks = []
    
    # Task 1: High priority, created by and assigned to regular user
    task1 = Task(
        title="High Priority Task",
        description="Urgent task",
        priority=TaskPriority.HIGH,
        completed=False,
        created_by=test_user.id,
        assigned_to=test_user.id,
        due_date=datetime.now(timezone.utc) + timedelta(days=1)
    )
    tasks.append(task1)
    
    # Task 2: Completed, created by and assigned to regular user
    task2 = Task(
        title="Completed Low Priority",
        description="Already done",
        priority=TaskPriority.LOW,
        completed=True,
        created_by=test_user.id,
        assigned_to=test_user.id
    )
    tasks.append(task2)
    
    # Task 3: Created by admin, assigned to regular user
    task3 = Task(
        title="Admin Task for User",
        description="Created by admin, for user",
        priority=TaskPriority.MEDIUM,
        completed=False,
        created_by=test_admin.id,
        assigned_to=test_user.id
    )
    tasks.append(task3)
    
    # Task 4: Created by admin, assigned to admin
    task4 = Task(
        title="Admin-only Task",
        description="Admin's own task",
        priority=TaskPriority.HIGH,
        completed=False,
        created_by=test_admin.id,
        assigned_to=test_admin.id,
        due_date=datetime.now(timezone.utc) - timedelta(days=2)
    )
    tasks.append(task4)
    
    for task in tasks:
        db.add(task)
    
    db.commit()
    for task in tasks:
        db.refresh(task)
    
    return tasks


class TestCreateTask:
    """Tests for creating new tasks."""
    
    def test_create_task_success(self, client: TestClient, auth_headers: dict, test_user: User, db: Session):
        """Test creating a new task and verifying its details."""
        # Prepare task data
        task_data = {
            "title": "New Task",
            "description": "This is a new task",
            "priority": "high",
            "due_date": (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
        }
        
        # Create task
        response = client.post(
            "/api/v1/tasks/",
            json=task_data,
            headers=auth_headers
        )
        
        # Assert response
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == task_data["title"]
        assert data["description"] == task_data["description"]
        assert data["priority"] == task_data["priority"]
        assert data["completed"] is False
        assert data["created_by"] == test_user.id
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
        
        # Verify task was created in database
        task_id = data["id"]
        db_task = db.query(Task).filter(Task.id == task_id).first()
        assert db_task is not None
        assert db_task.title == task_data["title"]
        assert db_task.created_by == test_user.id
    
    def test_create_task_minimal_data(self, client: TestClient, auth_headers: dict):
        """Test creating task with only required fields."""
        task_data = {
            "title": "Minimal Task"
        }
        
        response = client.post(
            "/api/v1/tasks/",
            json=task_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == task_data["title"]
        assert data["priority"] == "medium"  # Default priority
        assert data["completed"] is False
        assert data["description"] is None
    
    def test_create_task_with_assigned_user_is_ignored(self, client: TestClient, auth_headers: dict, test_user: User):
        """Test that 'assigned_to' is ignored and set to current user when creating a task."""
        task_data = {
            "title": "Assigned Task",
            "description": "Task assigned to admin",
            "assigned_to": 999  # Some other user ID
        }
        
        response = client.post(
            "/api/v1/tasks/",
            json=task_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        # The API should override the assigned_to field with the current user's ID
        assert data["assigned_to"] == test_user.id
    
    def test_create_task_without_auth(self, client: TestClient):
        """Test creating task fails without authentication."""
        task_data = {
            "title": "Unauthorized Task"
        }
        
        response = client.post("/api/v1/tasks/", json=task_data)
        
        assert response.status_code == 401
    
    def test_create_task_invalid_priority(self, client: TestClient, auth_headers: dict):
        """Test creating task with invalid priority."""
        task_data = {
            "title": "Task",
            "priority": "urgent"  # Invalid priority
        }
        
        response = client.post(
            "/api/v1/tasks/",
            json=task_data,
            headers=auth_headers
        )
        
        assert response.status_code == 422
    
    def test_create_task_empty_title(self, client: TestClient, auth_headers: dict):
        """Test creating task with empty title fails."""
        task_data = {
            "title": ""
        }
        
        response = client.post(
            "/api/v1/tasks/",
            json=task_data,
            headers=auth_headers
        )
        
        assert response.status_code == 422


class TestRetrieveTasks:
    """Tests for retrieving tasks with filters and pagination."""
    
    def test_get_tasks_default(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test retrieving tasks with default parameters."""
        response = client.get("/api/v1/tasks/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert isinstance(data["items"], list)
        assert len(data["items"]) > 0
    
    def test_get_tasks_with_pagination(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test retrieving tasks with pagination parameters."""
        # Get first page
        response = client.get(
            "/api/v1/tasks/?skip=0&limit=2",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 2
        assert data["skip"] == 0
        assert data["limit"] == 2
        
        # Get second page
        response = client.get(
            "/api/v1/tasks/?skip=2&limit=2",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["skip"] == 2
    
    def test_get_tasks_filter_by_completed(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test filtering tasks by completion status."""
        # Get completed tasks
        response = client.get(
            "/api/v1/tasks/?completed=true",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for task in data["items"]:
            assert task["completed"] is True
        
        # Get pending tasks
        response = client.get(
            "/api/v1/tasks/?completed=false",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for task in data["items"]:
            assert task["completed"] is False
    
    def test_get_tasks_filter_by_priority(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test filtering tasks by priority."""
        response = client.get(
            "/api/v1/tasks/?priority=high",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for task in data["items"]:
            assert task["priority"] == "high"
    
    def test_get_tasks_for_current_user(self, client: TestClient, auth_headers: dict, test_user: User, multiple_tasks):
        """Test that a regular user only sees tasks assigned to them."""
        response = client.get(
            f"/api/v1/tasks/",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        # A regular user should only see tasks assigned to them.
        for task in data["items"]:
            assert task["assigned_to"] == test_user.id
        
        # Check that the total number of tasks assigned to the user is correct
        assert data["total"] == 3 # Based on the updated multiple_tasks fixture
    
    def test_get_tasks_filter_by_assigned_to(self, client: TestClient, auth_headers: dict, test_user: User, multiple_tasks):
        """Test filtering tasks by assignee."""
        response = client.get(
            f"/api/v1/tasks/?assigned_to={test_user.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for task in data["items"]:
            if task["assigned_to"] is not None:
                assert task["assigned_to"] == test_user.id
    
    def test_get_tasks_search(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test searching tasks by title and description."""
        response = client.get(
            "/api/v1/tasks/?search=admin",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) > 0
        # At least one task should match the search term
        found = any("admin" in task["title"].lower() or 
                   (task["description"] and "admin" in task["description"].lower())
                   for task in data["items"])
        assert found
    
    def test_get_tasks_sort_by_created_at_desc(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test sorting tasks by creation date descending."""
        response = client.get(
            "/api/v1/tasks/?sort_by=created_at&sort_order=desc",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        # Verify descending order
        if len(data["items"]) >= 2:
            for i in range(len(data["items"]) - 1):
                assert data["items"][i]["created_at"] >= data["items"][i + 1]["created_at"]
    
    def test_get_tasks_sort_by_priority_asc(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test sorting tasks by priority ascending."""
        response = client.get(
            "/api/v1/tasks/?sort_by=priority&sort_order=asc",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) > 0
    
    def test_get_tasks_combined_filters(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test combining multiple filters."""
        response = client.get(
            "/api/v1/tasks/?completed=false&priority=high&sort_by=created_at&sort_order=desc",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for task in data["items"]:
            assert task["completed"] is False
            assert task["priority"] == "high"
    
    def test_get_single_task(self, client: TestClient, auth_headers: dict, sample_task: Task):
        """Test retrieving a single task by ID."""
        response = client.get(
            f"/api/v1/tasks/{sample_task.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_task.id
        assert data["title"] == sample_task.title
        assert data["description"] == sample_task.description
    
    def test_get_nonexistent_task(self, client: TestClient, auth_headers: dict):
        """Test retrieving non-existent task returns 404."""
        response = client.get("/api/v1/tasks/99999", headers=auth_headers)
        
        assert response.status_code == 404


class TestUpdateTask:
    """Tests for updating existing tasks."""
    
    def test_update_task_as_creator(self, client: TestClient, auth_headers: dict, sample_task: Task, db: Session):
        """Test updating an existing task with appropriate permissions."""
        update_data = {
            "title": "Updated Task Title",
            "description": "Updated description",
            "completed": True,
            "priority": "high"
        }
        
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["description"] == update_data["description"]
        assert data["completed"] is True
        assert data["priority"] == update_data["priority"]
        
        # Verify in database
        db.refresh(sample_task)
        assert sample_task.title == update_data["title"]
        assert sample_task.completed is True
    
    def test_update_task_partial(self, client: TestClient, auth_headers: dict, sample_task: Task):
        """Test partially updating a task."""
        original_title = sample_task.title
        update_data = {
            "completed": True
        }
        
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True
        assert data["title"] == original_title  # Should remain unchanged
    
    def test_update_task_as_assignee(self, client: TestClient, auth_headers: dict, test_user: User, test_admin: User, db: Session):
        """Test assignee can update task."""
        # Create task assigned to test_user
        task = Task(
            title="Assigned Task",
            created_by=test_admin.id,
            assigned_to=test_user.id,
            completed=False
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # Update as assignee
        update_data = {"completed": True}
        response = client.put(
            f"/api/v1/tasks/{task.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True
    
    def test_update_task_unauthorized(self, client: TestClient, auth_headers: dict, test_admin: User, db: Session):
        """Test user cannot update task they don't own or aren't assigned to."""
        # Create task by admin (not assigned to test_user)
        task = Task(
            title="Admin Only Task",
            created_by=test_admin.id,
            completed=False
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # Try to update as regular user
        update_data = {"completed": True}
        response = client.put(
            f"/api/v1/tasks/{task.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    def test_update_task_as_admin_is_forbidden(self, client: TestClient, admin_auth_headers: dict, test_user: User, db: Session):
        """Test admin CANNOT update a task not assigned to them."""
        # Create task by regular user
        task = Task(
            title="User Task",
            created_by=test_user.id,
            assigned_to=test_user.id, # Assigned to the user
            completed=False
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # Try to update as admin (who is not the assignee)
        update_data = {"completed": True}
        response = client.put(
            f"/api/v1/tasks/{task.id}",
            json=update_data,
            headers=admin_auth_headers
        )
        
        # The current logic forbids this. The test should check for a 403.
        assert response.status_code == 403
    
    def test_update_nonexistent_task(self, client: TestClient, auth_headers: dict):
        """Test updating non-existent task returns 404."""
        update_data = {"title": "Updated"}
        response = client.put(
            "/api/v1/tasks/99999",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_update_task_without_auth(self, client: TestClient, sample_task: Task):
        """Test updating task fails without authentication."""
        update_data = {"completed": True}
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            json=update_data
        )
        
        assert response.status_code == 401


class TestTaskStatistics:
    """Tests for task statistics endpoint."""
    
    def test_get_statistics(self, client: TestClient, auth_headers: dict, multiple_tasks):
        """Test getting task statistics."""
        response = client.get("/api/v1/tasks/statistics", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_tasks" in data
        assert "completed_tasks" in data
        assert "pending_tasks" in data
        assert "high_priority" in data
        assert "medium_priority" in data
        assert "low_priority" in data
        assert "completion_rate" in data
        assert "overdue_tasks" in data
        assert isinstance(data["total_tasks"], int)
        assert isinstance(data["completion_rate"], (int, float))


class TestDeleteTask:
    """Tests for deleting tasks."""
    
    def test_delete_task_as_creator(self, client: TestClient, auth_headers: dict, sample_task: Task, db: Session):
        """Test deleting task as creator."""
        task_id = sample_task.id
        
        response = client.delete(
            f"/api/v1/tasks/{task_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()
        
        # Verify task is deleted from database
        deleted_task = db.query(Task).filter(Task.id == task_id).first()
        assert deleted_task is None
    
    def test_delete_task_as_admin_is_forbidden(self, client: TestClient, admin_auth_headers: dict, test_user: User, db: Session):
        """Test admin CANNOT delete a task not assigned to them."""
        # Create task by regular user
        task = Task(
            title="User Task",
            created_by=test_user.id,
            assigned_to=test_user.id, # Assigned to the user
            completed=False
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        response = client.delete(
            f"/api/v1/tasks/{task.id}",
            headers=admin_auth_headers
        )
        
        # The current logic forbids this. The test should check for a 403.
        assert response.status_code == 403
    
    def test_delete_task_unauthorized(self, client: TestClient, auth_headers: dict, test_admin: User, db: Session):
        """Test user cannot delete task they don't own."""
        # Create task by admin
        task = Task(
            title="Admin Task",
            created_by=test_admin.id,
            completed=False
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        response = client.delete(
            f"/api/v1/tasks/{task.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 403
