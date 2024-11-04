<template>
  <div>
    <button @click="toggleMenu" class="hamburger-button">
      &#9776;
    </button>
    <div :class="['menu-content', { 'menu-open': isMenuOpen }]">
      <button @click="selectView('map')">Map View</button>
      <button @click="selectView('dashboard')">Dashboard View</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'HamburgerMenu',
  emits: ['viewSelected', 'menuToggled'],
  setup(_, { emit }) {
    const isMenuOpen = ref(false);

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
      emit('menuToggled', isMenuOpen.value);
    };

    const selectView = (view: string) => {
      emit('viewSelected', view);
      isMenuOpen.value = false;
      emit('menuToggled', isMenuOpen.value);
    };

    return {
      isMenuOpen,
      toggleMenu,
      selectView
    };
  }
});
</script>

<style scoped>
.hamburger-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

.menu-content {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100%;
  background: white;
  border-right: 1px solid #ccc;
  padding: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 999;
}

.menu-open {
  left: 0;
}

.menu-content button {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}
</style>