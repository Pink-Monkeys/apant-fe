const scanRankingConfig = {
  value: { label: 'Reports' },
  Critical: { label: 'Critical' },
  High: { label: 'High' },
  Medium: { label: 'Medium' },
  Low: { label: 'Low' },
  Informational: { label: 'Informational' },
}

const topCategoryClasses = {
  bar: 'fill-chart-3',
  text: 'text-chart-3',
} as const

const topCategoriesConfig = {
  value: { label: 'Findings' },
}

export { scanRankingConfig, topCategoriesConfig, topCategoryClasses }
