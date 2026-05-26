import { refreshToken } from '#/features/auth/api/auth-api'
import { isAuthenticated, setAuthSession } from '#/features/auth/session'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({ to: '/dashboard' })
    }

    try {
      const response = await refreshToken()
      if (response.data?.user) {
        setAuthSession({
          tokenType: response.data.token_type,
          expiresIn: response.data.expires_in,
          user: response.data.user,
        })
        throw redirect({ to: '/dashboard' })
      }
    } catch {
      // ignore and show auth pages
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
