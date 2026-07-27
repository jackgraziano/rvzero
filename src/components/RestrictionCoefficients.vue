<template>
  <div v-if="groups.length" class="coefficient-groups">
    <div
      v-for="(group, index) in groups"
      :key="`${group.variable}-${group.coefficient}-${index}`"
      class="coefficient-group"
    >
      <div class="coefficient-heading">
        <span>{{ group.variable }}</span>
        <strong>×{{ formatCompactNumber(group.coefficient) }}</strong>
      </div>
      <div class="coefficient-plants">
        <span v-for="plant in group.plants" :key="plant">{{ plant }}</span>
      </div>
    </div>
  </div>
  <span v-else class="empty-value">—</span>
</template>

<script>
import { computed } from 'vue'
import {
  formatCompactNumber,
  groupRestrictionCoefficients
} from '../utils/restrictionDisplay.js'

export default {
  name: 'RestrictionCoefficients',
  props: {
    coefficients: { type: Array, default: () => [] }
  },
  setup(props) {
    const groups = computed(() => groupRestrictionCoefficients(props.coefficients))
    return { formatCompactNumber, groups }
  }
}
</script>

<style scoped>
.coefficient-groups {
  display: grid;
  gap: 6px;
}

.coefficient-heading {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  color: var(--accent-strong);
  font: 700 9px/1.3 var(--font-ui);
}

.coefficient-heading strong {
  color: var(--text);
  font-family: var(--font-mono);
}

.coefficient-plants {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.coefficient-plants span {
  padding: 1px 5px;
  color: var(--text);
  background: var(--chip);
  border: 1px solid var(--border);
  border-radius: 4px;
  font: 500 9px/1.35 var(--font-mono);
}

.empty-value {
  color: var(--muted);
}
</style>
