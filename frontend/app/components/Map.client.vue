<template>
  <div class="w-screen h-screen" :class="{ grayscaleForLayers : grayscale }">
    <LMap :use-global-leaflet="false" v-model:zoom="zoom" v-model:center="center" :maxBounds="maxBounds"
      :minZoom="minZoom" :maxZoom="maxZoom">
      <template v-for="(year, index) in years" :key="year">
        <LTileLayer :url="config.public.tileBaseUrl + 'dop/' + year + '/{z}/{x}/{y}.png'" :tms="true" layer-type="overlay"
          :name="'DOP ' + year" :visible="preload || yearsOpacity[index] > 0" :opacity="yearsOpacity[index]" :min-zoom="minZoom" :max-zoom="maxZoom" :z-index="1" :options="dopOptions"/>
      </template>
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="overlay" name="OpenStreetMap" :opacity="baseOpacity" :max-zoom="maxZoom" :z-index="2" :options="{ maxNativeZoom: 18}"/>
      <LGridLayer :visible="debugGrid" :child-render="debugGridLayer" layer-type="overlay" name="Debug Grid" :z-index="3"/>
      <MapBox position-x="center" position-y="top" class="p-3">
        <div class="grid grid-cols-[max-content_1fr_55px] gap-2 items-baseline">
          <span>Transparenz</span>
          <USlider v-model="baseOpacity" :min="0" :max="1" :step="0.01" size="sm"/>
          {{ baseOpacity.toFixed(2) }}

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
          {{ year }}

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
        {{ year }}
      </MapBox>
    </LMap>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css"
import type { PointExpression } from "leaflet"
import { LMap, LTileLayer, LGridLayer } from "@vue-leaflet/vue-leaflet"

const config = useRuntimeConfig()

const zoom = ref(12)
const minZoom = ref(12)
const maxZoom = ref(22)
const center = ref<PointExpression>([52.4, 9.7])
const maxBounds = ref([[52.2, 9.6], [53, 10]])
const dopOptions = {
  minNativeZoom: 12,
  maxNativeZoom: 19
}

const baseOpacity = ref(0.2)
const yearSlider = ref(0)
const yearSliderDeadzone = ref(0.2)
const playing = ref(false)
const playingSpeed = ref(1)
const fadeYears = ref(false)
const grayscale = ref(false)
const preload = ref(true)
const debugGrid = ref(false)

const years = ref([1957, 1965, 1977, 1981, 1991, 2002, 2006, 2015, 2021, 2023])

const year = computed(() => {
  const yy = yearsOpacity.value.entries()
    .filter(([, value]) => value > 0)
    .map(([index]) => years.value[index])
  return Array.from(yy).join('/')
})

const yearsOpacity = computed(() => {
  const value = yearSlider.value
  const floor = Math.floor(value)
  const ceil = Math.ceil(value)
  const diff = value - floor
  const deadzone = yearSliderDeadzone.value
  const inUpperDeadzone = diff > 1 - deadzone
  const inLowerDeadzone = diff < deadzone
  return [...Array(years.value.length).keys()].map(i => {
    if (i < floor || i > ceil) {
      return 0
    }
    if (i == floor) {
      return inUpperDeadzone ? 0 : 1
    }
    if (i == ceil) {
      if (inLowerDeadzone) {
        return 0
      } else if (inUpperDeadzone) {
        return 1
      } else {
        return (diff - deadzone) / (1 - 2 * deadzone )
      }
    }
    return 0 // should not happen
  })
})

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

const debugGridLayer = function (props: any) {
  return () => {
    return h("div",
      { style: "border: 1px solid black; height: 100%; color: black;" },
      [props.coords.z, props.coords.x, props.coords.y].join('/')
    )
  }
}
</script>

<style scoped>
.grayscaleForLayers :deep(.leaflet-tile-pane) {
  filter: grayscale();
}
</style>