/**
 * Vault core: storage, machine-key encryption, master-password hashing, entry CRUD.
 *
 * The Store lives in a directory (default `~/.dsh/vault`):
 *  - `key.bin`   32 random bytes, mode 600; encrypts every secret at rest.
 *  - `store.json` master-password hash (PBKDF2-SHA256) and entries; entry secrets
 *                are AES-256-GCM sealed with the machine key.
 *
 * The machine key is what lets the Host (and the agent CLI) read entries without
 * the human master password; the master password only gates the browser view.
 */
import { randomBytes, randomUUID, pbkdf2Sync, createCipheriv, createDecipheriv } from 'node:crypto'
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** Default store directory. */
export const DEFAULT_VAULT_DIR = join(homedir(), '.dsh', 'vault')
/** Allowed expiry-reminder choices. */
export const REMINDERS = ['none', '7d', '3d', 'on']
/** PBKDF2 work factor for the human master password. */
const ITERATIONS = 210000

/** Create the store directory with owner-only permissions. */
export async function ensureDir(dir) {
  await mkdir(dir, { recursive: true, mode: 0o700 })
  try {
    await chmod(dir, 0o700)
  } catch {
    // A non-POSIX filesystem may refuse chmod; the directory still exists.
  }
}

/** Read (or create once) the 32-byte machine key. */
export async function ensureMachineKey(dir) {
  await ensureDir(dir)
  const path = join(dir, 'key.bin')
  try {
    const key = await readFile(path)
    if (key.length === 32) return key
  } catch {
    // Fall through and create a fresh key.
  }
  const key = randomBytes(32)
  await writeFile(path, key, { mode: 0o600 })
  return key
}

/** Read the store, or null when it does not exist yet. */
export async function readStore(dir) {
  try {
    const raw = await readFile(join(dir, 'store.json'), 'utf8')
    const parsed = JSON.parse(raw)
    return normalizeStore(parsed)
  } catch (error) {
    if (error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

/** Write the store atomically with owner-only permissions. */
export async function writeStore(dir, store) {
  await ensureDir(dir)
  const target = join(dir, 'store.json')
  const temp = `${target}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temp, `${JSON.stringify(store, null, 2)}\n`, { mode: 0o600 })
  await rename(temp, target)
}

/** A fresh empty store. */
export function emptyStore() {
  return { version: 1, master: null, entries: [] }
}

/** Coerce a parsed store into the expected shape. */
function normalizeStore(value) {
  const store = emptyStore()
  if (value === null || typeof value !== 'object') return store
  if (value.master !== null && typeof value.master === 'object' && typeof value.master.hash === 'string' && typeof value.master.salt === 'string') {
    store.master = {
      salt: value.master.salt,
      hash: value.master.hash,
      iterations: Number.isSafeInteger(value.master.iterations) ? value.master.iterations : ITERATIONS,
      createdAt: typeof value.master.createdAt === 'number' ? value.master.createdAt : Date.now(),
      updatedAt: typeof value.master.updatedAt === 'number' ? value.master.updatedAt : Date.now(),
    }
  }
  if (Array.isArray(value.entries)) {
    for (const entry of value.entries) {
      if (entry === null || typeof entry !== 'object') continue
      if (typeof entry.id !== 'string' || typeof entry.title !== 'string') continue
      if (entry.secret === null || typeof entry.secret !== 'object') continue
      store.entries.push({
        id: entry.id,
        title: entry.title,
        username: typeof entry.username === 'string' ? entry.username : '',
        site: typeof entry.site === 'string' ? entry.site : '',
        note: typeof entry.note === 'string' ? entry.note : '',
        insertedBy: typeof entry.insertedBy === 'string' ? entry.insertedBy : 'agent',
        expiresAt: typeof entry.expiresAt === 'string' ? entry.expiresAt : null,
        reminder: REMINDERS.includes(entry.reminder) ? entry.reminder : 'none',
        secret: { iv: String(entry.secret.iv ?? ''), tag: String(entry.secret.tag ?? ''), data: String(entry.secret.data ?? '') },
        createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
        updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : Date.now(),
        history: Array.isArray(entry.history)
          ? entry.history
              .filter((item) => item !== null && typeof item === 'object' && typeof item.at === 'number')
              .map((item) => ({
                at: item.at,
                by: typeof item.by === 'string' ? item.by : 'agent',
                summary: typeof item.summary === 'string' ? item.summary : '',
              }))
          : [],
      })
    }
  }
  return store
}

/** Seal one secret with the machine key. */
export function encryptSecret(key, text) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const data = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()])
  return {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: data.toString('base64'),
  }
}

/** Open one sealed secret with the machine key. */
export function decryptSecret(key, sealed) {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(sealed.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(sealed.tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(sealed.data, 'base64')), decipher.final()]).toString('utf8')
}

/** Hash a human master password with a fresh (or given) salt. */
export function hashMaster(password, saltBase64) {
  const salt = saltBase64 === undefined ? randomBytes(16) : Buffer.from(saltBase64, 'base64')
  const hash = pbkdf2Sync(String(password), salt, ITERATIONS, 32, 'sha256')
  return { salt: salt.toString('base64'), hash: hash.toString('base64'), iterations: ITERATIONS }
}

/** Verify a human master password. */
export function verifyMaster(password, master) {
  if (master === null || typeof master !== 'object') return false
  try {
    const salt = Buffer.from(master.salt, 'base64')
    const hash = pbkdf2Sync(String(password), salt, master.iterations, 32, 'sha256')
    return hash.toString('base64') === master.hash
  } catch {
    return false
  }
}

/** Validate one entry input; returns a clean object or an error string. */
export function normalizeEntryInput(input) {
  if (input === null || typeof input !== 'object') return { error: 'entry is required' }
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  if (title === '') return { error: '名称不能为空' }
  if (title.length > 120) return { error: '名称过长' }
  const secret = typeof input.secret === 'string' ? input.secret : undefined
  const expiresAt = typeof input.expiresAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.expiresAt) ? input.expiresAt : null
  const reminder = REMINDERS.includes(input.reminder) ? input.reminder : 'none'
  return {
    entry: {
      title,
      username: typeof input.username === 'string' ? input.username.slice(0, 200) : '',
      site: typeof input.site === 'string' ? input.site.slice(0, 300) : '',
      note: typeof input.note === 'string' ? input.note.slice(0, 1000) : '',
      expiresAt,
      reminder,
      secret,
    },
  }
}

/** Public metadata for one entry (never the secret). */
export function publicEntry(entry) {
  return {
    id: entry.id,
    title: entry.title,
    username: entry.username,
    site: entry.site,
    note: entry.note,
    insertedBy: entry.insertedBy,
    expiresAt: entry.expiresAt,
    reminder: entry.reminder,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    history: entry.history,
  }
}

/** Add one entry, sealing its secret. `by` records the initial recorder. */
export async function addEntry(dir, input, by, now = Date.now()) {
  const normalized = normalizeEntryInput(input)
  if (normalized.error !== undefined) throw new Error(normalized.error)
  if (typeof normalized.entry.secret !== 'string' || normalized.entry.secret === '') throw new Error('密码/Token 不能为空')
  const key = await ensureMachineKey(dir)
  const store = (await readStore(dir)) ?? emptyStore()
  const entry = {
    id: randomUUID(),
    title: normalized.entry.title,
    username: normalized.entry.username,
    site: normalized.entry.site,
    note: normalized.entry.note,
    insertedBy: by,
    expiresAt: normalized.entry.expiresAt,
    reminder: normalized.entry.reminder,
    secret: encryptSecret(key, normalized.entry.secret),
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, by, summary: '创建' }],
  }
  store.entries.push(entry)
  await writeStore(dir, store)
  return publicEntry(entry)
}

/** Update one entry; a blank secret keeps the stored one. */
export async function updateEntry(dir, id, input, by, now = Date.now()) {
  const normalized = normalizeEntryInput(input)
  if (normalized.error !== undefined) throw new Error(normalized.error)
  const key = await ensureMachineKey(dir)
  const store = (await readStore(dir)) ?? emptyStore()
  const entry = store.entries.find((item) => item.id === id)
  if (entry === undefined) throw new Error('条目不存在')
  const changed = []
  const apply = (field, value, label) => {
    if (value === undefined) return
    if (entry[field] === value) return
    entry[field] = value
    changed.push(label)
  }
  apply('title', normalized.entry.title, '名称')
  apply('username', normalized.entry.username, '用户名')
  apply('site', normalized.entry.site, '验证地')
  apply('note', normalized.entry.note, '备注')
  apply('expiresAt', normalized.entry.expiresAt, '有效截止期')
  apply('reminder', normalized.entry.reminder, '截止提醒')
  if (typeof normalized.entry.secret === 'string' && normalized.entry.secret !== '') {
    entry.secret = encryptSecret(key, normalized.entry.secret)
    changed.push('密码')
  }
  if (changed.length === 0) return publicEntry(entry)
  entry.updatedAt = now
  entry.history.push({ at: now, by, summary: `更新：${changed.join('、')}` })
  await writeStore(dir, store)
  return publicEntry(entry)
}

/** Delete one entry. */
export async function removeEntry(dir, id) {
  const store = (await readStore(dir)) ?? emptyStore()
  const before = store.entries.length
  store.entries = store.entries.filter((item) => item.id !== id)
  if (store.entries.length === before) throw new Error('条目不存在')
  await writeStore(dir, store)
  return true
}

/** Reveal one entry's plaintext secret. */
export async function revealEntry(dir, id) {
  const key = await ensureMachineKey(dir)
  const store = (await readStore(dir)) ?? emptyStore()
  const entry = store.entries.find((item) => item.id === id)
  if (entry === undefined) throw new Error('条目不存在')
  return { id, secret: decryptSecret(key, entry.secret) }
}

/** All entry metadata, newest first. */
export async function listEntries(dir) {
  const store = (await readStore(dir)) ?? emptyStore()
  return store.entries
    .map((entry) => publicEntry(entry))
    .sort((left, right) => right.updatedAt - left.updatedAt)
}

/** Store state: whether the master password exists, and how many entries. */
export async function stateOf(dir) {
  const store = (await readStore(dir)) ?? emptyStore()
  return { initialized: store.master !== null, entries: store.entries.length, dir }
}

/** Create the master password once. */
export async function setupMaster(dir, password, now = Date.now()) {
  if (typeof password !== 'string' || password.length < 8) throw new Error('主密码至少 8 位')
  const store = (await readStore(dir)) ?? emptyStore()
  if (store.master !== null) throw new Error('已初始化，不能重复设置')
  const hashed = hashMaster(password)
  store.master = { ...hashed, createdAt: now, updatedAt: now }
  await writeStore(dir, store)
  return true
}

/** Change the master password when the current one matches. */
export async function changeMaster(dir, current, next, now = Date.now()) {
  if (typeof next !== 'string' || next.length < 8) throw new Error('新主密码至少 8 位')
  const store = (await readStore(dir)) ?? emptyStore()
  if (store.master === null) throw new Error('尚未初始化')
  if (!verifyMaster(current, store.master)) throw new Error('当前主密码错误')
  const hashed = hashMaster(next)
  store.master = { ...hashed, createdAt: store.master.createdAt, updatedAt: now }
  await writeStore(dir, store)
  return true
}

/** Verify one master password attempt. */
export async function checkMaster(dir, password) {
  const store = (await readStore(dir)) ?? emptyStore()
  return store.master !== null && verifyMaster(password, store.master)
}
