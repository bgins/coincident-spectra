<script lang="ts">
  import type { Synth } from '$lib/audio/audio'

  import { isKeyboardNoteEvent } from '$lib/controllers/keyboard'
  import { setPartialsTable } from '$lib/audio/additive-synth'
  import { tuning } from '../../stores'

  export let synth: Synth

  const tunings = ['ED2-5', 'ED2-8', 'ED2-12', 'ED2-13']
  let modalState: 'open' | 'closed' = 'closed'

  const setTuning = (event: {
    type: string
    currentTarget: HTMLButtonElement
    code?: string
  }) => {
    if (isKeyboardNoteEvent(event)) return

    const { textContent: selectedTuning } = event.currentTarget

    synth.stopAllNotes()
    tuning.set(selectedTuning)
    setPartialsTable()

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
</script>

<button
  class="btn btn-primary btn-outline"
  on:click={openModal}
  on:keypress={openModal}
>
  {$tuning}
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
      <div class="grid grid-flow-row auto-rows-max gap-3">
        <h2 class="text-2xl">Tuning System</h2>

        <div class="grid grid-flow-row auto-rows-max gap-2">
          {#each tunings as tuning}
            <button
              class="btn btn-wide btn-primary w-full"
              on:click|stopPropagation={setTuning}
              on:keypress|stopPropagation={setTuning}
            >
              {tuning}
            </button>
          {/each}
          <p class="text-xs italic">
            ED2 stands for equal division of the second harmonic, which is the
            octave. 12-ED2 is 12-tone equal temperament, where we divide the
            octave into twelve equal parts.
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}
