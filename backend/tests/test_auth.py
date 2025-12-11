"""
Unit tests for authentication endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.core.security import verify_password


class TestUserRegistration:
    """Tests for user registration endpoint."""
    
    def test_register_user_success(self, client: TestClient, db: Session):
        """Test successful user registration with valid data."""
        # Prepare test data
        user_data = {
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New User",
            "role": "regular"
        }
        
        # Make registration request
        response = client.post("/api/v1/auth/register", json=user_data)
        
        # Assert response
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["full_name"] == user_data["full_name"]
        assert data["role"] == "regular"
        assert data["is_active"] is True
        assert "id" in data
        assert "password" not in data
        assert "hashed_password" not in data
        
        # Verify user was created in database
        db_user = db.query(User).filter(User.email == user_data["email"]).first()
        assert db_user is not None
        assert db_user.email == user_data["email"]
        assert verify_password(user_data["password"], db_user.hashed_password)
    
    def test_register_admin_user_success(self, client: TestClient, db: Session):
        """Test successful admin user registration."""
        user_data = {
            "email": "admin@example.com",
            "password": "adminpass123",
            "full_name": "Admin User",
            "role": "admin"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "admin"
        
        # Verify in database
        db_user = db.query(User).filter(User.email == user_data["email"]).first()
        assert db_user.role == UserRole.ADMIN
    
    def test_register_duplicate_email(self, client: TestClient, test_user: User):
        """Test registration fails with duplicate email."""
        user_data = {
            "email": test_user.email,
            "password": "anotherpassword123",
            "full_name": "Another User",
            "role": "regular"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_register_invalid_email(self, client: TestClient):
        """Test registration fails with invalid email."""
        user_data = {
            "email": "not-an-email",
            "password": "password123",
            "full_name": "Test User"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422
    
    def test_register_short_password(self, client: TestClient):
        """Test registration fails with password less than 8 characters."""
        user_data = {
            "email": "user@example.com",
            "password": "short",
            "full_name": "Test User"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422
    
    def test_register_missing_required_fields(self, client: TestClient):
        """Test registration fails when required fields are missing."""
        user_data = {
            "email": "user@example.com"
            # Missing password
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422


class TestUserLogin:
    """Tests for user login endpoint."""
    
    def test_login_success(self, client: TestClient, test_user: User):
        """Test user login with correct credentials and JWT token generation."""
        # Login with correct credentials
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "testpassword123"
            }
        )
        
        # Assert response
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0
    
    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login fails with incorrect password."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client: TestClient):
        """Test login fails with non-existent email."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "somepassword123"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_inactive_user(self, client: TestClient, db: Session, test_user: User):
        """Test login fails for inactive user."""
        # Deactivate user
        test_user.is_active = False
        db.commit()
        
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "testpassword123"
            }
        )
        
        # Inactive users get 401 since authenticate_user returns None
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_get_current_user_with_token(self, client: TestClient, auth_headers: dict, test_user: User):
        """Test getting current user info with valid token."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
        assert data["id"] == test_user.id
    
    def test_get_current_user_without_token(self, client: TestClient):
        """Test getting current user fails without token."""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 401
    
    def test_get_current_user_with_invalid_token(self, client: TestClient):
        """Test getting current user fails with invalid token."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401
