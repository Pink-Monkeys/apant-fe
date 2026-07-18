import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type ExpandableTextProps = {
  text: string
  className?: string
}

// Renders potentially very long agent prose. Collapsed by default to ~6 lines
// with a fade-out at the bottom, expandable via a toggle. Paragraph/list
// whitespace is preserved so the expanded text keeps its original formatting.
export function ExpandableText({ text, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (expanded) return
    const element = textRef.current
    if (!element) return
    setIsOverflowing(element.scrollHeight > element.clientHeight + 1)
  }, [text, expanded])

  const showToggle = isOverflowing || expanded

  return (
    <div className="space-y-2">
      <p
        ref={textRef}
        className={cn(
          'text-sm leading-relaxed whitespace-pre-wrap',
          !expanded &&
            'max-h-36 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)]',
          className
        )}
      >
        {text}
      </p>
      {showToggle ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary h-auto px-0 py-0 hover:bg-transparent"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <>
              Sembunyikan <ChevronUp className="size-3.5" />
            </>
          ) : (
            <>
              Selengkapnya <ChevronDown className="size-3.5" />
            </>
          )}
        </Button>
      ) : null}
    </div>
  )
}
