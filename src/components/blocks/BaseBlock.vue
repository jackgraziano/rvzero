<template>
  <div :class="blockClass">
    <div class="block-header" @click="onToggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name">{{ title }}</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Lado 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ dadger1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <slot name="table1" :data="filteredData"></slot>
          </div>
        </div>

        <!-- Lado 2 -->
        <div class="table-side">
          <h4 class="table-title">{{ dadger2Name }}</h4>
          <div class="table-container" :ref="el => tableContainer2 = el" @scroll="onScroll2">
            <slot name="table2" :data="filteredData"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseBlock',
  props: {
    title: {
      type: String,
      required: true
    },
    blockClass: {
      type: String,
      required: true
    },
    dadger1Name: {
      type: String,
      required: true
    },
    dadger2Name: {
      type: String,
      required: true
    },
    collapsed: {
      type: Boolean,
      required: true
    },
    filteredData: {
      type: Array,
      required: true
    },
    tableContainer1: {
      type: Object,
      default: null
    },
    tableContainer2: {
      type: Object,
      default: null
    },
    onToggleCollapsed: {
      type: Function,
      required: true
    },
    onScroll1: {
      type: Function,
      required: true
    },
    onScroll2: {
      type: Function,
      required: true
    }
  }
}
</script>

<style scoped>
/* Estilos base para todos os blocos */
.block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #2d2d2d;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #00ff00;
}

.block-header:hover {
  background: #3d3d3d;
}

.block-icon {
  color: #00ff00;
  font-size: 12px;
  font-family: monospace;
}

.block-name {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.block-content {
  background: #1e1e1e;
}

.comparison-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: #ffffff;
  overflow: hidden;
}

.table-side {
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-title {
  padding: 8px 12px;
  background: #2d2d2d;
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #00ff00;
  border-bottom: 1px solid #00ff00;
  font-family: 'Courier New', monospace;
}

.table-container {
  max-height: 500px;
  overflow: auto;
  background: #1e1e1e;
}
</style>
