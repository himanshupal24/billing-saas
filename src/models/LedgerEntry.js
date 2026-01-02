import mongoose from 'mongoose';

const LedgerEntrySchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  reference: {
    type: String,
    trim: true,
  },
  relatedInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for ledger queries
LedgerEntrySchema.index({ businessId: 1, customerId: 1, date: -1 });
LedgerEntrySchema.index({ businessId: 1, date: -1 });

export default mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', LedgerEntrySchema);

