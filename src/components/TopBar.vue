<template>
  <header class="top-bar">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">RV0</span>
      <div>
        <h1>RVZero</h1>
        <p>Comparador temporal de decks DECOMP</p>
      </div>
    </div>

    <div class="controls">
      <fieldset v-if="showTemporalControls" class="mode-control">
        <legend>Alinhamento</legend>
        <button
          v-for="option in compareOptions"
          :key="option.value"
          type="button"
          :class="{ active: compareMode === option.value }"
          :aria-pressed="compareMode === option.value"
          :title="option.description"
          @click="$emit('compare-mode-changed', option.value)"
        >
          {{ option.label }}
        </button>
      </fieldset>

      <label class="difference-toggle">
        <input
          type="checkbox"
          :checked="showOnlyDifferences"
          @change="$emit('show-only-differences-changed', $event.target.checked)"
        >
        <span class="toggle-track" aria-hidden="true"><span></span></span>
        <span>Somente diferenças</span>
      </label>

      <button
        type="button"
        class="icon-button clear-button"
        :disabled="!hasFiles"
        title="Remover os dois arquivos"
        @click="$emit('clear-all')"
      >
        Limpar
      </button>
      <button
        type="button"
        class="icon-button"
        aria-haspopup="dialog"
        @click="showAbout = true"
      >
        Sobre
      </button>
    </div>
  </header>

  <Teleport to="body">
    <div
      v-if="showAbout"
      class="modal-overlay"
      role="presentation"
      @click.self="showAbout = false"
      @keydown.esc="showAbout = false"
    >
      <section
        class="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <button
          type="button"
          class="modal-close"
          aria-label="Fechar"
          autofocus
          @click="showAbout = false"
        >
          ×
        </button>
        <span class="modal-kicker">Software de código aberto</span>
        <h2 id="about-title">Sobre o RVZero</h2>
        <p>
          O RVZero é uma ferramenta de código aberto destinada à análise
          comparativa de arquivos DADGER do DECOMP. A aplicação alinha revisões
          por períodos equivalentes do calendário e processa os dados
          localmente, sem enviá-los a servidores.
        </p>
        <a
          href="https://github.com/jackgraziano/rvzero"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver código e contribuir no GitHub
        </a>
      </section>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'TopBar',
  emits: [
    'compare-mode-changed',
    'show-only-differences-changed',
    'clear-all'
  ],
  props: {
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true },
    hasFiles: { type: Boolean, default: false },
    showTemporalControls: { type: Boolean, default: true }
  },
  data() {
    return {
      showAbout: false,
      compareOptions: [
        {
          value: 'data',
          label: 'Data',
          description: 'Compara o mesmo período do calendário'
        },
        {
          value: 'estagio',
          label: 'Estágio',
          description: 'Modo diagnóstico: compara o mesmo número de estágio'
        }
      ]
    }
  }
}
</script>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 10px clamp(14px, 2.5vw, 32px);
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  backdrop-filter: blur(14px);
}

.brand {
  min-width: max-content;
  display: flex;
  align-items: center;
  gap: 11px;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--background);
  background: var(--accent);
  border-radius: 9px;
  font: 800 12px/1 var(--font-mono);
  letter-spacing: -0.05em;
}

.brand h1 {
  margin: 0;
  color: var(--text);
  font: 720 16px/1.2 var(--font-ui);
}

.brand p {
  margin: 3px 0 0;
  color: var(--muted);
  font: 500 10px/1.2 var(--font-ui);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.mode-control {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0;
  padding: 3px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.mode-control legend {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.mode-control button,
.icon-button {
  min-height: 32px;
  padding: 6px 11px;
  color: var(--muted);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  font: 650 11px/1 var(--font-ui);
  transition: 120ms ease;
}

.mode-control button:hover,
.icon-button:hover {
  color: var(--text);
  background: var(--surface-hover);
}

.mode-control button.active {
  color: var(--background);
  background: var(--accent);
}

.difference-toggle {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  color: var(--text);
  cursor: pointer;
  font: 600 11px/1.2 var(--font-ui);
  white-space: nowrap;
}

.difference-toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.toggle-track {
  width: 30px;
  height: 17px;
  display: flex;
  align-items: center;
  padding: 2px;
  background: var(--border);
  border-radius: 999px;
  transition: 120ms ease;
}

.toggle-track span {
  width: 13px;
  height: 13px;
  background: var(--muted);
  border-radius: 50%;
  transition: 120ms ease;
}

.difference-toggle input:checked + .toggle-track {
  background: color-mix(in srgb, var(--accent) 38%, var(--border));
}

.difference-toggle input:checked + .toggle-track span {
  background: var(--accent);
  transform: translateX(13px);
}

.difference-toggle input:focus-visible + .toggle-track {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

.icon-button {
  border: 1px solid var(--border);
}

.clear-button:not(:disabled) {
  color: var(--danger);
}

.icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.mode-control button:focus-visible,
.icon-button:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 82%);
  backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;
  width: min(480px, 100%);
  padding: 30px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 24px 80px rgb(0 0 0 / 45%);
  font-family: var(--font-ui);
}

.modal-kicker {
  color: var(--accent);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.modal-content h2 {
  margin: 8px 0 12px;
  font-size: 22px;
}

.modal-content p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.65;
}

.modal-content a {
  display: inline-flex;
  margin-top: 20px;
  color: var(--accent-strong);
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
}

.modal-content a:hover {
  text-decoration: underline;
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: var(--muted);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 7px;
  cursor: pointer;
  font-size: 20px;
}

@media (max-width: 900px) {
  .top-bar {
    position: static;
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .controls {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 520px) {
  .brand p {
    display: none;
  }

  .difference-toggle {
    order: 3;
    width: 100%;
    padding-left: 3px;
  }
}
</style>
