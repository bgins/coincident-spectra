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

  async initialize() {
    const { context } = get(audioStore)

    let node = await core.initialize(context, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });

    node.connect(context.destination);
  }

  play(midiNote) {
    const { elementaryReady } = get(audioStore)

    if (elementaryReady) {
      this.voices = updateVoices(this.voices, midiNote);
      core.render(synth(this.voices), synth(this.voices));
    }
  }

  stop(midiNote) {
    const key = `v${midiNote}`

    this.voices = this.voices.filter(voice => voice.key !== key)

    if (this.voices.length > 0) {
      core.render(synth(this.voices), synth(this.voices));
    } else {
      core.render(el.const(0), el.const(0));
    }
  }

  pause() {
    const { context } = get(audioStore)
    context.suspend()
  }

}

const updateVoices = (voices, midiNote) => {
  const baseFrequency = 440
  const baseMidiNote = 60
  const divisions = 12
  const key = `v${midiNote}`

  const freq = baseFrequency * 2 ** ((midiNote - baseMidiNote) / divisions)

  console.log(`midi: ${midiNote}`, `freq ${freq}]`)

  return voices.filter(voice => voice.key !== key).concat({ gate: 0.1, freq, key })

}

const synth = (voices) => {
  return el.add(voices.map((voice) => {
    return el.mul(
      el.const({ key: `${voice.key}:gate`, value: voice.gate }),
      el.cycle(el.const({ key: `${voice.key}:freq`, value: voice.freq }))
    )
  }))
}