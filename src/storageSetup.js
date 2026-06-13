
// ─── window.storage setup ──────────────────────────────────────────────────
// Uses Supabase kv_store if env vars are set, otherwise falls back to localStorage

const SB_URL = 'https://mfgaxixmuxmildztcmry.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ2F4aXhtdXhtaWxkenRjbXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDk1OTUsImV4cCI6MjA5Njc4NTU5NX0.Ex7S2x-HDFih6quatKN6paoFUv88R8Sxeo6ErTWe8nY'

const sbHeaders = () => ({
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
})

const useSupabase = !!(SB_URL && SB_KEY)

window.storage = {
  async get(key, shared = false) {
    if (useSupabase) {
      try {
        const r = await fetch(
          `${SB_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}&limit=1`,
          { headers: sbHeaders() }
        )
        const rows = await r.json()
        if (rows?.[0]) return { key, value: rows[0].value, shared }
        return null
      } catch { return null }
    } else {
      const val = localStorage.getItem(key)
      return val ? { key, value: val, shared } : null
    }
  },

  async set(key, value, shared = false) {
    if (useSupabase) {
      try {
        await fetch(`${SB_URL}/rest/v1/kv_store`, {
          method: 'POST',
          headers: { ...sbHeaders(), 'Prefer': 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
        })
        return { key, value, shared }
      } catch { return null }
    } else {
      localStorage.setItem(key, value)
      return { key, value, shared }
    }
  },

  async delete(key, shared = false) {
    if (useSupabase) {
      try {
        await fetch(`${SB_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}`,
          { method: 'DELETE', headers: sbHeaders() })
        return { key, deleted: true, shared }
      } catch { return null }
    } else {
      localStorage.removeItem(key)
      return { key, deleted: true, shared }
    }
  },

  async list(prefix = '', shared = false) {
    if (useSupabase) {
      try {
        const qs = prefix ? `?key=like.${encodeURIComponent(prefix + '%')}` : ''
        const r  = await fetch(`${SB_URL}/rest/v1/kv_store${qs}`, { headers: sbHeaders() })
        const rows = await r.json()
        return { keys: (rows||[]).map(r => r.key), prefix, shared }
      } catch { return { keys: [], prefix, shared } }
    } else {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
      return { keys, prefix, shared }
    }
  }
}
