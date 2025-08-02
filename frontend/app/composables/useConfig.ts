export default function () {
  return {
    ...useRuntimeConfig(),
    minZoom: 12,
    maxZoom: 22
  }
}