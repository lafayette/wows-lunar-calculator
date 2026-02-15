<template>
  <div class="row g-3 g-md-4">
    <div class="col-12 col-lg-5">
      <div class="glass p-3 p-md-4">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="h5 m-0">{{ t('plannerTitle') }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label muted">{{ t('plannerTokensAvailable') }}</label>
          <input
            v-model.number="tokensAvailable"
            class="form-control"
            type="number"
            min="0"
            step="1"
            :placeholder="t('plannerTokensPlaceholder')"
          >
          <div class="muted small-note mt-1">
            {{ t('plannerTokensHint') }}
          </div>
        </div>

        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="h6 m-0">{{ t('plannerGoalsTitle') }}</div>
        </div>

        <div class="vstack gap-2">
          <div
            v-for="g in goals"
            :key="g.id"
            class="p-2 goal-card"
          >
            <div class="row g-2 align-items-end">
              <div class="col-12 col-md-5">
                <label class="form-label muted mb-1">{{ t('team') }}</label>
                <select v-model="g.team" class="form-select" @change="onGoalTeamChange(g)">
                  <option v-for="team in teams" :key="team" :value="team">
                    {{ team }}
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label muted mb-1">{{ t('plannerTargetStage') }}</label>
                <select v-model="g.stage" class="form-select">
                  <option value="" disabled>
                    {{ t('plannerSelectStage') }}
                  </option>
                  <option
                    v-for="st in stageOptionsForTeam(g.team)"
                    :key="st.stage"
                    :value="st.stage"
                  >
                    {{ st.stage }} — {{ st.reward }} (T: {{ st.token_amount }}, C: {{ st.coal_amount }}, CTR:
                    {{ (st.coal_amount / st.token_amount).toFixed(2) }})
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-1 d-grid">
                <button class="btn btn-outline-light" @click="removeGoal(g)">×</button>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-sm btn-outline-light" @click="addGoal">
            + {{ t('plannerAddGoal') }}
          </button>
        </div>

        <div v-if="errors.length" class="alert alert-danger mt-3 mb-0">
          <div class="fw-semibold">{{ t('plannerCheckInput') }}</div>
          <ul class="mb-0">
            <li v-for="(e, idx) in errors" :key="idx">{{ e }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="col-12 col-lg-7">
      <div class="glass p-3 p-md-4 h-100">
        <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
          <div class="h5 m-0">{{ t('plannerResult') }}</div>
          <div class="d-flex flex-wrap gap-2">
            <span v-if="result" class="pill muted">{{ t('plannerGoalsCount', { n: String(meta.goals) }) }}</span>
            <span v-if="result" class="pill muted">{{ t('plannerTeamsCount', { n: String(meta.teams) }) }}</span>
            <span v-if="result" class="pill muted">{{ t('plannerStagesCount', { n: String(meta.stages) }) }}</span>
          </div>
        </div>

        <div v-if="!result" class="muted">
          {{ t('plannerEmpty') }}
        </div>

        <template v-else>
          <div class="row g-2 g-md-3 mb-3">
            <div class="col-12 col-md-6">
              <div class="glass p-3 h-100">
                <div class="muted small-note">{{ t('plannerCoalNeeded') }}</div>
                <div class="h2 m-0">
                  {{ result.coalNeeded.toLocaleString('ru-RU') }}
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="glass p-3 h-100">
                <div class="muted small-note">{{ t('plannerTokensUsed') }}</div>
                <div class="h5 m-0">
                  {{ result.tokensUsed.toLocaleString('ru-RU') }} / {{ result.tokensAvailable.toLocaleString('ru-RU') }}
                  <span class="muted">({{ t('plannerTokensLeft') }}: {{ result.tokensLeft.toLocaleString('ru-RU') }})</span>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <div class="h6 m-0">{{ t('plannerDetails') }}</div>
            <div class="muted small-note">CTR = coal / tokens</div>
          </div>

          <div class="accordion" id="plannerAcc">
            <div
              v-for="(tb, idx) in teamBlocks"
              :key="tb.team"
              class="accordion-item mb-2 acc-item"
            >
              <h2 class="accordion-header" :id="`ph-${idx}`">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#pc-${idx}`"
                  aria-expanded="true"
                  :aria-controls="`pc-${idx}`"
                >
                  <div class="w-100 d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div class="fw-semibold">{{ tb.team }}</div>
                    <div class="d-flex flex-wrap gap-2">
                      <span class="badge badge-soft">{{ t('plannerStagesShort') }}: {{ tb.stages }}</span>
                      <span class="badge badge-soft">{{ t('tokens') }}: {{ tb.tokens.toLocaleString('ru-RU') }}</span>
                      <span class="badge badge-soft">{{ t('coal') }}: {{ tb.coal.toLocaleString('ru-RU') }}</span>
                    </div>
                  </div>
                </button>
              </h2>

              <div
                :id="`pc-${idx}`"
                class="accordion-collapse collapse show"
                :aria-labelledby="`ph-${idx}`"
              >
                <div class="accordion-body acc-body">
                  <div class="table-responsive">
                    <table class="table table-sm table-darkish align-middle">
                      <thead>
                      <tr class="muted">
                        <th style="width: 30%;">{{ t('rewardWholeStage') }}</th>
                        <th style="width: 12%;">{{ t('stage') }}</th>
                        <th style="width: 14%;" class="text-end">{{ t('tokens') }}</th>
                        <th style="width: 14%;" class="text-end">{{ t('coal') }}</th>
                        <th style="width: 12%;" class="text-end">{{ t('ratioCol') }}</th>
                        <th style="width: 18%;" class="text-center">{{ t('payment') }}</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="row in tb.rows" :key="row.key">
                        <td class="muted">{{ row.reward }}</td>
                        <td><span class="pill pill-sm">{{ row.stage }}</span></td>
                        <td class="text-end">{{ row.tokens.toLocaleString('ru-RU') }}</td>
                        <td class="text-end">{{ row.coal.toLocaleString('ru-RU') }}</td>
                        <td class="text-end" style="white-space: nowrap;" :style="ratioCellStyle(row)">
                          {{ (row.coal / row.tokens).toFixed(2) }}
                        </td>
                        <td class="text-center">
                            <span
                              v-if="row.pay === 'tokens'"
                              class="badge bg-primary-subtle text-primary-emphasis"
                            >
                              {{ t('tokens') }}
                            </span>
                          <span v-else class="badge bg-secondary text-light">{{ t('coal') }}</span>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { TEAMS } from '../data/stages'
import { buildStageIndex, stageKey } from '../lib/stages'

const emit = defineEmits(['share-enabled'])

const i18n = inject('i18n')
const toast = inject('toast')

const t = i18n?.t ?? ((k) => k)
const pushToast = toast?.pushToast ?? (() => {})

const { teams, byTeam, allFlat, teamIdToName, teamNameToId } = buildStageIndex(TEAMS)

const tokensAvailable = ref(0)
const goals = reactive([])
const errors = ref([])

const result = ref(null)
const meta = reactive({ goals: 0, teams: 0, stages: 0 })

// ---- CTR color like Calculator ----
const ratioStats = (() => {
  const ratios = allFlat.map(r => r.coal_amount / r.token_amount).filter(v => Number.isFinite(v))
  const min = Math.min(...ratios)
  const max = Math.max(...ratios)
  return { min, max }
})()

function ratioToHue(ratio) {
  const { min, max } = ratioStats
  const norm = max > min ? (ratio - min) / (max - min) : 0.5
  return 120 * (1 - norm) // green -> red
}

function ratioCellStyle(row) {
  const r = row.coal / row.tokens
  const hue = ratioToHue(r)
  return { color: `hsl(${hue.toFixed(0)} 75% 60%)` }
}

// ---- URL preset + share (like Calculator) ----
const URL_STATE_KEY = 'p'
const suppressUrlSync = ref(false)

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

function packGoal(team, stage) {
  const teamId = teamNameToId.get(team)
  if (!teamId) return null
  const [rewardIdStr, stageIdStr] = String(stage).split('.')
  const rewardId = Number(rewardIdStr)
  const stageId = Number(stageIdStr)

  if (!Number.isInteger(rewardId) || rewardId <= 0 || rewardId > 7) return null
  if (!Number.isInteger(stageId) || stageId <= 0 || stageId > 31) return null

  // 3 bits team, 3 bits reward, 5 bits stage => 11 bits
  return ((teamId & 7) << 8) | ((rewardId & 7) << 5) | (stageId & 31)
}

function unpackGoal(packed) {
  const teamId = (packed >> 8) & 7
  const rewardId = (packed >> 5) & 7
  const stageId = packed & 31
  if (teamId <= 0 || rewardId <= 0 || stageId <= 0) return null
  const team = teamIdToName.get(teamId)
  if (!team) return null
  return { team, stage: `${rewardId}.${stageId}` }
}

function parseStateFromUrl(raw) {
  if (!raw) return null

  const [tokRaw, goalsRaw = ''] = raw.split('~')
  const tok = Number.parseInt(tokRaw, 36)
  if (!Number.isFinite(tok) || !Number.isInteger(tok) || tok < 0) return null

  const goalParts = goalsRaw ? goalsRaw.split('.').filter(Boolean) : []

  // keep max stage per team
  const perTeam = new Map()
  for (const p of goalParts) {
    const n = Number.parseInt(p, 36)
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 4095) return null
    const g = unpackGoal(n)
    if (!g) return null
    const cur = perTeam.get(g.team)
    if (!cur || stageKey(g.stage) > stageKey(cur.stage)) perTeam.set(g.team, g)
  }

  const goalsList = Array.from(perTeam.values()).sort((a, b) => a.team.localeCompare(b.team))
  return { tokens: tok, goals: goalsList }
}

function encodeStateToUrl(tok, goalsList) {
  const tokN = Math.max(0, Math.floor(tok || 0))

  const validGoals = (Array.isArray(goalsList) ? goalsList : [])
    .filter(g => g && g.team && g.stage)
    .map(g => packGoal(g.team, g.stage))
    .filter(n => n !== null)
    .sort((a, b) => a - b)
    .map(n => n.toString(36))

  // do not store empty state
  if (tokN === 0 && validGoals.length === 0) return ''
  if (validGoals.length === 0) return tokN.toString(36)
  return `${tokN.toString(36)}~${validGoals.join('.')}`
}

function loadStateFromUrl() {
  const raw = getUrlStateRaw()
  if (!raw) return false

  let parsed
  try {
    parsed = parseStateFromUrl(raw)
  } catch {
    parsed = null
  }

  if (!parsed) {
    setUrlStateRaw('')
    return false
  }

  suppressUrlSync.value = true

  tokensAvailable.value = parsed.tokens
  goals.splice(0, goals.length)
  if (parsed.goals.length) {
    for (const g of parsed.goals) {
      goals.push({ id: newId(), team: g.team, stage: g.stage })
    }
  }

  queueMicrotask(() => {
    suppressUrlSync.value = false
  })

  return true
}

function saveStateToUrl() {
  const minimal = goals.map(g => ({ team: g.team, stage: g.stage }))
  const raw = encodeStateToUrl(tokensAvailable.value, minimal)
  setUrlStateRaw(raw)
}

function share() {
  const minimal = goals.map(g => ({ team: g.team, stage: g.stage }))
  const raw = encodeStateToUrl(tokensAvailable.value, minimal)
  if (!raw) return
  setUrlStateRaw(raw)
  window.prompt(t('sharePrompt'), window.location.href)
}

// ---- Goals helpers ----
function newId(prefix = 'g') {
  return prefix + Math.random().toString(16).slice(2)
}

function addGoal() {
  goals.push({ id: newId(), team: teams[0] ?? '', stage: '' })
}

function removeGoal(g) {
  const idx = goals.findIndex(x => x.id === g.id)
  if (idx >= 0) goals.splice(idx, 1)
  if (goals.length === 0) addGoal()
}

function onGoalTeamChange(g) {
  g.stage = ''
}

function stageOptionsForTeam(team) {
  return byTeam.get(team) ?? []
}

function buildRequiredStages(goalsList) {
  const perTeamMaxIdx = new Map()

  for (const g of goalsList) {
    const list = byTeam.get(g.team) ?? []
    const idx = list.findIndex(r => r.stage === g.stage)
    if (idx < 0) continue
    const cur = perTeamMaxIdx.get(g.team) ?? -1
    if (idx > cur) perTeamMaxIdx.set(g.team, idx)
  }

  const required = []
  for (const [team, idx] of perTeamMaxIdx.entries()) {
    const list = byTeam.get(team) ?? []
    required.push(...list.slice(0, idx + 1))
  }

  required.sort((a, b) => {
    if (a.team === b.team) return stageKey(a.stage) - stageKey(b.stage)
    return a.team.localeCompare(b.team)
  })

  return required
}

// Optimization: maximize tokens spent (<= available) then minimize coal
function optimizePayment(requiredStages, availableTokens) {
  const totalCoal = requiredStages.reduce((sum, s) => sum + s.coal_amount, 0)
  const totalTokensAll = requiredStages.reduce((sum, s) => sum + s.token_amount, 0)

  const Traw = Math.max(0, Math.floor(availableTokens))

  // Tokens enough for everything => tokens only
  if (Traw >= totalTokensAll) {
    const decisions = requiredStages.map(s => ({
      key: `${s.team}|${s.stage}`,
      team: s.team,
      reward: s.reward,
      stage: s.stage,
      tokens: s.token_amount,
      coal: s.coal_amount,
      pay: 'tokens'
    }))

    return {
      totalCoal,
      totalTokensAll,
      tokensUsed: totalTokensAll,
      tokensAvailable: Traw,
      tokensLeft: Traw - totalTokensAll,
      coalNeeded: 0,
      decisions
    }
  }

  const n = requiredStages.length
  const T = Math.min(Traw, totalTokensAll)
  const W = T + 1

  let dpPrev = new Int32Array(W)
  let dpCur = new Int32Array(W)
  dpPrev.fill(-1)
  dpPrev[0] = 0

  const take = new Uint8Array(n * W)

  for (let i = 0; i < n; i++) {
    dpCur.fill(-1)
    const w = requiredStages[i].token_amount | 0
    const val = requiredStages[i].coal_amount | 0

    for (let t2 = 0; t2 <= T; t2++) {
      let best = dpPrev[t2]
      let took = 0

      if (t2 >= w && dpPrev[t2 - w] !== -1) {
        const cand = dpPrev[t2 - w] + val
        if (cand > best) {
          best = cand
          took = 1
        }
      }

      dpCur[t2] = best
      take[i * W + t2] = took
    }

    const tmp = dpPrev
    dpPrev = dpCur
    dpCur = tmp
  }

  let bestT = 0
  for (let t2 = T; t2 >= 0; t2--) {
    if (dpPrev[t2] !== -1) {
      bestT = t2
      break
    }
  }

  const savedCoal = dpPrev[bestT] === -1 ? 0 : dpPrev[bestT]
  const coalNeeded = Math.max(0, totalCoal - savedCoal)

  const picked = new Set()
  let t2 = bestT
  for (let i = n - 1; i >= 0; i--) {
    if (take[i * W + t2] === 1) {
      picked.add(i)
      t2 -= requiredStages[i].token_amount
    }
  }

  const decisions = requiredStages.map((s, idx) => ({
    key: `${s.team}|${s.stage}`,
    team: s.team,
    reward: s.reward,
    stage: s.stage,
    tokens: s.token_amount,
    coal: s.coal_amount,
    pay: picked.has(idx) ? 'tokens' : 'coal'
  }))

  return {
    totalCoal,
    totalTokensAll,
    tokensUsed: bestT,
    tokensAvailable: Traw,
    tokensLeft: Traw - bestT,
    coalNeeded,
    decisions
  }
}

function recalc() {
  const errs = []

  if (!Number.isFinite(tokensAvailable.value) || tokensAvailable.value < 0) {
    errs.push(t('plannerErrTokens'))
  }

  const activeGoals = goals
    .map(g => ({ team: g.team, stage: g.stage }))
    .filter(g => g.team && g.stage)

  // no goals selected yet => no error, no result
  if (activeGoals.length === 0) {
    errors.value = errs
    result.value = null
    meta.goals = 0
    meta.teams = 0
    meta.stages = 0
    return
  }

  if (errs.length) {
    errors.value = errs
    result.value = null
    meta.goals = 0
    meta.teams = 0
    meta.stages = 0
    return
  }

  errors.value = []

  const required = buildRequiredStages(activeGoals)
  const model = optimizePayment(required, tokensAvailable.value)

  meta.goals = activeGoals.length
  meta.teams = new Set(activeGoals.map(g => g.team)).size
  meta.stages = model.decisions.length

  result.value = model
}

const teamBlocks = computed(() => {
  if (!result.value) return []
  const map = new Map()

  for (const row of result.value.decisions) {
    const cur = map.get(row.team) ?? { team: row.team, rows: [], stages: 0, tokens: 0, coal: 0 }
    cur.rows.push(row)
    cur.stages += 1
    if (row.pay === 'tokens') cur.tokens += row.tokens
    else cur.coal += row.coal
    map.set(row.team, cur)
  }

  const out = Array.from(map.values()).sort((a, b) => a.team.localeCompare(b.team))
  for (const tb of out) {
    tb.rows.sort((a, b) => stageKey(a.stage) - stageKey(b.stage))
  }
  return out
})

function reset() {
  const ok = window.confirm(t('plannerResetConfirm'))
  if (!ok) return

  suppressUrlSync.value = true

  tokensAvailable.value = 0
  goals.splice(0, goals.length)
  errors.value = []
  result.value = null
  meta.goals = 0
  meta.teams = 0
  meta.stages = 0

  setUrlStateRaw('')

  addGoal()

  queueMicrotask(() => {
    suppressUrlSync.value = false
    recalc()
    saveStateToUrl()
  })

  pushToast(t('toastReset'), 'info')
}

// Share enabled for App header
const shareEnabled = computed(() => {
  const anySelected = goals.some(g => g.team && g.stage)
  if (!anySelected) return false
  if (!Number.isFinite(tokensAvailable.value) || tokensAvailable.value < 0) return false
  return true
})

watch(shareEnabled, v => emit('share-enabled', v), { immediate: true })

watch(
  () => ({
    tokens: tokensAvailable.value,
    goals: goals.map(g => ({ team: g.team, stage: g.stage }))
  }),
  () => {
    recalc()
    if (!suppressUrlSync.value) saveStateToUrl()
  },
  { deep: true }
)

onMounted(() => {
  const loaded = loadStateFromUrl()
  if (!loaded) addGoal()

  queueMicrotask(() => recalc())

  window.addEventListener('popstate', () => {
    suppressUrlSync.value = true
    tokensAvailable.value = 0
    goals.splice(0, goals.length)
    errors.value = []
    result.value = null
    meta.goals = 0
    meta.teams = 0
    meta.stages = 0

    const ok = loadStateFromUrl()
    if (!ok && goals.length === 0) addGoal()

    queueMicrotask(() => {
      suppressUrlSync.value = false
      recalc()
    })
  })
})

defineExpose({
  reset,
  share
})
</script>

<style scoped>
.goal-card {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 14px;
}

.pill-sm {
  padding: .22rem .55rem;
  font-size: .85rem;
}

.acc-item {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 14px;
  overflow: hidden;
}

.accordion-button {
  background: rgba(255,255,255,.03);
  color: #e9eefc;
}

.accordion-button::after {
  filter: invert(1);
  opacity: .8;
}

.acc-body {
  background: rgba(255,255,255,.02);
}
</style>
