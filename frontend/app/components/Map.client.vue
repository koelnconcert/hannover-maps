<template>
  <div class="w-screen h-screen" :class="{ grayscaleForLayers : options.grayscale }">
    <LMap :use-global-leaflet="false" v-model:zoom="zoom" v-model:center="center" :maxBounds="config.maxBounds"
      :minZoom="config.minZoom" :maxZoom="config.maxZoom">
      <MapLayerMultipleYears
         :source="source"
         :year-slider="yearSlider"
         :year-slider-deadzone="yearSliderDeadzone"
         :z-index-base="100"
         @return:year-display="yearDisplay = $event"
      />
      <MapLayerOpenstreetmap :opacity="baseOpacity" :z-index="200"/>
      <MapLayerDebug v-if="options.debug" :z-index="300"/>
      <MapBox position-x="center" position-y="top" class="p-3">
        <Controls 
          v-model:source="source"
          v-model:base-opacity="baseOpacity"
          v-model:year-slider="yearSlider"
          v-model:year-slider-deadzone="yearSliderDeadzone"
          :sources="sources"
          :year-display="yearDisplay"
        />
      </MapBox>
      <MapBox position-x="right" position-y="top" class="px-1 text-xl">
        {{ yearDisplay }}
      </MapBox>
      <MapBox v-if="options.debug" position-x="left" position-y="bottom" class="px-1">
        <div class="grid grid-cols-[max-content_max-content] gap-x-2 items-baseline">
          zoom <span>{{ zoom }}</span>
          center <span>{{ center }}</span>
          yearSlider <span>{{ yearSlider }}</span>
        </div>
      </MapBox>
    </LMap>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css"
import type { PointExpression } from "leaflet"
import { LMap } from "@vue-leaflet/vue-leaflet"

const config = useMapConfig()
const options = useMapOptions()

const zoom = ref(config.minZoom)
const center = ref<PointExpression>([52.4, 9.7])

const baseOpacity = ref(0.2)
const yearSlider = ref(0)
const yearSliderDeadzone = ref(0.2)
const yearDisplay = ref('??')
const source = ref({})

const { data: sources } = await useFetch(config.public.tileBaseUrl + 'sources.json')
</script>

<style scoped>
.grayscaleForLayers :deep(.leaflet-tile-pane) {
  filter: grayscale();
}
</style>