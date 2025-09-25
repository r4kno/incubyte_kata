// Test data for sweets
export const mockSweets = [
  {
    _id: '1',
    name: 'Chocolate Cake',
    price: 299,
    quantity: 25,
    description: 'Rich chocolate cake with cream frosting',
    category: 'Cake',
    imageUrl: 'https://example.com/chocolate-cake.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    __v: 0
  },
  {
    _id: '2',
    name: 'Strawberry Tart',
    price: 199,
    quantity: 15,
    description: 'Fresh strawberry tart with custard',
    category: 'Tart',
    imageUrl: 'https://example.com/strawberry-tart.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    __v: 0
  },
  {
    _id: '3',
    name: 'Vanilla Cupcake',
    price: 149,
    quantity: 30,
    description: 'Classic vanilla cupcake with buttercream',
    category: 'Cupcake',
    imageUrl: 'https://example.com/vanilla-cupcake.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    __v: 0
  }
];

// Test data for users
export const mockUser = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};

export const mockAdmin = {
  _id: 'admin123',
  name: 'Test Admin',
  email: 'admin@example.com',
  role: 'admin'
};

// Test data for API responses
export const mockApiResponses = {
  sweetsSuccess: {
    success: true,
    message: 'Sweets retrieved successfully',
    data: mockSweets,
    count: mockSweets.length
  },
  sweetsEmpty: {
    success: true,
    message: 'No sweets found',
    data: [],
    count: 0
  },
  sweetsError: {
    success: false,
    message: 'Failed to fetch sweets'
  },
  loginSuccess: {
    success: true,
    user: mockUser,
    token: 'mock-jwt-token'
  },
  loginAdminSuccess: {
    success: true,
    user: mockAdmin,
    token: 'mock-admin-jwt-token'
  },
  registerSuccess: {
    success: true,
    message: 'User registered successfully',
    user: mockUser
  },
  purchaseSuccess: {
    success: true,
    message: 'Purchase completed successfully',
    data: {
      transactionId: 'tx_12345',
      total: 15.99
    }
  },
  authError: {
    success: false,
    message: 'Authentication failed'
  },
  validationError: {
    success: false,
    message: 'Validation failed',
    errors: ['Name is required', 'Email is invalid']
  }
};

// Test cookies
export const mockCookies = {
  user: {
    token: 'mock-user-token',
    userId: mockUser._id,
    userEmail: mockUser.email,
    userName: mockUser.name,
    userRole: mockUser.role
  },
  admin: {
    token: 'mock-admin-token',
    userId: mockAdmin._id,
    userEmail: mockAdmin.email,
    userName: mockAdmin.name,
    userRole: mockAdmin.role
  }
};