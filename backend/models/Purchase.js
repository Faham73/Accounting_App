const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  totalCost: {
    type: Number,
    required: true
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount paid cannot be negative']
  },
  amountDue: {
    type: Number,
    required: true,
    min: [0, 'Amount due cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'unpaid'
  },
  dueDate: {
    type: Date
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Purchase', purchaseSchema);