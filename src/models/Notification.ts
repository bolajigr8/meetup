import mongoose, { Schema, Document, Types } from 'mongoose'

export type NotificationType =
  | 'meeting_reminder'
  | 'task_overdue'
  | 'task_due_soon'
  | 'program_start'
  | 'program_end'

export interface INotification extends Document {
  userId: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  entityId?: Types.ObjectId
  entityType?: 'meeting' | 'task' | 'program'
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'meeting_reminder',
        'task_overdue',
        'task_due_soon',
        'program_start',
        'program_end',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId, default: undefined },
    entityType: {
      type: String,
      enum: ['meeting', 'task', 'program'],
      default: undefined,
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
)

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema)
