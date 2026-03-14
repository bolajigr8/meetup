import { z } from 'zod'

function isDateInPast(dateStr: string): boolean {
  const selected = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selected < today
}

export const TASK_CATEGORIES = [
  'General',
  'Admin',
  'Planning',
  'Communication',
  'Research',
  'Design',
  'Engineering',
  'Finance',
  'HR',
] as const

export const taskSchema = z.object({
  title: z
    .string({ message: 'Task title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be under 100 characters')
    .trim(),

  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .or(z.literal('')),

  dueDate: z
    .string({ message: 'Due date is required' })
    .min(1, 'Due date is required')
    .refine((d) => !isDateInPast(d), {
      message: 'Due date cannot be in the past',
    }),

  priority: z.enum(['low', 'medium', 'high']).default('medium'),

  category: z
    .string()
    .max(50, 'Category must be under 50 characters')
    .optional()
    .or(z.literal('')),

  assignedTo: z
    .string()
    .email('Assigned-to must be a valid email')
    .optional()
    .or(z.literal('')),
})

export type TaskFormData = z.infer<typeof taskSchema>

export type TaskFieldErrors = Partial<Record<keyof TaskFormData, string>>

export const TASK_FORM_INITIAL: TaskFormData = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  category: 'General',
  assignedTo: '',
}

export function validateTaskForm(data: TaskFormData): TaskFieldErrors {
  const result = taskSchema.safeParse(data)
  if (result.success) return {}
  return result.error.issues.reduce<TaskFieldErrors>((acc, issue) => {
    const field = issue.path[0] as keyof TaskFormData
    if (field && !acc[field]) acc[field] = issue.message
    return acc
  }, {})
}

export function hasTaskErrors(errors: TaskFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
