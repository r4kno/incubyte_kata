import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RegisterData, LoginData, AuthResult, TokenPayload } from '../types/Auth.types';

export class AuthService {
  private jwtSecret: string;
  private jwtExpire: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.jwtExpire = process.env.JWT_EXPIRE || '7d';
  }

  async register(userData: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Create new user
      const user = new User(userData);
      const savedUser = await user.save();

      // Generate token with role
      const token = this.generateToken((savedUser._id as any).toString(), savedUser.role);

      // Return user without password
      const userResponse = {
        _id: (savedUser._id as any).toString(),
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role
      };

      return {
        success: true,
        user: userResponse,
        token
      };
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed'
      };
    }
  }

  async login(credentials: LoginData): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Check password
      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Generate token with role
      const token = this.generateToken((user._id as any).toString(), user.role);

      // Return user without password
      const userResponse = {
        _id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        role: user.role
      };

      return {
        success: true,
        user: userResponse,
        token
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  generateToken(userId: string, role: string): string {
    const payload = { userId, role };
    return jwt.sign(payload, this.jwtSecret as jwt.Secret, {
      expiresIn: this.jwtExpire
    } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret as jwt.Secret) as any;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}