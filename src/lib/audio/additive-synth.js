import { ElementaryWebAudioRenderer as core, el } from '@elemaudio/core-lite';
import { get } from 'svelte/store'

import partialsData from '$lib/audio/partials.json'
import { halve } from '$lib/utils'
import { drawbars, tuning } from '../../stores'

const selectedTuning = get(tuning)
let partials = partialsData[selectedTuning].harmonics

export const additiveSynth = (voices) => {
  let gains = []

  drawbars.subscribe(vals => {
    gains = vals
  })

  // Remove null partials and their associated gains
  const filteredGains = gains.filter((_, index) => partials[index] !== null)
  const filteredPartials = partials.filter(partial => partial !== null)

  return el.add(voices.map(voice => {
    return core.createNode(core.memo(additiveVoice), { voice, partials: filteredPartials, gains: filteredGains}, [])
  }))
}

const additiveVoice = ({ props }) => {
  const { voice, partials, gains } = props

  const { firstHalf: firstGains, secondHalf: secondGains } = halve(gains)
  const { firstHalf: firstPartials, secondHalf: secondPartials } = halve(partials)

  return el.add(
    el.add(firstPartials.map((partial, index) => {
      return el.mul(
        el.const({ key: `${voice.key}:gate:l${index}`, value: voice.gate * firstGains[index] }),
        el.cycle(el.const({ key: `${voice.key}:freq:l${index}`, value: voice.freq * partial }))
      )
    })),
    el.add(secondPartials.map((partial, index) => {
      return el.mul(
        el.const({ key: `${voice.key}:gate:h${index}`, value: voice.gate * secondGains[index] }),
        el.cycle(el.const({ key: `${voice.key}:freq:h${index}`, value: voice.freq * partial }))
      )
    }))
  )
}

export const setHarmonics = () => { 
  const selectedTuning = get(tuning)
  partials = partialsData[selectedTuning].harmonics 
}

export const setSpectra = () => { 
  const selectedTuning = get(tuning)
  partials = partialsData[selectedTuning].spectra 
}