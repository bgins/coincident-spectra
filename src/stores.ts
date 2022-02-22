import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

import type { MidiStatus } from '$lib/controllers/midi'

type AudioStore = {
  context: AudioContext
  contextState: AudioContextState
  elementaryReady: boolean
}

export const audioStore: Writable<AudioStore> = writable({ context: null, contextState: 'closed', elementaryReady: false })

export const drawbars: Writable<number[]> = writable([0.1, 0.05, 0.0333, 0.025, 0.02, 0.0167, 0.0143, 0.0125, 0.0111, 0.01, 0.0091, 0.0083, 0.0077, 0.0071, 0.0067, 0.0063])

export const tuning: Writable<string> = writable('ED2-12')

export const midiStatus: Writable<MidiStatus> = writable('disabled')

export const midiInputs: Writable<Record<string, WebMidi.MIDIInput>> = writable({})