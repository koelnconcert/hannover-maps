<template>
  <div
    class="absolute m-3 z-1000 cursor-default text-gray-800 border-2 border-gray-300 rounded-sm bg-gray-100"
    :class="positionClasses"
    @mousedown.stop
    @pointerdown.stop
    @touchstart.stop
    @dblclick.stop
    @click.stop
    @wheel.stop
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  positionX: 'left' | 'center' | 'right',
  positionY: 'top' | 'center' | 'bottom'
}>()

const positionClasses = computed(() => ({
  "left-0": props.positionX === 'left',
  "left-[50%]": props.positionX === 'center',
  "right-0": props.positionX === 'right',
  "top-0": props.positionY === 'top',
  "top-[50%]": props.positionY === 'center',
  "bottom-0": props.positionY === 'bottom',
  "-translate-x-1/2": props.positionX === 'center',
  "-translate-y-1/2": props.positionY === 'center'
}))
</script>