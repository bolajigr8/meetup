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
import { Loader2, TriangleAlert } from 'lucide-react'
import type { Program } from './ProgramCard'

interface DeleteProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program?: Program
  onConfirm: (id: string) => void
}

export default function DeleteProgramDialog({
  open,
  onOpenChange,
  program,
  onConfirm,
}: DeleteProgramDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!program) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    setLoading(false)
    onConfirm(program.id)
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
                Cancel this program?
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
                  &ldquo;{program?.title}&rdquo;
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
            Keep program
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className='h-9 text-sm bg-red-600 hover:bg-red-700 text-white min-w-32 flex items-center gap-1.5 justify-center'
          >
            {loading && <Loader2 size={13} className='animate-spin' />}
            {loading ? 'Cancelling...' : 'Yes, cancel it'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
