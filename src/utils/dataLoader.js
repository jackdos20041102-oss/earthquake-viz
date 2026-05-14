import dayjs from 'dayjs'

const cache = new Map()

async function loadJson(path) {
  if (cache.has(path)) return cache.get(path)
  const resp = await fetch(path)
  const data = await resp.json()
  cache.set(path, data)
  return data
}

function parseFeature(f) {
  const p = f.properties
  const [lng, lat, depth] = f.geometry.coordinates
  return {
    id: f.id || p.code,
    lng,
    lat,
    depth: depth ?? 0,
    mag: p.mag ?? 0,
    place: p.place || '未知位置',
    time: p.time,
    timeStr: dayjs(p.time).format('YYYY-MM-DD HH:mm'),
    dateStr: dayjs(p.time).format('YYYY-MM-DD'),
    tsunami: p.tsunami === 1,
    sig: p.sig ?? 0,
    type: p.type || 'earthquake',
    year: p.query_year || dayjs(p.time).year(),
    url: p.url
  }
}

export async function loadRecentData() {
  const raw = await loadJson('./data/recent_30days.json')
  return {
    metadata: raw.metadata,
    earthquakes: raw.features.map(parseFeature)
  }
}

export async function loadHistoricalData() {
  const raw = await loadJson('./data/historical_yearly.json')
  return {
    metadata: raw.metadata,
    earthquakes: raw.features.map(parseFeature)
  }
}

export async function loadSignificantData() {
  const raw = await loadJson('./data/significant_recent.json')
  return {
    metadata: raw.metadata,
    earthquakes: raw.features.map(parseFeature)
  }
}

export async function loadTectonicPlates() {
  return await loadJson('./data/tectonic_plates.json')
}

export function getMagColor(mag) {
  if (mag >= 7) return '#c43c4c'
  if (mag >= 6) return '#d45530'
  if (mag >= 5) return '#e07730'
  if (mag >= 4) return '#d4a030'
  if (mag >= 3) return '#2a9d6e'
  return '#2e7db5'
}

export function getMagLabel(mag) {
  if (mag >= 8) return '巨大地震'
  if (mag >= 7) return '大地震'
  if (mag >= 6) return '强震'
  if (mag >= 5) return '中强震'
  if (mag >= 4) return '有感地震'
  if (mag >= 3) return '小地震'
  return '微震'
}

export function getDepthColor(depth) {
  if (depth >= 300) return '#6356b8'
  if (depth >= 70) return '#2e7db5'
  return '#2a9d6e'
}

export function getDepthLabel(depth) {
  if (depth >= 300) return '深源'
  if (depth >= 70) return '中源'
  return '浅源'
}
