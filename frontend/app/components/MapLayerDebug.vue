<template>
  <LGridLayer 
    name="Debug Grid" 
    :child-render="debugGridLayer" 
    layer-type="overlay" 
    :z-index="zIndex"/>
  <LRectangle 
    :bounds="config.maxBounds"
    :fill="false"
    color="#ff3333"
  />
</template>

<script setup lang="ts">
import { LGridLayer, LRectangle } from "@vue-leaflet/vue-leaflet"

const config = useConfig()

defineProps({
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

