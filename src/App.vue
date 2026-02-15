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

      <div class="d-flex flex-wrap gap-2 align-items-center">
        <div class="btn-group" role="group" aria-label="tabs">
          <button
            class="btn btn-outline-light"
            :class="{ active: activeTab === 'planner' }"
            @click="activeTab = 'planner'"
          >
            {{ t('tabPlanner') }}
          </button>
          <button
            class="btn btn-outline-light"
            :class="{ active: activeTab === 'calculator' }"
            @click="activeTab = 'calculator'"
          >
            {{ t('tabCalculator') }}
          </button>
        </div>

        <button
          class="btn btn-outline-light"
          :disabled="shareDisabled"
          @click="share"
        >
          {{ t('share') }}
        </button>

        <div class="btn-group" role="group" aria-label="language switch">
          <button class="btn btn-outline-light" :class="{ active: lang === 'ru' }" @click="setLang('ru')">
            {{ t('ru') }}
          </button>
          <button class="btn btn-outline-light" :class="{ active: lang === 'en' }" @click="setLang('en')">
            {{ t('en') }}
          </button>
        </div>

        <button class="btn btn-outline-light" @click="resetActive">
          {{ t('reset') }}
        </button>
      </div>
    </div>

    <PlannerTab
      v-if="activeTab === 'planner'"
      ref="plannerRef"
      @share-enabled="plannerShareEnabled = $event"
    />

    <CalculatorTab
      v-else
      ref="calcRef"
      @items-count="calcItemsCount = $event"
    />
  </div>
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import CalculatorTab from './components/CalculatorTab.vue'
import PlannerTab from './components/PlannerTab.vue'
import en from './i18n/en'
import ru from './i18n/ru'

const dicts = { en, ru }
const lang = ref('en')
const activeTab = ref('planner')

function setLang(code) {
  if (code === 'en' || code === 'ru') lang.value = code
}

function t(key, vars = {}) {
  const s = dicts[lang.value]?.[key] ?? key
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
}

// ---- Toasts ----
const toasts = ref([])

function toastIcon(type) {
  if (type === 'success') return '✅'
  if (type === 'warning') return '⚠️'
  if (type === 'danger') return '⛔'
  return 'ℹ️'
}

function pushToast(msg, type = 'info') {
  const id = Math.random().toString(16).slice(2)
  toasts.value.push({ id, msg, type })
  window.setTimeout(() => removeToast(id), 4000)
}

function removeToast(id) {
  toasts.value = toasts.value.filter(x => x.id !== id)
}

provide('i18n', { lang, setLang, t })
provide('toast', { pushToast })

// ---- Child actions ----
const calcRef = ref(null)
const plannerRef = ref(null)

const calcItemsCount = ref(0)
const plannerShareEnabled = ref(false)

const shareDisabled = computed(() => {
  if (activeTab.value === 'calculator') return calcItemsCount.value === 0
  return !plannerShareEnabled.value
})

function share() {
  if (activeTab.value === 'planner') plannerRef.value?.share?.()
  else calcRef.value?.share?.()
}

function resetActive() {
  if (activeTab.value === 'planner') plannerRef.value?.reset?.()
  else calcRef.value?.reset?.()
}
</script>
