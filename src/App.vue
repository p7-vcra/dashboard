<template>
  <div id="app">
    <MapComponent />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MapComponent from './components/MapComponent.vue' // Ensure the path is correct

export default defineComponent({
  name: 'App',
  components: {
    MapComponent, // Register the component
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
</style>
