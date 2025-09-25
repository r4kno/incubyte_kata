# Sweet Shop Management System - TDD Implementation Guide

## 🎯 Project Overview

This is a full-stack MERN application built using **Test-Driven Development (TDD)**. The project demonstrates clean coding practices, comprehensive testing, and modern development workflows.

## 🔧 Technology Stack

### Backend
- **Node.js + Express.js** with TypeScript
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Jest** for testing
- **Supertest** for API testing
- **MongoDB Memory Server** for isolated tests

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Vitest** for testing
- **React Testing Library** for component testing
- **Axios** for API communication

## 🧪 TDD Implementation

### What is Test-Driven Development?

TDD is a software development methodology that follows the **Red-Green-Refactor** cycle:

1. **🔴 RED**: Write a failing test first
2. **🟢 GREEN**: Write minimal code to make the test pass
3. **🔵 REFACTOR**: Clean up and optimize while keeping tests passing

### TDD Benefits in This Project

- ✅ **Better Code Quality**: Every feature is tested before implementation
- ✅ **Living Documentation**: Tests serve as specifications
- ✅ **Confidence in Changes**: Safe refactoring with comprehensive test coverage
- ✅ **Early Bug Detection**: Issues caught during development
- ✅ **Design-Driven Development**: Forces better architecture decisions

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

```bash
cd server
npm install

# Run tests (TDD approach)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Start development server
npm run dev

# Build for production
npm run build
```

### Frontend Setup

```bash
cd client
npm install

# Run tests (TDD approach)
npm test

# Run tests in watch mode  
npm run test:watch

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
server/
├── src/
│   ├── models/          # Mongoose models with business logic
│   ├── services/        # Business logic services
│   ├── controllers/     # Express route handlers
│   ├── types/           # TypeScript type definitions
│   └── app.ts           # Express app configuration
├── tests/
│   ├── models/          # Model unit tests
│   ├── services/        # Service unit tests
│   ├── controllers/     # API integration tests
│   └── setup.ts         # Test environment setup
└── jest.config.js       # Jest test configuration

client/
├── src/
│   ├── components/      # React components
│   ├── services/        # API service functions
│   ├── types/           # TypeScript interfaces
│   └── test/            # Test utilities and setup
└── vitest.config.ts     # Vitest test configuration
```

## 🧪 TDD Examples

### Backend TDD Example: User Model

**1. RED Phase - Write failing test:**
```typescript
// tests/models/User.test.ts
it('should create a user with valid data', async () => {
  const userData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  const user = new User(userData);
  const savedUser = await user.save();

  expect(savedUser.email).toBe(userData.email);
  expect(savedUser.password).not.toBe(userData.password); // Should be hashed
});
```

**2. GREEN Phase - Make test pass:**
```typescript
// src/models/User.ts
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

**3. REFACTOR Phase - Improve code quality while keeping tests green**

### Frontend TDD Example: Login Component

**1. RED Phase - Write failing test:**
```typescript
// src/components/LoginForm.test.tsx
it('should render login form with email and password fields', () => {
  render(<LoginForm />);
  
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
```

**2. GREEN Phase - Create component:**
```tsx
// src/components/LoginForm.tsx
const LoginForm: React.FC = () => {
  return (
    <form>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};
```

## 🎯 API Endpoints (Test-Driven)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Sweets Management (Protected)
- `GET /api/sweets` - List all sweets
- `POST /api/sweets` - Create new sweet
- `GET /api/sweets/search` - Search sweets
- `PUT /api/sweets/:id` - Update sweet
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)

### Inventory Management (Protected)
- `POST /api/sweets/:id/purchase` - Purchase sweet
- `POST /api/sweets/:id/restock` - Restock sweet (Admin only)

## ✅ Test Coverage

Our TDD approach ensures comprehensive test coverage:

### Backend Tests ✅
- **Model Tests**: User and Sweet models with validation
- **Service Tests**: Authentication and business logic
- **Controller Tests**: API endpoints with various scenarios
- **Integration Tests**: Full request-response cycles

### Frontend Tests ⏳
- **Component Tests**: React component rendering and interaction
- **Integration Tests**: User workflows and API communication
- **E2E Tests**: Complete user journeys (coming soon)

## 🔄 TDD Workflow

### For New Features:

1. **Write Test First** (RED 🔴)
   ```bash
   # Write failing test
   npm test -- --watch
   ```

2. **Implement Feature** (GREEN 🟢)
   ```bash
   # Write minimal code to pass test
   # Verify test passes
   ```

3. **Refactor Code** (REFACTOR 🔵)
   ```bash
   # Clean up code
   # Ensure all tests still pass
   # Add more test cases if needed
   ```

### Running Tests

```bash
# Backend
cd server
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Frontend  
cd client
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## 🏗️ Database Schema

### User Model
```typescript
interface IUser {
  email: string;
  password: string;    // Hashed with bcrypt
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### Sweet Model
```typescript
interface ISweet {
  name: string;
  category: 'chocolate' | 'candy' | 'gum' | 'lollipop' | 'other';
  price: number;
  quantity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 Frontend Features

### Planned Components (TDD)
- `LoginForm` - User authentication
- `RegisterForm` - User registration  
- `SweetCard` - Individual sweet display
- `SweetsList` - Sweet inventory grid
- `SearchBar` - Sweet search functionality
- `AddSweetForm` - Admin sweet creation (Admin only)
- `PurchaseButton` - Sweet purchase action

## 📊 Test Results

Current test status: **✅ All 43 tests passing**

```
Test Suites: 4 passed, 4 total
Tests:       43 passed, 43 total
Snapshots:   0 total
Time:        6.507 s
```

## 🚀 Deployment

### Backend
```bash
# Build
npm run build

# Start production server
npm start
```

### Frontend
```bash
# Build
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

This project follows TDD principles. When contributing:

1. **Always write tests first** 
2. Follow the Red-Green-Refactor cycle
3. Maintain test coverage above 80%
4. Run tests before committing
5. Update documentation as needed

## 📚 Learning Resources

- [TDD with Node.js and Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Built with ❤️ using Test-Driven Development**