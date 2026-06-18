import { useState, useEffect, createContext, useContext } from 'react'
import {
  dbCountUsers, dbVerifyLogin, dbListUsers,
  dbCreateUser, dbResetPasswordWithRecovery,
  dbToggleUserActive, dbUpdateRole,
  dbLogAccess, dbTouchLastLogin,
  sha256,
} from './supabase.js'

export const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const SESSION_KEY  = 'erp_session_v2'
const getSession   = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null } }
const setSession   = (u) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
const clearSession = () => sessionStorage.removeItem(SESSION_KEY)

const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"

const AuthCard = ({ children, title, sub }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🧵</div>
        <h1 className="text-2xl font-bold text-gray-900">MM ERP</h1>
        <p className="text-gray-500 mt-1 text-sm">{title}</p>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  </div>
)

// ─── Setup (first admin) ──────────────────────────────────────────────────
function SetupScreen({ onDone }) {
  const [f, setF]       = useState({ name:'', user:'', pwd:'', pwd2:'' })
  const [step, setStep] = useState(1)
  const [rkey, setRkey] = useState('')
  const [err, setErr]   = useState('')
  const [loading, setL] = useState(false)
  const [copied, setC]  = useState(false)
  const set = (k,v) => setF(p => ({...p,[k]:v}))

  const create = async () => {
    if (!f.name.trim() || !f.user.trim()) { setErr('Preencha nome e usuário'); return }
    if (f.pwd.length < 6)                { setErr('Senha mínimo 6 caracteres'); return }
    if (f.pwd !== f.pwd2)               { setErr('Senhas não coincidem'); return }
    setL(true); setErr('')
    try {
      const key = await dbCreateUser(f.user, f.name, f.pwd, 'admin')
      setRkey(key); setStep(2)
    } catch(e) { setErr('Erro: ' + e.message) }
    setL(false)
  }

  const finish = () => {
    const allMods = ['dashboard','orders','cotacao','sync','inventory','pricing','pricehunt','finance','fiscal','crm','suppliers','purchases','reports','empresa','usuarios']
    const session = { username: f.user.toLowerCase(), displayName: f.name, role: 'admin', modules: allMods }
    setSession(session); onDone(session)
  }

  if (step === 2) return (
    <AuthCard title="Guarde sua chave de recuperação" sub="Administrador criado com sucesso">
      <div className="space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-bold text-amber-800 mb-1">⚠️ Chave de Recuperação</p>
          <p className="text-xs text-amber-700 mb-3">Redefina a senha sem perder dados. Guarde agora.</p>
          <div className="bg-white border border-amber-300 rounded-xl p-3 flex items-center justify-between gap-2">
            <code className="font-mono font-bold text-lg text-gray-900 tracking-widest">{rkey}</code>
            <button onClick={() => { navigator.clipboard?.writeText(rkey).catch(()=>{}); setC(true); setTimeout(()=>setC(false),2000) }}
              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 shrink-0">
              {copied ? '✓' : 'Copiar'}
            </button>
          </div>
        </div>
        <button onClick={finish} className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
          Já guardei — Entrar ✓
        </button>
      </div>
    </AuthCard>
  )

  return (
    <AuthCard title="Configurar primeiro acesso" sub="Você será o administrador">
      <div className="space-y-4">
        {[['Nome completo','name','text','Ex: Thalles Costa'],
          ['Usuário (login)','user','text','Ex: thalles'],
          ['Senha','pwd','password','Mínimo 6 caracteres'],
          ['Confirmar senha','pwd2','password','Repita a senha']
        ].map(([label,key,type,ph]) => (
          <div key={key}>
            <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
            <input type={type} className={inp} value={f[key]} onChange={e=>set(key,e.target.value)}
              placeholder={ph} onKeyDown={e=>e.key==='Enter'&&create()} />
          </div>
        ))}
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button onClick={create} disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Criando...' : 'Criar Administrador →'}
        </button>
      </div>
    </AuthCard>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────
function LoginScreen({ onDone }) {
  const [username, setU]    = useState('')
  const [pwd,      setPwd]  = useState('')
  const [err,      setErr]  = useState('')
  const [loading,  setL]    = useState(false)
  const [mode,     setMode] = useState('login')
  const [rf,       setRf]   = useState({ rkey:'', pwd:'', pwd2:'' })
  const [success,  setSuc]  = useState('')
  const setR = (k,v) => setRf(p=>({...p,[k]:v}))

  const login = async () => {
    if (!username.trim() || !pwd) return
    setL(true); setErr('')
    try {
      const hash = await sha256(pwd)
      const user = await dbVerifyLogin(username.trim(), hash)
      if (!user) {
        await dbLogAccess(username.toLowerCase(), 'failed_login')
        setErr('Usuário ou senha incorretos'); setPwd(''); setL(false); return
      }
      await dbTouchLastLogin(user.username)
      await dbLogAccess(user.username, 'login')
      const roleMods = {
        admin:      ['dashboard','orders','cotacao','sync','inventory','pricing','pricehunt','finance','fiscal','crm','suppliers','purchases','reports','empresa','usuarios'],
        gerente:    ['dashboard','orders','cotacao','sync','inventory','pricing','pricehunt','finance','fiscal','crm','suppliers','purchases','reports','empresa'],
        vendedor:   ['dashboard','orders','cotacao','sync','pricing','pricehunt','crm'],
        estoque:    ['dashboard','inventory','purchases','suppliers'],
        financeiro: ['dashboard','finance','fiscal','reports'],
        viewer:     ['dashboard','reports'],
      }
      const session = { username: user.username, displayName: user.display_name, role: user.role, modules: roleMods[user.role] || roleMods.viewer }
      setSession(session); onDone(session)
    } catch(e) { setErr('Erro de conexão: ' + e.message) }
    setL(false)
  }

  const recover = async () => {
    setErr('')
    if (!username.trim()) { setErr('Informe o usuário'); return }
    if (!rf.rkey.trim())  { setErr('Informe a chave'); return }
    if (rf.pwd.length < 6){ setErr('Senha mínimo 6 caracteres'); return }
    if (rf.pwd !== rf.pwd2){ setErr('Senhas não coincidem'); return }
    setL(true)
    try {
      const newHash = await sha256(rf.pwd)
      const ok = await dbResetPasswordWithRecovery(username.trim(), rf.rkey, newHash)
      if (!ok) { setErr('Usuário ou chave de recuperação incorretos'); setL(false); return }
      setSuc('✅ Senha redefinida! Dados intactos.')
      setTimeout(() => { setMode('login'); setSuc(''); setPwd(''); setRf({rkey:'',pwd:'',pwd2:''}) }, 2500)
    } catch(e) { setErr('Erro: ' + e.message) }
    setL(false)
  }

  if (mode === 'recover') return (
    <AuthCard title="Recuperar senha">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
          🔑 Seus dados <strong>não serão perdidos</strong>.
        </div>
        {[['Usuário', username, setU, 'text', 'seu.usuario', false],
          ['Chave de Recuperação', rf.rkey, v=>setR('rkey',v.toUpperCase()), 'text', 'XXXX-XXXX-XXXX-XXXX', true],
          ['Nova Senha', rf.pwd, v=>setR('pwd',v), 'password', 'Mínimo 6 caracteres', false],
          ['Confirmar Nova Senha', rf.pwd2, v=>setR('pwd2',v), 'password', 'Repita', false],
        ].map(([label,val,set,type,ph,mono]) => (
          <div key={label}>
            <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
            <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph}
              className={`${inp} ${mono?'font-mono tracking-widest':''}`}
              maxLength={mono?19:undefined} onKeyDown={e=>e.key==='Enter'&&recover()} />
          </div>
        ))}
        {err && <p className="text-red-500 text-sm">{err}</p>}
        {success && <p className="text-green-600 text-sm font-medium">{success}</p>}
        {!success && (
          <button onClick={recover} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading?'Processando...':'Redefinir Senha'}
          </button>
        )}
        <button onClick={()=>{setMode('login');setErr('')}} className="w-full text-sm text-gray-500 hover:text-gray-700">← Voltar</button>
      </div>
    </AuthCard>
  )

  return (
    <AuthCard title="Acesso ao sistema">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Usuário</label>
          <input className={inp} value={username} onChange={e=>setU(e.target.value)}
            placeholder="seu.usuario" autoFocus onKeyDown={e=>e.key==='Enter'&&login()} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Senha</label>
          <input type="password" className={inp} value={pwd} onChange={e=>setPwd(e.target.value)}
            placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&login()} />
        </div>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button onClick={login} disabled={loading||!username||!pwd}
          className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading?'Verificando...':'Entrar'}
        </button>
        <button onClick={()=>{setMode('recover');setErr('')}} className="w-full text-sm text-indigo-600 hover:underline">
          Esqueci minha senha →
        </button>
      </div>
    </AuthCard>
  )
}

// ─── User Management Modal ────────────────────────────────────────────────
function UserMgmtModal({ currentUser, onClose }) {
  const [users,  setUsers]  = useState([])
  const [busy,   setBusy]   = useState(true)
  const [show,   setShow]   = useState(false)
  const [nf,     setNf]     = useState({ name:'', user:'', pwd:'', role:'user' })
  const [nErr,   setNErr]   = useState('')
  const [nOk,    setNOk]    = useState('')
  const [adding, setAdding] = useState(false)
  const setN = (k,v) => setNf(p=>({...p,[k]:v}))

  const load = async () => { setBusy(true); try { setUsers(await dbListUsers()) } catch{} setBusy(false) }
  useEffect(() => { load() }, [])

  const addUser = async () => {
    setNErr('')
    if (!nf.name.trim()||!nf.user.trim()) { setNErr('Preencha nome e usuário'); return }
    if (nf.pwd.length < 6) { setNErr('Senha mínimo 6 caracteres'); return }
    setAdding(true)
    try {
      const rkey = await dbCreateUser(nf.user, nf.name, nf.pwd, nf.role)
      setNOk(`✅ Criado! Chave: ${rkey}`)
      setNf({ name:'', user:'', pwd:'', role:'user' })
      load()
      setTimeout(() => setNOk(''), 10000)
    } catch(e) { setNErr('Erro: '+e.message) }
    setAdding(false)
  }

  const roleColors = { admin:'bg-purple-100 text-purple-700', user:'bg-blue-100 text-blue-700', viewer:'bg-gray-100 text-gray-500' }
  const roleLabel  = { admin:'Admin', user:'Usuário', viewer:'Visualizador' }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">👥 Usuários do Sistema</h2>
            <p className="text-xs text-gray-400 mt-0.5">Gerencie os acessos ao MM ERP</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Users list */}
          {busy ? (
            <p className="text-sm text-gray-400 text-center py-6">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${u.active ? 'border-gray-100 bg-white hover:border-indigo-100' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'}`}>
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {(u.display_name||u.username)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-gray-800 text-sm">{u.display_name||u.username}</span>
                      <span className="text-xs text-gray-400 font-mono">@{u.username}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColors[u.role]||roleColors.user}`}>
                        {roleLabel[u.role]||u.role}
                      </span>
                      {!u.active && <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inativo</span>}
                      {u.username === currentUser.username && <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Você</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {u.last_login ? `Último acesso: ${new Date(u.last_login).toLocaleString('pt-BR')}` : 'Nunca acessou'}
                    </p>
                  </div>
                  {u.username !== currentUser.username && (
                    <div className="flex gap-1.5 shrink-0">
                      <select value={u.role} onChange={async e=>{await dbUpdateRole(u.id,e.target.value);load()}}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none bg-white cursor-pointer">
                        <option value="admin">Admin</option>
                        <option value="user">Usuário</option>
                        <option value="viewer">Visualizador</option>
                      </select>
                      <button onClick={async()=>{await dbToggleUserActive(u.id,!u.active);load()}}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                          ${u.active?'bg-red-50 text-red-600 hover:bg-red-100':'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.active?'Desativar':'Reativar'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add user */}
          <div className="border-t border-gray-100 pt-4">
            <button onClick={()=>setShow(v=>!v)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              {show?'▲ Fechar':'+ Adicionar novo usuário'}
            </button>
            {show && (
              <div className="mt-3 bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[['Nome completo','name','text','Ex: Maria'],
                    ['Usuário (login)','user','text','Ex: maria'],
                    ['Senha inicial','pwd','password','Mínimo 6 caracteres']
                  ].map(([l,k,t,ph])=>(
                    <div key={k} className={k==='name'?'col-span-2':''}>
                      <label className="text-xs font-medium text-gray-600 block mb-1">{l}</label>
                      <input type={t} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                        value={nf[k]} onChange={e=>setN(k,e.target.value)} placeholder={ph} />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Perfil</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                      value={nf.role} onChange={e=>setN('role',e.target.value)}>
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                      <option value="viewer">Visualizador</option>
                    </select>
                  </div>
                </div>
                {nErr && <p className="text-red-500 text-xs">{nErr}</p>}
                {nOk && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700 font-mono break-all">{nOk}</div>}
                <button onClick={addUser} disabled={adding}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {adding?'Criando...':'Criar Usuário'}
                </button>
                <p className="text-[10px] text-gray-400">A chave de recuperação aparece uma única vez — repasse ao usuário imediatamente.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Exported wrapper ─────────────────────────────────────────────────────
export default function AuthWrapper({ children }) {
  const [state,    setState]    = useState('checking')
  const [user,     setUser]     = useState(null)
  const [showMgmt, setShowMgmt] = useState(false)

  useEffect(() => { init() }, [])

  async function init() {
    try {
      const count = await dbCountUsers()
      if (count === 0) { setState('setup'); return }
      const session = getSession()
      if (session) { setUser(session); setState('authed'); return }
      setState('login')
    } catch(e) { console.error('Auth init:', e); setState('error') }
  }

  const done    = (s) => { setUser(s); setState('authed') }
  const logout  = async () => {
    if (user) await dbLogAccess(user.username, 'logout').catch(()=>{})
    clearSession(); setUser(null); setState('login')
  }

  if (state === 'checking') return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (state === 'error') return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-xl">
        <p className="text-3xl mb-3">⚠️</p>
        <h2 className="font-bold text-gray-800 mb-2">Erro de conexão</h2>
        <p className="text-sm text-gray-500 mb-4">Não foi possível conectar ao Supabase. Verifique as variáveis <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> no arquivo <code className="bg-gray-100 px-1 rounded">.env</code>.</p>
        <button onClick={init} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Tentar novamente</button>
      </div>
    </div>
  )
  if (state === 'setup') return <SetupScreen onDone={done} />
  if (state === 'login') return <LoginScreen onDone={done} />

  return (
    <AuthCtx.Provider value={{ user, logout, openUserMgmt: () => setShowMgmt(true) }}>
      {children}
      {showMgmt && user?.role === 'admin' && (
        <UserMgmtModal currentUser={user} onClose={() => setShowMgmt(false)} />
      )}
    </AuthCtx.Provider>
  )
}
