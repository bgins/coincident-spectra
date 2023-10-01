import type { ElemNode } from '@elemaudio/core'
import type { Voice } from './audio'

import { el, resolve } from '@elemaudio/core'
import { get } from 'svelte/store'

import { halve } from '$lib/utils'
import { drawbars, partials as partialsStore, tuning } from '../../stores'
import partialsData_ from '$lib/audio/partials.json'


type PartialsData = {
  [key: string]: {
    harmonics: number[]
    spectra: number[]
  }
}

type AdditiveVoiceProps = {
  voice: Voice
  partials: number[]
  gains: number[]
}


const selectedTuning = get(tuning)
const selectedPartials = get(partialsStore)

const partialsData = partialsData_ as PartialsData
let partials: number[] = partialsData[selectedTuning][selectedPartials]

export const additiveSynth = (voices: Voice[]): ElemNode => {
  let gains: number[] = []

  drawbars.subscribe(vals => {
    gains = vals
  })

  // Remove null partials and their associated gains
  const filteredGains = gains.filter((_, index) => partials[index] !== null)
  const filteredPartials = partials.filter(partial => partial !== null)

  return el.add(...voices.map(voice => {
    return additiveVoice({ voice, partials: filteredPartials, gains: filteredGains })
  }))
}


const additiveVoice = (props: AdditiveVoiceProps): ElemNode => {
  const { voice, partials, gains } = props

  const { firstHalf: firstGains, secondHalf: secondGains } = halve(gains)
  const { firstHalf: firstPartials, secondHalf: secondPartials } = halve(partials)

  return resolve(
    el.add(
      el.add(...firstPartials.map((partial: number, index: number): number | ElemNode => {
        return el.mul(
          el.const({ key: `${voice.key}:gate:l${index}`, value: voice.gate * firstGains[index] }),
          el.cycle(el.const({ key: `${voice.key}:freq:l${index}`, value: voice.freq * partial }))
        )
      })),
      el.add(...secondPartials.map((partial: number, index: number): number | ElemNode => {
        return el.mul(
          el.const({ key: `${voice.key}:gate:h${index}`, value: voice.gate * secondGains[index] }),
          el.cycle(el.const({ key: `${voice.key}:freq:h${index}`, value: voice.freq * partial }))
        )
      }))
    ))
}

export const setPartialsTable = (): void => {
  const selectedTuning = get(tuning)
  const selectedPartials = get(partialsStore)
  partials = partialsData[selectedTuning][selectedPartials]
}
