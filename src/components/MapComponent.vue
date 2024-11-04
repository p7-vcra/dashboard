<template>
  <div :class="['main-container', { 'menu-open': isMenuOpen }]">
    <HamburgerMenu @viewSelected="toggleView" @menuToggled="handleMenuToggle" />
    <div id="map" class="map-container"></div>
     <CursorCoordinates :latitude="cursorLat" :longitude="cursorLng" />
    <VesselMarker
      v-for="vessel in vesselArray"
      :key="vessel.MMSI"
      :map="map"
      :mmsi="vessel.MMSI"
      :latitude="vessel.latitude"
      :longitude="vessel.longitude"
      :history="vessel.history"
      :cog="vessel.cog"
      :sog="vessel.sog"
      :onMarkerClick="handleVesselClick"
    />
    <div v-if="isGridView" class="ship-grid">
      <ShipCard
        v-for="vessel in vesselArray"
        :key="vessel.MMSI"
        :ship="vessel"
      />
    </div>
  </div>

</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import L from 'leaflet';
import { fetchLocationBoundData, vessels, removeVesselsOutsideBounds } from '../dataHandler';
import VesselMarker from './VesselMarker.vue';
import CursorCoordinates from './CursorCoordinates.vue';
import ShipCard from './ShipCard.vue';
import HamburgerMenu from './HamburgerMenu.vue';

export default defineComponent({
  name: 'MapComponent',
  components: {
    VesselMarker,
    ShipCard,
    HamburgerMenu,
    CursorCoordinates
  },
  setup() {
    const map = ref<L.Map | null>(null);
    const polylines = ref<{ [key: number]: L.Polyline }>({});
    const startMarkers = ref<{ [key: number]: L.Marker }>({});
    const selectedVesselMMSI = ref<number | null>(null);
    const isGridView = ref(false);
    const isMenuOpen = ref(false);
    const cursorLat = ref<number>(0);
    const cursorLng = ref<number>(0);
    const latLowerBound = ref<number>(0);
    const latUpperBound = ref<number>(0);
    const lngLowerBound = ref<number>(0);
    const lngUpperBound = ref<number>(0);

    //const vesselArray = computed(() => Object.values(vessels.value));
  
    const showVesselPath = (mmsi: number) => {
      const vessel = vessels.value[mmsi];
      if (!vessel || !map.value) return;

      // Remove existing polyline and start marker if they exist
      if (selectedVesselMMSI.value !== null) {
        if (polylines.value[selectedVesselMMSI.value]) {
          polylines.value[selectedVesselMMSI.value].remove();
          delete polylines.value[selectedVesselMMSI.value];
        }
        if (startMarkers.value[selectedVesselMMSI.value]) {
          startMarkers.value[selectedVesselMMSI.value].remove();
          delete startMarkers.value[selectedVesselMMSI.value];
        }
      }

      // Create a new polyline for the selected vessel
      const latLngs = vessel.history.map(point => [point.latitude, point.longitude]);
      const polyline = L.polyline(latLngs, { color: 'blue' }).addTo(map.value);
      polylines.value[mmsi] = polyline;

      // Add a start marker for the selected vessel
      const startLatLng = latLngs[0];
      const startMarker = L.marker(startLatLng).addTo(map.value);
      startMarkers.value[mmsi] = startMarker;

      selectedVesselMMSI.value = mmsi;
    };

  



    const toggleView = (view: string) => {
      isGridView.value = view === 'dashboard';
    };

    const handleVesselClick = (mmsi: number) => {
      showVesselPath(mmsi);
    };

    const handleMenuToggle = (isOpen: boolean) => {
      isMenuOpen.value = isOpen;
    };

    // Initialize the Leaflet map
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
          if (startMarkers.value[selectedVesselMMSI.value]) {
            startMarkers.value[selectedVesselMMSI.value].remove();
            delete startMarkers.value[selectedVesselMMSI.value];
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

    return { map, vesselArray, selectedVesselMMSI, handleMarkerClick, cursorLat, cursorLng, initializedMap, toggleView,
      handleVesselClick,
      isGridView,
      isMenuOpen,
      handleMenuToggle };
  }
});
</script>

<style>

.main-container {
  display: flex;
  transition: margin-left 0.3s ease;
}

.menu-open {
  margin-left: 250px;
}

.ship-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
}

.map-container {
  flex: 1;
  height: 100vh; /* Ensure the map takes the full height */
  position: relative;
  z-index: 1;
}
</style>