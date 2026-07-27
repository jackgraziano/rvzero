<template>
  <section
    class="drop-zone"
    :class="{
      'drag-over': isDragging,
      'has-file': files.length > 0,
      'is-reading': isReading,
      'has-error': errorMessage
    }"
    :aria-busy="String(isReading)"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div class="drop-zone-content">
      <div class="upload-row">
        <div class="upload-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V13"/>
          </svg>
        </div>
        <div class="upload-copy">
          <span class="slot-label">{{ title }}</span>
          <h2>
            {{ files.length ? 'Adicione arquivos a este conjunto' : 'Arraste os arquivos para cá' }}
          </h2>
          <p>{{ supportedTypesText }} · até um de cada tipo · processamento local</p>
        </div>
        <label class="upload-button">
          {{ files.length ? 'Adicionar ou substituir' : 'Escolher arquivos' }}
          <input ref="fileInput" type="file" multiple @change="onFileSelect">
        </label>
      </div>

      <p v-if="isReading" class="reading-message" role="status">
        Validando {{ pendingCount }} {{ pendingCount === 1 ? 'arquivo' : 'arquivos' }}…
      </p>

      <div v-if="files.length" class="file-list">
        <article
          v-for="file in files"
          :key="file.type.id"
          class="file-loaded"
        >
          <div class="file-type" aria-hidden="true">
            {{ fileBadge(file.type.id) }}
          </div>
          <div class="file-details">
            <span class="file-kind">{{ file.type.name }}</span>
            <h3 :title="file.name">{{ file.name }}</h3>
            <p>
              {{ fileStatus(file) }}
              <span aria-hidden="true">·</span>
              {{ formatFileSize(file.size) }}
            </p>
          </div>
          <button
            type="button"
            class="remove-button"
            :aria-label="`Remover ${file.name}`"
            title="Remover arquivo"
            @click="removeFile(file.type.id)"
          >
            ×
          </button>
        </article>
      </div>

      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>
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
    readyTypes: { type: Array, default: () => [] }
  },
  data() {
    return {
      isDragging: false,
      pendingCount: 0,
      readGeneration: 0,
      errorMessage: '',
      files: []
    }
  },
  computed: {
    isReading() {
      return this.pendingCount > 0
    },
    supportedTypesText() {
      return getSupportedTypes().map(type => type.name).join(' ou ')
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
      this.handleFiles(event.dataTransfer.files)
    },
    onFileSelect(event) {
      this.handleFiles(event.target.files)
    },
    async handleFiles(fileList) {
      const selectedFiles = [...fileList]
      if (selectedFiles.length === 0) return

      const generation = this.readGeneration
      this.errorMessage = ''
      const errors = []
      const supportedFiles = selectedFiles
        .map(file => ({ file, type: detectFileType(file.name) }))
        .filter(({ file, type }) => {
          if (type) return true
          errors.push(`${file.name}: tipo não suportado`)
          return false
        })

      this.pendingCount += supportedFiles.length
      for (const { file, type: detectedType } of supportedFiles) {
        try {
          const content = await this.readFile(file)
          if (generation !== this.readGeneration) continue

          const parsedData = parseFile(file.name, content)
          const fileInfo = {
            type: detectedType,
            name: file.name,
            size: file.size,
            data: parsedData
          }
          const existingIndex = this.files.findIndex(
            item => item.type.id === detectedType.id
          )

          if (existingIndex === -1) {
            this.files.push(fileInfo)
          } else {
            this.files.splice(existingIndex, 1, fileInfo)
          }

          this.$emit('data-parsed', fileInfo)
        } catch (error) {
          if (generation === this.readGeneration) {
            errors.push(`${file.name}: ${error.message}`)
          }
        } finally {
          if (generation === this.readGeneration) {
            this.pendingCount = Math.max(0, this.pendingCount - 1)
          }
        }
      }

      if (generation !== this.readGeneration) return
      if (errors.length > 0) {
        this.errorMessage = `Não foi possível processar: ${errors.join('; ')}.`
      }
      this.resetInput()
    },
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = event => resolve(event.target.result)
        reader.onerror = () => reject(
          new Error('não foi possível ler o arquivo; selecione-o novamente')
        )
        reader.readAsText(file)
      })
    },
    fileStatus(file) {
      return this.readyTypes.includes(file.type.id)
        ? 'Pronto para comparar'
        : 'Validado · aguardando arquivo correspondente'
    },
    fileBadge(typeId) {
      return {
        dadger: 'DG',
        renovaveis: 'RN',
        dadgnl: 'DN'
      }[typeId] ?? 'ARQ'
    },
    removeFile(typeId) {
      this.files = this.files.filter(file => file.type.id !== typeId)
      this.errorMessage = ''
      this.resetInput()
      this.$emit('file-removed', typeId)
    },
    clearFiles() {
      this.readGeneration += 1
      this.files = []
      this.pendingCount = 0
      this.errorMessage = ''
      this.resetInput()
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
  min-height: 220px;
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
  min-height: 180px;
  border-style: solid;
}

.drop-zone.has-error {
  border-color: var(--danger);
}

.drop-zone-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: clamp(18px, 3vw, 28px);
}

.upload-row {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
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
.file-details h3 {
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
  margin: 0;
  color: var(--danger);
  font: 600 11px/1.45 var(--font-ui);
}

.reading-message {
  margin: 0;
  color: var(--accent-strong);
  font: 600 10px/1.4 var(--font-mono);
}

.file-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.file-loaded {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 7px;
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

.file-details {
  min-width: 0;
  flex: 1;
}

.file-kind {
  display: block;
  margin-bottom: 3px;
  color: var(--accent-strong);
  font: 750 8px/1.2 var(--font-mono);
  letter-spacing: 0.08em;
}

.file-details h3 {
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
  .upload-row {
    grid-template-columns: auto 1fr;
  }

  .upload-button {
    grid-column: 1 / -1;
  }

  .file-list {
    grid-template-columns: 1fr;
  }
}
</style>
