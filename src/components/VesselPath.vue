<template>
    <l-polyline
      v-if="path.length"
      :lat-lngs="path"
      color="blue"
    />
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    props: {
      history: {
        type: Array,
        required: true
      }
    },
    computed: {
      path() {
        return this.history.map(point => [point.latitude, point.longitude]);
      }
    }
  });
  </script>
  