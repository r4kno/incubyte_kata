import mongoose, { Schema } from 'mongoose';
import { SweetDocument } from '../types/Sweet.types';

const sweetSchema = new Schema<SweetDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['chocolate', 'candy', 'gum', 'lollipop', 'other']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    description: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Check if sweet is in stock
sweetSchema.methods.isInStock = function (): boolean {
  return this.quantity > 0;
};

// Purchase sweet method
sweetSchema.methods.purchase = async function (
  quantityToPurchase: number
): Promise<{ success: boolean; message?: string }> {
  if (this.quantity < quantityToPurchase) {
    return {
      success: false,
      message: `Insufficient stock. Available: ${this.quantity}, Requested: ${quantityToPurchase}`
    };
  }

  this.quantity -= quantityToPurchase;
  await this.save();

  return {
    success: true
  };
};

// Restock sweet method
sweetSchema.methods.restock = async function (quantityToAdd: number): Promise<void> {
  this.quantity += quantityToAdd;
  await this.save();
};

export const Sweet = mongoose.model<SweetDocument>('Sweet', sweetSchema);