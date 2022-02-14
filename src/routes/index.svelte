<script lang="ts">
  import { onMount } from 'svelte'

  import {AdditiveSynth} from '$lib/audio/audio'
  import { Keyboard } from '$lib/controllers/keyboard'
  import { EventEmitter } from '$lib/common/event-emitter'
  
  const noteEmitter = new EventEmitter()
  const controller = new Keyboard()
  const synth = new AdditiveSynth()
  let isMobileDevice: boolean = false

  controller.enable(noteEmitter)

  onMount(async () => {
    await synth.initialize()

    noteEmitter.addEventListener('play', midiNote => {
      synth.play(midiNote)
    })

    noteEmitter.addEventListener('stop', midiNote => {
      synth.stop(midiNote)
    })
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

<h2>Play notes on your keyboard.</h2>


<style></style>