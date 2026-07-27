import { compareDeckSets } from 'rvzero/core'

const leftDadger = [
  'DT 31 01 2026',
  dpLine(1, 1, 100),
  dpLine(2, 1, 100),
  dpLine(3, 1, 100),
  dpLine(4, 1, 100),
  dpLine(5, 1, 100),
  dpLine(6, 1, 100)
].join('\n')

const rightDadger = [
  'DT 21 02 2026',
  dpLine(1, 1, 100),
  dpLine(2, 1, 100),
  dpLine(3, 1, 120)
].join('\n')

const report = compareDeckSets(
  {
    left: [{ name: 'dadger.rv0', content: leftDadger }],
    right: [{ name: 'dadger.rv3', content: rightDadger }]
  },
  {
    mode: 'data',
    includeEqual: false,
    includeOutsideCommonHorizon: true
  }
)

console.log(JSON.stringify(report.summary, null, 2))

function dpLine(stage, subsystem, carga) {
  const line = fixedLine('DP ', 80)
  put(line, 4, String(stage).padStart(3))
  put(line, 9, String(subsystem).padStart(3))
  put(line, 14, ' 3')
  put(line, 20, String(carga).padStart(10))
  put(line, 30, String(30).padStart(10))
  put(line, 40, String(carga).padStart(10))
  put(line, 50, String(74).padStart(10))
  put(line, 60, String(carga).padStart(10))
  put(line, 70, String(64).padStart(10))
  return line.join('')
}

function fixedLine(prefix, length) {
  const chars = Array.from({ length }, () => ' ')
  put(chars, 0, prefix)
  return chars
}

function put(chars, start, value) {
  String(value).split('').forEach((char, index) => {
    chars[start + index] = char
  })
}
