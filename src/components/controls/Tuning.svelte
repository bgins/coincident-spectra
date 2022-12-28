<script lang="ts">
  import type { Synth } from '$lib/audio/audio'
  import { setPartialsTable } from '$lib/audio/additive-synth'
  import { tuning } from '../../stores'

  export let synth: Synth

  const tunings = ['ED2-5', 'ED2-8', 'ED2-12', 'ED2-13']
  let modalState: 'open' | 'closed' = 'closed'

  const setTuning = (event: { currentTarget: HTMLButtonElement }) => {
    const { textContent: selectedTuning } = event.currentTarget

    synth.stopAllNotes()
    tuning.set(selectedTuning)
    setPartialsTable()

    modalState = 'closed'
  }

  const openModal = () => {
    modalState = 'open'
  }

  const closeModal = () => {
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
      <div class="grid grid-flow-row auto-rows-max gap-3 justify-center">
        <div class="justify-center">
          <h2 class="text-2xl">Tuning System</h2>
        </div>

        <div class="grid grid-flow-row auto-rows-max gap-2">
          {#each tunings as tuning}
            <button
              class="btn btn-wide btn-primary w-full"
              on:click|self={setTuning}
              on:keypress|self={setTuning}
            >
              {tuning}
            </button>
          {/each}
          <p class="text-xs italic">
            ED2 stands for equal division of the second harmonic, which is the
            octave. 12-ED2 is 12-tone equal temperament, where we divide
            the octave into twelve equal parts.
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}