const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments
// @desc    Create a new payment
// @access  Private
router.post('/', [
  auth,
  body('purchaseId').notEmpty().withMessage('Purchase ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(['cash', 'check', 'bank_transfer', 'credit_card', 'other']).withMessage('Invalid payment method'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { purchaseId, amount, paymentMethod, notes } = req.body;

    // Find the purchase
    const purchase = await Purchase.findOne({ _id: purchaseId, userId: req.user._id });
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Validate payment amount
    if (amount > purchase.amountDue) {
      return res.status(400).json({ message: 'Payment amount exceeds amount due' });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.user._id,
      purchaseId: purchase._id,
      amount,
      paymentMethod,
      notes: notes || undefined
    });

    await payment.save();

    // Update purchase payment status
    const updatedAmountPaid = purchase.amountPaid + amount;
    const updatedAmountDue = purchase.totalCost - updatedAmountPaid;
    
    let newPaymentStatus = 'unpaid';
    if (updatedAmountDue <= 0) {
      newPaymentStatus = 'paid';
    } else if (updatedAmountPaid > 0) {
      newPaymentStatus = 'partial';
    }

    purchase.amountPaid = updatedAmountPaid;
    purchase.amountDue = Math.max(0, updatedAmountDue);
    purchase.paymentStatus = newPaymentStatus;
    await purchase.save();

    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;