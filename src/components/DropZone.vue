<template>
  <div
    class="drop-zone"
    :class="{ 'drag-over': isDragging, 'has-file': file }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div v-if="!file" class="drop-zone-content">
      <div class="icon">📁</div>
      <h3>{{ title }}</h3>
      <p>Arraste um arquivo aqui</p>
      <p class="supported-types">Tipos suportados: {{ supportedTypesText }}</p>
      <span class="or">ou</span>
      <label class="upload-btn">
        Selecionar arquivo
        <input
          type="file"
          @change="onFileSelect"
          hidden
        >
      </label>
    </div>

    <div v-else class="file-loaded">
      <div class="file-header">
        <div class="file-icon">✓</div>
        <div class="file-details">
          <h4>{{ file.name }}</h4>
          <p>{{ formatFileSize(file.size) }}</p>
        </div>
        <button class="remove-btn" @click="removeFile">✕</button>
      </div>

      <div class="data-display">
        <div class="loaded-message">
          <div class="check-icon">✓</div>
          <p>Arquivo carregado com sucesso!</p>
          <p class="hint">Carregue o segundo arquivo para iniciar a comparação</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { detectFileType, parseFile, getSupportedTypes } from '../utils/fileTypeRegistry.js'

export default {
  name: 'DropZone',
  props: {
    title: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isDragging: false,
      file: null,
      parsedData: null,
      fileType: null
    }
  },
  computed: {
    supportedTypesText() {
      const types = getSupportedTypes()
      return types.map(t => t.name).join(', ')
    }
  },
  methods: {
    onDragEnter() {
      this.isDragging = true
    },
    onDragOver() {
      this.isDragging = true
    },
    onDragLeave(e) {
      if (e.target.className === 'drop-zone') {
        this.isDragging = false
      }
    },
    onDrop(e) {
      this.isDragging = false
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.handleFile(files[0])
      }
    },
    onFileSelect(e) {
      const files = e.target.files
      if (files.length > 0) {
        this.handleFile(files[0])
      }
    },
    handleFile(file) {
      const detectedType = detectFileType(file.name)

      if (detectedType) {
        this.file = file
        this.fileType = detectedType
        this.readAndParseFile(file)
      } else {
        alert(`Tipo de arquivo não suportado.\nArquivos aceitos: ${this.supportedTypesText}`)
      }
    },
    readAndParseFile(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        try {
          this.parsedData = parseFile(file.name, content)
          this.$emit('data-parsed', {
            type: this.fileType,
            name: file.name,
            data: this.parsedData
          })
        } catch (error) {
          alert(`Erro ao processar arquivo: ${error.message}`)
          this.removeFile()
        }
      }
      reader.readAsText(file)
    },
    removeFile() {
      this.file = null
      this.parsedData = null
      this.fileType = null
      this.$emit('file-removed')
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.drop-zone {
  flex: 1;
  min-height: 400px;
  border: 2px dashed #00ff00;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: #1e1e1e;
  position: relative;
  font-family: 'Courier New', monospace;
}

.drop-zone:hover {
  border-color: #00ff00;
  background: #2d2d2d;
}

.drop-zone.drag-over {
  border-color: #00ff00;
  background: #3d3d3d;
  border-style: solid;
}

.drop-zone.has-file {
  border-color: #00ff00;
  background: #1e1e1e;
}

.drop-zone-content {
  text-align: center;
  padding: 40px;
}

.icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.drop-zone-content h3 {
  color: #00ff00;
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.drop-zone-content p {
  color: #00ff00;
  margin-bottom: 15px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.supported-types {
  font-size: 10px !important;
  opacity: 0.7;
  margin-bottom: 10px !important;
}

.or {
  display: block;
  color: #00ff00;
  margin: 15px 0;
  font-size: 11px;
  opacity: 0.6;
  font-family: 'Courier New', monospace;
}

.upload-btn {
  display: inline-block;
  padding: 8px 20px;
  background: #2d2d2d;
  color: #00ff00;
  border: 1px solid #00ff00;
  border-radius: 2px;
  cursor: pointer;
  font-weight: 700;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: #3d3d3d;
}

.file-loaded {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.file-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-bottom: 1px solid #00ff00;
  background: #2d2d2d;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: #00ff00;
  color: #1e1e1e;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-details h4 {
  color: #00ff00;
  font-size: 13px;
  margin: 0 0 3px 0;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.file-details p {
  color: #00ff00;
  margin: 0;
  font-size: 10px;
  opacity: 0.7;
  font-family: 'Courier New', monospace;
}

.remove-btn {
  width: 28px;
  height: 28px;
  background: #2d2d2d;
  color: #ff0000;
  border: 1px solid #ff0000;
  border-radius: 2px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.remove-btn:hover {
  background: #4d0000;
}

.data-display {
  flex: 1;
  overflow: hidden;
  background: #1e1e1e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loaded-message {
  text-align: center;
  padding: 40px;
}

.check-icon {
  font-size: 64px;
  color: #00ff00;
  margin-bottom: 20px;
}

.loaded-message p {
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin: 10px 0;
  font-weight: 700;
}

.loaded-message .hint {
  font-size: 12px;
  opacity: 0.6;
  font-weight: 400;
}
</style>
