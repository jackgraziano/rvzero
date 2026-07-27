<template>
  <button
    type="button"
    class="block-header"
    :aria-expanded="String(!collapsed)"
    @click="$emit('toggle')"
  >
    <span class="block-icon" aria-hidden="true">{{ collapsed ? '›' : '⌄' }}</span>
    <span
      class="block-name"
      :class="{ 'has-diff': hasDifferences }"
      role="heading"
      aria-level="3"
    >
      {{ title }}
    </span>
    <span class="block-status" :class="{ 'has-diff': hasDifferences }">
      <span class="status-dot" aria-hidden="true"></span>
      {{ hasDifferences ? 'Com alterações' : 'Sem alterações' }}
    </span>
  </button>
</template>

<script>
export default {
  name: 'ComparisonBlockHeader',
  emits: ['toggle'],
  props: {
    collapsed: { type: Boolean, required: true },
    hasDifferences: { type: Boolean, required: true },
    title: { type: String, required: true }
  }
}
</script>

<style scoped>
.block-header {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  color: var(--accent);
  background: var(--surface-elevated);
  border: 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  text-align: left;
  user-select: none;
  transition: background 120ms ease;
}

.block-header:hover {
  background: var(--surface-hover);
}

.block-header:focus-visible {
  position: relative;
  z-index: 2;
  outline: 2px solid var(--focus);
  outline-offset: -2px;
}

.block-icon {
  width: 16px;
  flex: 0 0 16px;
  color: var(--muted);
  font: 700 20px/1 var(--font-mono);
  text-align: center;
  transform: translateY(-1px);
}

.block-name {
  min-width: 0;
  flex: 1;
  color: var(--text);
  font: 650 12px/1.35 var(--font-ui);
  letter-spacing: 0.035em;
}

.block-name.has-diff {
  color: var(--warning);
}

.block-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 3px 8px;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  font: 600 10px/1.4 var(--font-ui);
  letter-spacing: 0;
  text-transform: none;
}

.block-status.has-diff {
  color: var(--warning);
  border-color: color-mix(in srgb, var(--warning) 45%, var(--border));
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--muted);
  border-radius: 50%;
}

.has-diff .status-dot {
  background: var(--warning);
}

@media (max-width: 640px) {
  .block-status {
    padding: 0;
    border: 0;
    background: transparent;
  }

  .block-status:not(.has-diff) {
    font-size: 0;
  }

  .block-status:not(.has-diff) .status-dot {
    width: 8px;
    height: 8px;
  }
}
</style>
