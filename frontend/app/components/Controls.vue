<template>
  <div class="grid grid-cols-[max-content_1fr_55px] gap-2 items-baseline">
    <span>Transparenz</span>
    <USlider v-model="baseOpacity" :min="0" :max="1" :step="0.01" size="sm"/>
    {{ baseOpacity.toFixed(2) }}

    <span>Layer</span>
    <USelect v-model="sourceKey" :items="sourceSelection"/>
    <span>{{ sourceKey ?? '&nbsp;' }}</span>

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
    <USlider v-model="yearSliderDeadzone" :min="0" :max="0.5" :step="0.01" size="sm" :disabled="!options.fadeYears || playing"/>
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
      <USwitch v-model="options.preload"/>
      <span>Alle Jahre vorladen</span>
    </div>
    <div class="flex gap-1">
      <USwitch v-model="options.fadeYears"/>
      <span>Jahre überblenden</span>
    </div>
    <div class="flex gap-1">
      <USwitch v-model="options.grayscale"/>
      <span>nur Graustufen</span>
    </div>
    <div class="flex gap-1">
      <USwitch v-model="options.debug"/>
      <span>Debug</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const options = useMapOptions()

const props = defineProps({
  sources: { type: Object, required: true },
  yearDisplay: { type: String, required: true }
})

const source = defineModel('source', { type: Object, required: true })
const baseOpacity = defineModel('baseOpacity', { type: Number, required: true })
const yearSlider = defineModel('yearSlider', { type: Number, required: true })
const yearSliderDeadzone = defineModel('yearSliderDeadzone', { type: Number, required: true })

const playingSpeed = ref(1)

const yearSliderStep = computed(() => options.value.fadeYears ? 0.01 : 1)
const years = computed(() => Object.keys(source.value?.years ?? {}).sort())

const sourceSelection = computed(() => {
  if (!props.sources) {
    return []
  }
  return Object.entries(props.sources)
    .map(([key, value]) => ({
      value: key,
      label: value.name
    }))
})
const sourceKey = ref(sourceSelection.value?.[0]?.value)
watch(sourceKey, (key) => {
  if (!key) {
    return
  }
  source.value = props.sources[key]
  yearSlider.value = 0
}, { immediate: true })

const playing = useIncrementPlayer(yearSlider, { 
  speed: playingSpeed,
  step: yearSliderStep,
  min: 0,
  max: computed(() => years.value.length - 1)
})

watch(() => options.value.fadeYears, (enabled) => {
  if (!enabled) {
    yearSlider.value = Math.round(yearSlider.value)
  }
})

</script>