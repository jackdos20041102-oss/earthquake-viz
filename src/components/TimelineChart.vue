<template>
  <div class="timeline-inner">
    <div class="timeline-header">
      <h3 class="section-title">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        时间分布
      </h3>
      <button v-if="brushActive" class="reset-btn" @click="resetBrush">
        <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        重置筛选
      </button>
    </div>
    <div class="chart-area" ref="chartRef"></div>
    <p class="timeline-hint">
      <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" style="opacity:0.5"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
      拖拽选择时间范围以筛选所有图表数据
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as d3 from 'd3'
import dayjs from 'dayjs'
import { getMagColor } from '../utils/dataLoader.js'

const props = defineProps({
  earthquakes: Array,
  dataMode: String
})
const emit = defineEmits(['brushed'])

const chartRef = ref(null)
const brushActive = ref(false)
let svgEl, brushG, xScale
let lastWidth = 0

function draw() {
  const el = chartRef.value
  if (!el || !props.earthquakes?.length) return

  const rect = el.getBoundingClientRect()
  const width = Math.floor(rect.width) || 600
  const height = Math.floor(rect.height) || 280

  if (Math.abs(width - lastWidth) < 5 && el.querySelector('svg')) return
  lastWidth = width

  d3.select(el).selectAll('*').remove()

  const margin = { top: 24, right: 24, bottom: 48, left: 56 }
  const w = width - margin.left - margin.right
  const h = height - margin.top - margin.bottom

  const data = props.earthquakes.slice().sort((a, b) => a.time - b.time)
  const timeExtent = d3.extent(data, d => d.time)

  xScale = d3.scaleTime()
    .domain(timeExtent.map(t => new Date(t)))
    .range([0, w])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mag) * 1.05])
    .nice()
    .range([h, 0])

  svgEl = d3.select(el).append('svg')
    .attr('width', width)
    .attr('height', height)

  const g = svgEl.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(xScale).ticks(8).tickSize(0).tickFormat(d => {
      return props.dataMode === 'historical'
        ? dayjs(d).format('YYYY')
        : dayjs(d).format('MM/DD')
    }))
    .call(g => g.select('.domain').attr('stroke', '#e2e5ed'))
    .selectAll('text')
    .attr('fill', '#64748b')
    .style('font-size', '12px')

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-w))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line').attr('stroke', '#f0f1f5'))
    .selectAll('text')
    .attr('fill', '#64748b')
    .style('font-size', '12px')

  g.append('text')
    .attr('x', -margin.left + 8)
    .attr('y', -10)
    .attr('fill', '#475569')
    .style('font-size', '12px')
    .style('font-weight', '500')
    .text('震级 (M)')

  g.selectAll('.quake-circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'quake-circle')
    .attr('cx', d => xScale(new Date(d.time)))
    .attr('cy', d => y(d.mag))
    .attr('r', d => Math.max(2.5, (d.mag - 2) * 1.5))
    .attr('fill', d => getMagColor(d.mag))
    .attr('fill-opacity', 0.55)
    .attr('stroke', 'none')

  brushG = g.append('g').attr('class', 'brush')

  const brush = d3.brushX()
    .extent([[0, 0], [w, h]])
    .on('end', (event) => {
      if (!event.selection) {
        brushActive.value = false
        emit('brushed', null)
        return
      }
      const [x0, x1] = event.selection.map(xScale.invert)
      brushActive.value = true
      emit('brushed', [x0.getTime(), x1.getTime()])
    })

  brushG.call(brush)

  brushG.selectAll('.selection')
    .attr('fill', 'rgba(196, 60, 76, 0.12)')
    .attr('stroke', '#c43c4c')
    .attr('stroke-width', 1)
}

function resetBrush() {
  if (brushG) {
    brushG.call(d3.brushX().move, null)
  }
  brushActive.value = false
  emit('brushed', null)
}

let ro
onMounted(() => {
  setTimeout(draw, 100)
  ro = new ResizeObserver(() => requestAnimationFrame(draw))
  if (chartRef.value) ro.observe(chartRef.value)
})
onUnmounted(() => ro?.disconnect())
watch(() => props.earthquakes, () => { lastWidth = 0; draw() }, { deep: false })
watch(() => props.dataMode, () => { lastWidth = 0; draw() })
</script>

<style scoped>
.timeline-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart-area {
  flex: 1;
  min-height: 220px;
}
.reset-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  background: rgba(196, 60, 76, 0.08);
  border: 1px solid rgba(196, 60, 76, 0.2);
  color: var(--accent-red);
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 500;
  transition: all 0.2s;
}
.reset-btn:hover {
  background: rgba(196, 60, 76, 0.14);
}
.timeline-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
