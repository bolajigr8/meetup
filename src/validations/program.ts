import { z } from 'zod'

function isDateInPast(dateStr: string): boolean {
  const selected = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selected < today
}

export const programSchema = z
  .object({
    title: z
      .string({ message: 'Program title is required' })
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be under 100 characters')
      .trim(),

    description: z
      .string()
      .max(500, 'Description must be under 500 characters')
      .optional()
      .or(z.literal('')),

    startDate: z
      .string({ message: 'Start date is required' })
      .min(1, 'Start date is required')
      .refine((d) => !isDateInPast(d), {
        message: 'Start date cannot be in the past',
      }),

    endDate: z
      .string({ message: 'End date is required' })
      .min(1, 'End date is required'),

    scheduleType: z.enum(['standard', 'intensive']).default('standard'),

    participants: z
      .array(z.string().email('Each participant must be a valid email'))
      .default([]),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })

export type ProgramFormData = z.infer<typeof programSchema>

export type ProgramFieldErrors = Partial<Record<keyof ProgramFormData, string>>

export const PROGRAM_FORM_INITIAL: ProgramFormData = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  scheduleType: 'standard',
  participants: [],
}

export function validateProgramForm(data: ProgramFormData): ProgramFieldErrors {
  const result = programSchema.safeParse(data)
  if (result.success) return {}
  return result.error.issues.reduce<ProgramFieldErrors>((acc, issue) => {
    const field = issue.path[0] as keyof ProgramFormData
    if (field && !acc[field]) acc[field] = issue.message
    return acc
  }, {})
}

export function hasProgramErrors(errors: ProgramFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

const emailSchema = z.string().email('Enter a valid email address')

export function validateProgramParticipantEmail(
  email: string,
  existing: string[],
): string | undefined {
  if (!email.trim()) return undefined
  const result = emailSchema.safeParse(email.trim())
  if (!result.success) return result.error.issues[0].message
  if (existing.includes(email.trim().toLowerCase())) return 'Already added'
  return undefined
}
