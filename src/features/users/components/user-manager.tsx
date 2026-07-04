import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Ellipsis, KeyRound, Loader2, Plus, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import {
  deleteUser,
  getUsers,
  resetUserPassword,
  updateUserRole,
  usersQueryKey,
} from '#/features/users/api/users-api'
import type { ManagedUser, ResetPasswordPayload, UpdateRolePayload } from '#/features/users/types'
import { getErrorMessage, type HttpError } from '#/types/http'
import { getAuthSession } from '#/features/auth/session'
import { ConfirmDeleteDialog } from '#/features/llm/components/confirm-delete-dialog'
import { ResetPasswordDialog } from '#/features/users/components/reset-password-dialog'
import { CreateUserDialog } from '#/features/users/components/create-user-dialog'

export function UserManager() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null)

  // Current admin's id, used to disable self-actions (backend blocks them too).
  const currentUserId = String(getAuthSession()?.user.id ?? '')

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: usersQueryKey,
    queryFn: getUsers,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: usersQueryKey })
  }

  const onError = (err: HttpError) => {
    toast.error(getErrorMessage(err.data, err.message))
  }

  const roleMutation = useMutation<
    ManagedUser | null,
    HttpError,
    { id: string; payload: UpdateRolePayload }
  >({
    mutationFn: ({ id, payload }) => updateUserRole(id, payload),
    onSuccess: () => {
      invalidate()
      toast.success('Role updated')
    },
    onError,
  })

  const resetMutation = useMutation<void, HttpError, { id: string; payload: ResetPasswordPayload }>(
    {
      mutationFn: ({ id, payload }) => resetUserPassword(id, payload),
      onSuccess: () => {
        setResetTarget(null)
        toast.success('Password reset')
      },
      onError,
    }
  )

  const deleteMutation = useMutation<void, HttpError, string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
      toast.success('User deleted')
    },
    onError,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader2 className="text-primary size-8 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading users...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex h-64 flex-col items-center justify-center gap-2 border p-4">
        <span className="font-semibold">Failed to Load Users</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      </div>
    )
  }

  return (
    <Card className="border-primary border">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <p className="text-muted-foreground mt-1 text-xs">
            Manage user roles, reset passwords, and remove accounts.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center text-xs">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isSelf = String(user.id) === currentUserId
                  const isAdmin = user.role === 'admin'
                  const nextRole: UpdateRolePayload = {
                    role: isAdmin ? 'pentester' : 'admin',
                  }
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-xs">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={isAdmin ? 'default' : 'outline'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(user.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground h-7 w-7"
                              aria-label={`Actions for ${user.username}`}
                            >
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              className="gap-2 text-xs"
                              disabled={isSelf}
                              onClick={() =>
                                roleMutation.mutate({ id: user.id, payload: nextRole })
                              }
                            >
                              {isAdmin ? (
                                <ShieldOff className="text-muted-foreground size-3.5" />
                              ) : (
                                <ShieldCheck className="text-muted-foreground size-3.5" />
                              )}
                              {isAdmin ? 'Make Pentester' : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-xs"
                              onClick={() => setResetTarget(user)}
                            >
                              <KeyRound className="text-muted-foreground size-3.5" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive! gap-2 text-xs"
                              disabled={isSelf}
                              onClick={() => setDeleteTarget(user)}
                            >
                              <Trash2 className="size-3.5" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ResetPasswordDialog
        open={Boolean(resetTarget)}
        onOpenChange={(next) => !next && setResetTarget(null)}
        user={resetTarget}
        isSubmitting={resetMutation.isPending}
        onSubmit={(id, payload) => resetMutation.mutate({ id, payload })}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title="Delete User"
        description={`Delete user "${deleteTarget?.username ?? ''}"? This action cannot be undone.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </Card>
  )
}
