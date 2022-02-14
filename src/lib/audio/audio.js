import { ElementaryWebAudioRenderer as core, el } from '@elemaudio/core-lite';
import { get } from 'svelte/store'

import { audioStore } from '../../stores'

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

  async initialize(noteEmitter) {
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

  pause() {
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

  console.log(`midi: ${midiNote}`, `freq ${freq}`)

  return voices.filter(voice => voice.key !== key).concat({ gate: 0.1, freq, key })
}

const synth = (voices) => {
  return el.add(voices.map(voice => {
    return el.mul(
      el.const({ key: `${voice.key}:gate`, value: voice.gate }),
      el.cycle(el.const({ key: `${voice.key}:freq`, value: voice.freq }))
    )
  }))
}