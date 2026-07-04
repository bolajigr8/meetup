import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPushSubscription extends Document {
  userId: Types.ObjectId
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: undefined },
  },
  { timestamps: true },
)

// Fast lookup of all devices belonging to a user
PushSubscriptionSchema.index({ userId: 1 })

export default mongoose.models.PushSubscription ||
  mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema)
