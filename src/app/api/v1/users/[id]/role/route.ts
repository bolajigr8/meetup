// src/app/api/v1/users/[id]/role/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { z } from 'zod'
import User from '@/models/User'

const roleSchema = z.object({
  isAdmin: z.boolean(),
})

export const PATCH = withErrorHandler(async (req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Super-admin access required')

  const { id } = await ctx.params
  if (!id || id === 'undefined')
    throw new ApiError(400, 'BAD_REQUEST', 'User ID is required')

  const body = await req.json()
  const parsed = roleSchema.safeParse(body)
  if (!parsed.success)
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body')

  await connectToDatabase()

  const user = await User.findById(id)
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found')

  // Prevent demoting yourself
  if (id === session.user.id)
    throw new ApiError(400, 'BAD_REQUEST', 'You cannot change your own role')

  await User.findByIdAndUpdate(id, { $set: { isAdmin: parsed.data.isAdmin } })

  return NextResponse.json({
    message: `User ${parsed.data.isAdmin ? 'promoted to admin' : 'demoted to regular user'} successfully`,
  })
})
