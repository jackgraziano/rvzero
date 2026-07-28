export const REPORT_SCHEMA_VERSION = '2'
export const RVZERO_CORE_VERSION = '1.1.0'

export function createReport({ mode, inputs, blocks, summary, warnings = [] }) {
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    coreVersion: RVZERO_CORE_VERSION,
    mode,
    inputs,
    summary,
    blocks,
    warnings
  }
}
