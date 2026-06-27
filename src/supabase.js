// ─── Supabase REST helper ─────────────────────────────────────────────────
// Sem SDK — chamadas diretas à API REST do Supabase

const SB_URL = 'https://mfgaxixmuxmildztcmry.supabase.co'
const SB_KEY = 'sb_publishable_OT57sICfkoFtEhyMfQ1XAA_qVF1Cczu'

function sbHeaders(extra = {}) {
  return {
    'apikey':        SB_KEY,
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

// Chama uma function (RPC) do Postgres — usado para tudo que toca em
// senha/usuário, pra essa lógica rodar dentro do banco e não no navegador.
export async function dbRpc(fn, args = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
    method:  'POST',
    headers: sbHeaders(),
    body:    JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`[RPC ${fn}] ${r.status}: ${await r.text()}`)
  const text = await r.text()
  return text ? JSON.parse(text) : null
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
// A partir daqui, nada disso lê ou escreve a tabela erp_users diretamente:
// tudo passa por funções do Postgres (RPC) que nunca devolvem password_hash
// nem recovery_key para o navegador.

export async function dbCountUsers() {
  return dbRpc('count_erp_users')
}

// Verifica usuário+senha dentro do banco. Devolve só dados seguros
// (id, username, display_name, role) ou null se não bater.
export async function dbVerifyLogin(username, passwordHash) {
  const d = await dbRpc('verify_login', { p_username: username, p_password_hash: passwordHash })
  return d[0] || null
}

// Verifica a chave de recuperação e já troca a senha, tudo dentro do banco.
// Devolve true/false — nunca expõe a recovery_key armazenada.
export async function dbResetPasswordWithRecovery(username, recoveryKey, newPasswordHash) {
  return dbRpc('reset_password_with_recovery', {
    p_username: username, p_recovery_key: recoveryKey, p_new_hash: newPasswordHash,
  })
}

export async function dbListUsers() {
  return dbRpc('list_users_safe')
}

export async function dbCreateUser(username, displayName, password, role = 'user') {
  const rkey = genRecoveryKey()
  const hash = await sha256(password)
  await dbRpc('create_erp_user', {
    p_username: username, p_display_name: displayName || username,
    p_password_hash: hash, p_recovery_key: rkey, p_role: role,
  })
  return rkey
}

export async function dbToggleUserActive(id, active) {
  return dbRpc('set_user_active', { p_id: String(id), p_active: active })
}

export async function dbUpdateRole(id, role) {
  return dbRpc('set_user_role', { p_id: String(id), p_role: role })
}

export async function dbSetUserPassword(id, newPasswordHash) {
  return dbRpc('set_user_password', { p_id: String(id), p_new_hash: newPasswordHash })
}

export async function dbUpdateUserProfile(id, displayName, role, customModules) {
  return dbRpc('update_user_profile', {
    p_id: String(id), p_display_name: displayName, p_role: role, p_custom_modules: customModules,
  })
}

export async function dbLogAccess(username, action) {
  return dbUpsert('access_log', { username, action })
    .catch(() => {}) // non-critical
}

export async function dbTouchLastLogin(username) {
  return dbRpc('touch_last_login', { p_username: username }).catch(() => {})
}
