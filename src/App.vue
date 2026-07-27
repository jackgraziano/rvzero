<template>
  <div id="app">
    <TopBar
      :compare-mode="compareMode"
      :show-only-differences="showOnlyDifferences"
      :has-files="anyFileLoaded"
      :show-temporal-controls="showTemporalControls"
      @compare-mode-changed="compareMode = $event"
      @show-only-differences-changed="showOnlyDifferences = $event"
      @clear-all="handleClearAll"
    />

    <main class="main-content">
      <div class="columns">
        <DropZone
          ref="dropZone1"
          title="Deck A"
          :index="0"
          :comparison-ready="comparisonReady"
          @data-parsed="handleDataParsed(0, $event)"
          @file-removed="handleFileRemove(0)"
        />
        <DropZone
          ref="dropZone2"
          title="Deck B"
          :index="1"
          :comparison-ready="comparisonReady"
          @data-parsed="handleDataParsed(1, $event)"
          @file-removed="handleFileRemove(1)"
        />
      </div>

      <aside
        v-if="bothFilesLoaded && !filesAreCompatible"
        class="incompatible-message"
        role="alert"
      >
        <span class="message-icon" aria-hidden="true">!</span>
        <div>
          <h2>Os arquivos têm tipos diferentes</h2>
          <p>
            O Deck A é {{ fileData[0].type.name }} e o Deck B é
            {{ fileData[1].type.name }}. Substitua um deles para continuar.
          </p>
        </div>
      </aside>

      <section
        v-if="comparisonReady"
        ref="comparison"
        class="comparison-container"
        aria-label="Resultado da comparação"
      >
        <ComparisonView
          v-if="bothFilesAreDADGER"
          :dadger1-data="fileData[0].data"
          :dadger1-name="fileData[0].name"
          :dadger2-data="fileData[1].data"
          :dadger2-name="fileData[1].name"
          :compare-mode="compareMode"
          :show-only-differences="showOnlyDifferences"
        />

        <RenovaveisComparisonView
          v-else-if="bothFilesAreRenovaveis"
          :renovaveis1-data="fileData[0].data"
          :renovaveis1-name="fileData[0].name"
          :renovaveis2-data="fileData[1].data"
          :renovaveis2-name="fileData[1].name"
          :show-only-differences="showOnlyDifferences"
        />
      </section>
    </main>
  </div>
</template>

<script>
import TopBar from './components/TopBar.vue'
import DropZone from './components/DropZone.vue'
import ComparisonView from './components/ComparisonView.vue'
import RenovaveisComparisonView from './components/RenovaveisComparisonView.vue'

const emptyFile = index => ({
  type: null,
  name: `Deck ${index === 0 ? 'A' : 'B'}`,
  data: null
})

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
      fileData: [emptyFile(0), emptyFile(1)],
      compareMode: 'data',
      showOnlyDifferences: true
    }
  },
  computed: {
    anyFileLoaded() {
      return this.fileData.some(file => file.data !== null)
    },
    bothFilesLoaded() {
      return this.fileData.every(file => file.data !== null)
    },
    bothFilesAreDADGER() {
      return this.fileData.every(file => file.type?.id === 'dadger')
    },
    bothFilesAreRenovaveis() {
      return this.fileData.every(file => file.type?.id === 'renovaveis')
    },
    filesAreCompatible() {
      if (!this.bothFilesLoaded) return true
      return this.fileData[0].type?.id === this.fileData[1].type?.id
    },
    comparisonReady() {
      return this.bothFilesLoaded && this.filesAreCompatible
    },
    showTemporalControls() {
      return !this.bothFilesLoaded || this.bothFilesAreDADGER
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
      this.fileData[index] = emptyFile(index)
    },
    handleClearAll() {
      this.fileData = [emptyFile(0), emptyFile(1)]
      this.$refs.dropZone1?.removeFile()
      this.$refs.dropZone2?.removeFile()
    }
  }
}
</script>

<style>
@import './styles/block-tables.css';

:root {
  color-scheme: dark;
  --background: #050607;
  --surface: #0b0d0f;
  --surface-elevated: #111418;
  --surface-hover: #191d22;
  --chip: #111820;
  --border: #292f35;
  --border-strong: #48515a;
  --text: #f2f0e6;
  --muted: #8e969d;
  --accent: #ff9f1c;
  --accent-strong: #00d8ff;
  --focus: #00d8ff;
  --warning: #ffd166;
  --danger: #ff4d5a;
  --positive: #59f08a;
  --font-ui: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--background);
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  color: var(--text);
  background: var(--background);
  font-family: var(--font-ui);
}

button,
input,
select {
  font: inherit;
}

button {
  -webkit-tap-highlight-color: transparent;
}

::selection {
  color: var(--background);
  background: var(--accent);
}

* {
  scrollbar-color: var(--border-strong) var(--surface);
  scrollbar-width: thin;
}

#app {
  min-height: 100vh;
}

.main-content {
  width: min(1880px, 100%);
  margin: 0 auto;
  padding: clamp(18px, 2.5vw, 34px);
}

.columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  max-width: 1400px;
  margin: 0 auto;
}

.comparison-container {
  margin-top: 18px;
}

.incompatible-message {
  max-width: 760px;
  display: flex;
  align-items: flex-start;
  gap: 13px;
  margin: 24px auto;
  padding: 18px;
  color: var(--text);
  background: color-mix(in srgb, var(--danger) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--danger) 50%, var(--border));
  border-radius: 9px;
}

.message-icon {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  display: grid;
  place-items: center;
  color: var(--background);
  background: var(--danger);
  border-radius: 50%;
  font-size: 13px;
  font-weight: 800;
}

.incompatible-message h2 {
  margin: 0 0 4px;
  font-size: 14px;
}

.incompatible-message p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 760px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
