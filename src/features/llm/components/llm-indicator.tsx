import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { BrainCircuit } from 'lucide-react'
import { getLlmOptions, llmOptionsQueryKey } from '#/features/llm/api/llm-api'
import { getLlmSelection, llmSelectionKey, resolveSelection } from '#/features/llm/selection'
import type { LlmSelection } from '#/features/llm/types'

// Small badge shown on scan forms so the user knows which provider+model will be
// used. Reads the persisted selection (reactive via the query cache) and the
// available options to resolve the effective choice, with a link to change it.
export function LlmIndicator() {
  const { data: selection } = useQuery({
    queryKey: llmSelectionKey,
    queryFn: () => getLlmSelection(),
    initialData: () => getLlmSelection(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const { data: options = [] } = useQuery({
    queryKey: llmOptionsQueryKey,
    queryFn: getLlmOptions,
  })

  const effective: LlmSelection | null = resolveSelection(selection ?? null, options)

  return (
    <div className="text-muted-foreground mb-4 flex items-center gap-2 text-xs">
      <BrainCircuit className="size-4" />
      {effective ? (
        <span>
          Active LLM:{' '}
          <span className="text-foreground font-medium">
            {effective.provider} / {effective.model}
          </span>
        </span>
      ) : (
        <span>No LLM selected yet.</span>
      )}
      <Link to="/llm/select" className="text-primary underline underline-offset-4">
        {effective ? 'Change' : 'Select LLM'}
      </Link>
    </div>
  )
}
