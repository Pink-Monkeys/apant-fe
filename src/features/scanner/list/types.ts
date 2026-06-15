export type ScanStatus = 'completed' | 'running' | 'failed' | 'pending'

export type Scan = {
  id: string
  target: string
  provider: string
  model: string
  status: ScanStatus
  total_steps: number
  duration: string
  created_at: string
}

export type ListScansResponse = {
  data: Scan[]
  message: string
  success: boolean
}
