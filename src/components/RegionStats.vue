<template>
  <div class="region-inner">
    <h3 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
      </svg>
      区域统计
    </h3>
    <div class="chart-area" ref="chartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({ earthquakes: Array })
const chartRef = ref(null)
let chart

function classifyRegion(lat, lng) {
  if (lat >= -60 && lat <= 60 && lng >= -180 && lng <= -30) return '美洲'
  if (lat >= 10 && lat <= 70 && lng >= -30 && lng <= 60) return '欧洲'
  if (lat >= -40 && lat <= 10 && lng >= -30 && lng <= 60) return '非洲'
  if (lat >= 10 && lat <= 80 && lng >= 60 && lng <= 180) return '亚洲'
  if (lat >= -50 && lat <= 10 && lng >= 60 && lng <= 180) return '大洋洲'
  if (lat < -60) return '南极'
  return '其他'
}

function draw() {
  if (!chartRef.value || !props.earthquakes?.length) return

  if (!chart) {
    chart = echarts.init(chartRef.value, null, { renderer: 'canvas' })
  }

  const regionCounts = {}
  props.earthquakes.forEach(d => {
    const region = classifyRegion(d.lat, d.lng)
    regionCounts[region] = (regionCounts[region] || 0) + 1
  })

  const regionColors = {
    '亚洲': '#c43c4c',
    '美洲': '#e07730',
    '大洋洲': '#2a9d6e',
    '欧洲': '#2e7db5',
    '非洲': '#d4a030',
    '南极': '#6356b8',
    '其他': '#94a3b8',
  }

  const data = Object.entries(regionCounts)
    .map(([name, value]) => ({
      name,
      value,
      itemStyle: { color: regionColors[name] || '#94a3b8' }
    }))
    .sort((a, b) => b.value - a.value)

  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#e2e5ed',
      textStyle: { color: '#1e293b', fontSize: 14 },
      formatter: '{b}: {c} ({d}%)',
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08);'
    },
    series: [{
      type: 'pie',
      radius: ['38%', '68%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 5
      },
      label: {
        color: '#475569',
        fontSize: 14,
        fontWeight: 500,
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        lineStyle: { color: '#d0d4de' }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 16,
          shadowColor: 'rgba(0,0,0,0.12)'
        },
        label: {
          fontWeight: 700
        }
      },
      data
    }]
  }, true)
}

let ro
onMounted(() => {
  setTimeout(draw, 150)
  ro = new ResizeObserver(() => {
    chart?.resize()
  })
  if (chartRef.value) ro.observe(chartRef.value)
})
onUnmounted(() => {
  chart?.dispose()
  ro?.disconnect()
})
watch(() => props.earthquakes, draw, { deep: false })
</script>

<style scoped>
.region-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chart-area {
  flex: 1;
  min-height: 250px;
}
</style>
