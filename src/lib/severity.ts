const severityStyles = {
  Critical: {
    bar: 'fill-purple-700',
    text: 'text-purple-700',
    badge: 'bg-purple-700 text-white',
  },
  High: {
    bar: 'fill-destructive',
    text: 'text-destructive',
    badge: 'bg-destructive text-destructive-foreground',
  },
  Medium: {
    bar: 'fill-orange-500',
    text: 'text-orange-500',
    badge: 'bg-orange-500 text-white',
  },
  Low: {
    bar: 'fill-blue-500',
    text: 'text-blue-500',
    badge: 'bg-blue-500 text-white',
  },
  Informational: {
    bar: 'fill-muted-foreground',
    text: 'text-muted-foreground',
    badge: 'bg-gray-500 text-background',
  },
} as const

export { severityStyles }
