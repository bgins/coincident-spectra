<script lang="ts">
  import type { Synth } from '$lib/audio/audio'
  import Partials from '$components/controls/Partials.svelte'
  import Tuning from '$components/controls/Tuning.svelte'

  export let synth: Synth
</script>

<div class="grid grid-flow-row auto-rows-max gap-7">
  <div class="grid grid-flow-col auto-cols-max gap-4">
    <button class="btn btn-primary">Start Audio</button>
    <Partials {synth} />
    <button class="btn btn-primary btn-outline">Keyboard</button>
    <Tuning {synth} />
  </div>
</div>
