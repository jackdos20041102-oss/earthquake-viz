<template>
  <div class="world-map-wrapper" ref="wrapperRef">
    <div class="map-controls">
      <h3 class="section-title">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
        地震分布地图
      </h3>
      <div class="mag-filter">
        <span class="filter-label">震级筛选</span>
        <div class="mag-buttons">
          <button
            v-for="opt in magOptions"
            :key="opt.label"
            :class="['mag-btn', { active: activeMagFilter === opt.label }]"
            :style="{ '--btn-color': opt.color }"
            @click="setMagFilter(opt)"
          >{{ opt.label }}</button>
        </div>
      </div>
    </div>
    <div class="map-container" ref="mapRef"></div>
    <div class="map-legend">
      <div class="legend-title">震级图例</div>
      <div class="legend-items">
        <div v-for="item in legendItems" :key="item.label" class="legend-item">
          <span class="legend-dot" :style="{ background: item.color, width: item.size + 'px', height: item.size + 'px' }"></span>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { getMagColor } from '../utils/dataLoader.js'

const props = defineProps({
  earthquakes: Array,
  selectedQuake: Object,
  magRange: Array
})

const emit = defineEmits(['select', 'hover'])

const wrapperRef = ref(null)
const mapRef = ref(null)
const activeMagFilter = ref('全部')
let svg, g, projection, path, zoom
let isDrawing = false
let lastWidth = 0

const magOptions = [
  { label: '全部', min: 0, max: 10, color: '#94a3b8' },
  { label: 'M3+', min: 3, max: 10, color: '#2a9d6e' },
  { label: 'M5+', min: 5, max: 10, color: '#d4a030' },
  { label: 'M6+', min: 6, max: 10, color: '#e07730' },
  { label: 'M7+', min: 7, max: 10, color: '#c43c4c' },
]

const legendItems = [
  { label: 'M3-4', color: '#2a9d6e', size: 5 },
  { label: 'M4-5', color: '#d4a030', size: 7 },
  { label: 'M5-6', color: '#e07730', size: 10 },
  { label: 'M6-7', color: '#d45530', size: 14 },
  { label: 'M7+', color: '#c43c4c', size: 18 },
]

function setMagFilter(opt) {
  activeMagFilter.value = opt.label
  emit('hover', null)
}

function getMagRadius(mag) {
  if (mag >= 7) return 10
  if (mag >= 6) return 7
  if (mag >= 5) return 5
  if (mag >= 4) return 3.5
  return 2.5
}

function getFilteredQuakes() {
  const opt = magOptions.find(o => o.label === activeMagFilter.value)
  if (!opt || !props.earthquakes) return props.earthquakes || []
  return props.earthquakes.filter(d => d.mag >= opt.min && d.mag <= opt.max)
}

function initMap() {
  const container = mapRef.value
  if (!container || isDrawing) return

  const rect = container.getBoundingClientRect()
  const width = Math.floor(rect.width) || 800
  const height = Math.floor(rect.height) || 460

  if (Math.abs(width - lastWidth) < 5 && svg) return
  lastWidth = width
  isDrawing = true

  d3.select(container).selectAll('*').remove()

  projection = d3.geoNaturalEarth1()
    .scale(width / 5.5)
    .translate([width / 2, height / 2])

  path = d3.geoPath().projection(projection)

  svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#eef1f8')
    .style('border-radius', '0 0 16px 16px')

  const defs = svg.append('defs')
  const glow = defs.append('filter').attr('id', 'glow')
  glow.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur')
  const feMerge = glow.append('feMerge')
  feMerge.append('feMergeNode').attr('in', 'blur')
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

  g = svg.append('g')

  const graticule = d3.geoGraticule()
  g.append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', '#d5d9e4')
    .attr('stroke-width', 0.4)

  zoom = d3.zoom()
    .scaleExtent([1, 12])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom)

  loadWorld()
}

async function loadWorld() {
  try {
    const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    const countries = topojson.feature(world, world.objects.countries)

    g.selectAll('.country')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', '#dce0ec')
      .attr('stroke', '#c8cdd8')
      .attr('stroke-width', 0.5)

    isDrawing = false
    drawQuakes()
  } catch (e) {
    console.warn('Failed to load world map', e)
    isDrawing = false
    drawQuakes()
  }
}

function drawQuakes() {
  if (!g) return
  g.selectAll('.quake-dot').remove()
  g.selectAll('.quake-pulse').remove()

  const data = getFilteredQuakes()
    .filter(d => d.lng != null && d.lat != null)
    .sort((a, b) => a.mag - b.mag)

  const pulseData = data.filter(d => d.mag >= 6)
  g.selectAll('.quake-pulse')
    .data(pulseData)
    .enter()
    .append('circle')
    .attr('class', 'quake-pulse')
    .attr('cx', d => projection([d.lng, d.lat])?.[0])
    .attr('cy', d => projection([d.lng, d.lat])?.[1])
    .attr('r', d => getMagRadius(d.mag) * 2.5)
    .attr('fill', 'none')
    .attr('stroke', d => getMagColor(d.mag))
    .attr('stroke-width', 1)
    .attr('opacity', 0.4)
    .style('animation', 'pulse 2s ease-in-out infinite')

  const dots = g.selectAll('.quake-dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'quake-dot')
    .attr('cx', d => projection([d.lng, d.lat])?.[0])
    .attr('cy', d => projection([d.lng, d.lat])?.[1])
    .attr('r', d => getMagRadius(d.mag))
    .attr('fill', d => getMagColor(d.mag))
    .attr('fill-opacity', 0.75)
    .attr('stroke', d => getMagColor(d.mag))
    .attr('stroke-width', 0.5)
    .attr('stroke-opacity', 0.4)
    .style('cursor', 'pointer')
    .style('filter', d => d.mag >= 6 ? 'url(#glow)' : 'none')

  dots.on('mouseenter', (event, d) => {
    d3.select(event.currentTarget)
      .transition().duration(150)
      .attr('r', getMagRadius(d.mag) * 2)
      .attr('fill-opacity', 1)
    emit('hover', d)
  })
  .on('mouseleave', (event, d) => {
    d3.select(event.currentTarget)
      .transition().duration(150)
      .attr('r', getMagRadius(d.mag))
      .attr('fill-opacity', 0.75)
    emit('hover', null)
  })
  .on('click', (event, d) => {
    emit('select', d)
  })

  if (props.selectedQuake) {
    highlightSelected()
  }
}

function highlightSelected() {
  g.selectAll('.selected-ring').remove()
  if (!props.selectedQuake) return
  const pos = projection([props.selectedQuake.lng, props.selectedQuake.lat])
  if (!pos) return
  g.append('circle')
    .attr('class', 'selected-ring')
    .attr('cx', pos[0])
    .attr('cy', pos[1])
    .attr('r', 18)
    .attr('fill', 'none')
    .attr('stroke', '#c43c4c')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,3')
    .attr('opacity', 0.9)
}

let resizeObserver
onMounted(async () => {
  await nextTick()
  initMap()

  resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(() => initMap())
  })
  if (mapRef.value) resizeObserver.observe(mapRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(() => props.earthquakes, () => drawQuakes(), { deep: false })
watch(() => props.selectedQuake, () => highlightSelected())
watch(activeMagFilter, () => drawQuakes())
</script>

<style scoped>
.world-map-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.mag-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.mag-buttons {
  display: flex;
  gap: 4px;
}

.mag-btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  font-family: var(--font-sans);
}

.mag-btn:hover {
  border-color: var(--btn-color);
  color: var(--btn-color);
}

.mag-btn.active {
  background: var(--btn-color);
  border-color: var(--btn-color);
  color: #fff;
}

.map-container {
  flex: 1;
  min-height: 400px;
  overflow: hidden;
}

.map-legend {
  position: absolute;
  bottom: 16px;
  left: 20px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 0.72rem;
  box-shadow: var(--shadow-sm);
}

.legend-title {
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.legend-dot {
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
