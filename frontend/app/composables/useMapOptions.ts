const options = useLocalStorage('options', {
  fadeYears: false,
  grayscale: false,
  preload: false,
  debug: false
}, { mergeDefaults: true })

export default () => options