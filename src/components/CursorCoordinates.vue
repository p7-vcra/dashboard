<template>
    <div class="cursor-coordinates">
        Latitude: {{ latitude }}, Longitude: {{ longitude }}
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    }
});
</script>

<style scoped>
.cursor-coordinates {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 255, 255, 0.8);
    padding: 5px;
    border-radius: 3px;
    font-size: 14px;
    z-index: 1000; /* Ensure it is above the map */
}
</style>