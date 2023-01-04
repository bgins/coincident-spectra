<script lang="ts">
  import { onDestroy } from 'svelte'

  import type { EventEmitter } from '$lib/common/event-emitter'
  import type { NoteEventMap } from '$lib/controllers'
  import type { Synth } from '$lib/audio/audio'

  import { midiInputs } from '../../stores'
  import { isKeyboardNoteEvent, Keyboard } from '$lib/controllers/keyboard'
  import { Midi } from '$lib/controllers/midi'

  export let noteEmitter: EventEmitter<NoteEventMap>
  export let synth: Synth

  type Controller = {
    name: string
    type: 'keyboard' | 'midi'
  }

  const keyboard = new Keyboard()
  const midi = new Midi()

  const keyboardController: Controller = { name: 'Keyboard', type: 'keyboard' }
  let controller = keyboardController
  let controllers: Controller[] = [keyboardController]
  let modalState: 'open' | 'closed' = 'closed'

  keyboard.enable(noteEmitter)

  const unsubscribeMidiInputs = midiInputs.subscribe(inputs => {
    const devices: Controller[] = inputs.map(name => ({ name, type: 'midi' }))

    controllers = [keyboardController, ...devices]

    // Reset to keyboard when a MIDI device is disconnected
    if (!controllers.some(c => c.name === controller.name)) {
      setController(0)
      controller = keyboardController
      modalState = 'closed'
    }
  })

  const setController = (index: number, event?: Event) => {
    if (event && isKeyboardNoteEvent(event)) return

    const selectedController = controllers[index]

    synth.stopAllNotes()

    switch (selectedController.type) {
      case 'keyboard':
        if (controller.type === 'midi') {
          midi.disable()
        }
        keyboard.enable(noteEmitter)
        break

      case 'midi':
        if (controller.type === 'keyboard') {
          keyboard.disable()
        }
        midi.enable(selectedController.name, noteEmitter)
        break
    }

    controller = selectedController
    modalState = 'closed'
  }

  const openModal = (event: Event) => {
    if (isKeyboardNoteEvent(event)) return

    modalState = 'open'
  }

  const closeModal = (event: Event) => {
    if (isKeyboardNoteEvent(event)) return

    modalState = 'closed'
  }

  onDestroy(unsubscribeMidiInputs)
</script>

<button
  class="btn btn-primary btn-outline"
  on:click={openModal}
  on:keypress={openModal}
>
  {controller.name}
</button>

<!--
  The modal must be removed from the DOM to prevent it from
  capturing keyboard events after the user has selected a tuning.
-->
{#if modalState === 'open'}
  <div
    class="modal modal-open"
    on:click|self={closeModal}
    on:keydown|self={closeModal}
  >
    <div class="modal-box relative sm:w-5/6 md:w-80">
      <div class="grid grid-flow-row auto-rows-max gap-3 w-full">
        <div class="justify-center">
          <h2 class="text-2xl">Controller</h2>
        </div>

        <div class="grid grid-flow-row auto-rows-max gap-2 w-full">
          {#each controllers as controller, index}
            <button
              class="btn btn-primary w-full"
              on:click|stopPropagation={event => setController(index, event)}
              on:keypress|stopPropagation={event => setController(index, event)}
            >
              <span class="truncate">
                {controller.name}
              </span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .truncate {
    width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
