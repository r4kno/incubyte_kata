import { User } from '../../src/models/User';
import { UserDocument } from '../../src/types/User.types';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user' as const
      };

      // Act
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.role).toBe('user');
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should require email field', async () => {
      // Arrange
      const userData = {
        password: 'password123',
        name: 'Test User'
      };

      // Act & Assert
      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require password field', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };

      // Act & Assert
      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      // Act & Assert
      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should not allow duplicate emails', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Act
      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);

      // Assert
      await expect(user2.save()).rejects.toThrow();
    });

    it('should set default role to user', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Act
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert
      expect(savedUser.role).toBe('user');
    });

    it('should allow admin role', async () => {
      // Arrange
      const userData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin' as const
      };

      // Act
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert
      expect(savedUser.role).toBe('admin');
    });
  });

  describe('Password Methods', () => {
    it('should hash password before saving', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Act
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert
      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password.length).toBeGreaterThan(20); // Hashed passwords are longer
    });

    it('should verify correct password', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // Act
      const isMatch = await savedUser.comparePassword('password123');

      // Assert
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // Act
      const isMatch = await savedUser.comparePassword('wrongpassword');

      // Assert
      expect(isMatch).toBe(false);
    });
  });
});