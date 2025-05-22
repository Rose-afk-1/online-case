import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  caseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'creditCard' | 'debitCard' | 'bankTransfer' | 'cash' | 'other' | 'razorpay';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
  description?: string;
  receiptUrl?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['creditCard', 'debitCard', 'bankTransfer', 'cash', 'other', 'razorpay'],
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a transaction ID if not provided
PaymentSchema.pre('save', function (next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = 'TXN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment; 