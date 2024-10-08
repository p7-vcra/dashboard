<template>
    <l-polyline
      v-if="path.length"
      :lat-lngs="path"
      color="blue"
    />
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { LPolyline } from "@vue-leaflet/vue-leaflet"

  
  export default defineComponent({
    components: {
      LPolyline
    },
    name: 'VesselPath',
    props: {
      history: {
        type: Array as () => { latitude: number, longitude: number }[],
        required: true
      }
    },
    computed: {
      path(): [number, number][] {
        return (this as any).history.map((point: { latitude: number, longitude: number }) => [point.latitude, point.longitude]);
      }
    }
  });
  </script>
  