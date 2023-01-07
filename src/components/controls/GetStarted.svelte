<script lang="ts">
  import type { EventEmitter } from '$lib/common/event-emitter'
  import type { NoteEventMap } from '$lib/controllers'
  import type { Synth } from '$lib/audio/audio'

  export let noteEmitter: EventEmitter<NoteEventMap>
  export let synth: Synth

  let modalState: 'open' | 'closed' = 'open'

  const getStarted = () => {
    synth.start(noteEmitter)

    modalState = 'closed'
  }
</script>

<!--
  The modal must be removed from the DOM to prevent it from
  capturing keyboard events after the user has selected a tuning.
-->
{#if modalState === 'open'}
  <!-- svelte-ignore a11y-autofocus -->
  <div autofocus class="modal modal-open">
    <div class="modal-box relative sm:w-5/6 md:w-full">
      <div class="grid grid-flow-row auto-rows-max gap-4 w-full">
        <div class="justify-center">
          <h2 class="text-3xl">Coincident Spectra</h2>
        </div>

        <div class="grid grid-flow-row auto-rows-max gap-2">
          <p>
            Coincident Spectra is an additive synthesizer that generates sounds
            from 16 sine wave 'partials' that can be switched between harmonics
            and spectra. Harmonics are integer multiples of a fundamental
            frequency. Spectra remap harmonics so that the partials coincide
            with a selected equal temperament.
          </p>
          <p>
            Coincident spectra reduce sensory dissonance and beating between the
            timbre and tuning, rendering chords more in tune.
          </p>
        </div>

        <div class="grid grid-flow-row auto-rows-max gap-2">
          <h2 class="text-2xl">How to use</h2>
          <p>
            Play notes on your computer keyboard or MIDI controller. Select the
            Keyboard button to switch controllers.
          </p>
          <p>
            Select Harmonics or Spectra to change the partials mode. We
            recommend holding a note or chord when changing the partials mode to
            hear the difference.
          </p>
          <p>
            Select the ED2-12 button to change the tuning system. The default
            ED2-12 tuning system is 12-tone equal temperament.
          </p>
          <p>
            Increase the gain of a partial to hear it individually. Adjust
            partial gains to change the timbre of the instrument.
          </p>
        </div>

        <button
          class="btn btn-primary w-full"
          on:click|self={getStarted}
          on:keypress|self={getStarted}
        >
          Get Started
        </button>
      </div>
    </div>
  </div>
{/if}
