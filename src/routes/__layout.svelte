<script lang="ts">
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'

</script>


<div>
  <Header></Header>
  <slot></slot>
  <Footer></Footer>
</div>

