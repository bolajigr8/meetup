import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details: unknown[] = [],
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function errorResponse(error: ApiError) {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    },
    { status: error.statusCode },
  )
}

type RouteHandler = (
  req: Request,
  ctx: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      if (err instanceof ApiError) return errorResponse(err)
      console.error('Unhandled error:', err)
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            details: [],
          },
        },
        { status: 500 },
      )
    }
  }
}
