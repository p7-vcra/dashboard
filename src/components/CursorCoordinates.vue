<template>
    <div ref="cursorBox" class="cursor-coordinates">
        Latitude: {{ latitude }}, Longitude: {{ longitude }}
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';

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
    },
    setup() {
        const cursorBox = ref<HTMLElement | null>(null);

        const updatePosition = () => {
            if (cursorBox.value) {
                const mapWidth = window.innerWidth; // Assuming the map takes the full width of the window
                cursorBox.value.style.left = `${mapWidth / 2}px`;
            }
        };

        onMounted(() => {
            window.addEventListener('resize', updatePosition);
            updatePosition(); // Initial position update
        });

        onBeforeUnmount(() => {
            window.removeEventListener('resize', updatePosition);
        });

        return {
            cursorBox,
        };
    },
});
</script>

<style scoped>
.cursor-coordinates {
    position: absolute;
    bottom: 100px;
    transform: translateX(-50%);
    background-color: rgba(255, 255, 255, 0.8);
    padding: 5px;
    border-radius: 3px;
    font-size: 14px;
    z-index: 1000; /* Ensure it is above the map */
}
</style>