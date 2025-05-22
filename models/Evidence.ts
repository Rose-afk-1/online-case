import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  caseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  tags?: string[];
  evidenceType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema: Schema = new Schema(
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
    title: {
      type: String,
      required: [true, 'Evidence title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    evidenceType: {
      type: String,
      enum: ['document', 'image', 'video', 'audio', 'financial', 'medical', 'correspondence', 'receipt', 'contract', 'other'],
      default: 'document',
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

const Evidence = mongoose.models.Evidence || mongoose.model<IEvidence>('Evidence', EvidenceSchema);

export default Evidence; 