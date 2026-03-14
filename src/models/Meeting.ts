import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IMeeting extends Document {
  title: string
  description?: string
  date: string // ISO date string  e.g. "2025-09-16"
  startTime: string // HH:mm            e.g. "14:00"
  endTime: string // HH:mm            e.g. "15:30"
  location?: string
  participants: string[]
  priority: 'low' | 'medium' | 'high'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MeetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: undefined,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
      default: undefined,
    },
    participants: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for common query patterns
MeetingSchema.index({ createdBy: 1, status: 1 })
MeetingSchema.index({ createdBy: 1, date: 1 })

export default mongoose.models.Meeting ||
  mongoose.model<IMeeting>('Meeting', MeetingSchema)
