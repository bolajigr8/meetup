import mongoose, { Schema, Document } from 'mongoose'

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId
  tokenHash: string
  tokenSHA: string
  expiresAt: Date
  usedAt?: Date | null
  createdAt: Date
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    tokenSHA: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// TTL index — MongoDB auto-deletes expired tokens
// Note: TTL cleanup runs every ~60 seconds, so always check expiresAt manually too
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Fast lookup by userId to invalidate old tokens on new request
PasswordResetTokenSchema.index({ userId: 1 })

// Indexed lookup by SHA-256 digest — used in reset-password to find the token
// directly instead of scanning all valid tokens and bcrypt-comparing each one
PasswordResetTokenSchema.index({ tokenSHA: 1 })

export default mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>(
    'PasswordResetToken',
    PasswordResetTokenSchema,
  )
