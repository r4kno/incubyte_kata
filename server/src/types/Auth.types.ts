import { Request } from 'express';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
  token?: string;
  message?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}