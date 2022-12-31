<script lang="ts">
  import { onDestroy } from 'svelte'

  import type { EventEmitter } from '$lib/common/event-emitter'
  import type { NoteEventMap } from '$lib/controllers'
  import type { Synth } from '$lib/audio/audio'

  import { midiInputs } from '../../stores'
  import { Keyboard } from '$lib/controllers/keyboard'
  import { Midi } from '$lib/controllers/midi'

  export let noteEmitter: EventEmitter<NoteEventMap>
  export let synth: Synth

  const keyboard = new Keyboard()
  const midi = new Midi()

  let controller = { name: 'Keyboard', type: 'keyboard' }
  let controllers = [controller]
  let modalState: 'open' | 'closed' = 'closed'

  keyboard.enable(noteEmitter)

  const unsubscribeMidiInputs = midiInputs.subscribe(inputs => {
    const devices = Object.keys(inputs).map(name => ({ name, type: 'midi' }))

    controllers = [
      ...controllers.filter(({ type }) => type !== 'midi'),
      ...devices
    ]
  })

  const setController = (
    index: number,
    event: {
      type: string
      currentTarget: HTMLButtonElement
      code?: string
    }
  ) => {
    // Filter out keyboard note events
    if (event.type === 'keypress' && event.code !== 'Enter') {
      return
    }

    const selectedController = controllers[index]

    synth.stopAllNotes()

    switch (controller.type) {
      case 'keyboard':
        if (selectedController.type === 'midi') {
          keyboard.disable()
        }
        midi.enable(noteEmitter)
        midi.setInput(selectedController.name)
        break

      case 'midi':
        if (selectedController.type === 'keyboard') {
          midi.disable()
        }
        keyboard.enable(noteEmitter)
        break
    }

    controller = selectedController
    modalState = 'closed'
  }

  const openModal = () => {
    modalState = 'open'
  }

  const closeModal = () => {
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
    on:keypress|self={closeModal}
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
