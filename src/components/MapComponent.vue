<template>
  <div id="map" style="height: 100vh;"></div>
  <VesselMarker v-for="vessel in vesselArray" :key="vessel.MMSI" :map="map" :mmsi="vessel.MMSI"
    :latitude="vessel.latitude" :longitude="vessel.longitude" :onMarkerClick="showVesselPath" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import L from 'leaflet';
import { initializeDataFeed, vessels } from '../dataHandler';
import VesselMarker from './VesselMarker.vue';


export default defineComponent({
  components: { VesselMarker },
  setup() {
    const map = ref<L.Map | null>(null);
    const polylines = ref<{ [key: number]: L.Polyline }>({});
    const selectedVesselMMSI = ref<number | null>(null);

    onMounted(() => {
      map.value = L.map('map').setView([56.0, 10.0], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value as L.Map);
      initializeDataFeed();

      map.value.on('click', () => {
        if (selectedVesselMMSI.value !== null) {
          const polyline = polylines.value[selectedVesselMMSI.value];
          if (polyline) {
            polyline.remove();
            delete polylines.value[selectedVesselMMSI.value];
          }
          selectedVesselMMSI.value = null;
        }
      });
    });

    const vesselArray = computed(() => Object.values(vessels.value));

    const showVesselPath = (mmsi: number) => {
      const vessel = vessels.value[mmsi];
      if (!vessel || !map.value) return;

      // Remove existing polyline if it exists
      if (selectedVesselMMSI.value !== null && polylines.value[selectedVesselMMSI.value]) {
        polylines.value[selectedVesselMMSI.value].remove();
        delete polylines.value[selectedVesselMMSI.value];
      }

      // Create a new polyline for the vessel's path
      const latlngs: L.LatLngTuple[] = vessel.history.map(point => [point.latitude, point.longitude] as L.LatLngTuple);
      const polyline = L.polyline(latlngs, { color: 'red' }).addTo(map.value as L.Map);
      polylines.value[mmsi] = polyline;

      // Update the selected vessel MMSI
      selectedVesselMMSI.value = mmsi;
    };

    return { map, vesselArray, showVesselPath };
  }
});
</script>

<style></style>