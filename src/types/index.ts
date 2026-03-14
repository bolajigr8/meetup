// ─── Auth ────────────────────────────────────────────────────────────────────

export type Provider = 'credentials' | 'google'

export interface LinkedProvider {
  provider: Provider
  providerId: string // OAuth subject id, or email for credentials
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export type OrgRole = 'admin' | 'member'
export type MemberStatus = 'pending' | 'active' | 'removed'

// ─── Entities ────────────────────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type MeetingStatus = 'scheduled' | 'cancelled' | 'completed'

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'overdue'

export type ProgramScheduleType = 'standard' | 'intensive'

// standard  → reminder windows: 14 days, 7 days, 2 days, 1 day, 2 hours before
// intensive → reminder windows: 3 days, 1 day, 2 hours before
export const REMINDER_WINDOWS: Record<ProgramScheduleType, string[]> = {
  standard: ['14days', '7days', '2days', '1day', '2hours'],
  intensive: ['3days', '1day', '2hours'],
}

// Shared reminder intervals for Meetings and Tasks
export const ENTITY_REMINDER_INTERVALS = ['2days', '1day', '2hours'] as const
export type ReminderInterval = (typeof ENTITY_REMINDER_INTERVALS)[number]

export type EntityType = 'meeting' | 'task' | 'program'

// ─── Session (what we embed in the JWT + expose to client) ───────────────────

export interface SessionUser {
  id: string
  email: string
  name: string
  image?: string | null
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }
}
