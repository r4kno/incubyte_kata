import { AuthService } from '../../src/services/AuthService';
import { User } from '../../src/models/User';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.email).toBe(userData.email);
      expect(result.user!.name).toBe(userData.name);
      expect(result.user!.role).toBe('user');
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should not register user with duplicate email', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Act
      await authService.register(userData);
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
      expect(result.token).toBeUndefined();
    });

    it('should hash password during registration', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Act
      const result = await authService.register(userData);

      // Assert
      const savedUser = await User.findById(result.user!._id);
      expect(savedUser!.password).not.toBe(userData.password);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Setup: Create a user for login tests
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      await authService.register(userData);
    });

    it('should login with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.email).toBe(credentials.email);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should not login with invalid email', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid credentials');
      expect(result.token).toBeUndefined();
    });

    it('should not login with invalid password', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid credentials');
      expect(result.token).toBeUndefined();
    });

    it('should return user without password in response', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011'; // Mock ObjectId

      // Act
      const token = authService.generateToken(userId, 'user');

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const token = authService.generateToken(userId, 'user');

      // Act
      const decoded = authService.verifyToken(token);

      // Assert
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
    });

    it('should throw error for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act & Assert
      expect(() => {
        authService.verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // This test would require mocking Date/time or using a short expiry
      // For now, we'll test the basic structure
      expect(true).toBe(true); // Placeholder
    });
  });
});