<template>
  <LTileLayer 
    :url="url" 
    layer-type="overlay"
    :name="source.key + ' ' + year" 
    :min-zoom="config.minZoom"
    :max-zoom="config.maxZoom"
    :visible="visible"
    :opacity="opacity"
    :z-index="zIndex" 
    :options="options"
    :attribution="attribution"
  />
</template>

<script setup lang="ts">
import { LTileLayer } from "@vue-leaflet/vue-leaflet"

const config = useConfig()

const props = defineProps({
  source: {
    type: Object,
    required: true
  },
  year: Number,
  opacity: Number,
  visible: Boolean,
  zIndex: Number
})

const tilesConfig = computed(() => getFromYearOrSourceConfig('tiles'))

const url = computed(() => config.public.tileBaseUrl + 
    props.source.key + '/' + props.year 
    + '/{z}/{x}/{y}.' + tilesConfig.value.fileExtension
)

const attribution = computed(() => {
  let attribution = `<a href="${props.source.website}">${props.source.name}</a>`
  const license = getFromYearOrSourceConfig('license')
  if (license) {
    attribution += ` by ${license.holder} (<a href="${license.url}">${license.name}</a>)`
  }
  return attribution
})

const options = computed(() => ({
    minNativeZoom: tilesConfig.value.minZoom,
    maxNativeZoom: tilesConfig.value.maxZoom
}))

function getFromYearOrSourceConfig(propName: string) {
  const source = props.source
  const year = props.year ?? ''
  return source.years?.[year]?.[propName] ?? source[propName]
}
</script>