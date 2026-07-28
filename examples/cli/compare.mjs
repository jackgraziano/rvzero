#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

import { decodeFileContent } from 'rvzero/adapters'
import {
  compareDeckSets,
  publicError,
  RVZERO_CORE_VERSION
} from 'rvzero/core'

const args = parseArgs(process.argv.slice(2))

try {
  if (args.version) {
    console.log(RVZERO_CORE_VERSION)
    process.exit(0)
  }
  const report = compareDeckSets(
    {
      left: await readFiles(args.left),
      right: await readFiles(args.right)
    },
    {
      mode: args.mode,
      includeEqual: args.includeEqual,
      includeOutsideCommonHorizon: args.includeOutsideCommonHorizon
    }
  )
  console.log(args.compact
    ? JSON.stringify(report)
    : JSON.stringify(report, null, 2))
  if (args.failOnDifference && report.summary.differences > 0) {
    process.exitCode = 1
  }
} catch (error) {
  console.error(JSON.stringify(publicError(error), null, 2))
  process.exitCode = 2
}

function parseArgs(values) {
  const result = {
    left: [],
    right: [],
    mode: 'estagio',
    includeEqual: false,
    includeOutsideCommonHorizon: false,
    failOnDifference: false,
    compact: false,
    version: false
  }

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (value === '--left') result.left.push(values[++index])
    else if (value === '--right') result.right.push(values[++index])
    else if (value === '--mode') result.mode = values[++index]
    else if (value === '--include-equal') result.includeEqual = true
    else if (value === '--include-outside-horizon') {
      result.includeOutsideCommonHorizon = true
    } else if (value === '--fail-on-difference') {
      result.failOnDifference = true
    } else if (value === '--compact') result.compact = true
    else if (value === '--version') result.version = true
  }

  return result
}

async function readFiles(paths) {
  return Promise.all(paths.map(async path => ({
    name: basename(path),
    content: decodeFileContent(await readFile(path))
  })))
}
