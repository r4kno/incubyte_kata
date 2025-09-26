# Sweet Shop Management System

A full-stack web application for managing a sweet shop inventory with role-based authentication. Built with Test-Driven Development (TDD) principles using modern web technologies.

## 🍭 Project Overview

The Sweet Shop Management System is a comprehensive web application that allows sweet shop owners to manage their inventory while providing customers with a user-friendly interface to browse and purchase sweets. The application features role-based access control with separate interfaces for administrators and regular users.

### Key Features

**For Administrators:**
- Complete CRUD operations for sweet inventory management
- Add, edit, and delete sweets with details (name, category, price, quantity, description, image)
- Restock inventory items
- Monitor sales and inventory levels
- User management capabilities

**For Users:**
- Browse available sweets with filtering and search capabilities
- View detailed sweet information including images and descriptions
- Purchase sweets (reduces inventory quantity)
- User registration and authentication

**Technical Features:**
- JWT-based authentication system
- Role-based authorization (Admin/User)
- RESTful API design
- Input validation and error handling
- Responsive design with Tailwind CSS
- Comprehensive test coverage (Frontend: Vitest, Backend: Jest)
- MongoDB database with Mongoose ODM
- Environment-based configuration

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Jest** - Testing framework
- **express-validator** - Input validation

### Frontend
- **React 19** with **TypeScript** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Vitest** - Testing framework
- **Testing Library** - React testing utilities

## 📁 Project Structure

```
Incubyte/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # React components for different pages
│   │   ├── utils/         # Utility functions and API configuration
│   │   ├── tests/         # Test files and test utilities
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
│
├── server/                # Backend Express application
│   ├── src/
│   │   ├── controllers/   # Route handlers and business logic
│   │   ├── models/        # Database models (Mongoose schemas)
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Custom middleware (auth, validation)
│   │   ├── types/         # TypeScript type definitions
│   │   └── app.ts         # Main application file
│   ├── tests/             # Test files mirroring src structure
│   └── package.json       # Backend dependencies
│
└── README.md              # This file
```

## 🚀 Setup and Installation

### Prerequisites

Before running this project, make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/r4kno/incubyte_kata.git
cd incubyte_kata
```

### 2. Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
copy .env.example .env
```

4. Configure your `.env` file with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
```

**Important:** Replace `your_mongodb_connection_string` with your actual MongoDB connection string. For MongoDB Atlas, it should look like:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>
```

5. Start the development server:
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
copy .env.example .env
```

4. Configure your `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

The frontend application will start on `http://localhost:5173`

## 🧪 Running Tests

### Backend Tests (Jest)

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Frontend Tests (Vitest)

```bash
cd client

# Run all tests
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```
## 📷 UI Screenshots

![Screenshot 1](Screenshots/Screenshot%202025-09-26%20173856.png)

![Screenshot 2](Screenshots/Screenshot%202025-09-26%20183251.png)

![Screenshot 3](Screenshots/Screenshot%202025-09-26%20183311.png)

![Screenshot 4](Screenshots/Screenshot%202025-09-26%20183326.png)

![Screenshot 5](Screenshots/Screenshot%202025-09-26%20183331.png)

![Screenshot 6](Screenshots/Screenshot%202025-09-26%20183340.png)

![Screenshot 7](Screenshots/Screenshot%202025-09-26%20183350.png)


## 📊 Test Coverage

The project includes comprehensive test coverage for both frontend and backend:

### Backend Tests (33 tests total)
- **AuthController** (6 tests): Password hashing, duplicate prevention, JWT generation, authentication
- **SweetController** (13 tests): Authorization, CRUD operations, business logic validation
- **AuthService** (8 tests): Security functions, credential validation, role management
- **Models** (6 tests): Database constraints, business rules, data integrity

### Frontend Tests
- **Login Component**: Form rendering, user interaction, loading states
- **Register Component**: Form validation, password matching, input validation

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Tokens) for authentication with role-based access control:

### User Roles
- **Admin**: Full access to inventory management, user management
- **User**: Browse sweets, make purchases, manage own account

### Default Admin Account
After setting up the database, you can create an admin account through the registration endpoint or directly in the database with role: 'admin'.

## 🌐 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Sweet Management Endpoints
- `GET /api/sweets` - Get all sweets (public)
- `GET /api/sweets/search` - Search sweets with filters
- `POST /api/sweets` - Create new sweet (admin only)
- `PUT /api/sweets/:id` - Update sweet (admin only)
- `DELETE /api/sweets/:id` - Delete sweet (admin only)
- `POST /api/sweets/:id/purchase` - Purchase sweet (authenticated users)
- `POST /api/sweets/:id/restock` - Restock sweet (admin only)

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your MongoDB connection string in `.env`
   - Ensure MongoDB service is running (for local installations)
   - Check network access for MongoDB Atlas

2. **Port Already in Use**
   - Backend (5000): Change `PORT` in server `.env` file
   - Frontend (5173): Vite will automatically suggest alternative port

3. **CORS Issues**
   - Ensure frontend URL is included in backend CORS configuration
   - Check that `VITE_API_BASE_URL` matches backend URL

4. **Authentication Issues**
   - Verify JWT_SECRET is set in backend `.env`
   - Clear browser localStorage and cookies
   - Check token expiration settings




## 🤖 AI-Assisted Development

This project was developed with strategic use of AI tools, primarily **GitHub Copilot**, as a development enhancer rather than a replacement for manual coding and decision-making.

### How AI Was Utilized

**Test Development Enhancement:**
- Wrote initial test cases manually to establish testing patterns and standards
- Used GitHub Copilot suggestions to identify potential edge cases and additional test scenarios
- Generated remaining test cases using AI suggestions while manually reviewing and customizing each test
- Maintained personal oversight of test logic and assertions to ensure comprehensive coverage

**Frontend Development Support:**
- Provided AI with design ideas, page layouts, and API configuration requirements
- Generated initial page designs and component structures based on specifications
- Manually implemented and refined API fetch logic, error handling, and state management
- Customized AI-generated designs to match project requirements and user experience goals

**Documentation:**
- Used AI assistance to generate structured README content based on project specifications
- Manually added project-specific details, setup instructions, and technical decisions
- Reviewed and edited all AI-generated content to ensure accuracy and completeness

### Development Philosophy

The AI tools served as **intelligent assistants** rather than primary developers:
- ✅ **Enhanced productivity** by suggesting code completions and patterns
- ✅ **Improved test coverage** by identifying overlooked scenarios
- ✅ **Accelerated documentation** while maintaining technical accuracy
- ✅ **Maintained code quality** through manual review and customization
- ✅ **Preserved learning** by understanding and modifying all suggested code

### Key Principles Followed

1. **AI as Enhancement, Not Replacement**: Every AI suggestion was manually reviewed, understood, and customized
2. **Maintained Code Ownership**: All critical business logic and architecture decisions were made manually
3. **Learning-Focused Approach**: Used AI to learn new patterns while ensuring complete understanding
4. **Quality Assurance**: Manually tested all AI-generated code and made necessary improvements

This approach allowed for faster development while ensuring code quality, maintainability, and personal skill development throughout the project.

