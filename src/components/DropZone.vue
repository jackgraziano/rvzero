<template>
  <section
    class="drop-zone"
    :class="{
      'drag-over': isDragging,
      'has-file': file,
      'is-reading': isReading,
      'has-error': errorMessage
    }"
    :aria-busy="String(isReading)"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div v-if="!file" class="drop-zone-content">
      <div class="upload-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img">
          <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V13"/>
        </svg>
      </div>
      <div class="upload-copy">
        <span class="slot-label">{{ title }}</span>
        <h2>Arraste o arquivo para cá</h2>
        <p>{{ supportedTypesText }} · processamento local</p>
      </div>
      <label class="upload-button">
        Escolher arquivo
        <input ref="fileInput" type="file" @change="onFileSelect">
      </label>
      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>
    </div>

    <div v-else class="file-loaded">
      <div class="file-type" :class="{ loading: isReading }" aria-hidden="true">
        {{ isReading ? '···' : fileType?.id === 'dadger' ? 'DG' : 'RN' }}
      </div>
      <div class="file-details">
        <span class="slot-label">{{ title }}</span>
        <h2 :title="file.name">{{ file.name }}</h2>
        <p>
          {{ isReading ? 'Validando arquivo…' : fileStatus }}
          <span aria-hidden="true">·</span>
          {{ formatFileSize(file.size) }}
        </p>
      </div>
      <button
        type="button"
        class="remove-button"
        :aria-label="`Remover ${file.name}`"
        title="Remover arquivo"
        @click="removeFile"
      >
        ×
      </button>
    </div>
  </section>
</template>

<script>
import { detectFileType, parseFile, getSupportedTypes } from '../utils/fileTypeRegistry.js'

export default {
  name: 'DropZone',
  emits: ['data-parsed', 'file-removed'],
  props: {
    title: { type: String, required: true },
    index: { type: Number, required: true },
    comparisonReady: { type: Boolean, default: false }
  },
  data() {
    return {
      isDragging: false,
      isReading: false,
      errorMessage: '',
      file: null,
      parsedData: null,
      fileType: null
    }
  },
  computed: {
    supportedTypesText() {
      return getSupportedTypes().map(type => type.name).join(' ou ')
    },
    fileStatus() {
      return this.comparisonReady
        ? 'Pronto para comparar'
        : 'Arquivo validado · aguardando o outro deck'
    }
  },
  methods: {
    onDragLeave(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isDragging = false
      }
    },
    onDrop(event) {
      this.isDragging = false
      const [file] = event.dataTransfer.files
      if (file) this.handleFile(file)
    },
    onFileSelect(event) {
      const [file] = event.target.files
      if (file) this.handleFile(file)
    },
    handleFile(file) {
      this.errorMessage = ''
      const detectedType = detectFileType(file.name)

      if (!detectedType) {
        this.errorMessage = `Tipo não suportado. Selecione um arquivo ${this.supportedTypesText}.`
        this.resetInput()
        return
      }

      this.file = file
      this.fileType = detectedType
      this.isReading = true
      this.readAndParseFile(file)
    },
    readAndParseFile(file) {
      const reader = new FileReader()
      reader.onload = event => {
        try {
          this.parsedData = parseFile(file.name, event.target.result)
          this.isReading = false
          this.$emit('data-parsed', {
            type: this.fileType,
            name: file.name,
            data: this.parsedData
          })
        } catch (error) {
          this.failReading(`Não foi possível processar o arquivo: ${error.message}`)
        }
      }
      reader.onerror = () => {
        this.failReading('Não foi possível ler o arquivo. Tente selecioná-lo novamente.')
      }
      reader.readAsText(file)
    },
    failReading(message) {
      this.errorMessage = message
      this.file = null
      this.parsedData = null
      this.fileType = null
      this.isReading = false
      this.resetInput()
      this.$emit('file-removed')
    },
    removeFile() {
      this.file = null
      this.parsedData = null
      this.fileType = null
      this.isReading = false
      this.errorMessage = ''
      this.resetInput()
      this.$emit('file-removed')
    },
    resetInput() {
      if (this.$refs.fileInput) this.$refs.fileInput.value = ''
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 bytes'
      const units = ['bytes', 'KB', 'MB', 'GB']
      const unitIndex = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
      )
      const value = bytes / Math.pow(1024, unitIndex)
      return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${units[unitIndex]}`
    }
  }
}
</script>

<style scoped>
.drop-zone {
  min-width: 0;
  min-height: 210px;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: var(--surface);
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  transition: 160ms ease;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--surface) 88%, var(--accent) 12%);
}

.drop-zone.drag-over {
  border-style: solid;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
  transform: translateY(-2px);
}

.drop-zone.has-file {
  min-height: 82px;
  border-style: solid;
}

.drop-zone.has-error {
  border-color: var(--danger);
}

.drop-zone-content {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  padding: clamp(22px, 4vw, 38px);
}

.upload-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent) 24%, var(--border));
  border-radius: 10px;
}

.upload-icon svg {
  width: 23px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.slot-label {
  display: block;
  margin-bottom: 4px;
  color: var(--accent);
  font: 750 9px/1.2 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.upload-copy h2,
.file-details h2 {
  margin: 0;
  color: var(--text);
  font: 650 14px/1.3 var(--font-ui);
}

.upload-copy p,
.file-details p {
  margin: 5px 0 0;
  color: var(--muted);
  font: 500 10px/1.4 var(--font-ui);
}

.upload-button {
  position: relative;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 13px;
  color: var(--background);
  background: var(--accent);
  border-radius: 7px;
  cursor: pointer;
  font: 700 11px/1 var(--font-ui);
  white-space: nowrap;
}

.upload-button:hover {
  background: var(--accent-strong);
}

.upload-button:focus-within {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

.upload-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.error-message {
  grid-column: 2 / -1;
  margin: -7px 0 0;
  color: var(--danger);
  font: 600 11px/1.45 var(--font-ui);
}

.file-loaded {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.file-type {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  color: var(--background);
  background: var(--accent);
  border-radius: 8px;
  font: 800 10px/1 var(--font-mono);
}

.file-type.loading {
  color: var(--accent);
  background: var(--surface-elevated);
}

.file-details {
  min-width: 0;
  flex: 1;
}

.file-details h2 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-button {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: grid;
  place-items: center;
  color: var(--muted);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 7px;
  cursor: pointer;
  font: 400 20px/1 var(--font-ui);
}

.remove-button:hover {
  color: var(--danger);
  border-color: var(--danger);
}

.remove-button:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

@media (max-width: 700px) {
  .drop-zone-content {
    grid-template-columns: auto 1fr;
  }

  .upload-button {
    grid-column: 1 / -1;
  }
}
</style>
