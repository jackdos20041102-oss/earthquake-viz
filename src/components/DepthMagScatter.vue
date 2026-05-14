<template>
  <div class="scatter-inner">
    <h3 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="7.5" r="1.5"/><circle cx="7.5" cy="16.5" r="1.5"/>
      </svg>
      深度 × 震级关系
    </h3>
    <div class="chart-area" ref="chartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { getDepthColor } from '../utils/dataLoader.js'

const props = defineProps({ earthquakes: Array })
const emit = defineEmits(['select'])
const chartRef = ref(null)
let lastWidth = 0

function draw() {
  const el = chartRef.value
  if (!el || !props.earthquakes?.length) return

  const rect = el.getBoundingClientRect()
  const width = Math.floor(rect.width) || 400
  const height = Math.floor(rect.height) || 280

  if (Math.abs(width - lastWidth) < 5 && el.querySelector('svg')) return
  lastWidth = width

  d3.select(el).selectAll('*').remove()

  const margin = { top: 24, right: 24, bottom: 52, left: 58 }
  const w = width - margin.left - margin.right
  const h = height - margin.top - margin.bottom

  const data = props.earthquakes.filter(d => d.depth >= 0)

  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.mag) - 0.3, d3.max(data, d => d.mag) + 0.3])
    .range([0, w])

  const y = d3.scaleLinear()
    .domain([0, Math.min(d3.max(data, d => d.depth), 700)])
    .range([0, h])

  const svg = d3.select(el).append('svg')
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(0))
    .call(g => g.select('.domain').attr('stroke', '#e2e5ed'))
    .selectAll('text')
    .attr('fill', '#64748b')
    .style('font-size', '12px')

  g.append('text')
    .attr('x', w / 2)
    .attr('y', h + 42)
    .attr('text-anchor', 'middle')
    .attr('fill', '#475569')
    .style('font-size', '13px')
    .style('font-weight', '500')
    .text('震级 (M)')

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-w))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line').attr('stroke', '#f0f1f5'))
    .selectAll('text')
    .attr('fill', '#64748b')
    .style('font-size', '12px')

  g.append('text')
    .attr('x', -margin.left + 6)
    .attr('y', -10)
    .attr('fill', '#475569')
    .style('font-size', '12px')
    .style('font-weight', '500')
    .text('深度 (km) ↓')

  const depthBands = [
    { y0: 0, y1: 70, label: '浅源 (<70km)', color: 'rgba(42, 157, 110, 0.06)' },
    { y0: 70, y1: 300, label: '中源 (70-300km)', color: 'rgba(46, 125, 181, 0.06)' },
    { y0: 300, y1: 700, label: '深源 (>300km)', color: 'rgba(99, 86, 184, 0.06)' },
  ]
  depthBands.forEach(band => {
    const yy0 = y(band.y0)
    const yy1 = y(Math.min(band.y1, d3.max(data, d => d.depth)))
    if (yy1 > yy0) {
      g.append('rect')
        .attr('x', 0).attr('y', yy0)
        .attr('width', w).attr('height', yy1 - yy0)
        .attr('fill', band.color)

      g.append('text')
        .attr('x', w - 8)
        .attr('y', (yy0 + yy1) / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#94a3b8')
        .style('font-size', '11px')
        .style('font-weight', '500')
        .text(band.label)
    }
  })

  const sampled = data.length > 2000
    ? data.filter((_, i) => i % Math.ceil(data.length / 2000) === 0)
    : data

  g.selectAll('.scatter-dot')
    .data(sampled)
    .enter()
    .append('circle')
    .attr('class', 'scatter-dot')
    .attr('cx', d => x(d.mag))
    .attr('cy', d => y(Math.min(d.depth, 700)))
    .attr('r', 4)
    .attr('fill', d => getDepthColor(d.depth))
    .attr('fill-opacity', 0.55)
    .attr('stroke', d => getDepthColor(d.depth))
    .attr('stroke-width', 0.5)
    .attr('stroke-opacity', 0.3)
    .style('cursor', 'pointer')
    .on('mouseenter', function () {
      d3.select(this).attr('r', 8).attr('fill-opacity', 0.9)
    })
    .on('mouseleave', function () {
      d3.select(this).attr('r', 4).attr('fill-opacity', 0.55)
    })
    .on('click', (event, d) => emit('select', d))
}

let ro
onMounted(() => {
  setTimeout(draw, 100)
  ro = new ResizeObserver(() => requestAnimationFrame(draw))
  if (chartRef.value) ro.observe(chartRef.value)
})
onUnmounted(() => ro?.disconnect())
watch(() => props.earthquakes, () => { lastWidth = 0; draw() }, { deep: false })
</script>

<style scoped>
.scatter-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chart-area {
  flex: 1;
  min-height: 220px;
}
</style>
