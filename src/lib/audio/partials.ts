export type Partials = 'harmonics' | 'spectra'

export function isPartials(str: string): str is Partials {
  return str === 'harmonics' || str === 'spectra'
}