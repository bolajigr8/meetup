import { z } from 'zod'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// ─── Create ───────────────────────────────────────────────────────────────────

export const createMeetingSchema = z
  .object({
    title: z
      .string({ message: 'Title is required' })
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be under 100 characters')
      .trim(),

    description: z
      .string()
      .max(500, 'Description must be under 500 characters')
      .trim()
      .optional(),

    date: z
      .string({ message: 'Date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

    startTime: z
      .string({ message: 'Start time is required' })
      .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format'),

    endTime: z
      .string({ message: 'End time is required' })
      .regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format'),

    location: z
      .string()
      .max(200, 'Location must be under 200 characters')
      .trim()
      .optional(),

    participants: z
      .array(z.string().email('Each participant must be a valid email'))
      .default([]),

    priority: z.enum(['low', 'medium', 'high']).default('medium'),
  })
  .refine((d) => toMinutes(d.endTime) > toMinutes(d.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>

// ─── Update (all fields optional) ────────────────────────────────────────────

export const updateMeetingSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be under 100 characters')
      .trim()
      .optional(),

    description: z
      .string()
      .max(500, 'Description must be under 500 characters')
      .trim()
      .nullable()
      .optional(),

    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),

    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format')
      .optional(),

    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format')
      .optional(),

    location: z
      .string()
      .max(200, 'Location must be under 200 characters')
      .trim()
      .nullable()
      .optional(),

    participants: z
      .array(z.string().email('Each participant must be a valid email'))
      .optional(),

    priority: z.enum(['low', 'medium', 'high']).optional(),

    status: z
      .enum(['upcoming', 'ongoing', 'completed', 'cancelled'])
      .optional(),
  })
  .refine(
    (d) => {
      if (!d.startTime || !d.endTime) return true
      return toMinutes(d.endTime) > toMinutes(d.startTime)
    },
    { message: 'End time must be after start time', path: ['endTime'] },
  )

export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>

// ─── List query params ────────────────────────────────────────────────────────

export const listMeetingsQuerySchema = z.object({
  status: z
    .enum(['upcoming', 'ongoing', 'completed', 'cancelled', 'all'])
    .optional()
    .default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type ListMeetingsQuery = z.infer<typeof listMeetingsQuerySchema>
