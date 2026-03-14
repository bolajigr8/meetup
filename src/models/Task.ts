import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ITask extends Document {
  title: string
  description?: string
  dueDate: string // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed' | 'overdue'
  category?: string
  assignedTo?: string
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
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
    dueDate: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed', 'overdue'],
      default: 'todo',
    },
    category: { type: String, trim: true, maxlength: 50, default: undefined },
    assignedTo: { type: String, trim: true, default: undefined },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

TaskSchema.index({ createdBy: 1, status: 1 })
TaskSchema.index({ createdBy: 1, dueDate: 1 })
TaskSchema.index({ createdBy: 1, priority: 1 })

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
