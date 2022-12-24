import type { NodeRepr_t } from '@elemaudio/core'

import { el } from '@elemaudio/core'
import { get } from 'svelte/store'
import WebRenderer from '@elemaudio/web-renderer'

import { additiveSynth } from '$lib/audio/additive-synth'
import { tune } from '$lib/audio/tuning'
import { audioStore } from '../../stores'

import type { EventEmitter } from '$lib/common/event-emitter'


export type Voice = { gate: number; freq: number; key: string }


export class Synth {
  voices: Voice[] = []

  constructor() {
    const store = get(audioStore)
    const core = new WebRenderer()

    if (!store.context) {
      const context = new window.AudioContext()

      audioStore.update(store => ({
        ...store,
        context,
        contextState: 'suspended',
        core
      }))

      void context.suspend()
    }

    core.on('load', function () {
      audioStore.update(store => ({ ...store, elementaryReady: true }))
    })
  }

  initialize = async (): Promise<void> => {
    const { context, core } = get(audioStore)

    const node = await core.initialize(context, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })

    node.connect(context.destination)
  }


  start = (noteEmitter: EventEmitter): void => {
    const { context } = get(audioStore)

    noteEmitter.addEventListener('play', this.playNote)
    noteEmitter.addEventListener('stop', this.stopNote)
    noteEmitter.addEventListener('stopAll', this.stopAllNotes)
    void context.resume()
    audioStore.update(store => ({ ...store, contextState: 'running' }))
  }

  pause = (noteEmitter: EventEmitter): void => {
    const { context } = get(audioStore)

    this.stopAllNotes()
    noteEmitter.removeEventListener('play', this.playNote)
    noteEmitter.removeEventListener('stop', this.stopNote)
    noteEmitter.removeEventListener('stopAll', this.stopAllNotes)
    void context.suspend()
    audioStore.update(store => ({ ...store, contextState: 'suspended' }))
  }

  playNote = (midiNote: number): void => {
    const { elementaryReady } = get(audioStore)

    this.voices = updateVoices(this.voices, midiNote).slice(-8)

    if (elementaryReady) {
      render(additiveSynth(this.voices))
    }
  }

  stopNote = (midiNote: number): void => {
    const { elementaryReady } = get(audioStore)
    const key = `v${midiNote}`

    this.voices = this.voices.filter(voice => voice.key !== key)

    if (elementaryReady) {
      if (this.voices.length > 0) {
        render(additiveSynth(this.voices))
      } else {
        render(el.const({ key: 'silence', value: 0 }))
      }
    }
  }

  stopAllNotes = (): void => {
    const { elementaryReady } = get(audioStore)

    this.voices = []

    if (elementaryReady) {
      render(el.const({ key: 'silence', value: 0 }))
    }
  }

  updateParams = (): void => {
    const { elementaryReady } = get(audioStore)

    if (elementaryReady && this.voices.length > 0) {
      render(additiveSynth(this.voices))
    }
  }
}


const updateVoices = (voices: Voice[], midiNote: number): Voice[] => {
  const key = `v${midiNote}`
  const freq = tune(midiNote)

  console.log(`MIDI note: ${midiNote}`, `, Frequency: ${freq}`)

  return voices.filter(voice => voice.key !== key).concat({ gate: 0.1, freq, key })
}

const render = (ensemble: number | NodeRepr_t): void => {
  const { core } = get(audioStore)
  const dcblockOut = el.dcblock(ensemble)
  const gainOut = el.mul(dcblockOut, 3)

  core.render(gainOut, gainOut)
}