import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

import type { MidiStatus } from '$lib/controllers/midi'

type AudioStore = {
  context: AudioContext
  elementaryReady: boolean
}

export const audioStore: Writable<AudioStore> = writable({ context: null, elementaryReady: false })

export const drawbars: Writable<number[]> = writable([0.1, 0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.009, 0.008, 0.007, 0.006, 0.005, 0.004])

export const midiStatus: Writable<MidiStatus> = writable('disabled')

export const midiInputs: Writable<Record<string, WebMidi.MIDIInput>> = writable({})