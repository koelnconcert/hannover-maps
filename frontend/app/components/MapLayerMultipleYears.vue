<template>
  <template v-for="(year, index) in years" :key="year">
    <MapLayerSingleYear  
      :source="source"
      :year="Number(year)"
      :visible="preload || (yearsOpacity[index] ?? 0) > 0" 
      :opacity="yearsOpacity[index]" 
      :z-index="100 + index" 
    />
  </template>
</template>

<script setup lang="ts">
const props = defineProps({
  source: {
    type: Object,
    required: true
  },
  yearSlider: {
    type: Number,
    required: true
  },
  yearSliderDeadzone: {
    type: Number,
    required: true
  },
  zIndexBase: {
    type: Number,
    required: true
  },
  preload: {
    type: Boolean,
    default: () => false
  }
})

const emit = defineEmits(['return:yearDisplay'])

const years = computed(() => Object.keys(props.source.years ?? {}).sort())

const yearsOpacity = computed(() => {
  const value = props.yearSlider
  const floor = Math.floor(value)
  const ceil = Math.ceil(value)
  const diff = value - floor
  const deadzone = props.yearSliderDeadzone
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

const yearDisplay = computed(() => {
  const yy = yearsOpacity.value.entries()
    .filter(([, value]) => value > 0)
    .map(([index]) => years.value[index])
  return Array.from(yy).join('/')
})
watch(yearDisplay, (value) => {
  emit('return:yearDisplay', value)
}, { immediate: true })

</script>