'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { TriangleAlert } from 'lucide-react'
import type { Meeting } from './MeetingCard'

interface DeleteMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting
  onConfirm: (id: string) => void
}

export default function DeleteMeetingDialog({
  open,
  onOpenChange,
  meeting,
  onConfirm,
}: DeleteMeetingDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!meeting) return
    setLoading(true)
    // TODO: DELETE /api/v1/meetings/:id
    await new Promise((r) => setTimeout(r, 500))
    setLoading(false)
    onConfirm(meeting.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className='max-w-[92vw] sm:max-w-md rounded-2xl p-0 gap-0 border'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <AlertDialogHeader className='px-6 pt-6 pb-4'>
          <div className='flex items-start gap-4'>
            <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 shrink-0 mt-0.5'>
              <TriangleAlert size={18} className='text-red-600' />
            </div>
            <div>
              <AlertDialogTitle
                className='text-base font-semibold leading-tight'
                style={{ color: 'var(--of-heading)' }}
              >
                Cancel this meeting?
              </AlertDialogTitle>
              <AlertDialogDescription
                className='text-sm mt-1.5 leading-relaxed'
                style={{ color: 'var(--of-muted)' }}
              >
                You&apos;re about to cancel{' '}
                <span
                  className='font-medium'
                  style={{ color: 'var(--of-body)' }}
                >
                  &ldquo;{meeting?.title}&rdquo;
                </span>
                . All participants will be notified. This action cannot be
                undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter
          className='px-6 py-4 border-t flex-row gap-2 justify-end'
          style={{ borderColor: 'var(--of-border)' }}
        >
          <AlertDialogCancel disabled={loading} className='mt-0 h-9 text-sm'>
            Keep meeting
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className='h-9 text-sm bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
          >
            {loading ? 'Cancelling...' : 'Yes, cancel it'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
