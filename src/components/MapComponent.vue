<template>
  <div id="map-container">
    <div id="map" style="height: 90vh;"></div>
    <CursorCoordinates :latitude="cursorLat" :longitude="cursorLng" />
  </div>
  <VesselMarker v-for="vessel in vesselArray" :key="vessel.MMSI" :map="initializedMap" :mmsi="vessel.MMSI"
    :latitude="vessel.latitude" :longitude="vessel.longitude" :onMarkerClick="handleMarkerClick" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import L from 'leaflet';
import { fetchLocationBoundData, vessels, removeVesselsOutsideBounds } from '../dataHandler';
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
    const latLowerBound = ref<number>(0);
    const latUpperBound = ref<number>(0);
    const lngLowerBound = ref<number>(0);
    const lngUpperBound = ref<number>(0);

    onMounted(() => {
      map.value = L.map('map').setView([56.0, 10.0], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true
      }).addTo(map.value as L.Map);

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

      map.value.on('moveend', () => {
        const bounds = map.value?.getBounds();
        if (bounds) {
          latLowerBound.value = bounds.getSouthWest().lat;
          latUpperBound.value = bounds.getNorthEast().lat;
          lngLowerBound.value = bounds.getSouthWest().lng;
          lngUpperBound.value = bounds.getNorthEast().lng;
          console.log('Bounds:', latLowerBound.value, latUpperBound.value, lngLowerBound.value, lngUpperBound.value);
          fetchLocationBoundData(latLowerBound.value, latUpperBound.value, lngLowerBound.value, lngUpperBound.value);
          removeVesselsOutsideBounds(latLowerBound.value, latUpperBound.value, lngLowerBound.value, lngUpperBound.value);
        }
      });
    });

    const isVesselWithinBounds = (vessel: any) => {
      return vessel.latitude >= latLowerBound.value &&
             vessel.latitude <= latUpperBound.value &&
             vessel.longitude >= lngLowerBound.value &&
             vessel.longitude <= lngUpperBound.value;
    };

    const vesselArray = computed(() => Object.values(vessels.value).filter(isVesselWithinBounds));

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

    const initializedMap = computed(() => map.value as L.Map);

    return { map, vesselArray, selectedVesselMMSI, handleMarkerClick, cursorLat, cursorLng, initializedMap };
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