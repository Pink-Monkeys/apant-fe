// Hybrid color scheme for the Top Categories chart:
//   HUE  = which severity band the category's avg_cvss falls into
//          (violet = Critical, red = High, orange = Medium, blue = Low/Info)
//   SHADE = where in that band the avg_cvss sits — higher score = darker shade.
//
// So danger reads from hue (violet is worst, down through red, orange, to blue
// for the least severe), and two categories in the same band still differ by
// shade. Color depends ONLY on avg_cvss, never on the category's position in the
// chart, so a category never "shifts color" when the time filter changes which
// categories are shown.
//
// Each band is a validated 5-step ordinal ramp (light -> dark), per mode. The
// violet dark ramp is nudged lighter than the source spec so its darkest step
// clears 2:1 contrast on the app's dark card surface (#1e293b) — validated with
// the dataviz skill. All four hues are still only distinguishable under CVD with
// secondary encoding (bar values, category axis labels, the band legend), which
// this chart provides.

export type CategoryColorMode = 'light' | 'dark'

type SeverityBand = {
  key: 'critical' | 'high' | 'medium' | 'low'
  label: string
  range: string
  // Inclusive lower bound; the band spans [min, next band's min).
  min: number
  max: number
  ramp: { light: string[]; dark: string[] }
}

// Highest first so a linear scan picks the most severe matching band.
const SEVERITY_BANDS: SeverityBand[] = [
  {
    key: 'critical',
    label: 'Critical',
    range: '9.0–10',
    min: 9.0,
    max: 10.0,
    ramp: {
      light: ['#b9a6dd', '#9877d3', '#7b57c9', '#5c3fb0', '#382c80'],
      dark: ['#b6a4df', '#a18ad6', '#8b70cd', '#7655c3', '#6340b5'],
    },
  },
  {
    key: 'high',
    label: 'High',
    range: '7.0–8.9',
    min: 7.0,
    max: 8.9,
    ramp: {
      light: ['#e08078', '#d15a4f', '#bd3f36', '#9e2f28', '#7a211c'],
      dark: ['#f0a89f', '#e5776b', '#d8544a', '#c23e35', '#a32e28'],
    },
  },
  {
    key: 'medium',
    label: 'Medium',
    range: '4.0–6.9',
    min: 4.0,
    max: 6.9,
    ramp: {
      light: ['#e0a25c', '#cf8636', '#b56d1c', '#985810', '#75430a'],
      dark: ['#f0bd7e', '#e0a052', '#cf8636', '#b56d1c', '#985810'],
    },
  },
  {
    key: 'low',
    label: 'Low',
    range: '0–3.9',
    min: 0.0,
    max: 3.9,
    ramp: {
      light: ['#84b5ee', '#5b9be8', '#3082dd', '#2263b0', '#164883'],
      dark: ['#a8cef4', '#78afeb', '#4f92e4', '#3379d0', '#215fa8'],
    },
  },
]

function bandForScore(avgCvss: number): SeverityBand {
  for (const band of SEVERITY_BANDS) {
    if (avgCvss >= band.min) return band
  }
  // avg_cvss of 0 (no CVSS data) or anything below all mins → the Low band.
  return SEVERITY_BANDS[SEVERITY_BANDS.length - 1]
}

// Discrete 5-step: position within the band maps to one of the ramp's 5 shades.
export function colorForCategory(avgCvss: number, mode: CategoryColorMode = 'light'): string {
  const score = Math.min(10, Math.max(0, avgCvss))
  const band = bandForScore(score)
  const span = band.max - band.min
  const position = span <= 0 ? 0 : (score - band.min) / span
  const stepIndex = Math.min(4, Math.max(0, Math.round(position * 4)))
  return band.ramp[mode][stepIndex]
}

// Legend entries: one chip per band (hue = severity), representative shade = the
// band's middle step so the legend swatch reads as that band's identity color.
export function severityBandLegend(
  mode: CategoryColorMode = 'light'
): { label: string; range: string; color: string }[] {
  return SEVERITY_BANDS.map((band) => ({
    label: band.label,
    range: band.range,
    color: band.ramp[mode][2],
  }))
}
