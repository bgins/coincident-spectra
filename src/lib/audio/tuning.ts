import { get } from 'svelte/store'
import { tuning } from '../../stores'

export const tune = (midiNote: number): number => {
  const selectedTuning = get(tuning)

  const baseFrequency = 440
  const baseMidiNote = 69
  const divisions = getDivisions(selectedTuning)
  const frequency = baseFrequency * 2 ** ((midiNote - baseMidiNote) / divisions)

  return frequency
}

const getDivisions = tuning => {
  switch (tuning) {
    case 'ED2-5':
      return 5

    case 'ED2-8':
      return 8

    case 'ED2-12':
      return 12

    case 'ED2-13':
      return 13

    default:
      return 12
  }
}