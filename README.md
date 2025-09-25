New tests that focuses on core funtionality :
**Backend Tests**
1. AuthController (6 tests):
Password hashing verification
Duplicate email prevention
JWT token generation
Valid/invalid credential authentication
Input validation (required fields, email format)
2. SweetController (13 tests):
Authorization security (admin vs user permissions)
Unauthorized access protection (401/403 responses)
Business logic validation (price > 0, quantity >= 0)
CRUD operations security (only admins can modify)
Public endpoint access (users can view sweets)
3. AuthService (8 tests):
Core security functions (password hashing, JWT generation)
Credential validation
Duplicate prevention
Role management (user vs admin)
4. Models (6 tests total):
Database constraints (unique emails, required fields)
Business rule validation (positive prices, non-negative quantities)
Data integrity (password hashing, email format)

**Frontend Tests**
*Login Component Tests:*
Form renders correctly
User can type in fields
Loading state shows during submission
*Register Component Tests:*
Form renders with all required fields
Password validation (matching passwords)
Password minimum length validation
