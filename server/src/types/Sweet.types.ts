import { Document } from 'mongoose';

export interface ISweet {
  name: string;
  category: 'chocolate' | 'candy' | 'gum' | 'lollipop' | 'other';
  price: number;
  quantity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SweetDocument extends ISweet, Document {
  isInStock(): boolean;
  purchase(quantity: number): Promise<{ success: boolean; message?: string }>;
  restock(quantity: number): Promise<void>;
}