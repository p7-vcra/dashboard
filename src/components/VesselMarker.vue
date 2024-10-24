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
    history: {
      type: Array,
      required: true
    },
    onMarkerClick: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const marker = ref<L.Marker | null>(null);

    // Function to calculate the bearing angle between two geographical points
    function getBearing(startLat, startLon, endLat, endLon) {
      const radiansPerDegree = Math.PI / 180; // Conversion from degrees to radians
      const startLatRadians = startLat * radiansPerDegree; 
      const endLatRadians = endLat * radiansPerDegree; 
      const deltaLonRadians = (endLon - startLon) * radiansPerDegree; // Difference in longitude in radians

      const y = Math.sin(deltaLonRadians) * Math.cos(endLatRadians); // Calculate y component
      const x = Math.cos(startLatRadians) * Math.sin(endLatRadians) -
          Math.sin(startLatRadians) * Math.cos(endLatRadians) * Math.cos(deltaLonRadians); // Calculate x component
      const theta = Math.atan2(y, x); // Calculate angle in radians
      
      const bearing = (theta * 180 / Math.PI + 360) % 360; // Convert angle to degrees and normalize
      return bearing; // Return the bearing angle
    }

    // Function to get the rotation angle based on the vessel's history
    const getRotationAngle = (history) => {
      if (history.length < 2) return history.heading; // Return heading if history has less than 2 points
      const p1 = history[history.length - 2]; // Second last point
      const p2 = history[history.length - 1]; // Last point
      const bearing = getBearing(p1.latitude, p1.longitude, p2.latitude, p2.longitude); // Calculate bearing between last two points
      const angle = bearing % 360; // Adjust angle to correct for SVG orientation
      if (isNaN(bearing) || isNaN(angle)) {
      console.warn('Bearing or angle is NaN, setting to 0'); // Warn if bearing or angle is NaN
      return 0; // Return 0 if bearing or angle is NaN
      }

      return angle; // Return the calculated angle
    };

    const customIcon = (angle: number) => {
      return L.divIcon({
        html: `<svg viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${angle}deg); transform-origin: center bottom">
                <path d="M12.5 0 L25 41 Q12.5 35 0 41 Z"/>
              </svg>`,
        className: 'custom-icon',
        iconSize: [15, 16],
        iconAnchor: [12.5, 16]
      });
    };

    onMounted(() => {
      if (props.latitude !== undefined && props.longitude !== undefined && props.map) {
        const angle = getRotationAngle(props.history);
        //(`Creating marker for vessel with MMSI ${props.mmsi} at (${props.latitude}, ${props.longitude}) with angle ${angle}`);
        marker.value = L.marker([props.latitude, props.longitude], { icon: customIcon(angle) })
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

    watch(() => [props.latitude, props.longitude, props.history], ([newLat, newLng, newHistory]) => {
      if (marker.value) {
        const angle = getRotationAngle(newHistory);
        console.log(`Updating marker position for vessel with MMSI ${props.mmsi} to (${newLat}, ${newLng}`);
        marker.value.setLatLng([newLat, newLng]);
        marker.value.setIcon(customIcon(angle));
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
