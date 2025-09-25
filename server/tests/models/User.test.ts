import { User } from '../../src/models/User';

describe('User Model - Critical Validations', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Security & Data Integrity', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // First user should save successfully
      const user1 = new User(userData);
      await user1.save();

      // Second user with same email should fail
      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userWithInvalidEmail = new User({
        email: 'invalid-email', // Invalid format
        password: 'password123',
        name: 'Test User'
      });

      await expect(userWithInvalidEmail.save()).rejects.toThrow();
    });

    it('should require essential fields', async () => {
      // Missing email
      const userWithoutEmail = new User({
        password: 'password123',
        name: 'Test User'
      });
      await expect(userWithoutEmail.save()).rejects.toThrow();

      // Missing password  
      const userWithoutPassword = new User({
        email: 'test@example.com',
        name: 'Test User'
      });
      await expect(userWithoutPassword.save()).rejects.toThrow();

      // Missing name
      const userWithoutName = new User({
        email: 'test@example.com',
        password: 'password123'
      });
      await expect(userWithoutName.save()).rejects.toThrow();
    });

    it('should hash password automatically', async () => {
      const plainPassword = 'password123';
      const userData = {
        email: 'test@example.com',
        password: plainPassword,
        name: 'Test User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // Password should be hashed, not plain text
      expect(savedUser.password).not.toBe(plainPassword);
      expect(savedUser.password.length).toBeGreaterThan(20); // Hashes are long
    });

    it('should set default role correctly', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
        // No role specified
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('user');
    });

    it('should allow admin role', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin' as const
      };

      const admin = new User(adminData);
      const savedAdmin = await admin.save();

      expect(savedAdmin.role).toBe('admin');
    });
  });
});