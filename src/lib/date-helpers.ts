// src/lib/date-helpers.ts
// Client-side helpers to determine whether a meeting/task/program is "past."
// These mirror the WAT (UTC+1) convention already used server-side in the
// cron job, but run entirely on the client so the UI reacts instantly even
// if the cron hasn't ticked yet — e.g. a meeting whose end time has technically
// elapsed but whose status field hasn't been flipped to "completed" yet.

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Current date/time in West Africa Time (UTC+1), computed client-side. */
export function nowWAT(): Date {
  return new Date(Date.now() + 60 * 60 * 1000)
}

/** Today's date as a "YYYY-MM-DD" string, in WAT. */
export function todayWATString(): string {
  const n = nowWAT()
  return `${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}-${pad(n.getUTCDate())}`
}

/** Current time as "HH:MM", in WAT — directly comparable to stored time strings. */
export function currentTimeWATString(): string {
  const n = nowWAT()
  return `${pad(n.getUTCHours())}:${pad(n.getUTCMinutes())}`
}

interface MeetingLike {
  date: string
  endTime: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

export function isMeetingPast(meeting: MeetingLike): boolean {
  if (meeting.status === 'completed' || meeting.status === 'cancelled')
    return true
  const today = todayWATString()
  if (meeting.date < today) return true
  if (meeting.date === today && meeting.endTime <= currentTimeWATString())
    return true
  return false
}

interface TaskLike {
  dueDate: string
  status: 'todo' | 'in_progress' | 'completed' | 'overdue'
}

/**
 * A task only moves to "Past" once it's been completed AND its due date
 * has already gone by. Unfinished tasks — including ones marked "overdue" —
 * stay in the active view since they're still actionable; overdue is a
 * warning state, not an archive state.
 */
export function isTaskPast(task: TaskLike): boolean {
  return task.status === 'completed' && task.dueDate < todayWATString()
}

interface ProgramLike {
  endDate: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
}

export function isProgramPast(program: ProgramLike): boolean {
  if (program.status === 'completed' || program.status === 'cancelled')
    return true
  return program.endDate < todayWATString()
}
