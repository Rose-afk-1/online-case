import mongoose, { Schema, Document } from 'mongoose';

export interface IHearing extends Document {
  caseId: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  location: string;
  judge?: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  attendees?: mongoose.Types.ObjectId[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HearingSchema: Schema = new Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Hearing title is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Hearing date is required'],
    },
    time: {
      type: String,
      required: [true, 'Hearing time is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Hearing duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    location: {
      type: String,
      required: [true, 'Hearing location is required'],
      trim: true,
    },
    judge: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'postponed', 'cancelled'],
      default: 'scheduled',
    },
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Hearing = mongoose.models.Hearing || mongoose.model<IHearing>('Hearing', HearingSchema);

export default Hearing; 