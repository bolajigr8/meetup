import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProgram extends Document {
  title: string
  description?: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  participants: string[]
  scheduleType: 'standard' | 'intensive'
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ProgramSchema = new Schema<IProgram>(
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
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    participants: { type: [String], default: [] },
    scheduleType: {
      type: String,
      enum: ['standard', 'intensive'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

ProgramSchema.index({ createdBy: 1, status: 1 })
ProgramSchema.index({ createdBy: 1, startDate: 1 })

export default mongoose.models.Program ||
  mongoose.model<IProgram>('Program', ProgramSchema)
