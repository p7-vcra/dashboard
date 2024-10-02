<template>
  <div id="app">
    <MapComponent />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MapComponent from './components/MapComponent.vue'

export default defineComponent({
  name: 'App',
  components: {
    MapComponent,
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
