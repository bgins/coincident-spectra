import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

type AudioStore = {
  context: AudioContext
  elementaryReady: boolean
}

export const audioStore: Writable<AudioStore> = writable({ context: null, elementaryReady: false })
