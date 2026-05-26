import { requireAuth } from '#/features/auth/guard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/scanner')({
  beforeLoad: () => requireAuth(),
})
