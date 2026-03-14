import mongoose, { Schema, Document } from 'mongoose'

export interface IProvider {
  provider: string
  providerId: string
}

export interface IUser extends Document {
  email: string
  name: string
  passwordHash?: string | null
  emailVerified?: Date | null
  image?: string | null
  providers: IProvider[]
  timezone: string
  isSuperAdmin: boolean
  passwordChangedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const ProviderSchema = new Schema<IProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false },
)

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    providers: {
      type: [ProviderSchema],
      default: [],
    },
    timezone: {
      type: String,
      default: 'Africa/Lagos',
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Index for fast email lookups (unique already creates one, but explicit is clearer)
UserSchema.index({ email: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
