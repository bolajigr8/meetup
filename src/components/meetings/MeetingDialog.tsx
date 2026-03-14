'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CalendarPlus, CalendarCog } from 'lucide-react'
import MeetingForm from './MeetingForm'
import type { Meeting } from './MeetingCard'
import type { MeetingFormData } from '@/validations/meeting'

interface MeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass a meeting to enter edit mode; omit for create mode */
  meeting?: Meeting
  onSuccess?: (data: MeetingFormData) => void
}

export default function MeetingDialog({
  open,
  onOpenChange,
  meeting,
  onSuccess,
}: MeetingDialogProps) {
  const isEdit = Boolean(meeting)

  const handleSuccess = (data: MeetingFormData) => {
    onOpenChange(false)
    onSuccess?.(data)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='
          w-full
          max-w-[95vw]
          sm:max-w-xl
          max-h-[92dvh]
          overflow-y-auto
          p-0
          gap-0
          rounded-2xl
          border
        '
        style={{ borderColor: 'var(--of-border)' }}
      >
        {/* Header */}
        <DialogHeader
          className='px-6 pt-6 pb-4 border-b'
          style={{ borderColor: 'var(--of-border)' }}
        >
          <div className='flex items-center gap-3'>
            <div
              className='flex items-center justify-center w-9 h-9 rounded-xl'
              style={{ background: 'var(--of-blue-light)' }}
            >
              {isEdit ? (
                <CalendarCog size={18} style={{ color: 'var(--of-blue)' }} />
              ) : (
                <CalendarPlus size={18} style={{ color: 'var(--of-blue)' }} />
              )}
            </div>
            <div>
              <DialogTitle
                className='text-base font-semibold leading-tight'
                style={{ color: 'var(--of-heading)' }}
              >
                {isEdit ? 'Edit meeting' : 'Schedule a meeting'}
              </DialogTitle>
              <DialogDescription
                className='text-xs mt-0.5'
                style={{ color: 'var(--of-muted)' }}
              >
                {isEdit
                  ? 'Update the details below and save your changes.'
                  : 'All times are in West Africa Time (WAT, UTC+1)'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <div className='px-6 py-5'>
          <MeetingForm
            initialData={meeting}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
