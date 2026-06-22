import { useQuery } from '@tanstack/react-query'
import { Loader2, LogOut } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { getMe, meQueryKey } from '#/features/auth/api/auth-api'
import { getAuthSession } from '#/features/auth/session'
import { useLogout } from '#/features/auth/hooks/use-logout'
import { ProfileForm } from '#/features/settings/components/profile-form'
import { ChangePasswordForm } from '#/features/settings/components/change-password-form'

export function AccountSettings() {
  const logoutMutation = useLogout()
  const sessionUser = getAuthSession()?.user

  const { data, isLoading, isError, error } = useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader2 className="text-primary size-8 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading profile...</span>
      </div>
    )
  }

  // Fall back to the cached session if /me fails, so the page stays usable.
  const user = data?.data?.user ?? sessionUser

  if (isError && !user) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex h-64 flex-col items-center justify-center gap-2 border p-4">
        <span className="font-semibold">Failed to load profile</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      </div>
    )
  }

  const username = user?.username ?? ''
  const email = user?.email ?? ''
  const role = user?.role ?? ''

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="border-primary border">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your account information.</CardDescription>
            </div>
            {role ? (
              <Badge variant="secondary" className="capitalize">
                {role}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm defaultUsername={username} defaultEmail={email} />
        </CardContent>
      </Card>

      <Card className="border-primary border">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Use at least 8 characters with letters and numbers. You will stay signed in on this
            device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="size-4" />
          {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
        </Button>
      </div>
    </div>
  )
}
