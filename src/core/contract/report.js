export const REPORT_SCHEMA_VERSION = '1'

export function createReport({ mode, inputs, blocks, summary, warnings = [] }) {
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    mode,
    inputs,
    summary,
    blocks,
    warnings
  }
}
