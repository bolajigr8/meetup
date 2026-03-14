import mongoose, { Schema, Document, Types } from 'mongoose'

export interface INotificationPrefs {
  meetingReminder2Days: boolean
  meetingReminder1Day: boolean
  meetingReminder2Hours: boolean
  taskOverdueAlert: boolean
  taskDueSoon: boolean
  programStartReminder: boolean
}

export interface IUserSettings extends Document {
  userId: Types.ObjectId
  notificationPrefs: INotificationPrefs
  updatedAt: Date
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notificationPrefs: {
      meetingReminder2Days: { type: Boolean, default: true },
      meetingReminder1Day: { type: Boolean, default: true },
      meetingReminder2Hours: { type: Boolean, default: true },
      taskOverdueAlert: { type: Boolean, default: true },
      taskDueSoon: { type: Boolean, default: true },
      programStartReminder: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
)

export default mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema)
