import mongoose, { Schema, Document, Types } from 'mongoose'

export type ReminderType = '1day' | '2hr' | '30min'

export interface IReminderLog extends Document {
  entityId: Types.ObjectId
  entityType: 'meeting' | 'task' | 'program'
  reminderType: ReminderType
  userId: Types.ObjectId
  sentAt: Date
}

const ReminderLogSchema = new Schema<IReminderLog>({
  entityId: { type: Schema.Types.ObjectId, required: true },
  entityType: {
    type: String,
    enum: ['meeting', 'task', 'program'],
    required: true,
  },
  reminderType: {
    type: String,
    enum: ['1day', '2hr', '30min'],
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sentAt: { type: Date, default: Date.now },
})

// One reminder per entity per type — prevents duplicate sends across cron runs
ReminderLogSchema.index({ entityId: 1, reminderType: 1 }, { unique: true })

export default mongoose.models.ReminderLog ||
  mongoose.model<IReminderLog>('ReminderLog', ReminderLogSchema)
