const severityStyles = {
  Critical: {
    bar: 'fill-red-800',
    text: 'text-red-800',
    badge: 'bg-red-800 text-white',
    bg: 'bg-red-800',
    hex: '#991b1b',
  },
  High: {
    bar: 'fill-red-600',
    text: 'text-red-600',
    badge: 'bg-red-600 text-white',
    bg: 'bg-red-600',
    hex: '#dc2626',
  },
  Medium: {
    bar: 'fill-amber-500',
    text: 'text-amber-500',
    badge: 'bg-amber-500 text-black',
    bg: 'bg-amber-500',
    hex: '#f59e0b',
  },
  Low: {
    bar: 'fill-emerald-600',
    text: 'text-emerald-600',
    badge: 'bg-emerald-600 text-white',
    bg: 'bg-emerald-600',
    hex: '#059669',
  },
  Informational: {
    bar: 'fill-sky-600',
    text: 'text-sky-600',
    badge: 'bg-sky-600 text-white',
    bg: 'bg-sky-600',
    hex: '#0284c7',
  },
} as const

export { severityStyles }
