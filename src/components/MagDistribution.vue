<template>
  <div class="mag-dist-inner">
    <h3 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
      震级分布
    </h3>
    <div class="chart-area" ref="chartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { getMagColor } from '../utils/dataLoader.js'

const props = defineProps({ earthquakes: Array })
const chartRef = ref(null)
let lastWidth = 0

function draw() {
  const el = chartRef.value
  if (!el || !props.earthquakes?.length) return

  const rect = el.getBoundingClientRect()
  const width = Math.floor(rect.width) || 280
  const height = Math.floor(rect.height) || 200

  if (Math.abs(width - lastWidth) < 5 && el.querySelector('svg')) return
  lastWidth = width

  d3.select(el).selectAll('*').remove()

  const margin = { top: 20, right: 20, bottom: 44, left: 52 }
  const w = width - margin.left - margin.right
  const h = height - margin.top - margin.bottom

  const bins = [
    { label: '2-3', min: 2, max: 3 },
    { label: '3-4', min: 3, max: 4 },
    { label: '4-5', min: 4, max: 5 },
    { label: '5-6', min: 5, max: 6 },
    { label: '6-7', min: 6, max: 7 },
    { label: '7+', min: 7, max: 11 },
  ]

  bins.forEach(b => {
    b.count = props.earthquakes.filter(d => d.mag >= b.min && d.mag < b.max).length
    b.color = getMagColor(b.min)
  })

  const svg = d3.select(el).append('svg')
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleBand().domain(bins.map(b => b.label)).range([0, w]).padding(0.3)
  const y = d3.scaleLinear().domain([0, d3.max(bins, b => b.count) * 1.15]).nice().range([h, 0])

  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call(g => g.select('.domain').attr('stroke', '#e2e5ed'))
    .selectAll('text')
    .attr('fill', '#64748b')
    .attr('dy', '0.8em')
    .style('font-size', '13px')

  g.append('text')
    .attr('x', w / 2)
    .attr('y', h + 36)
    .attr('text-anchor', 'middle')
    .attr('fill', '#475569')
    .style('font-size', '12px')
    .style('font-weight', '500')
    .text('震级范围 (M)')

  g.append('g')
    .call(d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat(d3.format('~s')))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line').attr('stroke', '#f0f1f5'))
    .selectAll('text')
    .attr('fill', '#64748b')
    .style('font-size', '12px')

  g.selectAll('.bar')
    .data(bins)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.label))
    .attr('y', h)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .attr('rx', 4)
    .attr('fill', d => d.color)
    .attr('fill-opacity', 0.85)
    .transition()
    .duration(600)
    .delay((_, i) => i * 80)
    .attr('y', d => y(d.count))
    .attr('height', d => h - y(d.count))

  g.selectAll('.bar-label')
    .data(bins)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', d => x(d.label) + x.bandwidth() / 2)
    .attr('y', d => y(d.count) - 8)
    .attr('text-anchor', 'middle')
    .attr('fill', '#475569')
    .style('font-size', '13px')
    .style('font-weight', '600')
    .text(d => d.count > 0 ? d.count : '')
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
.mag-dist-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chart-area {
  flex: 1;
  min-height: 300px;
}
</style>
