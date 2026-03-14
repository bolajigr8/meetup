import { z } from 'zod'

export const createProgramSchema = z
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

    startDate: z
      .string({ message: 'Start date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),

    endDate: z
      .string({ message: 'End date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),

    scheduleType: z.enum(['standard', 'intensive']).default('standard'),

    participants: z
      .array(z.string().email('Each participant must be a valid email'))
      .default([]),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })

export type CreateProgramInput = z.infer<typeof createProgramSchema>

export const updateProgramSchema = z
  .object({
    title: z.string().min(3).max(100).trim().optional(),
    description: z.string().max(500).trim().nullable().optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    scheduleType: z.enum(['standard', 'intensive']).optional(),
    participants: z.array(z.string().email()).optional(),
    status: z.enum(['upcoming', 'active', 'completed', 'cancelled']).optional(),
  })
  .refine(
    (d) => {
      if (!d.startDate || !d.endDate) return true
      return d.endDate >= d.startDate
    },
    { message: 'End date must be on or after start date', path: ['endDate'] },
  )

export type UpdateProgramInput = z.infer<typeof updateProgramSchema>

export const listProgramsQuerySchema = z.object({
  status: z
    .enum(['upcoming', 'active', 'completed', 'cancelled', 'all'])
    .optional()
    .default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type ListProgramsQuery = z.infer<typeof listProgramsQuerySchema>
