<script lang="ts">
  import type { EventEmitter } from '$lib/common/event-emitter'
  import type { NoteEventMap } from '$lib/controllers'
  import type { Synth } from '$lib/audio/audio'

  import { audioStore } from '../stores'
  import Controller from '$components/controls/Controller.svelte'
  import Partials from '$components/controls/Partials.svelte'
  import Tuning from '$components/controls/Tuning.svelte'

  export let noteEmitter: EventEmitter<NoteEventMap>
  export let synth: Synth

  const startAudio = () => {
    synth.start(noteEmitter)
  }

  const pauseAudio = () => {
    synth.pause(noteEmitter)
  }
</script>

<div class="grid grid-flow-row auto-rows-max gap-7">
  <div class="grid grid-flow-col auto-cols-max gap-4">
    {#if $audioStore.contextState === 'running'}
      <button
        class="btn btn-primary"
        on:click={pauseAudio}
        on:keypress={pauseAudio}
      >
        Pause Audio
      </button>
    {:else}
      <button
        class="btn btn-primary"
        on:click={startAudio}
        on:keypress={startAudio}
      >
        Start Audio
      </button>
    {/if}
    <Partials {synth} />
    <Controller {noteEmitter} {synth} />
    <Tuning {synth} />
  </div>
</div>
