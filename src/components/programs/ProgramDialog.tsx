'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { GraduationCap, Pencil } from 'lucide-react'
import ProgramForm from './ProgramForm'
import type { Program } from './ProgramCard'
import type { ProgramFormData } from '@/validations/program'

interface ProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program?: Program
  onSuccess?: (data: ProgramFormData) => void
}

export default function ProgramDialog({
  open,
  onOpenChange,
  program,
  onSuccess,
}: ProgramDialogProps) {
  const isEdit = Boolean(program)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='w-full max-w-[95vw] sm:max-w-xl max-h-[92dvh] overflow-y-auto p-0 gap-0 rounded-2xl border'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <DialogHeader
          className='px-6 pt-6 pb-4 border-b'
          style={{ borderColor: 'var(--of-border)' }}
        >
          <div className='flex items-center gap-3'>
            <div
              className='flex items-center justify-center w-9 h-9 rounded-xl'
              style={{ background: '#CCFBF1' }}
            >
              {isEdit ? (
                <Pencil size={16} style={{ color: 'var(--of-teal)' }} />
              ) : (
                <GraduationCap size={18} style={{ color: 'var(--of-teal)' }} />
              )}
            </div>
            <div>
              <DialogTitle
                className='text-base font-semibold leading-tight'
                style={{ color: 'var(--of-heading)' }}
              >
                {isEdit ? 'Edit program' : 'Create a training program'}
              </DialogTitle>
              <DialogDescription
                className='text-xs mt-0.5'
                style={{ color: 'var(--of-muted)' }}
              >
                {isEdit
                  ? 'Update the details below and save your changes.'
                  : 'All dates and reminders are in West Africa Time (WAT, UTC+1)'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='px-6 py-5'>
          <ProgramForm
            initialData={program}
            onSuccess={(data) => {
              onOpenChange(false)
              onSuccess?.(data)
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
