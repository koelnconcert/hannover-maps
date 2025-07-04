<template>
  <div class="w-screen h-screen">
    <LMap :use-global-leaflet="false" v-model:zoom="zoom" v-model:center="center" :maxBounds="maxBounds"
      :minZoom="minZoom" :maxZoom="maxZoom">
      <template v-for="(year, index) in years" :key="year">
        <LTileLayer :url="'/tiles/dop/' + year + '/{z}/{x}/{y}.png'" :tms="true" layer-type="overlay"
          :name="'DOP ' + year" :visible="true" :opacity="yearsOpacity[index]" />
      </template>
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="overlay" name="OpenStreetMap" :opacity="baseOpacity"/>
      <div class="relative flex justify-around w-full m-3">
        <div class="relative z-1000 w-1/3 cursor-default text-gray-800">
          <div class="border-2 border-gray-300 rounded-sm bg-gray-100 p-3">
            <div class="grid grid-cols-[max-content_1fr_55px] gap-2">
              <span>Transparenz</span>
              <USlider v-model="baseOpacity" :min="0" :max="1" :step="0.01" size="sm" />
              {{ baseOpacity }}

              <span>Jahr</span>
              <USlider v-model="yearSlider" :min="0" :max="years.length - 1" :step="0.1" size="sm" />
              {{ year }}
            </div>
          </div>
        </div>
      </div>
    </LMap>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet"

const zoom = ref(12)
const minZoom = ref(12)
const maxZoom = ref(19)
const center = ref([52.4, 9.7])
const maxBounds = ref([[52.2, 9.6], [53, 10]])

const baseOpacity = ref(0.2)
const yearSlider = ref(0)

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

</script>