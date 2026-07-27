import test from 'node:test'
import assert from 'node:assert/strict'
import { computed } from 'vue'

import { sortableHeader } from '../src/directives/sortableHeader.js'
import { useBlockComparison } from '../src/composables/useBlockComparison.js'

test('cabeçalho ordenável é focável e responde a Enter e Espaço', () => {
  const listeners = new Map()
  let clicks = 0
  const attributes = new Map()
  const element = {
    tabIndex: -1,
    title: '',
    click: () => { clicks += 1 },
    setAttribute: (name, value) => attributes.set(name, value),
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name, handler) => {
      if (listeners.get(name) === handler) listeners.delete(name)
    }
  }

  sortableHeader.mounted(element)
  assert.equal(element.tabIndex, 0)
  assert.equal(element.title, 'Ordenar por esta coluna')
  assert.equal(attributes.get('aria-keyshortcuts'), 'Enter Space')

  for (const key of ['Enter', ' ']) {
    let prevented = false
    listeners.get('keydown')({
      key,
      preventDefault: () => { prevented = true }
    })
    assert.equal(prevented, true)
  }
  assert.equal(clicks, 2)

  sortableHeader.beforeUnmount(element)
  assert.equal(listeners.has('keydown'), false)
})

test('rolagem vertical e horizontal permanece sincronizada entre os decks', async () => {
  const comparison = useBlockComparison(
    { showOnlyDifferences: false },
    computed(() => [])
  )
  comparison.tableContainer2.value = { scrollTop: 0, scrollLeft: 0 }

  comparison.onScroll1({
    target: { scrollTop: 120, scrollLeft: 340 }
  })

  assert.deepEqual(comparison.tableContainer2.value, {
    scrollTop: 120,
    scrollLeft: 340
  })

  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(comparison.isSyncing.value, false)
})
