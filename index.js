/**
 * Host half of the credential-vault bundle.
 *
 * Authenticated Fetch routes on the Connection fence; the machine-key store is
 * shared with `vaultctl.mjs`, so the agent can read entries with no master
 * password while the browser view is gated by one.
 */
import { randomUUID } from 'node:crypto'
import {
  DEFAULT_VAULT_DIR,
  addEntry,
  changeMaster,
  checkMaster,
  listEntries,
  readStore,
  removeEntry,
  revealEntry,
  setupMaster,
  updateEntry,
} from './vault.js'

/** Route paths. */
const ROUTE = {
  state: '/api/credential-vault.state',
  setup: '/api/credential-vault.setup',
  unlock: '/api/credential-vault.unlock',
  list: '/api/credential-vault.list',
  reveal: '/api/credential-vault.reveal',
  save: '/api/credential-vault.save',
  remove: '/api/credential-vault.delete',
  password: '/api/credential-vault.password',
}
/** Browser unlock tokens live in memory only. */
const UNLOCK_TTL_MS = 15 * 60 * 1000
/** Unlock attempts allowed inside one window. */
const MAX_FAILURES = 12
const FAILURE_WINDOW_MS = 5 * 60 * 1000

/** Services this Host plugin needs. */
export const inject = ['connection']

/** Live unlock tokens: token -> expiry epoch ms. */
const unlocks = new Map()
/** Failed unlock attempts: { count, since }. */
const failures = { count: 0, since: 0 }

/** JSON response. */
function json(status, value) {
  return Response.json(value, { status, headers: { 'cache-control': 'no-store' } })
}

/** Text error response. */
function fail(status, message) {
  return json(status, { error: message })
}

/** Read a JSON object body. */
async function readBody(request) {
  try {
    const value = await request.json()
    return value !== null && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

/** Resolve the store directory for this Host plugin. */
function vaultDir() {
  const override = process.env.DSH_VAULT_DIR
  return typeof override === 'string' && override !== '' ? override : DEFAULT_VAULT_DIR
}

/** True when one attempt is allowed right now. */
function attemptAllowed() {
  const now = Date.now()
  if (now - failures.since > FAILURE_WINDOW_MS) {
    failures.count = 0
    failures.since = now
  }
  return failures.count < MAX_FAILURES
}

/** Record one failure. */
function noteFailure() {
  const now = Date.now()
  if (now - failures.since > FAILURE_WINDOW_MS) {
    failures.count = 0
    failures.since = now
  }
  failures.count += 1
}

/** Mint a browser unlock token after a verified master password. */
function issueUnlock() {
  const token = randomUUID()
  const expiresAt = Date.now() + UNLOCK_TTL_MS
  unlocks.set(token, expiresAt)
  return { token, expiresAt }
}

/** Read a valid unlock token from the request, pruning expired entries. */
function unlockOf(request) {
  const now = Date.now()
  for (const [token, expiresAt] of unlocks) if (expiresAt <= now) unlocks.delete(token)
  const token = request.headers.get('x-vault-token')
  if (typeof token !== 'string' || token === '') return undefined
  const expiresAt = unlocks.get(token)
  return expiresAt !== undefined && expiresAt > now ? token : undefined
}

/** Guard one browser route behind the master-password unlock. */
function requireUnlock(request) {
  return unlockOf(request) !== undefined
}

/** GET state. */
async function handleState() {
  const dir = vaultDir()
  const store = await readStore(dir)
  const state = {
    initialized: store !== null && store.master !== null,
    entries: store === null ? 0 : store.entries.length,
    unlocked: false,
  }
  return json(200, state)
}

/** POST setup: first-use master password. */
async function handleSetup(request) {
  const body = await readBody(request)
  if (body === null || typeof body.password !== 'string') return fail(400, 'password is required')
  try {
    await setupMaster(vaultDir(), body.password)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return fail(message.includes('已初始化') ? 409 : 400, message)
  }
  const unlock = issueUnlock()
  return json(200, { ok: true, ...unlock })
}

/** POST unlock. */
async function handleUnlock(request) {
  if (!attemptAllowed()) return fail(429, '尝试次数过多，请稍后再试')
  const body = await readBody(request)
  if (body === null || typeof body.password !== 'string') return fail(400, 'password is required')
  const ok = await checkMaster(vaultDir(), body.password)
  if (!ok) {
    noteFailure()
    return fail(401, '主密码错误')
  }
  failures.count = 0
  const unlock = issueUnlock()
  return json(200, unlock)
}

/** GET list. */
async function handleList(request) {
  if (!requireUnlock(request)) return fail(401, 'locked')
  return json(200, { entries: await listEntries(vaultDir()) })
}

/** POST reveal. */
async function handleReveal(request) {
  if (!requireUnlock(request)) return fail(401, 'locked')
  const body = await readBody(request)
  if (body === null || typeof body.id !== 'string') return fail(400, 'id is required')
  try {
    return json(200, await revealEntry(vaultDir(), body.id))
  } catch (error) {
    return fail(404, error instanceof Error ? error.message : '条目不存在')
  }
}

/** POST save (create or update). */
async function handleSave(request) {
  if (!requireUnlock(request)) return fail(401, 'locked')
  const body = await readBody(request)
  if (body === null || body.entry === null || typeof body.entry !== 'object') return fail(400, 'entry is required')
  const entry = body.entry
  try {
    const saved = typeof entry.id === 'string' && entry.id !== ''
      ? await updateEntry(vaultDir(), entry.id, entry, 'human')
      : await addEntry(vaultDir(), entry, 'human')
    return json(200, { entry: saved })
  } catch (error) {
    return fail(400, error instanceof Error ? error.message : '保存失败')
  }
}

/** POST delete. */
async function handleDelete(request) {
  if (!requireUnlock(request)) return fail(401, 'locked')
  const body = await readBody(request)
  if (body === null || typeof body.id !== 'string') return fail(400, 'id is required')
  try {
    await removeEntry(vaultDir(), body.id)
    return json(200, { ok: true })
  } catch (error) {
    return fail(404, error instanceof Error ? error.message : '条目不存在')
  }
}

/** POST password: change the master password. */
async function handlePassword(request) {
  if (!requireUnlock(request)) return fail(401, 'locked')
  const body = await readBody(request)
  if (body === null || typeof body.current !== 'string' || typeof body.next !== 'string') return fail(400, 'current and next are required')
  try {
    await changeMaster(vaultDir(), body.current, body.next)
    return json(200, { ok: true })
  } catch (error) {
    return fail(400, error instanceof Error ? error.message : '修改失败')
  }
}

/** Register every route on the Connection fence. */
export function apply(ctx) {
  const register = (path, handler) => {
    ctx.connection.fetch.register({
      path,
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: (request) => handler(request),
    })
  }
  register(ROUTE.state, () => handleState())
  register(ROUTE.setup, (request) => handleSetup(request))
  register(ROUTE.unlock, (request) => handleUnlock(request))
  register(ROUTE.list, (request) => handleList(request))
  register(ROUTE.reveal, (request) => handleReveal(request))
  register(ROUTE.save, (request) => handleSave(request))
  register(ROUTE.remove, (request) => handleDelete(request))
  register(ROUTE.password, (request) => handlePassword(request))
}
