<template>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watch, PropType } from 'vue';
import L from 'leaflet';

export default defineComponent({
  props: {
    map: {
      type: Object as () => L.Map,
      required: true
    },
    mmsi: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    onMarkerClick: {
      type: Function as PropType<(mmsi: number) => void>,
      required: true,
    },
  },
  setup(props) {
    let marker: L.Marker | null = null;

    // Add marker to the map when the component mounts
    onMounted(() => {
      if (props.map) {
        marker = L.marker([props.latitude, props.longitude])
          .addTo(props.map)
          .bindPopup(`Vessel MMSI: ${props.mmsi}`)
          .on('click', () => props.onMarkerClick(props.mmsi));
      }
    });

    // Watch for changes in latitude and longitude to update the marker position
    watch(() => [props.latitude, props.longitude], ([newLat, newLng]) => {
      if (marker) {
        marker.setLatLng([newLat, newLng]);
      }
    });

    // Clean up the marker when the component is unmounted
    onUnmounted(() => {
      if (marker) {
        marker.remove();
      }
    });

    return {};
  }
});
</script>