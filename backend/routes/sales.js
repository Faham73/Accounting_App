const express = require('express');
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sales
// @desc    Get all sales for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sales
// @desc    Create a new sale
// @access  Private
router.post('/', [
  auth,
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customerName').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { productId, quantity, customerName } = req.body;

    // Find the product
    const product = await Product.findOne({ _id: productId, userId: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock availability
    if (quantity > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Calculate sale values
    const totalRevenue = quantity * product.sellingPrice;
    const totalCost = quantity * product.costPrice;
    const profit = totalRevenue - totalCost;

    // Create sale record
    const sale = new Sale({
      userId: req.user._id,
      productId: product._id,
      productName: product.name,
      quantity,
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      totalRevenue,
      totalCost,
      profit,
      customerName: customerName || undefined
    });

    await sale.save();

    // Update product stock
    product.stock -= quantity;
    await product.save();

    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;