const keydownHandlers = new WeakMap()

export const sortableHeader = {
  mounted(element) {
    const handleKeydown = event => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      element.click()
    }

    element.tabIndex = 0
    element.title = 'Ordenar por esta coluna'
    element.setAttribute('aria-keyshortcuts', 'Enter Space')
    element.addEventListener('keydown', handleKeydown)
    keydownHandlers.set(element, handleKeydown)
  },
  beforeUnmount(element) {
    const handleKeydown = keydownHandlers.get(element)
    if (handleKeydown) element.removeEventListener('keydown', handleKeydown)
    keydownHandlers.delete(element)
  }
}
