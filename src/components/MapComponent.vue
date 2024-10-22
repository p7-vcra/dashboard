<template>
  <div id="map-container">
    <div id="map" style="height: 100vh;"></div>
    <CursorCoordinates :latitude="cursorLat" :longitude="cursorLng" />
  </div>
  <VesselMarker v-for="vessel in vesselArray" :key="vessel.MMSI" :map="map" :mmsi="vessel.MMSI"
    :latitude="vessel.latitude" :longitude="vessel.longitude" :onMarkerClick="handleMarkerClick" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import L from 'leaflet';
import { initializeDataFeed, vessels } from '../dataHandler';
import VesselMarker from './VesselMarker.vue';
import CursorCoordinates from './CursorCoordinates.vue';

export default defineComponent({
  components: { VesselMarker, CursorCoordinates },
  setup() {
    const map = ref<L.Map | null>(null);
    const polylines = ref<{ [key: number]: L.Polyline }>({});
    const selectedVesselMMSI = ref<number | null>(null);
    const cursorLat = ref<number>(0);
    const cursorLng = ref<number>(0);

    onMounted(() => {
      map.value = L.map('map').setView([56.0, 10.0], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true
      }).addTo(map.value as L.Map);
      initializeDataFeed();

      map.value.on('click', () => {
        if (selectedVesselMMSI.value !== null) {
          const polyline = polylines.value[selectedVesselMMSI.value];
          if (polyline) {
            polyline.remove();
          }
          selectedVesselMMSI.value = null;
        }
      });

      map.value.on('mousemove', (e: L.LeafletMouseEvent) => {
        cursorLat.value = e.latlng.lat;
        cursorLng.value = e.latlng.lng;
      });
    });

    const vesselArray = computed(() => Object.values(vessels.value));

    const handleMarkerClick = (mmsi: number) => {
      selectedVesselMMSI.value = mmsi;
    };

    const updatePolyline = (mmsi: number) => {
      const vessel = vessels.value[mmsi];
      if (!vessel || !map.value) return;

      // Remove existing polyline if it exists
      if (polylines.value[mmsi]) {
        polylines.value[mmsi].remove();
        delete polylines.value[mmsi];
      }

      // Create a new polyline for the vessel's path
      const latlngs: L.LatLngTuple[] = vessel.history.map(point => [point.latitude, point.longitude] as L.LatLngTuple);
      const polyline = L.polyline(latlngs, { color: 'red' }).addTo(map.value as L.Map);
      polylines.value[mmsi] = polyline;
    };

    watch(() => vessels.value, () => {
      if (selectedVesselMMSI.value !== null) {
        updatePolyline(selectedVesselMMSI.value);
      }
    }, { deep: true });

    return { map, vesselArray, selectedVesselMMSI, handleMarkerClick, cursorLat, cursorLng };
  }
});
</script>

<style>
#map-container {
  position: relative;
  height: 100vh;
}

#map {
  height: 100%;
}
</style>