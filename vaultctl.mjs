#!/usr/bin/env node
/**
 * Agent-side vault CLI: reads the same machine-key store as the Host plugin,
 * with no human master password gate.
 *
 * Usage:
 *   node vaultctl.mjs state
 *   node vaultctl.mjs list
 *   node vaultctl.mjs show <id|title>
 *   node vaultctl.mjs add --title T --secret S [--username U] [--site L] [--expires YYYY-MM-DD] [--reminder none|7d|3d|on] [--note N]
 *   node vaultctl.mjs update <id|title> [--title T] [--secret S] [--username U] [--site L] [--expires YYYY-MM-DD] [--reminder ...] [--note N]
 *   node vaultctl.mjs delete <id|title>
 */
import { DEFAULT_VAULT_DIR, addEntry, listEntries, readStore, removeEntry, revealEntry, stateOf, updateEntry } from './vault.js'

/** Store directory (env override shared with the Host plugin). */
const dir = process.env.DSH_VAULT_DIR ?? DEFAULT_VAULT_DIR

/** Parse `--key value` flags. */
function flags(argv) {
  const out = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) out[key] = true
    else {
      out[key] = value
      index += 1
    }
  }
  return out
}

/** Resolve an id or unique title to one entry id. */
async function resolveId(reference) {
  const entries = await listEntries(dir)
  const byId = entries.find((entry) => entry.id === reference)
  if (byId !== undefined) return byId.id
  const byTitle = entries.filter((entry) => entry.title === reference)
  if (byTitle.length === 1) return byTitle[0].id
  if (byTitle.length > 1) throw new Error(`标题不唯一（${byTitle.length} 条），请用 id`)
  throw new Error('找不到条目')
}

/** Main. */
async function main() {
  const [command, ...rest] = process.argv.slice(2)
  const args = flags(rest)
  if (command === undefined || command === 'state') {
    console.log(JSON.stringify(await stateOf(dir), null, 2))
    return
  }
  if (command === 'list') {
    const entries = await listEntries(dir)
    const now = Date.now()
    for (const entry of entries) {
      const days = entry.expiresAt === null ? null : Math.ceil((new Date(`${entry.expiresAt}T23:59:59`).getTime() - now) / 86400000)
      console.log([entry.id, entry.title, entry.username, entry.site, entry.insertedBy, entry.expiresAt ?? '-', days === null ? '-' : `${days}d`, entry.reminder, new Date(entry.updatedAt).toISOString()].join('\t'))
    }
    if (entries.length === 0) console.log('(empty)')
    return
  }
  if (command === 'show') {
    const reference = rest[0]
    if (reference === undefined) throw new Error('usage: show <id|title>')
    const entry = (await listEntries(dir)).find((item) => item.id === reference || item.title === reference)
    if (entry === undefined) throw new Error('找不到条目')
    const revealed = await revealEntry(dir, entry.id)
    console.log(JSON.stringify({ ...entry, secret: revealed.secret }, null, 2))
    return
  }
  if (command === 'add') {
    if (typeof args.title !== 'string' || typeof args.secret !== 'string') throw new Error('add needs --title and --secret')
    const entry = await addEntry(dir, {
      title: args.title,
      secret: args.secret,
      username: typeof args.username === 'string' ? args.username : '',
      site: typeof args.site === 'string' ? args.site : '',
      note: typeof args.note === 'string' ? args.note : '',
      expiresAt: typeof args.expires === 'string' ? args.expires : null,
      reminder: typeof args.reminder === 'string' ? args.reminder : 'none',
    }, typeof args.by === 'string' ? args.by : 'agent')
    console.log(JSON.stringify(entry, null, 2))
    return
  }
  if (command === 'update') {
    const reference = rest[0]
    if (reference === undefined) throw new Error('usage: update <id|title> [flags]')
    const id = await resolveId(reference)
    const entry = await updateEntry(dir, id, {
      title: typeof args.title === 'string' ? args.title : undefined,
      secret: typeof args.secret === 'string' ? args.secret : undefined,
      username: typeof args.username === 'string' ? args.username : undefined,
      site: typeof args.site === 'string' ? args.site : undefined,
      note: typeof args.note === 'string' ? args.note : undefined,
      expiresAt: typeof args.expires === 'string' ? args.expires : undefined,
      reminder: typeof args.reminder === 'string' ? args.reminder : undefined,
    }, 'agent')
    console.log(JSON.stringify(entry, null, 2))
    return
  }
  if (command === 'delete') {
    const reference = rest[0]
    if (reference === undefined) throw new Error('usage: delete <id|title>')
    await removeEntry(dir, await resolveId(reference))
    console.log('deleted')
    return
  }
  if (command === 'history') {
    const reference = rest[0]
    if (reference === undefined) throw new Error('usage: history <id|title>')
    const entry = (await listEntries(dir)).find((item) => item.id === reference || item.title === reference)
    if (entry === undefined) throw new Error('找不到条目')
    for (const item of entry.history) console.log(new Date(item.at).toISOString(), item.by, item.summary)
    return
  }
  const store = await readStore(dir)
  console.log(JSON.stringify({ dir, entries: store === null ? 0 : store.entries.length }, null, 2))
  console.error(`unknown command: ${command}`)
  process.exitCode = 1
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
