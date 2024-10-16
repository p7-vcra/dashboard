<template>
  <div id="map" style="height: 100vh;"></div>
  <VesselMarker
    v-for="vessel in vesselArray"
    :key="vessel.MMSI"
    :map="map"
    :mmsi="vessel.MMSI"
    :latitude="vessel.latitude"
    :longitude="vessel.longitude"
    @vessel-clicked="handleVesselClick"
  />
  
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import L from 'leaflet';
import { initializeDataFeed, vessels } from '../dataHandler';
import VesselMarker from './VesselMarker.vue';


export default defineComponent({
  components: {
    VesselMarker,
},
  setup() {
    const map = ref<L.Map | null>(null);

    // Initialize the Leaflet map
    onMounted(() => {
      map.value = L.map('map').setView([56.0, 10.0], 8);  // Initial view over a default location
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true
      }).addTo(map.value);

      // Start the SSE connection to receive vessel data
      initializeDataFeed();
    });

    // Transform vessels object into an array
    const vesselArray = computed(() => {
      const array = Object.values(vessels.value);
      console.log('Computed vesselArray:', array);  // Log vesselArray
      return array;
    });

    const handleVesselClick = (mmsi: number) => {
      console.log(`Vessel with MMSI ${mmsi} clicked`);
    };

    return {
      map,
      vesselArray,
      handleVesselClick
    };
  }
});
</script>
<style>
</style>