<template>
  <div id="app">
    <TopBar
      @compare-mode-changed="handleCompareModeChange"
      @show-only-differences-changed="handleShowOnlyDifferencesChange"
      @clear-all="handleClearAll"
    />

    <div class="main-content">
      <!-- Exibir DropZones quando ambos os dadgers não estão carregados -->
      <div v-if="!bothDadgersLoaded" class="columns">
        <DropZone
          ref="dropZone1"
          title="Dadger 1"
          :index="0"
          @data-parsed="(data, fileName) => handleDataParsed(0, data, fileName)"
          @file-removed="handleFileRemove(0)"
        />
        <DropZone
          ref="dropZone2"
          title="Dadger 2"
          :index="1"
          @data-parsed="(data, fileName) => handleDataParsed(1, data, fileName)"
          @file-removed="handleFileRemove(1)"
        />
      </div>

      <!-- Exibir ComparisonView quando ambos os dadgers estão carregados -->
      <div v-else class="comparison-container">
        <ComparisonView
          :dadger1Data="dadgerData[0]"
          :dadger1Name="fileNames[0]"
          :dadger2Data="dadgerData[1]"
          :dadger2Name="fileNames[1]"
          :compareMode="compareMode"
          :showOnlyDifferences="showOnlyDifferences"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from './components/TopBar.vue'
import DropZone from './components/DropZone.vue'
import ComparisonView from './components/ComparisonView.vue'

export default {
  name: 'App',
  components: {
    TopBar,
    DropZone,
    ComparisonView
  },
  data() {
    return {
      dadgerData: [null, null],
      fileNames: ['Dadger 1', 'Dadger 2'],
      compareMode: 'data',
      showOnlyDifferences: true
    }
  },
  computed: {
    bothDadgersLoaded() {
      return this.dadgerData[0] !== null && this.dadgerData[1] !== null
    }
  },
  methods: {
    handleDataParsed(index, data, fileName) {
      this.dadgerData[index] = data
      this.fileNames[index] = fileName || `Dadger ${index + 1}`
    },
    handleFileRemove(index) {
      this.dadgerData[index] = null
      this.fileNames[index] = `Dadger ${index + 1}`
    },
    handleCompareModeChange(mode) {
      this.compareMode = mode
    },
    handleShowOnlyDifferencesChange(value) {
      this.showOnlyDifferences = value
    },
    handleClearAll() {
      this.dadgerData = [null, null]
      this.fileNames = ['Dadger 1', 'Dadger 2']
      if (this.$refs.dropZone1) {
        this.$refs.dropZone1.removeFile()
      }
      if (this.$refs.dropZone2) {
        this.$refs.dropZone2.removeFile()
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  background: #0a0a0a;
}

#app {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: #0a0a0a;
}

.columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.comparison-container {
  max-width: 1800px;
  margin: 0 auto;
  height: calc(100vh - 140px);
}

@media (max-width: 768px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
