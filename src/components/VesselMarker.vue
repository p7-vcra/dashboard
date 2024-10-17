<template>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch, PropType } from 'vue';
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
    let marker = ref<L.Marker | null>(null);

     const customIcon = L.icon({
      iconUrl: 'src/assets/ship.png', // Path to custom icon
      iconSize: [25, 41], // Size of the icon
      
    });

    // Add marker to the map when the component mounts
    onMounted(() => {
      if (props.map) {
        marker.value = L.marker([props.latitude, props.longitude], { icon: customIcon })
          .addTo(props.map)
          .bindPopup(`Vessel MMSI: ${props.mmsi} <br> Vessel latitude ${props.latitude} <br> Vessel longitude ${props.longitude}`)
          .on('click', () => props.onMarkerClick(props.mmsi));
      }
    });

    // Watch for changes in latitude and longitude to update the marker position
    watch(() => [props.latitude, props.longitude], ([newLat, newLng]) => {
      if (marker.value) {
        marker.value.setLatLng([newLat, newLng]);
      }
    });

    // Clean up the marker when the component is unmounted
    onUnmounted(() => {
      if (marker.value) {
        marker.value.remove();
      }
    });

    return {};
  }
});
</script>