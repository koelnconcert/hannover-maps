export default function () {
  return {
    ...useRuntimeConfig(),
    minZoom: 11,
    maxZoom: 22,
    maxBounds: [[52.25, 9.5], [52.5, 10]]
  }
}