<template>
  <div class="detail-panel-inner">
    <h3 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      地震详情
    </h3>
    <div v-if="quake" class="detail-content">
      <div class="mag-badge" :style="{ background: magBg, color: magColor }">
        M{{ quake.mag.toFixed(1) }}
        <span class="mag-type">{{ magLabel }}</span>
      </div>
      <div class="detail-rows">
        <div class="detail-row">
          <div class="detail-key">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
            位置
          </div>
          <span class="detail-val">{{ quake.place }}</span>
        </div>
        <div class="detail-row">
          <div class="detail-key">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
            时间
          </div>
          <span class="detail-val">{{ quake.timeStr }}</span>
        </div>
        <div class="detail-row">
          <div class="detail-key">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            深度
          </div>
          <span class="detail-val">{{ quake.depth.toFixed(1) }} km · <span :style="{ color: depthColor }">{{ depthLabel }}</span></span>
        </div>
        <div class="detail-row">
          <div class="detail-key">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 012 2v1a2 2 0 002 2v.5a.5.5 0 00.5.5 .5.5 0 01.5.5v.5A6.003 6.003 0 014.332 8.027z" clip-rule="evenodd"/></svg>
            坐标
          </div>
          <span class="detail-val mono">{{ quake.lat.toFixed(3) }}°, {{ quake.lng.toFixed(3) }}°</span>
        </div>
        <div v-if="quake.tsunami" class="detail-row tsunami-row">
          <div class="detail-key">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            海啸
          </div>
          <span class="detail-val warning">已触发海啸预警</span>
        </div>
      </div>
      <a v-if="quake.url" :href="quake.url" target="_blank" class="detail-link">
        查看 USGS 详情
        <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>
      </a>
    </div>
    <div v-else class="detail-empty">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
        </svg>
      </div>
      <p>点击或悬停地图上的地震点<br/>查看详细信息</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getMagColor, getMagLabel, getDepthLabel, getDepthColor } from '../utils/dataLoader.js'

const props = defineProps({
  quake: Object
})

const magColor = computed(() => props.quake ? getMagColor(props.quake.mag) : '#94a3b8')
const magBg = computed(() => {
  if (!props.quake) return 'transparent'
  const c = getMagColor(props.quake.mag)
  return c + '18'
})
const magLabel = computed(() => props.quake ? getMagLabel(props.quake.mag) : '')
const depthLabel = computed(() => props.quake ? getDepthLabel(props.quake.depth) : '')
const depthColor = computed(() => props.quake ? getDepthColor(props.quake.depth) : '#94a3b8')
</script>

<style scoped>
.detail-panel-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mag-badge {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.mag-type {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.8;
}

.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-key {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-val {
  font-size: 0.88rem;
  color: var(--text-primary);
  word-break: break-word;
}

.detail-val.mono {
  font-family: var(--font-mono);
  font-size: 0.82rem;
}

.detail-val.warning {
  color: var(--accent-red);
  font-weight: 600;
}

.tsunami-row {
  background: rgba(196, 60, 76, 0.06);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent-red);
}

.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--accent-blue);
  font-size: 0.82rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.detail-link:hover {
  border-color: var(--accent-blue);
  background: rgba(46, 125, 181, 0.06);
}

.detail-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 12px;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.6;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: var(--bg-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}
</style>
