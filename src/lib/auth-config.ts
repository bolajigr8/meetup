// src/lib/auth-config.ts
export const publicRoutes = ['/']

export const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/link-account',
]

export const apiAuthPrefix = '/api/auth'
export const apiV1AuthPrefix = '/api/v1/auth'

export const DEFAULT_LOGIN_REDIRECT = '/overview'
