import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IFcmToken extends Document {
  userId: Types.ObjectId
  token: string
  createdAt: Date
  updatedAt: Date
}

const FcmTokenSchema = new Schema<IFcmToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

FcmTokenSchema.index({ userId: 1 })

export default mongoose.models.FcmToken ||
  mongoose.model<IFcmToken>('FcmToken', FcmTokenSchema)
