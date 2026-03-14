import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'])

import mongoose from 'mongoose'

type CachedConnection = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

let cachedConnection: CachedConnection = { conn: null, promise: null }

const isDev = process.env.NODE_ENV !== 'production'

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from environment variables')
  }
  if (!process.env.MONGODB_DB_NAME) {
    throw new Error('MONGODB_DB_NAME is missing from environment variables')
  }

  if (cachedConnection.conn) {
    if (isDev) console.log('✅ Using existing MongoDB connection')
    return cachedConnection.conn
  }

  if (!cachedConnection.promise) {
    if (isDev) console.log('🔄 Establishing new MongoDB connection...')

    cachedConnection.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        dbName: process.env.MONGODB_DB_NAME,
      })
      .then((m) => {
        if (isDev) console.log(`✅ Connected to database: ${process.env.MONGODB_DB_NAME}`)
        return m
      })
      .catch((error) => {
        if (isDev) console.error('❌ MongoDB connection error:', error)
        cachedConnection.promise = null
        throw error
      })
  } else {
    if (isDev) console.log('⏳ Reusing connection promise...')
  }

  try {
    cachedConnection.conn = await cachedConnection.promise
    return cachedConnection.conn
  } catch {
    throw new Error('Database connection failed')
  }
}

mongoose.connection.on('error', (error) => {
  if (isDev) console.error('❌ MongoDB connection error:', error)
})

mongoose.connection.on('disconnected', () => {
  if (isDev) console.log('🔌 MongoDB disconnected')
  cachedConnection = { conn: null, promise: null }
})

process.on('SIGTERM', async () => {
  await mongoose.connection.close()
  if (isDev) console.log('MongoDB connection closed on SIGTERM')
})

export default connectToDatabase
