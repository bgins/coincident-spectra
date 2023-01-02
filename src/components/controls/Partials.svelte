<script lang="ts">
  import type { Synth } from '$lib/audio/audio'

  import { isKeyboardNoteEvent } from '$lib/controllers/keyboard'
  import { isPartials } from '$lib/audio/partials'
  import { partials } from '../../stores'
  import { setPartialsTable } from '$lib/audio/additive-synth'

  export let synth: Synth

  const setPartials = (event: {
    type: string
    currentTarget: HTMLButtonElement
    code?: string
  }) => {
    if (isKeyboardNoteEvent(event)) return

    const { textContent } = event.currentTarget
    const selected = textContent.toLowerCase()

    if (isPartials(selected)) {
      partials.set(selected)
      setPartialsTable()
      synth.updateParams()
    } else {
      console.error('Invalid partials selection: ', selected)
    }
  }
</script>

<div class="btn-group">
  <button
    class="btn btn-primary btn-outline"
    class:btn-active={$partials === 'harmonics'}
    on:click={setPartials}
    on:keypress={setPartials}
  >
    Harmonics
  </button>
  <button
    class="btn btn-primary btn-outline"
    class:btn-active={$partials === 'spectra'}
    on:click={setPartials}
    on:keypress={setPartials}
  >
    Spectra
  </button>
</div>
