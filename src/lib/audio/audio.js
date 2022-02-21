import { ElementaryWebAudioRenderer as core, el } from '@elemaudio/core-lite';
import { get } from 'svelte/store'

import { tune } from '$lib/audio/tuning'
import { halve } from '$lib/utils'
import { audioStore, drawbars, tuning } from '../../stores'
import partialsData from '$lib/audio/partials.json'

const selectedTuning = get(tuning)
let partials = partialsData[selectedTuning].harmonics

export const setHarmonics = () => { 
  const selectedTuning = get(tuning)
  partials = partialsData[selectedTuning].harmonics 
}
export const setSpectra = () => { 
  const selectedTuning = get(tuning)
  partials = partialsData[selectedTuning].spectra 
}

const synth = (voices) => {
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

export class AdditiveSynth {
  voices = []

  constructor() {
    const store = get(audioStore)

    if (!store.context) {
      const context = new window.AudioContext()

      audioStore.update(store => ({ ...store, context, contextState: 'suspended' }))
      context.suspend()
    }

    core.on('load', function () {
      audioStore.update(store => ({ ...store, elementaryReady: true }))
    });
  }

  initialize = async () => {
    const { context } = get(audioStore)

    const node = await core.initialize(context, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });

    node.connect(context.destination);
  }


  start = (noteEmitter) => {
    const { context } = get(audioStore)

    noteEmitter.addEventListener('play', this.playNote)
    noteEmitter.addEventListener('stop', this.stopNote)
    noteEmitter.addEventListener('stopAll', this.stopAllNotes)
    context.resume()
    audioStore.update(store => ({ ...store, contextState: 'running' }))
  }

  pause = (noteEmitter) => {
    const { context } = get(audioStore)

    stopAll()
    noteEmitter.removeEventListener('play', this.playNote)
    noteEmitter.removeEventListener('stop', this.stopNote)
    noteEmitter.removeEventListener('stopAll', this.stopAllNotes)
    context.suspend()
    audioStore.update(store => ({ ...store, contextState: 'suspended' }))
  }

  playNote = midiNote => {
    this.voices = play(this.voices, midiNote)
  }

  stopNote = midiNote => {
    this.voices = stop(this.voices, midiNote)
  }

  stopAllNotes = () => {
    this.voices = stopAll()
  }

  updateParams = () => {
    const { elementaryReady } = get(audioStore)

    if (elementaryReady && this.voices.length > 0) {
      render(synth(this.voices))
    }
  }
}

const render = (voices) => {
  const highpassOut = el.highpass(60, 0.1, voices)

  core.render(highpassOut, highpassOut);
}

const play = (voices, midiNote) => {
  const { elementaryReady } = get(audioStore)
  const updatedVoices = updateVoices(voices, midiNote).slice(-8)

  if (elementaryReady) {
    render(synth(updatedVoices))
  }

  return updatedVoices
}

const stop = (voices, midiNote) => {
  const { elementaryReady } = get(audioStore)
  const key = `v${midiNote}`
  const updatedVoices = voices.filter(voice => voice.key !== key)

  if (elementaryReady) {
    if (updatedVoices.length > 0) {
      render(synth(updatedVoices))
    } else {
      render(el.const(0))
    }
  }

  return updatedVoices
}

const stopAll = () => {
  const { elementaryReady } = get(audioStore)
  if (elementaryReady) {
    render(el.const(0))
  }

  return []
}

const updateVoices = (voices, midiNote) => {
  const key = `v${midiNote}`
  const freq = tune(midiNote)

  console.log(`MIDI note: ${midiNote}`, `, Frequency: ${freq}`)

  return voices.filter(voice => voice.key !== key).concat({ gate: 0.1, freq, key })
}