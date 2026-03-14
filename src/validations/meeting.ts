import { z } from 'zod'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function isDateInPast(dateStr: string): boolean {
  const selected = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selected < today
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const meetingSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Meeting title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be under 100 characters')
      .trim(),

    description: z
      .string()
      .max(500, 'Description must be under 500 characters')
      .optional()
      .or(z.literal('')),

    date: z
      .string()
      .min(1, 'Date is required')
      .refine((d) => !isDateInPast(d), {
        message: 'Date cannot be in the past',
      }),

    startTime: z.string().min(1, 'Start time is required'),

    endTime: z.string().min(1, 'End time is required'),

    location: z
      .string()
      .max(200, 'Location must be under 200 characters')
      .optional()
      .or(z.literal('')),

    participants: z.array(z.string().email('Invalid participant email')),

    priority: z.enum(['low', 'medium', 'high']),
  })
  .refine(
    (data) =>
      !data.startTime ||
      !data.endTime ||
      toMinutes(data.endTime) > toMinutes(data.startTime),
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  )

// ─── Types ────────────────────────────────────────────────────────────────────

export type MeetingFormData = z.infer<typeof meetingSchema>

export type FieldErrors = Partial<Record<keyof MeetingFormData, string>>

export const MEETING_FORM_INITIAL: MeetingFormData = {
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  participants: [],
  priority: 'medium',
}

// ─── Form-level validation ─────────────────────────────────────────────────────

/**
 * Returns a flat map of field → first error message.
 * Compatible with the existing FieldErrors type used in MeetingForm.
 */
export function validateMeetingForm(data: MeetingFormData): FieldErrors {
  const result = meetingSchema.safeParse(data)
  if (result.success) return {}

  return result.error.issues.reduce<FieldErrors>((acc, issue) => {
    const field = issue.path[0] as keyof MeetingFormData
    // Keep only the first error per field
    if (field && !acc[field]) acc[field] = issue.message
    return acc
  }, {})
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

// ─── Participant email (inline, before adding to the list) ────────────────────

const participantEmailSchema = z.string().email('Enter a valid email address')

export function validateParticipantEmail(
  email: string,
  existing: string[],
): string | undefined {
  if (!email.trim()) return undefined

  const result = participantEmailSchema.safeParse(email.trim())
  if (!result.success) return result.error.issues[0].message

  if (existing.includes(email.trim().toLowerCase())) return 'Already added'

  return undefined
}
