<template>
  <div class="w-screen h-screen" :class="{ grayscaleForLayers : grayscale }">
    <LMap :use-global-leaflet="false" v-model:zoom="zoom" v-model:center="center" :maxBounds="maxBounds"
      :minZoom="config.minZoom" :maxZoom="config.maxZoom">
      <MapLayerMultipleYears
         :source="source"
         :year-slider="yearSlider"
         :year-slider-deadzone="yearSliderDeadzone"
         :z-index-base="100"
         :preload="preload"
         @return:year-display="yearDisplay = $event"
      />
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="overlay" name="OpenStreetMap" :visible="baseOpacity > 0" :opacity="baseOpacity" :min-zoom="config.minZoom" :max-zoom="config.maxZoom" :z-index="800" :options="{ minNativeZoom: config.minZoom, maxNativeZoom: 18}"
        :attribution="attribution.openstreetmap"
      />
      <MapLayerDebug :visible="debugGrid" :z-index="900"/>
      <MapBox position-x="center" position-y="top" class="p-3">
        <Controls 
          v-model:source="source"
          v-model:base-opacity="baseOpacity"
          v-model:year-slider="yearSlider"
          v-model:year-slider-deadzone="yearSliderDeadzone"
          v-model:preload="preload"
          v-model:grayscale="grayscale"
          v-model:debug-grid="debugGrid"
          :sources="sources"
          :year-display="yearDisplay"
        />
      </MapBox>
      <MapBox position-x="right" position-y="top" class="px-1 text-xl">
        {{ yearDisplay }}
      </MapBox>
    </LMap>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css"
import type { PointExpression } from "leaflet"
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet"

const config = useConfig()

const zoom = ref(12)
const center = ref<PointExpression>([52.4, 9.7])
const maxBounds = ref([[52.2, 9.6], [53, 10]])

const baseOpacity = ref(0.2)
const yearSlider = ref(0)
const yearSliderDeadzone = ref(0.2)
const yearDisplay = ref('??')
const source = ref({})

const grayscale = ref(false)
const preload = ref(true)
const debugGrid = ref(false)

const attribution = {
  openstreetmap: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}

const { data: sources } = await useFetch(config.public.tileBaseUrl + 'sources.json')
</script>

<style scoped>
.grayscaleForLayers :deep(.leaflet-tile-pane) {
  filter: grayscale();
}
</style>