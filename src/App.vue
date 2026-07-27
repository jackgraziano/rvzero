<template>
  <div id="app">
    <TopBar
      :compare-mode="activeCompareMode"
      :show-only-differences="showOnlyDifferences"
      :has-files="anyFileLoaded"
      :date-mode-available="dateModeAvailable"
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
          :ready-types="pairedTypeIds"
          @data-parsed="handleDataParsed(0, $event)"
          @file-removed="handleFileRemove(0, $event)"
        />
        <DropZone
          ref="dropZone2"
          title="Deck B"
          :index="1"
          :ready-types="pairedTypeIds"
          @data-parsed="handleDataParsed(1, $event)"
          @file-removed="handleFileRemove(1, $event)"
        />
      </div>

      <aside
        v-for="message in unpairedFileMessages"
        :key="message"
        class="incompatible-message"
        role="status"
      >
        <span class="message-icon" aria-hidden="true">!</span>
        <div>
          <h2>Arquivo sem correspondente</h2>
          <p>{{ message }}</p>
        </div>
      </aside>

      <section
        v-if="comparisonReady"
        ref="comparison"
        class="comparison-container"
        aria-label="Resultado da comparação"
      >
        <header class="comparison-files" aria-label="Arquivos em comparação">
          <div
            v-for="(deck, index) in deckFiles"
            :key="`files-${index}`"
            class="comparison-file-set"
          >
            <span>Deck {{ index === 0 ? 'A' : 'B' }}</span>
            <div class="comparison-file-list">
              <div
                v-for="file in loadedFiles(deck)"
                :key="file.type.id"
                class="comparison-file"
              >
                <strong>{{ file.type.name }}</strong>
                <span :title="file.name">{{ file.name }}</span>
                <small v-if="fileCalendarLabel(file)">
                  {{ fileCalendarLabel(file) }}
                </small>
              </div>
            </div>
          </div>
        </header>

        <ComparisonView
          v-if="hasDadgerComparison"
          :dadger1-data="deckFiles[0].dadger.data"
          :dadger1-name="deckFiles[0].dadger.name"
          :dadger2-data="deckFiles[1].dadger.data"
          :dadger2-name="deckFiles[1].dadger.name"
          :compare-mode="activeCompareMode"
          :show-only-differences="showOnlyDifferences"
        />

        <RenovaveisComparisonView
          v-if="hasRenovaveisComparison"
          :renovaveis1-data="deckFiles[0].renovaveis.data"
          :renovaveis1-name="deckFiles[0].renovaveis.name"
          :renovaveis2-data="deckFiles[1].renovaveis.data"
          :renovaveis2-name="deckFiles[1].renovaveis.name"
          :dadger1-data="deckFiles[0].dadger?.data ?? null"
          :dadger2-data="deckFiles[1].dadger?.data ?? null"
          :compare-mode="activeCompareMode"
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

const emptyDeck = () => ({
  dadger: null,
  renovaveis: null
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
      deckFiles: [emptyDeck(), emptyDeck()],
      compareMode: 'data',
      showOnlyDifferences: true
    }
  },
  computed: {
    anyFileLoaded() {
      return this.deckFiles.some(deck => this.loadedFiles(deck).length > 0)
    },
    hasDadgerComparison() {
      return this.deckFiles.every(deck => deck.dadger !== null)
    },
    hasRenovaveisComparison() {
      return this.deckFiles.every(deck => deck.renovaveis !== null)
    },
    pairedTypeIds() {
      return [
        ...(this.hasDadgerComparison ? ['dadger'] : []),
        ...(this.hasRenovaveisComparison ? ['renovaveis'] : [])
      ]
    },
    comparisonReady() {
      return this.hasDadgerComparison || this.hasRenovaveisComparison
    },
    dateModeAvailable() {
      return this.hasDadgerComparison
    },
    activeCompareMode() {
      return this.dateModeAvailable ? this.compareMode : 'estagio'
    },
    unpairedFileMessages() {
      const messages = []
      const typeIds = ['dadger', 'renovaveis']

      typeIds.forEach(typeId => {
        const first = this.deckFiles[0][typeId]
        const second = this.deckFiles[1][typeId]
        if (Boolean(first) === Boolean(second)) return

        const sourceIndex = first ? 0 : 1
        const targetIndex = first ? 1 : 0
        const typeName = (first ?? second).type.name
        messages.push(
          `${typeName} foi adicionado somente ao Deck ${sourceIndex === 0 ? 'A' : 'B'}. ` +
          `Adicione um arquivo do mesmo tipo ao Deck ${targetIndex === 0 ? 'A' : 'B'} para compará-lo.`
        )
      })

      return messages
    }
  },
  methods: {
    handleDataParsed(index, fileInfo) {
      this.deckFiles[index][fileInfo.type.id] = {
        type: fileInfo.type,
        name: fileInfo.name,
        data: fileInfo.data
      }
    },
    handleFileRemove(index, typeId) {
      if (typeId in this.deckFiles[index]) {
        this.deckFiles[index][typeId] = null
      }
    },
    handleClearAll() {
      this.deckFiles = [emptyDeck(), emptyDeck()]
      this.$refs.dropZone1?.clearFiles()
      this.$refs.dropZone2?.clearFiles()
    },
    loadedFiles(deck) {
      return ['dadger', 'renovaveis']
        .map(typeId => deck[typeId])
        .filter(Boolean)
    },
    fileCalendarLabel(file) {
      if (file.type.id !== 'dadger') return ''
      const baseDate = file.data.info_dadger?.data_base
      return baseDate ? `DT ${baseDate}` : ''
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

.comparison-container > * + * {
  margin-top: 12px;
}

.comparison-files {
  max-width: 1400px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0 auto 12px;
  overflow: hidden;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 9px;
}

.comparison-file-set {
  min-width: 0;
  padding: 12px;
  background: var(--surface);
}

.comparison-file-set > span {
  display: block;
  margin-bottom: 8px;
  color: var(--accent);
  font: 750 9px/1.2 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.comparison-file-list {
  display: grid;
  gap: 6px;
}

.comparison-file {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 8px;
  padding: 7px 9px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: var(--font-mono);
}

.comparison-file strong {
  color: var(--accent-strong);
  font-size: 9px;
}

.comparison-file span {
  overflow: hidden;
  color: var(--text);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparison-file small {
  color: var(--muted);
  font-size: 9px;
  white-space: nowrap;
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

  .comparison-files {
    grid-template-columns: 1fr;
  }

  .comparison-file {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .comparison-file small {
    grid-column: 2;
  }
}
</style>
