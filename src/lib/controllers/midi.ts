import { get } from 'svelte/store'
import { midiInputs, midiStatus } from '../../stores'

import type { EventEmitter } from '$lib/common/event-emitter'

export type MidiStatus = 'enabled' | 'disabled' | 'unavailable'

export class Midi {
  midiAccess: WebMidi.MIDIAccess
  noteEmitter: EventEmitter
  abortController = new AbortController()

  constructor() {
    this.initialize().catch(err => { throw err })
  }

  initialize = async (): Promise<void> => {
    if (navigator.requestMIDIAccess !== undefined) {

      try {
        this.midiAccess = await navigator.requestMIDIAccess()
        const inputs = Array.from(this.midiAccess.inputs, ([_, input]) => input)
          .reduce((inputs, input) => ({ ...inputs, [input.name]: input }), {})

        midiInputs.set(inputs)
        midiStatus.set('disabled')
      } catch {
        console.warn('WebMidi not available in this browser')
        midiStatus.set('unavailable')
      }

    } else {
      console.warn('WebMidi not available in this browser')
      midiStatus.set('unavailable')
    }
  }

  enable = (noteEmitter: EventEmitter): void => {
    this.noteEmitter = noteEmitter
    const status = get(midiStatus)

    if (status !== 'unavailable' && this.midiAccess) {
      midiStatus.set('enabled')
      const firstInput = this.midiAccess.inputs.entries().next().value

      if (firstInput) {
        this.setInput(firstInput[1].name)
      }
    }
  }

  setInput = (name: string): void => {
    const status = get(midiStatus)
    const inputs = get(midiInputs)

    // Remove all event listeners
    this.abortController.abort()
    this.abortController = new AbortController()

    if (status === 'enabled') {
      inputs[name].addEventListener('midimessage', event => {
        const { data } = event

        if (data.length === 2 || data.length === 3) {
          const status = `0x${data[0].toString(16)}`
          let midiNote: number

          switch (status) {
            case '0x90':
              midiNote = data[1]
              this.noteEmitter.dispatchEvent('play', midiNote)
              break

            case '0x80':
              midiNote = data[1]
              this.noteEmitter.dispatchEvent('stop', midiNote)
              break

            default:
              break
          }
        }
      }, { signal: this.abortController.signal })
    } else {
      console.error('WebMidi not enabled')
    }
  }

  disable = (): void => {
    if (this.noteEmitter) {
      this.noteEmitter.dispatchEvent('stopAll')
    }

    this.abortController.abort()
    this.noteEmitter = null
    midiStatus.set('disabled')
  }
}