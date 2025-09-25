import { AuthService } from '../../src/services/AuthService';
import { User } from '../../src/models/User';
import bcrypt from 'bcryptjs';

describe('AuthService - Critical Tests', () => {
  let authService: AuthService;

  beforeEach(async () => {
    await User.deleteMany({});
    authService = new AuthService();
  });

  describe('Core Security Functions', () => {
    it('should hash passwords during registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      
      // Verify password is hashed in database
      const savedUser = await User.findById(result.user!._id);
      expect(savedUser!.password).not.toBe(userData.password);
      
      // Verify hash is valid
      const isValidHash = await bcrypt.compare(userData.password, savedUser!.password);
      expect(isValidHash).toBe(true);
    });

    it('should generate valid JWT tokens', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token!.length).toBeGreaterThan(50); // JWT tokens are long
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // First registration should succeed
      const firstResult = await authService.register(userData);
      expect(firstResult.success).toBe(true);

      // Second registration with same email should fail
      const secondResult = await authService.register(userData);
      expect(secondResult.success).toBe(false);
      expect(secondResult.message).toContain('already exists');
    });

    it('should authenticate valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Register user first
      await authService.register(userData);

      // Then try to login
      const loginResult = await authService.login({
        email: userData.email,
        password: userData.password
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toBeDefined();
      expect(loginResult.token).toBeDefined();
      expect(loginResult.user!.email).toBe(userData.email);
    });

    it('should reject invalid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      await authService.register(userData);

      // Wrong password
      const wrongPasswordResult = await authService.login({
        email: userData.email,
        password: 'wrongpassword'
      });

      expect(wrongPasswordResult.success).toBe(false);
      expect(wrongPasswordResult.token).toBeUndefined();

      // Wrong email  
      const wrongEmailResult = await authService.login({
        email: 'wrong@example.com',
        password: userData.password
      });

      expect(wrongEmailResult.success).toBe(false);
      expect(wrongEmailResult.token).toBeUndefined();
    });
  });

  describe('Role Management', () => {
    it('should set default role to user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
        // No role specified
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.user!.role).toBe('user');
    });

    it('should respect admin role when specified', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Test Admin',
        role: 'admin' as const
      };

      const result = await authService.register(adminData);

      expect(result.success).toBe(true);
      expect(result.user!.role).toBe('admin');
    });
  });
});