<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div
      v-for="tst in toasts"
      :key="tst.id"
      class="my-toast d-flex align-items-center p-2 mb-2"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="px-2 small">
        <span class="fw-semibold me-2">{{ toastIcon(tst.type) }}</span>
        <span>{{ tst.msg }}</span>
      </div>
      <button class="btn-close ms-auto me-2" type="button" @click="removeToast(tst.id)" />
    </div>
  </div>

  <div class="container py-4 py-md-5">
    <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h3 m-0 brand">
          {{ t('appTitle') }}
        </h1>
      </div>

      <div class="d-flex gap-2 align-items-center">
        <button
          class="btn btn-outline-light"
          :disabled="items.length === 0"
          @click="share"
        >
          {{ t('share') }}
        </button>

        <div class="btn-group" role="group" aria-label="language switch">
          <button class="btn btn-outline-light" :class="{ active: lang === &quot;ru&quot; }" @click="setLang(&quot;ru&quot;)">
            {{ t('ru') }}
          </button>
          <button class="btn btn-outline-light" :class="{ active: lang === &quot;en&quot; }" @click="setLang(&quot;en&quot;)">
            {{ t('en') }}
          </button>
        </div>

        <button class="btn btn-outline-light" @click="resetAll">
          {{ t('reset') }}
        </button>
      </div>
    </div>

    <div class="row g-3 g-md-4">
      <div class="col-12 col-lg-5">
        <div class="glass p-3 p-md-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="h5 m-0">
              {{ t('addStage') }}
            </div>
          </div>

          <div class="row g-3">
            <div class="col-12">
              <label class="form-label muted">{{ t('team') }}</label>
              <select v-model="selectedTeam" class="form-select">
                <option v-for="team in teams" :key="team" :value="team">
                  {{ team }}
                </option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label muted">{{ t('nextStage') }}</label>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="pill">
                  {{ nextRow ? `${selectedTeam} • ${nextRow.stage}` : t('allStagesDone') }}
                </span>
                <span class="pill" :class="{ muted: !nextRow }">
                  {{ nextRow ? t('rewardLabel', { reward: nextRow.reward }) : '—' }}
                </span>
              </div>
            </div>

            <div class="col-12">
              <div class="d-flex align-items-center justify-content-between">
                <label class="form-label muted mb-1">{{ t('payment') }}</label>

                <span class="pill" :style="ratioPillStyle" :class="{ muted: ratioValue === null }">
                  {{ t('ratioLabel') }}
                  <span v-if="ratioValue !== null" class="fw-semibold">{{ ratioValue }}</span>
                  <span v-else>—</span>
                </span>
              </div>

              <div class="row g-2 mt-2">
                <div class="col-6 d-grid">
                  <input
                    id="curToken"
                    v-model="currency"
                    class="btn-check"
                    type="radio"
                    name="currency"
                    value="token"
                  >
                  <label class="btn btn-outline-light d-flex align-items-center justify-content-center" for="curToken">
                    {{ t('tokens') }}
                  </label>
                  <div class="muted small-note mt-1 text-center">
                    {{ nextRow ? nextRow.token_amount.toLocaleString('ru-RU') : '—' }}
                  </div>
                </div>

                <div class="col-6 d-grid">
                  <input
                    id="curCoal"
                    v-model="currency"
                    class="btn-check"
                    type="radio"
                    name="currency"
                    value="coal"
                  >
                  <label
                    class="btn btn-outline-light d-flex align-items-center justify-content-center"
                    :style="coalButtonStyle"
                    for="curCoal"
                  >
                    {{ t('coal') }}
                  </label>
                  <div class="muted small-note mt-1 text-center">
                    {{ nextRow ? nextRow.coal_amount.toLocaleString('ru-RU') : '—' }}
                  </div>
                </div>
              </div>

              <div class="muted small-note mt-2">
                {{ t('willAddSelectedCurrency') }}
              </div>
            </div>

            <div class="col-12 d-grid">
              <button class="btn btn-primary btn-lg" :disabled="!nextRow" @click="addNext">
                {{ t('add') }}
              </button>
            </div>

            <hr class="border-light opacity-10 my-2">

            <div class="col-12">
              <div class="d-flex align-items-center justify-content-between">
                <div class="h6 m-0">
                  {{ t('totals') }}
                </div>
                <span class="muted small-note">{{ t('sumAcrossTeams') }}</span>
              </div>

              <div class="row g-2 mt-2">
                <div class="col-6">
                  <div class="glass p-3">
                    <div class="muted small-note">
                      {{ t('tokens') }}
                    </div>
                    <div class="h3 m-0">
                      {{ totalTokens.toLocaleString('ru-RU') }}
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="glass p-3">
                    <div class="muted small-note">
                      {{ t('coal') }}
                    </div>
                    <div class="h3 m-0">
                      {{ totalCoal.toLocaleString('ru-RU') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-7">
        <div class="glass p-3 p-md-4 h-100">
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
            <div class="h5 m-0">
              {{ t('addedStages') }}
            </div>
            <div class="muted small-note">
              {{ t('removeRule') }}
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-darkish align-middle">
              <thead>
              <tr class="muted">
                <th style="width: 22%;">
                  {{ t('team') }}
                </th>
                <th style="width: 12%;">
                  {{ t('stage') }}
                </th>
                <th style="width: 26%;">
                  {{ t('rewardWholeStage') }}
                </th>
                <th style="width: 16%;">
                  {{ t('payment') }}
                </th>
                <th style="width: 12%;" title="Coal to Token ratio">
                  {{ t('ratioCol') }}
                </th>
                <th style="width: 17%;" class="text-end">
                  {{ t('cost') }}
                </th>
                <th style="width: 5%;" class="text-end" />
              </tr>
              </thead>

              <tbody v-if="items.length === 0">
              <tr class="muted">
                <td colspan="7" class="py-4 text-center">
                  {{ t('empty') }}
                </td>
              </tr>
              </tbody>

              <tbody v-else>
              <tr v-for="it in items" :key="it.id">
                <td><span class="badge badge-soft">{{ it.team }}</span></td>
                <td><span class="pill">{{ it.stage }}</span></td>
                <td class="muted">
                  {{ it.is_reward_stage ? it.reward : '' }}
                </td>
                <td>
                    <span v-if="it.currency === 'token'" class="badge bg-primary-subtle text-primary-emphasis">
                      {{ t('tokens') }}
                    </span>
                  <span v-else class="badge bg-secondary text-light">{{ t('coal') }}</span>
                </td>
                <td class="small" style="white-space:nowrap;" :style="ratioCellStyle(it)">
                  {{ (it.coal_amount / it.token_amount).toFixed(2) }}
                </td>
                <td class="text-end fw-semibold">
                  {{ (it.currency === 'token' ? it.token_amount : it.coal_amount).toLocaleString('ru-RU') }}
                </td>
                <td class="text-end">
                  <button
                    v-if="canRemove(it)"
                    class="btn btn-sm btn-outline-light"
                    title="Remove"
                    @click="removeItem(it)"
                  >
                    ✕
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { TEAMS } from './data/stages'
import en from './i18n/en'
import ru from './i18n/ru'

const dicts = { en, ru }
const lang = ref('en')

function setLang(code) {
  if (code === 'en' || code === 'ru') lang.value = code
}

function t(key, vars = {}) {
  const s = dicts[lang.value]?.[key] ?? key
  return s.replace(/\{(\w+)}/g, (_, k) => (vars[k] ?? `{${k}}`))
}

function stageKey(stageStr) {
  const [a, b] = String(stageStr).split('.')
  return Number(a) * 1000 + Number(b)
}

const teamIdToName = new Map()
const teamNameToId = new Map()

let _ti = 0
while (_ti < TEAMS.length) {
  const t0 = TEAMS[_ti]
  if (typeof t0?.id === 'number' && typeof t0?.team === 'string') {
    teamIdToName.set(t0.id, t0.team)
    teamNameToId.set(t0.team, t0.id)
  }
  _ti = _ti + 1
}

const teams = TEAMS.map(t0 => t0.team).sort((a, b) => a.localeCompare(b))

// Build a flat list per team while keeping reward->stages ordering
const byTeam = new Map()
const allFlat = []

let _t = 0
while (_t < TEAMS.length) {
  const teamObj = TEAMS[_t]
  const flat = []

  const rewardsSorted = [...teamObj.rewards].sort((a, b) => a.id - b.id)

  let _r = 0
  while (_r < rewardsSorted.length) {
    const reward = rewardsSorted[_r]
    const stagesSorted = [...reward.stages].sort((a, b) => a.id - b.id)

    const lastStageId = stagesSorted.length ? stagesSorted[stagesSorted.length - 1].id : null

    let _s = 0
    while (_s < stagesSorted.length) {
      const st = stagesSorted[_s]
      const row = {
        team: teamObj.team,
        reward: reward.name,
        stage: `${reward.id}.${st.id}`,
        token_amount: st.tokens,
        coal_amount: st.coal,
        is_reward_stage: lastStageId !== null && st.id === lastStageId
      }
      flat.push(row)
      allFlat.push(row)
      _s = _s + 1
    }

    _r = _r + 1
  }

  flat.sort((x, y) => stageKey(x.stage) - stageKey(y.stage))
  byTeam.set(teamObj.team, flat)

  _t = _t + 1
}

const selectedTeam = ref(teams[0] ?? '')
const currency = ref('token')
const items = ref([])

const URL_STATE_KEY = 's'

function getUrlStateRaw() {
  const url = new URL(window.location.href)
  return url.searchParams.get(URL_STATE_KEY)
}

function setUrlStateRaw(raw) {
  const url = new URL(window.location.href)
  if (!raw) url.searchParams.delete(URL_STATE_KEY)
  else url.searchParams.set(URL_STATE_KEY, raw)
  window.history.replaceState(null, '', url.toString())
}

function parseStateFromUrl(raw) {
  if (!raw) return []

  const parts = raw.split('.')
  const out = []

  let i = 0
  while (i < parts.length) {
    const p = parts[i]
    if (!p) return null

    const n = Number.parseInt(p, 36)
    if (!Number.isFinite(n)) return null
    if (!Number.isInteger(n)) return null
    if (n < 0 || n > 4095) return null

    const teamId = (n >> 9) & 7
    const rewardId = (n >> 6) & 7
    const stageId = (n >> 1) & 31
    const curBit = n & 1

    if (teamId <= 0 || rewardId <= 0 || stageId <= 0) return null

    const team = teamIdToName.get(teamId)
    if (!team) return null

    out.push({
      team,
      stage: `${rewardId}.${stageId}`,
      currency: curBit === 1 ? 'coal' : 'token'
    })

    i = i + 1
  }

  return out
}

function encodeStateToUrl(itemsList) {
  const out = []

  let i = 0
  while (i < itemsList.length) {
    const it = itemsList[i]

    const teamId = teamNameToId.get(it.team)
    if (!teamId) return ''

    const [rewardIdStr, stageIdStr] = String(it.stage).split('.')
    const rewardId = Number(rewardIdStr)
    const stageId = Number(stageIdStr)

    if (!Number.isInteger(rewardId) || rewardId <= 0 || rewardId > 7) return ''
    if (!Number.isInteger(stageId) || stageId <= 0 || stageId > 31) return ''

    const curBit = it.currency === 'coal' ? 1 : 0

    const packed =
      ((teamId & 7) << 9) |
      ((rewardId & 7) << 6) |
      ((stageId & 31) << 1) |
      (curBit & 1)

    out.push(packed.toString(36))

    i = i + 1
  }

  return out.join('.')
}

function rebuildItemsFromState(stateItems) {
  if (!Array.isArray(stateItems)) return []

  const kept = []
  const keepStageKeys = new Set()

  // Validate per-team strict prefixes against current data
  let ti = 0
  while (ti < teams.length) {
    const team = teams[ti]
    const list = byTeam.get(team) ?? []

    const teamRaw = stateItems
      .filter(x => x && x.team === team)
      .slice()
      .sort((a, b) => stageKey(a.stage) - stageKey(b.stage))

    let i = 0
    while (i < teamRaw.length) {
      const expected = list[i]
      const got = teamRaw[i]
      if (!expected || !got) break

      const isCurrencyOk = got.currency === 'token' || got.currency === 'coal'
      if (!isCurrencyOk) break
      if (got.stage !== expected.stage) break

      keepStageKeys.add(`${team}|${expected.stage}`)
      i = i + 1
    }

    ti = ti + 1
  }

  // Preserve original cross-team order
  let j = 0
  while (j < stateItems.length) {
    const raw = stateItems[j]
    if (!raw || typeof raw !== 'object') {
      j = j + 1
      continue
    }

    const team = raw.team
    const stage = raw.stage
    const cur = raw.currency

    if (typeof team !== 'string' || typeof stage !== 'string') {
      j = j + 1
      continue
    }
    if (cur !== 'token' && cur !== 'coal') {
      j = j + 1
      continue
    }

    const stageKeyStr = `${team}|${stage}`
    if (!keepStageKeys.has(stageKeyStr)) {
      j = j + 1
      continue
    }

    const expectedList = byTeam.get(team) ?? []
    const expected = expectedList.find(r => r.stage === stage)
    if (!expected) {
      j = j + 1
      continue
    }

    kept.push({
      id: 'i' + Math.random().toString(16).slice(2),
      team,
      stage,
      reward: expected.reward,
      currency: cur,
      token_amount: expected.token_amount,
      coal_amount: expected.coal_amount,
      is_reward_stage: expected.is_reward_stage
    })

    keepStageKeys.delete(stageKeyStr)

    j = j + 1
  }

  return kept
}

const suppressUrlSync = ref(false)

function loadStateFromUrl() {
  const raw = getUrlStateRaw()
  if (!raw) return

  let parsed
  try {
    parsed = parseStateFromUrl(raw)
  } catch {
    parsed = null
  }

  if (!parsed) {
    setUrlStateRaw('')
    return
  }

  suppressUrlSync.value = true
  items.value = rebuildItemsFromState(parsed)

  queueMicrotask(() => {
    suppressUrlSync.value = false
  })
}

function saveStateToUrl() {
  const minimal = items.value.map(i => ({
    team: i.team,
    stage: i.stage,
    currency: i.currency
  }))

  const raw = encodeStateToUrl(minimal)
  setUrlStateRaw(raw)
}

function share() {
  if (items.value.length === 0) return
  const url = window.location.href
  window.prompt(t('sharePrompt'), url)
}

onMounted(() => {
  loadStateFromUrl()

  window.addEventListener('popstate', () => {
    suppressUrlSync.value = true
    items.value = []
    loadStateFromUrl()
    queueMicrotask(() => {
      suppressUrlSync.value = false
    })
  })
})

watch(
  items,
  () => {
    if (suppressUrlSync.value) return
    saveStateToUrl()
  },
  { deep: true }
)

const ratioStats = (() => {
  const ratios = allFlat.map(r => r.coal_amount / r.token_amount).filter(v => Number.isFinite(v))
  const min = Math.min(...ratios)
  const max = Math.max(...ratios)
  return { min, max }
})()

function ratioToHue(ratio) {
  const { min, max } = ratioStats
  const norm = max > min ? (ratio - min) / (max - min) : 0.5
  return 120 * (1 - norm)
}

const toasts = ref([])

function toastIcon(type) {
  if (type === 'success') return '✅'
  if (type === 'warning') return '⚠️'
  if (type === 'info') return 'ℹ️'
  return '•'
}

function pushToast(msg, type = 'info', delayMs = 2800) {
  const id = 't' + Math.random().toString(16).slice(2)
  toasts.value.push({ id, msg, type })
  window.setTimeout(() => removeToast(id), delayMs)
}

function removeToast(id) {
  toasts.value = toasts.value.filter(x => x.id !== id)
}

watch(currency, v => {
  const curLabel = v === 'coal' ? t('currencyCoal') : t('currencyTokens')
  pushToast(curLabel, 'info', 1200)
})

const progressIndex = computed(() => {
  const map = new Map()
  let i = 0
  while (i < teams.length) {
    map.set(teams[i], 0)
    i = i + 1
  }

  let j = 0
  while (j < items.value.length) {
    const it = items.value[j]
    map.set(it.team, (map.get(it.team) ?? 0) + 1)
    j = j + 1
  }

  return map
})

const nextRow = computed(() => {
  const list = byTeam.get(selectedTeam.value) ?? []
  const idx = progressIndex.value.get(selectedTeam.value) ?? 0
  return list[idx] ?? null
})

const ratioValue = computed(() => {
  if (!nextRow.value) return null
  const r = nextRow.value.coal_amount / nextRow.value.token_amount
  return r.toFixed(2)
})

const ratioPillStyle = computed(() => {
  if (!nextRow.value) return {}
  const r = nextRow.value.coal_amount / nextRow.value.token_amount
  const hue = ratioToHue(r)
  return {
    borderColor: `hsl(${hue.toFixed(0)} 75% 45% / 0.55)`,
    boxShadow: `0 0 0 1px hsl(${hue.toFixed(0)} 75% 45% / 0.25) inset`,
    color: `hsl(${hue.toFixed(0)} 75% 55%)`
  }
})

const coalButtonStyle = computed(() => {
  if (!nextRow.value) return {}
  const r = nextRow.value.coal_amount / nextRow.value.token_amount
  const hue = ratioToHue(r)
  return {
    borderColor: `hsl(${hue.toFixed(0)} 75% 45% / 0.75)`,
    boxShadow: `0 0 0 1px hsl(${hue.toFixed(0)} 75% 45% / 0.45) inset`,
    color: `hsl(${hue.toFixed(0)} 75% 60%)`
  }
})

function ratioCellStyle(item) {
  const r = item.coal_amount / item.token_amount
  const hue = ratioToHue(r)
  return { color: `hsl(${hue.toFixed(0)} 75% 60%)` }
}

const totalTokens = computed(() =>
  items.value.filter(i => i.currency === 'token').reduce((s, i) => s + i.token_amount, 0)
)

const totalCoal = computed(() =>
  items.value.filter(i => i.currency === 'coal').reduce((s, i) => s + i.coal_amount, 0)
)

function addNext() {
  const n = nextRow.value
  if (!n) {
    pushToast(t('toastNoStages'), 'warning')
    return
  }

  const curLabel = currency.value === 'coal' ? t('currencyCoal') : t('currencyTokens')

  items.value.push({
    id: 'i' + Math.random().toString(16).slice(2),
    team: n.team,
    stage: n.stage,
    reward: n.reward,
    currency: currency.value,
    token_amount: n.token_amount,
    coal_amount: n.coal_amount,
    is_reward_stage: n.is_reward_stage
  })

  pushToast(t('toastAdded', { team: n.team, stage: n.stage, currency: curLabel }), 'success')
}

function resetAll() {
  const ok = window.confirm(t('resetConfirm'))
  if (!ok) return

  items.value = []
  pushToast(t('toastReset'), 'info')
}

function canRemove(item) {
  const teamItems = items.value
    .filter(x => x.team === item.team)
    .slice()
    .sort((a, b) => stageKey(a.stage) - stageKey(b.stage))

  return teamItems.length > 0 && teamItems[teamItems.length - 1].id === item.id
}

function removeItem(item) {
  if (!canRemove(item)) {
    pushToast(t('toastCantRemove'), 'warning')
    return
  }
  items.value = items.value.filter(x => x.id !== item.id)
}
</script>
