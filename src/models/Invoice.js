import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const InvoiceSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  items: {
    type: [InvoiceItemSchema],
    required: true,
    validate: {
      validator: (items) => items.length > 0,
      message: 'Invoice must have at least one item',
    },
  },
  subTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'FINAL'],
    default: 'DRAFT',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for common queries
InvoiceSchema.index({ businessId: 1, status: 1, createdAt: -1 });
InvoiceSchema.index({ businessId: 1, customerId: 1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

