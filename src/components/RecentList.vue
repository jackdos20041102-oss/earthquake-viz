<template>
  <div class="list-inner">
    <div class="list-header">
      <h3 class="section-title">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        地震列表
      </h3>
      <div class="list-controls">
        <select v-model="sortBy" class="sort-select">
          <option value="time">按时间排序</option>
          <option value="mag">按震级排序</option>
          <option value="depth">按深度排序</option>
        </select>
        <span class="list-count">共 {{ sortedData.length }} 条</span>
      </div>
    </div>
    <div class="list-body">
      <div
        v-for="(quake, idx) in displayData"
        :key="quake.id || idx"
        :class="['list-item', { selected: selectedQuake?.id === quake.id }]"
        @click="$emit('select', quake)"
      >
        <div class="item-mag-badge" :style="{ background: getMagBg(quake.mag), color: getMagColor(quake.mag) }">
          {{ quake.mag.toFixed(1) }}
        </div>
        <div class="item-info">
          <div class="item-place">{{ quake.place }}</div>
          <div class="item-meta">
            <span class="meta-item">
              <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.5 3a.5.5 0 00-1 0v4a.5.5 0 00.146.354l2 2a.5.5 0 10.708-.708L8.5 7.793V4z"/></svg>
              {{ quake.timeStr }}
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M11.354 7.354a.5.5 0 000-.708l-3-3a.5.5 0 10-.708.708L10.293 7H2.5a.5.5 0 000 1h7.793l-2.647 2.646a.5.5 0 00.708.708l3-3z"/></svg>
              {{ quake.depth.toFixed(0) }}km
            </span>
            <span v-if="quake.tsunami" class="tsunami-tag">
              <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M8 1.45l7.35 13.1H.65L8 1.45zM7.5 6v4h1V6h-1zm0 5v1h1v-1h-1z"/></svg>
              海啸
            </span>
          </div>
        </div>
        <div class="item-depth-indicator">
          <div
            class="depth-fill"
            :style="{
              height: Math.min(quake.depth / 7, 100) + '%',
              background: getDepthColor(quake.depth)
            }"
          ></div>
        </div>
      </div>
      <div v-if="sortedData.length > showCount" class="load-more">
        <button class="load-btn" @click="showCount += 50">
          加载更多
          <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getMagColor, getDepthColor } from '../utils/dataLoader.js'

const props = defineProps({
  earthquakes: Array,
  selectedQuake: Object
})

defineEmits(['select'])

const sortBy = ref('time')
const showCount = ref(50)

function getMagBg(mag) {
  return getMagColor(mag) + '15'
}

const sortedData = computed(() => {
  if (!props.earthquakes) return []
  const arr = [...props.earthquakes]
  if (sortBy.value === 'time') arr.sort((a, b) => b.time - a.time)
  else if (sortBy.value === 'mag') arr.sort((a, b) => b.mag - a.mag)
  else if (sortBy.value === 'depth') arr.sort((a, b) => b.depth - a.depth)
  return arr
})

const displayData = computed(() => sortedData.value.slice(0, showCount.value))
</script>

<style scoped>
.list-inner {
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.list-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-select {
  padding: 5px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.78rem;
  border-radius: 6px;
  font-family: var(--font-sans);
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.list-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.list-body {
  max-height: 420px;
  overflow-y: auto;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;
}

.list-item:hover {
  background: var(--bg-card-hover);
}

.list-item.selected {
  background: rgba(196, 60, 76, 0.06);
  border-color: rgba(196, 60, 76, 0.2);
}

.item-mag-badge {
  font-size: 1.1rem;
  font-weight: 700;
  min-width: 52px;
  text-align: center;
  padding: 4px 8px;
  border-radius: 8px;
  font-family: var(--font-sans);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-place {
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.item-meta {
  display: flex;
  gap: 14px;
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 3px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.tsunami-tag {
  display: flex;
  align-items: center;
  gap: 3px;
  color: var(--accent-red);
  font-weight: 600;
  padding: 1px 8px;
  background: rgba(196, 60, 76, 0.08);
  border-radius: 4px;
}

.item-depth-indicator {
  width: 4px;
  height: 32px;
  background: #f0f1f5;
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.depth-fill {
  border-radius: 2px;
  transition: height 0.3s;
}

.load-more {
  text-align: center;
  padding: 12px;
}

.load-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 24px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.8rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 500;
  transition: all 0.2s;
}

.load-btn:hover {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}
</style>
