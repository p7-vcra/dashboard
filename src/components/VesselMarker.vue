<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, onUnmounted } from 'vue';
import L from 'leaflet';
//import { vessels } from '../dataHandler';


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
    history: {
      type: Array,
      required: true
    },
    cog:{
      type: Number,
      required: true
    },
    sog:{
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

    const customIcon = () => {
      return L.divIcon({
      html: `<img src="assets/fullyColoredArrow.svg" style="transform: rotate(${props.cog}deg); transform-origin: center bottom" />`,
      className: 'custom-icon',
      iconSize: [15, 20],
      iconAnchor: [15, 20]
      
      });
    };
  
    //"public/assets/fullyColoredArrow.svg"

    onMounted(() => {
      if (props.latitude !== undefined && props.longitude !== undefined && props.map) {
        //(`Creating marker for vessel with MMSI ${props.mmsi} at (${props.latitude}, ${props.longitude}) with angle ${angle}`);
        marker.value = L.marker([props.latitude, props.longitude], { icon: customIcon() })
      .addTo(props.map as L.Map)
      .bindPopup(`Vessel MMSI: ${props.mmsi} <br> Vessel position: (${props.latitude}, ${props.longitude})`);

        // Handle marker click
        marker.value.on('click', () => {
          props.onMarkerClick(props.mmsi);
        });
      } else {
        console.error(`Invalid coordinates for vessel with MMSI ${props.mmsi}: (${props.latitude}, ${props.longitude})`);
      }
    });

    watch(() => [props.latitude, props.longitude, props.history, props.cog, props.sog], ([newLat, newLng, newCog]) => {
      if (marker.value) {
        console.log(`Updating marker position for vessel with MMSI ${props.mmsi} and COG ${props.cog} sog ${props.sog} to (${newLat}, ${newLng})`);
        marker.value.setLatLng([newLat as number, newLng as number, newCog as number]);
        marker.value.setIcon(customIcon());
        
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
.custom-icon {
  fill: green;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
