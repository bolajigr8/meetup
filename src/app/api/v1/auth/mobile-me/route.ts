import { NextResponse } from 'next/server'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { verifyMobileToken } from '@/lib/mobile-auth'

export const GET = withErrorHandler(async (req) => {
  const user = await verifyMobileToken(req.headers.get('authorization'))
  if (!user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token')
  }
  return NextResponse.json({ user })
})
