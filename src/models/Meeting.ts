// src/models/Meeting.ts
import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IMeeting extends Document {
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  participants: string[]
  assignedTo: Types.ObjectId[]
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
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
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
    assignedTo: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
  { timestamps: true },
)

MeetingSchema.index({ createdBy: 1, status: 1 })
MeetingSchema.index({ createdBy: 1, date: 1 })
MeetingSchema.index({ assignedTo: 1 })

export default mongoose.models.Meeting ||
  mongoose.model<IMeeting>('Meeting', MeetingSchema)
