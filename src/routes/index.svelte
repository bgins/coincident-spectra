<script lang="ts">
  import { onMount } from 'svelte'

  import { AdditiveSynth, setHarmonics, setSpectra } from '$lib/audio/audio'
  import { Keyboard } from '$lib/controllers/keyboard'
  import { EventEmitter } from '$lib/common/event-emitter'
  import partials from '$lib/audio/partials.json'

  const noteEmitter = new EventEmitter()
  const controller = new Keyboard()
  const synth = new AdditiveSynth()
  let isMobileDevice: boolean = false
  let selectedPartials = 'harmonics'

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

  $ : {
    if (selectedPartials === 'harmonics') {
      setHarmonics()
    } else {
      setSpectra()
    }
  }

  setDevice()
</script>

<svelte:window on:resize={setDevice} />

<div class="grid grid-flow-row auto-rows-max justify-center bg-neutral h-screen p-10 text-base-content">
  <div class="card w-full bg-base-100 shadow-xl">
    <div class="card-body">
      <h1 class="text-4xl pb-7">Coincident Spectra</h1>
      <div class="grid grid-flow-row auto-rows-max gap-7">
        <div class="grid grid-flow-col auto-cols-max gap-4">
          <button class="btn btn-primary" on:click={synth.start}>
            Start Audio
          </button>
          <select class="select w-full max-w-xs select-primary">
            <option disabled selected>Tuning System</option>
            <option value="12-ed2">12-ED2</option>
            <option value="19-ed2">19-ED2</option>
          </select>
          <select class="select w-full max-w-xs select-primary" bind:value={selectedPartials}>
            <option value="harmonics">Harmonics</option>
            <option value="spectra">Spectra</option>
          </select>
          <select class="select w-full max-w-xs select-primary">
            <option disabled selected>Controller</option>
            <option>Keyboard</option>
            <option>MIDI</option>
          </select>
          <select class="select w-full max-w-xs select-primary">
            <option disabled selected>MIDI Device</option>
            <option>Arturia Keystep</option>
            <option>Roland Keyboard</option>
          </select>
        </div>
        <div class="overflow-x-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr>
                <th>Partial</th>
                <th>Harmonics</th>
                <th>Spectra</th>
                <th>Gain</th>
              </tr>
            </thead>
            <tbody>
              {#each partials.harmonics as harmonic, index}
                <tr>
                  <th>1</th>
                  <td>{harmonic}</td>
                  <td>{partials.spectra[index]}</td>
                  <td>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value="40"
                      class="range range-xs"
                    />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
