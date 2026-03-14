import { z } from 'zod'

export const createTaskSchema = z.object({
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

  dueDate: z
    .string({ message: 'Due date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),

  priority: z.enum(['low', 'medium', 'high']).default('medium'),

  category: z.string().max(50).trim().optional(),

  assignedTo: z
    .string()
    .email('assignedTo must be a valid email')
    .optional()
    .or(z.literal('')),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(100).trim().optional(),
  description: z.string().max(500).trim().nullable().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'overdue']).optional(),
  category: z.string().max(50).trim().nullable().optional(),
  assignedTo: z.string().email().nullable().optional().or(z.literal('')),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const listTasksQuerySchema = z.object({
  status: z
    .enum(['todo', 'in_progress', 'completed', 'overdue', 'all'])
    .optional()
    .default('all'),
  priority: z.enum(['low', 'medium', 'high', 'all']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>
