<template>
  <div class="top-bar">
    <h1 class="title">RVZero - Dadger Processor</h1>
    <div class="controls">
      <div class="selector-group">
        <label class="selector-label">Comparar por:</label>
        <select v-model="compareMode" @change="onCompareModeChange" class="selector">
          <option value="data">Data</option>
          <option value="estagio">Estágio</option>
        </select>
      </div>
      <div class="selector-group">
        <label class="switch-container">
          <input type="checkbox" v-model="showOnlyDifferences" @change="onShowOnlyDifferencesChange" class="switch-input">
          <span class="switch-label">Mostrar apenas diferenças</span>
        </label>
      </div>
      <button class="btn btn-clear" @click="onClearAll">Limpar Todos</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopBar',
  data() {
    return {
      compareMode: 'data',
      showOnlyDifferences: true
    }
  },
  methods: {
    onCompareModeChange() {
      this.$emit('compare-mode-changed', this.compareMode)
    },
    onShowOnlyDifferencesChange() {
      this.$emit('show-only-differences-changed', this.showOnlyDifferences)
    },
    onClearAll() {
      this.$emit('clear-all')
    }
  }
}
</script>

<style scoped>
.top-bar {
  width: 100%;
  height: 60px;
  background: #1e1e1e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 2px solid #00ff00;
  font-family: 'Courier New', monospace;
}

.title {
  color: #00ff00;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.selector-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selector-label {
  color: #00ff00;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.selector {
  padding: 6px 12px;
  background: #2d2d2d;
  color: #00ff00;
  border: 1px solid #00ff00;
  border-radius: 2px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  transition: all 0.2s ease;
}

.selector:hover {
  background: #3d3d3d;
}

.selector:focus {
  outline: none;
  box-shadow: 0 0 0 2px #00ff00;
}

.btn {
  padding: 6px 16px;
  background: #2d2d2d;
  color: #00ff00;
  border: 1px solid #00ff00;
  border-radius: 2px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #3d3d3d;
}

.btn-clear {
  background: #2d2d2d;
  border-color: #ff0000;
  color: #ff0000;
}

.btn-clear:hover {
  background: #4d0000;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.switch-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #00ff00;
}

.switch-label {
  color: #00ff00;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  cursor: pointer;
}
</style>
