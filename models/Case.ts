import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  caseNumber: string;
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'inProgress' | 'completed' | 'closed';
  caseType: 'civil' | 'criminal' | 'family' | 'commercial' | 'cybercrime' | 'constitutional' | 'administrative' | 'tax' | 'consumer' | 'election' | 'special' | 'other';
  filingDate: Date;
  plaintiffs: string;
  defendants: string;
  approvalDate?: Date;
  completionDate?: Date;
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'failed';
  paymentId?: mongoose.Types.ObjectId;
  filingFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema = new Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a case title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a case description'],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    plaintiffs: {
      type: String,
      required: [true, 'Please provide plaintiffs information'],
      trim: true,
    },
    defendants: {
      type: String,
      required: [true, 'Please provide defendants information'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'inProgress', 'completed', 'closed'],
      default: 'pending',
    },
    caseType: {
      type: String,
      enum: ['civil', 'criminal', 'family', 'commercial', 'cybercrime', 'constitutional', 'administrative', 'tax', 'consumer', 'election', 'special', 'other'],
      required: [true, 'Please specify the case type'],
    },
    filingDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
    filingFee: {
      type: Number,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'failed'],
      default: 'unpaid',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique case number before saving
CaseSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.models.Case.countDocuments();
    const year = new Date().getFullYear();
    const caseNumber = `CASE-${year}-${(count + 1).toString().padStart(5, '0')}`;
    this.caseNumber = caseNumber;
  }
  next();
});

const Case = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);

export default Case; 