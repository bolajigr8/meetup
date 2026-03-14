import { redirect } from 'next/navigation'

/**
 * /meetings/new is no longer a standalone form page.
 * The "New meeting" dialog is now triggered from the meetings list.
 * Redirect any direct navigation here back to /meetings.
 */
export default function NewMeetingPage() {
  redirect('/meetings')
}
