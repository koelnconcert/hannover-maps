<template>
  <div class="w-screen h-screen" :class="{ grayscaleForLayers : grayscale }">
    <LMap :use-global-leaflet="false" v-model:zoom="zoom" v-model:center="center" :maxBounds="maxBounds"
      :minZoom="minZoom" :maxZoom="maxZoom">
      <template v-for="(year, index) in years" :key="year">
        <LTileLayer :url="config.public.tileBaseUrl + 'dop/' + year + '/{z}/{x}/{y}.png'" :tms="true" layer-type="overlay"
          :name="'DOP ' + year" :visible="preload || yearsOpacity[index] > 0" :opacity="yearsOpacity[index]" :min-zoom="minZoom" :max-zoom="maxZoom" :z-index="1" :options="dopOptions"/>
      </template>
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="overlay" name="OpenStreetMap" :opacity="baseOpacity" :z-index="2"/>
      <LGridLayer :visible="debugGrid" :child-render="debugGridLayer" layer-type="overlay" name="Debug Grid" :z-index="3"/>
      <div class="relative flex justify-around w-full m-3">
        <div class="relative z-1000 w-1/3 cursor-default text-gray-800">
          <div class="border-2 border-gray-300 rounded-sm bg-gray-100 p-3">
            <div class="grid grid-cols-[max-content_1fr_55px] gap-2">
              <span>Transparenz</span>
              <USlider v-model="baseOpacity" :min="0" :max="1" :step="0.01" size="sm" />
              {{ baseOpacity }}

              <span>Jahr</span>
              <USlider v-model="yearSlider" :min="0" :max="years.length - 1" :step="fadeYears ? 0.1 : 1" size="sm" />
              {{ year }}
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
          </div>
        </div>
      </div>
    </LMap>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LGridLayer } from "@vue-leaflet/vue-leaflet"

const config = useRuntimeConfig()

const zoom = ref(12)
const minZoom = ref(12)
const maxZoom = ref(22)
const center = ref([52.4, 9.7])
const maxBounds = ref([[52.2, 9.6], [53, 10]])
const dopOptions = {
  minNativeZoom: 12,
  maxNativeZoom: 19
}

const baseOpacity = ref(0.2)
const yearSlider = ref(0)
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
  const round = Math.round(value)
  const floor = Math.floor(value)
  const ceil = Math.ceil(value)
  return [...Array(years.value.length).keys()].map(i => {
    if (i < floor || i > ceil) {
      return 0
    }
    if (value == ceil) {
      return 1
    }
    if (i == floor) {
      return 1
    }
    if (i == ceil) {
      return value - floor
    }
    return 0 // should not happen
  })
})

watch(fadeYears, (enabled) => {
  if (!enabled) {
    yearSlider.value = Math.round(yearSlider.value)
  }
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