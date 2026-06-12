// src/app/api/v1/users/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import User from '@/models/User'

// GET /api/v1/users — admin only, returns id+name+email for dropdowns
export const GET = withErrorHandler(async () => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isAdmin && !session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Admin access required')

  await connectToDatabase()

  const users = await User.find({})
    .select('_id name email image')
    .sort({ name: 1 })
    .lean()

  return NextResponse.json({
    data: users.map((u) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: (u._id as any).toString(),
      name: u.name,
      email: u.email,
      image: u.image ?? null,
    })),
  })
})
