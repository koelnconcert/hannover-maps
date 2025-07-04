<template>
  <div class="w-screen h-screen">
    <LMap :use-global-leaflet="false" v-model:zoom="zoom" v-model:center="center" :maxBounds="maxBounds"
      :minZoom="minZoom" :maxZoom="maxZoom">
      <LControlLayers/>
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OpenStreetMap" />
      <template v-for="year in years" :key="year">
        <LTileLayer :url="'/tiles/dop/' + year + '/{z}/{x}/{y}.png'" :tms="true" layer-type="overlay" :name="'DOP ' + year" />
      </template>
    </LMap>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LControlLayers } from "@vue-leaflet/vue-leaflet"

const zoom = ref(12)
const minZoom = ref(12)
const maxZoom = ref(19)
const center = ref([52.4, 9.7])
const maxBounds = ref([[52.2, 9.6], [53, 10]])

const years = ref([1957, 1965, 1977, 2023])
</script>