<template>
  <LGridLayer 
    :visible="visible" 
    :child-render="debugGridLayer" 
    layer-type="overlay" 
    name="Debug Grid" :z-index="zIndex"/>
</template>

<script setup lang="ts">
import { LGridLayer } from "@vue-leaflet/vue-leaflet"

defineProps({
  visible: Boolean,
  zIndex: Number
})

const debugGridLayer = function (tile: any) {
  return () => {
    return h("div",
      { style: "border: 1px solid black; height: 100%; color: black;" },
      [tile.coords.z, tile.coords.x, tile.coords.y].join('/')
    )
  }
}
</script>

