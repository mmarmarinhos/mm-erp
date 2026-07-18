
// ─── window.storage setup ──────────────────────────────────────────────────
// Em vez de falar direto com o Supabase (com uma chave pública, que dava
// pra usar de fora pra ler/escrever todos os dados), o navegador agora só
// fala com o nosso próprio servidor (/api/storage), que exige o tíquete de
// acesso emitido no login antes de buscar qualquer coisa no banco.

const SESSION_KEY = 'erp_session_v2' // mesma chave que o app usa pra guardar a sessão

function getToken() {
  try {
    // Sessão persistente fica em localStorage; sessionStorage é só legado
    // (sessões criadas antes da v3.30.0), lido como fallback até o App migrar.
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (session?.exp && Date.now() > session.exp) return null
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
    // Tíquete inválido/expirado — desloga e volta pro login, mas só recarrega
    // uma vez (evita loop infinito caso algo chame isso repetidamente rápido)
    const lastReload = Number(sessionStorage.getItem('erp_last_401_reload') || 0)
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    if (Date.now() - lastReload > 3000) {
      sessionStorage.setItem('erp_last_401_reload', String(Date.now()))
      window.location.reload()
    }
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
    // Não engolir erro aqui, mesmo motivo do set(): quem chama (loadKV, no
    // App.jsx) precisa saber quando uma leitura falha de verdade — antes,
    // uma falha de rede/sessão fazia os módulos aparecerem vazios, dando a
    // impressão de que os dados tinham sido apagados.
    const data = await apiStorage('get', { key })
    if (data?.value == null) return null
    return { key, value: data.value, shared }
  },

  async set(key, value, shared = false) {
    // Não engolir o erro aqui: quem chama (persistKV, no App.jsx) precisa
    // saber quando uma gravação falha de verdade, pra poder tentar de novo
    // e avisar o usuário. Engolir em silêncio já causou perda de dado real
    // (histórico de movimentação de estoque sumindo sem nenhum aviso).
    await apiStorage('set', { key, value })
    return { key, value, shared }
  },

  async delete(key, shared = false) {
    // Mesma razão do get()/set(): quem chama precisa saber se falhou de
    // verdade, pra não dar feedback de sucesso quando na verdade não salvou.
    await apiStorage('delete', { key })
    return { key, deleted: true, shared }
  },

  async list(prefix = '', shared = false) {
    try {
      const data = await apiStorage('list', { prefix })
      return { keys: data.keys || [], prefix, shared }
    } catch { return { keys: [], prefix, shared } }
  },
}
