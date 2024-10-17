<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, onUnmounted } from 'vue';
import L from 'leaflet';

export default defineComponent({
  name: 'VesselMarker',
  props: {
    map: {
      type: Object,
      required: true
    },
    mmsi: {
      type: Number,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    onMarkerClick: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const marker = ref<L.Marker | null>(null);

    // Define the custom icon
    const customIcon = L.icon({
      iconUrl: 'src/assets/ship.png', // Replace with the correct path to your ship icon
      iconSize: [25, 41], // Size of the icon
     
    });

    onMounted(() => {
      if (props.latitude !== undefined && props.longitude !== undefined && props.map) {
        console.log(`Creating marker for vessel with MMSI ${props.mmsi} at (${props.latitude}, ${props.longitude})`);
        marker.value = L.marker([props.latitude, props.longitude], { icon: customIcon })
          .addTo(props.map)
          .bindPopup(`Vessel MMSI: ${props.mmsi} <br> Vessel position: (${props.latitude}, ${props.longitude})`);

        // Handle marker click
        marker.value.on('click', () => {
          props.onMarkerClick(props.mmsi);
        });
      } else {
        console.error(`Invalid coordinates for vessel with MMSI ${props.mmsi}: (${props.latitude}, ${props.longitude})`);
      }
    });

    watch(() => [props.latitude, props.longitude], ([newLat, newLng]) => {
      if (marker.value) {
        console.log(`Updating marker position for vessel with MMSI ${props.mmsi} to (${newLat}, ${newLng})`);
        marker.value.setLatLng([newLat, newLng]);
      }
    });

    onUnmounted(() => {
      if (marker.value) {
        marker.value.remove();
      }
    });

    return {};
  }
});
</script>

<style>
.marker:hover {
  cursor: pointer;
}
</style>