<template>
  <div class="w-screen h-screen" :class="{ grayscaleForLayers : grayscale }">
    <LMap :use-global-leaflet="false" v-model:zoom="zoom" v-model:center="center" :maxBounds="maxBounds"
      :minZoom="config.minZoom" :maxZoom="config.maxZoom">
      <MapSourceLayerMultipleYears
         :source="sourceSelected"
         :year-slider="yearSlider"
         :year-slider-deadzone="yearSliderDeadzone"
         :z-index-base="100"
         :preload="preload"
         @return:year-display="yearDisplay = $event"
      />
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="overlay" name="OpenStreetMap" :visible="baseOpacity > 0" :opacity="baseOpacity" :min-zoom="config.minZoom" :max-zoom="config.maxZoom" :z-index="800" :options="{ minNativeZoom: config.minZoom, maxNativeZoom: 18}"
        :attribution="attribution.openstreetmap"
      />
      <LayerDebug :visible="debugGrid" :z-index="900"/>
      <MapBox position-x="center" position-y="top" class="p-3">
        <div class="grid grid-cols-[max-content_1fr_55px] gap-2 items-baseline">
          <span>Transparenz</span>
          <USlider v-model="baseOpacity" :min="0" :max="1" :step="0.01" size="sm"/>
          {{ baseOpacity.toFixed(2) }}

          <span>Layer</span>
          <USelect v-model="sourceSelectedKey" :items="sourceSelection"/>
          <span>{{ sourceSelectedKey ?? '&nbsp;' }}</span>

          <span>Jahr</span>
          <div class="flex gap-2">
            <USlider v-model="yearSlider" :min="0" :max="years.length - 1" :step="yearSliderStep" size="sm" :disabled="playing"/>
            <UButtonGroup size="xs">
              <UButton variant="outline" icon="i-lucide-chevron-first" :disabled="playing || yearSlider <= 0" @click="yearSlider = 0"/>
              <UButton variant="outline" icon="i-lucide-chevron-left" :disabled="playing || yearSlider <= 0" @click="yearSlider--"/>
              <UButton variant="outline" icon="i-lucide-chevron-right" :disabled="playing || yearSlider >= years.length - 1" @click="yearSlider++"/>
              <UButton variant="outline" icon="i-lucide-chevron-last" :disabled="playing || yearSlider >= years.length - 1" @click="yearSlider = years.length - 1"/>
            </UButtonGroup>
          </div>
          <span>{{ yearDisplay ?? '&nbsp;' }}</span>

          <span>Jahr-Deadzone</span>
          <USlider v-model="yearSliderDeadzone" :min="0" :max="0.5" :step="0.01" size="sm"/>
          {{ yearSliderDeadzone.toFixed(2) }}

          <span>Animation</span>
          <div class="flex gap-2">
            <USlider v-model="playingSpeed" :min="1" :max="5" :step="0.1" size="sm" :disabled="playing"/>
            <UButton size="xs" variant="outline" :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'" :disabled="yearSlider >= years.length" @click="playing = !playing"/>
          </div>
          <span>{{ playingSpeed }}s</span>

        </div>
        <div class="flex flex-wrap mt-2 gap-x-5 gap-y-2">
          <div class="flex gap-1">
            <USwitch v-model="preload"/>
            <span>Alle Jahre vorladen</span>
          </div>
          <div class="flex gap-1">
            <USwitch v-model="fadeYears"/>
            <span>Jahre überblenden</span>
          </div>
          <div class="flex gap-1">
            <USwitch v-model="grayscale"/>
            <span>nur Graustufen</span>
          </div>
          <div class="flex gap-1">
            <USwitch v-model="debugGrid"/>
            <span>Debug-Grid</span>
          </div>
        </div>
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
const playing = ref(false)
const playingSpeed = ref(1)
const fadeYears = ref(false)
const grayscale = ref(false)
const preload = ref(true)
const debugGrid = ref(false)

const attribution = {
  openstreetmap: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}

const { data: sources } = await useFetch(config.public.tileBaseUrl + 'sources.json')

const sourceSelection = computed(() => {
  if (!sources.value) {
    return []
  }
  return Object.entries(sources.value)
    .map(([key, value]) => ({
      value: key,
      label: value.name
    }))
})
const sourceSelectedKey = ref('dop')
const sourceSelected = computed(() => sources.value?.[sourceSelectedKey.value])
watch(sourceSelected, () => {
  yearSlider.value = 0
})

const years = computed(() => Object.keys(sourceSelected.value?.years ?? {}).sort())
const yearDisplay = ref('??')

const yearSliderStep = computed(() => fadeYears.value ? 0.01 : 1)

watch(fadeYears, (enabled) => {
  if (!enabled) {
    yearSlider.value = Math.round(yearSlider.value)
  }
})

let playingInterval : (NodeJS.Timeout | undefined) = undefined
watch(playing, (enabled) => {
  if (!enabled) {
    if (playingInterval) {
      clearInterval(playingInterval)
      playingInterval = undefined
    }
    return
  }
  if (yearSlider.value == years.value.length - 1) {
    yearSlider.value = 0
  }
  playingInterval = setInterval(() => {
    yearSlider.value += yearSliderStep.value
    if (yearSlider.value >= years.value.length - 1) {
      yearSlider.value = years.value.length - 1
      playing.value = false
    }
  }, 1000 * playingSpeed.value * yearSliderStep.value)
})

</script>

<style scoped>
.grayscaleForLayers :deep(.leaflet-tile-pane) {
  filter: grayscale();
}
</style>