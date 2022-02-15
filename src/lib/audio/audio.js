import { ElementaryWebAudioRenderer as core, el } from '@elemaudio/core-lite';
import { get } from 'svelte/store'

import { audioStore } from '../../stores'
import partialsData from '$lib/audio/partials.json'

let partials = partialsData.harmonics
const amplitudes = [0.1, 0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.009, 0.008, 0.007, 0.006, 0.005, 0.004]

export const setHarmonics = () => { partials = partialsData.harmonics }
export const setSpectra = () => { partials = partialsData.spectra }

const synth = (voices) => {
  const halfPartials = Math.ceil(partials.length / 2)
  const firstPartials = partials.slice(0, halfPartials)
  const secondPartials = partials.slice(-halfPartials)

  const halfAmplitudes = Math.ceil(amplitudes.length / 2)
  const firstAmplitudes = amplitudes.slice(0, halfAmplitudes)
  const secondAmplitudes = amplitudes.slice(-halfAmplitudes)

  return el.add(voices.map(voice => {
    return el.add(
      el.add(firstPartials.map((partial, index) => {
        return el.mul(
          el.const({ key: `${voice.key}:gate:${index}`, value: voice.gate * firstAmplitudes[index] }),
          el.cycle(el.const({ key: `${voice.key}:freq:${index}`, value: voice.freq * partial }))
        )
      })),
      el.add(secondPartials.map((partial, index) => {
        return el.mul(
          el.const({ key: `${voice.key}:gate:m${index}`, value: voice.gate * secondAmplitudes[index] }),
          el.cycle(el.const({ key: `${voice.key}:freq:m${index}`, value: voice.freq * partial }))
        )
      }))
    )
  }))
}
export class AdditiveSynth {
  voices = []

  constructor() {
    const { context } = get(audioStore)

    if (!context) {
      audioStore.update(store => ({ ...store, context: new window.AudioContext() }))
    }

    core.on('load', function () {
      audioStore.update(store => ({ ...store, elementaryReady: true }))
    });
  }

  initialize = async (noteEmitter) => {
    const { context } = get(audioStore)

    let node = await core.initialize(context, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });

    node.connect(context.destination);

    noteEmitter.addEventListener('play', midiNote => {
      this.voices = play(this.voices, midiNote)
    })

    noteEmitter.addEventListener('stop', midiNote => {
      this.voices = stop(this.voices, midiNote)
    })
  }

  start = () => {
    const { context } = get(audioStore)
    context.resume()
  }

  pause = () => {
    const { context } = get(audioStore)
    context.suspend()
  }
}

const play = (voices, midiNote) => {
  const { elementaryReady } = get(audioStore)
  const updatedVoices = updateVoices(voices, midiNote);

  if (elementaryReady) {
    core.render(synth(updatedVoices), synth(updatedVoices));
  }

  return updatedVoices
}

const stop = (voices, midiNote) => {
  const { elementaryReady } = get(audioStore)
  const key = `v${midiNote}`
  const updatedVoices = voices.filter(voice => voice.key !== key)

  if (elementaryReady) {
    if (updatedVoices.length > 0) {
      core.render(synth(updatedVoices), synth(updatedVoices));
    } else {
      core.render(el.const(0), el.const(0));
    }
  }

  return updatedVoices
}

const updateVoices = (voices, midiNote) => {
  const baseFrequency = 440
  const baseMidiNote = 60
  const divisions = 12
  const key = `v${midiNote}`
  const freq = baseFrequency * 2 ** ((midiNote - baseMidiNote) / divisions)

  console.log(`MIDI note: ${midiNote}`, `, Frequency: ${freq}`)

  return voices.filter(voice => voice.key !== key).concat({ gate: 0.1, freq, key })
}