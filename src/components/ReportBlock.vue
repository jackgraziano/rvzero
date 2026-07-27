<template>
  <section class="report-block">
    <ComparisonBlockHeader
      :title="title"
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      @toggle="collapsed = !collapsed"
    />

    <div v-if="!collapsed" class="report-block-content">
      <table>
        <thead>
          <tr>
            <th>Estado</th>
            <th>Período</th>
            <th>Identidade</th>
            <th>Campo</th>
            <th>Deck A</th>
            <th>Deck B</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.key"
            :class="statusClass(row.occurrence.status)"
          >
            <td>
              <span class="status-pill">{{ statusLabel(row.occurrence.status) }}</span>
            </td>
            <td>{{ calendarLabel(row.occurrence.calendar) }}</td>
            <td>{{ identityLabel(row.occurrence.identity) }}</td>
            <td>{{ fieldLabel(row.fieldName) }}</td>
            <td :class="{ diff: row.field.changed }">{{ valueLabel(row.field.left) }}</td>
            <td :class="{ diff: row.field.changed }">{{ valueLabel(row.field.right) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import ComparisonBlockHeader from './ComparisonBlockHeader.vue'

const DIFFERENCE_STATUSES = new Set(['changed', 'only-left', 'only-right'])

export default {
  name: 'ReportBlock',
  components: { ComparisonBlockHeader },
  props: {
    title: { type: String, required: true },
    occurrences: { type: Array, required: true }
  },
  data() {
    return {
      collapsed: true
    }
  },
  computed: {
    hasDifferences() {
      return this.occurrences.some(occurrence =>
        DIFFERENCE_STATUSES.has(occurrence.status)
      )
    },
    rows() {
      return this.occurrences.flatMap((occurrence, occurrenceIndex) => {
        const entries = Object.entries(occurrence.fields)
        if (entries.length === 0) {
          return [{
            key: `${occurrenceIndex}:_`,
            occurrence,
            fieldName: '',
            field: { left: null, right: null, changed: false }
          }]
        }

        return entries.map(([fieldName, field]) => ({
          key: `${occurrenceIndex}:${fieldName}`,
          occurrence,
          fieldName,
          field
        }))
      })
    }
  },
  methods: {
    statusLabel(status) {
      return {
        equal: 'Igual',
        changed: 'Alterado',
        'only-left': 'Só A',
        'only-right': 'Só B',
        'outside-common-horizon': 'Fora do horizonte'
      }[status] ?? status
    },
    statusClass(status) {
      return {
        'is-changed': status === 'changed',
        'is-only-one': status === 'only-left' || status === 'only-right',
        'is-outside': status === 'outside-common-horizon'
      }
    },
    calendarLabel(calendar) {
      const parts = []
      if (calendar.date) parts.push(calendar.date)
      if (calendar.index != null) parts.push(`Índice ${calendar.index}`)
      if (calendar.leftIndex != null || calendar.rightIndex != null) {
        parts.push(`A ${calendar.leftIndex ?? '-'} / B ${calendar.rightIndex ?? '-'}`)
      }
      return parts.join(' · ') || '-'
    },
    identityLabel(identity) {
      const entries = Object.entries(identity ?? {})
        .filter(([, value]) => value != null && value !== '')
      if (entries.length === 0) return '-'
      return entries
        .map(([key, value]) => `${this.fieldLabel(key)} ${value}`)
        .join(' · ')
    },
    fieldLabel(fieldName) {
      if (!fieldName) return '-'
      return fieldName
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, char => char.toUpperCase())
    },
    valueLabel(value) {
      if (value == null) return '-'
      if (typeof value === 'number') {
        return value.toLocaleString('pt-BR', {
          maximumFractionDigits: 3
        })
      }
      if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
      if (typeof value === 'string') return value.trim() || '-'
      if (Array.isArray(value)) {
        return value.length === 1 ? '1 item' : `${value.length} itens`
      }
      return 'estrutura'
    }
  }
}
</script>

<style scoped>
.report-block {
  margin: 8px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
}

.report-block-content {
  overflow: auto;
  background: var(--surface);
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font: 500 11px/1.4 var(--font-ui);
}

th,
td {
  padding: 7px 9px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: var(--accent);
  background: var(--surface-elevated);
  font: 700 10px/1.3 var(--font-ui);
}

td {
  color: var(--text);
}

.diff {
  color: var(--warning);
  background: color-mix(in srgb, var(--warning) 12%, transparent);
}

.is-only-one td {
  background: color-mix(in srgb, var(--danger) 8%, transparent);
}

.is-outside td {
  color: var(--muted);
  opacity: 0.68;
}

.status-pill {
  display: inline-flex;
  max-width: 100%;
  padding: 2px 7px;
  color: var(--text);
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 999px;
  font: 700 10px/1.4 var(--font-ui);
  white-space: nowrap;
}

.is-changed .status-pill {
  color: var(--warning);
  border-color: color-mix(in srgb, var(--warning) 45%, var(--border));
}

.is-only-one .status-pill {
  color: var(--danger);
  border-color: color-mix(in srgb, var(--danger) 45%, var(--border));
}
</style>
