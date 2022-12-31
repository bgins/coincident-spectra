<script lang="ts">
  import { onMount } from 'svelte'

  import type { NoteEventMap } from '$lib/controllers'
  import { Synth } from '$lib/audio/audio'
  import { EventEmitter } from '$lib/common/event-emitter'
  import partialsData from '$lib/audio/partials.json'
  import { drawbars, partials, tuning } from '../stores'
  import Controls from '$components/Controls.svelte'
  import Guide from '$components/Guide.svelte'

  type View = 'instrument' | 'info'

  const noteEmitter: EventEmitter<NoteEventMap> = new EventEmitter()
  const synth = new Synth()
  let view: View = 'instrument'

  onMount(async () => {
    await synth.initialize()
  })

  const showInfo = () => {
    view = 'info'
  }

  const hideInfo = () => {
    view = 'instrument'
  }

  const setDrawbar = (
    index: number,
    event: { currentTarget: HTMLInputElement }
  ) => {
    const { value } = event.currentTarget

    drawbars.update(drawbars => {
      drawbars[index] = +value / 1000
      return drawbars
    })

    synth.updateParams()
  }
</script>

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
              <div
                class="tooltip"
                data-tip="Show Info"
                on:click={showInfo}
                on:keydown={showInfo}
              >
                <img src="information.svg" alt="Show information" />
              </div>
            {:else}
              <div on:click={hideInfo} on:keydown={hideInfo} class="pb-1">
                <img src="close.svg" alt="Hide information" />
              </div>
            {/if}
          </button>
        </div>
      </div>
      {#if view === 'instrument'}
        <div class="grid grid-flow-row auto-rows-max gap-7">
          <Controls {noteEmitter} {synth} />
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
                {#each partialsData[$tuning].harmonics as harmonic, index}
                  <tr>
                    <th>{index + 1}</th>
                    <td>{harmonic}</td>
                    <td>{partialsData[$tuning].spectra[index] ?? '—'}</td>
                    <td>
                      {#if $partials === 'harmonics' || ($partials === 'spectra' && partialsData[$tuning].spectra[index])}
                        <div
                          class="tooltip tooltip-left w-full"
                          data-tip={(
                            Math.trunc($drawbars[index] * 10000) / 10
                          ).toString()}
                        >
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={($drawbars[index] * 1000).toString()}
                            class="range range-xs"
                            on:input={event => setDrawbar(index, event)}
                          />
                        </div>
                      {/if}
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
