import { fromEvent, Subscription } from 'rxjs'
import { distinctUntilChanged, mergeWith, mergeMap, groupBy } from 'rxjs/operators'

import type { EventEmitter } from '$lib/common/event-emitter'

const keyDowns = fromEvent<KeyboardEvent>(document, 'keydown')
const keyUps = fromEvent<KeyboardEvent>(document, 'keyup')

const keyPresses =
  keyDowns.pipe(
    mergeWith(keyUps),
    groupBy((e: KeyboardEvent) => e.code),
    mergeMap(group =>
      group.pipe(
        distinctUntilChanged((x, y) => x.type === y.type)
      )
    )
  )


const midiNotes = {
  'KeyZ': 33,
  'KeyX': 34,
  'KeyC': 35,
  'KeyV': 36, // C2
  'KeyB': 37,
  'KeyN': 38,
  'KeyM': 39,
  'Comma': 40,
  'Period': 41,
  'Slash': 42,
  'KeyA': 43,
  'KeyS': 44,
  'KeyD': 45,
  'KeyF': 46,
  'KeyG': 47,
  'KeyH': 48, // C3
  'KeyJ': 49,
  'KeyK': 50,
  'KeyL': 51,
  'Semicolon': 52,
  'Quote': 53,
  'KeyQ': 54,
  'KeyW': 55,
  'KeyE': 56,
  'KeyR': 57,
  'KeyT': 58,
  'KeyY': 59,
  'KeyU': 60,  // C4
  'KeyI': 61,
  'KeyO': 62,
  'KeyP': 63,
  'BracketLeft': 64,
  'BracketRight': 65,
  'Digit1': 66,
  'Digit2': 67,
  'Digit3': 68,
  'Digit4': 69,
  'Digit5': 70,
  'Digit6': 71,
  'Digit7': 72, // C5
  'Digit8': 73,
  'Digit9': 74,
  'Digit0': 75,
  'Minus': 76,
  'Equal': 77,
}


export class Keyboard {
  noteEmitter: EventEmitter
  keySubscription: Subscription

  enable(noteEmitter: EventEmitter) {
    if (this.noteEmitter) {
      this.noteEmitter.dispatchEvent('stopAll')
    }

    this.noteEmitter = noteEmitter

    if (!this.keySubscription) {
      this.keySubscription = keyPresses.subscribe(key => {
        const midiNote = midiNotes[key.code]

        if (midiNote !== undefined) {
          switch (key.type) {
            case 'keydown':
              if (!key.shiftKey && !key.ctrlKey && !key.altKey && !key.metaKey) {
                this.noteEmitter.dispatchEvent('play', midiNote)
              }
              break;

            case 'keyup':
              this.noteEmitter.dispatchEvent('stop', midiNote)
              break;

            default:
              break
          }
        }
      });
    }
  }

  disable() {
    if (this.noteEmitter) {
      this.noteEmitter.dispatchEvent('stopAll')
    }

    this.noteEmitter = null;
    this.keySubscription.unsubscribe()
    this.keySubscription = null;
  }
}