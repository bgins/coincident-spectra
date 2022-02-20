<script lang="ts">
  import { onMount } from 'svelte'

  import { AdditiveSynth, setHarmonics, setSpectra } from '$lib/audio/audio'
  import { Keyboard } from '$lib/controllers/keyboard'
  import { Midi } from '$lib/controllers/midi'
  import { EventEmitter } from '$lib/common/event-emitter'
  import partials from '$lib/audio/partials.json'
  import { audioStore, drawbars, midiInputs, midiStatus } from '../stores'
  import Guide from '$components/Guide.svelte'

  type View = 'instrument' | 'info'

  const noteEmitter = new EventEmitter()
  const keyboard = new Keyboard()
  const midi = new Midi()
  const synth = new AdditiveSynth()
  let selectedPartials = 'harmonics'
  let view: View = 'instrument'
  let isMobileDevice: boolean = false

  keyboard.enable(noteEmitter)

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

  const showInfo = () => {
    view = 'info'
  }

  const hideInfo = () => {
    view = 'instrument'
  }

  const startAudio = () => {
    synth.start(noteEmitter)
  }

  const pauseAudio = () => {
    synth.pause(noteEmitter)
  }

  const setController = event => {
    const { value: controller } = event.target as HTMLInputElement

    if (controller === 'MIDI') {
      keyboard.disable()
      midi.enable(noteEmitter)
    } else if (controller === 'Keyboard') {
      midi.disable()
      keyboard.enable(noteEmitter)
    }
  }

  const setMidiInput = event => {
    const { value: name } = event.target as HTMLInputElement

    midi.setInput(name)
  }

  const setDrawbar = (index: number, event: Event) => {
    const { value } = event.target as HTMLInputElement

    drawbars.update(drawbars => {
      drawbars[index] = +value / 1000
      return drawbars
    })

    synth.updateParams()
  }

  $: {
    if (selectedPartials === 'harmonics') {
      setHarmonics()
    } else {
      setSpectra()
    }
  }

  setDevice()
</script>

<svelte:window on:resize={setDevice} />

<div
  class="grid grid-flow-row auto-rows-max justify-center bg-neutral h-screen p-10 text-base-content"
>
  <div class="card bg-base-100 shadow-xl" style="width: 950px">
    <div class="card-body">
      <div class="grid grid-flow-col grid-cols-2 align-center pb-6">
        <h1 class="text-4xl" style="display: inline-block">
          Coincident Spectra
        </h1>
        <div class="grid justify-end items-center pt-1 pr-2">
          <button>
            {#if view === 'instrument'}
              <div class="tooltip" data-tip="Show Info" on:click={showInfo}>
                <img src="information.svg" alt="Show information" />
              </div>
            {:else}
              <div on:click={hideInfo} class="pb-1">
                <img src="close.svg" alt="Hide information" />
              </div>
            {/if}
          </button>
        </div>
      </div>
      {#if view === 'instrument'}
        <div class="grid grid-flow-row auto-rows-max gap-7">
          <div class="grid grid-flow-col auto-cols-max gap-4">
            {#if $audioStore.contextState === 'running'}
              <button class="btn btn-primary" on:click={pauseAudio}>
                Pause Audio
              </button>
            {:else}
              <button class="btn btn-primary" on:click={startAudio}>
                Start Audio
              </button>
            {/if}
            <select class="select w-full max-w-xs select-primary">
              <option disabled selected>Tuning System</option>
              <option value="12-ed2">12-ED2</option>
              <option value="19-ed2">19-ED2</option>
            </select>
            <select
              class="select w-full max-w-xs select-primary"
              bind:value={selectedPartials}
            >
              <option value="harmonics">Harmonics</option>
              <option value="spectra">Spectra</option>
            </select>
            <select
              class="select w-full max-w-xs select-primary"
              on:change={setController}
            >
              <option>Keyboard</option>
              {#if $midiStatus !== 'unavailable'}
                <option>MIDI</option>
              {/if}
            </select>
            {#if $midiStatus === 'enabled'}
              <select
                class="select w-full max-w-xs select-primary"
                on:change={setMidiInput}
              >
                {#each Object.keys($midiInputs) as midiInput}
                  <option>{midiInput}</option>
                {/each}
              </select>
            {:else if $midiStatus === 'unavailable'}
              <div class="tooltip" data-tip="MIDI unavailable in this browser">
                <select disabled class="select w-full max-w-xs select-primary">
                  <option disabled selected>MIDI Device</option>
                </select>
              </div>
            {:else}
              <select disabled class="select w-full max-w-xs select-primary">
                <option disabled selected>MIDI Device</option>
              </select>
            {/if}
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
                    <th>{index + 1}</th>
                    <td>{harmonic}</td>
                    <td>{partials.spectra[index]}</td>
                    <td>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={($drawbars[index] * 1000).toString()}
                        class="range range-xs"
                        on:input={event => setDrawbar(index, event)}
                      />
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else}
        <Guide />
      {/if}
    </div>
  </div>
</div>

<style>
</style>
