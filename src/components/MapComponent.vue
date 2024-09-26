<template>
    <div class="map-container">
      <l-map ref="map" v-model:zoom="zoom" :center="[56.27526584557727, 9.321697552292468]">
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
      </l-map>
    </div>
  </template>
  
  <script>
  import "leaflet/dist/leaflet.css";
  import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
  
  export default {
    components: {
      LMap,
      LTileLayer,
    },
    data() {
      return {
        zoom: 2,
      };
    },
  };
  </script>
  
  <style scoped>
  .map-container {
    height: calc(100vh - 50px); /* Full height minus 50px for footer or bottom space */
    width: 100vw; /* Full width */
    display: flex;
  }
  
  .l-map {
    flex: 1; /* Make the map fill all available space */
  }
  </style>
  