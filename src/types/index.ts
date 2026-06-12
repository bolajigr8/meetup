// src/types/index.ts
export type Provider = 'credentials' | 'google'

export interface LinkedProvider {
  provider: Provider
  providerId: string
}

export type OrgRole = 'admin' | 'member'
export type MemberStatus = 'pending' | 'active' | 'removed'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type MeetingStatus = 'scheduled' | 'cancelled' | 'completed'
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'overdue'
export type ProgramScheduleType = 'standard' | 'intensive'

export const REMINDER_WINDOWS: Record<ProgramScheduleType, string[]> = {
  standard: ['14days', '7days', '2days', '1day', '2hours'],
  intensive: ['3days', '1day', '2hours'],
}

export const ENTITY_REMINDER_INTERVALS = ['2days', '1day', '2hours'] as const
export type ReminderInterval = (typeof ENTITY_REMINDER_INTERVALS)[number]

export type EntityType = 'meeting' | 'task' | 'program'

export interface SessionUser {
  id: string
  email: string
  name: string
  image?: string | null
  isAdmin: boolean
  isSuperAdmin: boolean
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }
}
