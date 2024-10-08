<template>
  <!-- Nothing in the template since we are using Leaflet directly -->
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
    }
  },
  setup(props) {
    const marker = ref<L.Marker | null>(null);
    const customIcon = L.icon({
      iconUrl: 'src/assets/ship.png', // Replace with the path to your custom icon
      iconSize: [25, 41], // Size of the icon
      //iconAnchor: [props.latitude, props.longtitude], // Point of the icon which will correspond to marker's location
      //popupAnchor: [props.latitude, props.longtitude], // Point from which the popup should open relative to the iconAnchor
      //shadowSize: [41, 41], // Optional: size of the shadow image
      //shadowAnchor: [12, 41]  // Optional: point of the shadow which will correspond to marker's location
    });
     
    

    onMounted(() => {
      if (props.latitude !== undefined && props.longitude !== undefined && props.map) {
        console.log(`Creating marker for vessel with MMSI ${props.mmsi} at (${props.latitude}, ${props.longitude})`);
        marker.value = L.marker([props.latitude, props.longitude], {icon: customIcon})
          .addTo(props.map)
          .bindPopup(`Vessel MMSI: ${props.mmsi} <br> Vessel position: (${props.latitude} </br>, ${props.longitude})`);
          console.log(customIcon)
        // Show popup on hover
        marker.value.on('mouseover', () => {
          marker.value?.openPopup();
        });

        // Hide popup when not hovering
        marker.value.on('mouseout', () => {
          marker.value?.closePopup();
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

