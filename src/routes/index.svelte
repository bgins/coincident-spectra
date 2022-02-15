<script lang="ts">
  import { onMount } from 'svelte'

  import { AdditiveSynth, setHarmonics, setSpectra } from '$lib/audio/audio'
  import { Keyboard } from '$lib/controllers/keyboard'
  import { EventEmitter } from '$lib/common/event-emitter'
  
  const noteEmitter = new EventEmitter()
  const controller = new Keyboard()
  const synth = new AdditiveSynth()
  let isMobileDevice: boolean = false

  controller.enable(noteEmitter)

  onMount(async () => {
    await synth.initialize(noteEmitter)
  })


  const setDevice = () => {
    if (window.innerWidth <= 768) {
        isMobileDevice = true
    } else {
      isMobileDevice = false
    }
  }

  setDevice()
</script>

<svelte:window on:resize={setDevice} />

<h2>Quick demo of Harmonics vs 12-ED2 Spectra</h2>
<button on:click={synth.start}>Start</button>
<button on:click={setHarmonics}>Harmonics</button>
<button on:click={setSpectra}>Spectra</button>
<div class="row">
  Harmonic multipliers
  <code>[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]</code>
</div>
<div class="row">
  Spectral multipliers
  <code>[1, 2, 2.997, 4, 5.04, 5.993, 7.127, 8, 8.98, 10.079, 11.314, 11.986, 12.699, 14.254, 15.102, 16]</code>
</div>
<div class="row">
  Amplitudes
  <code>[0.1, 0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03,0.02, 0.01, 0.009, 0.008, 0.007, 0.006, 0.005, 0.004]</code>
</div>

<style>
  .row {
    padding-top: 1rem
  }

</style>