import type { AgentLoopData } from '#/features/scanner/dynamic/types'
import type { ScanDetail } from '#/features/scanner/list/types'

// Adapts a polled ScanDetail into the AgentLoopData shape DynamicScannerProcess
// expects. Fills the fields the process view treats as required (step
// params/result records and target_info) with safe defaults.
export function scanDetailToAgentLoopData(scan: ScanDetail): AgentLoopData {
  // A running scan may report `steps: null` before the first tool executes.
  const steps = scan.steps ?? []
  return {
    session_id: scan.session_id,
    scan_id: scan.id,
    steps: steps.map((step) => ({
      step: step.step,
      tool: step.tool,
      params: step.params ?? {},
      result: step.result ?? {},
      summary: step.summary,
    })),
    final_answer: scan.final_answer ?? '',
    total_steps: steps.length,
    target_info: scan.target_info
      ? {
          address: scan.target_info.address,
          operating_system: scan.target_info.operating_system ?? '',
          status: scan.target_info.status ?? '',
          cdn: scan.target_info.cdn ?? '',
          ip: scan.target_info.ip ?? '',
          title: scan.target_info.title ?? '',
          status_code: scan.target_info.status_code ?? 0,
        }
      : undefined,
  }
}
