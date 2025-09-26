import express, { Request, Response } from 'express';
import { Sweet } from '../models/Sweet';
import { AuthenticatedRequest } from '../types/Auth.types';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import mongoose from 'mongoose';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

// Input validation rules
const createSweetValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').isIn(['chocolate', 'candy', 'gum', 'lollipop', 'other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
];

const searchValidation = [
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
];

const purchaseValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const restockValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// Add new sweet
router.post('/', authenticateToken, requireAdmin, createSweetValidation, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, category, price, quantity, description, imageUrl } = req.body;

    const sweet = await Sweet.create({
      name,
      category,
      price,
      quantity,
      description,
      imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Sweet created successfully',
      data: sweet
    });
  } catch (error) {
    console.error('Error creating sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/sweets - View all available sweets (Protected)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Sweets retrieved successfully',
      data: sweets,
      count: sweets.length
    });
  } catch (error) {
    console.error('Error getting sweets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/sweets/search - Search sweets (Protected)
router.get('/search', authenticateToken, searchValidation, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, category, minPrice, maxPrice } = req.query;

    // Build search query
    const searchQuery: any = {};

    if (name) {
      searchQuery.name = { $regex: name, $options: 'i' };
    }

    if (category) {
      searchQuery.category = { $regex: category, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) {
        searchQuery.price.$gte = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        searchQuery.price.$lte = parseFloat(maxPrice as string);
      }
    }

    const sweets = await Sweet.find(searchQuery).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: sweets,
      count: sweets.length
    });
  } catch (error) {
    console.error('Error searching sweets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/sweets/:id - Update sweet details (Protected)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sweet ID format'
      });
    }

    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const sweet = await Sweet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sweet updated successfully',
      data: sweet
    });
  } catch (error) {
    console.error('Error updating sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/sweets/:id - Delete sweet (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sweet ID format'
      });
    }

    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sweet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/sweets/:id/purchase - Purchase sweet (Protected)
router.post('/:id/purchase', authenticateToken, purchaseValidation, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sweet ID format'
      });
    }

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }

    // Check if there's enough stock
    if (sweet.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Use the purchase method from Sweet model
    const result = await sweet.purchase(quantity);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Purchase successful',
      data: sweet
    });
  } catch (error) {
    console.error('Error purchasing sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/sweets/:id/restock - Restock sweet (Admin only)
router.post('/:id/restock', authenticateToken, requireAdmin, restockValidation, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sweet ID format'
      });
    }

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }

    // Use the restock method from Sweet model
    await sweet.restock(quantity);

    res.status(200).json({
      success: true,
      message: 'Restock successful',
      data: sweet
    });
  } catch (error) {
    console.error('Error restocking sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
