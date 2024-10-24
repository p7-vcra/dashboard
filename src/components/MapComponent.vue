<template>
  <div :class="['main-container', { 'menu-open': isMenuOpen }]">
    <HamburgerMenu @viewSelected="toggleView" @menuToggled="handleMenuToggle" />
    <div id="map" class="map-container"></div>
    <VesselMarker
      v-for="vessel in vesselArray"
      :key="vessel.MMSI"
      :map="map"
      :mmsi="vessel.MMSI"
      :latitude="vessel.latitude"
      :longitude="vessel.longitude"
      :history="vessel.history"
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
import { defineComponent, onMounted, ref, watch, computed } from 'vue';
import L from 'leaflet';
import { initializeDataFeed, vessels } from '../dataHandler';
import VesselMarker from './VesselMarker.vue';
import ShipCard from './ShipCard.vue';
import HamburgerMenu from './HamburgerMenu.vue';

export default defineComponent({
  name: 'MapComponent',
  components: {
    VesselMarker,
    ShipCard,
    HamburgerMenu
  },
  setup() {
    const map = ref<L.Map | null>(null);
    const polylines = ref<{ [key: number]: L.Polyline }>({});
    const startMarkers = ref<{ [key: number]: L.Marker }>({});
    const selectedVesselMMSI = ref<number | null>(null);
    const isGridView = ref(false);
    const isMenuOpen = ref(false);

    const vesselArray = computed(() => Object.values(vessels.value));

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

    const updateVesselPath = (mmsi: number) => {
      const vessel = vessels.value[mmsi];
      if (!vessel || !map.value) return;

      // Update the existing polyline for the selected vessel
      const latLngs = vessel.history.map(point => [point.latitude, point.longitude]);
      if (polylines.value[mmsi]) {
        polylines.value[mmsi].setLatLngs(latLngs);
      } else {
        const polyline = L.polyline(latLngs, { color: 'blue' }).addTo(map.value);
        polylines.value[mmsi] = polyline;
      }

      // Update the start marker for the selected vessel if it exists
      if (startMarkers.value[mmsi]) {
        const startLatLng = latLngs[0];
        startMarkers.value[mmsi].setLatLng(startLatLng);
      }
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
      const initialLatLng = vesselArray.value.length > 0
        ? [vesselArray.value[0].latitude, vesselArray.value[0].longitude]
        : [56.00, 10.00]; // Default to a location if no vessel data

      console.log(`Initializing map at (${initialLatLng[0]}, ${initialLatLng[1]})`);
      map.value = L.map('map').setView(initialLatLng, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map.value);

      // Initialize the data feed
      initializeDataFeed();

      map.value.on('click', () => {
        if (selectedVesselMMSI.value !== null) {
          const polyline = polylines.value[selectedVesselMMSI.value];
          if (polyline) {
            polyline.remove();
            delete polylines.value[selectedVesselMMSI.value];
          }
          if (startMarkers.value[selectedVesselMMSI.value]) {
            startMarkers.value[selectedVesselMMSI.value].remove();
            delete startMarkers.value[selectedVesselMMSI.value];
          }
          selectedVesselMMSI.value = null;
        }
      });
    });

    watch(vessels, (newVessels: { [key: number]: any }) => {
      // Handle changes in the vessels data
      Object.keys(polylines.value).forEach(mmsiStr => {
        const mmsi = Number(mmsiStr);
        if (!newVessels[mmsi]) {
          // Remove polyline if the vessel no longer exists
          polylines.value[mmsi].remove();
          delete polylines.value[mmsi];
        } else {
          // Update polyline if the vessel still exists
          const vessel = newVessels[mmsi];
          const latlngs: L.LatLngTuple[] = vessel.history.map((point: { latitude: number; longitude: number }) => [point.latitude, point.longitude] as L.LatLngTuple);
          polylines.value[mmsi].setLatLngs(latlngs);

          // Update the start marker for the selected vessel if it exists
          if (startMarkers.value[mmsi]) {
            const startLatLng = latlngs[0];
            startMarkers.value[mmsi].setLatLng(startLatLng);
          }
        }
      });
    }, { deep: true });

    return {
      map,
      vesselArray,
      showVesselPath,
      toggleView,
      handleVesselClick,
      isGridView,
      isMenuOpen,
      handleMenuToggle
    };
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