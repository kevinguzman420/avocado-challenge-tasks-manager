# Test Suite for Avocado Task Manager

This directory contains comprehensive unit tests for the Avocado Task Manager backend API.

## Test Coverage

The test suite covers the following functionality:

### 1. Authentication Tests (`test_auth.py`)
- **User Registration**: 
  - Successful registration with valid data
  - Registration with admin role
  - Duplicate email validation
  - Invalid email format validation
  - Password length validation
  - Missing required fields validation

- **User Login**:
  - Successful login with JWT token generation
  - Wrong password handling
  - Non-existent user handling
  - Inactive user handling
  - Token validation
  - Current user retrieval

### 2. Task Management Tests (`test_tasks.py`)
- **Create Tasks**:
  - Successful task creation with all details
  - Minimal task creation (only required fields)
  - Task creation with assigned user
  - Authentication requirement
  - Invalid data validation

- **Retrieve Tasks**:
  - Default task listing
  - Pagination (skip and limit)
  - Filter by completion status
  - Filter by priority
  - Filter by creator
  - Filter by assignee
  - Search functionality (title and description)
  - Sorting (ascending and descending)
  - Combined filters
  - Single task retrieval by ID

- **Update Tasks**:
  - Update as task creator
  - Update as task assignee
  - Update as admin (any task)
  - Partial updates
  - Permission validation
  - Non-existent task handling

- **Delete Tasks**:
  - Delete as task creator
  - Delete as admin
  - Permission validation

- **Statistics**:
  - Task statistics aggregation

## Running the Tests

### Prerequisites
Ensure you have the required dependencies installed:
```bash
cd /home/kevinguzman/Documentos/Programming/FastAPI/proyecto-avocado/backend
uv pip install -e ".[dev]"
```

Or if using the virtual environment directly:
```bash
source .venv/bin/activate
pip install pytest pytest-asyncio pytest-cov httpx
```

### Run All Tests
```bash
# Using uv
uv run pytest

# Using activated virtual environment
pytest
```

### Run Specific Test Files
```bash
# Test authentication only
pytest tests/test_auth.py

# Test tasks only
pytest tests/test_tasks.py
```

### Run Specific Test Classes
```bash
# Test user registration
pytest tests/test_auth.py::TestUserRegistration

# Test task creation
pytest tests/test_tasks.py::TestCreateTask
```

### Run Specific Test Functions
```bash
# Test successful registration
pytest tests/test_auth.py::TestUserRegistration::test_register_user_success

# Test task retrieval with filters
pytest tests/test_tasks.py::TestRetrieveTasks::test_get_tasks_filter_by_priority
```

### Run with Coverage Report
```bash
pytest --cov=app --cov-report=html
```
This will generate an HTML coverage report in `htmlcov/index.html`.

### Run with Verbose Output
```bash
pytest -v
```

### Run Tests in Parallel (faster)
```bash
pytest -n auto
```
Note: Requires `pytest-xdist` to be installed.

## Test Structure

### Fixtures (`conftest.py`)
The test suite uses pytest fixtures for test setup:

- `db`: Creates a fresh SQLite database for each test
- `client`: FastAPI test client with database override
- `test_user`: Creates a regular test user
- `test_admin`: Creates an admin test user
- `auth_headers`: Generates authentication headers for test user
- `admin_auth_headers`: Generates authentication headers for admin user
- `sample_task`: Creates a single task for testing
- `multiple_tasks`: Creates multiple tasks with different attributes

### Test Organization
Tests are organized into classes by functionality:

**test_auth.py:**
- `TestUserRegistration`: User registration tests
- `TestUserLogin`: User login and token tests

**test_tasks.py:**
- `TestCreateTask`: Task creation tests
- `TestRetrieveTasks`: Task retrieval, filtering, and pagination tests
- `TestUpdateTask`: Task update and permissions tests
- `TestDeleteTask`: Task deletion tests
- `TestTaskStatistics`: Statistics endpoint tests

## Database Setup

The tests use an in-memory SQLite database (`test.db`) that is:
- Created fresh for each test function
- Automatically cleaned up after each test
- Independent from the development/production PostgreSQL database

This ensures:
- Fast test execution
- Test isolation
- No impact on development data

## Continuous Integration

These tests are designed to be run in CI/CD pipelines. Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          pip install -e ".[dev]"
      - name: Run tests
        run: pytest
```

## Common Issues and Solutions

### Issue: "ModuleNotFoundError: No module named 'app'"
**Solution**: Make sure you're running tests from the `backend` directory:
```bash
cd /home/kevinguzman/Documentos/Programming/FastAPI/proyecto-avocado/backend
pytest
```

### Issue: Database connection errors
**Solution**: Tests use SQLite, not PostgreSQL. Ensure the `conftest.py` is properly configured.

### Issue: Import errors
**Solution**: Install the package in editable mode:
```bash
pip install -e .
```

## Adding New Tests

When adding new tests:

1. Follow the existing naming conventions
2. Use appropriate fixtures from `conftest.py`
3. Add new fixtures to `conftest.py` if needed
4. Group related tests in classes
5. Write descriptive test names and docstrings
6. Test both success and failure cases
7. Verify database state when appropriate

Example test structure:
```python
def test_feature_success(self, client, auth_headers):
    """Test successful feature execution."""
    # Arrange
    data = {"field": "value"}
    
    # Act
    response = client.post("/api/endpoint", json=data, headers=auth_headers)
    
    # Assert
    assert response.status_code == 200
    assert response.json()["field"] == "value"
```

## Test Metrics

Current test coverage:
- **Authentication**: 14 tests
- **Task Management**: 35+ tests
- **Total**: 49+ tests

All critical paths are covered including:
- ✅ User registration and validation
- ✅ JWT token generation and authentication
- ✅ Task CRUD operations
- ✅ Task filtering and pagination
- ✅ Permission checking
- ✅ Error handling
