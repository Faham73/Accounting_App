const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('category').trim().notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const productData = {
      ...req.body,
      userId: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists for this user' });
    }
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', [
  auth,
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('category').trim().notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists for this user' });
    }
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;