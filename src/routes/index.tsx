import { isAuthenticated } from '#/features/auth/session'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: '/dashboard' })
    }

    throw redirect({ to: '/login' })
  },
  component: RootRedirect,
})

function RootRedirect() {
  return null
}
