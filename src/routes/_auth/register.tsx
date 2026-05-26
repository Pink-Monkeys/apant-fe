import { RegisterForm } from '#/features/auth/components/register-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <RegisterForm />
    </div>
  )
}
