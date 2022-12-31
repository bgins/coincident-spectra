<script lang="ts">
  import type { EventEmitter } from '$lib/common/event-emitter'
  import type { Synth } from '$lib/audio/audio'

  import Controller from '$components/controls/Controller.svelte'
  import Partials from '$components/controls/Partials.svelte'
  import Tuning from '$components/controls/Tuning.svelte'

  export let noteEmitter: EventEmitter
  export let synth: Synth
</script>

<div class="grid grid-flow-row auto-rows-max gap-7">
  <div class="grid grid-flow-col auto-cols-max gap-4">
    <button class="btn btn-primary">Start Audio</button>
    <Partials {synth} />
    <Controller {noteEmitter} {synth} />
    <Tuning {synth} />
  </div>
</div>
