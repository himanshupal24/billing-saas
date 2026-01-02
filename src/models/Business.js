import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
  },
  logo: {
    type: String,
    default: null,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
  },
  taxType: {
    type: String,
    enum: ['GST', 'VAT', 'NONE'],
    default: 'NONE',
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);

