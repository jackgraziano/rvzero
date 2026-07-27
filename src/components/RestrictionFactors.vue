<template>
  <div v-if="groups.length" class="factor-groups">
    <section
      v-for="(group, index) in groups"
      :key="`${group.code}-${group.context}-${group.factor}-${index}`"
      class="factor-group"
    >
      <div class="factor-heading">
        <abbr :title="group.label">{{ group.code }}</abbr>
        <span v-if="group.context" class="factor-context">{{ group.context }}</span>
        <span class="factor-value">×{{ formatCompactNumber(group.factor) }}</span>
      </div>
      <div class="factor-items" :aria-label="`${group.label}: ${group.items.join(', ')}`">
        <span v-for="item in group.items" :key="item" class="factor-item">{{ item }}</span>
      </div>
    </section>
  </div>
  <span v-else class="empty-value">—</span>
</template>

<script>
import { computed } from 'vue'
import {
  formatCompactNumber,
  groupRestrictionFactors
} from '../utils/restrictionDisplay.js'

export default {
  name: 'RestrictionFactors',
  props: {
    restriction: { type: Object, default: null }
  },
  setup(props) {
    const groups = computed(() => groupRestrictionFactors(props.restriction))
    return { formatCompactNumber, groups }
  }
}
</script>

<style scoped>
.factor-groups {
  display: grid;
  gap: 8px;
  min-width: 230px;
}

.factor-group {
  min-width: 0;
}

.factor-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
  color: var(--muted);
  font: 600 10px/1.25 var(--font-ui);
}

.factor-heading abbr {
  color: var(--accent-strong);
  font-weight: 750;
  text-decoration: none;
}

.factor-context {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.factor-value {
  margin-left: auto;
  color: var(--text);
  font-family: var(--font-mono);
  white-space: nowrap;
}

.factor-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.factor-item {
  padding: 2px 6px;
  color: var(--text);
  background: var(--chip);
  border: 1px solid var(--border);
  border-radius: 4px;
  font: 500 10px/1.35 var(--font-mono);
}

.empty-value {
  color: var(--muted);
}
</style>
