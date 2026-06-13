// ─── Supabase REST helper ─────────────────────────────────────────────────
// Sem SDK — chamadas diretas à API REST do Supabase

const SB_URL = 'https://mfgaxixmuxmildztcmry.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ2F4aXhtdXhtaWxkenRjbXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDk1OTUsImV4cCI6MjA5Njc4NTU5NX0.Ex7S2x-HDFih6quatKN6paoFUv88R8Sxeo6ErTWe8nY'

function sbHeaders(extra = {}) {
  return {
    'apikey':        SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Content-Type':  'application/json',
    ...extra,
  }
}

export async function dbGet(table, qs = '') {
  const r = await fetch(`${SB_URL}/rest/v1/${table}${qs}`, { headers: sbHeaders() })
  if (!r.ok) throw new Error(`[DB GET] ${r.status}: ${await r.text()}`)
  return r.json()
}

export async function dbUpsert(table, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method:  'POST',
    headers: sbHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
    body:    JSON.stringify(data),
  })
  if (!r.ok) throw new Error(`[DB UPSERT] ${r.status}: ${await r.text()}`)
  return true
}

export async function dbPatch(table, filter, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}${filter}`, {
    method:  'PATCH',
    headers: sbHeaders({ 'Prefer': 'return=minimal' }),
    body:    JSON.stringify(data),
  })
  if (!r.ok) throw new Error(`[DB PATCH] ${r.status}: ${await r.text()}`)
  return true
}

export async function dbDelete(table, filter) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}${filter}`, {
    method:  'DELETE',
    headers: sbHeaders(),
  })
  if (!r.ok) throw new Error(`[DB DELETE] ${r.status}: ${await r.text()}`)
  return true
}

// SHA-256 (mesmo salt do AuthWrapper legado para compatibilidade)
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(text + '::mmarmarinhos2025'))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}

// Chave de recuperação aleatória
export function genRecoveryKey() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return [0,1,2,3].map(() =>
    [0,1,2,3].map(() => ch[Math.floor(Math.random() * ch.length)]).join('')
  ).join('-')
}

// ─── User helpers ─────────────────────────────────────────────────────────
export async function dbCountUsers() {
  const d = await dbGet('erp_users', '?select=id')
  return d.length
}

export async function dbFindUser(username) {
  const d = await dbGet('erp_users',
    `?username=eq.${encodeURIComponent(username.toLowerCase())}&active=eq.true&limit=1`)
  return d[0] || null
}

export async function dbListUsers() {
  return dbGet('erp_users',
    '?select=id,username,display_name,role,active,last_login,created_at&order=created_at')
}

export async function dbCreateUser(username, displayName, password, role = 'user') {
  const rkey = genRecoveryKey()
  const hash = await sha256(password)
  await dbUpsert('erp_users', {
    username:      username.toLowerCase().trim(),
    display_name:  displayName.trim() || username.trim(),
    password_hash: hash,
    recovery_key:  rkey,
    role,
    active:        true,
  })
  return rkey
}

export async function dbUpdateUserPassword(username, newPassword) {
  const hash = await sha256(newPassword)
  return dbPatch('erp_users',
    `?username=eq.${encodeURIComponent(username.toLowerCase())}`,
    { password_hash: hash })
}

export async function dbToggleUserActive(id, active) {
  return dbPatch('erp_users', `?id=eq.${id}`, { active })
}

export async function dbUpdateRole(id, role) {
  return dbPatch('erp_users', `?id=eq.${id}`, { role })
}

export async function dbLogAccess(username, action) {
  return dbUpsert('access_log', { username, action })
    .catch(() => {}) // non-critical
}

export async function dbTouchLastLogin(username) {
  return dbPatch('erp_users',
    `?username=eq.${encodeURIComponent(username)}`,
    { last_login: new Date().toISOString() }).catch(() => {})
}
