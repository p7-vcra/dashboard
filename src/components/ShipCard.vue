<template>
  <div class="ship-card">
    <h3>{{ ship.MMSI }}</h3>
    <p>Type: {{ ship.VesselType }}</p>
    <p>Latitude: {{ ship.latitude }}</p>
    <p>Longitude: {{ ship.longitude }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ShipCard',
  props: {
    ship: {
      type: Object,
      required: true
    },
    
  }
});
</script>

<style scoped>
.ship-card {
  border: 1px solid #ccc;
  padding: 16px;
  margin: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>