type IncrementPlayerOptions = {
  /** number of seconds for one full increment (1).*/
  speed: number|Ref<number>,
  /** increment by this amount */
  step: number|Ref<number>,
  min?: number|Ref<number>,
  max: number|Ref<number>
}

/** 
 * Increments the given counter in fixed interval forever or until a given maximum value is reached. 
 * 
 * Returns a boolean ref, by which incrementing can be started or stopped.
*/
export default function(counter: Ref<number>, options: IncrementPlayerOptions) {
  const playing = ref(false)
  let interval : (NodeJS.Timeout | undefined) = undefined

  watch(playing, (enabled) => {
    if (!enabled) {
      if (interval) {
        clearInterval(interval)
        interval = undefined
      }
      return
    }

    if (counter.value === toValue(options.max)) {
      if (options.min === undefined) {
        return
      }
      counter.value = toValue(options.min)
    }
    
    const ms = 1000 * toValue(options.speed) * toValue(options.step)

    interval = setInterval(() => {
      counter.value += toValue(options.step)
      if (counter.value >= toValue(options.max)) {
        counter.value = toValue(options.max)
        playing.value = false
      }
    }, ms)
  })

  return playing
}