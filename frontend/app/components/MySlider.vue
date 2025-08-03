<!--
Wrapper around USlider adding e.g. wheepAction. 

Only the props relevant for the wrapper itself are defined. All other are just passthrough. So no autocompletion in IDE.

Note: Ideally we want to import USliderProps and enhance it. This did not work, probable because the type is too complex, see https://vuejs.org/api/sfc-script-setup.html#type-only-props-emit-declarations
-->
<template>
  <USlider 
    v-model=model 
    :min="min"
    :max="max"
    :step="step"
    @wheel="wheel"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  min: number,
  max: number,
  step?: number,
  wheelStep?: number
}>()
const model = defineModel({ type: Number, required: true })

function wheel (event: WheelEvent) {
  const step = props.wheelStep ?? props.step ?? 1
  const delta = event.deltaY || event.deltaX || event.deltaZ || 0
  const newValue = model.value - Math.sign(delta) * step
  model.value = clampNumber(newValue, props.min, props.max)
}
</script>