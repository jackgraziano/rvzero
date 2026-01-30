<template>
  <div id="app">
    <TopBar
      @compare-mode-changed="handleCompareModeChange"
      @show-only-differences-changed="handleShowOnlyDifferencesChange"
      @clear-all="handleClearAll"
    />

    <div class="main-content">
      <!-- DropZones sempre visíveis -->
      <div class="columns">
        <DropZone
          ref="dropZone1"
          title="Arquivo 1"
          :index="0"
          @data-parsed="(fileInfo) => handleDataParsed(0, fileInfo)"
          @file-removed="handleFileRemove(0)"
        />
        <DropZone
          ref="dropZone2"
          title="Arquivo 2"
          :index="1"
          @data-parsed="(fileInfo) => handleDataParsed(1, fileInfo)"
          @file-removed="handleFileRemove(1)"
        />
      </div>

      <!-- Mensagem de incompatibilidade -->
      <div v-if="bothDadgersLoaded && !filesAreCompatible" class="incompatible-message">
        <p>⚠️ Arquivos incompatíveis: {{ fileData[0].type.name }} e {{ fileData[1].type.name }}</p>
        <p>Por favor, selecione dois arquivos do mesmo tipo para comparar.</p>
      </div>

      <!-- ComparisonView quando ambos os arquivos estão carregados e são compatíveis -->
      <div v-if="bothDadgersLoaded && filesAreCompatible" class="comparison-container">
        <!-- Mostrar comparação de DADGER -->
        <ComparisonView
          v-if="bothFilesAreDADGER"
          :dadger1Data="fileData[0].data"
          :dadger1Name="fileData[0].name"
          :dadger2Data="fileData[1].data"
          :dadger2Name="fileData[1].name"
          :compareMode="compareMode"
          :showOnlyDifferences="showOnlyDifferences"
        />

        <!-- Mostrar comparação de RENOVÁVEIS -->
        <RenovaveisComparisonView
          v-else-if="bothFilesAreRenovaveis"
          :renovaveis1Data="fileData[0].data"
          :renovaveis1Name="fileData[0].name"
          :renovaveis2Data="fileData[1].data"
          :renovaveis2Name="fileData[1].name"
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
import RenovaveisComparisonView from './components/RenovaveisComparisonView.vue'

export default {
  name: 'App',
  components: {
    TopBar,
    DropZone,
    ComparisonView,
    RenovaveisComparisonView
  },
  data() {
    return {
      fileData: [
        { type: null, name: 'Arquivo 1', data: null },
        { type: null, name: 'Arquivo 2', data: null }
      ],
      compareMode: 'data',
      showOnlyDifferences: true
    }
  },
  computed: {
    bothDadgersLoaded() {
      return this.fileData[0].data !== null && this.fileData[1].data !== null
    },
    bothFilesAreDADGER() {
      return this.fileData[0].type?.id === 'dadger' && this.fileData[1].type?.id === 'dadger'
    },
    bothFilesAreRenovaveis() {
      return this.fileData[0].type?.id === 'renovaveis' && this.fileData[1].type?.id === 'renovaveis'
    },
    filesAreCompatible() {
      if (!this.bothDadgersLoaded) return true
      return this.fileData[0].type?.id === this.fileData[1].type?.id
    }
  },
  methods: {
    handleDataParsed(index, fileInfo) {
      this.fileData[index] = {
        type: fileInfo.type,
        name: fileInfo.name,
        data: fileInfo.data
      }
    },
    handleFileRemove(index) {
      this.fileData[index] = {
        type: null,
        name: `Arquivo ${index + 1}`,
        data: null
      }
    },
    handleCompareModeChange(mode) {
      this.compareMode = mode
    },
    handleShowOnlyDifferencesChange(value) {
      this.showOnlyDifferences = value
    },
    handleClearAll() {
      this.fileData = [
        { type: null, name: 'Arquivo 1', data: null },
        { type: null, name: 'Arquivo 2', data: null }
      ]
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
  margin: 20px auto 0;
  height: calc(100vh - 300px);
}

.incompatible-message {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid #ff0000;
  border-radius: 4px;
  text-align: center;
}

.incompatible-message p {
  color: #ff0000;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin: 10px 0;
  font-weight: 700;
}

.incompatible-message p:last-child {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 400;
}

@media (max-width: 768px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
