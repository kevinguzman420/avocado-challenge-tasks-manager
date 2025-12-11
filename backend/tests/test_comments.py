"""
Tests for comment-related endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.task import Task
from app.models.comment import Comment


@pytest.fixture
def sample_task_for_comments(db: Session, test_user: User) -> Task:
    """Create a task for comment testing."""
    task = Task(
        title="Task for Comments",
        description="Testing comment functionality",
        created_by=test_user.id,
        completed=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@pytest.fixture
def sample_comments(db: Session, sample_task_for_comments: Task, test_user: User, test_admin: User):
    """Create sample comments for testing."""
    comments = [
        Comment(
            content="First comment",
            task_id=sample_task_for_comments.id,
            user_id=test_user.id
        ),
        Comment(
            content="Second comment",
            task_id=sample_task_for_comments.id,
            user_id=test_admin.id
        ),
        Comment(
            content="Third comment",
            task_id=sample_task_for_comments.id,
            user_id=test_user.id
        )
    ]
    for comment in comments:
        db.add(comment)
    db.commit()
    for comment in comments:
        db.refresh(comment)
    return comments


class TestCreateComment:
    """Tests for creating comments on tasks."""
    
    def test_create_comment_success(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, test_user: User, db: Session):
        """Test creating a comment on a task successfully."""
        comment_data = {
            "content": "This is a test comment"
        }
        
        response = client.post(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
            json=comment_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["content"] == comment_data["content"]
        assert data["task_id"] == sample_task_for_comments.id
        assert data["user_id"] == test_user.id
        assert "id" in data
        assert "created_at" in data
        
        # Verify comment was created in database
        comment_id = data["id"]
        db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        assert db_comment is not None
        assert db_comment.content == comment_data["content"]
    
    def test_create_comment_empty_content(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task):
        """Test creating comment with empty content fails validation."""
        comment_data = {
            "content": ""
        }
        
        response = client.post(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
            json=comment_data,
            headers=auth_headers
        )
        
        assert response.status_code == 422
    
    def test_create_comment_long_content(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task):
        """Test creating comment with very long content."""
        comment_data = {
            "content": "A" * 5000  # Very long comment
        }
        
        response = client.post(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
            json=comment_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert len(data["content"]) == 5000
    
    def test_create_comment_nonexistent_task(self, client: TestClient, auth_headers: dict):
        """Test creating comment on non-existent task returns 404."""
        comment_data = {
            "content": "Comment on non-existent task"
        }
        
        response = client.post(
            "/api/v1/tasks/99999/comments",
            json=comment_data,
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_create_comment_without_auth(self, client: TestClient, sample_task_for_comments: Task):
        """Test creating comment fails without authentication."""
        comment_data = {
            "content": "Unauthorized comment"
        }
        
        response = client.post(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
            json=comment_data
        )
        
        assert response.status_code == 401
    
    def test_create_multiple_comments_same_task(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task):
        """Test creating multiple comments on same task."""
        comments_data = [
            {"content": "First comment"},
            {"content": "Second comment"},
            {"content": "Third comment"}
        ]
        
        for comment_data in comments_data:
            response = client.post(
                f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
                json=comment_data,
                headers=auth_headers
            )
            assert response.status_code == 201
        
        # Verify all comments exist
        response = client.get(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 3


class TestRetrieveComments:
    """Tests for retrieving comments from tasks."""
    
    def test_get_comments_default(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, sample_comments):
        """Test retrieving comments with default pagination."""
        response = client.get(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert isinstance(data["items"], list)
        assert len(data["items"]) == 3
        assert data["total"] == 3
    
    def test_get_comments_with_pagination(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, sample_comments):
        """Test retrieving comments with pagination parameters."""
        # Get first page
        response = client.get(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments?skip=0&limit=2",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["skip"] == 0
        assert data["limit"] == 2
        
        # Get second page
        response = client.get(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments?skip=2&limit=2",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["skip"] == 2
    
    def test_get_comments_ordered_by_created_at(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, sample_comments):
        """Test comments are ordered by creation date ascending."""
        response = client.get(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        # Verify ascending order
        if len(data["items"]) >= 2:
            for i in range(len(data["items"]) - 1):
                assert data["items"][i]["created_at"] <= data["items"][i + 1]["created_at"]
    
    def test_get_comments_empty_task(self, client: TestClient, auth_headers: dict, test_user: User, db: Session):
        """Test retrieving comments from task with no comments."""
        # Create task without comments
        task = Task(
            title="Task without comments",
            created_by=test_user.id,
            completed=False
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        response = client.get(
            f"/api/v1/tasks/{task.id}/comments",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
        assert data["total"] == 0
    
    def test_get_comments_nonexistent_task(self, client: TestClient, auth_headers: dict):
        """Test retrieving comments from non-existent task returns 404."""
        response = client.get(
            "/api/v1/tasks/99999/comments",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_get_comments_without_auth(self, client: TestClient, sample_task_for_comments: Task):
        """Test retrieving comments fails without authentication."""
        response = client.get(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments"
        )
        
        assert response.status_code == 401
    
    def test_get_comments_includes_user_info(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, sample_comments):
        """Test comments include user information."""
        response = client.get(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for comment in data["items"]:
            assert "user" in comment
            assert "id" in comment["user"]
            assert "email" in comment["user"]
            assert "full_name" in comment["user"]


class TestUpdateComment:
    """Tests for updating comments."""
    
    def test_update_comment_as_author(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, test_user: User, db: Session):
        """Test updating comment as the original author."""
        # Create comment
        comment = Comment(
            content="Original content",
            task_id=sample_task_for_comments.id,
            user_id=test_user.id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        update_data = {
            "content": "Updated content"
        }
        
        response = client.put(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments/{comment.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == update_data["content"]
        
        # Verify in database
        db.refresh(comment)
        assert comment.content == update_data["content"]
    
    def test_update_comment_unauthorized(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, test_admin: User, db: Session):
        """Test user cannot update comment they didn't create."""
        # Create comment by admin
        comment = Comment(
            content="Admin comment",
            task_id=sample_task_for_comments.id,
            user_id=test_admin.id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        update_data = {
            "content": "Trying to update admin comment"
        }
        
        response = client.put(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments/{comment.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    def test_update_comment_as_admin(self, client: TestClient, admin_auth_headers: dict, sample_task_for_comments: Task, test_user: User, db: Session):
        """Test admin can update any comment."""
        # Create comment by regular user
        comment = Comment(
            content="User comment",
            task_id=sample_task_for_comments.id,
            user_id=test_user.id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        update_data = {
            "content": "Admin updated this"
        }
        
        response = client.put(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments/{comment.id}",
            json=update_data,
            headers=admin_auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == update_data["content"]


class TestDeleteComment:
    """Tests for deleting comments."""
    
    def test_delete_comment_as_author(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, test_user: User, db: Session):
        """Test deleting comment as the original author."""
        # Create comment
        comment = Comment(
            content="To be deleted",
            task_id=sample_task_for_comments.id,
            user_id=test_user.id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        comment_id = comment.id
        
        response = client.delete(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments/{comment_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()
        
        # Verify comment is deleted
        deleted_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        assert deleted_comment is None
    
    def test_delete_comment_unauthorized(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task, test_admin: User, db: Session):
        """Test user cannot delete comment they didn't create."""
        # Create comment by admin
        comment = Comment(
            content="Admin comment",
            task_id=sample_task_for_comments.id,
            user_id=test_admin.id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        response = client.delete(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments/{comment.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    def test_delete_comment_as_admin(self, client: TestClient, admin_auth_headers: dict, sample_task_for_comments: Task, test_user: User, db: Session):
        """Test admin can delete any comment."""
        # Create comment by regular user
        comment = Comment(
            content="User comment",
            task_id=sample_task_for_comments.id,
            user_id=test_user.id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        response = client.delete(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments/{comment.id}",
            headers=admin_auth_headers
        )
        
        assert response.status_code == 200
    
    def test_delete_nonexistent_comment(self, client: TestClient, auth_headers: dict, sample_task_for_comments: Task):
        """Test deleting non-existent comment returns 404."""
        response = client.delete(
            f"/api/v1/tasks/{sample_task_for_comments.id}/comments/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404
