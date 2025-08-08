const express = require('express');
const { body, validationResult } = require('express-validator');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/purchases
// @desc    Get all purchases for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/purchases
// @desc    Create a new purchase
// @access  Private
router.post('/', [
  auth,
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('supplierName').trim().notEmpty().withMessage('Supplier name is required'),
  body('amountPaid').optional().isFloat({ min: 0 }).withMessage('Amount paid must be non-negative'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { productId, quantity, costPrice, supplierName, amountPaid = 0, dueDate } = req.body;

    // Find the product
    const product = await Product.findOne({ _id: productId, userId: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate purchase values
    const totalCost = quantity * costPrice;
    const amountDue = totalCost - amountPaid;
    
    let paymentStatus = 'unpaid';
    if (amountPaid >= totalCost) {
      paymentStatus = 'paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'partial';
    }

    // Create purchase record
    const purchase = new Purchase({
      userId: req.user._id,
      productId: product._id,
      productName: product.name,
      quantity,
      costPrice,
      totalCost,
      supplierName,
      amountPaid,
      amountDue: Math.max(0, amountDue),
      paymentStatus,
      dueDate: dueDate || undefined
    });

    await purchase.save();

    // Update product stock and cost price
    product.stock += quantity;
    product.costPrice = costPrice;
    await product.save();

    res.status(201).json(purchase);
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;