<template>
  <LTileLayer 
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
    layer-type="overlay" 
    name="OpenStreetMap" 
    :visible="opacity > 0" 
    :opacity="opacity" 
    :min-zoom="config.minZoom" 
    :max-zoom="config.maxZoom" 
    :z-index="zIndex" 
    :options="{ minNativeZoom: config.minZoom, maxNativeZoom: 18}"
    :attribution="attribution"
  />
</template>

<script setup lang="ts">
import { LTileLayer } from "@vue-leaflet/vue-leaflet"

defineProps({
  opacity: { type: Number, required: true },
  zIndex: Number
})

const config = useMapConfig()
  
const attribution = '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
</script>