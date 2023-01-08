import { get } from 'svelte/store'
import { Input, WebMidi } from 'webmidi'

import { midiInputs, midiStatus } from '../../stores'

import type { EventEmitter } from '$lib/common/event-emitter'
import type { NoteEventMap } from '$lib/controllers'

export type MidiStatus = 'enabled' | 'disabled' | 'unavailable'

/** Initialize WebMidi
 *
 * WebMidi is initialized before we create an instance of the class.
 * We initialize in the GetStarted interface and inform the user
 * the app uses WebMIDI before the browser requests permission.
 */
export const initialize = async (): Promise<void> => {
  try {
    await WebMidi.enable()

    midiInputs.set(getInputNames(WebMidi.inputs))
    midiStatus.set('disabled')

    WebMidi.addListener('connected', () => {
      midiInputs.set(getInputNames(WebMidi.inputs))
    })

    WebMidi.addListener('disconnected', () => {
      midiInputs.set(getInputNames(WebMidi.inputs))
    })
  } catch (err) {
    console.warn('WebMidi could not be initialized:', err)
    midiStatus.set('unavailable')
  }

}

export class Midi {
  selectedInput: Input
  noteEmitter: EventEmitter<NoteEventMap>
  abortController = new AbortController()

  enable = (deviceName: string, noteEmitter: EventEmitter<NoteEventMap>): void => {
    const status = get(midiStatus)

    if (status !== 'unavailable') {
      midiStatus.set('enabled')

      this.noteEmitter = noteEmitter
      this.noteEmitter.emit('stopAll')

      // Remove listeners from the previous input
      if (this.selectedInput) {
        this.selectedInput.removeListener('noteon')
        this.selectedInput.removeListener('noteoff')
      }

      // Set the new input
      this.selectedInput = WebMidi.getInputByName(deviceName)

      // Add listeners
      this.selectedInput.addListener('noteon', event => {
        const status = get(midiStatus)

        if (status === 'enabled') {
          const midiNote = event.note.number
          this.noteEmitter.emit('play', { midiNote })
        }
      })

      this.selectedInput.addListener('noteoff', event => {
        const status = get(midiStatus)

        if (status === 'enabled') {
          const midiNote = event.note.number
          this.noteEmitter.emit('stop', { midiNote })
        }
      })
    } else {
      console.error('WebMidi not enabled')
    }
  }

  disable = (): void => {
    if (this.noteEmitter) {
      this.noteEmitter.emit('stopAll')
    }

    if (this.selectedInput) {
      this.selectedInput.removeListener('noteon')
      this.selectedInput.removeListener('noteoff')
    }

    this.noteEmitter = null
    this.selectedInput = null
    midiStatus.set('disabled')
  }
}

const getInputNames = (inputs: Input[]): string[] => {
  return inputs.map(input => input.name)
}