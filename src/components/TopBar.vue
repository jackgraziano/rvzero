<template>
  <div class="top-bar">
    <h1 class="title">RVZero - Comparador de Dadgers</h1>
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
      <button class="btn btn-clear" @click="onClearAll">Limpar</button>
      <button class="btn btn-about" @click="showAbout = true">Sobre</button>
    </div>

    <!-- Modal Sobre -->
    <div v-if="showAbout" class="modal-overlay" @click="showAbout = false">
      <div class="modal-content" @click.stop>
        <h2>Sobre</h2>
        <p>Comparador de Decks de Decomp 100% vibecodado com Claude Code</p>
        <a href="https://github.com/jackgraziano/rvzero" target="_blank" rel="noopener noreferrer">
          github.com/jackgraziano/rvzero
        </a>
        <button class="btn btn-close" @click="showAbout = false">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopBar',
  data() {
    return {
      compareMode: 'data',
      showOnlyDifferences: true,
      showAbout: false
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

.btn-about {
  background: #2d2d2d;
  border-color: #00ff00;
  color: #00ff00;
}

.btn-about:hover {
  background: #004d00;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e1e1e;
  border: 2px solid #00ff00;
  border-radius: 4px;
  padding: 30px;
  max-width: 500px;
  font-family: 'Courier New', monospace;
}

.modal-content h2 {
  color: #00ff00;
  font-size: 18px;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.modal-content p {
  color: #00ff00;
  font-size: 13px;
  line-height: 1.6;
  margin: 10px 0;
}

.modal-content a {
  color: #00ffff;
  text-decoration: none;
  font-size: 13px;
  display: block;
  margin: 15px 0;
}

.modal-content a:hover {
  text-decoration: underline;
}

.btn-close {
  margin-top: 20px;
  width: 100%;
}
</style>
