export function readBrowserFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.onerror = () => reject(
      new Error('não foi possível ler o arquivo; selecione-o novamente')
    )
    reader.readAsText(file)
  })
}
