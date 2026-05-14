<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-mark">
            <svg viewBox="0 0 32 32" width="32" height="32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="#c43c4c" stroke-width="2" />
              <circle cx="16" cy="16" r="7" fill="none" stroke="#c43c4c" stroke-width="1.2" opacity="0.4" />
              <circle cx="16" cy="16" r="3" fill="#c43c4c" />
              <path d="M16 3 L16 6 M16 26 L16 29 M3 16 L6 16 M26 16 L29 16" stroke="#c43c4c" stroke-width="1.5" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <h1 class="app-title">全球地震数据可视化</h1>
            <p class="app-subtitle">Global Earthquake Visualization · USGS 实时数据驱动</p>
          </div>
        </div>
        <div class="header-right">
          <div class="data-mode-tabs">
            <button
              :class="['tab-btn', { active: dataMode === 'recent' }]"
              @click="switchMode('recent')"
            >
              <svg class="tab-icon" viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 8.414l2.293 2.293a1 1 0 01-1.414 1.414l-2.586-2.586A1 1 0 019 11V6a1 1 0 112 0v4.414z"/>
              </svg>
              近30天
            </button>
            <button
              :class="['tab-btn', { active: dataMode === 'historical' }]"
              @click="switchMode('historical')"
            >
              <svg class="tab-icon" viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
                <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V9zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
              </svg>
              历史数据
            </button>
          </div>
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading-screen">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载地震数据…</p>
    </div>

    <main v-else class="main-content">
      <section class="stats-bar fade-in-up">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(196,60,76,0.1);">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#c43c4c" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <div class="stat-number" :style="{ color: 'var(--accent-red)' }">
              {{ filteredData.length.toLocaleString() }}
            </div>
            <div class="stat-label">地震总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(224,119,48,0.1);">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e07730" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
          </div>
          <div>
            <div class="stat-number" :style="{ color: 'var(--accent-orange)' }">
              {{ maxMag.toFixed(1) }}
            </div>
            <div class="stat-label">最大震级</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(212,160,48,0.1);">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#d4a030" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <div class="stat-number" :style="{ color: 'var(--accent-yellow)' }">
              {{ avgMag.toFixed(1) }}
            </div>
            <div class="stat-label">平均震级</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(42,157,110,0.1);">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2a9d6e" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          </div>
          <div>
            <div class="stat-number" :style="{ color: 'var(--accent-green)' }">
              {{ avgDepth.toFixed(0) }}<span class="stat-unit">km</span>
            </div>
            <div class="stat-label">平均深度</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(99,86,184,0.1);">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6356b8" stroke-width="2"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A7 7 0 103 15z"/></svg>
          </div>
          <div>
            <div class="stat-number" :style="{ color: 'var(--accent-purple)' }">
              {{ tsunamiCount }}
            </div>
            <div class="stat-label">海啸预警</div>
          </div>
        </div>
      </section>

      <section class="viz-grid">
        <div class="map-area glass-panel fade-in-up" style="animation-delay: 0.1s">
          <WorldMap
            :earthquakes="filteredData"
            :selectedQuake="selectedQuake"
            :magRange="magRange"
            @select="handleSelect"
            @hover="handleHover"
          />
        </div>

        <div class="side-panel">
          <div class="glass-panel detail-panel fade-in-up" style="animation-delay: 0.15s">
            <DetailPanel :quake="selectedQuake || hoveredQuake" />
          </div>
        </div>
      </section>

      <section class="bottom-grid-2x2">
        <div class="glass-panel chart-cell fade-in-up" style="animation-delay: 0.25s">
          <TimelineChart
            :earthquakes="currentData"
            :dataMode="dataMode"
            @brushed="handleTimeBrush"
          />
        </div>
        <div class="glass-panel chart-cell fade-in-up" style="animation-delay: 0.3s">
          <DepthMagScatter :earthquakes="filteredData" @select="handleSelect" />
        </div>
        <div class="glass-panel chart-cell fade-in-up" style="animation-delay: 0.35s">
          <RegionStats :earthquakes="filteredData" />
        </div>
        <div class="glass-panel chart-cell fade-in-up" style="animation-delay: 0.4s">
          <MagDistribution :earthquakes="filteredData" />
        </div>
      </section>

      <section class="quake-list-section glass-panel fade-in-up" style="animation-delay: 0.45s">
        <RecentList
          :earthquakes="filteredData"
          :selectedQuake="selectedQuake"
          @select="handleSelect"
        />
      </section>
    </main>

    <footer class="app-footer">
      <div class="footer-inner">
        <p>数据来源：<a href="https://earthquake.usgs.gov/" target="_blank">USGS 美国地质调查局</a> · 板块数据：Peter Bird, 2003</p>
        <p class="footer-tech">Vue 3 + D3.js + ECharts · 交互式数据可视化课程设计</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadRecentData, loadHistoricalData } from './utils/dataLoader.js'
import WorldMap from './components/WorldMap.vue'
import DetailPanel from './components/DetailPanel.vue'
import MagDistribution from './components/MagDistribution.vue'
import TimelineChart from './components/TimelineChart.vue'
import DepthMagScatter from './components/DepthMagScatter.vue'
import RegionStats from './components/RegionStats.vue'
import RecentList from './components/RecentList.vue'

const loading = ref(true)
const dataMode = ref('recent')
const recentData = ref([])
const historicalData = ref([])
const selectedQuake = ref(null)
const hoveredQuake = ref(null)
const magRange = ref([0, 10])
const timeRange = ref(null)

const currentData = computed(() =>
  dataMode.value === 'recent' ? recentData.value : historicalData.value
)

const filteredData = computed(() => {
  let data = currentData.value
  if (magRange.value) {
    data = data.filter(d => d.mag >= magRange.value[0] && d.mag <= magRange.value[1])
  }
  if (timeRange.value) {
    data = data.filter(d => d.time >= timeRange.value[0] && d.time <= timeRange.value[1])
  }
  return data
})

const maxMag = computed(() => {
  if (!filteredData.value.length) return 0
  return Math.max(...filteredData.value.map(d => d.mag))
})

const avgMag = computed(() => {
  if (!filteredData.value.length) return 0
  return filteredData.value.reduce((s, d) => s + d.mag, 0) / filteredData.value.length
})

const avgDepth = computed(() => {
  if (!filteredData.value.length) return 0
  return filteredData.value.reduce((s, d) => s + d.depth, 0) / filteredData.value.length
})

const tsunamiCount = computed(() =>
  filteredData.value.filter(d => d.tsunami).length
)

function handleSelect(quake) {
  selectedQuake.value = quake
}

function handleHover(quake) {
  hoveredQuake.value = quake
}

function handleTimeBrush(range) {
  timeRange.value = range
}

async function switchMode(mode) {
  dataMode.value = mode
  if (mode === 'historical' && !historicalData.value.length) {
    loading.value = true
    try {
      const hist = await loadHistoricalData()
      historicalData.value = hist.earthquakes
    } catch (e) {
      console.error('加载历史数据失败', e)
    }
    loading.value = false
  }
  selectedQuake.value = null
  timeRange.value = null
}

onMounted(async () => {
  try {
    const recent = await loadRecentData()
    recentData.value = recent.earthquakes
  } catch (e) {
    console.error('加载数据失败', e)
  }
  loading.value = false
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 0 32px;
  height: 66px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-mark {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.app-subtitle {
  font-size: 0.72rem;
  color: var(--text-muted);
  letter-spacing: 0.03em;
  margin-top: 1px;
}

.data-mode-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-primary);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.tab-btn {
  padding: 6px 18px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 7px;
  transition: all 0.2s;
  font-family: var(--font-sans);
  display: flex;
  align-items: center;
  gap: 5px;
}

.tab-icon {
  opacity: 0.6;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: rgba(0,0,0,0.03);
}

.tab-btn.active {
  background: var(--accent-red);
  color: #fff;
  box-shadow: 0 2px 8px rgba(196,60,76,0.25);
}

.tab-btn.active .tab-icon {
  opacity: 1;
}

.loading-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-red);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  color: var(--text-muted);
  font-size: 0.9rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.main-content {
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-unit {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 2px;
}

.viz-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  height: 540px;
}

.map-area {
  padding: 0;
  overflow: hidden;
  position: relative;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-panel {
  padding: 24px;
  flex: 1;
}

.bottom-grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 420px 420px;
  gap: 20px;
}

.chart-cell {
  padding: 24px;
  overflow: hidden;
}

.quake-list-section {
  padding: 20px;
}

.app-footer {
  text-align: center;
  padding: 28px 32px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.footer-inner {
  max-width: 1600px;
  margin: 0 auto;
}

.app-footer p {
  color: var(--text-muted);
  font-size: 0.78rem;
}

.footer-tech {
  margin-top: 4px;
  color: var(--text-muted);
  opacity: 0.7;
}

.app-footer a {
  color: var(--accent-blue);
  text-decoration: none;
}

.app-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 1200px) {
  .viz-grid {
    grid-template-columns: 1fr;
    height: auto;
  }
  .map-area {
    min-height: 480px;
  }
  .stats-bar {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  .app-header {
    padding: 0 16px;
  }
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  .bottom-grid-2x2 {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .chart-cell {
    min-height: 380px;
  }
}
</style>
