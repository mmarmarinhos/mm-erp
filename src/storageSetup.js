
// ─── window.storage setup ──────────────────────────────────────────────────
// Em vez de falar direto com o Supabase (com uma chave pública, que dava
// pra usar de fora pra ler/escrever todos os dados), o navegador agora só
// fala com o nosso próprio servidor (/api/storage), que exige o tíquete de
// acesso emitido no login antes de buscar qualquer coisa no banco.

const SESSION_KEY = 'erp_session_v2' // mesma chave que o app usa pra guardar a sessão

function getToken() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    return session?.token || null
  } catch { return null }
}

async function apiStorage(action, payload = {}) {
  const token = getToken()
  const res = await fetch('/api/storage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, ...payload }),
  })

  if (res.status === 401) {
    // Tíquete inválido/expirado — desloga e volta pro login
    sessionStorage.removeItem(SESSION_KEY)
    window.location.reload()
    throw new Error('Sessão expirada')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Erro ${res.status}`)
  }

  return res.json()
}

window.storage = {
  async get(key, shared = false) {
    try {
      const data = await apiStorage('get', { key })
      if (data?.value == null) return null
      return { key, value: data.value, shared }
    } catch { return null }
  },

  async set(key, value, shared = false) {
    try {
      await apiStorage('set', { key, value })
      return { key, value, shared }
    } catch { return null }
  },

  async delete(key, shared = false) {
    try {
      await apiStorage('delete', { key })
      return { key, deleted: true, shared }
    } catch { return null }
  },

  async list(prefix = '', shared = false) {
    try {
      const data = await apiStorage('list', { prefix })
      return { keys: data.keys || [], prefix, shared }
    } catch { return { keys: [], prefix, shared } }
  },
}
