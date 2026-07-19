import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import mmErpLogoUrl from "./assets/mm-erp-logo.png";
import {
  dbCountUsers, dbResetPasswordWithRecovery,
} from "./supabase.js";

// ─── Icons (inline SVGs) ───────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    orders: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
    finance: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    crm: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    suppliers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />,
    inventory: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    reports: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    chevronDown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    tag: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 9V4a1 1 0 011-1z" />,
    truck: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />,
    arrowUp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />,
    arrowDown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />,
    settings: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
    eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      {icons[name]}
    </svg>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────

// ─── Versão do Sistema ────────────────────────────────────────────────────────
// Formato: MAJOR.MINOR.PATCH
// MAJOR → mudança estrutural grande
// MINOR → nova funcionalidade
// PATCH → correção de bug ou ajuste visual
const APP_VERSION = "3.33.0";

const CHANNELS = ["Mercado Livre", "Shopee", "WhatsApp", "Loja Própria"];
// Dias da semana no padrão JS Date.getDay() (0=Domingo ... 6=Sábado), usados
// pra configurar quais dias cada canal despacha (Parâmetros → Canais) e pro
// cálculo do prazo de postagem no Dashboard.
const WEEKDAYS = [
  { v:1, l:"Seg" }, { v:2, l:"Ter" }, { v:3, l:"Qua" }, { v:4, l:"Qui" },
  { v:5, l:"Sex" }, { v:6, l:"Sáb" }, { v:0, l:"Dom" },
];
const CHANNEL_TO_ID = {"Mercado Livre":"ml","Shopee":"shopee","WhatsApp":"wpp","Loja Própria":"loja","Loja Propria":"loja"};
const chId = (ch) => CHANNEL_TO_ID[ch] || ch;
const ORDER_STATUSES = ["Novo", "Em Separação", "Enviado", "Entregue", "Cancelado", "Devolvido"];

// ─── Semântica de status ────────────────────────────────────────────────────
// Cada status carrega 3 chaves de comportamento:
//   holdsStock — pedido nesse status baixa/mantém a baixa do estoque
//   toShip     — conta como "a enviar" (card do Dashboard, Prazos de Postagem, filtro A_ENVIAR)
//   delivered  — vale como entrega concluída (elegibilidade de comissão)
// Os status essenciais têm semântica FIXA aqui; os customizados declaram a sua
// nos Parâmetros (params.vendas.statusMeta) — antes, status customizado era só
// etiqueta: não baixava estoque, não aparecia como "a enviar" e não comissionava,
// tudo em silêncio.
const CORE_STATUS_META = {
  "Novo":         { holdsStock:true,  toShip:true,  delivered:false },
  "Em Separação": { holdsStock:true,  toShip:true,  delivered:false },
  "Enviado":      { holdsStock:true,  toShip:false, delivered:false },
  "Entregue":     { holdsStock:true,  toShip:false, delivered:true  },
  "Cancelado":    { holdsStock:false, toShip:false, delivered:false },
  "Devolvido":    { holdsStock:false, toShip:false, delivered:false },
};
const statusMeta       = (params, s) => CORE_STATUS_META[s] || params?.vendas?.statusMeta?.[s] || { holdsStock:false, toShip:false, delivered:false };
const statusHoldsStock = (params, s) => statusMeta(params, s).holdsStock;
const statusToShip     = (params, s) => statusMeta(params, s).toShip;
const statusDelivered  = (params, s) => statusMeta(params, s).delivered;

// ─── Limite de desconto ─────────────────────────────────────────────────────
// Política da empresa (Parâmetros → Vendas): desconto máximo em % que usuários
// não-admin podem conceder por item. 0 = sem limite. Admins podem exceder.
// Retorna o maior desconto % encontrado na lista de itens (tipo % direto;
// tipo R$ convertido sobre o bruto do item).
const maiorDescontoPercent = (itemsList) => (itemsList||[]).reduce((max, it) => {
  const gross = (Number(it.qty)||0) * (Number(it.unitPrice)||0);
  const pct = it.discountType === "%"
    ? (Number(it.discount)||0)
    : (gross > 0 ? (Number(it.discount)||0) / gross * 100 : 0);
  return Math.max(max, pct);
}, 0);
const limiteDesconto = (params) => Number(params?.vendas?.descontoMaximoPercent) || 0;
const PAYMENT_METHODS = ["Pix", "Cartão de Crédito", "Boleto", "Mercado Pago", "Dinheiro"];

// ─── Finance Constants ────────────────────────────────────────────────────
const INCOME_CATS  = ["Vendas ML","Vendas Shopee","Vendas WhatsApp","Vendas Loja Própria","Outros"];
const EXPENSE_CATS = ["Fornecedores","Taxas de Plataforma","Marketing","Frete / Logística","Salários","Aluguel","Devoluções / Reembolsos","Outros"];
const FSTATUS_STYLES = {
  pago:      { bg:"bg-green-100", text:"text-green-700",  dot:"bg-green-500" },
  pendente:  { bg:"bg-amber-100", text:"text-amber-700",  dot:"bg-amber-500" },
  cancelado: { bg:"bg-red-100",   text:"text-red-700",    dot:"bg-red-500"   },
};
const CAT_COLORS = {
  "Vendas ML":"#f59e0b","Vendas Shopee":"#f97316","Vendas WhatsApp":"#22c55e",
  "Vendas Loja Própria":"#6366f1","Fornecedores":"#64748b","Taxas de Plataforma":"#ef4444",
  "Marketing":"#8b5cf6","Frete / Logística":"#06b6d4","Salários":"#ec4899",
  "Aluguel":"#a78bfa","Devoluções / Reembolsos":"#f43f5e","Outros":"#94a3b8",
};

const SEED_FINANCE = [];

const STATUS_STYLES = {
  "Novo":          { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  "Em Separação":  { bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500" },
  "Enviado":       { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  "Entregue":      { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  "Cancelado":     { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
  "Devolvido":     { bg: "bg-rose-100",   text: "text-rose-700",   dot: "bg-rose-500" },
};

const CHANNEL_STYLES = {
  "Mercado Livre": { bg: "bg-yellow-100", text: "text-yellow-800" },
  "Shopee":        { bg: "bg-orange-100", text: "text-orange-700" },
  "WhatsApp":      { bg: "bg-green-100",  text: "text-green-700" },
  "Loja Própria":  { bg: "bg-blue-100",   text: "text-blue-700" },
};

const SEED_ORDERS = [];

// ─── Storage Helpers ──────────────────────────────────────────────────────
// ─── CRM Constants ────────────────────────────────────────────────────────
const SEGMENTS = ["Ativo","Inativo","Desenvolvimento"];
const SEG_STYLES = {
  "Ativo":          { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  "Inativo":        { bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400"   },
  "Desenvolvimento":{ bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
  "VIP":            { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  "Regular":        { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
  "Novo":           { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  "default":        { bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400"   },
};
const AVATAR_COLORS = ["bg-indigo-500","bg-purple-500","bg-pink-500","bg-orange-500",
  "bg-teal-500","bg-blue-500","bg-red-400","bg-cyan-500","bg-violet-500","bg-emerald-500"];
const avatarColor = (name) => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (name) => name.split(" ").slice(0,2).map(p=>p[0]).join("").toUpperCase();

const SEED_CUSTOMERS = [];

// ─── Persistência com retry + aviso visível em caso de falha ──────────────
// Antes, cada save*() engolia erro de rede/gravação em silêncio (try{}catch(_){}),
// então uma falha transitória (ex: baixa de pedido) simplesmente sumia sem
// nenhum aviso — dado ficava só na memória da sessão, nunca ia pro banco.
async function persistKV(key, data, label) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await window.storage.set(key, JSON.stringify(data));
      return true;
    } catch (err) {
      if (attempt === 2) {
        console.error(`[MM ERP] Falha ao salvar "${label}" (${key}):`, err);
        try { window.dispatchEvent(new CustomEvent("erp:save-error", { detail: { label, key } })); } catch(_){}
        return false;
      }
      await new Promise(r => setTimeout(r, 700));
    }
  }
}

// Mesma ideia do persistKV, só que pra leitura: antes, uma falha ao carregar
// (rede/sessão) fazia o módulo simplesmente aparecer vazio, sem nenhum aviso —
// dando a impressão de que os dados tinham sido apagados, quando na verdade
// só não carregaram. Agora tenta de novo uma vez e avisa se falhar de vez,
// deixando claro que o fallback (vazio) é falha de carregamento, não perda de dado.
async function loadKV(key, seedFallback, label) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await window.storage.get(key);
      if (r?.value) return JSON.parse(r.value);
      return seedFallback;
    } catch (err) {
      if (attempt === 2) {
        console.error(`[MM ERP] Falha ao carregar "${label}" (${key}):`, err);
        try { window.dispatchEvent(new CustomEvent("erp:load-error", { detail: { label, key } })); } catch(_){}
        return seedFallback;
      }
      await new Promise(r2 => setTimeout(r2, 700));
    }
  }
}

const CLI_KEY = "erp-mmarmarinhos-customers";
async function loadCustomers() {
  return loadKV(CLI_KEY, SEED_CUSTOMERS, "Clientes");
}
async function saveCustomers(c) {
  return persistKV(CLI_KEY, c, "Clientes");
}

// ─── Supplier Constants ───────────────────────────────────────────────────
const SUP_CATS     = ["Linhas / Fios","Materiais de Bordado","Embalagens","Agulhas / Acessórios","Serviços","Outros"];
const SUP_STATUSES = ["Ativo","Inativo","Desenvolvimento"];
const SUP_STATUS_STYLES = {
  "Ativo":          { bg:"bg-green-100", text:"text-green-700", dot:"bg-green-500"  },
  "Inativo":        { bg:"bg-gray-100",  text:"text-gray-500",  dot:"bg-gray-400"   },
  "Desenvolvimento":{ bg:"bg-blue-100",  text:"text-blue-700",  dot:"bg-blue-400"   },
};
const PAYMENT_TERMS = ["À vista","15 dias","30 dias","30/60 dias","30/60/90 dias","45 dias","60 dias"];
const SUP_CAT_COLORS = {
  "Linhas / Fios":"#f59e0b","Materiais de Bordado":"#8b5cf6","Embalagens":"#06b6d4",
  "Agulhas / Acessórios":"#6366f1","Serviços":"#ec4899","Outros":"#94a3b8",
};

const SEED_SUPPLIERS = [];

const FOR_KEY = "erp-mmarmarinhos-suppliers";
async function loadSuppliers() {
  return loadKV(FOR_KEY, SEED_SUPPLIERS, "Fornecedores");
}
async function saveSuppliers(s) {
  return persistKV(FOR_KEY, s, "Fornecedores");
}

// ─── Purchase Orders Seed & Storage ──────────────────────────────────────
// "Baixado Parcial" foi removido das opções: nunca teve nenhuma lógica de
// negócio associada (não gerava estoque nem financeiro), e o recebimento
// parcial de verdade já é tratado pelo fluxo "Baixar Pedido" (que baixa a
// quantidade recebida e cria automaticamente um pedido complementar
// "Em Aberto" com o saldo) — deixar o status manual só confundia.
const PC_STATUS = ["Em Aberto","Baixado","Cancelado"];
const PC_STATUS_STYLES = {
  "Em Aberto":       { bg:"bg-gray-100",   text:"text-gray-600"   },
  "Baixado":         { bg:"bg-green-100",  text:"text-green-700"  },
  "Cancelado":       { bg:"bg-red-100",    text:"text-red-600"    },
};

const SEED_PURCHASES = [];

const PC_KEY = "erp-mmarmarinhos-purchases";
async function loadPurchases() {
  return loadKV(PC_KEY, SEED_PURCHASES, "Pedidos de Compra");
}
async function savePurchases(p) {
  return persistKV(PC_KEY, p, "Pedidos de Compra");
}

// ─── Inventory Constants ──────────────────────────────────────────────────
const INV_CATS  = ["Linhas / Fios","Agulhas","Materiais de Bordado","Bastidores / Aros","Embalagens","Kits","Outros"];
const INV_UNITS = ["un","m","kg","caixa","rolo","par","pct"];
const MOV_REASONS_IN  = ["Compra de fornecedor","Devolução de cliente","Produção / montagem","Transferência","Ajuste de inventário","Outro"];
const MOV_REASONS_OUT = ["Venda","Uso interno","Perda / avaria","Devolução a fornecedor","Ajuste de inventário","Outro"];
const INV_CAT_COLORS  = {
  "Linhas / Fios":"#f59e0b","Agulhas":"#6366f1","Materiais de Bordado":"#8b5cf6",
  "Bastidores / Aros":"#06b6d4","Embalagens":"#64748b","Kits":"#ec4899","Outros":"#94a3b8",
};
const stockStatus = (stock, min) => {
  if (stock === 0)   return { label:"Zerado", bg:"bg-red-100",   text:"text-red-700",   bar:"bg-red-500",   dot:"bg-red-500"   };
  if (stock < min)   return { label:"Baixo",  bg:"bg-amber-100", text:"text-amber-700", bar:"bg-amber-500", dot:"bg-amber-500" };
  return                    { label:"Normal", bg:"bg-green-100", text:"text-green-700", bar:"bg-green-500", dot:"bg-green-500" };
};

const SEED_PRODUCTS = [];

const SEED_MOVEMENTS = [];

const PRD_KEY = "erp-mmarmarinhos-products";
const MOV_KEY = "erp-mmarmarinhos-movements";
async function loadProducts()  { return loadKV(PRD_KEY, SEED_PRODUCTS, "Estoque/Produtos"); }
async function saveProducts(p) { return persistKV(PRD_KEY, p, "Estoque/Produtos"); }
async function loadMovements() { return loadKV(MOV_KEY, SEED_MOVEMENTS, "Movimentos de Estoque"); }
async function saveMovements(m){ return persistKV(MOV_KEY, m, "Movimentos de Estoque"); }

const CAIXA_KEY = "erp-mmarmarinhos-caixa";
async function loadCaixa()  { return loadKV(CAIXA_KEY, [], "Caixa/PDV"); }
async function saveCaixa(c) { return persistKV(CAIXA_KEY, c, "Caixa/PDV"); }

// ─── Fiscal Constants ─────────────────────────────────────────────────────
const NF_TIPOS    = ["NF-e","NFC-e","NFS-e"];
const NF_STATUSES = ["Autorizada","Em Aberto","Cancelada","Inutilizada","Denegada"];
const NF_STATUS_STYLES = {
  "Autorizada":  { bg:"bg-green-100",  text:"text-green-700",  dot:"bg-green-500"  },
  "Em Aberto":   { bg:"bg-gray-100",   text:"text-gray-600",   dot:"bg-gray-400"   },
  "Cancelada":   { bg:"bg-red-100",    text:"text-red-700",    dot:"bg-red-500"    },
  "Inutilizada": { bg:"bg-orange-100", text:"text-orange-700", dot:"bg-orange-400" },
  "Denegada":    { bg:"bg-red-100",    text:"text-red-700",    dot:"bg-red-600"    },
};

// Simples Nacional Anexo I — Comércio (tabela 2024/2025)
const SIMPLES_FAIXAS = [
  { faixa:"1ª", de:0,          ate:180000,   aliq:0.04,   deducao:0,       irpj:5.50, csll:3.50, cofins:12.74, pis:2.76, cpp:41.50, icms:34.00 },
  { faixa:"2ª", de:180000.01,  ate:360000,   aliq:0.073,  deducao:5940,    irpj:5.50, csll:3.50, cofins:12.74, pis:2.76, cpp:41.50, icms:34.00 },
  { faixa:"3ª", de:360000.01,  ate:720000,   aliq:0.095,  deducao:13860,   irpj:5.50, csll:3.50, cofins:12.74, pis:2.76, cpp:41.50, icms:34.00 },
  { faixa:"4ª", de:720000.01,  ate:1800000,  aliq:0.107,  deducao:22500,   irpj:5.50, csll:3.50, cofins:12.74, pis:2.76, cpp:41.50, icms:34.00 },
  { faixa:"5ª", de:1800000.01, ate:3600000,  aliq:0.143,  deducao:87300,   irpj:5.50, csll:3.50, cofins:12.74, pis:2.76, cpp:41.50, icms:34.00 },
  { faixa:"6ª", de:3600000.01, ate:4800000,  aliq:0.19,   deducao:378000,  irpj:13.50,csll:10.00,cofins:28.27, pis:6.13, cpp:42.10, icms:0.00  },
];

const CFOP_LIST = [
  { code:"5102", uso:"Venda dentro do estado",                    desc:"Venda de mercadoria adquirida para comercialização — operação interna (cliente no mesmo estado)" },
  { code:"6102", uso:"Venda fora do estado",                      desc:"Venda de mercadoria adquirida para comercialização — operação interestadual" },
  { code:"5405", uso:"Venda c/ Subs. Tributária (varejo)",        desc:"Venda para consumidor final com substituição tributária do ICMS" },
  { code:"5949", uso:"Saídas diversas",                           desc:"Brinde, amostra grátis, remessa para consignação, outras saídas" },
  { code:"1102", uso:"Compra de fornecedor (mesmo estado)",       desc:"Entrada de mercadoria adquirida para comercialização — operação interna" },
  { code:"2102", uso:"Compra de fornecedor (outro estado)",       desc:"Entrada de mercadoria adquirida para comercialização — operação interestadual" },
  { code:"1202", uso:"Devolução de venda (mesmo estado)",         desc:"Entrada por devolução de cliente do mesmo estado" },
  { code:"2202", uso:"Devolução de venda (outro estado)",         desc:"Entrada por devolução de cliente de outro estado" },
  { code:"5910", uso:"Remessa p/ conserto / reparo",              desc:"Saída de produto para reparo externo" },
  { code:"5915", uso:"Remessa de produto p/ uso / consumo",       desc:"Saída de material para uso interno (embalagens, etc.)" },
];

const NCM_LIST = [
  { code:"5205.11.00", desc:"Fios simples de algodão não penteado",              exemplo:"Linha Bag Sacaria 100% algodão" },
  { code:"5508.20.00", desc:"Fios de fibras artificiais (poliéster, nylon)",      exemplo:"Linha costura sintética, Coats #60" },
  { code:"5509.11.00", desc:"Fios de fibras sintéticas, não acondicionados",      exemplo:"Linhas industriais a granel" },
  { code:"7319.90.00", desc:"Agulhas, alfinetes de ferro ou aço",                 exemplo:"Agulhas de bordado, agulhas máquina" },
  { code:"4420.90.00", desc:"Obras de madeira para bordado e afins",              exemplo:"Bastidor de madeira" },
  { code:"3926.90.40", desc:"Bastidores de plástico para bordado",                exemplo:"Bastidor plástico" },
  { code:"5806.32.10", desc:"Fitas de fibras artificiais têxteis",                exemplo:"Fita cetim, gorgurão" },
  { code:"6001.92.00", desc:"Tecidos de malha de algodão",                        exemplo:"Tecido aida, tecido para bordado" },
  { code:"3923.21.90", desc:"Sacos e bolsas de polietileno",                      exemplo:"Sacos plásticos embalagem" },
  { code:"4819.10.00", desc:"Caixas de papel ou cartão, ondulado",               exemplo:"Caixas embalagem" },
];

const AGENDA_ITEMS = [
  { id:1, nome:"DAS — Simples Nacional",  dia:20, tipo:"Federal",   cor:"bg-blue-500",   desc:"Pagamento e declaração mensal do Simples Nacional (PGDAS-D)" },
  { id:2, nome:"FGTS",                     dia:7,  tipo:"Federal",   cor:"bg-emerald-500",desc:"Depósito mensal do FGTS (quando há funcionários contratados)" },
  { id:3, nome:"INSS — Pró-labore",        dia:20, tipo:"Federal",   cor:"bg-violet-500", desc:"INSS sobre pró-labore dos sócios (GPS ou via DARF)" },
  { id:4, nome:"IRRF — Pró-labore",        dia:20, tipo:"Federal",   cor:"bg-orange-500", desc:"IRRF sobre pró-labore — DARF código 0561" },
  { id:5, nome:"ISS Municipal",            dia:15, tipo:"Municipal", cor:"bg-cyan-500",   desc:"ISS caso o município cobre separado do DAS" },
  { id:6, nome:"DEFIS (anual)",            dia:31, tipo:"Federal",   cor:"bg-red-500",    desc:"Declaração de Informações Socioeconômicas — todo mês de março" },
];

const SEED_NFES = [];

const NFE_KEY = "erp-mmarmarinhos-nfes";
async function loadNfes()  { return loadKV(NFE_KEY, SEED_NFES, "Notas Fiscais"); }
async function saveNfes(n) { return persistKV(NFE_KEY, n, "Notas Fiscais"); }

const STORAGE_KEY = "erp-mmarmarinhos-orders";

async function loadOrders() {
  return loadKV(STORAGE_KEY, SEED_ORDERS, "Pedidos de Venda");
}

async function saveOrders(orders) {
  return persistKV(STORAGE_KEY, orders, "Pedidos de Venda");
}

const FIN_KEY = "erp-mmarmarinhos-finance";
async function loadFinance() {
  return loadKV(FIN_KEY, SEED_FINANCE, "Financeiro");
}
async function saveFinance(fin) {
  return persistKV(FIN_KEY, fin, "Financeiro");
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const today = () => new Date().toISOString().split("T")[0];
const addDaysISO = (dateStr, days) => {
  const d = dateStr ? new Date(dateStr+"T00:00:00") : new Date();
  d.setDate(d.getDate()+days);
  return d.toISOString().split("T")[0];
};
// Prende o TAB dentro de um modal (não deixa escapar pra tela de trás)
const trapTabFocus = (e, containerRef) => {
  if (e.key !== "Tab" || !containerRef.current) return;
  const focusables = Array.from(
    containerRef.current.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter(el => !el.disabled && el.offsetParent !== null);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  }
};
const nextId = (orders) => {
  const nums = orders.map(o => parseInt(o.id.replace("PED-", "")) || 0);
  return `PED-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
};

// ─── Subcomponents ────────────────────────────────────────────────────────
const Badge = ({ label, style }) => {
  const s = style || { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
      {label}
    </span>
  );
};

// ─── Order Modal ──────────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onSave, customers = [], products = [], representantes = [], formasPagamento = [], params, currentUser }) => {
  const isNew = !order;
  const orderStatusOptions = (params?.vendas?.statusList?.length ? params.vendas.statusList : ORDER_STATUSES);
  const emptyItem = () => ({ sku:"", description:"", qty:1, unit:"un", unitPrice:0, discount:0, discountType:"%", total:0 });

  // Parse legacy string items into array
  const parseItems = (o) => {
    if (!o) return [emptyItem()];
    if (o.itemsList?.length) return o.itemsList;
    if (o.items && typeof o.items === "string" && o.items.trim())
      return [{ sku:"", description:o.items, qty:1, unit:"un", unitPrice:o.subtotal||o.total||0, discount:0, discountType:"%", total:o.subtotal||o.total||0 }];
    return [emptyItem()];
  };

  const [form, setForm] = useState(() => ({
    id:"", customer:"", channel:"Mercado Livre", status:"Novo",
    total:"", date:today(), payment:"Pix",
    dueDate:"", paidDate:"", tracking:"", notes:"", nfNumero:"",
    freight:0, channelFee:0, otherFees:0, subtotal:0,
    representanteId:"",
    ...(order||{}),
    itemsList: parseItems(order),
  }));

  const [custSearch, setCustSearch] = useState(order?.customer || "");
  const [showCustList, setShowCustList] = useState(false);
  const [skuSearch, setSkuSearch]   = useState([]);
  const [showSkuList, setShowSkuList] = useState([]);
  // Posição calculada do dropdown de SKU do item — renderizado com position:fixed
  // (fora do <div overflow-x-auto> da tabela de itens) pra não ser cortado.
  const [skuListPos, setSkuListPos] = useState({});
  const [askAddItem, setAskAddItem] = useState(false);
  const naoItemRef = useRef(null);
  const modalRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const suppressNextAsk = useRef(false);
  const skuInputRefs = useRef([]);
  const simItemRef = useRef(null);

  const set = (k, v) => setForm(f => {
    const updated = { ...f, [k]: v };
    updated.total = calcTotal(updated);
    return updated;
  });

  const calcItemTotal = (it) => {
    const gross = (it.qty||0)*(it.unitPrice||0);
    const disc  = it.discountType==="%"
      ? gross*((it.discount||0)/100)
      : (it.discount||0);
    return parseFloat(Math.max(0, gross-disc).toFixed(2));
  };

  const calcTotal = (f) => {
    const sub     = f.itemsList ? f.itemsList.reduce((s,it)=>s+(it.total||0),0) : (parseFloat(f.subtotal)||0);
    const freight    = parseFloat(f.freight)||0;
    const channelFee = parseFloat(f.channelFee)||0;
    const otherFees  = parseFloat(f.otherFees)||0;
    return (sub + freight + channelFee + otherFees).toFixed(2);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase())
  ).slice(0, 8);

  const custInputRef = useRef(null);
  const selectCustomer = (c) => {
    setCustSearch(c.name);
    setForm(f => ({ ...f, customer:c.name, channel:c.channel||f.channel }));
    setShowCustList(false);
    setTimeout(()=>custInputRef.current?.focus(), 0);
  };

  const setItem = (i, k, v) => setForm(f => {
    const itemsList = f.itemsList.map((it,idx) => {
      if (idx!==i) return it;
      const u = { ...it, [k]:v };
      u.total = calcItemTotal(u);
      return u;
    });
    const subtotal = itemsList.reduce((s,it)=>s+(it.total||0),0);
    const updated = { ...f, itemsList, subtotal };
    updated.total = calcTotal(updated);
    return updated;
  });

  const selectProduct = (i, prod) => {
    setForm(f => {
      const cpRaw = prod.channelPrices?.[f.channel];
      const channelPrice = cpRaw ? (typeof cpRaw==='object' ? cpRaw.price : cpRaw) : 0;
      const unitPrice = (channelPrice > 0) ? channelPrice : (prod.price||0);
      const itemsList = f.itemsList.map((it,idx) => {
        if (idx!==i) return it;
        const u = { ...it, sku:prod.sku||"", description:prod.name, unit:prod.unit||"un", unitPrice, _prodId:prod.id };
        u.total = calcItemTotal(u);
        return u;
      });
      const subtotal = itemsList.reduce((s,it)=>s+(it.total||0),0);
      const updated = { ...f, itemsList, subtotal };
      updated.total = calcTotal(updated);
      return updated;
    });
    const ss=[...skuSearch]; ss[i]=prod.sku||prod.name; setSkuSearch(ss);
    const sl=[...showSkuList]; sl[i]=false; setShowSkuList(sl);
  };

  const addItem = () => {
    setForm(f => ({ ...f, itemsList:[...f.itemsList, emptyItem()] }));
    setSkuSearch(s=>[...s,""]);
    setShowSkuList(s=>[...s,false]);
  };
  const removeItem = (i) => {
    setForm(f => {
      const itemsList = f.itemsList.filter((_,idx)=>idx!==i);
      const subtotal = itemsList.reduce((s,it)=>s+(it.total||0),0);
      const updated = { ...f, itemsList, subtotal };
      updated.total = calcTotal(updated);
      return updated;
    });
    setSkuSearch(s=>s.filter((_,idx)=>idx!==i));
    setShowSkuList(s=>s.filter((_,idx)=>idx!==i));
  };

  const subtotal = form.itemsList?.reduce((s,it)=>s+(it.total||0),0)||0;
  const formasAtivas = formasPagamento.filter(f => f.status==="Ativo");
  const paymentOptions = formasAtivas.length > 0 ? formasAtivas.map(f=>f.nome) : PAYMENT_METHODS;

  const [descErr, setDescErr] = useState("");
  const handleSave = () => {
    if (!form.customer.trim()) return;
    // Política de desconto máximo (Parâmetros → Vendas): não-admin não salva
    // pedido com desconto acima do limite; admin pode (é a válvula de exceção).
    const limite = limiteDesconto(params);
    const maior = maiorDescontoPercent(form.itemsList);
    if (limite > 0 && maior > limite + 0.01 && currentUser?.role !== "admin") {
      setDescErr(`⛔ Desconto de ${maior.toFixed(1)}% acima do limite da empresa (${limite}%). Somente administradores podem conceder desconto maior.`);
      return;
    }
    setDescErr("");
    const itemsStr = form.itemsList.map(it=>`${it.description} (${it.qty}${it.unit})`).join(", ");
    onSave({ ...form, subtotal, total:parseFloat(form.total)||0, items:itemsStr });
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} onKeyDown={e=>trapTabFocus(e, modalRef)} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800">{isNew ? "Novo Pedido" : `Editar ${form.id}`}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Cliente */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 relative">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Cliente *</label>
              <input className={inp} ref={custInputRef}
                value={custSearch}
                onChange={e=>{ setCustSearch(e.target.value); setForm(f=>({...f,customer:e.target.value})); setShowCustList(true); }}
                onFocus={()=>setShowCustList(true)}
                onBlur={()=>setTimeout(()=>setShowCustList(false),150)}
                placeholder="Digite o nome do cliente..."/>
              {showCustList && filteredCustomers.length>0 && custSearch && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredCustomers.map(c=>(
                    <button key={c.id} type="button" onMouseDown={()=>selectCustomer(c)}
                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 border-b border-gray-50 last:border-0">
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.cpfCnpj||""} {c.channel?`· ${c.channel}`:""} {c.phone?`· ${c.phone}`:""}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Canal *</label>
              <select className={inp} value={form.channel} onChange={e=>{
                  const newCh=e.target.value;
                  setForm(f=>{
                    const itemsList=(f.itemsList||[]).map(it=>{
                      const prod=products.find(p=>String(p.id)===String(it._prodId));
                      if(!prod)return it;
                      const cp=prod.channelPrices?.[newCh];
                      const price=cp?(typeof cp==='object'?cp.price:cp):0;
                      if(!price)return it;
                      const u={...it,unitPrice:price};
                      u.total=calcItemTotal(u);
                      return u;
                    });
                    return {...f,channel:newCh,itemsList};
                  });
                }}>
                {CHANNELS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select className={inp} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {orderStatusOptions.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Itens</label>
              <button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Adicionar item</button>
            </div>
            <div className="overflow-x-auto">
              <div className="space-y-2 min-w-[700px]">
                {form.itemsList.map((it,i)=>{
                const sq = skuSearch[i]||it.sku||"";
                const filtProd = products.filter(p=>
                  p.sku?.toLowerCase().includes(sq.toLowerCase())||
                  p.name?.toLowerCase().includes(sq.toLowerCase())
                ).slice(0,6);
                const gross = (it.qty||0)*(it.unitPrice||0);
                const discAmt = it.discountType==="%"?gross*((it.discount||0)/100):(it.discount||0);
                return (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex gap-2 items-start">
                      <div className="relative w-28 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">SKU</p>
                        <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 font-mono"
                          value={sq}
                          onChange={e=>{
                            const ss=[...skuSearch];ss[i]=e.target.value;setSkuSearch(ss);setItem(i,"sku",e.target.value);const sl=[...showSkuList];sl[i]=true;setShowSkuList(sl);
                            const r = skuInputRefs.current[i]?.getBoundingClientRect();
                            if (r) setSkuListPos(p=>({...p,[i]:{top:r.bottom+4, left:r.left, width:Math.max(r.width,220)}}));
                          }}
                          onFocus={()=>{
                            const sl=[...showSkuList];sl[i]=true;setShowSkuList(sl);
                            const r = skuInputRefs.current[i]?.getBoundingClientRect();
                            if (r) setSkuListPos(p=>({...p,[i]:{top:r.bottom+4, left:r.left, width:Math.max(r.width,220)}}));
                          }}
                          onBlur={()=>setTimeout(()=>{const sl=[...showSkuList];sl[i]=false;setShowSkuList(sl);},150)}
                          onKeyDown={e=>{
                            if (e.key==="Tab" && showSkuList[i] && filtProd.length>0) {
                              const exact = filtProd.find(p=>p.sku?.toLowerCase()===sq.toLowerCase());
                              selectProduct(i, exact||filtProd[0]);
                            }
                          }}
                          ref={el=>skuInputRefs.current[i]=el}
                          placeholder="SKU"/>
                        {showSkuList[i] && filtProd.length>0 && sq && (
                          <div
                            className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                            style={{
                              top: (skuListPos[i]?.top ?? 0) + "px",
                              left: (skuListPos[i]?.left ?? 0) + "px",
                              width: (skuListPos[i]?.width ?? 256) + "px",
                            }}>
                            {filtProd.map(p=>(
                              <button key={p.id} type="button" onMouseDown={()=>selectProduct(i,p)}
                                className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-50 last:border-0">
                                <p className="text-xs font-mono font-bold text-indigo-600">{p.sku||"—"}</p>
                                <p className="text-xs text-gray-700 truncate">{p.name}</p>
                                <p className={`text-[10px] ${(p.stock||0)<=0?"text-red-400":"text-gray-400"}`}>Estoque: {p.stock||0} {p.unit||"un"}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Produto / Serviço</p>
                        <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.description} onChange={e=>setItem(i,"description",e.target.value)} placeholder="Produto / serviço"/>
                      </div>
                      <div className="w-16 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Qtd</p>
                        <input type="number" min="1" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.qty===0?"":it.qty}
                          onChange={e=>setItem(i,"qty", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                          onBlur={e=>{ if (e.target.value==="") setItem(i,"qty",0); }}/>
                      </div>
                      <div className="w-20 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Un</p>
                        <select className="w-full border border-gray-200 rounded-lg px-1 py-1.5 text-xs bg-white focus:outline-none"
                          value={it.unit} onChange={e=>setItem(i,"unit",e.target.value)}>
                          {INV_UNITS.map(u=><option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div className="w-24 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Preço Unit.</p>
                        <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.unitPrice===0?"":it.unitPrice}
                          onChange={e=>setItem(i,"unitPrice", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                          onBlur={e=>{ if (e.target.value==="") setItem(i,"unitPrice",0); }}/>
                      </div>
                      <div className="w-28 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Desconto</p>
                        <div className="flex gap-0.5">
                          <button onClick={()=>setItem(i,"discountType",it.discountType==="%"?"R$":"%")}
                            className="border border-gray-200 rounded-l-lg px-2 py-1.5 text-[10px] font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 transition-colors shrink-0 text-gray-600">
                            {it.discountType||"%"}
                          </button>
                          <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-r-lg px-1 py-1.5 text-xs text-right bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                            value={it.discount===0?"":it.discount}
                            onChange={e=>{setItem(i,"discount", e.target.value===""?"":(parseFloat(e.target.value)||0)); suppressNextAsk.current=false;}}
                            onBlur={e=>{ if (e.target.value==="") setItem(i,"discount",0); if (suppressNextAsk.current) { suppressNextAsk.current=false; return; } lastFocusedRef.current=e.target; setAskAddItem(true); }}/>
                        </div>
                      </div>
                      <div className="w-24 shrink-0 text-right">
                        <p className="text-[10px] text-gray-400 mb-0.5">Total</p>
                        <p className="text-sm font-bold text-gray-900 pt-1">{fmt(it.total)}</p>
                        {discAmt>0 && <p className="text-[10px] text-green-600">-{fmt(discAmt)}</p>}
                      </div>
                      {form.itemsList.length>1 && (
                        <button onClick={()=>removeItem(i)} className="text-red-400 hover:text-red-600 text-sm shrink-0 mt-5">✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Fees + Total */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">🚚 Frete (R$)</label>
                <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  value={form.freight===0||form.freight===""?"":form.freight} onChange={e=>set("freight",e.target.value)}
                  onBlur={e=>{ if (e.target.value==="") set("freight",0); }} placeholder="0,00"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">🏪 Taxa Canal (R$)</label>
                <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  value={form.channelFee===0||form.channelFee===""?"":form.channelFee} onChange={e=>set("channelFee",e.target.value)}
                  onBlur={e=>{ if (e.target.value==="") set("channelFee",0); }} placeholder="0,00"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">➕ Outras (R$)</label>
                <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  value={form.otherFees===0||form.otherFees===""?"":form.otherFees} onChange={e=>set("otherFees",e.target.value)}
                  onBlur={e=>{ if (e.target.value==="") set("otherFees",0); }} placeholder="0,00"/>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <p className="text-xs text-gray-500">Subtotal: <strong>{fmt(subtotal)}</strong> + taxas</p>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-indigo-700">{fmt(parseFloat(form.total)||0)}</p>
              </div>
            </div>
          </div>

          {/* Other fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Pagamento</label>
              <select className={inp} value={form.payment} onChange={e=>setForm(f=>({...f,payment:e.target.value}))}>
                {paymentOptions.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Representante</label>
              <select className={inp} value={form.representanteId||""} onChange={e=>setForm(f=>({...f,representanteId:e.target.value}))}>
                <option value="">— Nenhum —</option>
                {representantes.filter(r=>r.status==="Ativo").map(r=><option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Emitido em</label>
              <input type="date" className={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Número da NF</label>
              <input className={`${inp} font-mono`} value={form.nfNumero||""} onChange={e=>setForm(f=>({...f,nfNumero:e.target.value}))} placeholder="Ex: 000123"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Código de Rastreio</label>
              <input className={inp} value={form.tracking||""} onChange={e=>setForm(f=>({...f,tracking:e.target.value}))} placeholder="Opcional"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">📅 Vencimento do Boleto</label>
              <input type="date" className={inp} value={form.dueDate||""} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Observações</label>
              <textarea rows={2} className={`${inp} resize-none`} value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Notas internas (opcional)"/>
            </div>
          </div>
        </div>

        {descErr && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">{descErr}</p>}
          <div className="flex gap-2 p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            {isNew ? "Criar Pedido" : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {askAddItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onKeyDown={e=>{ if (e.key==="Escape") { suppressNextAsk.current=true; setAskAddItem(false); setTimeout(()=>lastFocusedRef.current?.focus(),0); return; } if (e.key==="Tab") { e.preventDefault(); (document.activeElement===simItemRef.current ? naoItemRef : simItemRef).current?.focus(); } }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center">
            <p className="text-3xl mb-2">➕</p>
            <p className="font-semibold text-gray-900 mb-1">Adicionar outro item?</p>
            <p className="text-sm text-gray-500 mb-4">Você pode continuar incluindo produtos neste pedido.</p>
            <div className="flex gap-2">
              <button ref={naoItemRef} onClick={()=>{suppressNextAsk.current=true; setAskAddItem(false); setTimeout(()=>lastFocusedRef.current?.focus(),0);}} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Não</button>
              <button ref={simItemRef} autoFocus onClick={()=>{const newIdx=form.itemsList.length; addItem(); setAskAddItem(false); setTimeout(()=>skuInputRefs.current[newIdx]?.focus(),50);}} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Sim, adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Status Update Dropdown ───────────────────────────────────────────────
const DEFAULT_STATUS_STYLE = { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
const StatusDropdown = ({ order, onChange, statusOptions = ORDER_STATUSES }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const s = STATUS_STYLES[order.status] || DEFAULT_STATUS_STYLE;

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, minWidth: Math.max(r.width, 140) });
    }
    setOpen(o => !o);
  };

  return (
    <div className="relative">
      <button ref={btnRef} onClick={toggle}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {order.status}
        <Icon name="chevronDown" size={12} />
      </button>
      {open && (
        <>
          {/* Overlay pra fechar ao clicar fora, já que o menu agora é fixed (fora do fluxo normal) */}
          <div className="fixed inset-0 z-[19]" onClick={()=>setOpen(false)} />
          <div className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1"
            style={{ top: (pos?.top ?? 0) + "px", left: (pos?.left ?? 0) + "px", minWidth: (pos?.minWidth ?? 140) + "px" }}>
            {statusOptions.map(st => (
              <button key={st} onClick={() => { onChange(st); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 ${order.status === st ? "font-semibold" : ""}`}>
                <span className={`w-2 h-2 rounded-full ${(STATUS_STYLES[st]||DEFAULT_STATUS_STYLE).dot}`} />
                {st}
                {order.status === st && <Icon name="check" size={12} className="ml-auto text-indigo-500" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Orders Module ────────────────────────────────────────────────────────

// ─── PDF do Pedido de Venda ───────────────────────────────────────────────
const gerarPedidoPDF = async (order) => {
  const empRaw = await window.storage.get(EMPRESA_KEY).catch(()=>null);
  const emp = empRaw && empRaw.value ? JSON.parse(empRaw.value) : {};
  const eNome  = emp.nomeFantasia || emp.razaoSocial || "MM Armarinhos";
  const eCnpj  = emp.cnpj   || "";
  const eTel   = emp.celular || emp.telefone || "";
  const eEmail = emp.email  || "";
  const eSite  = emp.site   || "";
  const hoje   = new Date().toLocaleDateString("pt-BR");
  const fmtBR = (iso) => iso ? new Date(iso+"T00:00:00").toLocaleDateString("pt-BR") : "";

  // Itens
  const items = order.itemsList || (order.items && typeof order.items !== "string" ? order.items : null) || [];
  const hasItems = items.length > 0;

  var rows = "";
  var subtotal = 0;
  if (hasItems) {
    items.forEach(function(it) {
      var sku   = it.sku || "-";
      var desc  = it.description || it.desc || it.sku || "-";
      var qty   = it.qty || 1;
      var un    = it.unit || "un";
      var price = (it.unitPrice || 0).toFixed(2).replace(".", ",");
      var gross = (it.unitPrice || 0) * qty;
      var disc  = it.discountType === "%" ? gross * ((it.discount || 0) / 100) : (it.discount || 0);
      var tot   = it.total || (gross - disc);
      subtotal += tot;
      var discStr = it.discount ? (it.discountType === "%" ? it.discount + "%" : "R$ " + it.discount) : "-";
      rows += "<tr>"
        + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;font-family:monospace;font-size:11px;color:#6366f1;font-weight:700;'>" + sku + "</td>"
        + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;'>" + desc + "</td>"
        + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;'>" + qty + "</td>"
        + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;color:#94a3b8;'>" + un + "</td>"
        + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;'>R$ " + price + "</td>"
        + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;color:#94a3b8;'>" + discStr + "</td>"
        + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;'>R$ " + tot.toFixed(2).replace(".",",") + "</td>"
        + "</tr>";
    });
  } else {
    var legacyDesc = typeof order.items === "string" ? order.items : "-";
    var legacyTot  = order.total || 0;
    subtotal = legacyTot;
    rows += "<tr>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;color:#94a3b8;'>-</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;' colspan='4'>" + legacyDesc + "</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;'>-</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;'>R$ " + legacyTot.toFixed(2).replace(".",",") + "</td>"
      + "</tr>";
  }
  var total = order.total || subtotal;

  var infoEmp = (eCnpj  ? "CNPJ: "  + eCnpj  + "<br>" : "")
              + (eTel   ? "Cel: "    + eTel   + "<br>" : "")
              + (eEmail ? "E-mail: " + eEmail + "<br>" : "")
              + (eSite  ? "Site: "   + eSite           : "");

  var notesHTML = order.notes
    ? "<div style='background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:12px;color:#64748b;line-height:1.6;margin-bottom:20px;'>"
      + order.notes + "</div>"
    : "";

  var css = "<style>"
    + "* {margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif;}"
    + "body {padding:32px;color:#1e293b;font-size:13px;}"
    + ".hdr {display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:3px solid #6366f1;}"
    + ".enome {font-size:22px;font-weight:800;color:#6366f1;}"
    + ".einfo {font-size:11px;color:#64748b;margin-top:4px;line-height:1.7;}"
    + ".badge {background:#6366f1;color:#fff;font-size:18px;font-weight:700;padding:8px 18px;border-radius:10px;}"
    + ".bsub {font-size:11px;color:#64748b;text-align:right;margin-top:6px;line-height:1.6;}"
    + ".sec {margin-bottom:24px;}"
    + ".stitle {font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;}"
    + ".grid {display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;}"
    + ".ibox {background:#f8fafc;border-radius:8px;padding:10px 12px;border:1px solid #e2e8f0;}"
    + ".ilabel {font-size:10px;color:#94a3b8;text-transform:uppercase;margin-bottom:3px;}"
    + ".ival {font-size:13px;font-weight:600;color:#1e293b;}"
    + "table {width:100%;border-collapse:collapse;}"
    + "th {background:#f8fafc;text-align:left;padding:9px 8px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;}"
    + ".tbox {display:flex;justify-content:flex-end;margin-top:16px;}"
    + ".tinner {background:#f8fafc;border-radius:10px;padding:16px;width:280px;}"
    + ".trow {display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#64748b;}"
    + ".tfinal {display:flex;justify-content:space-between;padding:10px 0 0;margin-top:8px;border-top:2px solid #6366f1;font-size:18px;font-weight:800;color:#6366f1;}"
    + ".aprov {margin-top:32px;border-top:2px dashed #e2e8f0;padding-top:24px;}"
    + ".sig-row {display:flex;gap:32px;}"
    + ".sig-box {flex:1;border-top:1px solid #94a3b8;padding-top:8px;font-size:11px;color:#64748b;}"
    + ".ftr {margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;}"
    + "@media print {body {padding:20px;}}"
    + "</style>";

  var body = "<div class='hdr'>"
    + "<div><div class='enome'>" + eNome + "</div><div class='einfo'>" + infoEmp + "</div></div>"
    + "<div><div class='badge'>PEDIDO " + (order.id||"") + "</div>"
    + "<div class='bsub'>Data: " + (fmtBR(order.date)||"-") + "<br>Status: <b>" + (order.status||"-") + "</b></div></div>"
    + "</div>"
    + "<div class='sec'><div class='stitle'>Cliente</div><div class='grid'>"
    + "<div class='ibox'><div class='ilabel'>Nome</div><div class='ival'>" + (order.customer||"-") + "</div></div>"
    + "<div class='ibox'><div class='ilabel'>Canal</div><div class='ival'>" + (order.channel||"-") + "</div></div>"
    + "<div class='ibox'><div class='ilabel'>Pagamento</div><div class='ival'>" + (order.payment||"-") + "</div></div>"
    + "</div></div>"
    + "<div class='sec'><div class='stitle'>Itens do Pedido</div>"
    + "<table><thead><tr>"
    + "<th>SKU</th><th>Descricao</th><th style='text-align:center'>Qtd</th><th style='text-align:center'>Un</th><th style='text-align:right'>Preco Unit.</th><th style='text-align:center'>Desc.</th><th style='text-align:right'>Total</th>"
    + "</tr></thead><tbody>" + rows + "</tbody></table>"
    + "<div class='tbox'><div class='tinner'>"
    + "<div class='trow'><span>Subtotal</span><span>R$ " + subtotal.toFixed(2).replace(".",",") + "</span></div>"
    + "<div class='tfinal'><span>TOTAL</span><span>R$ " + total.toFixed(2).replace(".",",") + "</span></div>"
    + "</div></div></div>"
    + notesHTML
    + "<div class='aprov'><p style='font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:16px;'>Aprovacao</p>"
    + "<div class='sig-row'>"
    + "<div class='sig-box'>( ) Aprovado &nbsp;&nbsp; ( ) Reprovado<br><br>Assinatura: ___________________</div>"
    + "<div class='sig-box'>Nome: ___________________<br><br>Data: ___/___/______</div>"
    + "</div></div>"
    + "<div class='ftr'><span>" + eNome + " - Pedido gerado em " + hoje + "</span><span>Documento interno - Para uso da expedicao</span></div>"
    + "<script>window.onload=function(){window.print();}<" + "/script>";

  var html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Pedido " + (order.id||"") + "</title>" + css + "</head><body>" + body + "</body></html>";
  var w = window.open("", "_blank", "width=900,height=700");
  if (w) { w.document.write(html); w.document.close(); }
};

const EmitNfeModal = ({ order, onClose, onIssued, params, customers = [] }) => {
  // Busca o cliente vinculado ao pedido pra puxar o CPF/CNPJ e o prazo de
  // pagamento já cadastrados, em vez de exigir digitação manual toda vez.
  const custCadastrado = customers.find(c => c.name === order.customer);
  const [cpfCnpj, setCpfCnpj] = useState(order.cpfCnpj || custCadastrado?.cpfCnpj || "");
  const [nfEmissionDate, setNfEmissionDate] = useState(order.nfEmissionDate || today());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const temProvedor = !!params?.fiscal?.provider;

  // Vencimento = emissão da NF + prazo de pagamento do cliente (mesma lógica
  // usada na baixa de pedido de compra, com o prazo do fornecedor).
  const diasPrazo = parseInt(custCadastrado?.paymentTerms) || 0;
  const dueDateCalculada = nfEmissionDate ? addDaysISO(nfEmissionDate, diasPrazo) : "";

  const handleEmit = async () => {
    setErr("");
    const digits = String(cpfCnpj).replace(/\D/g,"");
    if (digits.length !== 11 && digits.length !== 14) { setErr("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido"); return; }
    setLoading(true);
    try {
      const token = getSession()?.token;
      const r = await fetch("/api/nfe-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify({ order: { ...order, cpfCnpj: digits, nfEmissionDate }, ref: `${order.id}-${Date.now()}` }),
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok || !data.ok) {
        setErr(data.error || "Erro ao emitir a nota fiscal");
        if (data.detalhes) setErr(prev => prev + " — " + data.detalhes.map(d=>d.mensagem).join("; "));
        setLoading(false);
        return;
      }
      setResult(data);
      onIssued({
        cpfCnpj: digits,
        nfNumero: data.numero || "",
        nfeStatus: data.status,
        nfeChave: data.chave || "",
        nfeXmlUrl: data.xmlUrl || "",
        nfePdfUrl: data.pdfUrl || "",
        nfEmissionDate,
        dueDate: dueDateCalculada,
      });
    } catch(e) { setErr("Erro: "+e.message); }
    setLoading(false);
  };

  // Simulação: preenche os campos de NF-e com dados fictícios, sem chamar a API
  // real nem exigir provedor fiscal configurado — só pra visualizar como fica
  // a informação de faturamento no pedido.
  const handleSimular = () => {
    const digits = String(cpfCnpj).replace(/\D/g,"");
    if (digits.length !== 11 && digits.length !== 14) { setErr("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido"); return; }
    setErr("");
    const numeroSimulado = String(Math.floor(100000 + Math.random()*900000));
    const simData = { status: "simulado", numero: numeroSimulado };
    setResult(simData);
    onIssued({
      cpfCnpj: digits,
      nfNumero: numeroSimulado,
      nfeStatus: "simulado",
      nfeChave: "",
      nfeXmlUrl: "",
      nfePdfUrl: "",
      nfEmissionDate,
      dueDate: dueDateCalculada,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{temProvedor ? "🧾 Emitir Nota Fiscal" : "🧪 Simular Faturamento"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-0.5">
          <p className="font-mono font-bold text-indigo-600 text-xs">{order.id}</p>
          <p className="text-gray-700">{order.customer}</p>
          <p className="font-bold text-gray-900">{fmt(order.total)}</p>
          <p className="text-xs text-gray-400">{(order.itemsList||[]).length} item(ns)</p>
        </div>
        {!temProvedor && !result && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            Nenhum provedor fiscal (Focus NFe / NFe.io) está configurado em Parâmetros, então não é possível emitir uma NF-e real ainda. Isso aqui só simula os campos de faturamento pra visualização — sem validade fiscal.
          </p>
        )}
        {!result && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">CPF ou CNPJ do destinatário</label>
            <input type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={cpfCnpj} onChange={e=>setCpfCnpj(e.target.value)} placeholder="Só números"/>
            {!cpfCnpj && (
              <p className="text-[11px] text-gray-400 mt-1">
                {custCadastrado ? "Esse cliente não tem CPF/CNPJ cadastrado — edite o cadastro em Clientes ou informe aqui manualmente." : "Cliente não encontrado no cadastro — informe o CPF/CNPJ manualmente."}
              </p>
            )}
          </div>
        )}
        {!result && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Data de emissão da NF</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={nfEmissionDate} onChange={e=>setNfEmissionDate(e.target.value)}/>
            <p className="text-[11px] text-gray-400 mt-1">
              {diasPrazo > 0
                ? `Vencimento calculado: ${new Date(dueDateCalculada+"T12:00:00").toLocaleDateString("pt-BR")} (${diasPrazo} dias após a emissão, prazo do cliente)`
                : "Cliente sem prazo de pagamento cadastrado — vencimento vai ficar igual à emissão. Edite em Clientes se for a prazo."}
            </p>
          </div>
        )}
        {err && <p className="text-red-500 text-xs">{err}</p>}
        {result && (
          <div className={`rounded-xl p-3 text-sm space-y-1 border ${result.status==="simulado" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
            <p className="font-semibold">
              {result.status==="simulado" ? "🧪 Faturamento simulado (sem validade fiscal)"
                : result.status==="autorizado" ? "✅ Nota autorizada!"
                : "⏳ Nota em processamento — confirme em alguns minutos no painel do fornecedor"}
            </p>
            {result.numero && <p>Número: {result.numero}</p>}
            {result.pdfUrl && <a href={result.pdfUrl} target="_blank" rel="noreferrer" className="underline block">Ver DANFE (PDF)</a>}
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            {result ? "Fechar" : "Cancelar"}
          </button>
          {!result && temProvedor && (
            <button onClick={handleEmit} disabled={loading}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
              {loading?"Emitindo...":"Emitir"}
            </button>
          )}
          {!result && !temProvedor && (
            <button onClick={handleSimular}
              className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600">
              🧪 Simular
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const OrdersModule = ({ orders, setOrders, customers = [], setCustomers, products = [], setProducts, movements = [], setMovements, finance = [], setFinance, setNfes, representantes = [], formasPagamento = [], params, openOrderId = null, onConsumeOpenOrder, initialStatusFilter = null, onConsumeStatusFilter, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "orders", "incluir");
  const canAlterar = getUserPerm(currentUser, "orders", "alterar");
  const canExcluir = getUserPerm(currentUser, "orders", "excluir");
  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [devolucaoModal, setDevolucaoModal] = useState(null);
  const [cancelNfeConfirm, setCancelNfeConfirm] = useState(null);
  const [emitNfeOrder, setEmitNfeOrder] = useState(null);
  const [filterMode, setFilterMode] = useState("todos"); // mes | personalizado | todos

  // Chegou aqui via "🔗 Ver Pedido" (Contas a Receber) — abre o detalhe direto
  useEffect(() => {
    if (openOrderId) {
      const o = orders.find(x => x.id === openOrderId);
      if (o) setDetailOrder(o);
      if (onConsumeOpenOrder) onConsumeOpenOrder();
    }
  }, [openOrderId]);

  // Chegou aqui via card "A Enviar" (Dashboard) — já abre filtrado
  useEffect(() => {
    if (initialStatusFilter) {
      setFilterStatus(initialStatusFilter);
      if (onConsumeStatusFilter) onConsumeStatusFilter();
    }
  }, [initialStatusFilter]);
  const [period, setPeriod] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const filterByDate = (o) => {
    if (filterMode === "todos") return true;
    if (filterMode === "mes") return o.date.startsWith(period);
    if (filterMode === "personalizado") {
      if (dateFrom && o.date < dateFrom) return false;
      if (dateTo   && o.date > dateTo)   return false;
      return true;
    }
    if (filterMode === "ano") return o.date.startsWith(period.split("-")[0]);
    return true;
  };

  const periodLabel = () => {
    if (filterMode === "todos") return "Todos";
    if (filterMode === "personalizado") return dateFrom||dateTo ? `${dateFrom||"..."} → ${dateTo||"..."}` : "Personalizado";
    if (filterMode === "ano") return period.split("-")[0];
    const [y,m] = period.split("-").map(Number);
    return new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  };

  // No modo "Ano" as setas pulam 12 meses (antes, cada clique andava só 1 mês
  // — pra trocar de ano eram 12 cliques sem o rótulo mudar).
  const stepPeriod = (dir) => {
    const [y,m] = period.split("-").map(Number);
    const step = filterMode === "ano" ? 12 : 1;
    const d = new Date(y, m-1 + dir*step, 1);
    setPeriod(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };
  const prevMonth = () => stepPeriod(-1);
  const nextMonth = () => stepPeriod(1);

  const filtered = orders.filter(o => {
    const matchSearch  = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items.toLowerCase().includes(search.toLowerCase());
    const matchChannel = filterChannel === "Todos" || o.channel === filterChannel;
    const matchStatus  = filterStatus === "Todos" ? true
      : filterStatus === "A_ENVIAR" ? statusToShip(params, o.status)
      : filterStatus === "EM_ABERTO_FAT" ? (!o.nfNumero && o.status !== "Cancelado")
      : filterStatus === "FATURADOS" ? !!o.nfNumero
      : o.status === filterStatus;
    return matchSearch && matchChannel && matchStatus && filterByDate(o);
  }).sort((a, b) => {
    const da = new Date(a.date + "T12:00:00");
    const db = new Date(b.date + "T12:00:00");
    if (db - da !== 0) return db - da;
    // Desempate pelo número do pedido (maior = mais recente)
    return parseInt(b.id.replace(/\D/g,"")) - parseInt(a.id.replace(/\D/g,""));
  });

  const totalValue = filtered.reduce((s, o) => s + o.total, 0);

  // Semântica declarada nos Parâmetros: status customizados com "segura
  // estoque" ligado entram aqui automaticamente.
  const isActiveStatus = (s) => statusHoldsStock(params, s);

  // Quanto estoque este pedido está "segurando" agora, por produto.
  // Pedidos Cancelado/Devolvido não seguram nada (estoque já foi/não foi baixado).
  const computeHeldQtyMap = (order) => {
    const map = {};
    if (!order || !isActiveStatus(order.status)) return map;
    (order.itemsList || []).forEach(it => {
      if (!it._prodId || (it.qty||0) <= 0) return;
      const key = String(it._prodId);
      map[key] = (map[key] || 0) + (it.qty || 0);
    });
    return map;
  };

  // Aplica a diferença (delta>0 baixa estoque, delta<0 devolve) e registra os movimentos.
  const applyStockDelta = (deltaMap, order, reason) => {
    const entries = Object.entries(deltaMap).filter(([,d]) => d !== 0);
    if (!entries.length || !setProducts) return;
    setProducts(prev => prev.map(prod => {
      const d = deltaMap[String(prod.id)];
      if (!d) return prod;
      return { ...prod, stock: Math.max(0, (prod.stock||0) - d) };
    }));
    if (setMovements) {
      setMovements(prev => {
        const nums = prev.map(m => parseInt(m.id.replace("MOV-",""))||0);
        let base = Math.max(0, ...nums, 0);
        const novasMovs = entries.map(([prodId, d]) => {
          base += 1;
          return {
            id: `MOV-${String(base).padStart(3,"0")}`,
            productId: prodId,
            type: d > 0 ? "saida" : "entrada",
            qty: Math.abs(d),
            date: today(),
            reason,
            notes: `${reason} — Pedido ${order.id} · ${order.customer||""}`.trim(),
          };
        });
        return [...prev, ...novasMovs];
      });
    }
  };

  const handleSave = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    const orderId = data.id || nextId(orders);
    const savedOrder = data.id ? data : { ...data, id: orderId };
    const oldOrder = data.id ? orders.find(o => o.id === data.id) : null;

    if (data.id) {
      setOrders(prev => prev.map(o => o.id === data.id ? data : o));
    } else {
      setOrders(prev => [savedOrder, ...prev]);
    }

    // Ativar cliente automaticamente quando tiver pedido
    if (data.customer && setCustomers && data.status !== "Cancelado") {
      setCustomers(prev => prev.map(c =>
        c.name?.toLowerCase() === data.customer?.toLowerCase() && c.segment === "Inativo"
          ? { ...c, segment: "Ativo" }
          : c
      ));
    }

    // Reconcilia o estoque comparando o que esse pedido segurava ANTES
    // (na versão salva) com o que ele segura DEPOIS (na versão nova) — cobre
    // criação, mudança de quantidade, troca de produto no item e mudança de
    // status (Cancelado/Devolvido <-> ativo), tudo no mesmo cálculo.
    if (setProducts) {
      const oldHeld = computeHeldQtyMap(oldOrder);
      const newHeld = computeHeldQtyMap(savedOrder);
      const deltaMap = {};
      new Set([...Object.keys(oldHeld), ...Object.keys(newHeld)]).forEach(prodId => {
        const d = (newHeld[prodId]||0) - (oldHeld[prodId]||0);
        if (d !== 0) deltaMap[prodId] = d;
      });
      if (Object.keys(deltaMap).length > 0) {
        applyStockDelta(deltaMap, savedOrder, oldOrder ? "Edição de pedido" : "Venda");
      }
    }

    setModal(null);
  };

  // Helpers de estoque reaproveitados pelo cancelamento e pela reativação de pedidos
  const restoreStockForOrder = (order, reason) => {
    const items = order.itemsList || [];
    if (!items.length || !setProducts) return;
    setProducts(prev => prev.map(prod => {
      const it = items.find(i => String(i._prodId) === String(prod.id));
      if (!it || (it.qty||0) <= 0) return prod;
      return { ...prod, stock: (prod.stock || 0) + (it.qty || 0) };
    }));
    if (setMovements) {
      setMovements(prev => {
        const nums = prev.map(m => parseInt(m.id.replace("MOV-",""))||0);
        const base = Math.max(0, ...nums, 0);
        const novasMovs = items.filter(i => i._prodId && (i.qty||0) > 0).map((i, idx) => ({
          id: `MOV-${String(base+idx+1).padStart(3,"0")}`,
          productId: i._prodId,
          type: "entrada",
          qty: i.qty || 0,
          date: today(),
          reason,
          notes: `${reason} — Pedido ${order.id} · ${order.customer||""}`.trim(),
        }));
        return [...prev, ...novasMovs];
      });
    }
  };

  const deductStockForOrder = (order, reason) => {
    const items = order.itemsList || [];
    if (!items.length || !setProducts) return;
    setProducts(prev => prev.map(prod => {
      const it = items.find(i => String(i._prodId) === String(prod.id));
      if (!it) return prod;
      return { ...prod, stock: Math.max(0, (prod.stock||0) - (it.qty||0)) };
    }));
    if (setMovements) {
      setMovements(prev => {
        const nums = prev.map(m => parseInt(m.id.replace("MOV-",""))||0);
        const base = Math.max(0, ...nums, 0);
        const novasMovs = items.filter(i => i._prodId && (i.qty||0) > 0).map((i, idx) => ({
          id: `MOV-${String(base+idx+1).padStart(3,"0")}`,
          productId: i._prodId,
          type: "saida",
          qty: i.qty || 0,
          date: today(),
          reason,
          notes: `${reason} — Pedido ${order.id} · ${order.customer||""}`.trim(),
        }));
        return [...prev, ...novasMovs];
      });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    if (!canAlterar) return; // segurança extra, além do StatusDropdown já escondido
    const order = orders.find(o => o.id === id);
    if (!order || order.status === newStatus) return;

    const wasActive    = isActiveStatus(order.status);
    const willBeActive = isActiveStatus(newStatus);

    // Selecionar "Devolvido" direto no menu de status passa a usar o MESMO
    // fluxo do botão "↩ Devolver" (restaura estoque + cria lançamento
    // financeiro), em vez de só trocar o texto do status sem efeito nenhum.
    if (newStatus === "Devolvido") {
      if (wasActive) { setDevolucaoModal(order); return; }
      // Já não estava ativo (ex: já era Cancelado) — não tem estoque pra
      // restaurar de novo, só atualiza o status.
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      return;
    }

    // Cancelar um pedido que já tinha baixado estoque -> devolve as unidades.
    if (wasActive && newStatus === "Cancelado") {
      restoreStockForOrder(order, "Cancelamento de pedido");
    }
    // Reativar um pedido que estava Cancelado/Devolvido -> baixa o estoque de novo.
    else if (!wasActive && willBeActive) {
      deductStockForOrder(order, "Reativação de pedido");
    }

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDelete = (id) => {
    if (!canExcluir) return; // segurança extra, além do botão já escondido
    // Excluir um pedido ATIVO (que baixou estoque) devolve as unidades, igual
    // ao cancelamento — antes, excluir em vez de cancelar sumia com o estoque
    // silenciosamente, sem movimento de entrada.
    const order = orders.find(o => o.id === id);
    if (order && isActiveStatus(order.status)) {
      restoreStockForOrder(order, "Exclusão de pedido");
    }
    setOrders(prev => prev.filter(o => o.id !== id));
    setConfirmDelete(null);
    if (detailOrder?.id === id) setDetailOrder(null);
  };

  const handleDevolucao = (order) => {
    // 1. Criar lançamento financeiro de devolução — feito primeiro e isolado
    //    em try/catch, pra garantir que ele seja criado mesmo se algo falhar
    //    nas etapas de estoque mais abaixo.
    // Lançamento de reembolso SÓ quando o pedido já tinha sido pago — devolver
    // um pedido nunca recebido não gera estorno de dinheiro que nunca entrou.
    if (setFinance && order.paidDate) {
      try {
        setFinance(prev => {
          const nums = prev.map(t => parseInt((t.id||"").replace("FIN-",""))||0);
          const newId = `FIN-${String(Math.max(0,...nums,0)+1).padStart(3,"0")}`;
          return [{
            id: newId,
            type: "despesa",
            category: "Devoluções / Reembolsos",
            description: `Devolução pedido ${order.id} — ${order.customer}`,
            amount: order.pagoComAtraso ? (order.valorRecebido ?? order.total) : order.total,
            date: today(),
            dueDate: today(),
            status: "pendente",
            notes: `Estorno do pedido ${order.id} (${order.channel})`,
          }, ...prev];
        });
      } catch (e) {
        console.error("Erro ao criar lançamento financeiro da devolução:", e);
        alert("Não foi possível criar o lançamento financeiro dessa devolução automaticamente. O pedido será marcado como Devolvido normalmente — registre o lançamento manualmente em Financeiro > Contas a Pagar.");
      }
    }

    // 2. Marcar pedido como Devolvido
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "Devolvido" } : o));

    // 3. Restaurar estoque dos itens
    try {
      const items = order.itemsList || [];
      if (items.length > 0 && setProducts) {
        setProducts(prev => prev.map(prod => {
          const it = items.find(i => String(i._prodId) === String(prod.id));
          if (!it || (it.qty||0) <= 0) return prod;
          return { ...prod, stock: (prod.stock || 0) + (it.qty || 0) };
        }));
        if (setMovements) {
          setMovements(prev => {
            const nums = prev.map(m => parseInt((m.id||"").replace("MOV-",""))||0);
            const base = Math.max(0, ...nums, 0);
            const novasMovs = items.filter(i => i._prodId && (i.qty||0) > 0).map((i, idx) => ({
              id: `MOV-${String(base+idx+1).padStart(3,"0")}`,
              productId: i._prodId,
              type: "entrada",
              qty: i.qty || 0,
              date: today(),
              reason: "Devolução de cliente",
              notes: `Devolução do pedido ${order.id} — ${order.customer}`,
            }));
            return [...prev, ...novasMovs];
          });
        }
      }
    } catch (e) {
      console.error("Erro ao restaurar estoque da devolução:", e);
      alert("O pedido foi marcado como Devolvido e o lançamento financeiro foi criado, mas houve um problema ao restaurar o estoque. Confira manualmente em Estoque.");
    }

    setDevolucaoModal(null);
  };

  // Stats — a lista completa inclui os status customizados dos Parâmetros;
  // antes, pedido em status customizado ficava invisível nos contadores.
  const allStatuses = params?.vendas?.statusList?.length
    ? [...new Set([...ORDER_STATUSES, ...params.vendas.statusList])]
    : ORDER_STATUSES;
  const stats = allStatuses.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pedidos e Vendas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} pedidos no total</p>
        </div>
        {canIncluir && (
          <button onClick={() => setModal("new")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Icon name="plus" size={16} />
            Novo Pedido
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className={`grid grid-cols-3 gap-2 ${allStatuses.length>6?"sm:grid-cols-4 lg:grid-cols-8":"sm:grid-cols-6"}`}>
        {allStatuses.map(s => {
          const st = STATUS_STYLES[s] || { bg:"bg-slate-100", text:"text-slate-700" };
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "Todos" : s)}
              className={`rounded-xl p-2.5 text-center border transition-all ${filterStatus === s ? `${st.bg} border-transparent` : "bg-white border-gray-100 hover:border-gray-200"}`}>
              <p className={`text-lg font-bold ${filterStatus === s ? st.text : "text-gray-800"}`}>{stats[s]}</p>
              <p className={`text-[11px] mt-0.5 ${filterStatus === s ? st.text : "text-gray-500"}`}>{s}</p>
            </button>
          );
        })}
      </div>

      {["A_ENVIAR","EM_ABERTO_FAT","FATURADOS"].includes(filterStatus) && (
        <div className={`flex items-center justify-between border rounded-xl px-4 py-2.5 ${
          filterStatus==="A_ENVIAR" ? "bg-purple-50 border-purple-200" :
          filterStatus==="EM_ABERTO_FAT" ? "bg-gray-50 border-gray-200" :
          "bg-emerald-50 border-emerald-200"}`}>
          <p className={`text-sm font-medium ${
            filterStatus==="A_ENVIAR" ? "text-purple-700" :
            filterStatus==="EM_ABERTO_FAT" ? "text-gray-700" :
            "text-emerald-700"}`}>
            {filterStatus==="A_ENVIAR" && "📦 Filtro: pedidos a enviar (Novo + Em Separação)"}
            {filterStatus==="EM_ABERTO_FAT" && "📂 Filtro: pedidos ainda não faturados"}
            {filterStatus==="FATURADOS" && "🧾 Filtro: pedidos já faturados (com NF)"}
          </p>
          <button onClick={()=>setFilterStatus("Todos")} className={`text-xs font-semibold ${
            filterStatus==="A_ENVIAR" ? "text-purple-500 hover:text-purple-700" :
            filterStatus==="EM_ABERTO_FAT" ? "text-gray-500 hover:text-gray-700" :
            "text-emerald-500 hover:text-emerald-700"}`}>✕ Limpar</button>
        </div>
      )}

      {/* Date filter */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex gap-1 flex-wrap">
          {[["todos","Todos"],["mes","Mês"],["ano","Ano"],["personalizado","Personalizado"]].map(([id,label])=>(
            <button key={id} onClick={()=>setFilterMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode===id?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {label}
            </button>
          ))}
        </div>
        {(filterMode==="mes"||filterMode==="ano") && (
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize min-w-[150px] text-center">{periodLabel()}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <span className="text-xs text-gray-400">{filtered.length} pedido{filtered.length!==1?"s":""}</span>
          </div>
        )}
        {filterMode==="personalizado" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">De:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Até:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
            </div>
            {(dateFrom||dateTo) && (
              <button onClick={()=>{setDateFrom("");setDateTo("");}} className="text-xs text-red-400 hover:text-red-600 font-medium">Limpar</button>
            )}
            <span className="text-xs text-gray-400">{filtered.length} pedido{filtered.length!==1?"s":""}</span>
          </div>
        )}
      </div>

      {/* Search + Channel Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Buscar pedido, cliente, item..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
          <option>Todos</option>
          {CHANNELS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
          <span className="text-indigo-700 font-medium">{filtered.length} pedido{filtered.length !== 1 ? "s" : ""} exibido{filtered.length !== 1 ? "s" : ""}</span>
          <span className="text-indigo-900 font-bold">{fmt(totalValue)}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Icon name="orders" size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <>
          {/* Visão mobile: cards (tabela com rolagem lateral é ruim no celular) */}
          <div className="md:hidden divide-y divide-gray-50">
            {filtered.map(order => (
              <div key={order.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button onClick={() => setDetailOrder(order)} className="text-indigo-600 font-mono text-xs font-semibold hover:underline">{order.id}</button>
                    <p className="text-gray-800 font-medium text-sm truncate">{order.customer}</p>
                    <p className="text-gray-400 text-xs truncate">{order.items}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900 text-sm">{fmt(order.total)}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {canAlterar ? (
                    <StatusDropdown order={order} onChange={(s) => handleStatusChange(order.id, s)} statusOptions={params?.vendas?.statusList?.length ? params.vendas.statusList : ORDER_STATUSES} />
                  ) : (
                    <Badge label={order.status} style={STATUS_STYLES[order.status]} />
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    {canAlterar && (
                      <button onClick={() => setModal(order)} className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Icon name="edit" size={15} />
                      </button>
                    )}
                    {canExcluir && (
                      <button onClick={() => setConfirmDelete(order)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Visão desktop: tabela */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pedido</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Canal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <button onClick={() => setDetailOrder(order)} className="text-indigo-600 font-mono text-xs font-semibold hover:underline">{order.id}</button>
                      <p className="text-gray-400 text-xs mt-0.5">{order.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800 font-medium">{order.customer}</p>
                      <p className="text-gray-400 text-xs truncate max-w-[160px]">{order.items}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge label={order.channel} style={CHANNEL_STYLES[order.channel] || { bg: "bg-gray-100", text: "text-gray-600" }} />
                    </td>
                    <td className="px-4 py-3">
                      {canAlterar ? (
                        <StatusDropdown order={order} onChange={(s) => handleStatusChange(order.id, s)} statusOptions={params?.vendas?.statusList?.length ? params.vendas.statusList : ORDER_STATUSES} />
                      ) : (
                        <Badge label={order.status} style={STATUS_STYLES[order.status]} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900">{fmt(order.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {canAlterar && (
                          <button onClick={() => setModal(order)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <Icon name="edit" size={14} />
                          </button>
                        )}
                        {canExcluir && (
                          <button onClick={() => setConfirmDelete(order)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Icon name="trash" size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Detail Panel */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <span className="font-mono text-sm text-indigo-600 font-semibold">{detailOrder.id}</span>
                <h2 className="font-semibold text-gray-900 mt-0.5">{detailOrder.customer}</h2>
              </div>
              <button onClick={() => setDetailOrder(null)} className="text-gray-400 hover:text-gray-600">
                <Icon name="x" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Canal</span><Badge label={detailOrder.channel} style={CHANNEL_STYLES[detailOrder.channel] || { bg: "bg-gray-100", text: "text-gray-600" }} /></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge label={detailOrder.status} style={STATUS_STYLES[detailOrder.status]} /></div>
              <div className="flex justify-between"><span className="text-gray-500">Data</span><span className="font-medium">{detailOrder.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pagamento</span><span className="font-medium">{detailOrder.payment}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-green-600 text-base">{fmt(detailOrder.total)}</span></div>
              {detailOrder.tracking && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Rastreio</span>
                  <a href={`https://rastreamento.correios.com.br/app/index.php?objetos=${detailOrder.tracking}`}
                     target="_blank" rel="noopener noreferrer"
                     className="font-mono text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors border border-blue-100">
                    📦 {detailOrder.tracking} ↗
                  </a>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-gray-500 text-xs mb-1">Itens</p>
                <p className="text-gray-800">{detailOrder.items}</p>
              </div>
              {detailOrder.notes && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Observações</p>
                  <p className="text-gray-600 italic">{detailOrder.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100 flex-wrap">
              {canAlterar && (
                <button onClick={() => { setModal(detailOrder); setDetailOrder(null); }}
                  className="flex-1 min-w-[90px] px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Icon name="edit" size={14} /> Editar
                </button>
              )}
              <button onClick={() => gerarPedidoPDF(detailOrder)}
                className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 flex items-center gap-1.5">
                🖨️ PDF
              </button>
              {canAlterar && (
                <button onClick={() => { setEmitNfeOrder(detailOrder); setDetailOrder(null); }}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-1.5 ${params?.fiscal?.provider ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                  🧾 {detailOrder.nfNumero ? `NF-e ${detailOrder.nfNumero}` : (params?.fiscal?.provider ? "Emitir NF-e" : "Faturar (simular)")}
                </button>
              )}
              {canAlterar && detailOrder.nfNumero && (
                <button onClick={() => { setCancelNfeConfirm(detailOrder); setDetailOrder(null); }}
                  className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 flex items-center gap-1.5">
                  ❌ Cancelar NF
                </button>
              )}
              {canAlterar && ["Enviado","Entregue"].includes(detailOrder.status) && (
                <button onClick={() => { setDevolucaoModal(detailOrder); setDetailOrder(null); }}
                  className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 flex items-center gap-1.5">
                  ↩ Devolver
                </button>
              )}
              <button onClick={() => setDetailOrder(null)}
                className="flex-1 min-w-[70px] px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devolução Modal */}
      {devolucaoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">↩</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-1">Registrar Devolução?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">{devolucaoModal.id} — {devolucaoModal.customer}</p>
            <p className="text-lg font-bold text-rose-600 text-center mb-4">{fmt(devolucaoModal.total)}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800 space-y-1.5">
              <p>✅ Status do pedido → <b>Devolvido</b></p>
              {(devolucaoModal.itemsList||[]).filter(i=>i._prodId&&i.qty>0).length > 0 && (
                <p>✅ Estoque será <b>restaurado</b> ({(devolucaoModal.itemsList||[]).filter(i=>i._prodId&&i.qty>0).length} item(s))</p>
              )}
              {devolucaoModal.paidDate ? (
                <p>✅ Lançamento de <b>Devolução / Reembolso</b> criado em Contas a Pagar</p>
              ) : (
                <p>ℹ️ Sem lançamento financeiro — o pedido ainda <b>não tinha sido pago</b></p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDevolucaoModal(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleDevolucao(devolucaoModal)}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600">
                Confirmar Devolução
              </button>
            </div>
          </div>
        </div>
      )}

      {emitNfeOrder && (
        <EmitNfeModal order={emitNfeOrder} onClose={()=>setEmitNfeOrder(null)} params={params} customers={customers}
          onIssued={(updated)=>{
            setOrders(prev => prev.map(o => o.id===emitNfeOrder.id ? {...o, ...updated} : o));
            // NF-e emitida pelo sistema entra automaticamente no painel Fiscal
            registrarNfeFiscal(setNfes, {
              order: emitNfeOrder, tipo: "NF-e",
              numero: updated.nfNumero, chave: updated.nfeChave,
              status: updated.nfeStatus, dataEmissao: updated.nfEmissionDate,
              cpfCnpj: updated.cpfCnpj,
            });
            setEmitNfeOrder(null);
          }}/>
      )}

      {/* Cancelar NF-e/faturamento */}
      {cancelNfeConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <p className="text-2xl mb-2">❌</p>
            <h3 className="font-bold text-gray-900 mb-1">Cancelar faturamento?</h3>
            <p className="text-sm text-gray-500 mb-2">
              NF-e {cancelNfeConfirm.nfNumero} do pedido {cancelNfeConfirm.id} será desvinculada, e você poderá faturar de novo.
            </p>
            {cancelNfeConfirm.nfeStatus === "simulado" ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                Essa é uma NF-e simulada — cancelar aqui é seguro, não tem nenhuma nota fiscal real envolvida.
              </p>
            ) : (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                ⚠️ Isso só limpa o registro aqui no MM ERP — não cancela a nota de verdade na Receita/SEFAZ. Se essa NF-e foi emitida de fato, cancele-a também no painel do Focus NFe/NFe.io, com uma justificativa (mínimo 15 caracteres).
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={()=>setCancelNfeConfirm(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm">Voltar</button>
              <button onClick={()=>{
                setOrders(prev => prev.map(o => o.id===cancelNfeConfirm.id ? {...o, nfNumero:"", nfeStatus:"", nfeChave:"", nfeXmlUrl:"", nfePdfUrl:""} : o));
                setCancelNfeConfirm(null);
              }} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium">Cancelar NF</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Icon name="trash" size={22} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Excluir pedido?</h3>
            <p className="text-sm text-gray-500 mb-2">{confirmDelete.id} — {confirmDelete.customer}</p>
            {isActiveStatus(confirmDelete.status) && (confirmDelete.itemsList||[]).some(i=>i._prodId&&(i.qty||0)>0) && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">↩ O estoque dos itens será restaurado automaticamente</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <OrderModal
          order={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          customers={customers}
          products={products}
          representantes={representantes}
          formasPagamento={formasPagamento}
          params={params}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

// ─── Dashboard Module ─────────────────────────────────────────────────────
const DashboardModule = ({ orders, finance = [], params, setActive, onGoToAEnviar, onGoToEmAberto, onGoToFaturados }) => {
  // Mesma base do gráfico de Produtos Mais Vendidos: pedidos cancelados e
  // devolvidos ficam de fora, pra os dois painéis contarem a mesma coisa.
  const ordersValidos = orders.filter(o => o.status !== "Cancelado" && o.status !== "Devolvido");
  const countByChannel = CHANNELS.reduce((acc, c) => {
    acc[c] = ordersValidos.filter(o => o.channel === c).length;
    return acc;
  }, {});

  // ── 1) Pedidos em Aberto / Faturados / A Enviar ──────────────────────────
  const pedidosEmAberto  = orders.filter(o => !o.nfNumero && o.status !== "Cancelado").length;
  const pedidosFaturados = orders.filter(o => !!o.nfNumero).length;
  const pedidosAEnviar   = orders.filter(o => statusToShip(params, o.status)).length;

  // ── 2) Prévia Contas a Receber (mesmo critério da aba Contas a Receber:
  //      só pedidos já faturados e não pagos) ──────────────────────────────
  const todayISO = today();
  const recPend = orders.filter(o => o.status !== "Cancelado" && !!o.nfNumero && !o.paidDate);
  const totalReceber = recPend.reduce((s,o)=>s+o.total,0);
  const recVencidos = recPend.filter(o => o.dueDate && o.dueDate < todayISO);
  const totalReceberVencido = recVencidos.reduce((s,o)=>s+o.total,0);

  // ── 3) Prévia Contas a Pagar — vencendo hoje + vencidos ──────────────────
  // Mesmo critério da aba Contas a Pagar: lançamento sem vencimento usa a
  // própria data do lançamento como vencimento (dueDate || date).
  const pagVencendoHoje = (finance||[]).filter(f =>
    f.type === "despesa" && f.status !== "pago" && f.status !== "cancelado" && (f.dueDate || f.date) === todayISO
  );
  const totalPagarHoje = pagVencendoHoje.reduce((s,f)=>s+(f.amount||0),0);
  const pagVencidos = (finance||[]).filter(f =>
    f.type === "despesa" && f.status !== "pago" && f.status !== "cancelado" && (f.dueDate || f.date) < todayISO
  );
  const totalPagarVencido = pagVencidos.reduce((s,f)=>s+(f.amount||0),0);

  // ── Produtos mais vendidos (por quantidade, exclui Cancelado/Devolvido) ──
  const PIE_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#94a3b8"];
  const topProducts = (() => {
    const qtyByName = {};
    orders.forEach(o => {
      if (o.status === "Cancelado" || o.status === "Devolvido") return;
      (o.itemsList||[]).forEach(it => {
        const name = it.description || it.sku || "Sem nome";
        qtyByName[name] = (qtyByName[name]||0) + (Number(it.qty)||0);
      });
    });
    const sorted = Object.entries(qtyByName).sort((a,b)=>b[1]-a[1]).filter(([,q])=>q>0);
    const top = sorted.slice(0,6).map(([name,qty])=>({name,qty}));
    const restoQty = sorted.slice(6).reduce((s,[,q])=>s+q,0);
    if (restoQty > 0) top.push({name:"Outros", qty:restoQty});
    return top;
  })();

  // ── Shipping deadline logic ──────────────────────────────────────────────
  const SHIP_SLA = { "Mercado Livre":3, "Shopee":2, "WhatsApp":2, "Loja Própria":3 };
  const DEFAULT_DIAS_DESPACHO = [1,2,3,4,5]; // seg-sex

  function addBizDays(dateStr, days, diasValidos) {
    const d = new Date(dateStr + "T12:00:00");
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (diasValidos.includes(d.getDay())) added++;
    }
    return d;
  }

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const pendingOrders = orders
    .filter(o => statusToShip(params, o.status))
    .map(o => {
      const sla         = params?.canais?.[o.channel]?.sla ?? SHIP_SLA[o.channel] ?? 3;
      const diasValidos = params?.canais?.[o.channel]?.diasDespacho ?? DEFAULT_DIAS_DESPACHO;
      const deadline = addBizDays(o.date, sla, diasValidos);
      const diffDays = Math.floor((deadline - todayDate) / 86400000);
      const deadlineStr = deadline.toLocaleDateString("pt-BR", { weekday:"short", day:"2-digit", month:"2-digit" });
      let urgency = "ok";
      if (diffDays < 0)       urgency = "vencido";
      else if (diffDays === 0) urgency = "hoje";
      else if (diffDays === 1) urgency = "amanha";
      return { ...o, deadline, deadlineStr, diffDays, urgency, sla };
    })
    .sort((a, b) => a.deadline - b.deadline);

  const urgencyCounts = {
    vencido: pendingOrders.filter(o => o.urgency === "vencido").length,
    hoje:    pendingOrders.filter(o => o.urgency === "hoje").length,
    amanha:  pendingOrders.filter(o => o.urgency === "amanha").length,
    ok:      pendingOrders.filter(o => o.urgency === "ok").length,
  };

  const urgencyStyle = {
    vencido: { bg:"bg-red-100",    text:"text-red-700",    bar:"bg-red-500",    icon:"🔴", label:"Vencido"  },
    hoje:    { bg:"bg-amber-100",  text:"text-amber-700",  bar:"bg-amber-500",  icon:"🟡", label:"Hoje"     },
    amanha:  { bg:"bg-yellow-50",  text:"text-yellow-700", bar:"bg-yellow-400", icon:"🟠", label:"Amanhã"   },
    ok:      { bg:"bg-green-50",   text:"text-green-700",  bar:"bg-green-500",  icon:"🟢", label:"Em dia"   },
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral</p>
      </div>

      {/* ── 1) Pedidos em Aberto / Faturados / A Enviar ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={onGoToEmAberto} className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-gray-300 transition-colors">
          <p className="text-xs text-gray-400 font-medium">📂 Pedidos em Aberto</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{pedidosEmAberto}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">ainda não faturados</p>
        </button>
        <button onClick={onGoToFaturados} className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-emerald-200 transition-colors">
          <p className="text-xs text-gray-400 font-medium">🧾 Pedidos Faturados</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{pedidosFaturados}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">com NF emitida</p>
        </button>
        <button onClick={onGoToAEnviar} className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-purple-200 transition-colors">
          <p className="text-xs text-gray-400 font-medium">📦 Pedidos a Enviar</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{pedidosAEnviar}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Novo + Em Separação</p>
        </button>
      </div>

      {/* ── Shipping Deadlines Panel ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
          <div>
            <h3 className="font-bold text-gray-800 text-sm">📬 Prazos de Postagem</h3>
            <p className="text-xs text-gray-400 mt-0.5">Pedidos Novo / Em Separação com prazo limite de envio</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(urgencyCounts).filter(([,v])=>v>0).map(([k,v])=>(
              <span key={k} className={`text-xs font-bold px-2.5 py-1 rounded-full ${urgencyStyle[k].bg} ${urgencyStyle[k].text}`}>
                {urgencyStyle[k].icon} {v}
              </span>
            ))}
            {pendingOrders.length === 0 && (
              <span className="text-xs text-gray-400">Nenhum pedido pendente</span>
            )}
          </div>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            ✅ Nenhum pedido aguardando postagem
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingOrders.map(o => {
              const u = urgencyStyle[o.urgency];
              const diffLabel =
                o.urgency === "vencido" ? `Atrasado ${Math.abs(o.diffDays)}d` :
                o.urgency === "hoje"    ? "POSTAR HOJE" :
                o.urgency === "amanha"  ? "Postar amanhã" :
                `${o.diffDays}d restantes`;
              return (
                <div key={o.id} className={`flex items-center gap-3 px-5 py-3 ${o.urgency==="vencido"?"bg-red-50/40":o.urgency==="hoje"?"bg-amber-50/40":""}`}>
                  {/* Urgency indicator */}
                  <div className={`w-1.5 h-10 rounded-full shrink-0 ${u.bar}`}/>

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-600">{o.id}</span>
                      <span className="text-sm font-medium text-gray-800 truncate">{o.customer}</span>
                      <Badge label={o.channel} style={CHANNEL_STYLES[o.channel]||{bg:"bg-gray-100",text:"text-gray-600"}}/>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{o.items}</p>
                  </div>

                  {/* Deadline */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">Limite</p>
                    <p className="text-sm font-bold text-gray-800 capitalize">{o.deadlineStr}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.bg} ${u.text}`}>
                      {u.icon} {diffLabel}
                    </span>
                  </div>

                  {/* Status badge */}
                  <Badge label={o.status} style={STATUS_STYLES[o.status]}/>
                </div>
              );
            })}
          </div>
        )}

        {pendingOrders.length > 0 && (
          <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">
              SLA (Parâmetros → Canais): {CHANNELS.map(c => `${c} = ${params?.canais?.[c]?.sla ?? SHIP_SLA[c] ?? 3}d`).join(" · ")} · Dias úteis, fins de semana não contam
            </p>
          </div>
        )}
      </div>

      {/* ── 2) e 3) Prévia Contas a Receber / Contas a Pagar (vencendo hoje) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={()=>setActive && setActive("receber")}
          className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-green-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">💰 Contas a Receber</p>
            <span className="text-[10px] text-indigo-500 font-medium">Ver tudo →</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-gray-400">Total pendente</p>
              <p className="text-xl font-bold text-green-700">{fmt(totalReceber)}</p>
              <p className="text-[10px] text-gray-400">{recPend.length} pedido{recPend.length!==1?"s":""}</p>
            </div>
            <div className={`rounded-xl px-2.5 py-1.5 ${recVencidos.length>0?"bg-red-50":"bg-gray-50"}`}>
              <p className={`text-[11px] ${recVencidos.length>0?"text-red-600":"text-gray-400"}`}>🔴 Vencido</p>
              <p className={`text-xl font-bold ${recVencidos.length>0?"text-red-600":"text-gray-400"}`}>{fmt(totalReceberVencido)}</p>
              <p className={`text-[10px] ${recVencidos.length>0?"text-red-500":"text-gray-400"}`}>{recVencidos.length} pedido{recVencidos.length!==1?"s":""}</p>
            </div>
          </div>
        </button>
        <button onClick={()=>setActive && setActive("pagar")}
          className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-red-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">💸 Contas a Pagar</p>
            <span className="text-[10px] text-indigo-500 font-medium">Ver tudo →</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl px-2.5 py-1.5 ${pagVencendoHoje.length>0?"bg-amber-50":"bg-gray-50"}`}>
              <p className={`text-[11px] ${pagVencendoHoje.length>0?"text-amber-700":"text-gray-400"}`}>🟡 Vencendo hoje</p>
              <p className={`text-xl font-bold ${pagVencendoHoje.length>0?"text-amber-700":"text-gray-400"}`}>{fmt(totalPagarHoje)}</p>
              <p className={`text-[10px] ${pagVencendoHoje.length>0?"text-amber-600":"text-gray-400"}`}>{pagVencendoHoje.length} lançamento{pagVencendoHoje.length!==1?"s":""}</p>
            </div>
            <div className={`rounded-xl px-2.5 py-1.5 ${pagVencidos.length>0?"bg-red-50":"bg-gray-50"}`}>
              <p className={`text-[11px] ${pagVencidos.length>0?"text-red-600":"text-gray-400"}`}>🔴 Vencido</p>
              <p className={`text-xl font-bold ${pagVencidos.length>0?"text-red-600":"text-gray-400"}`}>{fmt(totalPagarVencido)}</p>
              <p className={`text-[10px] ${pagVencidos.length>0?"text-red-500":"text-gray-400"}`}>{pagVencidos.length} lançamento{pagVencidos.length!==1?"s":""}</p>
            </div>
          </div>
        </button>
      </div>

      {/* ── Produtos Mais Vendidos + Canais com Mais Venda ──────────────── */}
      {(topProducts.length > 0 || ordersValidos.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topProducts.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">🥧 Produtos Mais Vendidos</h3>
                <p className="text-xs text-gray-400 mb-3">Por quantidade — exclui Cancelados/Devolvidos</p>
                <div className="flex flex-col items-center gap-3">
                  <div style={{ width: "100%", maxWidth: 220, height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={topProducts} dataKey="qty" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                          {topProducts.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value)=>[`${value} un`, "Quantidade"]}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-1.5">
                    {topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}/>
                          <span className="text-gray-700 truncate">{p.name}</span>
                        </div>
                        <span className="font-semibold text-gray-800 shrink-0">{p.qty} un</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">🛒 Pedidos por Canal</h3>
              <p className="text-xs text-gray-400 mb-3">Quantidade de pedidos por canal — exclui Cancelados/Devolvidos</p>
              <div className="space-y-2">
                {CHANNELS.map(c => {
                  const count = countByChannel[c];
                  const pct = ordersValidos.length ? (count / ordersValidos.length) * 100 : 0;
                  const s = CHANNEL_STYLES[c];
                  return (
                    <div key={c} className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full min-w-[90px] text-center ${s.bg} ${s.text}`}>{c}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Finance Transaction Modal ────────────────────────────────────────────
const FinanceModal = ({ tx, onClose, onSave, defaultType = "receita" }) => {
  const isNew = !tx;
  const [form, setForm] = useState(tx || {
    type:defaultType, category:defaultType==="despesa" ? EXPENSE_CATS[0] : "Vendas ML", description:"", amount:"",
    date:today(), dueDate:"", status:"pendente", notes:""
  });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));
  const cats = form.type === "receita" ? INCOME_CATS : EXPENSE_CATS;

  const handleTypeSwitch = (t) => {
    const defaultCat = t === "receita" ? INCOME_CATS[0] : EXPENSE_CATS[0];
    setForm(f => ({ ...f, type:t, category:defaultCat }));
  };

  const handleSave = () => {
    if (!form.description.trim() || !form.amount) return;
    onSave({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{isNew ? "Novo Lançamento" : "Editar Lançamento"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Type toggle */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Tipo</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <button onClick={() => handleTypeSwitch("receita")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type==="receita" ? "bg-green-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                ↑ Receita
              </button>
              <button onClick={() => handleTypeSwitch("despesa")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type==="despesa" ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                ↓ Despesa
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Descrição *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.description} onChange={e => set("description",e.target.value)} placeholder="Ex: Repasse Mercado Livre — Jun" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Categoria</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.category} onChange={e => set("category",e.target.value)}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Valor (R$) *</label>
              <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.amount} onChange={e => set("amount",e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Data</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.date} onChange={e => set("date",e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Vencimento</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.dueDate||""} onChange={e => set("dueDate",e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.status} onChange={e => set("status",e.target.value)}>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Observações</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              rows={2} value={form.notes} onChange={e => set("notes",e.target.value)} placeholder="Notas internas (opcional)" />
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          {!isNew && form.status === "pago" && (
            <button onClick={()=>onSave({...form, amount:parseFloat(form.amount), status:"pendente", paidDate:""})}
              className="px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100">
              ↩ Voltar Pendente
            </button>
          )}
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            {isNew ? "Criar Lançamento" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Custom Tooltip for chart ─────────────────────────────────────────────
const FinTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const r = payload.find(p => p.dataKey === "receitas")?.value || 0;
  const d = payload.find(p => p.dataKey === "despesas")?.value || 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      <p className="text-green-600">Receitas: {fmt(r)}</p>
      <p className="text-red-500">Despesas: {fmt(d)}</p>
      <p className={`font-bold mt-1 ${r-d >= 0 ? "text-indigo-600" : "text-red-600"}`}>Resultado: {fmt(r-d)}</p>
    </div>
  );
};

// ─── Finance Module ───────────────────────────────────────────────────────

// ─── FinPayModal — Registrar Pagamento (Financeiro) ───────────────────────
const FinPayModal = ({ order, onClose, onSave }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [paidDate, setPaidDate] = useState(todayStr);
  const [payment,  setPayment]  = useState(order.payment || "Pix");
  const [markPaid, setMarkPaid] = useState(true);
  const [pagoComAtraso, setPagoComAtraso] = useState(order.urgency==="overdue");
  const cobraEncargos = markPaid && order.urgency==="overdue" && pagoComAtraso;
  const handleSave = () => onSave({
    ...order,
    paidDate: markPaid ? paidDate : "",
    payment,
    status: markPaid ? "Entregue" : order.status,
    pagoComAtraso: markPaid ? cobraEncargos : undefined,
    valorMulta: cobraEncargos ? order.multa : undefined,
    valorJuros: cobraEncargos ? order.juros : undefined,
    valorRecebido: markPaid ? (cobraEncargos ? order.totalComEncargos : order.total) : undefined,
  });
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Registrar Pagamento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm">
          <p className="font-mono font-bold text-indigo-600 text-xs">{order.id}</p>
          <p className="text-gray-600 text-xs mt-0.5 truncate">{order.customer}</p>
          {order.urgency==="overdue" ? (
            <>
              <p className={`text-lg font-bold mt-1 ${cobraEncargos?"text-gray-400 line-through":"text-gray-900"}`}>{fmt(order.total)}</p>
              {cobraEncargos && <p className="font-bold text-red-600 text-lg">{fmt(order.totalComEncargos)}</p>}
              <p className="text-[10px] text-red-400">+{fmt(order.multa)} multa +{fmt(order.juros)} juros ({order.diasAtraso} dia{order.diasAtraso!==1?"s":""} de atraso)</p>
            </>
          ) : (
            <p className="font-bold text-gray-900 text-lg mt-1">{fmt(order.total)}</p>
          )}
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-800">Marcar como pago</p>
            <p className="text-xs text-gray-500 mt-0.5">{markPaid ? "Pedido será marcado como pago" : "Remover pagamento"}</p>
          </div>
          <button onClick={()=>setMarkPaid(v=>!v)}
            className={"w-12 h-6 rounded-full transition-all relative " + (markPaid?"bg-green-500":"bg-gray-300")}>
            <span className={"absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all " + (markPaid?"right-0.5":"left-0.5")}/>
          </button>
        </div>
        {markPaid && order.urgency==="overdue" && (
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-800">Pago com atraso?</p>
              <p className="text-xs text-gray-500 mt-0.5">{pagoComAtraso ? "Cobrando multa + juros" : "Sem cobrar multa/juros"}</p>
            </div>
            <button onClick={()=>setPagoComAtraso(v=>!v)}
              className={"w-12 h-6 rounded-full transition-all relative " + (pagoComAtraso?"bg-red-500":"bg-gray-300")}>
              <span className={"absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all " + (pagoComAtraso?"right-0.5":"left-0.5")}/>
            </button>
          </div>
        )}
        {markPaid && (<>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">✅ Data de Pagamento</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={paidDate} onChange={e=>setPaidDate(e.target.value)}/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">💳 Forma de Pagamento</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={payment} onChange={e=>setPayment(e.target.value)}>
              {PAYMENT_METHODS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
        </>)}
        <div className="flex gap-2 pt-1 flex-wrap">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          {order.paidDate && <button onClick={()=>onSave({...order,paidDate:"",status:order.status==="Entregue"?"Novo":order.status,pagoComAtraso:undefined,valorMulta:undefined,valorJuros:undefined,valorRecebido:undefined})} className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100">↩ Voltar Aberto</button>}
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
            {markPaid ? "✅ Confirmar Pagamento" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── FinPagModal — Registrar Pagamento de Despesa ─────────────────────────
const FinPagModal = ({ item, onClose, onSave }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [paidDate, setPaidDate] = useState(todayStr);
  const [payment,  setPayment]  = useState(item.paymentTerms || "Pix");
  const title = item._type === "lancamento"
    ? (item.description || item.category || "Despesa")
    : (item.supplierName || "Compra");
  const handleSave = () => onSave({ ...item, paidDate, payment, status: paidDate ? "pago" : item.status });
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Registrar Pagamento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm">
          <p className="font-mono font-bold text-indigo-600 text-xs">{item.id}</p>
          <p className="text-gray-600 text-xs mt-0.5 truncate">{title}</p>
          <p className="font-bold text-red-600 text-lg mt-1">{fmt(item.total||item.amount||0)}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">📅 Data de Pagamento</label>
          <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={paidDate} onChange={e=>setPaidDate(e.target.value)}/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">💳 Forma de Pagamento</label>
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={payment} onChange={e=>setPayment(e.target.value)}>
            {PAYMENT_METHODS.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          {(item.paidDate||item.status==="pago") && (
            <button onClick={()=>onSave({...item, paidDate:"", status:"pendente"})} className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100">
              ↩ Voltar Aberto
            </button>
          )}
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
            💸 Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
};

const FinanceModule = ({ finance, setFinance, orders, setOrders, purchases, setPurchases, params, initialTab = "overview", onViewOrder, currentUser }) => {
  // receber e pagar são módulos de permissão separados, mas usam o mesmo
  // componente — a permissão certa depende de qual aba a pessoa está.
  const permModule = initialTab === "pagar" ? "pagar" : "receber";
  const canIncluir = getUserPerm(currentUser, permModule, "incluir");
  const canAlterar = getUserPerm(currentUser, permModule, "alterar");
  const canExcluir = getUserPerm(currentUser, permModule, "excluir");
  const [tab] = useState(initialTab);
  const [modal, setModal]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [payRec, setPayRec]   = useState(null); // order being marked as paid
  const [payPag, setPayPag]   = useState(null); // expense being marked as paid
  const [showPaidRec, setShowPaidRec] = useState(false);
  const [showPaidPag, setShowPaidPag] = useState(false);

  // ── CRUD ──
  const nextFinId = (fin) => {
    const nums = fin.map(t => parseInt(t.id.replace("FIN-","")) || 0);
    return `FIN-${String(Math.max(0,...nums)+1).padStart(3,"0")}`;
  };

  const handleSave = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) {
      setFinance(prev => prev.map(t => t.id === data.id ? data : t));
    } else {
      setFinance(prev => [{ ...data, id: nextFinId(prev) }, ...prev]);
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (!canExcluir) return; // segurança extra, além do botão já escondido
    setFinance(prev => prev.filter(t => t.id !== id));
    setConfirmDelete(null);
  };

  const standalone = initialTab !== "overview";

  return (
    <div className="space-y-4">
      {standalone && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{initialTab === "receber" ? "Contas a Receber" : "Contas a Pagar"}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{initialTab === "receber" ? "Pedidos pendentes de recebimento" : "Despesas e compras pendentes de pagamento"}</p>
          </div>
          {canIncluir && (
            <button onClick={() => setModal("new")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
              <Icon name="plus" size={16}/> Lançamento
            </button>
          )}
        </div>
      )}
      {/* ── TAB: Contas a Receber ── */}
      {tab === "receber" && (() => {
        const today0 = new Date(); today0.setHours(0,0,0,0);
        const diffDays = (a,b) => Math.round((a-b)/86400000);
        const multaPct = params?.vendas?.multaAtrasoPercent ?? 2;
        const jurosPctMes = params?.vendas?.jurosAtrasoPercentMes ?? 1;
        // Só entra em Contas a Receber quem já foi faturado (tem NF emitida
        // ou simulada) — igual ao critério usado em Contas a Pagar, que só
        // considera pedidos de compra já baixados. Um pedido "Novo" ainda
        // não é uma dívida certa do cliente.
        const recItems = (orders||[])
          .filter(o => o.status !== "Cancelado" && !!o.nfNumero && (showPaidRec ? true : !o.paidDate))
          .map(o => {
            const due = o.dueDate ? new Date(o.dueDate+"T12:00:00") : null;
            if (due) due.setHours(0,0,0,0);
            const diff = due ? diffDays(due, today0) : null;
            const urgency = o.paidDate ? "open" : (diff===null?"open":diff<0?"overdue":diff===0?"today":diff<=3?"soon":"open");
            const diasAtraso = (!o.paidDate && urgency==="overdue") ? Math.abs(diff) : 0;
            const multa = diasAtraso>0 ? o.total * (multaPct/100) : 0;
            const juros = diasAtraso>0 ? o.total * (jurosPctMes/100) * (diasAtraso/30) : 0;
            const totalComEncargos = o.total + multa + juros;
            return { ...o, due, diff, urgency, diasAtraso, multa, juros, totalComEncargos };
          })
          .sort((a,b) => ({overdue:0,today:1,soon:2,open:3}[a.urgency]??3)-({overdue:0,today:1,soon:2,open:3}[b.urgency]??3));

        // Cards do topo sempre sobre os PENDENTES — o botão "Ver pagos também"
        // só muda a lista exibida, nunca os totais (senão o "Total a Receber"
        // incluiria dinheiro que já entrou).
        const recPendentes = recItems.filter(o => !o.paidDate);
        const totalRec     = recPendentes.reduce((s,o)=>s+o.total,0);
        const totalOverdue = recPendentes.filter(o=>o.urgency==="overdue").reduce((s,o)=>s+o.totalComEncargos,0);
        const overdueCount = recPendentes.filter(o=>o.urgency==="overdue").length;
        const urg = { overdue:{bg:"bg-red-100",text:"text-red-700",icon:"🔴"},
                      today:  {bg:"bg-amber-100",text:"text-amber-700",icon:"🟡"},
                      soon:   {bg:"bg-yellow-50",text:"text-yellow-700",icon:"🟠"},
                      open:   {bg:"bg-blue-50",text:"text-blue-600",icon:"🔵"} };
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-medium">Total a Receber</p>
                <p className="text-lg font-bold text-green-700 mt-0.5">{fmt(totalRec)}</p>
                <p className="text-xs text-green-500">{recPendentes.length} pedido{recPendentes.length!==1?"s":""}</p>
              </div>
              <div className={`border rounded-xl p-3 text-center ${totalOverdue>0?"bg-red-50 border-red-100":"bg-gray-50 border-gray-100"}`}>
                <p className="text-xs text-gray-500 font-medium">Vencidos (+ multa/juros)</p>
                <p className={`text-lg font-bold mt-0.5 ${totalOverdue>0?"text-red-600":"text-gray-400"}`}>{fmt(totalOverdue)}</p>
                <p className={`text-xs ${totalOverdue>0?"text-red-400":"text-gray-400"}`}>{overdueCount} pedido{overdueCount!==1?"s":""}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-medium">Sem vencimento</p>
                <p className="text-lg font-bold text-gray-400 mt-0.5">{recPendentes.filter(o=>!o.dueDate).length}</p>
                <p className="text-xs text-gray-400">pedido{recPendentes.filter(o=>!o.dueDate).length!==1?"s":""}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={()=>setShowPaidRec(v=>!v)}
                className={"text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors " + (showPaidRec ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100")}>
                {showPaidRec ? "✅ Ocultando pagos" : "👁 Ver pagos também"}
              </button>
            </div>
            {recItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <p className="text-3xl mb-2">✅</p><p className="text-sm text-gray-500">Nenhum recebimento pendente!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {recItems.map(o => {
                  const u = urg[o.urgency];
                  const diffLabel = o.paidDate ? "Pago" : o.diff===null?"Sem vencimento":o.urgency==="overdue"?`Vencido há ${Math.abs(o.diff)}d`:o.urgency==="today"?"VENCE HOJE":`Vence em ${o.diff}d`;
                  return (
                    <div key={o.id} className={`p-4 ${o.urgency==="overdue"?"bg-red-50/30":""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-indigo-600">{o.id}</span>
                            <span className="font-medium text-gray-800 text-sm">{o.customer}</span>
                            <Badge label={o.channel} style={CHANNEL_STYLES[o.channel]||{bg:"bg-gray-100",text:"text-gray-600"}}/>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.bg} ${u.text}`}>{u.icon} {diffLabel}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{o.items}</p>
                          <div className="flex gap-3 mt-1 flex-wrap text-[10px] text-gray-400">
                            <span>📋 Emissão: <strong>{o.date}</strong></span>
                            {o.dueDate && <span>📅 Venc.: <strong>{new Date(o.dueDate+"T12:00:00").toLocaleDateString("pt-BR")}</strong></span>}
                            <span>💳 {o.payment}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          {o.urgency==="overdue" ? (
                            <div className="text-right">
                              <p className="text-xs text-gray-400 line-through">{fmt(o.total)}</p>
                              <p className="font-bold text-red-600 text-base">{fmt(o.totalComEncargos)}</p>
                              <p className="text-[10px] text-red-400">+{fmt(o.multa)} multa +{fmt(o.juros)} juros</p>
                            </div>
                          ) : (
                            <p className="font-bold text-green-700 text-base">{fmt(o.paidDate && o.pagoComAtraso ? (o.valorRecebido??o.total) : o.total)}</p>
                          )}
                          <Badge label={o.status} style={STATUS_STYLES[o.status]}/>
                          {o.paidDate && (
                            <div className="flex flex-col items-end gap-1">
                              {o.pagoComAtraso && <span className="text-[10px] text-red-500 font-semibold">⚠️ Pago com atraso (+multa/juros)</span>}
                              <span className="text-[10px] text-green-600 font-semibold">✅ Pago em {new Date(o.paidDate+"T12:00:00").toLocaleDateString("pt-BR")}</span>
                              {canAlterar && <button onClick={()=>setPayRec(o)} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100">↩ Editar pgto</button>}
                            </div>
                          )}
                          {!o.paidDate && canAlterar && <button onClick={()=>setPayRec(o)}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700">
                            ✅ Pagar
                          </button>}
                          {onViewOrder && (
                            <button onClick={()=>onViewOrder(o.id)}
                              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                              🔗 Ver Pedido
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {payRec && (
              <FinPayModal order={payRec} onClose={()=>setPayRec(null)}
                onSave={(updated)=>{ if(!canAlterar) return; if(setOrders) setOrders(prev=>prev.map(o=>o.id===updated.id?updated:o)); setPayRec(null); }}/>
            )}
          </div>
        );
      })()}

      {/* ── TAB: Contas a Pagar ── */}
      {tab === "pagar" && (() => {
        const today0 = new Date(); today0.setHours(0,0,0,0);
        const diffDays = (a,b) => Math.round((a-b)/86400000);

        // Contas a Pagar reflete SOMENTE lançamentos financeiros reais (finance),
        // que só são criados no momento da baixa efetiva do pedido de compra
        // (handleBaixarPedido), com o valor da quantidade realmente recebida —
        // nunca pedidos "Em Aberto" com o valor total do pedido inteiro.
        const financeItems = (finance||[])
          .filter(t => t.type === "despesa" && t.status !== "cancelado" && (showPaidPag ? true : (t.status !== "pago" && !t.paidDate)))
          .map(t => ({
            ...t,
            _type: "lancamento",
            total: t.amount,
            dueDate: t.dueDate || t.date,
            description: t.description || t.category || "Despesa",
          }));

        const pagItems = [...financeItems]
          .map(p => {
            const due = p.dueDate ? new Date(p.dueDate+"T12:00:00") : null;
            if (due) due.setHours(0,0,0,0);
            const diff = due ? diffDays(due, today0) : null;
            const urgency = diff===null?"open":diff<0?"overdue":diff===0?"today":diff<=3?"soon":"open";
            return { ...p, due, diff, urgency };
          })
          .sort((a,b) => ({overdue:0,today:1,soon:2,open:3}[a.urgency]??3)-({overdue:0,today:1,soon:2,open:3}[b.urgency]??3));

        // Mesmo princípio do Contas a Receber: totais sempre sobre pendentes.
        const pagPendentes = pagItems.filter(p => !(p.paidDate || p.status === "pago"));
        const totalPag     = pagPendentes.reduce((s,p)=>s+p.total,0);
        const totalOverdue = pagPendentes.filter(p=>p.urgency==="overdue").reduce((s,p)=>s+p.total,0);
        const overdueCount = pagPendentes.filter(p=>p.urgency==="overdue").length;
        const urg = { overdue:{bg:"bg-red-100",text:"text-red-700",icon:"🔴"},
                      today:  {bg:"bg-amber-100",text:"text-amber-700",icon:"🟡"},
                      soon:   {bg:"bg-yellow-50",text:"text-yellow-700",icon:"🟠"},
                      open:   {bg:"bg-blue-50",text:"text-blue-600",icon:"🔵"} };
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-medium">Total a Pagar</p>
                <p className="text-lg font-bold text-red-700 mt-0.5">{fmt(totalPag)}</p>
                <p className="text-xs text-red-400">{pagPendentes.length} lançamento{pagPendentes.length!==1?"s":""}</p>
              </div>
              <div className={`border rounded-xl p-3 text-center ${totalOverdue>0?"bg-red-50 border-red-100":"bg-gray-50 border-gray-100"}`}>
                <p className="text-xs text-gray-500 font-medium">Vencidos</p>
                <p className={`text-lg font-bold mt-0.5 ${totalOverdue>0?"text-red-600":"text-gray-400"}`}>{fmt(totalOverdue)}</p>
                <p className={`text-xs ${totalOverdue>0?"text-red-400":"text-gray-400"}`}>{overdueCount} pedido{overdueCount!==1?"s":""}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-medium">Sem vencimento</p>
                <p className="text-lg font-bold text-gray-400 mt-0.5">{pagPendentes.filter(p=>!p.dueDate).length}</p>
                <p className="text-xs text-gray-400">lançamento{pagPendentes.filter(p=>!p.dueDate).length!==1?"s":""}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={()=>setShowPaidPag(v=>!v)}
                className={"text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors " + (showPaidPag ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100")}>
                {showPaidPag ? "✅ Ocultando pagos" : "👁 Ver pagos também"}
              </button>
            </div>
            {pagItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <p className="text-3xl mb-2">✅</p><p className="text-sm text-gray-500">Nenhum pagamento pendente!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {pagItems.map(p => {
                  const u = urg[p.urgency];
                  const diffLabel = p.diff===null?"Sem vencimento":p.urgency==="overdue"?`Vencido há ${Math.abs(p.diff)}d`:p.urgency==="today"?"VENCE HOJE":`Vence em ${p.diff}d`;
                  return (
                    <div key={p.id} className={`p-4 ${p.urgency==="overdue"?"bg-red-50/30":""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-indigo-600">{p.id}</span>
                            <span className="font-medium text-gray-800 text-sm">{p._type==="lancamento" ? (p.description||p.category||"Despesa") : p.supplierName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.bg} ${u.text}`}>{u.icon} {diffLabel}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{p._type==="lancamento" ? (p.description||p.category||"Despesa") : (p.items||[]).map(it=>`${it.description} (${it.qty}${it.unit})`).join(" · ")}</p>
                          <div className="flex gap-3 mt-1 flex-wrap text-[10px] text-gray-400">
                            <span>📋 Emissão: <strong>{p.date}</strong></span>
                            {p.dueDate && <span>📅 Venc.: <strong>{new Date(p.dueDate+"T12:00:00").toLocaleDateString("pt-BR")}</strong></span>}
                            {p.paymentTerms && <span>💳 {p.paymentTerms}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          <p className="font-bold text-red-600 text-base">{fmt(p.total)}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PC_STATUS_STYLES[p.status]?.bg||"bg-gray-100"} ${PC_STATUS_STYLES[p.status]?.text||"text-gray-600"}`}>{p.status}</span>
                          {(p.paidDate||p.status==="pago") ? (
                            canAlterar ? (<div className="flex flex-col items-end gap-1 mt-1"><span className="text-[10px] text-green-600 font-semibold">✅ Pago{p.paidDate?" em "+new Date(p.paidDate+"T12:00:00").toLocaleDateString("pt-BR"):""}</span><button onClick={()=>setPayPag(p)} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100">↩ Editar pgto</button></div>)
                            : (<span className="text-[10px] text-green-600 font-semibold mt-1">✅ Pago{p.paidDate?" em "+new Date(p.paidDate+"T12:00:00").toLocaleDateString("pt-BR"):""}</span>)
                          ) : (canAlterar && <button onClick={()=>setPayPag(p)} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 mt-1">💸 Pagar</button>)}
                          {p._type === "lancamento" && (canAlterar || canExcluir) && (
                            <div className="flex items-center gap-1 mt-1">
                              {canAlterar && (
                                <button onClick={()=>setModal(p)} className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                                  <Icon name="edit" size={13}/>
                                </button>
                              )}
                              {canExcluir && (
                                <button onClick={()=>setConfirmDelete(p)} className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                  <Icon name="trash" size={13}/>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {payPag && (
              <FinPagModal item={payPag} onClose={()=>setPayPag(null)}
                onSave={(updated)=>{
                  if (!canAlterar) return;
                  // Desde a v3.29.x a aba só lista lançamentos financeiros —
                  // compras nunca chegam aqui, então não há ramo pra elas.
                  setFinance(prev => prev.map(t => t.id === updated.id ? {...t, status:updated.status, paidDate:updated.paidDate, payment:updated.payment} : t));
                  setPayPag(null);
                }}/>
            )}
          </div>
        );
      })()}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Icon name="trash" size={22} className="text-red-500"/>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Excluir lançamento?</h3>
            <p className="text-sm text-gray-500 mb-4">{confirmDelete.description}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <FinanceModal
          tx={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          defaultType={initialTab === "pagar" ? "despesa" : "receita"}
        />
      )}
    </div>
  );
};

// ─── Customer Modal ───────────────────────────────────────────────────────
const CustomerModal = ({ customer, onClose, onSave, orders = [], customers = [] }) => {
  const isNew = !customer;
  const [activeTab, setActiveTab] = useState("dados");
  const [form, setForm] = useState(customer ? { ...customer, paymentTerms: customer.paymentTerms || "" } : {
    name:"", phone:"", email:"", cpfCnpj:"", city:"", state:"",
    cep:"", rua:"", numero:"", complemento:"", bairro:"",
    channel:"Mercado Livre", segment:"Ativo",
    totalOrders:0, totalSpent:0, lastPurchase:"", notes:"", paymentTerms:""
  });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  // Duplicate CPF/CNPJ check
  const cpfCnpjDuplicate = useMemo(() => {
    const raw = (form.cpfCnpj||"").replace(/\D/g,"");
    if (raw.length < 11) return null;
    return customers.find(c =>
      c.id !== customer?.id &&
      (c.cpfCnpj||"").replace(/\D/g,"") === raw
    ) || null;
  }, [form.cpfCnpj, customers, customer]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (cpfCnpjDuplicate) return; // block duplicate
    onSave({ ...form, tags:[], totalOrders: Number(form.totalOrders), totalSpent: Number(form.totalSpent) });
  };

  // Financial data for this customer
  const cOrders = orders.filter(o => o.customer?.toLowerCase() === form.name?.toLowerCase());
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const diffDays = (a,b) => Math.round((a-b)/86400000);
  const getFinStatus = (o) => {
    if (o.status==="Cancelado") return { label:"Cancelado", bg:"bg-gray-100", text:"text-gray-400", icon:"✕" };
    if (o.paidDate)              return { label:"Pago",      bg:"bg-green-100", text:"text-green-700", icon:"✅" };
    if (!o.dueDate)              return { label:"Em aberto", bg:"bg-blue-50",   text:"text-blue-600",  icon:"🔵" };
    const due = new Date(o.dueDate+"T12:00:00"); due.setHours(0,0,0,0);
    const diff = diffDays(due, today0);
    if (diff<0)  return { label:`Vencido há ${Math.abs(diff)}d`, bg:"bg-red-100",   text:"text-red-700",   icon:"🔴" };
    if (diff===0)return { label:"Vence hoje",                    bg:"bg-amber-100", text:"text-amber-700", icon:"🟡" };
    return             { label:`Vence em ${diff}d`,              bg:"bg-blue-50",   text:"text-blue-600",  icon:"🔵" };
  };
  const activeOrders = cOrders.filter(o=>o.status!=="Cancelado");
  const totalPaid   = activeOrders.filter(o=>o.paidDate).reduce((s,o)=>s+o.total,0);
  const totalOpen   = activeOrders.filter(o=>!o.paidDate).reduce((s,o)=>s+o.total,0);
  const totalOverdue= activeOrders.filter(o=>!o.paidDate&&o.dueDate&&new Date(o.dueDate+"T12:00:00")<today0).reduce((s,o)=>s+o.total,0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800">{isNew ? "Novo Cliente" : "Editar Cliente"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {[["dados","📋 Dados Cadastrais"],["financeiro","💰 Financeiro"]].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab===id?"text-indigo-600 border-b-2 border-indigo-600":"text-gray-400 hover:text-gray-600"}`}>
              {label}
              {id==="financeiro" && totalOverdue>0 && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">!</span>}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {/* TAB: Dados */}
          {activeTab==="dados" && (
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nome *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Nome completo"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CPF / CNPJ</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
                  value={form.cpfCnpj||""} onChange={e=>set("cpfCnpj", fmtCpfCnpj(e.target.value))}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00" maxLength={18}/>
                {cpfCnpjDuplicate && (
                  <div className="mt-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
                    <span className="text-red-500 text-sm shrink-0">⚠️</span>
                    <p className="text-xs text-red-700">
                      CPF/CNPJ já cadastrado para <strong>{cpfCnpjDuplicate.name}</strong>. Não é possível duplicar.
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Telefone</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.phone} onChange={e=>set("phone",fmtTelefone(e.target.value))} placeholder="(11) 99999-9999" maxLength={16}/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@exemplo.com"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">📍 Endereço</label>
                <EnderecoFields form={form} set={set}
                  inp="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <label className="text-xs font-bold text-indigo-700 mb-1 block">⏱ Prazo de Pagamento</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="365"
                    className="w-24 border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    value={form.paymentTerms||""} onChange={e=>set("paymentTerms",e.target.value)} placeholder="0"/>
                  <span className="text-sm text-indigo-600 font-medium">
                    {Number(form.paymentTerms)>0 ? `${form.paymentTerms} dias após a emissão da NF` : "Pagamento imediato (à vista)"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Canal Preferencial</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.channel} onChange={e=>set("channel",e.target.value)}>
                    {CHANNELS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.segment} onChange={e=>set("segment",e.target.value)}>
                    {SEGMENTS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Observações</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  rows={2} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Anotações internas..."/>
              </div>
            </div>
          )}

          {/* TAB: Financeiro */}
          {activeTab==="financeiro" && (
            <div className="p-5 space-y-4">
              {isNew ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p className="text-2xl mb-2">💰</p>
                  <p>Salve o cliente primeiro para visualizar o financeiro</p>
                </div>
              ) : cOrders.length===0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p className="text-2xl mb-2">📋</p>
                  <p>Nenhum pedido vinculado a este cliente</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-green-600 font-medium">Pago</p>
                      <p className="text-sm font-bold text-green-700">{fmt(totalPaid)}</p>
                    </div>
                    <div className={`border rounded-xl p-2.5 text-center ${totalOverdue>0?"bg-red-50 border-red-100":"bg-blue-50 border-blue-100"}`}>
                      <p className={`text-[10px] font-medium ${totalOverdue>0?"text-red-600":"text-blue-600"}`}>Em aberto</p>
                      <p className={`text-sm font-bold ${totalOverdue>0?"text-red-700":"text-blue-700"}`}>{fmt(totalOpen)}</p>
                    </div>
                    <div className={`border rounded-xl p-2.5 text-center ${totalOverdue>0?"bg-red-100 border-red-200":"bg-gray-50 border-gray-100"}`}>
                      <p className={`text-[10px] font-medium ${totalOverdue>0?"text-red-700":"text-gray-500"}`}>Vencido</p>
                      <p className={`text-sm font-bold ${totalOverdue>0?"text-red-800":"text-gray-400"}`}>{fmt(totalOverdue)}</p>
                    </div>
                  </div>

                  {/* Orders list */}
                  <div className="space-y-2">
                    {cOrders.map(o=>{
                      const fs = getFinStatus(o);
                      const due  = o.dueDate  ? new Date(o.dueDate +"T12:00:00") : null;
                      const paid = o.paidDate ? new Date(o.paidDate+"T12:00:00") : null;
                      return (
                        <div key={o.id} className={`rounded-xl border p-3 ${fs.bg}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-indigo-600">{o.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fs.bg} ${fs.text}`}>{fs.icon} {fs.label}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 truncate">{o.items}</p>
                              <div className="flex gap-3 mt-1 flex-wrap text-[10px] text-gray-500">
                                <span>📋 {o.date}</span>
                                {due  && <span>📅 Venc: {due.toLocaleDateString("pt-BR")}</span>}
                                {paid && <span className="text-green-600">✅ Pago: {paid.toLocaleDateString("pt-BR")}</span>}
                              </div>
                            </div>
                            <p className="font-bold text-gray-900 text-sm shrink-0">{fmt(o.total)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={!!cpfCnpjDuplicate}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${cpfCnpjDuplicate?"bg-gray-200 text-gray-400 cursor-not-allowed":"bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            {isNew ? "Criar Cliente" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Customer Detail Panel ────────────────────────────────────────────────
// ─── CPF / CNPJ auto-format ───────────────────────────────────────────────
function fmtCpfCnpj(value) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function fmtTelefone(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

// Inscrição Estadual no formato XXX.XXX.XXX.XXX (12 dígitos)
function fmtIE(value) {
  const d = value.replace(/\D/g, "").slice(0, 12);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,3})$/, "$1.$2");
}

function fmtCepGlobal(value) {
  return value.replace(/\D/g,"").slice(0,8).replace(/(\d{5})(\d)/,"$1-$2");
}

// ─── Endereço com busca de CEP ────────────────────────────────────────────
const EnderecoFields = ({ form, set, inp }) => {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError,   setCepError]   = useState("");

  const fmtCep = (v) => v.replace(/\D/g,"").slice(0,8).replace(/(\d{5})(\d)/,"$1-$2");

  const handleCepChange = (e) => {
    const raw = e.target.value.replace(/\D/g,"").slice(0,8);
    set("cep", fmtCep(raw));
    if (raw.length === 8) buscarCep(raw);
  };

  const buscarCep = async (cep) => {
    setCepLoading(true); setCepError("");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) { setCepError("CEP não encontrado"); setCepLoading(false); return; }
      set("rua",        d.logradouro||"");
      set("bairro",     d.bairro||"");
      set("complemento",d.complemento||"");
      set("state",      d.uf||"");
      set("city",       d.localidade||"");
      setCepError("");
    } catch { setCepError("Erro ao buscar CEP"); }
    setCepLoading(false);
  };

  return (
    <div className="space-y-3">
      {/* CEP */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">CEP</label>
        <div className="flex gap-2">
          <input className={`${inp} font-mono flex-1`}
            value={form.cep||""} onChange={handleCepChange}
            placeholder="00000-000" maxLength={9}/>
          {cepLoading && <div className="w-9 h-9 flex items-center justify-center"><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/></div>}
        </div>
        {cepError && <p className="text-[10px] text-red-500 mt-1">⚠️ {cepError}</p>}
      </div>
      {/* Rua + Número */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Rua / Logradouro</label>
          <input className={inp} value={form.rua||""} onChange={e=>set("rua",e.target.value)} placeholder="Rua, Av., Alameda..."/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Número</label>
          <input className={inp} value={form.numero||""} onChange={e=>set("numero",e.target.value)} placeholder="123"/>
        </div>
      </div>
      {/* Complemento + Bairro */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Complemento</label>
          <input className={inp} value={form.complemento||""} onChange={e=>set("complemento",e.target.value)} placeholder="Apto, Sala..."/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Bairro</label>
          <input className={inp} value={form.bairro||""} onChange={e=>set("bairro",e.target.value)} placeholder="Bairro"/>
        </div>
      </div>
      {/* Cidade + Estado via IBGE */}
      <CidadeEstadoFields city={form.city||""} state={form.state||""}
        onCityChange={v=>set("city",v)} onStateChange={v=>set("state",v)} inp={inp}/>
    </div>
  );
};

// ─── Brasil: Estados e Cidades ────────────────────────────────────────────
const BR_STATES = [
  {uf:"AC",name:"Acre"},{uf:"AL",name:"Alagoas"},{uf:"AP",name:"Amapá"},
  {uf:"AM",name:"Amazonas"},{uf:"BA",name:"Bahia"},{uf:"CE",name:"Ceará"},
  {uf:"DF",name:"Distrito Federal"},{uf:"ES",name:"Espírito Santo"},{uf:"GO",name:"Goiás"},
  {uf:"MA",name:"Maranhão"},{uf:"MT",name:"Mato Grosso"},{uf:"MS",name:"Mato Grosso do Sul"},
  {uf:"MG",name:"Minas Gerais"},{uf:"PA",name:"Pará"},{uf:"PB",name:"Paraíba"},
  {uf:"PR",name:"Paraná"},{uf:"PE",name:"Pernambuco"},{uf:"PI",name:"Piauí"},
  {uf:"RJ",name:"Rio de Janeiro"},{uf:"RN",name:"Rio Grande do Norte"},
  {uf:"RS",name:"Rio Grande do Sul"},{uf:"RO",name:"Rondônia"},{uf:"RR",name:"Roraima"},
  {uf:"SC",name:"Santa Catarina"},{uf:"SP",name:"São Paulo"},{uf:"SE",name:"Sergipe"},
  {uf:"TO",name:"Tocantins"},
];

const CidadeEstadoFields = ({ city, state, onCityChange, onStateChange, inp }) => {
  const [cities,   setCities]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [cityInput,setCityInput]= useState(city||"");
  const [showList, setShowList] = useState(false);

  // Load cities when state changes
  useEffect(() => {
    if (!state) { setCities([]); return; }
    setLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`)
      .then(r=>r.json())
      .then(data=>{ setCities(data.map(c=>c.nome)); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [state]);

  // Sync cityInput with prop
  useEffect(() => { setCityInput(city||""); }, [city]);

  const filtered = cities.filter(c=>c.toLowerCase().includes(cityInput.toLowerCase())).slice(0,8);

  return (
    <>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Estado</label>
        <select className={inp} value={state||""} onChange={e=>{
          onStateChange(e.target.value);
          onCityChange(""); setCityInput("");
        }}>
          <option value="">Selecione...</option>
          {BR_STATES.map(s=>(
            <option key={s.uf} value={s.uf}>{s.uf} — {s.name}</option>
          ))}
        </select>
      </div>
      <div className="relative">
        <label className="text-xs font-medium text-gray-600 mb-1 block">
          Cidade {loading && <span className="text-gray-400 text-[10px]">carregando...</span>}
        </label>
        <input className={inp}
          value={cityInput}
          onChange={e=>{ setCityInput(e.target.value); onCityChange(e.target.value); setShowList(true); }}
          onFocus={()=>setShowList(true)}
          onBlur={()=>setTimeout(()=>setShowList(false),150)}
          placeholder={state ? "Digite para buscar..." : "Selecione o estado primeiro"}
          disabled={!state}/>
        {showList && filtered.length>0 && cityInput && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
            {filtered.map(c=>(
              <button key={c} type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                onMouseDown={()=>{ onCityChange(c); setCityInput(c); setShowList(false); }}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};


// ─── PaymentModal (extraído do CustomerPanel para respeitar Rules of Hooks) ──
const PaymentModal = ({ order, onClose, onSave }) => {
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const todayStr = today0.toISOString().split("T")[0];
  const [paidDate, setPaidDate] = useState(todayStr);
  const [payment,  setPayment]  = useState(order.payment || "Pix");
  const [markPaid, setMarkPaid] = useState(!order.paidDate);
  const handleSave = () => onSave({ ...order, paidDate: markPaid ? paidDate : "", payment });
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Registrar Pagamento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm">
          <p className="font-mono font-bold text-indigo-600 text-xs">{order.id}</p>
          <p className="text-gray-600 text-xs mt-0.5 truncate">{order.items}</p>
          <p className="font-bold text-gray-900 text-lg mt-1">{fmt(order.total)}</p>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-800">Marcar como pago</p>
            <p className="text-xs text-gray-500 mt-0.5">{markPaid ? "Pedido será marcado como pago" : "Remover pagamento"}</p>
          </div>
          <button onClick={()=>setMarkPaid(v=>!v)}
            className={`w-12 h-6 rounded-full transition-all ${markPaid?"bg-green-500":"bg-gray-300"} relative`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${markPaid?"right-0.5":"left-0.5"}`}/>
          </button>
        </div>
        {markPaid && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">✅ Data de Pagamento</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={paidDate} onChange={e=>setPaidDate(e.target.value)}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">💳 Forma de Pagamento</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={payment} onChange={e=>setPayment(e.target.value)}>
                {PAYMENT_METHODS.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
            {markPaid ? "✅ Confirmar Pagamento" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerPanel = ({ customer, orders, onClose, onEdit, onDelete, onUpdateOrder, canAlterar=true, canExcluir=true }) => {
  if (!customer) return null;
  const [panelTab, setPanelTab] = useState("dados");
  const [payModal, setPayModal] = useState(null); // order being paid
  const seg = SEG_STYLES[customer.segment] || SEG_STYLES["default"] || { bg:"bg-gray-100", text:"text-gray-500", dot:"bg-gray-400" };
  const cOrders = orders.filter(o => (o.customer||"").toLowerCase() === (customer.name||"").toLowerCase());
  const statsOrders    = cOrders.filter(o => o.status !== "Cancelado");
  const dynTotalSpent  = statsOrders.reduce((s,o) => s + (o.total||0), 0);
  const dynTotalOrders = statsOrders.length;
  const dynLastPurchase = statsOrders.length
    ? statsOrders.map(o=>o.date).sort().reverse()[0]
    : null;
  const avgTicket  = dynTotalOrders > 0 ? dynTotalSpent / dynTotalOrders : 0;
  const daysSince  = dynLastPurchase
    ? Math.floor((new Date() - new Date(dynLastPurchase + "T12:00:00")) / 86400000)
    : null;

  // Financial data
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const diffDays = (a,b) => Math.round((a-b)/86400000);
  const getFinStatus = (o) => {
    if (o.status==="Cancelado") return { label:"Cancelado",  bg:"bg-gray-100",   text:"text-gray-400",  icon:"✕" };
    if (o.paidDate)             return { label:"Pago",       bg:"bg-green-100",  text:"text-green-700", icon:"✅" };
    if (!o.dueDate)             return { label:"Em aberto",  bg:"bg-blue-50",    text:"text-blue-600",  icon:"🔵" };
    const due = new Date(o.dueDate+"T12:00:00"); due.setHours(0,0,0,0);
    const diff = diffDays(due, today0);
    if (diff<0)  return { label:`Vencido há ${Math.abs(diff)}d`, bg:"bg-red-100",   text:"text-red-700",   icon:"🔴" };
    if (diff===0)return { label:"Vence hoje",                    bg:"bg-amber-100", text:"text-amber-700", icon:"🟡" };
    return             { label:`Vence em ${diff}d`,              bg:"bg-blue-50",   text:"text-blue-600",  icon:"🔵" };
  };
  const activeOrders  = cOrders.filter(o=>o.status!=="Cancelado");
  const totalPaid     = activeOrders.filter(o=>o.paidDate).reduce((s,o)=>s+o.total,0);
  const totalOpen     = activeOrders.filter(o=>!o.paidDate).reduce((s,o)=>s+o.total,0);
  const totalOverdue  = activeOrders.filter(o=>!o.paidDate&&o.dueDate&&new Date(o.dueDate+"T12:00:00")<today0).reduce((s,o)=>s+o.total,0);
  const paidOrders    = activeOrders.filter(o => o.paidDate);
  const openOrders    = activeOrders.filter(o => !o.paidDate);
  const overdueOrders = openOrders.filter(o => o.dueDate && new Date(o.dueDate+"T12:00:00") < today0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${avatarColor(customer.name)} flex items-center justify-center text-white font-bold text-lg`}>
              {initials(customer.name)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{customer.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge label={customer.segment} style={seg}/>
                <Badge label={customer.channel} style={CHANNEL_STYLES[customer.channel] || { bg:"bg-gray-100", text:"text-gray-600" }}/>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5"><Icon name="x"/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {[["dados","📋 Dados"],["financeiro","💰 Financeiro"]].map(([id,label])=>(
            <button key={id} onClick={()=>setPanelTab(id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${panelTab===id?"text-indigo-600 border-b-2 border-indigo-600":"text-gray-400 hover:text-gray-600"}`}>
              {label}
              {id==="financeiro" && totalOverdue>0 && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">!</span>}
            </button>
          ))}
        </div>

        {/* TAB: Dados */}
        {panelTab==="dados" && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:"Total Gasto", value: fmt(dynTotalSpent),  color:"text-indigo-700" },
              { label:"Pedidos",     value: dynTotalOrders,          color:"text-gray-900"   },
              { label:"Ticket Médio",value: fmt(avgTicket),           color:"text-gray-900"   },
              { label:"Última Compra", value: dynLastPurchase ? new Date(dynLastPurchase+"T12:00:00").toLocaleDateString("pt-BR") : "—", color: daysSince !== null && daysSince > 60 ? "text-red-500" : "text-gray-900" },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className={`font-bold text-base mt-0.5 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contato</p>

            {customer.cpfCnpj && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0">🪪</span>
                <span className="text-gray-700 font-mono">{customer.cpfCnpj}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0">📱</span>
                <a href={`tel:${customer.phone}`} className="text-indigo-600 hover:underline">{customer.phone}</a>
              </div>
            )}
            {customer.email && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0">✉️</span>
                <a href={`mailto:${customer.email}`} className="text-indigo-600 hover:underline truncate">{customer.email}</a>
              </div>
            )}

            {/* Full address */}
            {(customer.cep || customer.rua || customer.city) && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0 mt-0.5">📍</span>
                <div className="text-gray-700 space-y-0.5">
                  {customer.rua && (
                    <p>{customer.rua}{customer.numero ? `, ${customer.numero}` : ""}{customer.complemento ? ` — ${customer.complemento}` : ""}</p>
                  )}
                  {customer.bairro && <p className="text-gray-500 text-xs">{customer.bairro}</p>}
                  {(customer.city || customer.state) && (
                    <p>{[customer.city, customer.state].filter(Boolean).join(" — ")}</p>
                  )}
                  {customer.cep && <p className="text-gray-400 text-xs font-mono">CEP: {customer.cep}</p>}
                </div>
              </div>
            )}

            {!customer.cpfCnpj && !customer.phone && !customer.email && !customer.city && !customer.rua && (
              <p className="text-xs text-gray-400 italic">Nenhum contato cadastrado</p>
            )}
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-600 mb-1">📝 Observações</p>
              <p className="text-sm text-gray-700">{customer.notes}</p>
            </div>
          )}

          {/* Financial Panel */}
          {(true) && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  💰 Financeiro {cOrders.length > 0 && <span className="font-normal text-gray-400">({cOrders.length} pedido{cOrders.length!==1?"s":""})</span>}
                </p>

                {/* Summary cards */}
                {cOrders.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-green-600 font-medium">Pago</p>
                      <p className="text-sm font-bold text-green-700">{fmt(totalPaid)}</p>
                      <p className="text-[10px] text-green-500">{paidOrders.length} pedido{paidOrders.length!==1?"s":""}</p>
                    </div>
                    <div className={`border rounded-xl p-2.5 text-center ${totalOverdue>0?"bg-red-50 border-red-100":"bg-blue-50 border-blue-100"}`}>
                      <p className={`text-xs font-medium ${totalOverdue>0?"text-red-600":"text-blue-600"}`}>Em aberto</p>
                      <p className={`text-sm font-bold ${totalOverdue>0?"text-red-700":"text-blue-700"}`}>{fmt(totalOpen)}</p>
                      <p className={`text-[10px] ${totalOverdue>0?"text-red-500":"text-blue-500"}`}>{openOrders.length} pedido{openOrders.length!==1?"s":""}</p>
                    </div>
                    <div className={`border rounded-xl p-2.5 text-center ${totalOverdue>0?"bg-red-100 border-red-200":"bg-gray-50 border-gray-100"}`}>
                      <p className={`text-xs font-medium ${totalOverdue>0?"text-red-700":"text-gray-500"}`}>Vencido</p>
                      <p className={`text-sm font-bold ${totalOverdue>0?"text-red-800":"text-gray-400"}`}>{fmt(totalOverdue)}</p>
                      <p className={`text-[10px] ${totalOverdue>0?"text-red-600":"text-gray-400"}`}>{overdueOrders.length} pedido{overdueOrders.length!==1?"s":""}</p>
                    </div>
                  </div>
                )}

                {/* Order financial list */}
                {cOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 rounded-xl p-3 text-center">Nenhum pedido vinculado</p>
                ) : (
                  <div className="space-y-2">
                    {cOrders.map(o => {
                      const fs = getFinStatus(o);
                      const due  = o.dueDate  ? new Date(o.dueDate  + "T12:00:00") : null;
                      const paid = o.paidDate ? new Date(o.paidDate + "T12:00:00") : null;
                      const issue = new Date(o.date + "T12:00:00");
                      const lateDays = paid && due ? diffDays(paid, due) : null;
                      return (
                        <div key={o.id} className={`rounded-xl border p-3 ${fs.bg} ${o.status==="Cancelado"?"opacity-50":""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-indigo-600">{o.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fs.bg} ${fs.text} border border-current border-opacity-20`}>
                                  {fs.icon} {fs.label}
                                </span>
                                {lateDays !== null && lateDays > 0 && (
                                  <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                                    ⚠️ Pago com {lateDays}d de atraso
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1 truncate">{o.items}</p>
                              <div className="flex gap-3 mt-1.5 flex-wrap">
                                <span className="text-[10px] text-gray-500">📋 Emissão: <strong>{issue.toLocaleDateString("pt-BR")}</strong></span>
                                {due  && <span className="text-[10px] text-gray-500">📅 Vencimento: <strong>{due.toLocaleDateString("pt-BR")}</strong></span>}
                                {paid && <span className="text-[10px] text-green-600">✅ Pago em: <strong>{paid.toLocaleDateString("pt-BR")}</strong></span>}
                                <span className="text-[10px] text-gray-400">{o.payment}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-gray-900 text-sm">{fmt(o.total)}</p>
                              <Badge label={o.status} style={STATUS_STYLES[o.status]}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
          )}
        </div>
        )}

        {/* TAB: Financeiro */}
        {panelTab==="financeiro" && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">Nenhum pedido vinculado a este cliente</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-green-600 font-semibold uppercase">Pago</p>
                  <p className="text-sm font-bold text-green-700 mt-0.5">{fmt(totalPaid)}</p>
                </div>
                <div className={`border rounded-xl p-3 text-center ${totalOverdue>0?"bg-red-50 border-red-100":"bg-blue-50 border-blue-100"}`}>
                  <p className={`text-[10px] font-semibold uppercase ${totalOverdue>0?"text-red-600":"text-blue-600"}`}>A Receber</p>
                  <p className={`text-sm font-bold mt-0.5 ${totalOverdue>0?"text-red-700":"text-blue-700"}`}>{fmt(totalOpen)}</p>
                </div>
                <div className={`border rounded-xl p-3 text-center ${totalOverdue>0?"bg-red-100 border-red-200":"bg-gray-50 border-gray-100"}`}>
                  <p className={`text-[10px] font-semibold uppercase ${totalOverdue>0?"text-red-700":"text-gray-400"}`}>Vencido</p>
                  <p className={`text-sm font-bold mt-0.5 ${totalOverdue>0?"text-red-800":"text-gray-400"}`}>{fmt(totalOverdue)}</p>
                </div>
              </div>

              {/* Orders list */}
              <div className="space-y-2">
                {cOrders.map(o => {
                  const fs = getFinStatus(o);
                  const due  = o.dueDate  ? new Date(o.dueDate +"T12:00:00") : null;
                  const paid = o.paidDate ? new Date(o.paidDate+"T12:00:00") : null;
                  return (
                    <div key={o.id} onClick={()=>{ if (canAlterar) setPayModal(o); }}
                      className={`rounded-xl border p-3 ${canAlterar?"cursor-pointer hover:shadow-md":""} transition-all ${fs.bg} ${o.paidDate?"opacity-75":""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-indigo-600">{o.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fs.bg} ${fs.text}`}>{fs.icon} {fs.label}</span>
                            <Badge label={o.channel} style={CHANNEL_STYLES[o.channel]||{bg:"bg-gray-100",text:"text-gray-600"}}/>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{o.items}</p>
                          <div className="flex gap-3 mt-1 flex-wrap text-[10px] text-gray-500">
                            <span>📋 {o.date}</span>
                            {due  && <span>📅 Venc: {due.toLocaleDateString("pt-BR")}</span>}
                            {paid && <span className="text-green-600">✅ Pago: {paid.toLocaleDateString("pt-BR")}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900 text-sm">{fmt(o.total)}</p>
                          {!o.paidDate && <p className="text-[10px] text-indigo-500 mt-1">Clique para pagar</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        )}

        {/* Payment Modal */}
        {payModal && <PaymentModal order={payModal} onClose={()=>setPayModal(null)} onSave={(updated)=>{ if (canAlterar && onUpdateOrder) onUpdateOrder(updated); setPayModal(null); }} />}

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 flex gap-2 shrink-0">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            Fechar
          </button>
          {canAlterar && (
            <button onClick={() => onEdit(customer)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Icon name="edit" size={14}/> Editar
            </button>
          )}
          {canExcluir && (
            <button onClick={() => onDelete(customer)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
              <Icon name="trash" size={16}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── CRM Module ───────────────────────────────────────────────────────────
const CrmModule = ({ customers, setCustomers, orders, setOrders = () => {}, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "crm", "incluir");
  const canAlterar = getUserPerm(currentUser, "crm", "alterar");
  const canExcluir = getUserPerm(currentUser, "crm", "excluir");
  // ── Calcular stats de pedidos dinamicamente ─────────────────────────
  const customerStats = useMemo(() => {
    const map = {};
    (orders || []).filter(o => o.status !== "Cancelado").forEach(o => {
      const key = (o.customer || "").toLowerCase().trim();
      if (!key) return;
      if (!map[key]) map[key] = { totalOrders: 0, totalSpent: 0, lastPurchase: "" };
      map[key].totalOrders += 1;
      map[key].totalSpent  += (o.total || 0);
      if (!map[key].lastPurchase || o.date > map[key].lastPurchase)
        map[key].lastPurchase = o.date;
    });
    return map;
  }, [orders]);
  const getStats = (name) => customerStats[(name||"").toLowerCase().trim()] || { totalOrders: 0, totalSpent: 0, lastPurchase: "" };

  const [search, setSearch]       = useState("");
  const [filterSeg, setFilterSeg] = useState("Todos");
  const [filterCh, setFilterCh]   = useState("Todos");
  const [sortBy, setSortBy]       = useState("totalSpent");
  const [selected, setSelected]   = useState(null);
  const [modal, setModal]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Stats
  const segCount = useMemo(() => SEGMENTS.reduce((acc,s) => {
    acc[s] = customers.filter(c => c.segment === s).length; return acc;
  }, {}), [customers]);
  const totalSpentAll  = Object.values(customerStats).reduce((s,cs) => s + cs.totalSpent, 0);
  const totalOrdersAll = Object.values(customerStats).reduce((s,cs) => s + cs.totalOrders, 0);

  // Filtered + sorted list
  const filtered = useMemo(() => customers
    .filter(c => filterSeg === "Todos" || c.segment === filterSeg)
    .filter(c => filterCh  === "Todos" || c.channel  === filterCh)
    .filter(c => !search || [c.name, c.email, c.phone].some(f => f?.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => {
      if (sortBy === "name")         return a.name.localeCompare(b.name);
      if (sortBy === "totalOrders")  return getStats(b.name).totalOrders - getStats(a.name).totalOrders;
      if (sortBy === "lastPurchase") return (getStats(b.name).lastPurchase||"").localeCompare(getStats(a.name).lastPurchase||"");
      return getStats(b.name).totalSpent - getStats(a.name).totalSpent;
    }), [customers, filterSeg, filterCh, search, sortBy, customerStats]);

  const selectedCustomer = customers.find(c => c.id === selected);

  // CRUD helpers
  const nextCliId = (cs) => {
    const nums = cs.map(c => parseInt(c.id.replace("CLI-","")) || 0);
    return `CLI-${String(Math.max(0,...nums)+1).padStart(3,"0")}`;
  };

  const handleSave = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) {
      setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
      if (selected === data.id) setSelected(data.id);
    } else {
      setCustomers(prev => [...prev, { ...data, id: nextCliId(prev), createdAt: today() }]);
    }
    setModal(null);
  };

  const handleDelete = (cust) => {
    if (!canExcluir) return; // segurança extra, além do botão já escondido
    setConfirmDelete(null);
    setCustomers(prev => prev.filter(c => c.id !== cust.id));
    if (selected === cust.id) setSelected(null);
  };

  // Regra única de segmentação, usada pela importação e pelo recálculo:
  // sem pedidos → Desenvolvimento (prospect); última compra há mais de 90
  // dias → Inativo; senão → Ativo.
  const calcSegment = (stats) => {
    if (!stats || stats.totalOrders === 0) return "Desenvolvimento";
    const TODAY = new Date(); TODAY.setHours(0,0,0,0);
    const days = stats.lastPurchase
      ? Math.floor((TODAY - new Date(stats.lastPurchase + "T12:00:00")) / 86400000)
      : 999;
    return days > 90 ? "Inativo" : "Ativo";
  };

  // Import customers from orders
  const handleImport = () => {
    if (!canIncluir) return; // importar CRIA clientes — exige permissão de incluir
    const existingNames = new Set(customers.map(c => c.name.toLowerCase()));
    const seen = new Set();
    const toAdd = [];
    orders.forEach(o => {
      const key = o.customer.toLowerCase();
      if (!existingNames.has(key) && !seen.has(key)) {
        seen.add(key);
        const custsAll = [...customers, ...toAdd];
        const stats = getStats(o.customer);
        toAdd.push({
          id: nextCliId(custsAll), name: o.customer, phone:"", email:"",
          city:"", state:"", channel: o.channel, segment: calcSegment(stats),
          totalOrders: stats.totalOrders, totalSpent: stats.totalSpent, lastPurchase: stats.lastPurchase,
          createdAt: today(), tags:[], notes:"Importado automaticamente dos pedidos."
        });
      }
    });
    if (toAdd.length > 0) { setCustomers(prev => [...prev, ...toAdd]); showToast(`✅ ${toAdd.length} cliente(s) importado(s)!`); }
    else showToast("ℹ️ Todos os clientes já estão cadastrados.");
  };

  // Recalculate segments
  const handleRecalc = () => {
    if (!canAlterar) return; // recalcular ALTERA todos os clientes — exige permissão de alterar
    // Antes, a lógica só produzia Ativo/Inativo: "Desenvolvimento" era
    // inalcançável (cliente sem pedidos caía em Inativo) e o botão destruía
    // o segmento marcado manualmente em prospects. Agora: sem pedidos →
    // Desenvolvimento; >90 dias sem comprar → Inativo; senão → Ativo.
    setCustomers(prev => prev.map(c => ({ ...c, segment: calcSegment(getStats(c.name)) })));
    showToast("✅ Status recalculados!");
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clientes / CRM</h1>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} clientes cadastrados</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canIncluir && (
            <button onClick={handleImport}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
              <Icon name="arrowDown" size={14}/> Importar Pedidos
            </button>
          )}
          {canAlterar && (
            <button onClick={handleRecalc}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
              <Icon name="tag" size={14}/> Recalcular Status
            </button>
          )}
          {canIncluir && (
            <button onClick={() => setModal("new")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-1.5">
              <Icon name="plus" size={15}/> Cliente
            </button>
          )}
        </div>
      </div>

      {/* Segment overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SEGMENTS.map(s => {
          const st = SEG_STYLES[s] || SEG_STYLES["default"];
          return (
            <button key={s} onClick={() => setFilterSeg(filterSeg === s ? "Todos" : s)}
              className={`rounded-xl p-3 text-center border transition-all ${filterSeg === s ? `${st.bg} ${st.border} border` : "bg-white border-gray-100 hover:border-gray-200"}`}>
              <p className={`text-xl font-bold ${filterSeg === s ? st.text : "text-gray-800"}`}>{segCount[s]||0}</p>
              <p className={`text-xs mt-0.5 ${filterSeg === s ? st.text : "text-gray-500"}`}>{s}</p>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Receita Total</p>
          <p className="text-lg font-bold text-indigo-700 mt-0.5">{fmt(totalSpentAll)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Ticket Médio</p>
          <p className="text-lg font-bold text-gray-800 mt-0.5">
            {totalOrdersAll > 0 ? fmt(totalSpentAll / totalOrdersAll) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total de Pedidos</p>
          <p className="text-lg font-bold text-gray-800 mt-0.5">
            {totalOrdersAll}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Buscar por nome, email, tag..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
          value={filterCh} onChange={e=>setFilterCh(e.target.value)}>
          <option>Todos</option>
          {CHANNELS.map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
          value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="totalSpent">↓ Maior gasto</option>
          <option value="totalOrders">↓ Mais pedidos</option>
          <option value="lastPurchase">↓ Compra recente</option>
          <option value="name">A–Z Nome</option>
        </select>
      </div>

      {/* Customer table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Icon name="crm" size={32} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Canal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Pedidos</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gasto Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Última Compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => {
                  const seg = SEG_STYLES[c.segment] || SEG_STYLES.Novo;
                  return (
                    <tr key={c.id} onClick={() => setSelected(c.id)}
                      className="hover:bg-indigo-50/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${avatarColor(c.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {initials(c.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge label={c.channel} style={CHANNEL_STYLES[c.channel] || { bg:"bg-gray-100", text:"text-gray-600" }}/>
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={c.segment} style={seg}/>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-gray-600">{getStats(c.name).totalOrders}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(getStats(c.name).totalSpent)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{getStats(c.name).lastPurchase ? new Date(getStats(c.name).lastPurchase+"T12:00:00").toLocaleDateString("pt-BR") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <CustomerPanel
          customer={selectedCustomer}
          orders={orders}
          onClose={() => setSelected(null)}
          onEdit={(c) => { setModal(c); setSelected(null); }}
          onDelete={(c) => setConfirmDelete(c)}
          canAlterar={canAlterar} canExcluir={canExcluir}
          onUpdateOrder={(updatedOrder) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          }}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Icon name="trash" size={22} className="text-red-500"/>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Excluir cliente?</h3>
            <p className="text-sm text-gray-500 mb-4">{confirmDelete.name}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && <CustomerModal customer={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} orders={orders} customers={customers}/>}
    </div>
  );
};

// ─── Register Purchase Modal ──────────────────────────────────────────────
const RegisterPurchaseModal = ({ supplier, onClose, onSave }) => {
  const [form, setForm] = useState({
    description:`Compra — ${supplier.name}`, amount:"", date:today(), notes:"", paymentMethod:"Pix"
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const handleSave = () => { if (!form.amount) return; onSave({ ...form, amount:parseFloat(form.amount), supplierId:supplier.id }); };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div><h2 className="font-semibold text-gray-800">Registrar Compra</h2><p className="text-xs text-gray-400 mt-0.5">{supplier.name}</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Descrição</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.description} onChange={e=>set("description",e.target.value)}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Valor (R$) *</label>
              <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="0,00"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Data</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.date} onChange={e=>set("date",e.target.value)}/>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Pagamento</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
              {PAYMENT_METHODS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Observações</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Nº NF, lote, condições..."/>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Registrar</button>
        </div>
      </div>
    </div>
  );
};

// ─── Supplier Modal ───────────────────────────────────────────────────────
const SupplierModal = ({ supplier, onClose, onSave, purchases = [], suppliers = [] }) => {
  const isNew = !supplier;
  const [activeTab, setActiveTab] = useState("dados");
  const [form, setForm] = useState(supplier
    ? { ...supplier }
    : { name:"", cnpj:"", contact:"", phone:"", email:"", website:"",
        city:"", state:"", cep:"", rua:"", numero:"", complemento:"", bairro:"",
        category:"Linhas / Fios", status:"Ativo", paymentTerms:"30 dias", notes:"", tags:[], totalPurchased:0 });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Duplicate CNPJ check
  const cnpjDuplicate = useMemo(() => {
    const raw = (form.cnpj||"").replace(/\D/g,"");
    if (raw.length < 11) return null;
    return suppliers.find(s =>
      s.id !== supplier?.id &&
      (s.cnpj||"").replace(/\D/g,"") === raw
    ) || null;
  }, [form.cnpj, suppliers, supplier]);
  const handleSave = () => {
    if (!form.name.trim()) return;
    if (cnpjDuplicate) return;
    onSave({ ...form, totalPurchased:supplier?.totalPurchased||0, lastPurchase:supplier?.lastPurchase||"" });
  };

  // Financial data for this supplier
  const sPurchases = purchases.filter(p => p.supplierName?.toLowerCase() === form.name?.toLowerCase());
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const diffDays = (a,b) => Math.round((a-b)/86400000);
  const getFinStatus = (p) => {
    if (p.status==="Cancelado") return { label:"Cancelado",  bg:"bg-gray-100",   text:"text-gray-400",  icon:"✕" };
    if (p.paidDate)             return { label:"Pago",       bg:"bg-green-100",  text:"text-green-700", icon:"✅" };
    if (!p.dueDate)             return { label:"Em aberto",  bg:"bg-blue-50",    text:"text-blue-600",  icon:"🔵" };
    const due = new Date(p.dueDate+"T12:00:00"); due.setHours(0,0,0,0);
    const diff = diffDays(due, today0);
    if (diff<0)  return { label:`Vencido há ${Math.abs(diff)}d`, bg:"bg-red-100",   text:"text-red-700",   icon:"🔴" };
    if (diff===0)return { label:"Vence hoje",                    bg:"bg-amber-100", text:"text-amber-700", icon:"🟡" };
    return             { label:`Vence em ${diff}d`,              bg:"bg-blue-50",   text:"text-blue-600",  icon:"🔵" };
  };
  const activePurchases = sPurchases.filter(p=>p.status!=="Cancelado");
  const totalPaid    = activePurchases.filter(p=>p.paidDate).reduce((s,p)=>s+p.total,0);
  const totalOpen    = activePurchases.filter(p=>!p.paidDate).reduce((s,p)=>s+p.total,0);
  const totalOverdue = activePurchases.filter(p=>!p.paidDate&&p.dueDate&&new Date(p.dueDate+"T12:00:00")<today0).reduce((s,p)=>s+p.total,0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800">{isNew ? "Novo Fornecedor" : "Editar Fornecedor"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {[["dados","📋 Dados Cadastrais"],["financeiro","💰 Financeiro"]].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab===id?"text-indigo-600 border-b-2 border-indigo-600":"text-gray-400 hover:text-gray-600"}`}>
              {label}
              {id==="financeiro" && totalOverdue>0 && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">!</span>}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {/* TAB: Dados */}
          {activeTab==="dados" && (
            <div className="p-5 space-y-3">
              {/* 1. Nome */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Razão Social / Nome *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Nome do fornecedor"/>
              </div>
              {/* 2. CPF / CNPJ */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CPF / CNPJ</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.cnpj} onChange={e=>set("cnpj", fmtCpfCnpj(e.target.value))} placeholder="000.000.000-00 ou 00.000.000/0001-00" maxLength={18}/>
                {cnpjDuplicate && (
                  <div className="mt-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
                    <span className="text-red-500 text-sm shrink-0">⚠️</span>
                    <p className="text-xs text-red-700">CPF/CNPJ já cadastrado para <strong>{cnpjDuplicate.name}</strong>.</p>
                  </div>
                )}
              </div>
              {/* 3. Telefone + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Telefone</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.phone} onChange={e=>set("phone",fmtTelefone(e.target.value))} placeholder="(11) 99999-9999" maxLength={16}/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@fornecedor.com"/>
                </div>
              </div>
              {/* 4. Contato + Website */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Contato</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.contact} onChange={e=>set("contact",e.target.value)} placeholder="Nome do representante"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Website</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.website} onChange={e=>set("website",e.target.value)} placeholder="site.com.br"/>
                </div>
              </div>
              {/* 5. Endereço */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">📍 Endereço</label>
                <EnderecoFields form={form} set={set}
                  inp="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
              {/* 6. Prazo de Pagamento — antes de Categoria/Status, igual ao cliente */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <label className="text-xs font-bold text-indigo-700 mb-1 block">⏱ Prazo de Pagamento</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="365"
                    className="w-24 border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    value={form.paymentTerms||""} onChange={e=>set("paymentTerms",e.target.value)} placeholder="0"/>
                  <span className="text-sm text-indigo-600 font-medium">
                    {Number(form.paymentTerms)>0 ? `${form.paymentTerms} dias após a emissão da NF` : "Pagamento imediato (à vista)"}
                  </span>
                </div>
              </div>
              {/* 7. Categoria + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Categoria</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.category} onChange={e=>set("category",e.target.value)}>
                    {SUP_CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.status} onChange={e=>set("status",e.target.value)}>
                    {SUP_STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {/* 11. Observações */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Observações</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Informações internas, condições especiais..."/>
              </div>
            </div>
          )}

          {/* TAB: Financeiro */}
          {activeTab==="financeiro" && (
            <div className="p-5 space-y-4">
              {isNew ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p className="text-2xl mb-2">💰</p>
                  <p>Salve o fornecedor primeiro para visualizar o financeiro</p>
                </div>
              ) : sPurchases.length===0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p className="text-2xl mb-2">📋</p>
                  <p>Nenhum pedido de compra vinculado a este fornecedor</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-green-600 font-medium">Pago</p>
                      <p className="text-sm font-bold text-green-700">{fmt(totalPaid)}</p>
                    </div>
                    <div className={`border rounded-xl p-2.5 text-center ${totalOverdue>0?"bg-red-50 border-red-100":"bg-blue-50 border-blue-100"}`}>
                      <p className={`text-[10px] font-medium ${totalOverdue>0?"text-red-600":"text-blue-600"}`}>A pagar</p>
                      <p className={`text-sm font-bold ${totalOverdue>0?"text-red-700":"text-blue-700"}`}>{fmt(totalOpen)}</p>
                    </div>
                    <div className={`border rounded-xl p-2.5 text-center ${totalOverdue>0?"bg-red-100 border-red-200":"bg-gray-50 border-gray-100"}`}>
                      <p className={`text-[10px] font-medium ${totalOverdue>0?"text-red-700":"text-gray-500"}`}>Vencido</p>
                      <p className={`text-sm font-bold ${totalOverdue>0?"text-red-800":"text-gray-400"}`}>{fmt(totalOverdue)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {sPurchases.map(p=>{
                      const fs = getFinStatus(p);
                      const due  = p.dueDate  ? new Date(p.dueDate +"T12:00:00") : null;
                      const paid = p.paidDate ? new Date(p.paidDate+"T12:00:00") : null;
                      return (
                        <div key={p.id} className={`rounded-xl border p-3 ${fs.bg}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-indigo-600">{p.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fs.bg} ${fs.text}`}>{fs.icon} {fs.label}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 truncate">{p.items?.map(it=>`${it.description} (${it.qty}${it.unit})`).join(" · ")}</p>
                              <div className="flex gap-3 mt-1 flex-wrap text-[10px] text-gray-500">
                                <span>📋 {p.date}</span>
                                {due  && <span>📅 Venc: {due.toLocaleDateString("pt-BR")}</span>}
                                {paid && <span className="text-green-600">✅ Pago: {paid.toLocaleDateString("pt-BR")}</span>}
                              </div>
                            </div>
                            <p className="font-bold text-gray-900 text-sm shrink-0">{fmt(p.total)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={!!cnpjDuplicate}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${cnpjDuplicate?"bg-gray-200 text-gray-400 cursor-not-allowed":"bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            {isNew ? "Criar Fornecedor" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Supplier Detail Panel ────────────────────────────────────────────────
// ─── SupplierPayModal ────────────────────────────────────────────────────────
const SupplierPayModal = ({ purchase, onClose, onSave }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [markPaid, setMarkPaid] = useState(!purchase.paidDate);
  const [paidDate, setPaidDate] = useState(purchase.paidDate || todayStr);
  const [payment,  setPayment]  = useState(purchase.paymentTerms || "Pix");
  const handleSave = () => onSave({ ...purchase, paidDate: markPaid ? paidDate : "", payment: markPaid ? payment : purchase.payment || "" });
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Registrar Pagamento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm">
          <p className="font-mono font-bold text-indigo-600 text-xs">{purchase.id}</p>
          <p className="text-gray-600 text-xs mt-0.5 truncate">
            {(purchase.items||[]).map(it=>it.description).join(", ")}
          </p>
          <p className="font-bold text-gray-900 text-lg mt-1">{fmt(purchase.total)}</p>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-800">Marcar como pago</p>
            <p className="text-xs text-gray-500 mt-0.5">{markPaid ? "Compra será marcada como paga" : "Remover pagamento"}</p>
          </div>
          <button onClick={()=>setMarkPaid(v=>!v)}
            className={`w-12 h-6 rounded-full transition-all ${markPaid?"bg-green-500":"bg-gray-300"} relative`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${markPaid?"right-0.5":"left-0.5"}`}/>
          </button>
        </div>
        {markPaid && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">✅ Data de Pagamento</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={paidDate} onChange={e=>setPaidDate(e.target.value)}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">💳 Forma de Pagamento</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={payment} onChange={e=>setPayment(e.target.value)}>
                {PAYMENT_METHODS.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
            {markPaid ? "✅ Confirmar Pagamento" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SupplierDetailPanel = ({ supplier, finance, purchases, onUpdatePurchase, onClose, onEdit, onDelete, onRegisterPurchase, canIncluir=true, canAlterar=true, canExcluir=true }) => {
  if (!supplier) return null;
  const [panelTab,     setPanelTab]     = useState("dados");
  const [supPayModal,  setSupPayModal]  = useState(null);
  const ss = SUP_STATUS_STYLES[supplier.status] || SUP_STATUS_STYLES["Ativo"];
  const catColor = SUP_CAT_COLORS[supplier.category] || "#94a3b8";
  const supPurchases = (purchases||[])
    .filter(p => String(p.supplierId)===String(supplier.id))
    .sort((a,b) => b.date.localeCompare(a.date));

  // Financial helpers
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const diffDays = (a,b) => Math.round((a-b)/86400000);
  const getFinStatus = (pc) => {
    if (pc.status==="Cancelado") return { label:"Cancelado", bg:"bg-gray-100", text:"text-gray-400", icon:"✕" };
    if (pc.paidDate)              return { label:"Pago",      bg:"bg-green-100", text:"text-green-700", icon:"✅" };
    if (!pc.dueDate)              return { label:"Em aberto", bg:"bg-blue-50",   text:"text-blue-600",  icon:"🔵" };
    const due = new Date(pc.dueDate+"T12:00:00"); due.setHours(0,0,0,0);
    const diff = diffDays(due, today0);
    if (diff < 0)  return { label:`Vencido há ${Math.abs(diff)}d`, bg:"bg-red-100",   text:"text-red-700",   icon:"🔴" };
    if (diff===0)  return { label:"Vence hoje",                    bg:"bg-amber-100", text:"text-amber-700", icon:"🟡" };
    if (diff<=3)   return { label:`Vence em ${diff}d`,             bg:"bg-amber-50",  text:"text-amber-600", icon:"🟠" };
    return               { label:`Vence em ${diff}d`,              bg:"bg-blue-50",   text:"text-blue-600",  icon:"🔵" };
  };

  const activePc    = supPurchases.filter(p=>p.status!=="Cancelado");
  const paidPc      = activePc.filter(p=>p.paidDate);
  const openPc      = activePc.filter(p=>!p.paidDate);
  const overduePc   = openPc.filter(p=>{ if(!p.dueDate)return false; const d=new Date(p.dueDate+"T12:00:00"); d.setHours(0,0,0,0); return d<today0; });
  const totalPaid   = paidPc.reduce((s,p)=>s+p.total,0);
  const totalOpen   = openPc.reduce((s,p)=>s+p.total,0);
  const totalOverdue= overduePc.reduce((s,p)=>s+p.total,0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${avatarColor(supplier.name)} flex items-center justify-center text-white font-bold text-lg`}>
              {initials(supplier.name)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">{supplier.name}</h2>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ background: catColor }}>{supplier.category}</span>
                <Badge label={supplier.status} style={ss}/>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5"><Icon name="x"/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {[["dados","📋 Dados"],["financeiro","💰 Financeiro"]].map(([id,label])=>(
            <button key={id} onClick={()=>setPanelTab(id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${panelTab===id?"text-indigo-600 border-b-2 border-indigo-600":"text-gray-400 hover:text-gray-600"}`}>
              {label}
              {id==="financeiro" && totalOverdue>0 && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">!</span>}
            </button>
          ))}
        </div>

        {panelTab==="dados" && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Métricas — igual ao cliente */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:"Total Comprado",  value: fmt(supPurchases.filter(p=>p.status!=="Cancelado").reduce((s,p)=>s+p.total,0)||supplier.totalPurchased||0), color:"text-indigo-700" },
              { label:"Compras",         value: supPurchases.filter(p=>p.status!=="Cancelado").length || 0,                                                  color:"text-gray-900"   },
              { label:"Ticket Médio",    value: (() => { const a=supPurchases.filter(p=>p.status!=="Cancelado"); return a.length ? fmt(a.reduce((s,p)=>s+p.total,0)/a.length) : "—"; })(), color:"text-gray-900" },
              { label:"Última Compra",   value: supPurchases.filter(p=>p.status!=="Cancelado").length
                  ? new Date(supPurchases.filter(p=>p.status!=="Cancelado").map(p=>p.date).sort().reverse()[0]+"T12:00:00").toLocaleDateString("pt-BR")
                  : "—",
                color: (() => {
                  const last = supPurchases.filter(p=>p.status!=="Cancelado").map(p=>p.date).sort().reverse()[0];
                  if (!last) return "text-gray-400";
                  const days = Math.floor((new Date()-new Date(last+"T12:00:00"))/86400000);
                  return days > 60 ? "text-red-500" : "text-gray-900";
                })()
              },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className={`font-bold text-base mt-0.5 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Desde */}
          <div className="flex items-center justify-end">
            <span className="text-xs text-gray-400">Desde {supplier.createdAt}</span>
          </div>

          {/* Bloco de contato — mesma estrutura do cliente */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contato</p>
            {supplier.cnpj && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0">🪪</span>
                <span className="text-gray-700 font-mono text-xs">{supplier.cnpj}</span>
              </div>
            )}
            {supplier.contact && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0">👤</span>
                <span className="text-gray-700 font-medium">{supplier.contact}</span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0">📱</span>
                <a href={`tel:${supplier.phone}`} className="text-indigo-600 hover:underline">{supplier.phone}</a>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0">✉️</span>
                <a href={`mailto:${supplier.email}`} className="text-indigo-600 hover:underline truncate">{supplier.email}</a>
              </div>
            )}
            {supplier.website && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0">🌐</span>
                <a href={supplier.website.startsWith("http")?supplier.website:`https://${supplier.website}`} target="_blank" rel="noreferrer"
                  className="text-indigo-600 hover:underline truncate">{supplier.website}</a>
              </div>
            )}
            {(supplier.cep || supplier.rua || supplier.city) && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-5 shrink-0 mt-0.5">📍</span>
                <div className="text-gray-700 space-y-0.5">
                  {supplier.rua && (
                    <p>{supplier.rua}{supplier.numero ? `, ${supplier.numero}` : ""}{supplier.complemento ? ` — ${supplier.complemento}` : ""}</p>
                  )}
                  {supplier.bairro && <p className="text-gray-500 text-xs">{supplier.bairro}</p>}
                  {(supplier.city || supplier.state) && (
                    <p>{[supplier.city, supplier.state].filter(Boolean).join(" — ")}</p>
                  )}
                  {supplier.cep && <p className="text-gray-400 text-xs font-mono">CEP: {supplier.cep}</p>}
                </div>
              </div>
            )}
            {!supplier.cnpj && !supplier.contact && !supplier.phone && !supplier.email && !supplier.city && !supplier.rua && (
              <p className="text-xs text-gray-400 italic">Nenhum contato cadastrado</p>
            )}
          </div>

          {/* Prazo de Pagamento */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <p className="text-[10px] text-indigo-500 uppercase tracking-wide font-medium">Prazo Pgto.</p>
            <p className="text-sm font-bold text-indigo-700 mt-0.5">
              {Number(supplier.paymentTerms)>0 ? `${supplier.paymentTerms} dias` : "À vista"}
            </p>
          </div>

          {/* Observações */}
          {supplier.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-600 mb-1">📝 Observações</p>
              <p className="text-sm text-gray-700">{supplier.notes}</p>
            </div>
          )}
        </div>
        )}

        {/* TAB: Financeiro */}
        {panelTab==="financeiro" && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {supPurchases.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="bg-green-50 border border-green-100 rounded-xl p-2.5 text-center">
                <p className="text-xs text-green-600 font-medium">Pago</p>
                <p className="text-sm font-bold text-green-700">{fmt(totalPaid)}</p>
                <p className="text-[10px] text-green-500">{paidPc.length} pedido{paidPc.length!==1?"s":""}</p>
              </div>
              <div className={`border rounded-xl p-2.5 text-center ${totalOverdue>0?"bg-red-50 border-red-100":"bg-blue-50 border-blue-100"}`}>
                <p className={`text-xs font-medium ${totalOverdue>0?"text-red-600":"text-blue-600"}`}>A pagar</p>
                <p className={`text-sm font-bold ${totalOverdue>0?"text-red-700":"text-blue-700"}`}>{fmt(totalOpen)}</p>
                <p className={`text-[10px] ${totalOverdue>0?"text-red-500":"text-blue-500"}`}>{openPc.length} pedido{openPc.length!==1?"s":""}</p>
              </div>
              <div className={`border rounded-xl p-2.5 text-center ${totalOverdue>0?"bg-red-100 border-red-200":"bg-gray-50 border-gray-100"}`}>
                <p className={`text-xs font-medium ${totalOverdue>0?"text-red-700":"text-gray-500"}`}>Vencido</p>
                <p className={`text-sm font-bold ${totalOverdue>0?"text-red-800":"text-gray-400"}`}>{fmt(totalOverdue)}</p>
                <p className={`text-[10px] ${totalOverdue>0?"text-red-600":"text-gray-400"}`}>{overduePc.length} pedido{overduePc.length!==1?"s":""}</p>
              </div>
            </div>
          )}
          {supPurchases.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">Nenhum pedido de compra vinculado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {supPurchases.map(pc => {
                const fs = getFinStatus(pc);
                const due   = pc.dueDate  ? new Date(pc.dueDate +"T12:00:00") : null;
                const paid  = pc.paidDate ? new Date(pc.paidDate+"T12:00:00") : null;
                const issue = new Date(pc.date+"T12:00:00");
                const lateDays = paid && due ? diffDays(paid, due) : null;
                return (
                  <div key={pc.id} onClick={()=>setSupPayModal(pc)}
                    className={`rounded-xl border p-3 cursor-pointer hover:shadow-md transition-all ${fs.bg} ${pc.paidDate?"opacity-75":""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-indigo-600">{pc.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fs.bg} ${fs.text}`}>{fs.icon} {fs.label}</span>
                          {lateDays!==null && lateDays>0 && (
                            <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                              ⚠️ Pago com {lateDays}d de atraso
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {(pc.items||[]).map(it=>`${it.description} (${it.qty}${it.unit})`).join(" · ")}
                        </p>
                        <div className="flex gap-3 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-500">📋 {issue.toLocaleDateString("pt-BR")}</span>
                          {due  && <span className="text-[10px] text-gray-500">📅 Venc: <strong>{due.toLocaleDateString("pt-BR")}</strong></span>}
                          {paid && <span className="text-[10px] text-green-600">✅ Pago: <strong>{paid.toLocaleDateString("pt-BR")}</strong></span>}
                          <span className="text-[10px] text-gray-400">💳 {pc.paymentTerms}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900 text-sm">{fmt(pc.total)}</p>
                        {!pc.paidDate && <p className="text-[10px] text-indigo-500 mt-1">Clique para pagar</p>}
                        {pc.paidDate  && <p className="text-[10px] text-green-600 mt-1">✅ Pago</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {supPayModal && (
            <SupplierPayModal
              purchase={supPayModal}
              onClose={()=>setSupPayModal(null)}
              onSave={(updated)=>{ if(onUpdatePurchase) onUpdatePurchase(updated); setSupPayModal(null); }}
            />
          )}
        </div>
        )}

        <div className="p-4 border-t border-gray-100 flex gap-2 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Fechar</button>
          {canIncluir && (
            <button onClick={()=>onRegisterPurchase(supplier)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 font-medium">
              <Icon name="plus" size={14}/> Compra
            </button>
          )}
          {canAlterar && (
            <button onClick={()=>onEdit(supplier)} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Icon name="edit" size={14}/> Editar
            </button>
          )}
          {canExcluir && <button onClick={()=>onDelete(supplier)} className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"><Icon name="trash" size={16}/></button>}
        </div>
      </div>
    </div>
  );
};

// ─── Supplier Module ──────────────────────────────────────────────────────
const SupplierModule = ({ suppliers, setSuppliers, finance, setFinance, purchases, setPurchases, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "suppliers", "incluir");
  const canAlterar = getUserPerm(currentUser, "suppliers", "alterar");
  const canExcluir = getUserPerm(currentUser, "suppliers", "excluir");
  const [search, setSearch]             = useState("");
  const [filterCat, setFilterCat]       = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [selected, setSelected]         = useState(null);
  const [modal, setModal]               = useState(null);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3000); };

  const ativos   = suppliers.filter(s=>s.status==="Ativo").length;
  const totalBought = purchases.filter(p=>p.status!=="Cancelado").reduce((s,p)=>s+(p.total||0), 0);

  const filtered = useMemo(() => suppliers
    .filter(s => filterCat    === "Todas" || s.category === filterCat)
    .filter(s => filterStatus === "Todos" || s.status   === filterStatus)
    .filter(s => !search || [s.name,s.cnpj,s.contact,s.email,...(s.tags||[])].some(f=>f?.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => (b.totalPurchased||0) - (a.totalPurchased||0))
  , [suppliers, filterCat, filterStatus, search]);

  const selectedSupplier = suppliers.find(s => s.id === selected);

  const nextForId = (ss) => {
    const nums = ss.map(s=>parseInt(s.id.replace("FOR-",""))||0);
    return `FOR-${String(Math.max(0,...nums)+1).padStart(3,"0")}`;
  };
  const handleSave = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) setSuppliers(prev=>prev.map(s=>s.id===data.id?data:s));
    else setSuppliers(prev=>[...prev, {...data, id:nextForId(prev), createdAt:today()}]);
    setModal(null);
  };
  const handleDelete = (sup) => {
    if (!canExcluir) return; // segurança extra, além do botão já escondido
    setSuppliers(prev=>prev.filter(s=>s.id!==sup.id));
    setConfirmDelete(null);
    if (selected===sup.id) setSelected(null);
  };
  const handleRegisterPurchase = (data) => {
    if (!canIncluir) return; // segurança extra, além do botão já escondido
    const finNums = finance.map(f=>parseInt(f.id.replace("FIN-",""))||0);
    const newFinId = `FIN-${String(Math.max(0,...finNums)+1).padStart(3,"0")}`;
    setFinance(prev=>[{ id:newFinId, type:"despesa", category:"Fornecedores",
      description:data.description, amount:data.amount, date:data.date,
      status:"pago", paidDate:data.date, payment:data.paymentMethod||"", notes:data.notes, supplierId:data.supplierId }, ...prev]);
    setSuppliers(prev=>prev.map(s=>s.id===data.supplierId
      ? { ...s, totalPurchased:(s.totalPurchased||0)+data.amount, lastPurchase:data.date } : s));
    setPurchaseModal(null);
    showToast(`✅ Compra de ${fmt(data.amount)} registrada!`);
  };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{suppliers.length} fornecedores cadastrados</p>
        </div>
        {canIncluir && (
          <button onClick={()=>setModal("new")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-1.5">
            <Icon name="plus" size={15}/> Fornecedor
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{suppliers.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">{ativos} ativos</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Comprado</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{fmt(totalBought)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Em Avaliação</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{suppliers.filter(s=>s.status==="Desenvolvimento").length}</p>
          <p className="text-xs text-gray-400 mt-0.5">novos candidatos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Buscar por nome, CNPJ, contato..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
          value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option>Todas</option>{SUP_CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
          value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option>Todos</option>{SUP_STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Compact table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <Icon name="suppliers" size={32} className="mx-auto mb-2 text-gray-300"/>
          <p className="text-sm text-gray-400">Nenhum fornecedor encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <span className="col-span-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Fornecedor</span>
            <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Categoria</span>
            <span className="col-span-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</span>
            <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Total Comprado</span>
            <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Última Compra</span>
          </div>
          {/* Rows */}
          {filtered.map((s, idx) => {
            const ss       = SUP_STATUS_STYLES[s.status] || SUP_STATUS_STYLES["Ativo"];
            const catColor = SUP_CAT_COLORS[s.category] || "#94a3b8";
            const supPurchases = purchases.filter(p => String(p.supplierId) === String(s.id) || p.supplier === s.name);
            const lastDate = supPurchases.length > 0
              ? supPurchases.map(p=>p.date).sort().reverse()[0]
              : null;
            return (
              <div key={s.id}
                onClick={() => setSelected(s.id)}
                className={`grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer hover:bg-indigo-50 transition-colors ${idx < filtered.length-1 ? "border-b border-gray-50" : ""}`}>
                {/* Name + avatar */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${avatarColor(s.name)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    {s.cnpj && <p className="text-[10px] text-gray-400 font-mono truncate">{s.cnpj}</p>}
                  </div>
                </div>
                {/* Category */}
                <div className="col-span-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style={{background:catColor}}>
                    {s.category}
                  </span>
                </div>
                {/* Status */}
                <div className="col-span-1">
                  <Badge label={s.status} style={ss}/>
                </div>
                {/* Total comprado */}
                <div className="col-span-2 text-right">
                  <p className="text-sm font-semibold text-indigo-700">{fmt(s.totalPurchased||0)}</p>
                </div>
                {/* Última compra */}
                <div className="col-span-2 text-right">
                  <p className="text-sm text-gray-600">
                    {lastDate ? new Date(lastDate+"T12:00:00").toLocaleDateString("pt-BR") : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <SupplierDetailPanel supplier={selectedSupplier} finance={finance} purchases={purchases}
        onUpdatePurchase={(updated)=>{
          if (!canAlterar) return;
          if (setPurchases) setPurchases(prev=>prev.map(p=>p.id===updated.id?updated:p));
          // Sincroniza o lançamento vinculado em Contas a Pagar (criado na baixa
          // com purchaseId) — antes, pagar pelo painel do fornecedor deixava o
          // financeiro "pendente", cobrando uma compra já paga.
          if (setFinance) setFinance(prev=>prev.map(f=>f.purchaseId===updated.id
            ? { ...f, paidDate:updated.paidDate||"", status:updated.paidDate?"pago":"pendente", payment:updated.payment||f.payment||"" }
            : f));
        }}
        onClose={()=>setSelected(null)}
        onEdit={(s)=>{ setModal(s); setSelected(null); }}
        onDelete={(s)=>{ setConfirmDelete(s); setSelected(null); }}
        onRegisterPurchase={(s)=>{ setPurchaseModal(s); setSelected(null); }}
        canIncluir={canIncluir} canAlterar={canAlterar} canExcluir={canExcluir}/>}

      {purchaseModal && <RegisterPurchaseModal supplier={purchaseModal} onClose={()=>setPurchaseModal(null)} onSave={handleRegisterPurchase}/>}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><Icon name="trash" size={22} className="text-red-500"/></div>
            <h3 className="font-semibold text-gray-900 mb-1">Excluir fornecedor?</h3>
            <p className="text-sm text-gray-500 mb-4">{confirmDelete.name}</p>
            <div className="flex gap-2">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={()=>handleDelete(confirmDelete)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}
      {modal && <SupplierModal supplier={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={handleSave} purchases={purchases} suppliers={suppliers}/>}
    </div>
  );
};

// ─── Reports Module ───────────────────────────────────────────────────────
const PERIOD_OPTS = { "1m":"1 mês", "3m":"3 meses", "6m":"6 meses", "all":"Todo período" };

const ReportsModule = ({ orders, finance, customers, suppliers, purchases = [], products = [], params }) => {
  const [tab, setTab]           = useState("resumo");
  const [filterMode, setFilterMode] = useState("todos");
  const [period, setPeriod] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const filterByDate = (date) => {
    if (filterMode === "todos") return true;
    if (filterMode === "mes")   return date.startsWith(period);
    if (filterMode === "ano")   return date.startsWith(period.split("-")[0]);
    if (filterMode === "personalizado") {
      if (dateFrom && date < dateFrom) return false;
      if (dateTo   && date > dateTo)   return false;
      return true;
    }
    return true;
  };

  const periodLabel = () => {
    if (filterMode === "todos") return "Todos os períodos";
    if (filterMode === "personalizado") return dateFrom||dateTo ? `${dateFrom||"..."} → ${dateTo||"..."}` : "Personalizado";
    if (filterMode === "ano") return period.split("-")[0];
    const [y,m] = period.split("-").map(Number);
    return new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  };

  // No modo "Ano" as setas pulam 12 meses (antes, cada clique andava só 1 mês
  // — pra trocar de ano eram 12 cliques sem o rótulo mudar).
  const stepPeriod = (dir) => {
    const [y,m] = period.split("-").map(Number);
    const step = filterMode === "ano" ? 12 : 1;
    const d = new Date(y, m-1 + dir*step, 1);
    setPeriod(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };
  const prevMonth = () => stepPeriod(-1);
  const nextMonth = () => stepPeriod(1);

  const activeFin = useMemo(() =>
    finance.filter(f => f.status !== "cancelado" && filterByDate(f.date))
  , [finance, filterMode, period, dateFrom, dateTo]);

  const periodOrders = useMemo(() =>
    // Só pedidos já FATURADOS entram como receita real — um pedido "Novo"
    // sem NF emitida ainda não é uma venda concretizada (mesmo critério já
    // usado em Contas a Receber e no Dashboard).
    // Devolvido SEM pagamento também fica de fora: desde a v3.31.4 o estorno
    // só é lançado quando o pedido estava pago, então uma devolução não paga
    // não tem contrapartida em despesa — contá-la inflaria a receita.
    // Devolvido PAGO permanece: a receita conta e o estorno em despesa fecha
    // o resultado líquido corretamente.
    orders.filter(o => o.status !== "Cancelado" && !(o.status === "Devolvido" && !o.paidDate) && !!o.nfNumero && filterByDate(o.date))
  , [orders, filterMode, period, dateFrom, dateTo]);

  const periodPurchases = useMemo(() =>
    // Só compras já BAIXADAS entram como despesa real — um pedido de compra
    // "Em Aberto" ainda não chegou nem foi pago (mesmo critério já usado em
    // Contas a Pagar).
    (purchases||[]).filter(p => p.status === "Baixado" && filterByDate(p.date))
  , [purchases, filterMode, period, dateFrom, dateTo]);

  // KPIs
  // "despesasFin" exclui lançamentos com purchaseId — esses já são gerados
  // automaticamente na baixa do pedido de compra e contados em
  // "despesasCompras" via periodPurchases; somar os dois duplicava o valor.
  const receitasFin    = activeFin.filter(f=>f.type==="receita").reduce((s,f)=>s+f.amount,0);
  const despesasFin    = activeFin.filter(f=>f.type==="despesa" && !f.purchaseId).reduce((s,f)=>s+f.amount,0);
  const totalPedidos   = periodOrders.length;
  const receitasOrders = periodOrders.filter(o=>o.status!=="Cancelado").reduce((s,o)=>s+o.total,0);
  const despesasCompras = periodPurchases.reduce((s,p)=>s+(p.total||0),0);
  // Receita total = pedidos do período + lançamentos financeiros de receita (sem dupla contagem)
  const totalReceitas  = receitasOrders + receitasFin;
  // Despesa total = compras do período + lançamentos financeiros de despesa (mesmo raciocínio)
  const totalDespesas  = despesasCompras + despesasFin;
  const resultado      = totalReceitas - totalDespesas;
  const margem         = totalReceitas > 0 ? resultado/totalReceitas*100 : 0;
  const ticketMedio    = totalPedidos > 0 ? receitasOrders/totalPedidos : 0;

  // Monthly trend — last 6 months from today
  const trendData = useMemo(() => {
    const base = new Date();
    return Array.from({length:6}, (_,i) => {
      const d = new Date(base.getFullYear(), base.getMonth()-(5-i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const txs = finance.filter(f=>f.status!=="cancelado"&&f.date.startsWith(key));
      // Mesmo critério do resumo: só pedidos faturados e compras baixadas
      const ordMes = orders.filter(o=>o.status!=="Cancelado"&&!(o.status==="Devolvido"&&!o.paidDate)&&(o.nfNumero)&&(o.date||"").startsWith(key));
      const pcMes  = (purchases||[]).filter(p=>p.status==="Baixado"&&(p.date||"").startsWith(key));
      return {
        label: d.toLocaleDateString("pt-BR",{month:"short"}).replace(".",""),
        receitas: txs.filter(f=>f.type==="receita").reduce((s,f)=>s+f.amount,0)
                + ordMes.reduce((s,o)=>s+o.total,0),
        despesas: txs.filter(f=>f.type==="despesa" && !f.purchaseId).reduce((s,f)=>s+f.amount,0)
                + pcMes.reduce((s,p)=>s+(p.total||0),0),
      };
    });
  }, [finance, orders, purchases]);

  // Revenue by channel (from finance categories)
  const channelRevData = useMemo(() => {
    const CHANNEL_COLORS = {
      "Mercado Livre": "#f59e0b",
      "Shopee":        "#f97316",
      "WhatsApp":      "#22c55e",
      "Loja Própria":  "#6366f1",
      "Outro":         "#8b5cf6",
    };
    return CHANNELS.map(ch => ({
      label: ch,
      color: CHANNEL_COLORS[ch] || "#6b7280",
      value: periodOrders.filter(o => o.channel === ch && o.status !== "Cancelado").reduce((s,o) => s + o.total, 0),
    })).filter(c => c.value > 0).sort((a,b) => b.value - a.value);
  }, [periodOrders]);

  // Orders by channel
  const ordersByChannel = useMemo(() => CHANNELS.map(c => ({
    label:c,
    count: periodOrders.filter(o=>o.channel===c).length,
    total: periodOrders.filter(o=>o.channel===c).reduce((s,o)=>s+o.total,0),
  })).sort((a,b)=>b.total-a.total), [periodOrders]);

  // Orders by status (all time)
  const statusData = (params?.vendas?.statusList?.length
    ? [...new Set([...ORDER_STATUSES, ...params.vendas.statusList])]
    : ORDER_STATUSES
  ).map(s => ({ label:s, count:orders.filter(o=>o.status===s).length })).filter(d => d.count > 0 || ORDER_STATUSES.includes(d.label));

  // DRE grouped by category — inclui pedidos faturados e compras baixadas
  // como categorias próprias, pra bater com o total do Resumo (que soma os
  // dois junto com os lançamentos financeiros manuais).
  const dreGroups = useMemo(() => {
    const g = {};
    // Ignora lançamentos com purchaseId (gerados automaticamente na baixa)
    // pra não contar a mesma compra duas vezes — ela já entra como
    // "Compras (Fornecedores)" logo abaixo, com o valor de periodPurchases.
    activeFin.filter(f => !f.purchaseId).forEach(f => { if (!g[f.category]) g[f.category]={category:f.category,type:f.type,total:0}; g[f.category].total+=f.amount; });
    if (receitasOrders > 0) g["Vendas (Pedidos)"] = { category:"Vendas (Pedidos)", type:"receita", total:receitasOrders };
    if (despesasCompras > 0) g["Compras (Fornecedores)"] = { category:"Compras (Fornecedores)", type:"despesa", total:despesasCompras };
    return Object.values(g).sort((a,b)=>b.total-a.total);
  }, [activeFin, receitasOrders, despesasCompras]);
  const dreReceitas = dreGroups.filter(g=>g.type==="receita");
  const dreDespesas = dreGroups.filter(g=>g.type==="despesa");
  const expenseChartData = dreDespesas.map(g=>({ label:g.category.length>20?g.category.slice(0,18)+"…":g.category, fullLabel:g.category, value:g.total }));

  // Customer data — stats calculados DINAMICAMENTE dos pedidos (mesma regra
  // do CRM: exclui cancelados, match por nome normalizado). Antes, usava os
  // campos totalSpent/totalOrders gravados no cadastro: clientes criados
  // manualmente não têm esses campos (→ NaN nas somas) e, mesmo quando
  // existem, ficam congelados no valor da importação — divergindo do CRM.
  const custStats = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (o.status === "Cancelado") return;
      const k = (o.customer||"").toLowerCase();
      if (!k) return;
      if (!map[k]) map[k] = { totalSpent:0, totalOrders:0 };
      map[k].totalSpent  += Number(o.total)||0;
      map[k].totalOrders += 1;
    });
    return map;
  }, [orders]);
  const getCustStats = (c) => custStats[(c.name||"").toLowerCase()] || { totalSpent:0, totalOrders:0 };
  const segData = SEGMENTS.map(s => ({ label:s, count:customers.filter(c=>c.segment===s).length }));
  const topCustomers = [...customers].sort((a,b)=>getCustStats(b).totalSpent-getCustStats(a).totalSpent).slice(0,5);
  const custChannelData = CHANNELS.map(c => ({ label:c, count:customers.filter(x=>x.channel===c).length })).sort((a,b)=>b.count-a.count);
  const totalCustomerSpent = customers.reduce((s,c)=>s+getCustStats(c).totalSpent,0);
  const totalCustomerOrders = customers.reduce((s,c)=>s+getCustStats(c).totalOrders,0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análise de desempenho</p>
        </div>
      </div>

      {/* Date filter */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex gap-1 flex-wrap items-center">
          {[["todos","Todos"],["mes","Mês"],["ano","Ano"],["personalizado","Personalizado"]].map(([id,label])=>(
            <button key={id} onClick={()=>setFilterMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode===id?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {label}
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-1 capitalize">{filterMode!=="todos"&&periodLabel()}</span>
        </div>
        {(filterMode==="mes"||filterMode==="ano") && (
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize min-w-[160px] text-center">{periodLabel()}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        )}
        {filterMode==="personalizado" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">De:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Até:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
            </div>
            {(dateFrom||dateTo) && (
              <button onClick={()=>{setDateFrom("");setDateTo("");}} className="text-xs text-red-400 hover:text-red-600 font-medium">Limpar</button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {[["resumo","📊 Resumo"],["vendas","🛒 Vendas"],["financeiro","💰 Financeiro"],["clientes","👥 Clientes"],["produtos","📦 Produtos"]].map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)}
            className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${tab===id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ─── RESUMO ─── */}
      {tab==="resumo" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:"Receitas",     value:fmt(totalReceitas),                          sub:`${totalPedidos} pedido${totalPedidos!==1?"s":""} + ${activeFin.filter(f=>f.type==="receita").length} lanç.`, color:"text-green-600", bg:"bg-white" },
              { label:"Resultado",    value:fmt(resultado),                              sub:`Margem: ${margem.toFixed(1)}%`,                                 color:resultado>=0?"text-indigo-700":"text-red-500", bg:resultado>=0?"bg-indigo-50":"bg-red-50" },
              { label:"Pedidos",      value:totalPedidos,                                sub:"no período",                                                    color:"text-gray-900",  bg:"bg-white" },
              { label:"Ticket Médio", value:ticketMedio>0?fmt(ticketMedio):"—",          sub:"por pedido",                                                    color:"text-gray-900",  bg:"bg-white" },
            ].map(k => (
              <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-gray-100 shadow-sm`}>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{k.label}</p>
                <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Trend line chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">Evolução Financeira</h3>
                <p className="text-xs text-gray-400">Receitas vs Despesas — últimos 6 meses</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block rounded"/>Receitas</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block rounded"/>Despesas</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                <Tooltip content={<FinTooltip/>}/>
                <Line type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={2.5} dot={{r:4,fill:"#22c55e",strokeWidth:0}}/>
                <Line type="monotone" dataKey="despesas" stroke="#f87171" strokeWidth={2.5} dot={{r:4,fill:"#f87171",strokeWidth:0}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm mb-4">Pedidos por Status <span className="text-gray-400 font-normal">(todos os tempos)</span></h3>
            <div className="space-y-2.5">
              {statusData.map(s => {
                const total = orders.length || 1;
                const pct = (s.count/total*100);
                const st = STATUS_STYLES[s.label];
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full min-w-[105px] text-center ${st.bg} ${st.text}`}>{s.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${st.dot}`} style={{width:`${pct}%`}}/>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{s.count} ({pct.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── VENDAS ─── */}
      {tab==="vendas" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue by channel */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-1">Receita por Canal</h3>
              <p className="text-xs text-gray-400 mb-4">Baseado nos pedidos do período</p>
              {channelRevData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Sem dados no período</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={channelRevData} layout="vertical" margin={{left:8,right:16}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                    <XAxis type="number" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                    <YAxis type="category" dataKey="label" tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false} width={90}/>
                    <Tooltip formatter={v=>[fmt(v),"Receita"]}/>
                    <Bar dataKey="value" radius={[0,4,4,0]}>
                      {channelRevData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Orders by channel table */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-4">Pedidos por Canal</h3>
              {totalPedidos === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Sem pedidos no período</p>
              ) : (
                <div className="space-y-3">
                  {ordersByChannel.map((c,i) => {
                    const maxTotal = ordersByChannel[0]?.total || 1;
                    const pct = c.total ? (c.total/maxTotal*100) : 0;
                    const colors = ["bg-yellow-400","bg-orange-400","bg-green-400","bg-indigo-400"];
                    return (
                      <div key={c.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${colors[i%4]}`}/>
                            <span className="text-sm text-gray-700 font-medium">{c.label}</span>
                            <span className="text-xs text-gray-400">{c.count} ped.</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{c.total>0?fmt(c.total):"—"}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${colors[i%4]}`} style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Monthly trend bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm mb-4">Receitas vs Despesas — Mês a Mês</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} barGap={2} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                <Tooltip content={<FinTooltip/>}/>
                <Bar dataKey="receitas" fill="#22c55e" radius={[4,4,0,0]} name="Receitas"/>
                <Bar dataKey="despesas" fill="#f87171" radius={[4,4,0,0]} name="Despesas"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Supplier comparison */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm mb-4">Top Fornecedores por Volume Comprado</h3>
            <div className="space-y-2">
              {(() => {
                const supTotals = suppliers.map(s => ({
                  ...s,
                  _realTotal: purchases.filter(p => p.supplierName === s.name && p.status !== "Cancelado").reduce((sum, p) => sum + (p.total||0), 0)
                })).filter(s => s._realTotal > 0).sort((a,b) => b._realTotal - a._realTotal).slice(0,5);
                const maxBought = supTotals.reduce((m,x) => Math.max(m, x._realTotal), 0) || 1;
                return supTotals;
              })().map((s,i) => {
                const maxBought = purchases.filter(p=>p.status!=="Cancelado").reduce((m,p)=>Math.max(m,p.total||0),0)||1;
                const realTotal = s._realTotal;
                const pct = s.totalPurchased/maxBought*100;
                return (
                  <div key={s.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-bold text-gray-300 w-4">#{i+1}</span>
                    <div className={`w-7 h-7 rounded-lg ${avatarColor(s.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{initials(s.name)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{s.name}</p>
                      <div className="bg-gray-100 rounded-full h-1.5 mt-1"><div className="bg-indigo-400 h-1.5 rounded-full" style={{width:`${pct}%`}}/></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">{fmt(s.totalPurchased)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── FINANCEIRO ─── */}
      {tab==="financeiro" && (
        <div className="space-y-4">
          {/* DRE */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 text-sm">DRE Simplificado</h3>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{PERIOD_OPTS[period]}</span>
            </div>

            {/* Receitas section */}
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">↑ Receitas</p>
            {dreReceitas.length===0 && <p className="text-xs text-gray-400 italic mb-2">Sem receitas no período</p>}
            {dreReceitas.map(g => (
              <div key={g.category} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{background:CAT_COLORS[g.category]||"#94a3b8"}}/>
                  <span className="text-sm text-gray-600">{g.category}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">+{fmt(g.total)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5 mt-0.5">
              <span className="text-sm font-bold text-gray-700">Total Receitas</span>
              <span className="text-base font-bold text-green-600">+{fmt(totalReceitas)}</span>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 my-3"/>

            {/* Despesas section */}
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">↓ Despesas</p>
            {dreDespesas.length===0 && <p className="text-xs text-gray-400 italic mb-2">Sem despesas no período</p>}
            {dreDespesas.map(g => (
              <div key={g.category} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{background:CAT_COLORS[g.category]||"#94a3b8"}}/>
                  <span className="text-sm text-gray-600">{g.category}</span>
                </div>
                <span className="text-sm font-semibold text-red-500">-{fmt(g.total)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5 mt-0.5">
              <span className="text-sm font-bold text-gray-700">Total Despesas</span>
              <span className="text-base font-bold text-red-500">-{fmt(totalDespesas)}</span>
            </div>

            <div className="border-t-2 border-gray-300 mt-1 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Resultado Líquido</span>
              <div className="text-right">
                <p className={`text-2xl font-bold ${resultado>=0?"text-indigo-700":"text-red-600"}`}>{fmt(resultado)}</p>
                <p className={`text-xs ${margem>=0?"text-indigo-400":"text-red-400"}`}>Margem: {margem.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Expense chart */}
          {expenseChartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-4">Composição das Despesas</h3>
              <ResponsiveContainer width="100%" height={Math.max(130, expenseChartData.length*40)}>
                <BarChart data={expenseChartData} layout="vertical" margin={{left:8,right:40}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                  <YAxis type="category" dataKey="label" tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false} width={115}/>
                  <Tooltip formatter={(v,n,p)=>[fmt(v), p.payload.fullLabel||n]}/>
                  <Bar dataKey="value" radius={[0,4,4,0]} label={{position:"right",formatter:v=>fmt(v),fontSize:10,fill:"#94a3b8"}}>
                    {expenseChartData.map((_,i)=><Cell key={i} fill={["#f87171","#fb923c","#fbbf24","#a78bfa","#64748b","#94a3b8"][i%6]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pending summary */}
          <div className="grid grid-cols-2 gap-3">
            {[
              // "A Receber" reflete pedidos faturados e ainda não pagos (mesmo
              // critério da aba Contas a Receber) — receita de venda nunca
              // gera lançamento financeiro automático, então olhar só pra
              // "finance" sempre dava zero.
              { label:"A Receber",  value: fmt(orders.filter(o=>o.status!=="Cancelado"&&!!o.nfNumero&&!o.paidDate).reduce((s,o)=>s+o.total,0)), color:"text-green-600", bg:"bg-green-50", border:"border-green-100" },
              { label:"A Pagar",    value: fmt(finance.filter(f=>f.status==="pendente"&&f.type==="despesa").reduce((s,f)=>s+f.amount,0)), color:"text-red-500",   bg:"bg-red-50",   border:"border-red-100"   },
            ].map(k => (
              <div key={k.label} className={`${k.bg} rounded-xl p-4 border ${k.border} shadow-sm`}>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{k.label}</p>
                <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">pendente</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CLIENTES ─── */}
      {tab==="clientes" && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label:"Total Clientes",  value: customers.length,                                                                                   color:"text-gray-900"  },
              { label:"LTV Médio",       value: customers.length ? fmt(totalCustomerSpent/customers.length) : "—",                                  color:"text-indigo-700"},
              { label:"Ticket Médio",    value: totalCustomerOrders>0 ? fmt(totalCustomerSpent/totalCustomerOrders) : "—",                           color:"text-gray-900"  },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{k.label}</p>
                <p className={`text-lg font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Segment distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-4">Clientes por Status</h3>
              <div className="space-y-3">
                {segData.map(s => {
                  const total = customers.length||1;
                  const pct = s.count/total*100;
                  const st = SEG_STYLES[s.label];
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full min-w-[72px] text-center ${st.bg} ${st.text}`}>{s.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${st.dot}`} style={{width:`${pct}%`}}/>
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">{s.count} ({pct.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Channel preference */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-4">Canal Preferencial</h3>
              <div className="space-y-3">
                {custChannelData.map((c,i) => {
                  const total = customers.length||1;
                  const pct = c.count/total*100;
                  return (
                    <div key={c.label} className="flex items-center gap-3">
                      <Badge label={c.label} style={CHANNEL_STYLES[c.label]||{bg:"bg-gray-100",text:"text-gray-600"}}/>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${["bg-yellow-400","bg-orange-400","bg-green-400","bg-indigo-400"][i%4]}`} style={{width:`${pct}%`}}/>
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">{c.count} ({pct.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top customers */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm mb-4">Top 5 Clientes por LTV</h3>
            <div className="space-y-3">
              {topCustomers.map((c,i) => {
                const st = getCustStats(c);
                const maxSpent = getCustStats(topCustomers[0]||{}).totalSpent||1;
                const pct = st.totalSpent/maxSpent*100;
                const seg = SEG_STYLES[c.segment]||SEG_STYLES.Novo;
                return (
                  <div key={c.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-bold text-gray-200 w-5">#{i+1}</span>
                    <div className={`w-8 h-8 rounded-lg ${avatarColor(c.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{initials(c.name)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-800 truncate">{c.name}</span>
                        <Badge label={c.segment} style={seg}/>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{width:`${pct}%`}}/>
                        </div>
                        <span className="text-[10px] text-gray-400">{st.totalOrders} ped.</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-sm shrink-0">{fmt(st.totalSpent)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── PRODUTOS ─── */}
      {tab==="produtos" && (() => {
        // Build per-product sales stats from order items
        const prodStats = {};
        orders.filter(o => o.status !== "Cancelado" && o.status !== "Devolvido" && filterByDate(o.date))
          .forEach(o => {
            const items = o.itemsList || [];
            items.forEach(it => {
              if (!it._prodId) return;
              if (!prodStats[it._prodId]) prodStats[it._prodId] = { qtySold:0, revenue:0, orderCount:0 };
              prodStats[it._prodId].qtySold    += it.qty || 0;
              prodStats[it._prodId].revenue    += it.total || 0;
              prodStats[it._prodId].orderCount += 1;
            });
          });

        const rows = products
          .filter(p => p.status !== "Inativo")
          .map(p => {
            const s = prodStats[p.id] || { qtySold:0, revenue:0, orderCount:0 };
            const avgPrice  = s.qtySold > 0 ? s.revenue / s.qtySold : p.price || 0;
            const cost      = p.cost || 0;
            const margin    = avgPrice > 0 && cost > 0 ? ((avgPrice - cost) / avgPrice * 100) : null;
            const stockVal  = (p.stock || 0) * cost;
            return { ...p, ...s, avgPrice, margin, stockVal };
          })
          .sort((a,b) => b.revenue - a.revenue);

        const totalRevenueProd = rows.reduce((s,r)=>s+r.revenue,0);
        const totalQtySold     = rows.reduce((s,r)=>s+r.qtySold,0);
        const soldRows         = rows.filter(r=>r.qtySold>0);

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label:"SKUs Ativos",      value: products.filter(p=>p.status!=="Inativo").length,   color:"text-gray-900" },
                { label:"SKUs com Venda",   value: soldRows.length,                                   color:"text-indigo-700"},
                { label:"Unidades Vendidas",value: totalQtySold.toLocaleString("pt-BR"),              color:"text-gray-900" },
                { label:"Receita (Itens)",  value: fmt(totalRevenueProd),                             color:"text-green-600"},
              ].map(k=>(
                <div key={k.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{k.label}</p>
                  <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm">Margem por Produto</h3>
                <span className="text-xs text-gray-400">custo × preço médio de venda</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Produto</th>
                      <th className="text-center px-3 py-3 hidden md:table-cell">Categoria</th>
                      <th className="text-right px-3 py-3">Custo</th>
                      <th className="text-right px-3 py-3">Preço Médio</th>
                      <th className="text-right px-3 py-3">Margem</th>
                      <th className="text-right px-3 py-3 hidden lg:table-cell">Qtd Vendida</th>
                      <th className="text-right px-3 py-3">Receita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map(p => {
                      const catColor = INV_CAT_COLORS[p.category]||"#94a3b8";
                      const marginColor = p.margin === null ? "text-gray-400"
                        : p.margin >= 40 ? "text-green-600"
                        : p.margin >= 20 ? "text-amber-600"
                        : "text-red-500";
                      const marginBg = p.margin === null ? "bg-gray-100"
                        : p.margin >= 40 ? "bg-green-100"
                        : p.margin >= 20 ? "bg-amber-100"
                        : "bg-red-100";
                      return (
                        <tr key={p.id} className={`hover:bg-gray-50/50 ${p.qtySold===0?"opacity-50":""}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800 text-sm leading-tight">{p.name}</p>
                            <p className="font-mono text-[10px] text-gray-400">{p.sku}</p>
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{background:catColor}}>{p.category}</span>
                          </td>
                          <td className="px-3 py-3 text-right text-xs text-gray-600">
                            {p.cost > 0 ? fmt(p.cost) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-3 text-right text-xs font-medium text-gray-800">
                            {p.qtySold > 0 ? fmt(p.avgPrice) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {p.margin !== null ? (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${marginBg} ${marginColor}`}>
                                {p.margin.toFixed(1)}%
                              </span>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-3 py-3 text-right text-xs text-gray-600 hidden lg:table-cell">
                            {p.qtySold > 0 ? `${p.qtySold} ${p.unit||"un"}` : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-3 text-right text-xs font-bold text-gray-900">
                            {p.revenue > 0 ? fmt(p.revenue) : <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Nenhum produto cadastrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400">🟢 Margem ≥ 40% · 🟡 20–40% · 🔴 &lt; 20% · Itens acinzentados = sem vendas no período</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ─── Stock Movement Modal ─────────────────────────────────────────────────
const StockMovementModal = ({ product, onClose, onSave }) => {
  const [type, setType]   = useState("entrada");
  const [qty, setQty]     = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate]   = useState(today());
  const [notes, setNotes] = useState("");
  const [saidaErr, setSaidaErr] = useState(false);
  const reasons = type==="entrada" ? MOV_REASONS_IN : type==="saida" ? MOV_REASONS_OUT : ["Contagem física","Correção de sistema","Outro"];
  const newStock = qty ? (type==="entrada" ? product.stock+Number(qty) : type==="saida" ? Math.max(0,product.stock-Number(qty)) : Number(qty)) : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div><h2 className="font-semibold text-gray-800">Movimentação de Estoque</h2><p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{product.name}</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {[["entrada","↑ Entrada","bg-green-500"],["saida","↓ Saída","bg-red-500"],["ajuste","⇔ Ajuste","bg-blue-500"]].map(([t,label,clr])=>(
              <button key={t} onClick={()=>{setType(t);setReason("");setSaidaErr(false);}}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${type===t?`${clr} text-white`:"bg-white text-gray-500 hover:bg-gray-50"}`}>{label}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{type==="ajuste"?"Nova Qtd":"Quantidade"} *</label>
              <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={qty} onChange={e=>{setQty(e.target.value);setSaidaErr(false);}} placeholder="0"/>
              {saidaErr && <p className="text-xs text-red-600 mt-1">⚠️ Saída maior que o estoque disponível ({product.stock||0} {product.unit}). Use "Ajuste" se for correção de contagem.</p>}
              <p className="text-xs text-gray-400 mt-1">
                Atual: <strong>{product.stock}</strong>
                {newStock!==null && <> → <strong className={newStock>product.stock?"text-green-600":newStock<product.stock?"text-red-500":"text-gray-700"}>{newStock}</strong></>}
                {" "}{product.unit}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Data</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={date} onChange={e=>setDate(e.target.value)}/>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Motivo</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={reason} onChange={e=>setReason(e.target.value)}>
              <option value="">Selecione...</option>
              {reasons.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Observações</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Nº NF, lote, observações..."/>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={() => {
              if(!qty||Number(qty)<=0) return;
              // Saída maior que o estoque disponível: bloqueia — antes, o
              // estoque clampava em zero mas o movimento gravava a quantidade
              // cheia, e o histórico dizia que saíram unidades que não existiam.
              if(type==="saida" && Number(qty) > (product.stock||0)) { setSaidaErr(true); return; }
              onSave({type,qty:Number(qty),reason:reason||reasons[0],date,notes});
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Registrar</button>
        </div>
      </div>
    </div>
  );
};

// ─── Product Modal ────────────────────────────────────────────────────────
const ProductModal = ({ product, suppliers, products: allProducts = [], variantCatalogs = [], onApplyCatalog, onClose, onSave }) => {
  const isNew = !product;
  const [form, setForm] = useState(product ? { ...product } : {
    name:"", sku:"", category:"Linhas / Fios",
    channels:[], price:"", cost:"", stock:"", minStock:"", unit:"un", status:"Ativo",
    description:"", parentId:"", variantLabel:""
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const margin = form.price && form.cost ? ((Number(form.price)-Number(form.cost))/Number(form.price)*100).toFixed(1) : null;
  const [nameErr, setNameErr] = useState(false);

  const handleSave = () => {
    if (!form.name.trim()) { setNameErr(true); return; }
    onSave({ ...form, tags:[],
      price:Number(form.price)||0, cost:Number(form.cost)||0,
      stock: isNew ? (Number(form.stock)||0) : product.stock,
      minStock:Number(form.minStock)||0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{isNew?"Novo Produto":"Editar Produto"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Nome do Produto *</label>
            <input className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${nameErr?"border-red-300 focus:ring-red-300":"border-gray-200 focus:ring-indigo-300"}`}
              value={form.name} onChange={e=>{set("name",e.target.value); if(nameErr) setNameErr(false);}} placeholder="Ex: Linha Bag Sacaria 500m Branca"/>
            {nameErr && <p className="text-xs text-red-500 mt-1">⚠️ Preencha o nome do produto para salvar</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">SKU / Código</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.sku} onChange={e=>set("sku",e.target.value)} placeholder="LBS-500-BR"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Categoria</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.category} onChange={e=>set("category",e.target.value)}>
                {INV_CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Prices */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preços</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Custo (R$)</label>
                <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.cost} onChange={e=>set("cost",e.target.value)} placeholder="0,00"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Unidade</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.unit} onChange={e=>set("unit",e.target.value)}>
                  {INV_UNITS.map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
          {/* Stock */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estoque</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {isNew && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Estoque Inicial</label>
                  <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form.stock} onChange={e=>set("stock",e.target.value)} placeholder="0"/>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Estoque Mínimo</label>
                <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.minStock} onChange={e=>set("minStock",e.target.value)} placeholder="0"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.status} onChange={e=>set("status",e.target.value)}>
                  <option>Ativo</option><option>Inativo</option><option>Descontinuado</option>
                </select>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">🎨 Grade / Variante <span className="text-gray-300 font-normal normal-case">(opcional)</span></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Produto Pai</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.parentId||""} onChange={e=>set("parentId",e.target.value)}>
                  <option value="">Produto independente</option>
                  {allProducts.filter(p=>!p.parentId&&p.id!==(product?.id||"")).map(p=>(
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Label da Variante</label>
                <input className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${!form.parentId?"bg-gray-50 text-gray-400":""}`}
                  value={form.variantLabel||""} onChange={e=>set("variantLabel",e.target.value)}
                  placeholder="Kit 10 cones, Azul..." disabled={!form.parentId}/>
              </div>
            </div>
            {!isNew && !product?.parentId && variantCatalogs.length>0 && (
              <button type="button" onClick={()=>onApplyCatalog(product)}
                className="mt-3 w-full text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg py-2 transition-colors">
                🎨 Gerar várias variantes de uma vez (Catálogo de Variante)
              </button>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Descrição</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Descrição do produto..."/>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            {isNew?"Criar Produto":"Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Product Detail Panel ─────────────────────────────────────────────────
const ProductDetailPanel = ({ product, movements, onClose, onEdit, onDelete, onMove, canAlterar=true, canExcluir=true }) => {
  if (!product) return null;
  const ss  = stockStatus(product.stock, product.minStock);
  const cc  = avatarColor(product.name);
  const catColor = INV_CAT_COLORS[product.category]||"#94a3b8";
  const margin = product.price&&product.cost ? ((product.price-product.cost)/product.price*100).toFixed(1) : null;
  const prdMoves = movements.filter(m=>String(m.productId)===String(product.id)).sort((a,b)=> parseInt(b.id.replace(/\D/g,"")) - parseInt(a.id.replace(/\D/g,"")));
  const totalIn  = prdMoves.filter(m=>m.type==="entrada").reduce((s,m)=>s+m.qty,0);
  const totalOut = prdMoves.filter(m=>m.type==="saida").reduce((s,m)=>s+m.qty,0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${cc} flex items-center justify-center text-white font-bold text-base`}>
              {initials(product.name)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm leading-tight max-w-[220px]">{product.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{background:catColor}}>{product.category}</span>
                <span className="font-mono text-xs text-gray-400">{product.sku}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5"><Icon name="x"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Stock indicator */}
          <div className={`${ss.bg} rounded-2xl p-4 flex items-center justify-between`}>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estoque Atual</p>
              <p className={`text-4xl font-black mt-1 ${ss.text}`}>{product.stock}</p>
              <p className="text-xs text-gray-500 mt-0.5">{product.unit} · Mínimo: {product.minStock}</p>
            </div>
            <div className="text-right">
              <Badge label={ss.label} style={ss}/>
              <div className="mt-2 w-24 bg-white/60 rounded-full h-2">
                <div className={`h-2 rounded-full ${ss.bar}`}
                  style={{width:`${Math.min(100, product.minStock>0?(product.stock/(product.minStock*2)*100):100)}%`}}/>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:"Preço Venda", value:product.price>0?fmt(product.price):"—", color:"text-gray-900" },
              { label:"Custo",       value:product.cost>0?fmt(product.cost):"—",   color:"text-gray-900" },
              { label:"Margem",      value:margin!==null?`${margin}%`:"—",         color:margin?Number(margin)>30?"text-green-600":Number(margin)>15?"text-amber-500":"text-red-500":"text-gray-400" },
              { label:"Valor em Est.",value:fmt(product.stock*(product.cost||0)),  color:"text-indigo-700"},
            ].map(m=>(
              <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className={`font-bold text-sm mt-0.5 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informações</p>
            {product.channels?.length>0 && (
              <div className="flex items-start gap-2 text-sm">
                <span className="w-4 mt-0.5">🛒</span>
                <div className="flex flex-wrap gap-1">
                  {product.channels.map(c=><Badge key={c} label={c} style={CHANNEL_STYLES[c]||{bg:"bg-gray-100",text:"text-gray-600"}}/>)}
                </div>
              </div>
            )}
            {product.description && <div className="flex gap-2 text-sm"><span className="w-4">📝</span><span className="text-gray-600 text-xs">{product.description}</span></div>}
          </div>

          {/* Movement stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Entradas</p>
              <p className="text-lg font-bold text-green-600 mt-0.5">+{totalIn} {product.unit}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Saídas</p>
              <p className="text-lg font-bold text-red-500 mt-0.5">-{totalOut} {product.unit}</p>
            </div>
          </div>

          {/* Movement history */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Histórico de Movimentações {prdMoves.length>0&&<span className="font-normal text-gray-400">({prdMoves.length})</span>}
            </p>
            {prdMoves.length===0 ? (
              <p className="text-xs text-gray-400 italic bg-gray-50 rounded-xl p-3 text-center">Nenhuma movimentação registrada</p>
            ) : (
              <div className="space-y-2">
                {prdMoves.slice(0,10).map(m=>(
                  <div key={m.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${m.type==="entrada"?"bg-green-100 text-green-600":m.type==="saida"?"bg-red-100 text-red-500":"bg-blue-100 text-blue-600"}`}>
                      {m.type==="entrada"?"↑":m.type==="saida"?"↓":"⇔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 font-medium truncate">{m.reason}</p>
                      <p className="text-[10px] text-gray-400">{m.date}{m.notes&&` · ${m.notes}`}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${m.type==="entrada"?"text-green-600":m.type==="saida"?"text-red-500":"text-blue-600"}`}>
                      {m.type==="entrada"?"+":m.type==="saida"?"-":""}{m.qty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2 shrink-0">
          {canExcluir && <button onClick={()=>onDelete(product)} className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"><Icon name="trash" size={16}/></button>}
          {canAlterar && (
            <button onClick={()=>onMove(product)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 font-medium">
              <Icon name="arrowUp" size={14}/> Movimentar
            </button>
          )}
          {canAlterar && (
            <button onClick={()=>onEdit(product)} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Icon name="edit" size={14}/> Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Inventory Module ─────────────────────────────────────────────────────
const ApplyCatalogModal = ({ product, catalogs, onClose, onConfirm }) => {
  const [catalogId, setCatalogId] = useState(catalogs.length===1 ? catalogs[0].id : "");
  const catalog = catalogs.find(c=>c.id===catalogId);
  const [selected, setSelected] = useState(new Set(catalogs.length===1 ? catalogs[0].codigos : []));

  useEffect(() => { if (catalog) setSelected(new Set(catalog.codigos)); }, [catalogId]);

  const toggle = (code) => setSelected(prev => {
    const next = new Set(prev);
    next.has(code) ? next.delete(code) : next.add(code);
    return next;
  });

  const noSku = !product.sku || !product.sku.trim();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900">🎨 Aplicar Catálogo de Variante</h2>
            <p className="text-xs text-gray-400 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={18}/></button>
        </div>

        {noSku ? (
          <div className="p-6 text-center">
            <p className="text-3xl mb-2">⚠️</p>
            <p className="text-sm text-gray-600 font-medium">Esse produto não tem SKU preenchido</p>
            <p className="text-xs text-gray-400 mt-1">O SKU de cada variante é gerado a partir do SKU do produto pai + o código (ex: SKU pai "001" + código "000" = "001000"). Edite o produto e preencha o SKU antes de aplicar um catálogo.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-600 hover:bg-gray-200">Entendi</button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Catálogo</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={catalogId} onChange={e=>setCatalogId(e.target.value)}>
                  <option value="">Selecione um catálogo...</option>
                  {catalogs.map(c=><option key={c.id} value={c.id}>{c.nome} ({(c.codigos||[]).length})</option>)}
                </select>
              </div>

              {catalog && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-600">Códigos a gerar ({selected.size}/{catalog.codigos.length})</label>
                    <div className="flex gap-2">
                      <button onClick={()=>setSelected(new Set(catalog.codigos))} className="text-xs text-indigo-600 hover:underline">Todos</button>
                      <button onClick={()=>setSelected(new Set())} className="text-xs text-gray-400 hover:underline">Nenhum</button>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-2 max-h-56 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {catalog.codigos.map(code=>(
                      <label key={code} className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg cursor-pointer ${selected.has(code)?"bg-indigo-50 text-indigo-700":"text-gray-500 hover:bg-gray-50"}`}>
                        <input type="checkbox" className="accent-indigo-600" checked={selected.has(code)} onChange={()=>toggle(code)}/>
                        <span className="font-mono">{code}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {(() => { const sel=[...selected]; return (
                      <>Prévia do SKU: <span className="font-mono">{product.sku}{sel[0]||"___"}</span>
                      {sel[1] && <>, <span className="font-mono">{product.sku}{sel[1]}</span>...</>}</>
                    ); })()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button disabled={!catalog || selected.size===0} onClick={()=>onConfirm([...selected])}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
                Gerar {selected.size>0?selected.size:""} Variante{selected.size!==1?"s":""}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const InventoryModule = ({ products, setProducts, movements, setMovements, suppliers, variantCatalogs=[], onPriceHunt, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "inventory", "incluir");
  const canAlterar = getUserPerm(currentUser, "inventory", "alterar");
  const canExcluir = getUserPerm(currentUser, "inventory", "excluir");
  const [search, setSearch]           = useState("");
  const [filterCat,    setFilterCat]    = useState("Todas");
  const [filterStock,  setFilterStock]  = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [selected, setSelected]       = useState(null);
  const [modal, setModal]             = useState(null);
  const [moveModal, setMoveModal]     = useState(null);
  const [applyCatalogProduct, setApplyCatalogProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]             = useState(null);
  const [dismissAlerts, setDismissAlerts] = useState(false);
  const [filterMode, setFilterMode]   = useState("todos");
  const [period, setPeriod] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const filterByDate = (date) => {
    if (filterMode === "todos") return true;
    if (filterMode === "mes")   return date.startsWith(period);
    if (filterMode === "ano")   return date.startsWith(period.split("-")[0]);
    if (filterMode === "personalizado") {
      if (dateFrom && date < dateFrom) return false;
      if (dateTo   && date > dateTo)   return false;
      return true;
    }
    return true;
  };

  const periodLabel = () => {
    if (filterMode === "todos") return "Todos";
    if (filterMode === "personalizado") return dateFrom||dateTo ? `${dateFrom||"..."} → ${dateTo||"..."}` : "Personalizado";
    if (filterMode === "ano") return period.split("-")[0];
    const [y,m] = period.split("-").map(Number);
    return new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  };

  // No modo "Ano" as setas pulam 12 meses (antes, cada clique andava só 1 mês
  // — pra trocar de ano eram 12 cliques sem o rótulo mudar).
  const stepPeriod = (dir) => {
    const [y,m] = period.split("-").map(Number);
    const step = filterMode === "ano" ? 12 : 1;
    const d = new Date(y, m-1 + dir*step, 1);
    setPeriod(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };
  const prevMonth = () => stepPeriod(-1);
  const nextMonth = () => stepPeriod(1);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  // Stats
  const totalItems   = products.filter(p=>p.status==="Ativo").reduce((s,p)=>s+(p.stock||0),0);
  const totalValue   = products.filter(p=>p.status==="Ativo").reduce((s,p)=>s+(p.stock||0)*(p.cost||0),0);
  const alertProducts = products.filter(p=>p.status==="Ativo" && ((p.stock||0)===0 || (p.stock||0)<(p.minStock||0)));
  const zeroProducts  = products.filter(p=>p.status==="Ativo" && (p.stock||0)===0);

  // Filter
  const filtered = useMemo(() => products
    .filter(p => filterCat   === "Todas" || p.category === filterCat)
    .filter(p => {
      if (filterStock === "Normal") return p.stock >= p.minStock && p.stock > 0;
      if (filterStock === "Baixo")  return p.stock > 0 && p.stock < p.minStock;
      if (filterStock === "Zerado") return p.stock === 0;
      return true;
    })
    .filter(p => filterStatus === "Todos" || p.status === filterStatus)
    .filter(p => !search || [p.name,p.sku,p.category].some(f=>f?.toLowerCase().includes(search.toLowerCase())))
    .filter(p => !p.createdAt || filterByDate(p.createdAt))
  , [products, filterCat, filterStock, filterStatus, search, filterMode, period, dateFrom, dateTo]);

  const selectedProduct = products.find(p=>p.id===selected);

  // CRUD
  const nextPrdId = (ps) => { const n=ps.map(p=>parseInt(p.id.replace("PRD-",""))||0); return `PRD-${String(Math.max(0,...n)+1).padStart(3,"0")}`; };
  const nextMovId = (ms) => { const n=ms.map(m=>parseInt(m.id.replace("MOV-",""))||0); return `MOV-${String(Math.max(0,...n)+1).padStart(3,"0")}`; };

  const handleSaveProd = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) {
      setProducts(prev=>prev.map(p=>p.id===data.id?data:p));
    } else {
      const newId = nextPrdId(products);
      const newPrd = { ...data, id:newId, createdAt:today(), lastMovement:"" };
      setProducts(prev=>[...prev,newPrd]);
      if (data.stock>0) {
        const newMov = { id:nextMovId(movements), productId:newId, type:"entrada", qty:data.stock, date:today(), reason:"Estoque inicial", notes:"" };
        setMovements(prev=>[...prev,newMov]);
      }
    }
    setModal(null);
    showToast(data.id?"✅ Produto atualizado!":"✅ Produto criado!");
  };

  const handleApplyCatalog = (parent, selectedCodes) => {
    if (!parent.sku || !parent.sku.trim()) {
      showToast("⚠️ Preencha o SKU do produto antes de aplicar um catálogo");
      return;
    }
    const existingSkus = new Set(products.map(p=>p.sku));
    let nextNum = Math.max(0, ...products.map(p=>parseInt(p.id.replace("PRD-",""))||0));
    const novos = [];
    let pulados = 0;
    selectedCodes.forEach(code => {
      const sku = `${parent.sku}${code}`;
      if (existingSkus.has(sku)) { pulados += 1; return; }
      nextNum += 1;
      novos.push({
        id: `PRD-${String(nextNum).padStart(3,"0")}`,
        name: `${parent.name} - ${code}`,
        sku,
        category: parent.category,
        channels: [...(parent.channels||[])],
        price: 0,
        cost: parent.cost || 0,
        stock: 0,
        minStock: parent.minStock || 0,
        unit: parent.unit || "un",
        status: "Ativo",
        description: "",
        parentId: parent.id,
        variantLabel: code,
        createdAt: today(),
        lastMovement: "",
      });
      existingSkus.add(sku);
    });
    if (novos.length>0) setProducts(prev=>[...prev, ...novos]);
    setApplyCatalogProduct(null);
    showToast(`✅ ${novos.length} variante(s) gerada(s)${pulados?` · ${pulados} pulada(s) por SKU já existir`:""}`);
  };

  const handleDelete = (prd) => {
    if (!canExcluir) return; // segurança extra, além do botão já escondido
    setProducts(prev=>prev.filter(p=>p.id!==prd.id));
    setConfirmDelete(null);
    if (selected===prd.id) setSelected(null);
    showToast("🗑 Produto excluído");
  };

  const handleMove = (data) => {
    if (!canAlterar) return; // segurança extra, além do botão já escondido
    const newStock = data.type==="entrada"
      ? moveModal.stock + data.qty
      : data.type==="saida"
        ? Math.max(0, moveModal.stock - data.qty)
        : data.qty; // ajuste

    setProducts(prev=>prev.map(p=>p.id===moveModal.id?{...p,stock:newStock,lastMovement:data.date}:p));
    const newMov = { id:nextMovId(movements), productId:moveModal.id, type:data.type, qty:data.qty, date:data.date, reason:data.reason, notes:data.notes };
    setMovements(prev=>[...prev,newMov]);
    setMoveModal(null);
    const delta = data.type==="entrada"?`+${data.qty}`:data.type==="saida"?`-${data.qty}`:`→${data.qty}`;
    showToast(`✅ Movimentação registrada (${delta} ${moveModal.unit})`);
  };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} SKUs cadastrados</p>
        </div>
        {canIncluir && (
          <button onClick={()=>setModal("new")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-1.5">
            <Icon name="plus" size={15}/> Produto
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">SKUs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">{products.filter(p=>p.status==="Ativo").length} ativos</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Itens em Estoque</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{totalItems.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-gray-400 mt-0.5">unidades totais</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Valor em Estoque</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{fmt(totalValue)}</p>
          <p className="text-xs text-gray-400 mt-0.5">a preço de custo</p>
        </div>
        <div className={`rounded-xl p-4 border shadow-sm ${alertProducts.length>0?"bg-amber-50 border-amber-100":"bg-white border-gray-100"}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Alertas</p>
          <p className={`text-2xl font-bold mt-1 ${alertProducts.length>0?"text-amber-600":"text-gray-400"}`}>{alertProducts.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">{zeroProducts.length} zerado(s)</p>
        </div>
      </div>

      {/* Alerts banner */}
      {alertProducts.length>0 && !dismissAlerts && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-amber-700">⚠️ Produtos que precisam de reposição</p>
            <button onClick={()=>setDismissAlerts(true)} className="text-amber-400 hover:text-amber-600"><Icon name="x" size={14}/></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertProducts.map(p => {
              const ss = stockStatus(p.stock,p.minStock);
              return (
                <button key={p.id} onClick={()=>setSelected(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${ss.bg} ${ss.text} hover:opacity-80 transition-opacity`}>
                  {p.name} — {p.stock} {p.unit}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Nome, SKU, fornecedor, tag..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
          value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option>Todas</option>{INV_CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
          value={filterStock} onChange={e=>setFilterStock(e.target.value)}>
          <option>Todos</option><option>Normal</option><option>Baixo</option><option>Zerado</option>
        </select>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
          value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Ativo">● Ativo</option>
          <option value="Inativo">○ Inativo</option>
        </select>
      </div>

      {/* Date filter */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex gap-1 flex-wrap">
          {[["todos","Todos"],["mes","Mês"],["ano","Ano"],["personalizado","Personalizado"]].map(([id,label])=>(
            <button key={id} onClick={()=>setFilterMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode===id?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {label}
            </button>
          ))}
          {filterMode!=="todos" && <span className="text-xs text-gray-400 self-center ml-1">{filtered.length} produto{filtered.length!==1?"s":""}</span>}
        </div>
        {(filterMode==="mes"||filterMode==="ano") && (
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize min-w-[150px] text-center">{periodLabel()}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        )}
        {filterMode==="personalizado" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">De:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Até:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
            </div>
            {(dateFrom||dateTo) && (
              <button onClick={()=>{setDateFrom("");setDateTo("");}} className="text-xs text-red-400 hover:text-red-600 font-medium">Limpar</button>
            )}
          </div>
        )}
      </div>

      {/* Product table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length===0 ? (
          <div className="py-16 text-center text-gray-400">
            <Icon name="inventory" size={32} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Categoria</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estoque</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Mín</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Custo Méd.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Preço Rep.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const ss  = stockStatus(p.stock, p.minStock);
                  const repPrice = p.lastPurchasePrice || null;
                  const barW = p.minStock>0 ? Math.min(100, p.stock/(p.minStock*2)*100) : 100;
                  const catColor = INV_CAT_COLORS[p.category]||"#94a3b8";
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <button onClick={()=>setSelected(p.id)} className="text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-gray-800 hover:text-indigo-600 transition-colors text-sm">{p.name}</p>
                            {p.parentId && (
                              <span className="text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">variante</span>
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-gray-400">
                            {p.sku}
                            {p.parentId && p.variantLabel && ` · ${p.variantLabel}`}
                            {p.parentId && !p.variantLabel && ` · ${(products.find(x=>x.id===p.parentId)||{}).name||""}`}
                          </p>
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{background:catColor}}>{p.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-base font-bold ${ss.text}`}>{p.stock}</span>
                          <div className="w-14 bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${ss.bar}`} style={{width:`${barW}%`}}/>
                          </div>
                          <Badge label={ss.label} style={ss}/>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500 hidden md:table-cell">{p.minStock}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 hidden lg:table-cell">{p.cost>0?fmt(p.cost):"—"}</td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        {repPrice ? <span className="text-sm font-semibold text-gray-800">{fmt(repPrice)}</span> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {/* Toggle Ativo/Inativo */}
                          <button
                            onClick={()=>setProducts(prev=>prev.map(x=>x.id===p.id?{...x,status:x.status==="Ativo"?"Inativo":"Ativo"}:x))}
                            title={p.status==="Ativo"?"Desativar produto":"Ativar produto"}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${p.status==="Ativo"?"bg-green-50 text-green-600 border-green-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200":"bg-red-50 text-red-500 border-red-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"}`}>
                            {p.status==="Ativo"?"● Ativo":"○ Inativo"}
                          </button>
                          {onPriceHunt && (
                            <button onClick={()=>onPriceHunt(p.name,p.price)} title="Pesquisar preços (PriceHunt)"
                              className="p-1.5 rounded-lg text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-colors text-xs">🔍</button>
                          )}
                          {canAlterar && (
                            <button onClick={()=>{setMoveModal(p);}} title="Entrada"
                              className="p-1.5 rounded-lg text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors font-bold text-xs">↑</button>
                          )}
                          {canAlterar && (
                            <button onClick={()=>{setMoveModal(p);}} title="Saída"
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors font-bold text-xs">↓</button>
                          )}
                          {canAlterar && (
                            <button onClick={()=>setModal(p)} className="p-1.5 rounded-lg text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors" title="Editar produto">
                              <Icon name="edit" size={13}/>
                            </button>
                          )}
                          {canIncluir && !p.parentId && (
                            <button onClick={()=>setModal({name:"",sku:"",category:p.category,channels:[...p.channels],price:"",cost:p.cost||"",stock:"",minStock:p.minStock||"",unit:p.unit||"un",status:"Ativo",description:"",parentId:p.id,variantLabel:""})}
                              className="p-1.5 rounded-lg text-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors text-xs font-bold" title="Criar variante deste produto">
                              +V
                            </button>
                          )}
                          {canIncluir && !p.parentId && variantCatalogs.length>0 && (
                            <button onClick={()=>setApplyCatalogProduct(p)}
                              className="p-1.5 rounded-lg text-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors" title="Aplicar catálogo de variante (gerar várias de uma vez)">
                              🎨
                            </button>
                          )}
                          {canExcluir && (
                            <button onClick={()=>setConfirmDelete(p)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Icon name="trash" size={13}/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <ProductDetailPanel product={selectedProduct} movements={movements}
          onClose={()=>setSelected(null)}
          onEdit={(p)=>{setModal(p);setSelected(null);}}
          onDelete={(p)=>setConfirmDelete(p)}
          onMove={(p)=>{setMoveModal(p);setSelected(null);}}
          canAlterar={canAlterar} canExcluir={canExcluir}/>
      )}

      {moveModal && <StockMovementModal product={moveModal} onClose={()=>setMoveModal(null)} onSave={handleMove}/>}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><Icon name="trash" size={22} className="text-red-500"/></div>
            <h3 className="font-semibold text-gray-900 mb-1">Excluir produto?</h3>
            <p className="text-sm text-gray-500 mb-2">{confirmDelete.name}</p>
            {(confirmDelete.stock||0) > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                ⚠️ Este produto tem <strong>{confirmDelete.stock} {confirmDelete.unit||"un"}</strong> em estoque
                ({fmt((confirmDelete.stock||0)*(confirmDelete.cost||0))} em custo). A exclusão remove esse valor do inventário sem rastro.
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={()=>handleDelete(confirmDelete)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}
      {modal && <ProductModal product={modal==="new"?null:modal} suppliers={suppliers} products={products} variantCatalogs={variantCatalogs}
        onApplyCatalog={(p)=>{setModal(null); setApplyCatalogProduct(p);}}
        onClose={()=>setModal(null)} onSave={handleSaveProd}/>}
      {applyCatalogProduct && (
        <ApplyCatalogModal product={applyCatalogProduct} catalogs={variantCatalogs}
          onClose={()=>setApplyCatalogProduct(null)}
          onConfirm={(codes)=>handleApplyCatalog(applyCatalogProduct, codes)}/>
      )}
    </div>
  );
};

// ─── NF-e Modal ───────────────────────────────────────────────────────────
const NfeModal = ({ nfe, onClose, onSave }) => {
  const isNew = !nfe;
  const [form, setForm] = useState(nfe ? { ...nfe } : {
    numero:"", serie:"1", tipo:"NF-e", dataEmissao:today(),
    destinatario:"", cpfCnpj:"", cfop:"5102", ncm:"5205.11.00",
    descricao:"", valorProdutos:"", valorFrete:"0", valorDesconto:"0",
    icms:"", pis:"", cofins:"", status:"Em Aberto", chave:"", notes:""
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const valorTotal = (Number(form.valorProdutos)||0)+(Number(form.valorFrete)||0)-(Number(form.valorDesconto)||0);

  const handleSave = () => {
    if (!form.numero.trim() || !form.destinatario.trim()) return;
    onSave({ ...form, valorProdutos:Number(form.valorProdutos)||0, valorFrete:Number(form.valorFrete)||0,
      valorDesconto:Number(form.valorDesconto)||0, valorTotal, icms:Number(form.icms)||0, pis:Number(form.pis)||0, cofins:Number(form.cofins)||0 });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{isNew?"Registrar NF-e":"Editar NF-e"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Número *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.numero} onChange={e=>set("numero",e.target.value)} placeholder="000001"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Série</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.serie} onChange={e=>set("serie",e.target.value)} placeholder="1"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.tipo} onChange={e=>set("tipo",e.target.value)}>
                {NF_TIPOS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Data de Emissão</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.dataEmissao} onChange={e=>set("dataEmissao",e.target.value)}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.status} onChange={e=>set("status",e.target.value)}>
                {NF_STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destinatário</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nome / Razão Social *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.destinatario} onChange={e=>set("destinatario",e.target.value)} placeholder="Nome ou Razão Social"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CPF / CNPJ</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.cpfCnpj} onChange={e=>set("cpfCnpj", fmtCpfCnpj(e.target.value))} placeholder="000.000.000-00"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CFOP</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.cfop} onChange={e=>set("cfop",e.target.value)}>
                  {CFOP_LIST.map(c=><option key={c.code} value={c.code}>{c.code} — {c.uso}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">NCM</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.ncm} onChange={e=>set("ncm",e.target.value)}>
                  {NCM_LIST.map(n=><option key={n.code} value={n.code}>{n.code}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Descrição dos Produtos</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              value={form.descricao} onChange={e=>set("descricao",e.target.value)} placeholder="Ex: Linha Bag Sacaria 500m Branca — 10 unidades"/>
          </div>
          {/* Valores */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Valores</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[["valorProdutos","Produtos (R$)","0,00"],["valorFrete","Frete (R$)","0,00"],["valorDesconto","Desconto (R$)","0,00"]].map(([k,l,ph])=>(
                <div key={k}>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{l}</label>
                  <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}/>
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Total</label>
                <div className="border border-indigo-200 bg-indigo-50 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700">{fmt(valorTotal)}</div>
              </div>
            </div>
          </div>
          {/* Impostos */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Impostos <span className="font-normal text-gray-400">(conforme preenchido na SEFAZ)</span></p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[["icms","ICMS (R$)"],["pis","PIS (R$)"],["cofins","COFINS (R$)"]].map(([k,l])=>(
                <div key={k}>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{l}</label>
                  <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={form[k]} onChange={e=>set(k,e.target.value)} placeholder="0,00"/>
                </div>
              ))}
            </div>
          </div>
          {/* Chave */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Chave de Acesso <span className="text-gray-400 font-normal">(44 dígitos)</span></label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.chave} onChange={e=>set("chave",e.target.value)} placeholder="00 0000 00.000.000/0001-00 55 001 000001 1 00000001 2 3456789 0"/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Observações</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Notas internas..."/>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            {isNew?"Registrar NF-e":"Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Fiscal Module ────────────────────────────────────────────────────────
const FiscalModule = ({ nfes, setNfes, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "fiscal", "incluir");
  const canAlterar = getUserPerm(currentUser, "fiscal", "alterar");
  const canExcluir = getUserPerm(currentUser, "fiscal", "excluir");
  const [tab, setTab]             = useState("nfes");
  const [search, setSearch]       = useState("");
  const [filterStatus, setFSt]    = useState("Todos");
  const [modal, setModal]         = useState(null);
  const [detail, setDetail]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]         = useState(null);
  const [copied, setCopied]       = useState(null);
  const [filterMode, setFilterMode] = useState("todos");
  const [period, setPeriod] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  // Calculadora
  const [rbt12, setRbt12]         = useState("360000");
  const [recMes, setRecMes]       = useState("30000");
  // Agenda
  const [agendaMonth, setAgendaMonth] = useState(() => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });
  // CFOP/NCM search
  const [cfopSearch, setCfopSearch] = useState("");
  const [ncmSearch,  setNcmSearch]  = useState("");

  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(null),3000); };
  const copyText  = (t,k) => { navigator.clipboard?.writeText(t).catch(()=>{}); setCopied(k); setTimeout(()=>setCopied(null),1500); };

  const filterByDate = (date) => {
    if (filterMode === "todos") return true;
    if (filterMode === "mes")   return date.startsWith(period);
    if (filterMode === "ano")   return date.startsWith(period.split("-")[0]);
    if (filterMode === "personalizado") {
      if (dateFrom && date < dateFrom) return false;
      if (dateTo   && date > dateTo)   return false;
      return true;
    }
    return true;
  };

  const periodLabel = () => {
    if (filterMode === "todos") return "Todos";
    if (filterMode === "personalizado") return dateFrom||dateTo ? `${dateFrom||"..."} → ${dateTo||"..."}` : "Personalizado";
    if (filterMode === "ano") return period.split("-")[0];
    const [y,m] = period.split("-").map(Number);
    return new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  };

  // No modo "Ano" as setas pulam 12 meses (antes, cada clique andava só 1 mês
  // — pra trocar de ano eram 12 cliques sem o rótulo mudar).
  const stepPeriod = (dir) => {
    const [y,m] = period.split("-").map(Number);
    const step = filterMode === "ano" ? 12 : 1;
    const d = new Date(y, m-1 + dir*step, 1);
    setPeriod(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };
  const prevMonth = () => stepPeriod(-1);
  const nextMonth = () => stepPeriod(1);

  // NF-e stats
  const nfAuth    = nfes.filter(n=>n.status==="Autorizada");
  const totalFat  = nfAuth.reduce((s,n)=>s+(n.valorTotal||0),0);
  const totalImp  = nfAuth.reduce((s,n)=>s+((n.icms||0)+(n.pis||0)+(n.cofins||0)),0);
  const rascunhos = nfes.filter(n=>n.status==="Em Aberto").length;

  const nextNfeId = (ns) => { const nums=ns.map(n=>parseInt(n.id.replace("NFE-",""))||0); return `NFE-${String(Math.max(0,...nums)+1).padStart(3,"0")}`; };

  const filteredNfes = useMemo(() => nfes
    .filter(n=>filterStatus==="Todos"||n.status===filterStatus)
    .filter(n=>!search||[n.numero,n.destinatario,n.cpfCnpj,n.descricao].some(f=>f?.toLowerCase().includes(search.toLowerCase())))
    .filter(n=>filterByDate(n.dataEmissao||""))
    .sort((a,b)=>(b.dataEmissao||"").localeCompare(a.dataEmissao||""))
  ,[nfes,filterStatus,search,filterMode,period,dateFrom,dateTo]);

  const handleSaveNfe = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) setNfes(prev=>prev.map(n=>n.id===data.id?data:n));
    else setNfes(prev=>[{...data,id:nextNfeId(prev)},...prev]);
    setModal(null);
    showToast(data.id?"✅ NF-e atualizada!":"✅ NF-e registrada!");
  };

  // Simples Nacional calculation
  const calcDAS = useMemo(() => {
    const rbt = Number(rbt12)||0;
    const rec = Number(recMes)||0;
    if (rbt<=0||rec<=0) return null;
    const faixa = SIMPLES_FAIXAS.find(f=>rbt<=f.ate) || SIMPLES_FAIXAS[SIMPLES_FAIXAS.length-1];
    const aliqEfetiva = ((rbt*faixa.aliq)-faixa.deducao)/rbt;
    const das = rec*aliqEfetiva;
    return { faixa:faixa.faixa, aliqEfetiva:(aliqEfetiva*100), das, rec, dist:faixa };
  }, [rbt12, recMes]);

  // Agenda months
  const agendaLabel = () => {
    const [y,m] = agendaMonth.split("-").map(Number);
    return new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  };
  const prevAgendaMonth = () => { const [y,m]=agendaMonth.split("-").map(Number); const d=new Date(y,m-2,1); setAgendaMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`); };
  const nextAgendaMonth = () => { const [y,m]=agendaMonth.split("-").map(Number); const d=new Date(y,m,1);   setAgendaMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`); };

  const agendaDates = useMemo(() => {
    const [y,m] = agendaMonth.split("-").map(Number);
    const now = new Date();
    return AGENDA_ITEMS.map(item => {
      // Obrigação de "dia 31" em mês mais curto: usa o último dia do MÊS
      // EXIBIDO — antes usava new Date(y,m-1,0) (último dia do mês ANTERIOR),
      // e em fevereiro o item caía em 2-3 de março.
      const lastDay = new Date(y, m, 0).getDate();
      const due = new Date(y, m-1, Math.min(item.dia, lastDay));
      // Compara dia-a-dia (sem hora) — antes, a partir de 00h01 do próprio
      // dia do vencimento o item já aparecia como "vencido".
      const hoje = new Date(now); hoje.setHours(0,0,0,0);
      const diffDays = Math.floor((due-hoje)/86400000);
      let status = "future";
      if (diffDays < 0) status = "past";
      else if (diffDays <= 7) status = "soon";
      return { ...item, due, dueStr:due.toLocaleDateString("pt-BR"), diffDays, status };
    }).sort((a,b)=>a.due-b.due);
  }, [agendaMonth]);

  const filteredCfop = CFOP_LIST.filter(c=>!cfopSearch||c.code.includes(cfopSearch)||c.uso.toLowerCase().includes(cfopSearch.toLowerCase())||c.desc.toLowerCase().includes(cfopSearch.toLowerCase()));
  const filteredNcm  = NCM_LIST.filter(n=>!ncmSearch||n.code.includes(ncmSearch)||n.desc.toLowerCase().includes(ncmSearch.toLowerCase())||n.exemplo.toLowerCase().includes(ncmSearch.toLowerCase()));

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fiscal</h1>
          <p className="text-sm text-gray-500 mt-0.5">MM ERP — Simples Nacional</p>
        </div>
        {tab==="nfes" && canIncluir && (
          <button onClick={()=>setModal("new")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-1.5">
            <Icon name="plus" size={15}/> Registrar NF-e
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-blue-500 text-lg mt-0.5">ℹ️</span>
        <p className="text-xs text-blue-700">
          <strong>Painel fiscal</strong> — as NF-es e NFC-es emitidas pelo sistema (Pedidos e PDV) entram aqui automaticamente. Você também pode registrar manualmente notas emitidas fora do sistema (portal SEFAZ) para manter o histórico completo.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {[["nfes","📄 NF-es"],["calculadora","🧮 Calculadora DAS"],["agenda","📅 Agenda Fiscal"],["codigos","📚 CFOP / NCM"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${tab===id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
            {label}
            {id==="nfes"&&rascunhos>0&&<span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full">{rascunhos}</span>}
          </button>
        ))}
      </div>

      {/* ─── TAB: NF-es ─── */}
      {tab==="nfes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:"NF-es Emitidas",   value:nfAuth.length,        sub:"autorizadas",        color:"text-gray-900",  bg:"bg-white" },
              { label:"Faturamento",      value:fmt(totalFat),        sub:"notas autorizadas",  color:"text-indigo-700",bg:"bg-white" },
              { label:"Total de Impostos",value:fmt(totalImp),        sub:"ICMS+PIS+COFINS",    color:"text-red-600",   bg:"bg-white" },
              { label:"Em Aberto",        value:rascunhos,            sub:"aguardando emissão", color:rascunhos>0?"text-amber-600":"text-gray-400", bg:rascunhos>0?"bg-amber-50":"bg-white" },
            ].map(k=>(
              <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-gray-100 shadow-sm`}>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{k.label}</p>
                <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Número, destinatário, descrição..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>

            {/* Date filter */}
            <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm space-y-2">
              <div className="flex gap-1 flex-wrap">
                {[["todos","Todos"],["mes","Mês"],["ano","Ano"],["personalizado","Personalizado"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setFilterMode(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode===id?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {label}
                  </button>
                ))}
                {filterMode!=="todos" && <span className="text-xs text-gray-400 self-center ml-1">{filteredNfes.length} NF{filteredNfes.length!==1?"s":""}</span>}
              </div>
              {(filterMode==="mes"||filterMode==="ano") && (
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="text-sm font-semibold text-gray-700 capitalize min-w-[150px] text-center">{periodLabel()}</span>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              )}
              {filterMode==="personalizado" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 font-medium">De:</label>
                    <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 font-medium">Até:</label>
                    <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
                  </div>
                  {(dateFrom||dateTo) && (
                    <button onClick={()=>{setDateFrom("");setDateTo("");}} className="text-xs text-red-400 hover:text-red-600 font-medium">Limpar</button>
                  )}
                </div>
              )}
            </div>
            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
              value={filterStatus} onChange={e=>setFSt(e.target.value)}>
              <option>Todos</option>{NF_STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredNfes.length===0 ? (
              <div className="py-12 text-center text-gray-400"><Icon name="finance" size={28} className="mx-auto mb-2 opacity-40"/><p className="text-sm">Nenhuma NF-e encontrada</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nº / Tipo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Destinatário</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Data</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredNfes.map(n=>{
                      const ns = NF_STATUS_STYLES[n.status]||NF_STATUS_STYLES["Em Aberto"];
                      return (
                        <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <button onClick={()=>setDetail(detail?.id===n.id?null:n)} className="text-left">
                              <p className="font-mono text-sm font-bold text-indigo-600 hover:underline">{n.numero}</p>
                              <p className="text-xs text-gray-400">{n.tipo} · Série {n.serie}</p>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-800 text-sm font-medium">{n.destinatario}</p>
                            <p className="text-xs text-gray-400 font-mono">{n.cpfCnpj}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{n.dataEmissao}</td>
                          <td className="px-4 py-3"><Badge label={n.status} style={ns}/></td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(n.valorTotal)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {canAlterar && <button onClick={()=>setModal(n)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"><Icon name="edit" size={13}/></button>}
                              {canExcluir && <button onClick={()=>setConfirmDelete(n)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Icon name="trash" size={13}/></button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail expand */}
          {detail && (
            <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-mono font-bold text-indigo-600 text-lg">NF-e {detail.numero}</span>
                  <span className="ml-2 text-gray-400 text-sm">· {detail.tipo} · Série {detail.serie}</span>
                </div>
                <button onClick={()=>setDetail(null)} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={16}/></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { l:"Emissão",   v:detail.dataEmissao },
                  { l:"CFOP",      v:detail.cfop },
                  { l:"NCM",       v:detail.ncm },
                  { l:"Prod.",     v:fmt(detail.valorProdutos) },
                  { l:"Frete",     v:fmt(detail.valorFrete) },
                  { l:"Total",     v:fmt(detail.valorTotal), bold:true },
                  { l:"ICMS",      v:fmt(detail.icms) },
                  { l:"PIS+COFINS",v:fmt(detail.pis+detail.cofins) },
                ].map(m=>(
                  <div key={m.l} className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase">{m.l}</p>
                    <p className={`text-sm mt-0.5 ${m.bold?"font-bold text-indigo-700":"font-medium text-gray-700"}`}>{m.v}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mb-3"><span className="font-semibold">Descrição:</span> {detail.descricao}</p>
              {detail.chave && (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                  <p className="font-mono text-[10px] text-gray-500 flex-1 break-all">{detail.chave}</p>
                  <button onClick={()=>copyText(detail.chave,"chave-"+detail.id)}
                    className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-medium hover:bg-indigo-200 shrink-0">
                    {copied==="chave-"+detail.id?"✓ Copiado":"Copiar"}
                  </button>
                  <a href={`https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=7PhJ+gAVw2g=`} target="_blank" rel="noopener noreferrer"
                    className="px-2 py-1 rounded-lg bg-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-300 shrink-0">SEFAZ ↗</a>
                </div>
              )}
              {detail.notes && <p className="text-xs text-amber-600 mt-2 italic">📝 {detail.notes}</p>}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: CALCULADORA DAS ─── */}
      {tab==="calculadora" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-1">Calculadora DAS — Simples Nacional Anexo I (Comércio)</h3>
            <p className="text-xs text-gray-400 mb-5">Cálculo baseado na tabela 2024/2025 para atividades de comércio varejista</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Receita Bruta últimos 12 meses (RBT12)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input type="number" min="0" step="100" className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={rbt12} onChange={e=>setRbt12(e.target.value)} placeholder="360000"/>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Soma dos últimos 12 meses de faturamento</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Receita do mês atual</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input type="number" min="0" step="100" className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={recMes} onChange={e=>setRecMes(e.target.value)} placeholder="30000"/>
                  </div>
                </div>
              </div>
              <div>
                {!calcDAS ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">Preencha os valores ao lado</div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Faixa</span>
                        <span className="font-bold text-indigo-700">{calcDAS.faixa}</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Alíquota efetiva</span>
                        <span className="font-bold text-indigo-700">{calcDAS.aliqEfetiva.toFixed(2)}%</span>
                      </div>
                      <div className="border-t border-indigo-200 pt-2 mt-2 flex justify-between items-center">
                        <span className="font-semibold text-gray-700">DAS do mês</span>
                        <span className="text-2xl font-black text-indigo-700">{fmt(calcDAS.das)}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Composição do DAS</p>
                      {[
                        { label:"IRPJ",    pct:calcDAS.dist.irpj },
                        { label:"CSLL",    pct:calcDAS.dist.csll },
                        { label:"COFINS",  pct:calcDAS.dist.cofins },
                        { label:"PIS",     pct:calcDAS.dist.pis },
                        { label:"CPP",     pct:calcDAS.dist.cpp },
                        { label:"ICMS",    pct:calcDAS.dist.icms },
                      ].map(item=>(
                        <div key={item.label} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                          <span className="text-xs text-gray-600 w-16">{item.label}</span>
                          <div className="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-indigo-400 h-1.5 rounded-full" style={{width:`${item.pct}%`}}/>
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">{item.pct}%</span>
                          <span className="text-xs font-semibold text-gray-700 w-16 text-right">{fmt(calcDAS.das*item.pct/100)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Faixas reference table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Tabela Simples Nacional — Anexo I (Comércio) 2024/2025</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Faixa","Receita Bruta 12m","Alíq. Nominal","Parcela Deduzir","Alíq. Efetiva*"].map(h=>(
                      <th key={h} className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SIMPLES_FAIXAS.map((f,i)=>{
                    const rbt = Number(rbt12)||0;
                    const isAtual = rbt > f.de && rbt <= f.ate;
                    return (
                      <tr key={f.faixa} className={isAtual?"bg-indigo-50":""}>
                        <td className="px-3 py-2 font-semibold text-gray-700">{f.faixa}</td>
                        <td className="px-3 py-2 text-gray-600">Até {fmt(f.ate)}</td>
                        <td className="px-3 py-2 font-semibold text-indigo-600">{(f.aliq*100).toFixed(2)}%</td>
                        <td className="px-3 py-2 text-gray-600">{f.deducao>0?fmt(f.deducao):"—"}</td>
                        <td className="px-3 py-2 text-gray-500 italic">
                          {f.deducao>0?`(RBT12×${(f.aliq*100).toFixed(2)}%-${fmt(f.deducao)})/RBT12`:"= "+( f.aliq*100).toFixed(2)+"%"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-[10px] text-gray-400 mt-2">* Alíquota efetiva calculada com base no RBT12 informado. Consulte sempre seu contador para valores definitivos.</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: AGENDA FISCAL ─── */}
      {tab==="agenda" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 w-fit shadow-sm">
            <button onClick={prevAgendaMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize min-w-[160px] text-center">{agendaLabel()}</span>
            <button onClick={nextAgendaMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div className="space-y-2">
            {agendaDates.map(item=>{
              const statusStyle = item.status==="past" ? "border-red-200 bg-red-50" : item.status==="soon" ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white";
              const dateStyle   = item.status==="past" ? "text-red-600" : item.status==="soon" ? "text-amber-600" : "text-gray-500";
              const labelStyle  = item.status==="past" ? "text-red-600 bg-red-100" : item.status==="soon" ? "text-amber-600 bg-amber-100" : "text-gray-500 bg-gray-100";
              const statusLabel = item.status==="past" ? "Vencido" : item.status==="soon" ? "Esta semana" : `${item.diffDays}d`;
              return (
                <div key={item.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${statusStyle}`}>
                  <div className={`w-12 h-12 rounded-xl ${item.cor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {item.dia}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800">{item.nome}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{item.tipo}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${labelStyle}`}>{statusLabel}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${dateStyle}`}>{item.dueStr}</p>
                    <p className="text-xs text-gray-400">dia {item.dia}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-center">⚠️ Verifique sempre com seu contador — datas podem variar conforme o calendário do ano.</p>
        </div>
      )}

      {/* ─── TAB: CFOP / NCM ─── */}
      {tab==="codigos" && (
        <div className="space-y-4">
          {/* CFOPs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 text-sm">CFOPs — Operações mais comuns</h3>
              <div className="relative">
                <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input className="border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 w-40"
                  placeholder="Buscar CFOP..." value={cfopSearch} onChange={e=>setCfopSearch(e.target.value)}/>
              </div>
            </div>
            <div className="space-y-2">
              {filteredCfop.map(c=>(
                <div key={c.code} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors group">
                  <button onClick={()=>copyText(c.code,"cfop-"+c.code)}
                    className="font-mono font-bold text-indigo-600 text-sm shrink-0 hover:underline cursor-pointer">
                    {c.code} {copied==="cfop-"+c.code&&<span className="text-green-500 text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{c.uso}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
              {filteredCfop.length===0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum CFOP encontrado</p>}
            </div>
          </div>

          {/* NCMs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 text-sm">NCMs — Produtos de costura e bordado</h3>
              <div className="relative">
                <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input className="border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 w-40"
                  placeholder="Buscar NCM..." value={ncmSearch} onChange={e=>setNcmSearch(e.target.value)}/>
              </div>
            </div>
            <div className="space-y-2">
              {filteredNcm.map(n=>(
                <div key={n.code} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                  <button onClick={()=>copyText(n.code,"ncm-"+n.code)}
                    className="font-mono font-bold text-indigo-600 text-sm shrink-0 hover:underline whitespace-nowrap cursor-pointer">
                    {n.code} {copied==="ncm-"+n.code&&<span className="text-green-500 text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{n.desc}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Exemplos: {n.exemplo}</p>
                  </div>
                </div>
              ))}
              {filteredNcm.length===0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum NCM encontrado</p>}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><Icon name="trash" size={22} className="text-red-500"/></div>
            <h3 className="font-semibold text-gray-900 mb-1">Excluir NF-e {confirmDelete.numero}?</h3>
            <p className="text-sm text-gray-500 mb-4">{confirmDelete.destinatario}</p>
            <div className="flex gap-2">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={()=>{ if(!canExcluir) return; setNfes(prev=>prev.filter(n=>n.id!==confirmDelete.id)); setConfirmDelete(null); showToast("🗑 NF-e excluída"); }}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}
      {modal && <NfeModal nfe={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={handleSaveNfe}/>}
    </div>
  );
};

// ─── PriceHunt Module ────────────────────────────────────────────────────
const PH_SYSTEM = `Você é um especialista em precificação de artigos de costura, bordado e armarinhos no mercado brasileiro.
Use web_search para pesquisar os preços atuais do produto especificado no Mercado Livre, Shopee Brasil, Amazon Brasil e outras lojas online.
Faça buscas específicas: "{produto} preço mercado livre", "{produto} preço shopee brasil".

Retorne SOMENTE um JSON válido sem markdown nem texto extra com este formato exato:
{
  "produto": "nome descritivo",
  "plataformas": [
    { "nome": "Mercado Livre", "preco_min": 0.00, "preco_max": 0.00, "preco_medio": 0.00 },
    { "nome": "Shopee", "preco_min": 0.00, "preco_max": 0.00, "preco_medio": 0.00 }
  ],
  "preco_minimo_mercado": 0.00,
  "preco_medio_mercado": 0.00,
  "resumo": "2 frases sobre o cenário de preços e concorrência",
  "sugestao_preco": 0.00,
  "posicionamento": "competitivo | caro | barato"
}`;

const PH_COLORS = { "Mercado Livre":"#f59e0b", "Shopee":"#f97316", "Amazon":"#1a73e8", "Magazine Luiza":"#b91c1c", "Americanas":"#ef4444" };

const PriceHuntModule = ({ products, initialQuery = "", initialPrice = null }) => {
  const [query, setQuery]     = useState(initialQuery);
  const [context, setContext] = useState("");
  const [erpPrice, setErpPrice] = useState(initialPrice);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [history, setHistory] = useState([]);
  const [step, setStep]       = useState("");

  // Auto-search if initialQuery is provided
  useEffect(() => {
    if (initialQuery) { setQuery(initialQuery); setErpPrice(initialPrice); }
  }, [initialQuery, initialPrice]);

  const handleSelectProduct = (id) => {
    const p = products.find(x=>x.id===id);
    if (!p) return;
    setQuery(p.name);
    setContext(`SKU: ${p.sku}${p.description ? " — "+p.description.slice(0,80) : ""}`);
    setErpPrice(p.price);
    setResult(null);
  };

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true); setError(null); setResult(null); setStep("Iniciando pesquisa...");

    try {
      const messages = [{ role:"user", content:`Pesquise os preços atuais de: "${query}"${context?". Contexto: "+context:""}` }];
      let attempts = 0;

      while (attempts < 7) {
        attempts++;
        const stepLabel = attempts === 1 ? "Consultando IA..." : `Buscando na web (etapa ${attempts})...`;
        setStep(stepLabel);

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:1000,
            system:PH_SYSTEM,
            tools:[{ type:"web_search_20250305", name:"web_search" }],
            messages,
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || "Erro na API");

        const textBlocks = (data.content||[]).filter(b=>b.type==="text");

        if (data.stop_reason === "end_turn" && textBlocks.length > 0) {
          setStep("Processando resultados...");
          const raw = textBlocks.map(b=>b.text).join("").replace(/```json|```/g,"").trim();
          const parsed = JSON.parse(raw);
          setResult(parsed);
          setHistory(prev=>[{ query, erpPrice, result:parsed, ts:new Date().toLocaleTimeString("pt-BR") }, ...prev.slice(0,4)]);
          break;
        }

        // Tool use loop
        messages.push({ role:"assistant", content: data.content });
        const toolUses = (data.content||[]).filter(b=>b.type==="tool_use");
        if (toolUses.length === 0) break;
        messages.push({ role:"user", content: toolUses.map(t=>({ type:"tool_result", tool_use_id:t.id, content:"" })) });
      }
    } catch(e) {
      setError("Erro na pesquisa: " + (e.message || "Tente novamente"));
    } finally {
      setLoading(false); setStep("");
    }
  };

  const posStyle = (pos) => {
    if (!pos) return { bg:"bg-gray-100", text:"text-gray-600", emoji:"❓" };
    if (pos.includes("barato"))      return { bg:"bg-green-100", text:"text-green-700", emoji:"✅" };
    if (pos.includes("caro"))        return { bg:"bg-red-100",   text:"text-red-700",   emoji:"⚠️" };
    return                                  { bg:"bg-blue-100",  text:"text-blue-700",  emoji:"📊" };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg">🔍</div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">PriceHunt</h1>
          <p className="text-sm text-gray-500">Pesquisa de preços em tempo real via IA + web</p>
        </div>
      </div>

      {/* Search card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        {/* Catalog picker */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">📦 Selecionar do catálogo de produtos</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            onChange={e=>handleSelectProduct(e.target.value)} defaultValue="">
            <option value="">Escolha um produto do estoque para pré-preencher...</option>
            {[...products].filter(p=>p.status==="Ativo").sort((a,b)=>a.name.localeCompare(b.name)).map(p=>(
              <option key={p.id} value={p.id}>{p.name} — {fmt(p.price)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-100"/>
          <span className="text-xs text-gray-400">ou busca livre</span>
          <div className="flex-1 h-px bg-gray-100"/>
        </div>

        {/* Query input */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Produto *</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
            value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSearch()}
            placeholder="Ex: Linha Bag Sacaria 500m, Agulha Bordado n°5..."/>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Contexto adicional</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={context} onChange={e=>setContext(e.target.value)} placeholder="100% algodão, nacional..."/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Seu preço (para comparação)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
              <input type="number" min="0" step="0.01"
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={erpPrice||""} onChange={e=>setErpPrice(e.target.value?Number(e.target.value):null)} placeholder="0,00"/>
            </div>
          </div>
        </div>

        <button onClick={handleSearch} disabled={loading||!query.trim()}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>{step || "Pesquisando..."}</>
          ) : (
            <><Icon name="search" size={16}/> Pesquisar Preços em Tempo Real</>
          )}
        </button>

        {loading && (
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <p className="text-xs text-indigo-600 font-medium">{step}</p>
            <p className="text-[10px] text-indigo-400 mt-1">Buscando no Mercado Livre, Shopee e outras lojas... aguarde</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2"><span>⚠️</span>{error}</div>}

      {/* Results */}
      {result && (() => {
        const ps = posStyle(result.posicionamento);
        const diffPct = erpPrice && result.preco_medio_mercado
          ? ((Number(erpPrice) - result.preco_medio_mercado) / result.preco_medio_mercado * 100).toFixed(1)
          : null;
        return (
          <div className="space-y-4">
            {/* Product title + positioning */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-bold text-gray-900">{result.produto}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Pesquisado agora</p>
              </div>
              {result.posicionamento && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ps.bg} ${ps.text}`}>
                  {ps.emoji} {result.posicionamento}
                </span>
              )}
            </div>

            {/* Platform cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(result.plataformas||[]).map(p => {
                const color = PH_COLORS[p.nome]||"#6366f1";
                const vsDiff = erpPrice && p.preco_medio ? ((Number(erpPrice)-p.preco_medio)/p.preco_medio*100).toFixed(1) : null;
                return (
                  <div key={p.nome} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{background:color}}/>
                        <span className="font-semibold text-gray-800">{p.nome}</span>
                      </div>
                      {vsDiff!==null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(vsDiff)>5?"bg-amber-100 text-amber-700":Number(vsDiff)<-5?"bg-green-100 text-green-700":"bg-blue-100 text-blue-700"}`}>
                          {Number(vsDiff)>0?"você +":"você "}{vsDiff}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[["Mínimo",p.preco_min,"text-green-600"],["Médio",p.preco_medio,"text-gray-800 font-black"],["Máximo",p.preco_max,"text-red-500"]].map(([l,v,c])=>(
                        <div key={l} className={`rounded-xl p-2 ${l==="Médio"?"bg-gray-100":"bg-gray-50"}`}>
                          <p className="text-[10px] text-gray-400 uppercase">{l}</p>
                          <p className={`text-sm mt-0.5 ${c}`}>{v>0 ? fmt(v) : "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary + recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">💡 Análise de Mercado</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.resumo}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumo de Preços</p>
                <div className="space-y-2">
                  {[
                    { l:"Menor preço de mercado",    v:result.preco_minimo_mercado,  c:"text-green-600 font-bold" },
                    { l:"Preço médio de mercado",    v:result.preco_medio_mercado,   c:"text-gray-800 font-bold" },
                    { l:"Seu preço atual",           v:erpPrice ? Number(erpPrice) : null, c:"text-indigo-700 font-bold" },
                  ].map(m=> m.v ? (
                    <div key={m.l} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-600">{m.l}</span>
                      <span className={m.c}>{fmt(m.v)}</span>
                    </div>
                  ) : null)}
                  {diffPct && (
                    <div className={`flex justify-between items-center text-sm py-1 rounded-lg px-2 ${Number(diffPct)>5?"bg-amber-50":Number(diffPct)<-5?"bg-green-50":"bg-blue-50"}`}>
                      <span className="text-gray-600">Diferença vs mercado</span>
                      <span className={`font-bold ${Number(diffPct)>5?"text-amber-600":Number(diffPct)<-5?"text-green-600":"text-blue-600"}`}>
                        {Number(diffPct)>0?"+":""}{diffPct}%
                      </span>
                    </div>
                  )}
                  {result.sugestao_preco > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="font-semibold text-gray-700">🎯 Sugestão de preço</span>
                      <span className="text-xl font-black text-indigo-700">{fmt(result.sugestao_preco)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Search history */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🕐 Buscas Recentes</p>
          <div className="space-y-1.5">
            {history.map((h,i)=>(
              <button key={i} onClick={()=>{ setQuery(h.query); setErpPrice(h.erpPrice); setResult(h.result); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors text-left">
                <span className="text-sm text-gray-700 font-medium truncate flex-1">{h.query}</span>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  {h.result.sugestao_preco>0 && <span className="text-xs font-bold text-indigo-600">{fmt(h.result.sugestao_preco)}</span>}
                  <span className="text-xs text-gray-400">{h.ts}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Pricing Calculator Module ────────────────────────────────────────────
const TabelaPrecos = ({ products, setProducts, params, currentUser }) => {
  const canAlterar = getUserPerm(currentUser, "pricing", "alterar");
  const [tSearch,       setTSearch]       = useState("");
  const [tSaved,        setTSaved]        = useState(false);
  const [tFilterStatus, setTFilterStatus] = useState("Todos");

  const filtered = products.filter(p =>
    (tFilterStatus === "Todos" || p.status === tFilterStatus) &&
    (!tSearch ||
    p.name.toLowerCase().includes(tSearch.toLowerCase()) ||
    (p.sku||"").toLowerCase().includes(tSearch.toLowerCase()))
  );

  // channelPrices[ch] = { price, margin, freight, taxaPerc, taxaFixa, otherCosts, qtd }
  const getData = (p, ch) => {
    const raw = p.channelPrices?.[ch];
    // Taxa parte já preenchida com a comissão/taxa fixa configuradas em
    // Parâmetros → Canais (só como ponto de partida — uma vez que o produto
    // tem um valor salvo, mesmo que seja 0, esse valor prevalece).
    const taxaPadrao = params?.canais?.[ch]?.comissao || 0;
    const taxaFixaPadrao = params?.canais?.[ch]?.taxaFixa || 0;
    if (!raw) return { price:0, margin:0, freight:0, taxaPerc:taxaPadrao, taxaFixa:taxaFixaPadrao, otherCosts:0, qtd:1 };
    if (typeof raw === "number") return { price:raw, margin:0, freight:0, taxaPerc:taxaPadrao, taxaFixa:taxaFixaPadrao, otherCosts:0, qtd:1 };
    return { price:raw.price||0, margin:raw.margin||0, freight:raw.freight||0, taxaPerc:raw.taxaPerc??taxaPadrao, taxaFixa:raw.taxaFixa??taxaFixaPadrao, otherCosts:raw.otherCosts||0, qtd:raw.qtd||1 };
  };

  // custoBase = custo_unitario × qtd
  // price = (custoBase + freight + otherCosts + taxaFixa) / (1 - margin/100 - taxaPerc/100)
  // margin = ((price × (1 - taxaPerc/100)) - taxaFixa - custoBase - freight - otherCosts) / price * 100
  const calcPrice = (custoBase, margin, freight, taxaPerc, otherCosts, taxaFixa=0) => {
    const denom = 1 - (margin/100) - (taxaPerc/100);
    if (denom <= 0) return 0;
    return parseFloat(((custoBase + freight + otherCosts + taxaFixa) / denom).toFixed(2));
  };
  const calcMargin = (price, custoBase, freight, taxaPerc, otherCosts, taxaFixa=0) => {
    if (price <= 0) return 0;
    return parseFloat((((price * (1 - taxaPerc/100)) - taxaFixa - custoBase - freight - otherCosts) / price * 100).toFixed(1));
  };

  const setField = (productId, ch, field, value) => {
    if (!canAlterar) return; // segurança extra, além dos campos já desabilitados
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const unitCost  = Number(p.cost)||0;
      const current   = getData(p, ch);
      const isEmpty   = value === "";
      const numVal    = isEmpty ? "" : (field==="qtd" ? Math.max(1, parseInt(value)||1) : parseFloat(value)||0);
      const updated   = { ...current, [field]: numVal };
      const sn         = (v) => Number(v)||0; // leitura segura, mesmo se "" durante a digitação
      const custoBase = unitCost * (sn(updated.qtd)||1);

      if (field === "price") {
        // Preço digitado → recalcula margem
        updated.margin = calcMargin(sn(updated.price), custoBase, sn(updated.freight), sn(updated.taxaPerc), sn(updated.otherCosts), sn(updated.taxaFixa));
      } else if (field === "margin") {
        // Margem digitada (incluindo 0) → recalcula preço apenas se margem > 0
        if (sn(numVal) > 0) {
          updated.price = calcPrice(custoBase, sn(numVal), sn(updated.freight), sn(updated.taxaPerc), sn(updated.otherCosts), sn(updated.taxaFixa));
        }
        // Se margem = 0, mantém o preço atual sem recalcular
      } else {
        // Qtd, frete, taxa, outros → recalcula preço se já tem margem definida, senão recalcula margem
        if (sn(updated.margin) > 0) {
          updated.price = calcPrice(custoBase, sn(updated.margin), sn(updated.freight), sn(updated.taxaPerc), sn(updated.otherCosts), sn(updated.taxaFixa));
        } else if (sn(updated.price) > 0) {
          updated.margin = calcMargin(sn(updated.price), custoBase, sn(updated.freight), sn(updated.taxaPerc), sn(updated.otherCosts), sn(updated.taxaFixa));
        }
      }

      return { ...p, channelPrices: { ...(p.channelPrices||{}), [ch]: updated } };
    }));
  };

  const setFieldBlur = (productId, ch, field) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const current = getData(p, ch);
      if (current[field] !== "") return p;
      return { ...p, channelPrices: { ...(p.channelPrices||{}), [ch]: { ...current, [field]: 0 } } };
    }));
  };

  const handlePropagateToVariants = (parentId) => {
    if (!canAlterar) return; // segurança extra
    const parent = products.find(x=>x.id===parentId);
    if (!parent) return;
    const variantIds = products.filter(x=>x.parentId===parentId).map(x=>x.id);
    if (variantIds.length===0) return;
    setProducts(prev => prev.map(x => {
      if (!variantIds.includes(x.id)) return x;
      const variantCost = Number(x.cost)||0;
      const newChannelPrices = { ...(x.channelPrices||{}) };
      CHANNELS.forEach(ch => {
        if (!parent.channelPrices?.[ch]) return; // canal sem configuração no pai, não propaga
        const pd  = getData(parent, ch);
        const cur = getData(x, ch);
        const custoBase = variantCost * (cur.qtd||1);
        const price = pd.margin>0 ? calcPrice(custoBase, pd.margin, pd.freight, pd.taxaPerc, pd.otherCosts, pd.taxaFixa) : cur.price;
        newChannelPrices[ch] = { ...cur, margin:pd.margin, freight:pd.freight, taxaPerc:pd.taxaPerc, taxaFixa:pd.taxaFixa, otherCosts:pd.otherCosts, price };
      });
      return { ...x, channelPrices: newChannelPrices };
    }));
  };

  // Conta quantos produto×canal têm taxa (percentual ou fixa) salva diferente
  // da configurada em Parâmetros → Canais (só considera canais configurados e
  // produtos que já têm preço salvo pra aquele canal).
  const taxasDesatualizadas = useMemo(() => {
    const lista = [];
    products.forEach(p => {
      CHANNELS.forEach(ch => {
        const cfgCanal = params?.canais?.[ch];
        if (!cfgCanal) return;
        const raw = p.channelPrices?.[ch];
        if (!raw) return; // canal ainda não configurado pra esse produto — nada a sincronizar
        const d = getData(p, ch);
        const taxaAtual = cfgCanal.comissao ?? 0;
        const fixaAtual = cfgCanal.taxaFixa ?? 0;
        if (Number(d.taxaPerc) !== Number(taxaAtual) || Number(d.taxaFixa||0) !== Number(fixaAtual)) lista.push({ productId: p.id, ch });
      });
    });
    return lista;
  }, [products, params]);

  const [syncConfirm, setSyncConfirm] = useState(false);
  const handleSyncAllTaxas = () => {
    if (!canAlterar) return; // segurança extra
    setProducts(prev => prev.map(p => {
      const unitCost = Number(p.cost)||0;
      let changed = false;
      const newChannelPrices = { ...(p.channelPrices||{}) };
      CHANNELS.forEach(ch => {
        const cfgCanal = params?.canais?.[ch];
        if (!cfgCanal) return;
        const raw = p.channelPrices?.[ch];
        if (!raw) return;
        const cur = getData(p, ch);
        const taxaAtual = cfgCanal.comissao ?? 0;
        const fixaAtual = cfgCanal.taxaFixa ?? 0;
        if (Number(cur.taxaPerc) === Number(taxaAtual) && Number(cur.taxaFixa||0) === Number(fixaAtual)) return;
        changed = true;
        const custoBase = unitCost * (cur.qtd||1);
        const updated = { ...cur, taxaPerc: taxaAtual, taxaFixa: fixaAtual };
        if (Number(cur.margin) > 0) {
          updated.price = calcPrice(custoBase, Number(cur.margin), Number(cur.freight), taxaAtual, Number(cur.otherCosts), fixaAtual);
        } else if (Number(cur.price) > 0) {
          updated.margin = calcMargin(Number(cur.price), custoBase, Number(cur.freight), taxaAtual, Number(cur.otherCosts), fixaAtual);
        }
        newChannelPrices[ch] = updated;
      });
      return changed ? { ...p, channelPrices: newChannelPrices } : p;
    }));
    setSyncConfirm(false);
    setTSaved(true);
    setTimeout(()=>setTSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tabela de Preços</h1>
          <p className="text-sm text-gray-500">{products.length} produto{products.length!==1?"s":""} cadastrado{products.length!==1?"s":""}</p>
        </div>
        <div className="flex items-center gap-2">
          {canAlterar && taxasDesatualizadas.length > 0 && (
            <button onClick={()=>setSyncConfirm(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 flex items-center gap-1.5">
              ⚠️ Sincronizar {taxasDesatualizadas.length} taxa{taxasDesatualizadas.length!==1?"s":""}
            </button>
          )}
          {canAlterar && (
            <button onClick={()=>{ setProducts(p=>p); setTSaved(true); setTimeout(()=>setTSaved(false),2500); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tSaved?"bg-green-500 text-white":"bg-indigo-600 text-white hover:bg-indigo-700"}`}>
              {tSaved?"✓ Salvo!":"Salvar Preços"}
            </button>
          )}
        </div>
      </div>

      {syncConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <p className="text-2xl mb-2">🔄</p>
            <h3 className="font-bold text-gray-900 mb-1">Sincronizar taxas?</h3>
            <p className="text-sm text-gray-500 mb-4">
              {taxasDesatualizadas.length} combinação(ões) de produto × canal serão atualizadas com a comissão e a taxa fixa atuais de Parâmetros. O preço e a margem de cada uma serão recalculados automaticamente.
            </p>
            <div className="flex gap-2">
              <button onClick={()=>setSyncConfirm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm">Cancelar</button>
              <button onClick={handleSyncAllTaxas} className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">Sincronizar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={tSearch} onChange={e=>setTSearch(e.target.value)} placeholder="Buscar por nome ou SKU..."/>
        </div>
        <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white shrink-0"
          value={tFilterStatus} onChange={e=>setTFilterStatus(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Ativo">● Ativo</option>
          <option value="Inativo">○ Inativo</option>
        </select>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-3xl mb-2">📦</p>
          <p className="text-sm text-gray-500">Nenhum produto cadastrado ainda</p>
          <p className="text-xs text-gray-400 mt-1">Cadastre produtos no módulo Estoque primeiro</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(p => {
            const cost = Number(p.cost)||0;
            const hasVariants = !p.parentId && products.some(x=>x.parentId===p.id);
            return (
              <PriceTableRow key={p.id} p={p} cost={cost} getData={getData} setField={setField} setFieldBlur={setFieldBlur} CHANNELS={CHANNELS} CHANNEL_STYLES={CHANNEL_STYLES} fmt={fmt} params={params}
                hasVariants={hasVariants} onPropagate={()=>handlePropagateToVariants(p.id)} canAlterar={canAlterar}/>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── PriceTableRow — linha colapsável da tabela de preços ────────────────────
const PriceTableRow = ({ p, cost, getData, setField, setFieldBlur, CHANNELS, CHANNEL_STYLES, fmt, hasVariants, onPropagate, params, canAlterar=true }) => {
  const [open, setOpen] = useState(false);
  const [propagated, setPropagated] = useState(false);
  const handlePropagateClick = (e) => {
    e.stopPropagation();
    onPropagate();
    setPropagated(true);
    setTimeout(()=>setPropagated(false), 2500);
  };
  return (
    <div className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${open?"border-indigo-200":"border-gray-100"}`}>
      {/* Linha compacta clicável */}
      <button onClick={()=>setOpen(v=>!v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
        <span className={`text-xs shrink-0 transition-transform ${open?"rotate-90":"rotate-0"}`}>▶</span>
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[11px] text-gray-400 mr-2">{p.sku}</span>
          <span className="font-medium text-sm text-gray-800">{p.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Resumo de canais com preço */}
          <div className="hidden md:flex items-center gap-2">
            {CHANNELS.map(ch => {
              const d = getData(p, ch);
              const mc = d.margin>30?"text-green-600":d.margin>15?"text-amber-500":d.margin>0?"text-red-500":"text-gray-300";
              return d.price>0 ? (
                <div key={ch} className="text-center">
                  <p className="text-[9px] text-gray-400 uppercase">{ch.split(" ")[0]}</p>
                  <p className={`text-[10px] font-bold ${mc}`}>{fmt(d.price)}</p>
                </div>
              ) : (
                <div key={ch} className="text-center">
                  <p className="text-[9px] text-gray-400 uppercase">{ch.split(" ")[0]}</p>
                  <p className="text-[10px] text-gray-300">—</p>
                </div>
              );
            })}
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status==="Ativo"?"bg-green-100 text-green-700":"bg-red-100 text-red-500"}`}>{p.status}</span>
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">CMU: {cost>0?fmt(cost):"—"}</span>
        </div>
      </button>

      {/* Detalhe expansível */}
      {open && (
        <div className="border-t border-gray-100 p-3 bg-gray-50/50">
          {!canAlterar && (
            <p className="text-[11px] text-gray-400 bg-gray-100 rounded-lg px-2.5 py-1.5 mb-3">🔒 Somente visualização — sem permissão pra alterar preços</p>
          )}
          {canAlterar && hasVariants && (
            <button onClick={handlePropagateClick}
              className={`w-full mb-3 text-xs font-medium rounded-lg py-2 transition-colors ${propagated?"bg-green-50 text-green-600":"bg-violet-50 text-violet-600 hover:bg-violet-100"}`}>
              {propagated ? "✓ Repassado pras variantes!" : "📤 Repassar Margem/Frete/Taxa/Outros pras variantes"}
            </button>
          )}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${!canAlterar?"opacity-70 pointer-events-none":""}`}>
            {CHANNELS.map(ch => {
              const d = getData(p, ch);
              const custoBase = cost * (d.qtd||1);
              // Lucro líquido desconta TAMBÉM a taxa fixa do canal — o preço e
              // a margem já a incluíam no cálculo, mas o lucro exibido não, e
              // ficava R$ taxaFixa acima do real.
              const lucro = d.price>0 ? d.price*(1-d.taxaPerc/100) - (d.taxaFixa||0) - custoBase - d.freight - d.otherCosts : 0;
              const mc = d.margin>30?"text-green-600":d.margin>15?"text-amber-500":d.margin>0?"text-red-500":"text-gray-400";
              // Margem REAL com o custo médio atual: quando o custo muda (a cada
              // baixa de compra), a margem salva fica velha sem aviso — o badge
              // abaixo alerta a divergência sem alterar nada automaticamente.
              const margemReal = d.price>0
                ? parseFloat((((d.price*(1-d.taxaPerc/100)) - (d.taxaFixa||0) - custoBase - d.freight - d.otherCosts) / d.price * 100).toFixed(1))
                : 0;
              const margemDefasada = d.price>0 && Math.abs(margemReal - (d.margin||0)) > 0.5;
              // Margem + comissão ≥ 100% inviabiliza o cálculo do preço
              const calcInviavel = ((d.margin||0) + (d.taxaPerc||0)) >= 100;
              return (
                <div key={ch} className="bg-white rounded-xl p-3 border border-gray-100">
                  <div className="mb-2.5">
                    <Badge label={ch} style={CHANNEL_STYLES[ch]||{bg:"bg-gray-100",text:"text-gray-600"}}/>
                  </div>
                  {/* Qtd × Custo */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-indigo-400 uppercase block mb-1">📦 Qtd</label>
                        <input type="number" min="1" step="1"
                          className="w-full border border-indigo-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-center font-bold"
                          value={d.qtd||1} onChange={e=>setField(p.id, ch, "qtd", e.target.value)}/>
                      </div>
                      <div className="text-indigo-300 font-bold text-sm mt-4">×</div>
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-indigo-400 uppercase block mb-1">Custo Médio Unit.</label>
                        <div className="border border-indigo-100 rounded-lg px-2 py-1 text-xs bg-indigo-50 text-center text-indigo-600 font-medium">{fmt(cost)}</div>
                      </div>
                      <div className="text-indigo-300 font-bold text-sm mt-4">=</div>
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-indigo-400 uppercase block mb-1">Custo Total</label>
                        <div className="border border-indigo-200 rounded-lg px-2 py-1 text-xs bg-white text-center text-indigo-700 font-bold">{fmt(custoBase)}</div>
                      </div>
                    </div>
                  </div>
                  {/* Preço + Margem */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">💰 Preço Venda</label>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">R$</span>
                        <input type="number" min="0" step="0.01"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-right"
                          value={d.price===0?"":d.price} placeholder="0,00" onChange={e=>setField(p.id, ch, "price", e.target.value)}
                          onBlur={()=>setFieldBlur(p.id, ch, "price")}/>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">📈 Margem</label>
                      <div className="flex items-center gap-0.5">
                        <input type="number" min="0" max="99" step="0.1"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-right"
                          value={d.margin===0?"":d.margin} placeholder="0" onChange={e=>setField(p.id, ch, "margin", e.target.value)}
                          onBlur={()=>setFieldBlur(p.id, ch, "margin")}/>
                        <span className="text-[10px] text-gray-400">%</span>
                      </div>
                    </div>
                  </div>
                  {/* Frete + Taxa + Outros */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">🚚 Frete</label>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">R$</span>
                        <input type="number" min="0" step="0.01"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-right"
                          value={d.freight===0?"":d.freight} placeholder="0" onChange={e=>setField(p.id, ch, "freight", e.target.value)}
                          onBlur={()=>setFieldBlur(p.id, ch, "freight")}/>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase" title="Vem pré-preenchida com a comissão configurada em Parâmetros → Canais. Pode editar aqui pra uma exceção nesse produto.">🏪 Taxa</label>
                        {(() => {
                          const taxaAtual = params?.canais?.[ch]?.comissao;
                          const desatualizada = taxaAtual != null && Number(d.taxaPerc) !== Number(taxaAtual);
                          if (!desatualizada) return null;
                          return (
                            <button type="button"
                              onClick={()=>setField(p.id, ch, "taxaPerc", String(taxaAtual))}
                              title={`Comissão atual em Parâmetros: ${taxaAtual}% (diferente do salvo aqui: ${d.taxaPerc}%). Clique pra usar a atual.`}
                              className="text-amber-500 hover:text-amber-600 text-xs leading-none">⚠️</button>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <input type="number" min="0" max="99" step="0.01"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-right"
                          value={d.taxaPerc===0?"":d.taxaPerc} placeholder="0" onChange={e=>setField(p.id, ch, "taxaPerc", e.target.value)}
                          onBlur={()=>setFieldBlur(p.id, ch, "taxaPerc")}/>
                        <span className="text-[10px] text-gray-400">%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase" title="Valor fixo em R$ configurado em Parâmetros → Canais. Pode editar aqui pra uma exceção nesse produto.">💵 Tx.Fixa</label>
                        {(() => {
                          const fixaAtual = params?.canais?.[ch]?.taxaFixa;
                          const desatualizada = fixaAtual != null && Number(d.taxaFixa||0) !== Number(fixaAtual);
                          if (!desatualizada) return null;
                          return (
                            <button type="button"
                              onClick={()=>setField(p.id, ch, "taxaFixa", String(fixaAtual))}
                              title={`Taxa fixa atual em Parâmetros: R$ ${fixaAtual} (diferente do salvo aqui: R$ ${d.taxaFixa||0}). Clique pra usar a atual.`}
                              className="text-amber-500 hover:text-amber-600 text-xs leading-none">⚠️</button>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">R$</span>
                        <input type="number" min="0" step="0.01"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-right"
                          value={d.taxaFixa===0?"":d.taxaFixa} placeholder="0" onChange={e=>setField(p.id, ch, "taxaFixa", e.target.value)}
                          onBlur={()=>setFieldBlur(p.id, ch, "taxaFixa")}/>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">➕ Outros</label>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">R$</span>
                        <input type="number" min="0" step="0.01"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-right"
                          value={d.otherCosts===0?"":d.otherCosts} placeholder="0" onChange={e=>setField(p.id, ch, "otherCosts", e.target.value)}
                          onBlur={()=>setFieldBlur(p.id, ch, "otherCosts")}/>
                      </div>
                    </div>
                  </div>
                  {d.price>0 && (
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-200">
                      <span className={`text-[10px] font-bold ${mc}`}>{d.margin>0?`${d.margin}% margem`:"sem margem"}</span>
                      <span className="text-[10px] text-gray-400">lucro: <strong className={mc}>{fmt(lucro)}</strong></span>
                      {calcInviavel && (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">⚠️ margem + comissão ≥ 100% — cálculo inviável</span>
                      )}
                      {!calcInviavel && margemDefasada && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5" title="O custo médio mudou desde que este preço foi salvo">⚠️ margem real: {margemReal}%</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


const PricingModule = ({ products, setProducts, params, currentUser }) => (
  <div className="space-y-4">
    <TabelaPrecos products={products} setProducts={setProducts} params={params} currentUser={currentUser}/>
  </div>
);

// ─── Sync Module ─────────────────────────────────────────────────────────
const PLATFORM_INFO = {
  mercadolibre: { label:"Mercado Livre", emoji:"🟡", color:"text-yellow-600", bg:"bg-yellow-50", border:"border-yellow-200" },
  shopee:       { label:"Shopee",        emoji:"🟠", color:"text-orange-600", bg:"bg-orange-50", border:"border-orange-200" },
  woocommerce:  { label:"Loja Própria",  emoji:"🔵", color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200"   },
};

// ─── MLAutomationPanel — Automação de mensagens pós-venda do Mercado Livre ──
const ML_CONFIG_KEY = "ml_automation_config";
const ML_LOG_KEY     = "ml_automation_log";
const ML_DEFAULT_TEMPLATE = "Olá! Tudo bem com o seu pedido? Esperamos que esteja satisfeito(a) com a compra. Se precisar de qualquer coisa, é só chamar! 😊";

const MLAutomationPanel = () => {
  const [status,   setStatus]   = useState({ loading: true, connected: false });
  const [config,   setConfig]   = useState({ template: ML_DEFAULT_TEMPLATE, daysDelay: 3, enabled: false });
  const [log,      setLog]      = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError,  setCheckError]  = useState(null);

  const checkStatus = async () => {
    setStatus(s => ({ ...s, loading: true }));
    try {
      const res  = await fetch('/api/ml-orders?action=status');
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, connected: true, user: data.user, expiresAt: data.token_expires_at });
      } else {
        setStatus({ loading: false, connected: false, authUrl: data.auth_url });
      }
    } catch (e) {
      setStatus({ loading: false, connected: false, error: "Erro ao verificar conexão" });
    }
  };

  useEffect(() => {
    checkStatus();
    window.storage.get(ML_CONFIG_KEY).then(r => {
      if (r?.value) setConfig(JSON.parse(r.value));
    }).catch(() => {});
    window.storage.get(ML_LOG_KEY).then(r => {
      if (r?.value) setLog(JSON.parse(r.value));
    }).catch(() => {});
  }, []);

  const handleConnect = () => {
    if (status.authUrl) window.location.href = status.authUrl;
  };

  const saveConfig = async (newConfig) => {
    setSaving(true);
    setConfig(newConfig);
    try {
      await window.storage.set(ML_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (e) { /* silent */ }
    setSaving(false);
  };

  const checkAndSend = async () => {
    setChecking(true); setCheckError(null); setCheckResult(null);
    try {
      const res  = await fetch(`/api/ml-orders?action=delivered_orders&days=${config.daysDelay + 2}`);
      const data = await res.json();
      if (!res.ok) { setCheckError(data.error || "Erro ao buscar pedidos"); setChecking(false); return; }

      const orders = data.orders || [];
      const sentIds = new Set(log.map(l => l.order_id));
      const now = Date.now();
      const minDelayMs = config.daysDelay * 24 * 60 * 60 * 1000;

      const eligible = orders.filter(o => {
        if (sentIds.has(String(o.id))) return false;
        const deliveredAt = new Date(o.date_last_updated || o.date_closed).getTime();
        return (now - deliveredAt) >= minDelayMs;
      });

      const newLogEntries = [];
      for (const order of eligible) {
        try {
          const packId = order.pack_id || order.id;
          const sendRes = await fetch('/api/ml-orders?action=send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pack_id: packId, message: config.template }),
          });
          newLogEntries.push({
            order_id: String(order.id),
            buyer: order.buyer?.nickname || "Comprador",
            sent_at: new Date().toISOString(),
            success: sendRes.ok,
          });
        } catch (e) {
          newLogEntries.push({ order_id: String(order.id), buyer: order.buyer?.nickname || "Comprador", sent_at: new Date().toISOString(), success: false });
        }
      }

      const updatedLog = [...newLogEntries, ...log].slice(0, 100);
      setLog(updatedLog);
      await window.storage.set(ML_LOG_KEY, JSON.stringify(updatedLog));
      setCheckResult({ found: orders.length, eligible: eligible.length, sent: newLogEntries.filter(l=>l.success).length });

    } catch (e) {
      setCheckError("Erro ao processar: " + e.message);
    }
    setChecking(false);
  };

  return (
    <div className="space-y-4">
      {/* Status de conexão */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-xl">🛒</div>
            <div>
              <p className="font-semibold text-gray-800">Mercado Livre</p>
              {status.loading ? (
                <p className="text-xs text-gray-400">Verificando conexão...</p>
              ) : status.connected ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"/> Conectado como <strong>{status.user}</strong>
                </p>
              ) : (
                <p className="text-xs text-gray-400">Não conectado</p>
              )}
            </div>
          </div>
          {!status.loading && !status.connected && (
            <button onClick={handleConnect} className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl text-sm font-semibold hover:bg-yellow-500">
              Conectar Mercado Livre
            </button>
          )}
          {!status.loading && status.connected && (
            <button onClick={checkStatus} className="text-xs text-gray-400 hover:text-gray-600">Atualizar status</button>
          )}
        </div>
      </div>

      {status.connected && (
        <>
          {/* Configuração do template */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">Mensagem Automática Pós-Venda</p>
              <button onClick={() => saveConfig({ ...config, enabled: !config.enabled })}
                className={`w-12 h-6 rounded-full transition-all relative ${config.enabled ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${config.enabled ? "right-0.5" : "left-0.5"}`}/>
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {config.enabled ? "Automação ativa — verifique periodicamente para enviar mensagens" : "Automação desativada"}
            </p>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Enviar após quantos dias da entrega?</label>
              <input type="number" min="1" max="14"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={config.daysDelay} onChange={e => saveConfig({ ...config, daysDelay: parseInt(e.target.value) || 1 })}/>
              <span className="text-sm text-gray-500 ml-2">dias</span>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Mensagem</label>
              <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                value={config.template} onChange={e => saveConfig({ ...config, template: e.target.value })}/>
            </div>
            {saving && <p className="text-xs text-gray-400">Salvando...</p>}
          </div>

          {/* Verificação manual */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <button onClick={checkAndSend} disabled={checking}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {checking
                ? <><div className="w-4 h-4 border-2 border-yellow-900/40 border-t-yellow-900 rounded-full animate-spin"/> Verificando pedidos...</>
                : <><span>🔍</span> Verificar Pedidos Entregues Agora</>
              }
            </button>
            {checkError && <p className="text-xs text-red-600 mt-2">⚠️ {checkError}</p>}
            {checkResult && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                ✅ {checkResult.found} pedido(s) entregue(s) encontrado(s) · {checkResult.eligible} elegível(eis) · <strong>{checkResult.sent} mensagem(ns) enviada(s)</strong>
              </div>
            )}
          </div>

          {/* Log de mensagens enviadas */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Histórico de Mensagens Enviadas ({log.length})</p>
            {log.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhuma mensagem enviada ainda</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {log.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="font-mono text-indigo-600 font-bold">#{l.order_id}</span>
                      <span className="text-gray-500 ml-2">{l.buyer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{new Date(l.sent_at).toLocaleString("pt-BR")}</span>
                      <span className={l.success ? "text-green-600" : "text-red-500"}>{l.success ? "✓" : "✕"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const SyncOperationsPanel = ({ orders, setOrders, backendUrl }) => {
  const [health,     setHealth]     = useState(null);
  const [syncing,    setSyncing]    = useState(false);
  const [syncLog,    setSyncLog]    = useState([]);
  const [lastSync,   setLastSync]   = useState(() => localStorage.getItem("erp_last_sync") || null);
  const [imported,   setImported]   = useState([]);
  const [error,      setError]      = useState(null);
  const [logs,       setLogs]       = useState([]);

  const checkHealth = async () => {
    if (!backendUrl) return;
    setError(null);
    try {
      const res  = await fetch(`${backendUrl}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      setError("Não foi possível conectar ao backend. Verifique a URL.");
      setHealth(null);
    }
  };

  useEffect(() => { if (backendUrl) checkHealth(); }, [backendUrl]);

  const handleSync = async () => {
    if (!backendUrl || syncing) return;
    setSyncing(true); setError(null); setImported([]);

    try {
      // 1. Trigger sync on backend
      await fetch(`${backendUrl}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "all" }),
      });

      // 2. Fetch orders since last sync
      const since = lastSync || new Date(Date.now() - 30*24*60*60*1000).toISOString();
      const res   = await fetch(`${backendUrl}/orders?since=${encodeURIComponent(since)}`);
      const data  = await res.json();
      const remoteOrders = data.orders || [];

      // 3. Map to ERP format and merge
      const existingIds = new Set(orders.map(o => o.id));
      const newOrders   = [];

      remoteOrders.forEach(ro => {
        if (existingIds.has(ro.id)) {
          // Update status if changed
          setOrders(prev => prev.map(o =>
            o.id === ro.id && o.status !== ro.status ? { ...o, status: ro.status, tracking: ro.tracking || o.tracking } : o
          ));
        } else {
          const items = Array.isArray(ro.items) ? ro.items : (JSON.parse(ro.items || "[]"));
          newOrders.push({
            id:       ro.id,
            customer: ro.customer_name,
            channel:  ro.channel || PLATFORM_INFO[ro.platform]?.label || ro.platform,
            status:   ro.status || "Novo",
            total:    Number(ro.total) || 0,
            items:    items.map(i => `${i.name} x${i.qty}`).join(", ") || "—",
            date:     (ro.created_at || "").split("T")[0] || today(),
            payment:  ro.payment || "—",
            tracking: ro.tracking || "",
            notes:    `Importado via ${PLATFORM_INFO[ro.platform]?.label || ro.platform}`,
          });
        }
      });

      if (newOrders.length > 0) {
        setOrders(prev => [...newOrders, ...prev]);
      }

      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem("erp_last_sync", now);
      setImported(newOrders);
      setSyncLog(prev => [{
        ts: new Date().toLocaleTimeString("pt-BR"),
        count: remoteOrders.length,
        new: newOrders.length,
        platforms: [...new Set(remoteOrders.map(o => o.platform))],
      }, ...prev.slice(0,9)]);

      // 4. Fetch backend logs
      const logsRes  = await fetch(`${backendUrl}/logs`);
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);

    } catch (e) {
      setError("Erro na sincronização: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const totalImported = orders.filter(o => o.notes?.includes("Importado via")).length;

  return (
    <div className="space-y-4">
      {/* Status de conexão (URL configurada acima) */}
      {backendUrl ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <code className="text-xs bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl flex-1 text-gray-600 truncate">{backendUrl}</code>
          {health ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium shrink-0">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
              <span className="w-2 h-2 bg-gray-300 rounded-full"/> Verificando...
            </span>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          ⚠️ Configure o <strong>Backend URL</strong> acima para habilitar a sincronização.
        </div>
      )}

      {/* Health / Auth status */}
      {health && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(PLATFORM_INFO).map(([key, info]) => {
            const ok = health.auth?.[key];
            return (
              <div key={key} className={`rounded-xl p-3 border ${ok ? info.bg+" "+info.border : "bg-gray-50 border-gray-100"} text-center`}>
                <p className="text-lg">{info.emoji}</p>
                <p className={`text-xs font-semibold mt-0.5 ${ok ? info.color : "text-gray-400"}`}>{info.label}</p>
                <p className={`text-[10px] mt-0.5 ${ok ? "text-green-600" : "text-gray-400"}`}>
                  {ok ? "✓ Autenticado" : "Não autenticado"}
                </p>
                {!ok && key === "mercadolibre" && backendUrl && (
                  <a href={`${backendUrl}/auth/ml`} target="_blank" rel="noopener noreferrer"
                    className="mt-1 inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full font-medium hover:bg-yellow-200">
                    Autenticar →
                  </a>
                )}
                {!ok && key === "shopee" && backendUrl && (
                  <a href={`${backendUrl}/auth/shopee`} target="_blank" rel="noopener noreferrer"
                    className="mt-1 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-full font-medium hover:bg-orange-200">
                    Autenticar →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠️ {error}</div>}

      {/* Sync button */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-800">Sincronizar Pedidos</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {lastSync ? `Última sync: ${new Date(lastSync).toLocaleString("pt-BR")}` : "Nunca sincronizado"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-700">{totalImported}</p>
            <p className="text-xs text-gray-400">pedidos importados</p>
          </div>
        </div>
        <button onClick={handleSync} disabled={!backendUrl || syncing}
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
          {syncing
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Sincronizando...</>
            : <><span className="text-lg">🔄</span> Sincronizar Agora</>
          }
        </button>
        {!backendUrl && (
          <p className="text-center text-xs text-gray-400 mt-2">Configure o endpoint do backend acima para começar</p>
        )}
      </div>

      {/* Last sync result */}
      {imported.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-green-700 mb-2">✅ {imported.length} pedido{imported.length!==1?"s":""} novo{imported.length!==1?"s":""} importado{imported.length!==1?"s":""}</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {imported.map(o=>(
              <div key={o.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-1.5">
                <span className="font-mono text-indigo-600 font-bold">{o.id}</span>
                <span className="text-gray-600">{o.customer}</span>
                <span className="font-semibold text-gray-800">{fmt(o.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync history */}
      {syncLog.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Histórico de Sincronização</p>
          <div className="space-y-2">
            {syncLog.map((l,i)=>(
              <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-400 shrink-0">{l.ts}</span>
                <div className="flex gap-1 flex-wrap">
                  {(l.platforms||[]).map(p=>(
                    <span key={p} className={`px-1.5 py-0.5 rounded-full font-medium ${PLATFORM_INFO[p]?.bg||"bg-gray-100"} ${PLATFORM_INFO[p]?.color||"text-gray-600"}`}>
                      {PLATFORM_INFO[p]?.emoji} {PLATFORM_INFO[p]?.label||p}
                    </span>
                  ))}
                </div>
                <span className="ml-auto text-gray-500 shrink-0">{l.count} recebidos · <span className="text-green-600 font-medium">+{l.new} novos</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup guide banner */}
      {!backendUrl && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <p className="font-semibold text-indigo-800 mb-2">📋 Como configurar o backend</p>
          <ol className="text-sm text-indigo-700 space-y-1.5 list-decimal pl-4">
            <li>Crie conta gratuita em <strong>supabase.com</strong> e <strong>cloudflare.com</strong></li>
            <li>Execute o <code className="bg-indigo-100 px-1 rounded">schema.sql</code> no Supabase SQL Editor</li>
            <li>Instale o Wrangler: <code className="bg-indigo-100 px-1 rounded">npm install -g wrangler</code></li>
            <li>Configure as variáveis e deploy o <code className="bg-indigo-100 px-1 rounded">worker.js</code></li>
            <li>Cole a URL do worker aqui e autentique cada plataforma</li>
          </ol>
          <p className="text-xs text-indigo-500 mt-3">📄 Veja o guia completo em <strong>GUIA-SETUP.md</strong> nos arquivos baixados</p>
        </div>
      )}
    </div>
  );
};

// ─── Roles & Permissions ─────────────────────────────────────────────────
const ALL_MODULES = ["dashboard","orders","cotacao","inventory","pricing","pricehunt","pdv",
                     "receber","pagar","fiscal","crm","suppliers","purchases","reports","movimentos","cadastros","parametros"];

const ROLES_DEF = {
  admin:      { label:"Administrador", color:"text-purple-700", bg:"bg-purple-100",  modules:[...ALL_MODULES,"usuarios"] },
  gerente:    { label:"Gerente",       color:"text-blue-700",   bg:"bg-blue-100",    modules:ALL_MODULES },
  vendedor:   { label:"Vendedor",      color:"text-green-700",  bg:"bg-green-100",   modules:["dashboard","orders","pricing","pricehunt","crm"] },
  estoque:    { label:"Estoque",       color:"text-amber-700",  bg:"bg-amber-100",   modules:["dashboard","inventory","purchases","suppliers"] },
  financeiro: { label:"Financeiro",    color:"text-indigo-700", bg:"bg-indigo-100",  modules:["dashboard","receber","pagar","fiscal","reports","movimentos"] },
  viewer:     { label:"Visualizador",  color:"text-gray-600",   bg:"bg-gray-100",    modules:["dashboard","reports"] },
};

const MOD_LABELS = {
  dashboard:"Dashboard", orders:"Pedidos", cotacao:"Cotações",
  inventory:"Estoque", pricing:"Tabela de Preços", pricehunt:"PriceHunt", pdv:"PDV",
  receber:"Contas a Receber", pagar:"Contas a Pagar", fiscal:"Fiscal", crm:"Clientes",
  suppliers:"Fornecedores", purchases:"Compras", reports:"Relatórios", movimentos:"Movimentos", usuarios:"Usuários", cadastros:"Cadastros", parametros:"Parâmetros",
};

// ─── Authentication ───────────────────────────────────────────────────────
const AUTH = {
  sess: "erp_session_v2",
};

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256",
    new TextEncoder().encode(text + "::mmarmarinhos2025"));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

// Session helpers — sessão persistente (v3.30.0)
// A sessão fica em localStorage com validade de 30 dias (alinhada ao teto do
// servidor em /api/login), então fechar o navegador/app não desloga mais.
// A validade REAL continua sendo controlada no servidor: todo acesso valida o
// tíquete contra a tabela sessions e devolve 401 se expirado/revogado — o
// carimbo `exp` aqui é só pra não tentar usar um tíquete já vencido.
const SESSION_DAYS = 30;
const getSession = () => {
  try {
    const raw = localStorage.getItem(AUTH.sess);
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.exp && Date.now() > s.exp) { localStorage.removeItem(AUTH.sess); return null; }
      return s;
    }
    // Migração: sessão antiga (pré-v3.30.0) vivia em sessionStorage — promove
    // pra localStorage com validade, sem deslogar quem estava usando.
    const legacy = sessionStorage.getItem(AUTH.sess);
    if (legacy) {
      const s = JSON.parse(legacy);
      s.exp = Date.now() + SESSION_DAYS * 24 * 3600 * 1000;
      localStorage.setItem(AUTH.sess, JSON.stringify(s));
      sessionStorage.removeItem(AUTH.sess);
      return s;
    }
    return null;
  } catch { return null; }
};
const setSession = (u) => localStorage.setItem(AUTH.sess, JSON.stringify({ ...u, exp: u.exp || (Date.now() + SESSION_DAYS * 24 * 3600 * 1000) }));
const clearSession = () => { localStorage.removeItem(AUTH.sess); sessionStorage.removeItem(AUTH.sess); };

function buildUserSession(u) {
  const modules = u.customModules || ROLES_DEF[u.role]?.modules || ROLES_DEF.viewer.modules;
  return { id:u.id, username:u.username, displayName:u.displayName||u.username, role:u.role, modules, customPermissions: u.customPermissions || null };
}

// Permissão detalhada (Ver/Incluir/Alterar/Excluir) por módulo. Se o usuário
// não tiver personalização pra esse módulo/ação, cai no padrão: quem enxerga
// o módulo (customModules/perfil) pode fazer tudo nele — exatamente como o
// sistema já se comportava antes dessa funcionalidade existir, então nada
// muda pra quem nunca foi personalizado.
function getUserPerm(session, moduleId, action) {
  if (!session) return false;
  const custom = session.customPermissions?.[moduleId];
  if (custom && typeof custom[action] === "boolean") return custom[action];
  const modules = session.modules || ROLES_DEF[session.role]?.modules || ROLES_DEF.viewer.modules;
  return modules.includes(moduleId);
}

// ─── Setup Screen (first access) ─────────────────────────────────────────
const AuthSetup = ({ onDone }) => {
  const [user,  setUser]  = useState("");
  const [name,  setName]  = useState("");
  const [pwd,   setPwd]   = useState("");
  const [pwd2,  setPwd2]  = useState("");
  const [rkey, setRkey]   = useState("");
  const [step,  setStep]  = useState(1);
  const [err,   setErr]   = useState("");
  const [copied,setCopied]= useState(false);
  const [loading,setL]    = useState(false);

  const [createdUser, setCreatedUser] = useState(null);
  const [createdToken, setCreatedToken] = useState(null);

  const handleCreate = async () => {
    if (!user.trim())     { setErr("Informe um nome de usuário"); return; }
    if (pwd.length < 6)   { setErr("Senha mínimo 6 caracteres"); return; }
    if (pwd !== pwd2)     { setErr("Senhas não coincidem"); return; }
    setL(true); setErr("");
    try {
      const hash = await sha256(pwd);
      const r = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.trim().toLowerCase(), displayName: name.trim()||user.trim(), passwordHash: hash }),
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok) { setErr(data.error||"Erro ao criar usuário"); setL(false); return; }
      setRkey(data.recoveryKey);
      setCreatedUser(data.user);
      setCreatedToken(data.token);
      setStep(2);
    } catch(e) { setErr("Erro ao criar: "+e.message); }
    setL(false);
  };

  const handleFinish = () => {
    const u = createdUser
      ? { id:createdUser.id, username:createdUser.username, displayName:createdUser.displayName||createdUser.username, role:createdUser.role, modules:[...ALL_MODULES,"usuarios"] }
      : { id:"USR-001", username:user.trim().toLowerCase(), displayName:name.trim()||user.trim(), role:"admin", modules:[...ALL_MODULES,"usuarios"] };
    const session = { ...u, token: createdToken };
    setSession(session); onDone(session);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-3">
          <img src={mmErpLogoUrl} alt="MM ERP" className="mx-auto mb-2" style={{width:240,height:240,objectFit:"contain"}}/>
          <p className="text-gray-500 mt-1 text-sm">{step===1?"Configurar acesso inicial":"Guarde sua chave de recuperação"}</p>
        </div>

        {step===1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nome completo</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Thalles Costa" autoFocus/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Usuário (login)</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={user} onChange={e=>setUser(e.target.value)} placeholder="Ex: thalles"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Senha</label>
              <input type="password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Mínimo 6 caracteres"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Confirmar Senha</label>
              <input type="password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={pwd2} onChange={e=>setPwd2(e.target.value)} placeholder="Repita a senha"
                onKeyDown={e=>e.key==="Enter"&&handleCreate()}/>
            </div>
            {err && <p className="text-red-500 text-sm">{err}</p>}
            <button onClick={handleCreate} disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading?"Criando...":"Criar Acesso →"}
            </button>
          </div>
        )}

        {step===2 && (
          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-800 mb-1">⚠️ Anote esta chave de recuperação</p>
              <p className="text-xs text-amber-700 mb-3">Se esquecer a senha, use esta chave para redefinir <strong>sem perder dados</strong>.</p>
              <div className="bg-white border border-amber-300 rounded-xl p-3 flex items-center justify-between gap-2">
                <code className="font-mono font-bold text-xl text-gray-900 tracking-widest">{rkey}</code>
                <button onClick={()=>{ navigator.clipboard?.writeText(rkey).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
                  className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 shrink-0">
                  {copied?"✓":"Copiar"}
                </button>
              </div>
            </div>
            <button onClick={handleFinish} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Já guardei — Entrar ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Login Screen ─────────────────────────────────────────────────────────
const AuthLogin = ({ onDone }) => {
  const [username, setUsername] = useState("");
  const [pwd,      setPwd]      = useState("");
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [mode,     setMode]     = useState("login");
  const [rf,       setRf]       = useState({ rkey:"", pwd:"", pwd2:"" });
  const [success,  setSuc]      = useState("");
  const setR = (k,v) => setRf(p=>({...p,[k]:v}));

  const login = async () => {
    if (!username.trim()||!pwd) return;
    setLoading(true); setErr("");
    try {
      const hash = await sha256(pwd);
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase(), passwordHash: hash }),
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok) { setErr(data.error||"Usuário ou senha incorretos"); setPwd(""); setLoading(false); return; }
      const u = {
        id: data.user.id, username: data.user.username,
        displayName: data.user.displayName||data.user.username,
        role: data.user.role, customModules: data.user.customModules ?? null,
        customPermissions: data.user.customPermissions ?? null,
      };
      const session = { ...buildUserSession(u), token: data.token };
      setSession(session); onDone(session);
    } catch(e) { setErr("Erro: "+e.message); }
    setLoading(false);
  };

  const recover = async () => {
    setErr("");
    if (!username.trim()) { setErr("Informe o usuário"); return; }
    if (!rf.rkey.trim())  { setErr("Informe a chave de recuperação"); return; }
    if (rf.pwd.length<6)  { setErr("Senha mínimo 6 caracteres"); return; }
    if (rf.pwd!==rf.pwd2) { setErr("Senhas não coincidem"); return; }
    setLoading(true);
    try {
      const newHash = await sha256(rf.pwd);
      const okResult = await dbResetPasswordWithRecovery(
        username.trim().toLowerCase(), rf.rkey.toUpperCase().replace(/\s/g,""), newHash
      );
      if (!okResult) { setErr("Usuário ou chave de recuperação incorretos"); setLoading(false); return; }
      setSuc("✅ Senha redefinida! Dados intactos.");
      setTimeout(()=>{ setMode("login"); setSuc(""); setPwd(""); setRf({rkey:"",pwd:"",pwd2:""}); }, 2500);
    } catch(e) { setErr("Erro: "+e.message); }
    setLoading(false);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-3">
          <img src={mmErpLogoUrl} alt="MM ERP" className="mx-auto mb-2" style={{width:240,height:240,objectFit:"contain"}}/>
          <p className="text-gray-500 mt-1 text-sm">{mode==="login"?"Acesso ao sistema":"Recuperar senha"}</p>
        </div>
        {mode==="login" ? (
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Usuário</label>
              <input className={inp} value={username} onChange={e=>setUsername(e.target.value)} placeholder="seu.usuario" autoFocus onKeyDown={e=>e.key==="Enter"&&login()}/>
            </div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Senha</label>
              <input type="password" className={inp} value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&login()}/>
            </div>
            {err && <p className="text-red-500 text-sm">{err}</p>}
            <button onClick={login} disabled={loading||!username||!pwd}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading?"Verificando...":"Entrar"}
            </button>
            <button onClick={()=>{setMode("recover");setErr("");}} className="w-full text-sm text-indigo-600 hover:underline">Esqueci minha senha →</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">🔑 Seus dados <strong>não serão perdidos</strong>.</div>
            {[["Usuário",username,setUsername,"text","seu.usuario",false],
              ["Chave de Recuperação",rf.rkey,v=>setR("rkey",v.toUpperCase()),"text","XXXX-XXXX-XXXX-XXXX",true],
              ["Nova Senha",rf.pwd,v=>setR("pwd",v),"password","Mínimo 6 caracteres",false],
              ["Confirmar Nova Senha",rf.pwd2,v=>setR("pwd2",v),"password","Repita",false],
            ].map(([l,val,fn,t,ph,mono])=>(
              <div key={l}><label className="text-sm font-medium text-gray-700 block mb-1">{l}</label>
                <input type={t} className={`${inp} ${mono?"font-mono tracking-widest":""}`} value={val}
                  onChange={e=>fn(e.target.value)} placeholder={ph} maxLength={mono?19:undefined}/>
              </div>
            ))}
            {err && <p className="text-red-500 text-sm">{err}</p>}
            {success && <p className="text-green-600 text-sm font-medium">{success}</p>}
            {!success && <button onClick={recover} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">{loading?"Processando...":"Redefinir Senha"}</button>}
            <button onClick={()=>{setMode("login");setErr("");}} className="w-full text-sm text-gray-500 hover:text-gray-700">← Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── App-level auth wrapper ───────────────────────────────────────────────
const AppAuth = ({ children }) => {
  const [authState, setAuthState] = useState("checking");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    dbCountUsers().then(raw => {
      const count = typeof raw === "number" ? raw : (Array.isArray(raw) ? (raw[0]?.count ?? raw[0] ?? 0) : (raw?.count ?? 0));
      if (!count) { setAuthState("setup"); return; }
      const session = getSession();
      if (session && session.id === "DEMO") {
        clearSession();
        setAuthState("login");
        return;
      }
      if (session && !session.token) {
        // Sessão de antes da troca pro servidor intermediário (sem tíquete) — inválida agora
        clearSession();
        setAuthState("login");
        return;
      }
      if (session) {
        // Sempre atualiza módulos pelo role atual (captura novos módulos adicionados ao sistema)
        const freshModules = session.customModules || ROLES_DEF[session.role]?.modules || ROLES_DEF.viewer.modules;
        session.modules = freshModules;
        setSession(session);
        setCurrentUser(session);
        setAuthState("authed");
        return;
      }
      setAuthState("login");
    }).catch(() => setAuthState("login"));
  }, []);

  if (authState==="checking") return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (authState==="setup") return <AuthSetup onDone={u=>{ setCurrentUser(u); setAuthState("authed"); }}/>;
  if (authState==="login") return <AuthLogin onDone={u=>{ setCurrentUser(u); setAuthState("authed"); }}/>;
  return children({ currentUser, onLogout:()=>{
    const token = getSession()?.token;
    if (token) {
      fetch("/api/logout", { method:"POST", headers:{ Authorization:`Bearer ${token}` } }).catch(()=>{});
    }
    clearSession(); setAuthState("login"); setCurrentUser(null);
  } });
};

// ─── User Management Module ───────────────────────────────────────────────
const UsersModule = ({ currentUser }) => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | "new" | user
  const [saving,  setSaving]  = useState(false);

  const normalizeUser = (u) => ({
    id: u.id,
    username: u.username,
    displayName: u.display_name ?? u.displayName ?? u.username,
    role: u.role,
    customModules: u.custom_modules ?? u.customModules ?? null,
    customPermissions: u.custom_permissions ?? u.customPermissions ?? null,
    active: u.active !== undefined ? u.active : true,
    createdAt: u.created_at ?? u.createdAt,
  });

  const callUsersApi = async (body) => {
    const token = getSession()?.token;
    const r = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(()=>({}));
    if (!r.ok) throw new Error(data.error || `Erro ${r.status}`);
    return data;
  };

  const [loadErr, setLoadErr] = useState("");
  const load = async () => {
    setLoading(true); setLoadErr("");
    try {
      const data = await callUsersApi({ action:"list" });
      setUsers((data.users||[]).map(normalizeUser));
    } catch(e) {
      console.error(e);
      // Antes o erro ia só pro console e a tela mostrava lista vazia —
      // indistinguível de "não há usuários".
      setLoadErr(e.message || "Erro ao carregar usuários");
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // User form state
  const emptyForm = { username:"", displayName:"", pwd:"", role:"vendedor", customModules:null, useCustom:false, customPermissions:null, useCustomPerms:false };
  const [form, setForm]   = useState(emptyForm);
  const [err,  setErr]    = useState("");
  const [ok,   setOk]     = useState("");
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const roleModules = ROLES_DEF[form.role]?.modules || [];
  const effectiveModules = form.useCustom ? (form.customModules || roleModules) : roleModules;

  const toggleMod = (mod) => {
    const cur = form.customModules || roleModules;
    const next = cur.includes(mod) ? cur.filter(m=>m!==mod) : [...cur, mod];
    setF("customModules", next);
  };

  // Permissão detalhada por módulo: incluir/alterar/excluir. "Ver" é sempre
  // o mesmo da lista de módulos acima — não duplica esse controle aqui.
  const PERM_ACTIONS = ["incluir","alterar","excluir"];
  const getPermChecked = (mod, action) => {
    if (form.useCustomPerms && form.customPermissions?.[mod]?.[action] !== undefined) {
      return form.customPermissions[mod][action];
    }
    return effectiveModules.includes(mod); // padrão: quem vê, pode tudo
  };
  const togglePerm = (mod, action) => {
    const cur = form.customPermissions || {};
    const modPerm = { ...(cur[mod] || {}) };
    modPerm[action] = !getPermChecked(mod, action);
    setF("customPermissions", { ...cur, [mod]: modPerm });
  };

  const openNew = () => { setForm(emptyForm); setErr(""); setOk(""); setModal("new"); };
  const openEdit = (u) => {
    setForm({ username:u.username, displayName:u.displayName||"", pwd:"", role:u.role,
      customModules:u.customModules||null, useCustom:!!u.customModules,
      customPermissions:u.customPermissions||null, useCustomPerms:!!u.customPermissions });
    setErr(""); setOk(""); setModal(u);
  };

  const handleSave = async () => {
    setErr("");
    if (!form.username.trim()) { setErr("Informe o usuário"); return; }
    if (modal==="new" && form.pwd.length<6) { setErr("Senha mínimo 6 caracteres"); return; }
    setSaving(true);
    try {
      if (modal==="new") {
        if (users.find(u=>u.username===form.username.toLowerCase())) { setErr("Usuário já existe"); setSaving(false); return; }
        const hash = await sha256(form.pwd);
        const data = await callUsersApi({
          action:"create", username:form.username.toLowerCase(), displayName:form.displayName||form.username,
          passwordHash:hash, role:form.role,
        });
        // create_erp_user não aceita customModules/customPermissions direto —
        // se a pessoa já personalizou na hora de criar, busca o usuário recém
        // criado e aplica a personalização com uma segunda chamada, senão
        // essas escolhas eram descartadas em silêncio.
        if (form.useCustom || form.useCustomPerms) {
          const fresh = await callUsersApi({ action:"list" });
          const created = (fresh.users||[]).find(u=>u.username===form.username.toLowerCase());
          if (created) {
            await callUsersApi({
              action:"updateProfile", id:created.id, displayName:form.displayName||form.username,
              role:form.role, customModules: form.useCustom?form.customModules:null,
              customPermissions: form.useCustomPerms?form.customPermissions:null,
            });
          } else {
            // Sem confirmação de que a personalização foi aplicada — avisa em
            // vez de perder as escolhas em silêncio.
            setErr("⚠️ Usuário criado, mas a personalização de módulos/permissões não pôde ser confirmada — abra o usuário e aplique de novo.");
          }
        }
        setOk(`✅ Usuário criado! Chave de recuperação: ${data.recoveryKey}`);
        load();
        setForm(emptyForm);
      } else {
        await callUsersApi({
          action:"updateProfile", id:modal.id, displayName:form.displayName||modal.displayName,
          role:form.role, customModules: form.useCustom?form.customModules:null,
          customPermissions: form.useCustomPerms?form.customPermissions:null,
        });
        if (form.pwd.length>=6) {
          const newHash = await sha256(form.pwd);
          await callUsersApi({ action:"setPassword", id:modal.id, passwordHash:newHash });
        }
        setOk("✅ Usuário atualizado!"); load();
      }
    } catch(e) { setErr("Erro: "+e.message); }
    setSaving(false);
  };

  const [actionErr, setActionErr] = useState("");
  const toggleActive = async (u) => {
    setActionErr("");
    try { await callUsersApi({ action:"toggleActive", id:u.id, active:!u.active }); }
    catch(e) { console.error(e); setActionErr(e.message || "Erro ao alterar o usuário"); }
    load();
  };

  const [confirmDelete, setConfirmDelete] = useState(null);
  const deleteUser = async (u) => {
    setActionErr("");
    try { await callUsersApi({ action:"delete", id:u.id }); load(); }
    catch(e) { setActionErr("Erro ao excluir: "+e.message); }
    setConfirmDelete(null);
  };

  const roleStyle = (r) => ({ bg: ROLES_DEF[r]?.bg||"bg-gray-100", text: ROLES_DEF[r]?.color||"text-gray-600", label: ROLES_DEF[r]?.label||r });

  const allModsWithUsuarios = [...ALL_MODULES, "usuarios"];

  return (
    <div className="space-y-4">
      {(loadErr || actionErr) && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">⚠️ {loadErr || actionErr}</p>
          {loadErr && <button onClick={load} className="text-xs font-medium text-red-700 underline shrink-0">Tentar de novo</button>}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Usuários do Sistema</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie acessos e permissões</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
          + Novo Usuário
        </button>
      </div>

      {/* User list */}
      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Carregando...</p> : (
        <div className="space-y-2">
          {users.map(u => {
            const rs = roleStyle(u.role);
            const mods = u.customModules || ROLES_DEF[u.role]?.modules || [];
            return (
              <div key={u.id} className={`bg-white border rounded-2xl p-4 transition-all ${u.active?"border-gray-100":"border-dashed border-gray-200 opacity-60"}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {(u.displayName||u.username)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{u.displayName||u.username}</span>
                        <span className="text-xs text-gray-400 font-mono">@{u.username}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rs.bg} ${rs.text}`}>{rs.label}</span>
                        {!u.active && <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inativo</span>}
                        {u.username===currentUser.username && <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Você</span>}
                        {u.customModules && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Permissões personalizadas</span>}
                        {u.customPermissions && <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Ver/Incluir/Alterar/Excluir personalizado</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={()=>openEdit(u)} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Editar</button>
                    {u.username!==currentUser.username && (
                      <>
                        <button onClick={()=>toggleActive(u)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${u.active?"bg-red-50 text-red-600 hover:bg-red-100":"bg-green-50 text-green-600 hover:bg-green-100"}`}>
                          {u.active?"Desativar":"Reativar"}
                        </button>
                        <button onClick={()=>setConfirmDelete(u)}
                          className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-gray-900">{modal==="new"?"Novo Usuário":"Editar Usuário"}</h2>
              <button onClick={()=>setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Nome completo</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    value={form.displayName} onChange={e=>setF("displayName",e.target.value)} placeholder="Nome do usuário"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Usuário (login) {modal==="new"&&"*"}</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    value={form.username} onChange={e=>setF("username",e.target.value.toLowerCase())}
                    placeholder="usuario" disabled={modal!=="new"}/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{modal==="new"?"Senha *":"Nova Senha (opcional)"}</label>
                  <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    value={form.pwd} onChange={e=>setF("pwd",e.target.value)} placeholder="Mínimo 6 caracteres"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Perfil base</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    value={form.role} onChange={e=>{ setF("role",e.target.value); setF("customModules",null); }}
                    disabled={modal!=="new" && modal?.username===currentUser.username}
                    title={modal!=="new" && modal?.username===currentUser.username ? "Você não pode alterar o próprio nível de acesso" : undefined}>
                    {Object.entries(ROLES_DEF).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Module permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Módulos com acesso</label>
                  <label className="flex items-center gap-1.5 text-xs text-indigo-600 cursor-pointer">
                    <input type="checkbox" checked={form.useCustom} onChange={e=>{ setF("useCustom",e.target.checked); if(!e.target.checked) setF("customModules",null); }}/>
                    Personalizar
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {allModsWithUsuarios.map(mod => {
                    const active = form.useCustom
                      ? (form.customModules||roleModules).includes(mod)
                      : roleModules.includes(mod);
                    return (
                      <label key={mod} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all
                        ${active?"border-indigo-300 bg-indigo-50 text-indigo-700":"border-gray-100 bg-gray-50 text-gray-400"}
                        ${!form.useCustom?"opacity-70 cursor-default":""}`}>
                        <input type="checkbox" checked={active} disabled={!form.useCustom}
                          onChange={()=>form.useCustom&&toggleMod(mod)} className="accent-indigo-600"/>
                        <span className="font-medium">{MOD_LABELS[mod]||mod}</span>
                      </label>
                    );
                  })}
                </div>
                {!form.useCustom && <p className="text-[10px] text-gray-400 mt-1">Usando permissões padrão do perfil "{ROLES_DEF[form.role]?.label}". Marque "Personalizar" para ajustar.</p>}
              </div>

              {/* Detailed CRUD permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Permissões detalhadas</label>
                  <label className="flex items-center gap-1.5 text-xs text-indigo-600 cursor-pointer">
                    <input type="checkbox" checked={form.useCustomPerms}
                      onChange={e=>{ setF("useCustomPerms",e.target.checked); if(!e.target.checked) setF("customPermissions",null); }}/>
                    Personalizar
                  </label>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 bg-gray-50 text-[10px] font-semibold text-gray-400 uppercase">
                    <span>Módulo</span><span className="w-14 text-center">Incluir</span><span className="w-14 text-center">Alterar</span><span className="w-14 text-center">Excluir</span>
                  </div>
                  {allModsWithUsuarios.map(mod => {
                    const ve = effectiveModules.includes(mod);
                    return (
                      <div key={mod} className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 items-center border-t border-gray-50 text-xs ${ve?"":"opacity-40"}`}>
                        <span className="text-gray-700 truncate">{MOD_LABELS[mod]||mod}</span>
                        {PERM_ACTIONS.map(action => (
                          <div key={action} className="w-14 flex justify-center">
                            <input type="checkbox" className="accent-indigo-600"
                              checked={ve && getPermChecked(mod, action)}
                              disabled={!form.useCustomPerms || !ve}
                              onChange={()=>togglePerm(mod, action)}/>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                {!form.useCustomPerms && <p className="text-[10px] text-gray-400 mt-1">Sem personalização: quem vê o módulo (acima) pode incluir/alterar/excluir livremente nele. Marque "Personalizar" pra restringir.</p>}
              </div>

              {err && <p className="text-red-500 text-sm">{err}</p>}
              {ok  && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700 font-mono break-all">{ok}</div>}
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100 shrink-0">
              <button onClick={()=>setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                {saving?"Salvando...":(modal==="new"?"Criar Usuário":"Salvar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <p className="font-bold text-gray-900 mb-1">Excluir usuário?</p>
            <p className="text-sm text-gray-500 mb-4">
              Tem certeza que quer excluir <b>{confirmDelete.displayName||confirmDelete.username}</b>? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={()=>deleteUser(confirmDelete)} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Purchase Order Modal ────────────────────────────────────────────────
const PurchaseModal = ({ purchase, suppliers, products = [], params, onClose, onSave }) => {
  const isNew = !purchase;
  const statusOptions = (params?.compras?.statusList?.length ? params.compras.statusList : PC_STATUS);
  const emptyItem = () => ({ sku:"", description:"", qty:1, unit:"un", unitPrice:0, discount:0, discountType:"%", total:0, _prodId:null, receivedQty:0 });

  const [form, setForm] = useState(purchase ? { ...purchase } : {
    supplierId:"", supplierName:"", date:today(), nfEmissionDate:"", receivedDate:"",
    status:"Em Aberto", paymentTerms:"30 dias", freight:0, discount:0,
    dueDate:"", nfNumber:"", notes:"", items:[emptyItem()], subtotal:0, total:0,
  });

  const calcItemTotal = (it) => {
    const gross = (it.qty||0)*(it.unitPrice||0);
    const disc = it.discountType==="%"?gross*((it.discount||0)/100):(it.discount||0);
    return Math.max(0, gross-disc);
  };

  const calcTotal = (f) => {
    const sub = (f.items||[]).reduce((s,it)=>s+(it.total||0),0);
    return sub + (Number(f.freight)||0) - (Number(f.discount)||0);
  };

  // Supplier autocomplete
  const [supSearch, setSupSearch] = useState(purchase?.supplierName||"");
  const [showSupList, setShowSupList] = useState(false);
  const [supHighlight, setSupHighlight] = useState(0);
  const filteredSups = suppliers
    .filter(s=>s.status==="Ativo"||s.status==="Desenvolvimento")
    .filter(s=>s.name?.toLowerCase().includes(supSearch.toLowerCase()))
    .slice(0,8);
  const supInputRef = useRef(null);
  const selectSupplier = (s) => {
    setSupSearch(s.name);
    setForm(f=>({...f, supplierId:s.id, supplierName:s.name, paymentTerms:s.paymentTerms?String(s.paymentTerms)+"":f.paymentTerms}));
    setShowSupList(false);
    setTimeout(()=>supInputRef.current?.focus(), 0);
  };

  // SKU/Product autocomplete per item
  const [skuSearch, setSkuSearch] = useState((purchase?.items||[emptyItem()]).map(it=>it.sku||""));
  const [showSkuList, setShowSkuList] = useState((purchase?.items||[emptyItem()]).map(()=>false));
  const [skuDropdownRect, setSkuDropdownRect] = useState({});
  const [askAddItem, setAskAddItem] = useState(false);
  const naoItemRef = useRef(null);
  const modalRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const suppressNextAsk = useRef(false);
  const skuInputRefs = useRef([]);
  const simItemRef = useRef(null);

  const setItem = (i, k, v) => setForm(f => {
    const items = f.items.map((it,idx) => {
      if (idx!==i) return it;
      const u = { ...it, [k]:v };
      u.total = calcItemTotal(u);
      return u;
    });
    const subtotal = items.reduce((s,it)=>s+(it.total||0),0);
    const updated = { ...f, items, subtotal };
    updated.total = calcTotal(updated);
    return updated;
  });

  const selectProduct = (i, prod) => {
    setForm(f => {
      const items = f.items.map((it,idx) => {
        if (idx!==i) return it;
        const u = { ...it, sku:prod.sku||"", description:prod.name||"", unit:prod.unit||"un", unitPrice:prod.cost||0, _prodId:prod.id };
        u.total = calcItemTotal(u);
        return u;
      });
      const subtotal = items.reduce((s,it)=>s+(it.total||0),0);
      const updated = { ...f, items, subtotal };
      updated.total = calcTotal(updated);
      return updated;
    });
    const ss=[...skuSearch]; ss[i]=prod.sku||prod.name||""; setSkuSearch(ss);
    const sl=[...showSkuList]; sl[i]=false; setShowSkuList(sl);
  };

  const addItem = () => {
    setForm(f=>({...f, items:[...f.items, emptyItem()]}));
    setSkuSearch(s=>[...s,""]);
    setShowSkuList(s=>[...s,false]);
  };

  const removeItem = (i) => {
    setForm(f=>{
      const items = f.items.filter((_,idx)=>idx!==i);
      const subtotal = items.reduce((s,it)=>s+(it.total||0),0);
      const updated = {...f, items, subtotal};
      updated.total = calcTotal(updated);
      return updated;
    });
    setSkuSearch(s=>s.filter((_,idx)=>idx!==i));
    setShowSkuList(s=>s.filter((_,idx)=>idx!==i));
  };

  const subtotal = (form.items||[]).reduce((s,it)=>s+(it.total||0),0);

  const [saveError, setSaveError] = useState("");

  const handleSave = () => {
    if (!form.supplierName.trim() || (form.items||[]).length===0) return;
    // Se status = Recebido, todos os itens devem ter _prodId
    if (form.status === "Baixado") {
      const unlinked = (form.items||[]).filter(it => !it._prodId);
      if (unlinked.length > 0) {
        setSaveError(`${unlinked.length} item(ns) sem vínculo com o catálogo de produtos. Selecione cada produto pelo campo de busca (autocomplete) antes de marcar como Baixado.`);
        return;
      }
    }
    setSaveError("");
    onSave({ ...form, subtotal, total: parseFloat(calcTotal({...form}).toFixed(2)) });
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} onKeyDown={e=>trapTabFocus(e, modalRef)} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800">{isNew ? "📦 Novo Pedido de Compra" : `Editar ${purchase.id||""}`}</h2>
          <div className="flex items-start gap-3">
            <div className="text-right text-xs text-gray-400 leading-relaxed">
              <p>📅 {form.date ? new Date(form.date+"T00:00:00").toLocaleDateString("pt-BR") : "—"}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Fornecedor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 relative">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Fornecedor *</label>
              <input className={inp} ref={supInputRef}
                value={supSearch}
                onChange={e=>{ setSupSearch(e.target.value); setForm(f=>({...f,supplierName:e.target.value})); setShowSupList(true); setSupHighlight(0); }}
                onFocus={()=>setShowSupList(true)}
                onBlur={()=>setTimeout(()=>setShowSupList(false),150)}
                onKeyDown={e=>{
                  if (e.key==="ArrowDown") { e.preventDefault(); setShowSupList(true); setSupHighlight(i=>Math.min(i+1, filteredSups.length-1)); }
                  else if (e.key==="ArrowUp") { e.preventDefault(); setSupHighlight(i=>Math.max(i-1,0)); }
                  else if (e.key==="Enter") { if (showSupList && filteredSups[supHighlight]) { e.preventDefault(); selectSupplier(filteredSups[supHighlight]); } }
                  else if (e.key==="Tab" && showSupList && filteredSups.length>0) {
                    const exact = filteredSups.find(s=>(s.name||"").toLowerCase()===supSearch.trim().toLowerCase());
                    selectSupplier(exact||filteredSups[supHighlight]||filteredSups[0]);
                  }
                }}
                placeholder="Digite o nome do fornecedor..."/>
              {showSupList && filteredSups.length>0 && supSearch && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredSups.map((s,idx)=>(
                    <button key={s.id} type="button" onMouseDown={()=>selectSupplier(s)} onMouseEnter={()=>setSupHighlight(idx)}
                      className={`w-full text-left px-3 py-2.5 border-b border-gray-50 last:border-0 ${idx===supHighlight?"bg-indigo-50":"hover:bg-indigo-50"}`}>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-[10px] text-gray-400">{s.cnpj||""} {s.paymentTerms?`· Prazo: ${s.paymentTerms} dias`:""}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Itens do Pedido</label>
              <button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Adicionar item</button>
            </div>
            <div className="overflow-x-auto">
              <div className="space-y-2 min-w-[700px]">
                {(form.items||[]).map((it,i)=>{
                const sq = skuSearch[i]||it.sku||"";
                const filtProd = products.filter(p=>
                  p.sku?.toLowerCase().includes(sq.toLowerCase())||
                  p.name?.toLowerCase().includes(sq.toLowerCase())
                ).slice(0,6);
                const gross = (it.qty||0)*(it.unitPrice||0);
                const discAmt = it.discountType==="%"?gross*((it.discount||0)/100):(it.discount||0);
                return (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex gap-2 items-start">
                      <div className="relative w-28 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">SKU</p>
                        <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 font-mono"
                          value={sq}
                          onChange={e=>{
                            const ss=[...skuSearch];ss[i]=e.target.value;setSkuSearch(ss);setItem(i,"sku",e.target.value);
                            const sl=[...showSkuList];sl[i]=true;setShowSkuList(sl);
                            const r=e.target.getBoundingClientRect();
                            setSkuDropdownRect(prev=>({...prev,[i]:{top:r.bottom+2, left:r.left, width:Math.max(r.width,256)}}));
                          }}
                          onFocus={e=>{
                            const sl=[...showSkuList];sl[i]=true;setShowSkuList(sl);
                            const r=e.target.getBoundingClientRect();
                            setSkuDropdownRect(prev=>({...prev,[i]:{top:r.bottom+2, left:r.left, width:Math.max(r.width,256)}}));
                          }}
                          onBlur={()=>setTimeout(()=>{const sl=[...showSkuList];sl[i]=false;setShowSkuList(sl);},150)}
                          onKeyDown={e=>{
                            if (e.key==="Tab" && showSkuList[i] && filtProd.length>0) {
                              const exact = filtProd.find(p=>p.sku?.toLowerCase()===sq.toLowerCase());
                              selectProduct(i, exact||filtProd[0]);
                            }
                          }}
                          ref={el=>skuInputRefs.current[i]=el}
                          placeholder="SKU"/>
                        {showSkuList[i] && sq.length>0 && filtProd.length>0 && skuDropdownRect[i] && (
                          <div className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-0.5 max-h-40 overflow-y-auto"
                            style={{top:skuDropdownRect[i].top, left:skuDropdownRect[i].left, width:skuDropdownRect[i].width}}>
                            {filtProd.map(p=>(
                              <button key={p.id} type="button" onMouseDown={()=>selectProduct(i,p)}
                                className="w-full text-left px-2 py-1.5 hover:bg-indigo-50 border-b border-gray-50 last:border-0">
                                <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                                <p className="text-[10px] text-gray-400">SKU: {p.sku||"—"} · Custo: {fmt(p.cost||0)}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Descrição</p>
                        <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.description} onChange={e=>setItem(i,"description",e.target.value)} placeholder="Descrição do produto"/>
                      </div>
                      <div className="w-16 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Qtd</p>
                        <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.qty===0?"":it.qty}
                          onChange={e=>setItem(i,"qty", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                          onBlur={e=>{ if (e.target.value==="") setItem(i,"qty",0); }}/>
                      </div>
                      <div className="w-20 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Un</p>
                        <select className="w-full border border-gray-200 rounded-lg px-1 py-1.5 text-xs bg-white focus:outline-none"
                          value={it.unit} onChange={e=>setItem(i,"unit",e.target.value)}>
                          {INV_UNITS.map(u=><option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div className="w-24 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Preço Unit.</p>
                        <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.unitPrice===0?"":it.unitPrice}
                          onChange={e=>setItem(i,"unitPrice", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                          onBlur={e=>{ if (e.target.value==="") setItem(i,"unitPrice",0); }}/>
                      </div>
                      <div className="w-28 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Desconto</p>
                        <div className="flex gap-0.5">
                          <button onClick={()=>setItem(i,"discountType",it.discountType==="%"?"R$":"%")}
                            className="border border-gray-200 rounded-l-lg px-2 py-1.5 text-[10px] font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 transition-colors shrink-0 text-gray-600">
                            {it.discountType||"%"}
                          </button>
                          <input type="number" min="0" className="w-full border border-gray-200 rounded-r-lg px-1 py-1.5 text-xs text-right bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                            value={it.discount===0?"":it.discount}
                            onChange={e=>{setItem(i,"discount", e.target.value===""?"":(parseFloat(e.target.value)||0)); suppressNextAsk.current=false;}}
                            onBlur={e=>{ if (e.target.value==="") setItem(i,"discount",0); if (suppressNextAsk.current) { suppressNextAsk.current=false; return; } lastFocusedRef.current=e.target; setAskAddItem(true); }}/>
                        </div>
                      </div>
                      <div className="w-24 shrink-0 text-right">
                        <p className="text-[10px] text-gray-400 mb-0.5">Total</p>
                        <p className="text-sm font-bold text-gray-900 pt-1">{fmt(it.total||0)}</p>
                        {discAmt>0 && <p className="text-[10px] text-green-600">-{fmt(discAmt)}</p>}
                      </div>
                      {(form.items||[]).length>1 && (
                        <button onClick={()=>removeItem(i)} className="text-gray-400 hover:text-red-500 text-sm shrink-0 mt-5">✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Totais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">🚛 Frete (R$)</label>
              <input type="number" min="0" step="0.01" className={inp}
                value={form.freight===0?"":form.freight}
                onChange={e=>setForm(f=>{const v=e.target.value===""?"":(parseFloat(e.target.value)||0);const u={...f,freight:v};u.total=calcTotal(u);return u;})}
                onBlur={e=>{ if (e.target.value==="") setForm(f=>{const u={...f,freight:0};u.total=calcTotal(u);return u;}); }}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">💰 Desconto (R$)</label>
              <input type="number" min="0" step="0.01" className={inp}
                value={form.discount===0?"":form.discount}
                onChange={e=>setForm(f=>{const v=e.target.value===""?"":(parseFloat(e.target.value)||0);const u={...f,discount:v};u.total=calcTotal(u);return u;})}
                onBlur={e=>{ if (e.target.value==="") setForm(f=>{const u={...f,discount:0};u.total=calcTotal(u);return u;}); }}/>
            </div>
            <div className="flex flex-col justify-end text-right">
              <p className="text-xs text-gray-400">Subtotal: {fmt(subtotal)}</p>
              <p className="text-lg font-bold text-indigo-600">Total: {fmt(calcTotal(form))}</p>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Observações</label>
            <input className={inp} value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Observações internas..."/>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0">
          {saveError && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-red-700">{saveError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
              {isNew ? "Criar Pedido" : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {askAddItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onKeyDown={e=>{ if (e.key==="Escape") { suppressNextAsk.current=true; setAskAddItem(false); setTimeout(()=>lastFocusedRef.current?.focus(),0); return; } if (e.key==="Tab") { e.preventDefault(); (document.activeElement===simItemRef.current ? naoItemRef : simItemRef).current?.focus(); } }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center">
            <p className="text-3xl mb-2">➕</p>
            <p className="font-semibold text-gray-900 mb-1">Adicionar outro item?</p>
            <p className="text-sm text-gray-500 mb-4">Você pode continuar incluindo produtos neste pedido de compra.</p>
            <div className="flex gap-2">
              <button ref={naoItemRef} onClick={()=>{suppressNextAsk.current=true; setAskAddItem(false); setTimeout(()=>lastFocusedRef.current?.focus(),0);}} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Não</button>
              <button ref={simItemRef} autoFocus onClick={()=>{const newIdx=form.items.length; addItem(); setAskAddItem(false); setTimeout(()=>skuInputRefs.current[newIdx]?.focus(),50);}} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Sim, adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ─── StockEntryModal ──────────────────────────────────────────────────────
// Vincula itens de compra já "Recebidos" a produtos do catálogo e dá entrada no estoque
const StockEntryModal = ({ purchase, products = [], onClose, onConfirm }) => {
  const unlinked = purchase.items.filter(it => !it._prodId);
  const [links, setLinks] = useState(
    purchase.items.map(it => ({
      sku:    it.sku || "",
      desc:   it.description || "",
      qty:    it.qty || 0,
      price:  it.unitPrice || 0,
      unit:   it.unit || "un",
      _prodId: it._prodId || null,
      _prodName: it._prodId ? (products.find(p=>p.id===it._prodId)?.name || "") : "",
      search: it.sku || it.description || "",
      showList: false,
    }))
  );

  const setLink = (i, partial) =>
    setLinks(prev => prev.map((l, idx) => idx === i ? { ...l, ...partial } : l));

  const filtProd = (search) =>
    products.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 6);

  const selectProd = (i, prod) => {
    setLink(i, { _prodId: prod.id, _prodName: prod.name, search: prod.name, showList: false });
  };

  const handleConfirm = () => {
    // updatedItems = todos os itens com _prodId preenchido onde possível
    const updatedItems = purchase.items.map((it, i) => ({
      ...it,
      _prodId: links[i]._prodId || it._prodId,
    }));
    onConfirm(updatedItems);
  };

  const allLinked = links.every(l => !!l._prodId);
  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-semibold text-gray-800">📦 Dar Entrada no Estoque</h2>
            <p className="text-xs text-gray-400 mt-0.5">Vincule cada item ao produto do catálogo para atualizar estoque e custo médio</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="x"/>
          </button>
        </div>
        <div className="overflow-y-auto p-5 space-y-3 flex-1">
          {links.map((l, i) => (
            <div key={i} className={`border rounded-xl p-3 space-y-2 ${l._prodId ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{l.desc || l.sku || "Item sem descrição"}</p>
                  <p className="text-xs text-gray-500">Qtd: {l.qty} {l.unit} · {fmt(l.price)}/un</p>
                </div>
                {l._prodId
                  ? <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full shrink-0">✓ Vinculado</span>
                  : <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full shrink-0">⚠ Sem vínculo</span>
                }
              </div>
              {l._prodId ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-green-700 font-medium flex-1">→ {l._prodName}</p>
                  <button onClick={() => setLink(i, { _prodId: null, _prodName: "", search: l.desc || l.sku || "" })}
                    className="text-xs text-gray-400 hover:text-red-500">Alterar</button>
                </div>
              ) : (
                <div className="relative">
                  <input className={inp + " text-xs"} placeholder="Buscar produto do catálogo (nome ou SKU)..."
                    value={l.search}
                    onChange={e => setLink(i, { search: e.target.value, showList: true })}
                    onFocus={() => setLink(i, { showList: true })}
                    onBlur={() => setTimeout(() => setLink(i, { showList: false }), 150)}
                  />
                  {l.showList && l.search.length > 0 && filtProd(l.search).length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-36 overflow-y-auto">
                      {filtProd(l.search).map(p => (
                        <button key={p.id} type="button" onMouseDown={() => selectProd(i, p)}
                          className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-50 last:border-0">
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          <p className="text-[10px] text-gray-400">SKU: {p.sku||"—"} · Estoque atual: {p.stock||0} {p.unit||"un"} · Custo: {fmt(p.cost||0)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-gray-100 shrink-0 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleConfirm}
            disabled={!allLinked}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${allLinked ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
            {allLinked ? "✓ Confirmar Entrada" : `Vincule todos os ${links.filter(l=>!l._prodId).length} item(ns) restante(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

const AbrirCaixaModal = ({ onClose, onConfirm }) => {
  const [valor, setValor] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-900">🔓 Abrir Caixa</h3>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Valor inicial em dinheiro (R$)</label>
          <input type="number" min="0" step="0.01" autoFocus className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={valor} onChange={e=>setValor(e.target.value)} placeholder="0,00"/>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={()=>onConfirm(valor)} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">Abrir Caixa</button>
        </div>
      </div>
    </div>
  );
};

const FecharCaixaModal = ({ caixaAtual, vendas, onClose, onConfirm }) => {
  const [valorContado, setValorContado] = useState("");
  const totalPorForma = (forma) => vendas.filter(o=>o.payment===forma).reduce((s,o)=>s+(o.total||0),0);
  const totalDinheiro = totalPorForma("dinheiro");
  const totalCredito  = totalPorForma("credito");
  const totalDebito   = totalPorForma("debito");
  const totalPix      = totalPorForma("pix");
  const esperadoDinheiro = (Number(caixaAtual.valorInicial)||0) + totalDinheiro;
  const diferenca = valorContado!=="" ? (Number(valorContado)||0) - esperadoDinheiro : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-900">🔒 Fechar Caixa</h3>
        <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Abertura</span><span>{fmt(caixaAtual.valorInicial)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">💵 Dinheiro</span><span>{fmt(totalDinheiro)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">💳 Crédito</span><span>{fmt(totalCredito)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">💳 Débito</span><span>{fmt(totalDebito)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">📱 Pix</span><span>{fmt(totalPix)}</span></div>
          <div className="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1"><span>Esperado em dinheiro</span><span>{fmt(esperadoDinheiro)}</span></div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Dinheiro contado na gaveta (R$)</label>
          <input type="number" min="0" step="0.01" autoFocus className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={valorContado} onChange={e=>setValorContado(e.target.value)} placeholder="0,00"/>
          {diferenca!==null && (
            <p className={`text-xs mt-1 font-semibold ${diferenca===0?"text-green-600":diferenca>0?"text-blue-600":"text-red-500"}`}>
              {diferenca===0 ? "✅ Caixa exato" : diferenca>0 ? `🔵 Sobra de ${fmt(diferenca)}` : `🔴 Falta de ${fmt(Math.abs(diferenca))}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={()=>onConfirm(valorContado)} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700">Fechar Caixa</button>
        </div>
      </div>
    </div>
  );
};

const PdvModule = ({ products = [], setProducts, orders = [], setOrders, movements = [], setMovements, customers = [], caixa = [], setCaixa, setNfes, params, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "pdv", "incluir");
  const canAlterar = getUserPerm(currentUser, "pdv", "alterar");
  const caixaAtual = caixa.find(c => c.status === "aberto");
  const [skuSearch, setSkuSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("dinheiro");
  const [showAbrirCaixa, setShowAbrirCaixa] = useState(false);
  const [showFecharCaixa, setShowFecharCaixa] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const skuInputRef = useRef(null);
  const qtyInputRefs = useRef({});
  const [askAddItem, setAskAddItem] = useState(false);
  const naoItemRef = useRef(null);
  const simItemRef = useRef(null);

  const getPdvPrice = (prod) => {
    const cp = prod.channelPrices?.["Loja Própria"];
    const channelPrice = cp ? (typeof cp==="object" ? Number(cp.price)||0 : Number(cp)||0) : 0;
    return channelPrice>0 ? channelPrice : (Number(prod.price)||0);
  };

  const filteredProducts = skuSearch.trim().length>0
    ? products.filter(p => (p.sku||"").toLowerCase().includes(skuSearch.toLowerCase()) || (p.name||"").toLowerCase().includes(skuSearch.toLowerCase())).slice(0,6)
    : [];

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(i => String(i._prodId)===String(p.id));
      if (existing) return prev.map(i => String(i._prodId)===String(p.id) ? {...i, qty:i.qty+1, total:(i.qty+1)*i.unitPrice} : i);
      const unitPrice = getPdvPrice(p);
      return [...prev, { _prodId:p.id, sku:p.sku||"", description:p.name, ncm:p.ncm||"", cfop:"5102", unitPrice, qty:1, total:unitPrice }];
    });
    setSkuSearch("");
    setTimeout(()=>{
      const el = qtyInputRefs.current[p.id];
      if (el) { el.focus(); el.select(); }
    }, 50);
  };

  const updateQty = (prodId, qty) => {
    const q = Math.max(1, parseInt(qty)||1);
    setCart(prev => prev.map(i => String(i._prodId)===String(prodId) ? {...i, qty:q, total:q*i.unitPrice} : i));
  };
  const removeItem = (prodId) => setCart(prev => prev.filter(i=>String(i._prodId)!==String(prodId)));
  const cartTotal = cart.reduce((s,i)=>s+i.total, 0);

  const handleAbrirCaixa = (valorInicial) => {
    if (!canIncluir) return; // segurança extra, além do botão já escondido
    setCaixa(prev => [...prev, {
      id: `CX-${Date.now()}`, dataAbertura: new Date().toISOString(), valorInicial: Number(valorInicial)||0,
      usuarioAbertura: currentUser?.displayName||currentUser?.username||"", status: "aberto",
    }]);
    setShowAbrirCaixa(false);
  };

  const vendasDoCaixa = caixaAtual ? orders.filter(o => o.channel==="PDV" && o.caixaId===caixaAtual.id) : [];

  const handleFecharCaixa = (valorContado) => {
    if (!canAlterar) return; // segurança extra, além do botão já escondido
    setCaixa(prev => prev.map(c => c.id===caixaAtual.id ? {
      ...c, status:"fechado", dataFechamento: new Date().toISOString(), valorContado: Number(valorContado)||0,
      usuarioFechamento: currentUser?.displayName||currentUser?.username||"",
      totalVendas: vendasDoCaixa.reduce((s,o)=>s+(o.total||0),0),
    } : c));
    setShowFecharCaixa(false);
  };

  const handleFinalizar = async () => {
    if (!canIncluir) return; // segurança extra, além do botão já escondido
    if (!cart.length || finalizing) return;
    setErr(""); setFinalizing(true);
    try {
      const newId = nextId(orders);
      const newOrder = {
        id: newId, customer: "Consumidor", channel: "PDV", status: "Entregue",
        total: cartTotal, subtotal: cartTotal, date: today(), payment, paidDate: today(),
        itemsList: cart, caixaId: caixaAtual?.id || null,
      };

      setProducts(prev => prev.map(prod => {
        const it = cart.find(i => String(i._prodId)===String(prod.id));
        if (!it) return prod;
        return { ...prod, stock: Math.max(0, (prod.stock||0)-(it.qty||0)) };
      }));
      setMovements(prev => {
        const nums = prev.map(m=>parseInt(String(m.id).replace("MOV-",""))||0);
        const base = Math.max(0,...nums,0);
        const novas = cart.filter(i=>i._prodId).map((i,idx)=>{
          // Venda acima do estoque do sistema: o PDV não bloqueia (o produto
          // físico está na mão do cliente), mas a divergência fica anotada no
          // movimento pra rastrear depois na contagem.
          const prodAtual = products.find(p=>String(p.id)===String(i._prodId));
          const estSistema = prodAtual?.stock||0;
          const divergiu = (i.qty||0) > estSistema;
          return {
            id:`MOV-${String(base+idx+1).padStart(3,"0")}`, productId:i._prodId, type:"saida",
            qty:i.qty, date: today(), reason:"Venda PDV",
            notes:`Venda PDV ${newId}${divergiu?` · ⚠️ estoque no sistema era ${estSistema}`:""}`,
          };
        });
        return [...prev, ...novas];
      });

      // A VENDA é o essencial; a NFC-e é acessória. O pedido é gravado ANTES
      // de chamar a emissão — antes, uma queda de rede no fetch lançava
      // exceção e o pedido nunca era gravado, mas o estoque já tinha baixado
      // e os movimentos já estavam registrados: venda fantasma. Se a emissão
      // falhar agora, a venda fica registrada com o aviso âmbar e a nota pode
      // ser emitida depois pelo módulo Fiscal.
      setOrders(prev => [...prev, newOrder]);
      setCart([]);

      let nfceResult = null;
      if (params?.fiscal?.provider === "focus") {
        try {
          const token = getSession()?.token;
          const r = await fetch("/api/nfe-issue", {
            method: "POST",
            headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
            body: JSON.stringify({ order:newOrder, ref:`${newId}-${Date.now()}`, tipo:"nfce" }),
          });
          nfceResult = await r.json().catch(()=>({ ok:false, error:"Erro de comunicação" }));
        } catch(e) {
          nfceResult = { ok:false, error:"Sem conexão com o servidor de notas — emita depois pelo módulo Fiscal" };
        }
        if (nfceResult.ok) {
          const nf = { nfceStatus:nfceResult.status, nfceChave:nfceResult.chave, nfcePdfUrl:nfceResult.pdfUrl, nfceQrcode:nfceResult.qrcodeUrl };
          Object.assign(newOrder, nf);
          setOrders(prev => prev.map(o => o.id===newId ? { ...o, ...nf } : o));
          // NFC-e emitida pelo PDV entra automaticamente no painel Fiscal
          registrarNfeFiscal(setNfes, {
            order: newOrder, tipo: "NFC-e",
            numero: nfceResult.numero, chave: nfceResult.chave,
            status: nfceResult.status, dataEmissao: today(),
          });
        }
      }

      setResult({ order:newOrder, nfce:nfceResult });
    } catch(e) { setErr("Erro: "+e.message); }
    setFinalizing(false);
  };

  if (!caixaAtual) {
    return (
      <div className="flex items-center justify-center" style={{minHeight:"60vh"}}>
        <div className="text-center">
          <p className="text-5xl mb-3">🔒</p>
          <p className="text-gray-500 mb-4">Nenhum caixa aberto. Abra o caixa pra começar a vender.</p>
          {canIncluir ? (
            <button onClick={()=>setShowAbrirCaixa(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">🔓 Abrir Caixa</button>
          ) : (
            <p className="text-sm text-gray-400">Você não tem permissão pra abrir o caixa.</p>
          )}
        </div>
        {showAbrirCaixa && <AbrirCaixaModal onClose={()=>setShowAbrirCaixa(false)} onConfirm={handleAbrirCaixa}/>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-gray-800">🟢 Caixa aberto</p>
          <p className="text-xs text-gray-400">Desde {new Date(caixaAtual.dataAbertura).toLocaleString("pt-BR")} · {vendasDoCaixa.length} venda(s) · {fmt(vendasDoCaixa.reduce((s,o)=>s+(o.total||0),0))}</p>
        </div>
        {canAlterar && <button onClick={()=>setShowFecharCaixa(true)} className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100">🔒 Fechar Caixa</button>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
        <div className="relative">
          <input type="text" autoFocus value={skuSearch} onChange={e=>setSkuSearch(e.target.value)}
            ref={skuInputRef}
            onKeyDown={e=>{
              if (e.key==="Tab" && filteredProducts.length>0) {
                e.preventDefault();
                const exact = filteredProducts.find(p=>(p.sku||"").toLowerCase()===skuSearch.trim().toLowerCase());
                addToCart(exact||filteredProducts[0]);
              }
            }}
            placeholder="Buscar produto por SKU ou nome..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
          {filteredProducts.length>0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {filteredProducts.map(p=>(
                <button key={p.id} onClick={()=>addToCart(p)} className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-center justify-between border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </div>
                  <p className="text-sm font-semibold text-indigo-600">{fmt(getPdvPrice(p))}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {cart.length===0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Carrinho vazio — busque um produto acima</p>
        ) : (
          <div className="space-y-2">
            {cart.map(item=>(
              <div key={item._prodId} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.description}</p>
                  <p className="text-xs text-gray-400">{fmt(item.unitPrice)} cada</p>
                  {(() => {
                    const prodAtual = products.find(p=>String(p.id)===String(item._prodId));
                    const est = prodAtual?.stock||0;
                    return item.qty > est
                      ? <p className="text-[11px] text-amber-600 font-medium">⚠️ Estoque no sistema: {est}</p>
                      : null;
                  })()}
                </div>
                <input type="number" min="1" value={item.qty} onChange={e=>updateQty(item._prodId, e.target.value)}
                  ref={el=>qtyInputRefs.current[item._prodId]=el}
                  onFocus={e=>e.target.select()}
                  onKeyDown={e=>{ if (e.key==="Enter" || e.key==="Tab") { e.preventDefault(); setAskAddItem(true); } }}
                  className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center"/>
                <p className="w-20 text-right text-sm font-semibold text-gray-800">{fmt(item.total)}</p>
                <button onClick={()=>removeItem(item._prodId)} className="text-gray-300 hover:text-red-500 px-1">✕</button>
              </div>
            ))}
          </div>
        )}

        {cart.length>0 && (
          <>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(cartTotal)}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[["dinheiro","💵 Dinheiro"],["credito","💳 Crédito"],["debito","💳 Débito"],["pix","📱 Pix"]].map(([id,label])=>(
                <button key={id} onClick={()=>setPayment(id)}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${payment===id?"border-indigo-500 bg-indigo-50 text-indigo-700":"border-gray-100 text-gray-500"}`}>
                  {label}
                </button>
              ))}
            </div>
            {err && <p className="text-red-500 text-xs">{err}</p>}
            {canIncluir ? (
              <button onClick={handleFinalizar} disabled={finalizing}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50">
                {finalizing ? "Finalizando..." : "✅ Finalizar Venda"}
              </button>
            ) : (
              <p className="text-center text-xs text-gray-400">Você não tem permissão pra finalizar vendas.</p>
            )}
          </>
        )}
      </div>

      {showAbrirCaixa && <AbrirCaixaModal onClose={()=>setShowAbrirCaixa(false)} onConfirm={handleAbrirCaixa}/>}
      {showFecharCaixa && <FecharCaixaModal caixaAtual={caixaAtual} vendas={vendasDoCaixa} onClose={()=>setShowFecharCaixa(false)} onConfirm={handleFecharCaixa}/>}

      {askAddItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onKeyDown={e=>{
            if (e.key==="Escape") { setAskAddItem(false); return; }
            if (e.key==="Tab") { e.preventDefault(); (document.activeElement===simItemRef.current ? naoItemRef : simItemRef).current?.focus(); }
          }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center">
            <p className="text-3xl mb-2">➕</p>
            <p className="font-semibold text-gray-900 mb-1">Adicionar outro item?</p>
            <p className="text-sm text-gray-500 mb-4">Você pode continuar incluindo produtos nessa venda.</p>
            <div className="flex gap-2">
              <button ref={naoItemRef} onClick={()=>setAskAddItem(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Não, ir pro pagamento
              </button>
              <button ref={simItemRef} autoFocus onClick={()=>{ setAskAddItem(false); setTimeout(()=>skuInputRef.current?.focus(),50); }}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                Sim, adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-3 text-center">
            <p className="text-4xl">✅</p>
            <p className="font-bold text-gray-900">Venda {result.order.id} finalizada!</p>
            <p className="text-2xl font-bold text-emerald-600">{fmt(result.order.total)}</p>
            {result.nfce && (
              result.nfce.ok ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
                  <p className="font-semibold">🧾 NFC-e autorizada — nº {result.nfce.numero}</p>
                  {result.nfce.pdfUrl && <a href={result.nfce.pdfUrl} target="_blank" rel="noreferrer" className="underline block mt-1">Ver cupom (DANFCe)</a>}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  ⚠️ Venda registrada, mas a NFC-e não foi emitida: {result.nfce.error}
                </div>
              )
            )}
            <button onClick={()=>setResult(null)} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">Próxima venda</button>
          </div>
        </div>
      )}
    </div>
  );
};

const BaixarPedidoModal = ({ purchase, onClose, onConfirm, products = [] }) => {
  const modalRef = useRef(null);
  const [nfNumber, setNfNumber] = useState(purchase.nfNumber || "");
  const [nfEmissionDate, setNfEmissionDate] = useState(purchase.nfEmissionDate || today());
  const [receivedDate, setReceivedDate] = useState(purchase.receivedDate || today());
  const [dueDate, setDueDate] = useState(purchase.dueDate || "");
  const [qtys, setQtys] = useState((purchase.items||[]).map(it => Math.max(0, (it.qty||0)-(it.receivedQty||0))));
  const [err, setErr] = useState("");

  // Vencimento do boleto = Emissão da NF + prazo do fornecedor (recalcula, mas pode ajustar manualmente depois)
  useEffect(() => {
    if (!nfEmissionDate) return;
    const dias = parseInt(purchase.paymentTerms) || 0;
    setDueDate(addDaysISO(nfEmissionDate, dias));
  }, [nfEmissionDate]);

  const setQty = (i, v) => setQtys(prev => prev.map((q,idx)=>idx===i?v:q));

  const totalRecebendoAgora = (purchase.items||[]).reduce((s,it,i)=>s+((Number(qtys[i])||0)*(it.unitPrice||0)), 0);
  const algumRecebido = qtys.some(q => (Number(q)||0) > 0);

  const handleConfirm = () => {
    if (!algumRecebido) { setErr("Informe a quantidade recebida de ao menos um item"); return; }
    // Todo item que está recebendo quantidade nesta baixa precisa estar vinculado
    // a um produto do catálogo (_prodId) ou ter SKU batendo com um produto existente —
    // senão a entrada de estoque e o registro de movimentação são pulados em silêncio.
    const semVinculo = (purchase.items||[]).filter((it,i) => {
      const qtd = Number(qtys[i]) || 0;
      if (qtd <= 0) return false;
      const vinculado = !!it._prodId || (it.sku && products.some(p => p.sku === it.sku));
      return !vinculado;
    });
    if (semVinculo.length > 0) {
      setErr(`${semVinculo.length} item(ns) sem vínculo com o catálogo de produtos: ${semVinculo.map(it=>it.description).join(", ")}. Edite o pedido e selecione cada produto pelo campo de busca (autocomplete) antes de baixar — senão a entrada de estoque não é registrada.`);
      return;
    }
    setErr("");
    onConfirm({ nfNumber, nfEmissionDate, receivedDate, dueDate, qtys: qtys.map(q=>Number(q)||0) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} onKeyDown={e=>trapTabFocus(e, modalRef)} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800">✅ Baixar Pedido {purchase.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x"/></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Número da NF</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={nfNumber} onChange={e=>setNfNumber(e.target.value)} placeholder="NF-e 000000"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Data de Emissão da NF</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={nfEmissionDate} onChange={e=>setNfEmissionDate(e.target.value)}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Data de Recebimento</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={receivedDate} onChange={e=>setReceivedDate(e.target.value)}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Vencimento do Boleto</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
              <p className="text-[10px] text-gray-400 mt-1">Calculado automaticamente (Emissão da NF + prazo do fornecedor) — pode ajustar.</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Quantidade Recebida</p>
            <div className="space-y-2">
              {(purchase.items||[]).map((it,i)=>{
                const jaRecebido = it.receivedQty||0;
                const restante = Math.max(0, (it.qty||0)-jaRecebido);
                return (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{it.description}</p>
                      <p className="text-[10px] text-gray-400">
                        Pedido: {it.qty||0} {it.unit||"un"}
                        {jaRecebido>0 && <> · já recebido: {jaRecebido} · restante: {restante}</>}
                      </p>
                    </div>
                    <div className="w-24 shrink-0">
                      <input type="number" min="0" max={restante} step="any"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
                        value={qtys[i]===0?"":qtys[i]} placeholder="0"
                        onChange={e=>setQty(i, e.target.value===""?0:Math.min(Number(e.target.value)||0, restante))}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
            <p className="text-sm text-indigo-700 font-medium">Valor recebido nesta baixa</p>
            <p className="text-lg font-bold text-indigo-700">{fmt(totalRecebendoAgora)}</p>
          </div>

          {err && <p className="text-red-500 text-xs">{err}</p>}
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleConfirm} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
            ✅ Confirmar Baixa
          </button>
        </div>
      </div>
    </div>
  );
};

const PurchasesModule = ({ purchases, setPurchases, suppliers, products = [], setProducts, movements = [], setMovements, finance = [], setFinance, params, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "purchases", "incluir");
  const canAlterar = getUserPerm(currentUser, "purchases", "alterar");
  const canExcluir = getUserPerm(currentUser, "purchases", "excluir");
  const [modal,      setModal]      = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [stockEntry, setStockEntry] = useState(false);
  const [baixaPedido, setBaixaPedido] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [search,   setSearch]   = useState("");
  const [delConfirm, setDelConfirm] = useState(null);
  const [filterMode, setFilterMode] = useState("todos");
  const [period, setPeriod] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const filterByDate = (p) => {
    if (filterMode === "todos") return true;
    if (filterMode === "mes")   return p.date.startsWith(period);
    if (filterMode === "ano")   return p.date.startsWith(period.split("-")[0]);
    if (filterMode === "personalizado") {
      if (dateFrom && p.date < dateFrom) return false;
      if (dateTo   && p.date > dateTo)   return false;
      return true;
    }
    return true;
  };

  const periodLabel = () => {
    if (filterMode === "todos") return "Todos";
    if (filterMode === "personalizado") return dateFrom||dateTo ? `${dateFrom||"..."} → ${dateTo||"..."}` : "Personalizado";
    if (filterMode === "ano") return period.split("-")[0];
    const [y,m] = period.split("-").map(Number);
    return new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  };

  // No modo "Ano" as setas pulam 12 meses (antes, cada clique andava só 1 mês
  // — pra trocar de ano eram 12 cliques sem o rótulo mudar).
  const stepPeriod = (dir) => {
    const [y,m] = period.split("-").map(Number);
    const step = filterMode === "ano" ? 12 : 1;
    const d = new Date(y, m-1 + dir*step, 1);
    setPeriod(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };
  const prevMonth = () => stepPeriod(-1);
  const nextMonth = () => stepPeriod(1);

  const nextPcId = (list) => {
    const nums = list.map(p => parseInt(p.id.replace("PC-",""))||0);
    return `PC-${String(Math.max(0,...nums)+1).padStart(3,"0")}`;
  };

  const handleSave = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    const oldPurchase = data.id ? purchases.find(p => p.id === data.id) : null;
    const wasReceived = oldPurchase?.status === "Baixado";
    const isReceived  = data.status === "Baixado";

    if (data.id) setPurchases(prev => prev.map(p => p.id===data.id ? data : p));
    else         setPurchases(prev => [...prev, { ...data, id:nextPcId(prev), createdAt:today() }]);

    if (setProducts && (isReceived || wasReceived)) {
      // Calcular movimentos ANTES do setProducts (setState é assíncrono)
      const movimentos = [];
      if (isReceived && data.items) {
        // Ao EDITAR uma compra já baixada, registra só o DELTA de cada produto
        // (novo − antigo) — antes, cada salvamento registrava entrada de todos
        // os itens de novo, poluindo o histórico com entradas fantasma (o
        // estoque em si ficava certo, porque a reconciliação abaixo subtrai o
        // antigo e soma o novo).
        data.items.forEach(newItem => {
          if (!newItem._prodId && !(newItem.sku)) return;
          const prod = products.find(p => p.id === newItem._prodId || (newItem.sku && p.sku === newItem.sku));
          if (!prod) return;
          const oldItem = wasReceived
            ? oldPurchase?.items?.find(it => String(it._prodId)===String(prod.id) || (it.sku && it.sku===prod.sku))
            : null;
          const delta = (newItem.qty||0) - (oldItem?.qty||0);
          if (delta === 0) return;
          movimentos.push({
            productId: prod.id,
            type: delta > 0 ? "entrada" : "saida",
            qty: Math.abs(delta),
            date: data.date || today(),
            reason: delta > 0 ? "Entrada por compra" : "Ajuste de compra",
            notes: `Pedido ${data.id||"novo"} · ${data.supplierName||""}`.trim(),
          });
        });
        // Produto que SAIU da lista numa edição de compra baixada: registra a saída
        if (wasReceived && oldPurchase?.items) {
          oldPurchase.items.forEach(oldItem => {
            if (!oldItem._prodId && !(oldItem.sku)) return;
            const still = data.items.find(it => String(it._prodId)===String(oldItem._prodId) || (oldItem.sku && it.sku===oldItem.sku));
            if (still || (oldItem.qty||0) <= 0) return;
            const prod = products.find(p => p.id === oldItem._prodId || (oldItem.sku && p.sku === oldItem.sku));
            if (!prod) return;
            movimentos.push({ productId: prod.id, type:"saida", qty: oldItem.qty||0,
              date: data.date || today(), reason:"Ajuste de compra",
              notes:`Pedido ${data.id} · item removido na edição`.trim() });
          });
        }
      }
      // Saiu do status "Baixado" (ex: virou "Cancelado") — o estoque já
      // recebido é estornado abaixo; aqui só registramos essa saída no
      // histórico, pra não sumir sem rastro.
      if (!isReceived && wasReceived && oldPurchase?.items) {
        oldPurchase.items.forEach(oldItem => {
          if (!oldItem._prodId && !(oldItem.sku)) return;
          const prod = products.find(p => p.id === oldItem._prodId || (oldItem.sku && p.sku === oldItem.sku));
          if (!prod || (oldItem.qty||0) <= 0) return;
          movimentos.push({
            productId: prod.id,
            type: "saida",
            qty: oldItem.qty || 0,
            date: today(),
            reason: "Estorno de compra",
            notes: `Pedido ${data.id} saiu de Baixado (${data.status}) · ${data.supplierName||""}`.trim(),
          });
        });
      }

      setProducts(prev => prev.map(prod => {
        let estoqueAtual = prod.stock || 0;
        let custoAtual   = prod.cost  || 0;
        if (wasReceived && oldPurchase?.items) {
          const oldItem = oldPurchase.items.find(it => String(it._prodId)===String(prod.id) || (it.sku && it.sku===prod.sku));
          if (oldItem) estoqueAtual = Math.max(0, estoqueAtual - (oldItem.qty||0));
        }
        if (isReceived && data.items) {
          const newItem = data.items.find(it => String(it._prodId)===String(prod.id) || (it.sku && it.sku===prod.sku));
          if (newItem && (newItem.qty||0) > 0) {
            const qtd = newItem.qty || 0;
            const preco = newItem.unitPrice || 0;
            const novoCusto = estoqueAtual > 0
              ? parseFloat(((estoqueAtual * custoAtual + qtd * preco) / (estoqueAtual + qtd)).toFixed(4))
              : preco;
            return { ...prod, stock: estoqueAtual + qtd, cost: novoCusto, lastPurchasePrice: preco };
          }
        }
        if (!isReceived && wasReceived) {
          const hasItem = oldPurchase?.items?.find(it => String(it._prodId)===String(prod.id) || (it.sku && it.sku===prod.sku));
          if (hasItem) return { ...prod, stock: estoqueAtual };
        }
        return prod;
      }));

      // Registrar movimentos (calculados antes, fora do callback assíncrono)
      if (setMovements && movimentos.length > 0) {
        setMovements(prev => {
          const n = prev.map(x => parseInt(x.id.replace("MOV-",""))||0);
          const base = Math.max(0, ...n, 0);
          return [...prev, ...movimentos.map((m, i) => ({
            ...m, id: `MOV-${String(base + i + 1).padStart(3,"0")}`
          }))];
        });
      }
    }

    // Saiu do status "Baixado" (ex: cancelado) — remove o lançamento em
    // Contas a Pagar gerado quando foi baixado, senão a "dívida" fica
    // pendente pra sempre mesmo o pedido não estando mais baixado.
    if (setFinance && wasReceived && !isReceived) {
      setFinance(prev => prev.filter(f =>
        !(f.purchaseId === data.id || (f.description && f.description.startsWith(`Pedido ${data.id} `)))
      ));
    }

    // ENTROU em "Baixado" pelo modal de edição — cria o lançamento em Contas a
    // Pagar, igual ao fluxo do botão "Baixar Pedido". Antes, baixar pelo modal
    // dava entrada no estoque mas não registrava a dívida (assimetria: os dois
    // caminhos removiam o lançamento ao sair de Baixado, mas só um criava).
    if (setFinance && isReceived && !wasReceived && data.id) {
      const valor = Number(data.total) || 0;
      if (valor > 0) {
        setFinance(prev => {
          // idempotência: se já existe lançamento vinculado, não duplica
          if (prev.some(f => f.purchaseId === data.id)) return prev;
          const n = prev.map(f=>parseInt((f.id||"").replace("FIN-",""))||0);
          const newId = `FIN-${String(Math.max(0,...n,0)+1).padStart(3,"0")}`;
          return [{
            id:newId, type:"despesa", category:"Fornecedores",
            description:`Pedido ${data.id} · NF ${data.nfNumber||"—"} · ${data.supplierName||""}`,
            amount:valor, date:data.nfEmissionDate||data.date||today(), dueDate:data.dueDate||"",
            status:"pendente", notes:"", supplierId:data.supplierId, purchaseId:data.id,
          }, ...prev];
        });
      }
    }

    setModal(null); setDetail(null);
  };

  const handleDelete = (pc) => {
    if (!canExcluir) return; // segurança extra, além do botão já escondido
    // Excluir uma compra BAIXADA estorna o estoque que entrou por ela (com
    // movimento de rastro), igual ao que já acontecia ao mudar o status pra
    // Cancelado — antes, excluir deixava estoque fantasma sem origem.
    if (pc.status === "Baixado" && setProducts && pc.items?.length) {
      const estornos = [];
      pc.items.forEach(it => {
        if ((!it._prodId && !it.sku) || (it.qty||0) <= 0) return;
        const prod = products.find(p => String(p.id)===String(it._prodId) || (it.sku && p.sku===it.sku));
        if (!prod) return;
        estornos.push({ productId: prod.id, type:"saida", qty: it.qty||0, date: today(),
          reason:"Estorno de compra", notes:`Exclusão do pedido ${pc.id} · ${pc.supplierName||""}`.trim() });
      });
      setProducts(prev => prev.map(prod => {
        const it = pc.items.find(x => String(x._prodId)===String(prod.id) || (x.sku && x.sku===prod.sku));
        return it ? { ...prod, stock: Math.max(0, (prod.stock||0) - (it.qty||0)) } : prod;
      }));
      if (setMovements && estornos.length > 0) {
        setMovements(prev => {
          const n = prev.map(x => parseInt((x.id||"").replace("MOV-",""))||0);
          const base = Math.max(0,...n,0);
          return [...prev, ...estornos.map((m,i)=>({ ...m, id:`MOV-${String(base+i+1).padStart(3,"0")}` }))];
        });
      }
    }
    setPurchases(prev => prev.filter(p => p.id !== pc.id));
    // Remove também o(s) lançamento(s) em Contas a Pagar gerados pela baixa deste pedido —
    // por id vinculado (purchaseId) ou, em lançamentos antigos sem esse campo, pela descrição.
    if (setFinance) {
      setFinance(prev => prev.filter(f =>
        !(f.purchaseId === pc.id || (f.description && f.description.startsWith(`Pedido ${pc.id} `)))
      ));
    }
    setDelConfirm(null); setDetail(null);
  };

  const handleStockEntry = (updatedItems) => {
    // 1. Atualizar o purchase com os _prodId vinculados
    const updatedPurchase = { ...detail, items: updatedItems };
    setPurchases(prev => prev.map(p => p.id === detail.id ? updatedPurchase : p));
    setDetail(updatedPurchase);

    // 2. Aplicar entrada no estoque, custo médio e registrar movements
    const novosMovimentos = [];
    if (setProducts) {
      setProducts(prev => prev.map(prod => {
        const newItem = updatedItems.find(it => String(it._prodId) === String(prod.id));
        const oldItem = detail.items.find(it => String(it._prodId) === String(prod.id));
        // Só processa se o item foi vinculado agora (oldItem não tinha _prodId)
        if (!newItem || oldItem?._prodId) return prod;
        const qtd    = newItem.qty || 0;
        const preco  = newItem.unitPrice || 0;
        const estAtual = prod.stock || 0;
        const custoAtual = prod.cost || 0;
        if (qtd <= 0) return prod;
        const novoCusto = estAtual > 0
          ? parseFloat(((estAtual * custoAtual + qtd * preco) / (estAtual + qtd)).toFixed(4))
          : preco;
        // Registrar movimento de entrada
        novosMovimentos.push({
          productId: prod.id,
          type: "entrada",
          qty: qtd,
          date: detail.date || today(),
          reason: "Entrada por compra",
          notes: `Pedido ${detail.id} · ${detail.supplierName || ""}`.trim(),
        });
        return { ...prod, stock: estAtual + qtd, cost: novoCusto, lastPurchasePrice: preco };
      }));
    }
    // 3. Salvar movements com IDs sequenciais
    if (setMovements && novosMovimentos.length > 0) {
      setMovements(prev => {
        let base = prev;
        return [
          ...base,
          ...novosMovimentos.map((m, i) => {
            const n = base.map(x => parseInt(x.id.replace("MOV-",""))||0);
            const nextId = `MOV-${String(Math.max(0,...n,0)+i+1).padStart(3,"0")}`;
            return { ...m, id: nextId };
          }),
        ];
      });
    }
    setStockEntry(false);
  };

  const handleBaixarPedido = (data) => {
    if (!canAlterar) return; // segurança extra, além do botão já escondido
    const purchase = baixaPedido;
    if (!purchase) return;
    // Trava contra clique duplo: o estado ATUAL do pedido é a fonte da verdade
    // — se já foi baixado, não dá entrada de estoque nem cria lançamento de novo.
    const atualState = purchases.find(p => p.id === purchase.id);
    if (!atualState || atualState.status === "Baixado") return;

    const calcItemTotal = (it) => {
      const gross = (it.qty||0)*(it.unitPrice||0);
      const disc = it.discountType==="%" ? gross*((it.discount||0)/100) : (it.discount||0);
      return Math.max(0, gross-disc);
    };

    // Itens efetivamente recebidos nesta baixa → ficam no pedido atual, que vira "Baixado"
    const itensRecebidos = purchase.items
      .map((it,i) => { const qty = data.qtys[i]||0; const u = {...it, qty, receivedQty:qty}; u.total = calcItemTotal(u); return u; })
      .filter(it => it.qty > 0);

    // Itens com saldo restante → vão pra um NOVO pedido complementar, "Em Aberto"
    const itensRestantes = purchase.items
      .map((it,i) => { const qty = Math.max(0, (it.qty||0)-(data.qtys[i]||0)); const u = {...it, qty, receivedQty:0}; u.total = calcItemTotal(u); return u; })
      .filter(it => it.qty > 0);

    const subtotalRecebido = itensRecebidos.reduce((s,it)=>s+(it.total||0),0);

    // 1a. Pedido atual passa a refletir só o que foi recebido nesta baixa, e fica "Baixado"
    const updatedPurchase = {
      ...purchase, items: itensRecebidos, status: "Baixado",
      subtotal: subtotalRecebido, total: subtotalRecebido + (Number(purchase.freight)||0) - (Number(purchase.discount)||0),
      nfNumber: data.nfNumber, nfEmissionDate: data.nfEmissionDate,
      receivedDate: data.receivedDate, dueDate: data.dueDate,
      notes: itensRestantes.length>0 ? `${purchase.notes||""} (saldo transferido pra novo pedido)`.trim() : purchase.notes,
    };

    let novoPedidoComplementar = null;
    if (itensRestantes.length > 0) {
      const subtotalRestante = itensRestantes.reduce((s,it)=>s+(it.total||0),0);
      const novoId = `PC-${String(Math.max(0,...purchases.map(p=>parseInt(p.id.replace("PC-",""))||0))+1).padStart(3,"0")}`;
      novoPedidoComplementar = {
        ...purchase, id: novoId, items: itensRestantes, status: "Em Aberto",
        subtotal: subtotalRestante, total: subtotalRestante, freight: 0, discount: 0,
        nfNumber: "", nfEmissionDate: "", receivedDate: "", dueDate: "",
        notes: `Saldo do pedido ${purchase.id}`, createdAt: today(),
      };
    }

    setPurchases(prev => {
      const semOriginal = prev.filter(p => p.id !== purchase.id);
      return novoPedidoComplementar
        ? [...semOriginal, updatedPurchase, novoPedidoComplementar]
        : [...semOriginal, updatedPurchase];
    });
    setDetail(updatedPurchase);

    // 2. Dá entrada no estoque só da quantidade recebida NESTA baixa (não duplica em baixas futuras)
    // IMPORTANTE: o cálculo é feito de forma síncrona sobre o `products` atual (prop),
    // não dentro do callback de setProducts(prev => ...) — o React não garante que esse
    // callback rode antes da checagem seguinte, então gerar o array `movimentos` como
    // efeito colateral ali dentro causava perda intermitente do histórico de movimentação
    // (o estoque sempre atualizava certo, porque isso o React aplica de qualquer forma,
    // mas a checagem "tem movimento pra salvar?" às vezes rodava antes do array ser populado).
    // Movimentos calculados de forma síncrona (fora do updater — motivo do
    // comentário acima), mas o ESTOQUE é aplicado com updater funcional sobre
    // `prev`, não sobrescrevendo o array inteiro com um snapshot da prop —
    // assim nenhuma atualização concorrente de produtos se perde.
    const movimentos = [];
    (products||[]).forEach(prod => {
      const idx = purchase.items.findIndex(it => (String(it._prodId)===String(prod.id) || (it.sku && it.sku===prod.sku)));
      if (idx === -1) return;
      const qtd = data.qtys[idx]||0;
      if (qtd <= 0) return;
      movimentos.push({
        productId: prod.id, type: "entrada", qty: qtd, date: data.receivedDate || today(),
        reason: "Entrada por compra", notes: `Pedido ${purchase.id} · ${purchase.supplierName||""}`.trim(),
      });
    });
    if (setProducts) setProducts(prev => prev.map(prod => {
      const idx = purchase.items.findIndex(it => (String(it._prodId)===String(prod.id) || (it.sku && it.sku===prod.sku)));
      if (idx === -1) return prod;
      const qtd = data.qtys[idx]||0;
      if (qtd <= 0) return prod;
      const preco = purchase.items[idx].unitPrice || 0;
      const estAtual = prod.stock || 0;
      const custoAtual = prod.cost || 0;
      const novoCusto = estAtual > 0
        ? parseFloat(((estAtual*custoAtual + qtd*preco) / (estAtual+qtd)).toFixed(4))
        : preco;
      return { ...prod, stock: estAtual+qtd, cost: novoCusto, lastPurchasePrice: preco };
    }));
    if (setMovements && movimentos.length > 0) {
      setMovements(prev => {
        const n = prev.map(x => parseInt((x.id||"").replace("MOV-",""))||0);
        const base = Math.max(0,...n,0);
        return [...prev, ...movimentos.map((m,i)=>({ ...m, id:`MOV-${String(base+i+1).padStart(3,"0")}` }))];
      });
    }

    // 3. Cria o lançamento em Contas a Pagar com o valor recebido nesta baixa
    if (setFinance) {
      // Mesmo total do pedido baixado (updatedPurchase.total): subtotal recebido
      // JÁ COM descontos por item + frete − desconto geral. Antes, o lançamento
      // era qty × preço bruto — ignorava descontos (cobrava a mais) e frete
      // (cobrava a menos), divergindo do total mostrado em Compras.
      const valorBaixa = updatedPurchase.total || 0;
      if (valorBaixa > 0) {
        setFinance(prev => {
          const n = prev.map(f=>parseInt((f.id||"").replace("FIN-",""))||0);
          const newId = `FIN-${String(Math.max(0,...n,0)+1).padStart(3,"0")}`;
          return [{
            id:newId, type:"despesa", category:"Fornecedores",
            description:`Pedido ${purchase.id} · NF ${data.nfNumber||"—"} · ${purchase.supplierName||""}`,
            amount:valorBaixa, date:data.nfEmissionDate||today(), dueDate:data.dueDate||"",
            status:"pendente", notes:"", supplierId:purchase.supplierId, purchaseId: purchase.id,
          }, ...prev];
        });
      }
    }

    setBaixaPedido(null);
  };

  const filtered = purchases
    .filter(p => filterStatus==="Todos" || p.status===filterStatus)
    .filter(p => !search || p.supplierName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
    .filter(p => filterByDate(p))
    .sort((a,b) => b.date.localeCompare(a.date));

  const statusOptions = (params?.compras?.statusList?.length ? params.compras.statusList : PC_STATUS);
  const statusCounts = statusOptions.reduce((acc,s) => ({ ...acc, [s]: purchases.filter(p=>p.status===s).length }), {});
  const totalPending = purchases.filter(p=>!["Baixado","Cancelado"].includes(p.status)).reduce((s,p)=>s+p.total,0);
  const st = (s) => PC_STATUS_STYLES[s] || { bg:"bg-gray-100", text:"text-gray-600" };

  // Financial status helper
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const diffDays = (a, b) => Math.round((a - b) / 86400000);
  const getFinStatus = (pc) => {
    if (pc.status==="Cancelado")  return { label:"Cancelado",  bg:"bg-gray-100",   text:"text-gray-400",  icon:"✕" };
    if (pc.paidDate)               return { label:"Pago",       bg:"bg-green-100",  text:"text-green-700", icon:"✅" };
    if (!pc.dueDate)               return { label:"Em aberto",  bg:"bg-blue-50",    text:"text-blue-600",  icon:"🔵" };
    const due = new Date(pc.dueDate+"T12:00:00"); due.setHours(0,0,0,0);
    const diff = diffDays(due, today0);
    if (diff < 0)  return { label:`Vencido há ${Math.abs(diff)}d`, bg:"bg-red-100",   text:"text-red-700",   icon:"🔴" };
    if (diff===0)  return { label:"Vence hoje",                    bg:"bg-amber-100", text:"text-amber-700", icon:"🟡" };
    if (diff<=3)   return { label:`Vence em ${diff}d`,             bg:"bg-amber-50",  text:"text-amber-600", icon:"🟠" };
    return               { label:`Vence em ${diff}d`,              bg:"bg-blue-50",   text:"text-blue-600",  icon:"🔵" };
  };

  if (detail) {
    const fs = getFinStatus(detail);
    const due  = detail.dueDate  ? new Date(detail.dueDate +"T12:00:00") : null;
    const paid = detail.paidDate ? new Date(detail.paidDate+"T12:00:00") : null;
    const lateDays = paid && due ? diffDays(paid, due) : null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={()=>setDetail(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">←</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{detail.id}</h1>
            <p className="text-sm text-gray-500">{detail.supplierName} · {detail.date ? new Date(detail.date+"T12:00:00").toLocaleDateString("pt-BR") : "—"}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st(detail.status).bg} ${st(detail.status).text}`}>{detail.status}</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${fs.bg} ${fs.text}`}>{fs.icon} {fs.label}</span>
          {canAlterar && detail.status !== "Baixado" && detail.status !== "Cancelado" && (
            <button onClick={() => setBaixaPedido(detail)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 flex items-center gap-1.5">
              ✅ Baixar Pedido
            </button>
          )}
          {canAlterar && detail.status === "Baixado" && detail.items.some(it => !it._prodId) && (
            <button onClick={() => setStockEntry(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 flex items-center gap-1.5">
              📦 Dar Entrada no Estoque
            </button>
          )}
          {detail.status === "Baixado" && detail.items.every(it => !!it._prodId) && (
            <span className="px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-semibold border border-green-200">✓ Estoque atualizado</span>
          )}
          {canAlterar && <button onClick={()=>setModal(detail)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Editar</button>}
          {canExcluir && <button onClick={()=>setDelConfirm(detail)} className="px-3 py-2 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50">Excluir</button>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[["📋 Emissão",      detail.date ? new Date(detail.date+"T12:00:00").toLocaleDateString("pt-BR") : "—"],
            ["🧾 Emissão da NF", detail.nfEmissionDate ? new Date(detail.nfEmissionDate+"T12:00:00").toLocaleDateString("pt-BR") : "—"],
            ["📅 Vencimento",    detail.dueDate ? new Date(detail.dueDate+"T12:00:00").toLocaleDateString("pt-BR") : "—"],
            ["✅ Pagamento",     detail.paidDate ? new Date(detail.paidDate+"T12:00:00").toLocaleDateString("pt-BR") : "Pendente"],
          ].map(([label,val])=>(
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{val}</p>
            </div>
          ))}
        </div>

        {lateDays !== null && lateDays > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-sm text-orange-700 font-medium">
            ⚠️ Pago com {lateDays} dia{lateDays!==1?"s":""} de atraso (vencimento: {new Date(detail.dueDate+"T12:00:00").toLocaleDateString("pt-BR")})
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="font-semibold text-gray-800 text-sm">Itens do Pedido</p>
            <p className="text-xs text-gray-400">{detail.paymentTerms} · {detail.notes||""}</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500">
                <th className="text-left px-4 py-2">Descrição</th>
                <th className="text-center px-3 py-2">Qtd</th>
                <th className="text-center px-3 py-2">Recebido</th>
                <th className="text-center px-3 py-2">Un</th>
                <th className="text-right px-3 py-2">Preço Un.</th>
                <th className="text-right px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((it,i)=>(
                <tr key={i} className="border-t border-gray-50">
                  <td className="px-4 py-2.5 text-gray-800">{it.description}</td>
                  <td className="px-3 py-2.5 text-center text-gray-600">{it.qty}</td>
                  <td className="px-3 py-2.5 text-center text-xs">
                    {(it.receivedQty||0) >= (it.qty||0) && (it.qty||0)>0
                      ? <span className="text-green-600 font-semibold">✓ {it.receivedQty}</span>
                      : (it.receivedQty||0) > 0
                        ? <span className="text-amber-600 font-semibold">{it.receivedQty}/{it.qty}</span>
                        : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-400 text-xs">{it.unit}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{fmt(it.unitPrice)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-800">{fmt(it.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-100">
              {detail.freight>0 && <tr><td colSpan={5} className="px-4 py-1.5 text-right text-xs text-gray-500">Frete</td><td className="px-4 py-1.5 text-right text-xs text-gray-600">+{fmt(detail.freight)}</td></tr>}
              {detail.discount>0 && <tr><td colSpan={5} className="px-4 py-1.5 text-right text-xs text-gray-500">Desconto</td><td className="px-4 py-1.5 text-right text-xs text-green-600">-{fmt(detail.discount)}</td></tr>}
              <tr><td colSpan={5} className="px-4 py-2 text-right font-bold text-gray-800 text-sm">Total</td><td className="px-4 py-2 text-right font-bold text-indigo-700 text-sm">{fmt(detail.total)}</td></tr>
            </tfoot>
          </table>
        </div>

        {modal && <PurchaseModal purchase={modal} suppliers={suppliers} products={products||[]} params={params} onClose={()=>setModal(null)} onSave={handleSave}/>}
        {baixaPedido && (
          <BaixarPedidoModal purchase={baixaPedido} onClose={()=>setBaixaPedido(null)} onConfirm={handleBaixarPedido} products={products}/>
        )}
        {stockEntry && detail && (
          <StockEntryModal
            purchase={detail}
            products={products||[]}
            onClose={() => setStockEntry(false)}
            onConfirm={handleStockEntry}
          />
        )}
        {delConfirm && (() => {
          const finLinked = (finance||[]).filter(f =>
            f.purchaseId === delConfirm.id || (f.description && f.description.startsWith(`Pedido ${delConfirm.id} `))
          );
          const temPago = finLinked.some(f => f.status === "pago");
          return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <p className="text-2xl mb-2">🗑️</p>
              <h3 className="font-bold text-gray-900 mb-1">Excluir {delConfirm.id}?</h3>
              <p className="text-sm text-gray-500 mb-2">Esta ação não pode ser desfeita.</p>
              {finLinked.length > 0 && (
                <p className={`text-xs rounded-lg px-3 py-2 mb-2 ${temPago ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                  {temPago
                    ? `⚠️ Este pedido tem ${finLinked.length} lançamento(s) em Contas a Pagar já marcado(s) como PAGO — será(ão) excluído(s) junto.`
                    : `O lançamento vinculado em Contas a Pagar (${finLinked.length}) também será excluído.`}
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={()=>setDelConfirm(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm">Cancelar</button>
                <button onClick={()=>handleDelete(delConfirm)} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium">Excluir</button>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pedidos de Compra</h1>
          <p className="text-sm text-gray-500 mt-0.5">{purchases.length} pedidos · {fmt(totalPending)} em aberto</p>
        </div>
        {canIncluir && (
          <button onClick={()=>setModal("new")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
            + Novo Pedido
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {statusOptions.map(s=>(
          <button key={s} onClick={()=>setFilterStatus(filterStatus===s?"Todos":s)}
            className={`rounded-xl px-3 py-2 text-center transition-all border ${filterStatus===s?"border-indigo-300 shadow-sm":"border-transparent"} ${st(s).bg}`}>
            <p className={`text-lg font-bold ${st(s).text}`}>{statusCounts[s]||0}</p>
            <p className={`text-[10px] font-medium ${st(s).text}`}>{s}</p>
          </button>
        ))}
      </div>

      <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por fornecedor ou número..."/>

      {/* Date filter */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex gap-1 flex-wrap">
          {[["todos","Todos"],["mes","Mês"],["ano","Ano"],["personalizado","Personalizado"]].map(([id,label])=>(
            <button key={id} onClick={()=>setFilterMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode===id?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {label}
            </button>
          ))}
        </div>
        {(filterMode==="mes"||filterMode==="ano") && (
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize min-w-[150px] text-center">{periodLabel()}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <span className="text-xs text-gray-400">{filtered.length} pedido{filtered.length!==1?"s":""}</span>
          </div>
        )}
        {filterMode==="personalizado" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">De:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Até:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
            </div>
            {(dateFrom||dateTo) && (
              <button onClick={()=>{setDateFrom("");setDateTo("");}} className="text-xs text-red-400 hover:text-red-600 font-medium">Limpar</button>
            )}
            <span className="text-xs text-gray-400">{filtered.length} pedido{filtered.length!==1?"s":""}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nenhum pedido encontrado</div>}
        {filtered.map(pc => {
          const fs = getFinStatus(pc);
          return (
            <div key={pc.id} onClick={()=>setDetail(pc)}
              className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-600">{pc.id}</span>
                    <span className="font-semibold text-gray-800 text-sm">{pc.supplierName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st(pc.status).bg} ${st(pc.status).text}`}>{pc.status}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${fs.bg} ${fs.text}`}>{fs.icon} {fs.label}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                    <span>📋 {pc.date ? new Date(pc.date+"T12:00:00").toLocaleDateString("pt-BR") : "—"}</span>
                    {pc.dueDate && <span>📅 Venc. {new Date(pc.dueDate+"T12:00:00").toLocaleDateString("pt-BR")}</span>}
                    {pc.paidDate && <span className="text-green-600">✅ Pago {new Date(pc.paidDate+"T12:00:00").toLocaleDateString("pt-BR")}</span>}
                    <span>💳 {pc.paymentTerms}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{fmt(pc.total)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {modal && <PurchaseModal purchase={modal==="new"?null:modal} suppliers={suppliers} products={products||[]} params={params} onClose={()=>setModal(null)} onSave={handleSave}/>}
    </div>
  );
};

// ─── Logo System ──────────────────────────────────────────────────────────
const LOGO_KEY = "erp_empresa_logo";

function useLogo() {
  const [logo, setLogo] = useState(null);
  useEffect(() => {
    window.storage.get(LOGO_KEY)
      .then(r => { if (r?.value) setLogo(r.value); })
      .catch(()=>{});
    // Atualiza na hora se o logo mudar em outro componente (ex: upload feito
    // em Parâmetros), sem precisar dar refresh na página pra ver a mudança.
    const onLogoUpdate = (e) => setLogo(e?.detail?.logo ?? null);
    window.addEventListener("erp:logo-updated", onLogoUpdate);
    return () => window.removeEventListener("erp:logo-updated", onLogoUpdate);
  }, []);
  return logo;
}

const LogoMark = ({ size = 40, className = "" }) => {
  const logo = useLogo();
  if (logo) return (
    <img src={logo} alt="Logo" className={className}
      style={{ width:size, height:size, objectFit:"contain", borderRadius:8 }}/>
  );
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label="MM ERP">
      <defs>
        <linearGradient id="mmLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="22" fill="url(#mmLogoGrad)"/>
      {/* "M" desenhado como ponto de costura (linha pontilhada), remetendo a linha/agulha */}
      <path d="M 25 72 L 25 28 L 50 56 L 75 28 L 75 72"
        fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="7 6"/>
      {/* "olho da agulha" no início do ponto, pequeno detalhe */}
      <circle cx="25" cy="28" r="4.5" fill="none" stroke="white" strokeWidth="3.2"/>
    </svg>
  );
};

// ─── Empresa Module ───────────────────────────────────────────────────────
// ─── Cadastros Storage (Representantes, Contas, Forma de Pagamento) ───────
const REPR_KEY = "erp-mmarmarinhos-representantes";
const REPR_STATUS = ["Ativo","Inativo"];
const REPR_COMISSAO_TIPOS = ["fixa","faixas"];
const SEED_REPRESENTANTES = [];
async function loadRepresentantes() {
  return loadKV(REPR_KEY, [...SEED_REPRESENTANTES], "Representantes");
}
async function saveRepresentantes(list) {
  return persistKV(REPR_KEY, list, "Representantes");
}
// Retorna a comissão % aplicável a um representante, dado o desconto concedido no pedido
function comissaoAplicavel(rep, descontoPercent) {
  if (!rep) return 0;
  if (rep.tipoComissao === "fixa") return parseFloat(rep.comissaoFixa) || 0;
  const faixas = (rep.faixas || []).slice().sort((a,b) => (a.ate||0) - (b.ate||0));
  if (faixas.length === 0) return 0;
  const d = descontoPercent || 0;
  for (const f of faixas) {
    if (d <= (f.ate||0)) return parseFloat(f.comissao) || 0;
  }
  return parseFloat(faixas[faixas.length-1].comissao) || 0;
}

const CONTA_KEY = "erp-mmarmarinhos-contas";

// ─── Catálogo de Variantes (molde reutilizável de códigos pra gerar variantes em massa) ──
const VARCAT_KEY = "erp-mmarmarinhos-catalogos-variante";
async function loadVariantCatalogs() {
  return loadKV(VARCAT_KEY, [], "Catálogos de Variante");
}
async function saveVariantCatalogs(list) {
  return persistKV(VARCAT_KEY, list, "Catálogos de Variante");
}
const CONTA_TIPOS = ["Corrente","Poupança"];

// ─── Fechamentos de Comissão de Representantes (módulo Movimentos) ───────────
const FECHAMENTO_KEY = "erp-mmarmarinhos-fechamentos-comissao";
async function loadFechamentos() {
  return loadKV(FECHAMENTO_KEY, [], "Fechamentos de Comissão");
}
async function saveFechamentos(list) {
  return persistKV(FECHAMENTO_KEY, list, "Fechamentos de Comissão");
}
const BANCOS_BR = [
  "Banco do Brasil","Itaú","Bradesco","Caixa Econômica Federal","Santander","Nubank",
  "Inter","Sicoob","Sicredi","BTG Pactual","C6 Bank","PagBank","Mercado Pago",
  "Banco Original","Safra","Banrisul",
];
const SEED_CONTAS = [];
async function loadContas() {
  return loadKV(CONTA_KEY, [...SEED_CONTAS], "Contas Bancárias");
}
async function saveContas(list) {
  return persistKV(CONTA_KEY, list, "Contas Bancárias");
}

const FORMAPAG_KEY = "erp-mmarmarinhos-formas-pagamento";
const FORMAPAG_STATUS = ["Ativo","Inativo"];
// Migração: deriva formas de pagamento a partir do PAYMENT_METHODS existente, preservando compatibilidade
const SEED_FORMASPAGAMENTO = PAYMENT_METHODS.map((nome, i) => ({
  id: `FPG-${String(i+1).padStart(3,"0")}`, nome, taxa: 0, prazoRecebimento: 0, contaId: "", status: "Ativo",
}));
async function loadFormasPagamento() {
  return loadKV(FORMAPAG_KEY, [...SEED_FORMASPAGAMENTO], "Formas de Pagamento");
}
async function saveFormasPagamento(list) {
  return persistKV(FORMAPAG_KEY, list, "Formas de Pagamento");
}

// ─── Params Storage ───────────────────────────────────────────────────────
const PARAMS_KEY = "erp-mmarmarinhos-params";
const PARAMS_DEFAULT = {
  canais: {
    "Mercado Livre": { comissao: 12,  gateway: 3.5, ativo: true, sla: 3, taxaFixa: 0, diasDespacho: [1,2,3,4,5] },
    "Shopee":        { comissao: 14,  gateway: 2.0, ativo: true, sla: 2, taxaFixa: 0, diasDespacho: [1,2,3,4,5] },
    "WhatsApp":      { comissao: 0,   gateway: 0,   ativo: true, sla: 2, taxaFixa: 0, diasDespacho: [1,2,3,4,5] },
    "Loja Própria":  { comissao: 0,   gateway: 2.5, ativo: true, sla: 3, taxaFixa: 0, diasDespacho: [1,2,3,4,5] },
  },
  alertas: { diasInatividade: 30, emailAlertas: "" },
  sincronizacao: {
    ml:     { accessToken: "", clientId: "", refreshToken: "", autoImport: false },
    shopee: { partnerId: "",  partnerKey: "", shopId: "",     autoImport: false },
    backendUrl: "",
  },
  vendas: { validadeCotacaoDias: 10, multaAtrasoPercent: 2, jurosAtrasoPercentMes: 1, descontoMaximoPercent: 0, statusList: ["Novo","Em Separação","Enviado","Entregue","Cancelado","Devolvido"] },
  compras: { statusList: ["Em Aberto","Baixado","Cancelado"] },
  fiscal: { provider: "", token: "", ambiente: "homologacao" },
};
async function loadParams() {
  const saved = await loadKV(PARAMS_KEY, null, "Parâmetros");
  if (saved) {
    return {
      ...PARAMS_DEFAULT,
      ...saved,
      canais: { ...PARAMS_DEFAULT.canais, ...(saved.canais||{}) },
      alertas: { ...PARAMS_DEFAULT.alertas, ...(saved.alertas||{}) },
      sincronizacao: { ...PARAMS_DEFAULT.sincronizacao, ...(saved.sincronizacao||{}) },
      vendas: { ...PARAMS_DEFAULT.vendas, ...(saved.vendas||{}) },
      compras: { ...PARAMS_DEFAULT.compras, ...(saved.compras||{}) },
      fiscal: { ...PARAMS_DEFAULT.fiscal, ...(saved.fiscal||{}) },
    };
  }
  return { ...PARAMS_DEFAULT };
}
async function saveParams(p) {
  return persistKV(PARAMS_KEY, p, "Parâmetros");
}

const EMPRESA_KEY = "erp_empresa_dados";
const EMPRESA_EMPTY = {
  razaoSocial:"", nomeFantasia:"", cnpj:"", ie:"", im:"",
  regime:"Simples Nacional",
  cep:"", rua:"", numero:"", complemento:"", bairro:"", cidade:"", estado:"",
  telefone:"", celular:"", email:"", site:"",
  responsavel:"", cargo:"", obs:""
};

const REGIMES = ["Simples Nacional","Lucro Presumido","Lucro Real","MEI","Imune/Isento"];


// ─── Cotação Module ───────────────────────────────────────────────────────
// "Enviada" foi removida das opções: era só um rótulo manual sem nenhuma
// lógica de negócio associada (sem envio automático, sem efeito em
// estoque/financeiro) — o funil ficou mais simples com Em Aberto → decisão.
const COT_STATUS     = ["Em Aberto","Aprovada","Recusada","Expirada","Convertida"];
const COT_STATUS_ST  = {
  "Em Aberto":  { bg:"bg-gray-100",   text:"text-gray-600"   },
  "Aprovada":   { bg:"bg-green-100",  text:"text-green-700"  },
  "Recusada":   { bg:"bg-red-100",    text:"text-red-600"    },
  "Expirada":   { bg:"bg-orange-100", text:"text-orange-700" },
  "Convertida": { bg:"bg-purple-100", text:"text-purple-700" },
};

const SEED_COTACOES = [];

const COT_KEY = "erp_cotacoes";
async function loadCotacoes() {
  return loadKV(COT_KEY, SEED_COTACOES, "Cotações");
}
async function saveCotacoes(c) {
  return persistKV(COT_KEY, c, "Cotações");
}

// ─── Cotação Modal ────────────────────────────────────────────────────────
const CotacaoModal = ({ cotacao, onClose, onSave, customers = [], products = [], representantes = [], formasPagamento = [], params, currentUser }) => {
  const isNew = !cotacao;
  const emptyItem = () => ({ sku:"", description:"", qty:1, unit:"un", unitPrice:0, discount:0, discountType:"%", total:0 });
  const [form, setForm] = useState(cotacao ? { ...cotacao } : {
    customer:"", channel:"WhatsApp", date:today(), validUntil:addDaysISO(today(), params?.vendas?.validadeCotacaoDias || 10),
    status:"Em Aberto", payment:"Pix", freight:0, discount:0,
    items:[emptyItem()], notes:"", orderId:null, representanteId:"",
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Customer autocomplete
  const [custSearch, setCustSearch]   = useState(cotacao?.customer||"");
  const [showCustList, setShowCustList] = useState(false);
  const filteredCustomers = customers
    .filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()))
    .slice(0, 8);

  const custInputRef = useRef(null);
  const selectCustomer = (c) => {
    setCustSearch(c.name);
    setForm(f => ({ ...f, customer:c.name, channel:c.channel||f.channel }));
    setShowCustList(false);
    setTimeout(()=>custInputRef.current?.focus(), 0);
  };

  // SKU autocomplete state per item
  const [skuSearch, setSkuSearch]   = useState([]);
  const [showSkuList, setShowSkuList] = useState([]);
  // Posição calculada do dropdown de SKU do item — renderizado com position:fixed
  // (fora do <div overflow-x-auto> da tabela de itens) pra não ser cortado pela
  // rolagem horizontal/vertical daquele contêiner.
  const [skuListPos, setSkuListPos] = useState({});
  const [askAddItem, setAskAddItem] = useState(false);
  const naoItemRef = useRef(null);
  const modalRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const suppressNextAsk = useRef(false);
  const skuInputRefs = useRef([]);
  const simItemRef = useRef(null);

  const calcItemTotal = (it) => {
    const gross = (it.qty||0) * (it.unitPrice||0);
    const disc  = it.discountType==="%"
      ? gross * ((it.discount||0)/100)
      : (it.discount||0);
    return parseFloat(Math.max(0, gross - disc).toFixed(2));
  };

  const setItem = (i,k,v) => setForm(f => {
    const items = f.items.map((it,idx) => {
      if (idx!==i) return it;
      const u = { ...it, [k]:v };
      u.total = calcItemTotal(u);
      return u;
    });
    return { ...f, items };
  });

  const selectProduct = (i, prod) => {
    setForm(f => {
      // Busca o preço do canal atual, com fallback para preço padrão
      const cpRaw = prod.channelPrices?.[f.channel];
      const channelPrice = cpRaw ? (typeof cpRaw==='object' ? cpRaw.price : cpRaw) : 0;
      const unitPrice = (channelPrice > 0) ? channelPrice : (prod.price||0);
      const items = f.items.map((it,idx) => {
        if (idx!==i) return it;
        const updated = { ...it, sku:prod.sku||"", description:prod.name, unit:prod.unit||"un", unitPrice, _prodId:prod.id };
        updated.total = calcItemTotal(updated);
        return updated;
      });
      return { ...f, items };
    });
    const ss = [...skuSearch]; ss[i] = prod.sku||prod.name;
    setSkuSearch(ss);
    const sl = [...showSkuList]; sl[i] = false;
    setShowSkuList(sl);
  };

  const addItem = () => {
    setForm(f=>({...f,items:[...f.items,emptyItem()]}));
    setSkuSearch(s=>[...s,""]);
    setShowSkuList(s=>[...s,false]);
  };
  const removeItem = (i) => {
    setForm(f=>({...f,items:f.items.filter((_,idx)=>idx!==i)}));
    setSkuSearch(s=>s.filter((_,idx)=>idx!==i));
    setShowSkuList(s=>s.filter((_,idx)=>idx!==i));
  };

  const subtotal = form.items.reduce((s,it)=>s+(it.total||0),0);
  const total    = Math.max(0, subtotal - (Number(form.discount)||0) + (Number(form.freight)||0));
  const formasAtivas = formasPagamento.filter(f => f.status==="Ativo");
  const paymentOptions = formasAtivas.length > 0 ? formasAtivas.map(f=>f.nome) : PAYMENT_METHODS;

  const [descErr, setDescErr] = useState("");
  const handleSave = () => {
    if (!form.customer.trim()) return;
    // Mesma política do pedido: limite de desconto da empresa vale também na
    // cotação (senão a trava seria burlada cotando e convertendo). Considera o
    // maior entre os descontos por item e o desconto geral como % do subtotal.
    const limite = limiteDesconto(params);
    const descGeralPct = subtotal > 0 ? (Number(form.discount)||0) / subtotal * 100 : 0;
    const maior = Math.max(maiorDescontoPercent(form.itemsList||form.items), descGeralPct);
    if (limite > 0 && maior > limite + 0.01 && currentUser?.role !== "admin") {
      setDescErr(`⛔ Desconto de ${maior.toFixed(1)}% acima do limite da empresa (${limite}%). Somente administradores podem conceder desconto maior.`);
      return;
    }
    setDescErr("");
    onSave({ ...form, subtotal, total:parseFloat(total.toFixed(2)) });
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} onKeyDown={e=>trapTabFocus(e, modalRef)} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900">{isNew?"Nova Cotação":`Editar ${cotacao.id}`}</h2>
          <div className="flex items-start gap-3">
            <div className="text-right text-xs text-gray-400 leading-relaxed">
              <p>📅 {form.date ? new Date(form.date+"T00:00:00").toLocaleDateString("pt-BR") : "—"}</p>
              <p>⏳ Válida até {form.validUntil ? new Date(form.validUntil+"T00:00:00").toLocaleDateString("pt-BR") : "—"}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Header fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 relative">
              <label className="text-xs font-medium text-gray-600 block mb-1">Cliente *</label>
              <input className={inp} ref={custInputRef}
                value={custSearch}
                onChange={e=>{ setCustSearch(e.target.value); set("customer",e.target.value); setShowCustList(true); }}
                onFocus={()=>setShowCustList(true)}
                onBlur={()=>setTimeout(()=>setShowCustList(false),150)}
                placeholder="Digite o nome do cliente..."/>
              {showCustList && filteredCustomers.length>0 && custSearch && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredCustomers.map(c=>(
                    <button key={c.id} type="button" onMouseDown={()=>selectCustomer(c)}
                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0">
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.cpfCnpj||""} {c.channel?`· ${c.channel}`:""} {c.phone?`· ${c.phone}`:""}</p>
                    </button>
                  ))}
                </div>
              )}
              {custSearch && customers.length>0 && !customers.find(c=>c.name===custSearch) && (
                <p className="text-[10px] text-amber-500 mt-1">⚠️ Cliente não encontrado no cadastro</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Canal</label>
              <select className={inp} value={form.channel} onChange={e=>{
                const newChannel = e.target.value;
                setForm(f => {
                  // Re-price items that have channel-specific prices
                  const items = f.items.map(it => {
                    if (!it._prodId) return {...it, [Symbol.for("skip")]:true};
                    const prod = products.find(p=>String(p.id)===String(it._prodId));
                    if (!prod) return it;
                    const cpRaw2 = prod.channelPrices?.[newChannel];
                    const channelPrice = cpRaw2 ? (typeof cpRaw2==='object' ? cpRaw2.price : cpRaw2) : 0;
                    if (!channelPrice || channelPrice <= 0) return it;
                    const updated = { ...it, unitPrice: channelPrice };
                    updated.total = calcItemTotal(updated);
                    return updated;
                  });
                  return { ...f, channel: newChannel, items };
                });
              }}>
                {CHANNELS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
              <select className={inp} value={form.status} onChange={e=>set("status",e.target.value)}>
                {COT_STATUS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Forma de Pagamento</label>
              <select className={inp} value={form.payment} onChange={e=>set("payment",e.target.value)}>
                {paymentOptions.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Representante</label>
              <select className={inp} value={form.representanteId||""} onChange={e=>set("representanteId",e.target.value)}>
                <option value="">— Nenhum —</option>
                {representantes.filter(r=>r.status==="Ativo").map(r=><option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Itens</label>
              <button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Adicionar item</button>
            </div>
            <div className="overflow-x-auto">
              <div className="space-y-2 min-w-[700px]">
                {form.items.map((it,i)=>{
                const sq = skuSearch[i]||it.sku||"";
                const filtProd = products.filter(p =>
                  p.sku?.toLowerCase().includes(sq.toLowerCase()) ||
                  p.name?.toLowerCase().includes(sq.toLowerCase())
                ).slice(0,6);
                const gross = (it.qty||0)*(it.unitPrice||0);
                const discAmt = it.discountType==="%"
                  ? gross*((it.discount||0)/100)
                  : (it.discount||0);
                return (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex gap-2 items-start">
                      <div className="relative w-28 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">SKU</p>
                        <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 font-mono"
                          value={sq}
                          onChange={e=>{
                            const ss=[...skuSearch]; ss[i]=e.target.value; setSkuSearch(ss); setItem(i,"sku",e.target.value);
                            const sl=[...showSkuList]; sl[i]=true; setShowSkuList(sl);
                            const r = skuInputRefs.current[i]?.getBoundingClientRect();
                            if (r) setSkuListPos(p=>({...p,[i]:{top:r.bottom+4, left:r.left, width:Math.max(r.width,220)}}));
                          }}
                          onFocus={()=>{
                            const sl=[...showSkuList]; sl[i]=true; setShowSkuList(sl);
                            const r = skuInputRefs.current[i]?.getBoundingClientRect();
                            if (r) setSkuListPos(p=>({...p,[i]:{top:r.bottom+4, left:r.left, width:Math.max(r.width,220)}}));
                          }}
                          onBlur={()=>setTimeout(()=>{ const sl=[...showSkuList]; sl[i]=false; setShowSkuList(sl); },150)}
                          onKeyDown={e=>{
                            if (e.key==="Tab" && showSkuList[i] && filtProd.length>0) {
                              const exact = filtProd.find(p=>p.sku?.toLowerCase()===sq.toLowerCase());
                              selectProduct(i, exact||filtProd[0]);
                            }
                          }}
                          ref={el=>skuInputRefs.current[i]=el}
                          placeholder="SKU"/>
                        {showSkuList[i] && filtProd.length>0 && sq && (
                          <div
                            className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                            style={{
                              top: (skuListPos[i]?.top ?? 0) + "px",
                              left: (skuListPos[i]?.left ?? 0) + "px",
                              width: (skuListPos[i]?.width ?? 256) + "px",
                            }}>
                            {filtProd.map(p=>(
                              <button key={p.id} type="button" onMouseDown={()=>selectProduct(i,p)}
                                className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-50 last:border-0">
                                <p className="text-xs font-mono font-bold text-indigo-600">{p.sku||"—"}</p>
                                <p className="text-xs text-gray-700 truncate">{p.name}</p>
                                <p className={`text-[10px] ${(p.stock||0)<=0?"text-red-400":"text-gray-400"}`}>Estoque: {p.stock||0} {p.unit||"un"}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Produto / Serviço</p>
                        <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.description} onChange={e=>setItem(i,"description",e.target.value)} placeholder="Produto / serviço"/>
                      </div>
                      <div className="w-16 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Qtd</p>
                        <input type="number" min="1"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.qty===0?"":it.qty}
                          onChange={e=>setItem(i,"qty", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                          onBlur={e=>{ if (e.target.value==="") setItem(i,"qty",0); }}/>
                      </div>
                      <div className="w-20 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Un</p>
                        <select className="w-full border border-gray-200 rounded-lg px-1 py-1.5 text-xs bg-white focus:outline-none"
                          value={it.unit} onChange={e=>setItem(i,"unit",e.target.value)}>
                          {INV_UNITS.map(u=><option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div className="w-24 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Preço Unit.</p>
                        <input type="number" min="0" step="0.01"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          value={it.unitPrice===0?"":it.unitPrice}
                          onChange={e=>setItem(i,"unitPrice", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                          onBlur={e=>{ if (e.target.value==="") setItem(i,"unitPrice",0); }}/>
                      </div>
                      <div className="w-28 shrink-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">Desconto</p>
                        <div className="flex gap-0.5">
                          <button onClick={()=>setItem(i,"discountType",it.discountType==="%"?"R$":"%")}
                            className="border border-gray-200 rounded-l-lg px-2 py-1.5 text-[10px] font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 transition-colors shrink-0 text-gray-600">
                            {it.discountType||"%"}
                          </button>
                          <input type="number" min="0" step="0.01"
                            className="w-full border border-gray-200 rounded-r-lg px-1 py-1.5 text-xs text-right bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                            value={it.discount===0?"":it.discount}
                            onChange={e=>{setItem(i,"discount", e.target.value===""?"":(parseFloat(e.target.value)||0)); suppressNextAsk.current=false;}}
                            onBlur={e=>{ if (e.target.value==="") setItem(i,"discount",0); if (suppressNextAsk.current) { suppressNextAsk.current=false; return; } lastFocusedRef.current=e.target; setAskAddItem(true); }}/>
                        </div>
                      </div>
                      <div className="w-24 shrink-0 text-right">
                        <p className="text-[10px] text-gray-400 mb-0.5">Total</p>
                        <p className="text-sm font-bold text-gray-900 pt-1">{fmt(it.total)}</p>
                        {discAmt>0 && <p className="text-[10px] text-green-600">-{fmt(discAmt)}</p>}
                      </div>
                      {form.items.length>1 && (
                        <button onClick={()=>removeItem(i)} className="text-red-400 hover:text-red-600 text-sm shrink-0 mt-5">✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Frete (R$)</label>
              <input type="number" min="0" step="0.01" className={inp}
                value={form.freight===0?"":form.freight}
                onChange={e=>set("freight", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                onBlur={e=>{ if (e.target.value==="") set("freight",0); }}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Desconto (R$)</label>
              <input type="number" min="0" step="0.01" className={inp}
                value={form.discount===0?"":form.discount}
                onChange={e=>set("discount", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                onBlur={e=>{ if (e.target.value==="") set("discount",0); }}/>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-xs text-gray-500">Subtotal: {fmt(subtotal)}</p>
              <p className="text-base font-bold text-indigo-700">Total: {fmt(total)}</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Observações</label>
            <textarea rows={2} className={`${inp} resize-none`}
              value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Condições especiais, prazo de entrega, validade..."/>
          </div>
        </div>

        {descErr && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">{descErr}</p>}
        <div className="flex gap-2 p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          {!isNew && (
            <button onClick={async ()=>{ const emp = await window.storage.get(EMPRESA_KEY).catch(()=>null); gerarCotacaoPDF(form, emp?.value ? JSON.parse(emp.value) : {}); }}
              className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 flex items-center gap-1.5 whitespace-nowrap">
              📄 Exportar PDF
            </button>
          )}
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
            {isNew?"Criar Cotação":"Salvar"}
          </button>
        </div>
      </div>

      {askAddItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onKeyDown={e=>{ if (e.key==="Escape") { suppressNextAsk.current=true; setAskAddItem(false); setTimeout(()=>lastFocusedRef.current?.focus(),0); return; } if (e.key==="Tab") { e.preventDefault(); (document.activeElement===simItemRef.current ? naoItemRef : simItemRef).current?.focus(); } }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center">
            <p className="text-3xl mb-2">➕</p>
            <p className="font-semibold text-gray-900 mb-1">Adicionar outro item?</p>
            <p className="text-sm text-gray-500 mb-4">Você pode continuar incluindo produtos nesta cotação.</p>
            <div className="flex gap-2">
              <button ref={naoItemRef} onClick={()=>{suppressNextAsk.current=true; setAskAddItem(false); setTimeout(()=>lastFocusedRef.current?.focus(),0);}} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Não</button>
              <button ref={simItemRef} autoFocus onClick={()=>{const newIdx=form.items.length; addItem(); setAskAddItem(false); setTimeout(()=>skuInputRefs.current[newIdx]?.focus(),50);}} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Sim, adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Cotações Module ──────────────────────────────────────────────────────
const gerarCotacaoPDF = (cotacao, empresaRaw) => {
  const emp = empresaRaw || {};
  const eNome  = emp.nomeFantasia || emp.razaoSocial || "MM Armarinhos";
  const eCnpj  = emp.cnpj   || "";
  const eTel   = emp.celular || emp.telefone || "";
  const eEmail = emp.email  || "";
  const eSite  = emp.site   || "";

  const items = cotacao.items || cotacao.itemsList || [];
  const subtotal = items.reduce(function(s,it){ return s + (it.total||0); }, 0);
  const total = parseFloat(cotacao.total) || subtotal;
  const hoje = new Date().toLocaleDateString("pt-BR");
  const fmtBR = (iso) => iso ? new Date(iso+"T00:00:00").toLocaleDateString("pt-BR") : "";

  const infoEmp = (eCnpj  ? "CNPJ: "  + eCnpj  + "<br>" : "")
                + (eTel   ? "Cel: "    + eTel   + "<br>" : "")
                + (eEmail ? "E-mail: " + eEmail + "<br>" : "")
                + (eSite  ? "Site: "   + eSite           : "");

  var rows = "";
  items.forEach(function(it) {
    var desc = it.description || it.desc || it.sku || "-";
    var sku  = it.sku || "-";
    var qty  = it.qty || it.quantity || 1;
    var un   = it.unit || "un";
    var price = (it.price || it.unitPrice || 0).toFixed(2).replace(".",",");
    var disc  = it.discount ? it.discount + "%" : "-";
    var tot   = (it.total || 0).toFixed(2).replace(".",",");
    rows += "<tr>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;'>" + sku + "</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;'>" + desc + "</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;'>" + qty + "</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;'>" + un + "</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;'>R$ " + price + "</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;'>" + disc + "</td>"
      + "<td style='padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;'>R$ " + tot + "</td>"
      + "</tr>";
  });

  const notesHTML = cotacao.notes
    ? "<div style='background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:12px;color:#64748b;line-height:1.6;margin-bottom:20px;'>" + cotacao.notes + "</div>"
    : "";

  const validLine = cotacao.validUntil ? "<br>Valida ate: " + fmtBR(cotacao.validUntil) : "";

  const css = "<style>"
    + "* {margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif;}"
    + "body {padding:32px;color:#1e293b;font-size:13px;}"
    + ".hdr {display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:3px solid #6366f1;}"
    + ".enome {font-size:22px;font-weight:800;color:#6366f1;}"
    + ".einfo {font-size:11px;color:#64748b;margin-top:4px;line-height:1.7;}"
    + ".badge {background:#6366f1;color:#fff;font-size:18px;font-weight:700;padding:8px 18px;border-radius:10px;}"
    + ".bsub {font-size:11px;color:#64748b;text-align:right;margin-top:6px;}"
    + ".sec {margin-bottom:24px;}"
    + ".stitle {font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;}"
    + ".grid {display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;}"
    + ".ibox {background:#f8fafc;border-radius:8px;padding:10px 12px;border:1px solid #e2e8f0;}"
    + ".ilabel {font-size:10px;color:#94a3b8;text-transform:uppercase;margin-bottom:3px;}"
    + ".ival {font-size:13px;font-weight:600;color:#1e293b;}"
    + "table {width:100%;border-collapse:collapse;}"
    + "th {background:#f8fafc;text-align:left;padding:9px 8px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;}"
    + ".tbox {display:flex;justify-content:flex-end;margin-top:16px;}"
    + ".tinner {background:#f8fafc;border-radius:10px;padding:16px;width:280px;}"
    + ".trow {display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#64748b;}"
    + ".tfinal {display:flex;justify-content:space-between;padding:10px 0 0;margin-top:8px;border-top:2px solid #6366f1;font-size:18px;font-weight:800;color:#6366f1;}"
    + ".aprov {margin-top:32px;border-top:2px dashed #e2e8f0;padding-top:24px;}"
    + ".sig-row {display:flex;gap:32px;}"
    + ".sig-box {flex:1;border-top:1px solid #94a3b8;padding-top:8px;font-size:11px;color:#64748b;}"
    + ".ftr {margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;}"
    + "@media print {body {padding:20px;}}"
    + "</style>";

  const body = "<div class='hdr'>"
    + "<div><div class='enome'>" + eNome + "</div><div class='einfo'>" + infoEmp + "</div></div>"
    + "<div><div class='badge'>COTACAO " + (cotacao.id||"") + "</div>"
    + "<div class='bsub'>Data: " + (fmtBR(cotacao.date)||"-") + validLine + "</div></div>"
    + "</div>"
    + "<div class='sec'><div class='stitle'>Cliente</div><div class='grid'>"
    + "<div class='ibox'><div class='ilabel'>Nome</div><div class='ival'>" + (cotacao.customer||"-") + "</div></div>"
    + "<div class='ibox'><div class='ilabel'>Canal</div><div class='ival'>" + (cotacao.channel||"-") + "</div></div>"
    + "<div class='ibox'><div class='ilabel'>Pagamento</div><div class='ival'>" + (cotacao.payment||"-") + "</div></div>"
    + "</div></div>"
    + "<div class='sec'><div class='stitle'>Itens</div>"
    + "<table><thead><tr>"
    + "<th>SKU</th><th>Descricao</th><th style='text-align:center'>Qtd</th><th style='text-align:center'>Un</th><th style='text-align:right'>Preco Unit.</th><th style='text-align:center'>Desc.</th><th style='text-align:right'>Total</th>"
    + "</tr></thead><tbody>" + rows + "</tbody></table>"
    + "<div class='tbox'><div class='tinner'>"
    + "<div class='trow'><span>Subtotal</span><span>R$ " + subtotal.toFixed(2).replace(".",",") + "</span></div>"
    + "<div class='tfinal'><span>TOTAL</span><span>R$ " + total.toFixed(2).replace(".",",") + "</span></div>"
    + "</div></div></div>"
    + notesHTML
    + "<div class='aprov'><p style='font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:16px;'>Aprovacao</p>"
    + "<div class='sig-row'>"
    + "<div class='sig-box'>( ) Aprovado &nbsp;&nbsp; ( ) Reprovado<br><br>Assinatura: ___________________</div>"
    + "<div class='sig-box'>Nome: ___________________<br><br>Data: ___/___/______</div>"
    + "</div></div>"
    + "<div class='ftr'><span>" + eNome + " - Cotacao gerada em " + hoje + "</span><span>Documento nao possui valor fiscal</span></div>"
    + "<script>window.onload=function(){window.print();}<" + "/script>";

  const html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Cotacao " + (cotacao.id||"") + "</title>" + css + "</head><body>" + body + "</body></html>";
  const w = window.open("", "_blank", "width=900,height=700");
  if (w) { w.document.write(html); w.document.close(); }
};

const CotacaoModule = ({ cotacoes, setCotacoes, setOrders, orders, customers = [], setCustomers, products = [], setProducts, movements = [], setMovements, empresa = {}, representantes = [], formasPagamento = [], params, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "cotacao", "incluir");
  const canAlterar = getUserPerm(currentUser, "cotacao", "alterar");
  const canExcluir = getUserPerm(currentUser, "cotacao", "excluir");
  const [modal,    setModal]    = useState(null);
  const [detail,   setDetail]   = useState(null);
  const [filter,   setFilter]   = useState("Todos");
  const [search,   setSearch]   = useState("");
  const [delConf,  setDelConf]  = useState(null);
  const [toast,    setToast]    = useState(null);
  const [filterMode, setFilterMode] = useState("todos");
  const [period, setPeriod] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const filterByDate = (c) => {
    if (filterMode === "todos") return true;
    if (filterMode === "mes")   return c.date.startsWith(period);
    if (filterMode === "ano")   return c.date.startsWith(period.split("-")[0]);
    if (filterMode === "personalizado") {
      if (dateFrom && c.date < dateFrom) return false;
      if (dateTo   && c.date > dateTo)   return false;
      return true;
    }
    return true;
  };

  const periodLabel = () => {
    if (filterMode === "todos") return "Todos";
    if (filterMode === "personalizado") return dateFrom||dateTo ? `${dateFrom||"..."} → ${dateTo||"..."}` : "Personalizado";
    if (filterMode === "ano") return period.split("-")[0];
    const [y,m] = period.split("-").map(Number);
    return new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  };

  // No modo "Ano" as setas pulam 12 meses (antes, cada clique andava só 1 mês
  // — pra trocar de ano eram 12 cliques sem o rótulo mudar).
  const stepPeriod = (dir) => {
    const [y,m] = period.split("-").map(Number);
    const step = filterMode === "ano" ? 12 : 1;
    const d = new Date(y, m-1 + dir*step, 1);
    setPeriod(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };
  const prevMonth = () => stepPeriod(-1);
  const nextMonth = () => stepPeriod(1);

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  // Auto-expiração: cotações Em Aberto/Aprovada com validade vencida passam a
  // "Expirada" ao abrir o módulo — antes, o status "Expirada" existia mas nada
  // nunca expirava (o pill ficava em 0 e o total "em aberto" somava cotações
  // vencidas). De quebra, expirar remove o botão de conversão.
  useEffect(() => {
    const hoje = today();
    const vencidas = cotacoes.filter(c =>
      ["Em Aberto","Aprovada"].includes(c.status) && c.validUntil && c.validUntil < hoje
    );
    if (vencidas.length > 0) {
      const ids = new Set(vencidas.map(c => c.id));
      setCotacoes(prev => prev.map(c => ids.has(c.id) ? { ...c, status:"Expirada" } : c));
    }
  }, []); // uma vez por abertura do módulo

  // Registra no painel Fiscal uma nota emitida eletronicamente pelo sistema
// (Pedidos ou PDV). Idempotente por orderId+tipo — reemissão não duplica.
// Notas simuladas nunca entram no painel.
const registrarNfeFiscal = (setNfes, { order, tipo, numero, chave, status, dataEmissao, cpfCnpj }) => {
  if (!setNfes || !numero || status === "simulado") return;
  setNfes(prev => {
    if (prev.some(n => n.orderId === order.id && n.tipo === tipo)) return prev;
    const nums = prev.map(n=>parseInt((n.id||"").replace("NFE-",""))||0);
    const newId = `NFE-${String(Math.max(0,...nums,0)+1).padStart(3,"0")}`;
    const freight = Number(order.freight)||0;
    const total   = Number(order.total)||0;
    return [{
      id:newId, orderId:order.id, numero:String(numero), serie:"1", tipo,
      dataEmissao: dataEmissao || today(),
      destinatario: order.customer || "Consumidor",
      cpfCnpj: cpfCnpj || order.cpfCnpj || "",
      cfop:"5102", ncm:"", descricao: order.items || "",
      valorProdutos: Math.max(0, total - freight), valorFrete: freight, valorDesconto: 0,
      valorTotal: total, icms:0, pis:0, cofins:0,
      status:"Autorizada", chave: chave || "", notes:`Emitida pelo sistema · pedido ${order.id}`,
    }, ...prev];
  });
};

const nextId = (list) => {
    const nums = list.map(c=>parseInt(c.id.replace("COT-",""))||0);
    return `COT-${String(Math.max(0,...nums)+1).padStart(3,"0")}`;
  };

  const handleSave = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) setCotacoes(prev=>prev.map(c=>c.id===data.id?data:c));
    else         setCotacoes(prev=>[{...data,id:nextId(prev),createdAt:today()},...prev]);
    setModal(null);
    if (detail) setDetail(data);
  };

  // Convert quote to order
  const handleConvert = (cot) => {
    if (!canAlterar) return; // segurança extra, além do botão já escondido
    // Trava contra clique duplo / reconversão: o estado ATUAL da cotação é a
    // fonte da verdade — se já foi convertida, não cria um segundo pedido nem
    // baixa o estoque de novo.
    const atual = cotacoes.find(c => c.id === cot.id);
    if (!atual || atual.status === "Convertida") return;

    // O pedido não tem campo de desconto geral (total = itens + frete), então
    // o desconto geral da cotação é distribuído proporcionalmente nos totais
    // dos itens — assim a soma dos itens já reflete o desconto e qualquer
    // edição futura do pedido recalcula o total certo (antes, a primeira
    // edição fazia o desconto sumir e o total aumentar em silêncio).
    const descGeral = Number(cot.discount) || 0;
    let itensConvertidos = (cot.items || []).map(it => ({ ...it }));
    const somaItens = itensConvertidos.reduce((s,it)=>s+(Number(it.total)||0),0);
    if (descGeral > 0 && somaItens > 0) {
      let aplicado = 0;
      itensConvertidos = itensConvertidos.map((it, i) => {
        const t = Number(it.total)||0;
        const isLast = i === itensConvertidos.length - 1;
        const desc = isLast ? (descGeral - aplicado) : parseFloat((descGeral * (t / somaItens)).toFixed(2));
        aplicado += desc;
        return { ...it, total: parseFloat(Math.max(0, t - desc).toFixed(2)) };
      });
    }

    const newOrderId = `PED-${String(Math.max(0,...orders.map(o=>parseInt(o.id.replace("PED-",""))||0))+1).padStart(3,"0")}`;
    const newOrder = {
      id:       newOrderId,
      customer: cot.customer,
      channel:  cot.channel,
      status:   "Novo",
      total:    cot.total,
      items:    cot.items.map(it=>`${it.description} x${it.qty}`).join(", "),
      itemsList: itensConvertidos,
      date:     today(),
      payment:  cot.payment,
      freight:  cot.freight || 0,
      representanteId: cot.representanteId || "",
      tracking: "",
      dueDate:  "",
      paidDate: "",
      notes:    `Gerado da cotação ${cot.id}`,
    };
    setOrders(prev=>[...prev,newOrder]);
    setCotacoes(prev=>prev.map(c=>c.id===cot.id ? {...c,status:"Convertida",orderId:newOrderId} : c));
    if (detail?.id===cot.id) setDetail({...cot,status:"Convertida",orderId:newOrderId});

    // Reativa o cliente inativo, igual à criação manual de pedido no módulo
    // Pedidos — antes, converter cotação deixava o cliente como Inativo.
    if (cot.customer && setCustomers) {
      setCustomers(prev => prev.map(cli =>
        cli.name?.toLowerCase() === cot.customer?.toLowerCase() && cli.segment === "Inativo"
          ? { ...cli, segment: "Ativo" }
          : cli
      ));
    }

    // ── Baixa no estoque e registro de movimentação ──────────────────────
    const itensVinculados = itensConvertidos.filter(it=>it._prodId);
    if (setProducts && itensVinculados.length > 0) {
      setProducts(prev => prev.map(prod => {
        const it = itensVinculados.find(i=>String(i._prodId)===String(prod.id));
        if (!it) return prod;
        const novoEstoque = Math.max(0, (prod.stock||0) - (it.qty||0));
        return { ...prod, stock: novoEstoque };
      }));
    }
    if (setMovements && itensVinculados.length > 0) {
      setMovements(prev => {
        const base = prev;
        const novos = itensVinculados.map((it, i) => {
          const n = base.map(x=>parseInt(x.id.replace("MOV-",""))||0);
          return {
            id: `MOV-${String(Math.max(0,...n,0)+i+1).padStart(3,"0")}`,
            productId: it._prodId,
            type: "saida",
            qty: it.qty||0,
            date: today(),
            reason: "Venda",
            notes: `Pedido ${newOrderId} · ${cot.customer||""}`.trim(),
          };
        });
        return [...base, ...novos];
      });
    }

    showToast(`✅ Cotação convertida em pedido ${newOrderId}!`);
  };

  const handleDelete = (cot) => {
    if (!canExcluir) return; // segurança extra, além do botão já escondido
    setCotacoes(prev=>prev.filter(c=>c.id!==cot.id));
    setDelConf(null); setDetail(null);
  };

  const today0 = new Date(); today0.setHours(0,0,0,0);
  const getDaysLeft = (validUntil) => {
    if (!validUntil) return null;
    const d = new Date(validUntil+"T12:00:00"); d.setHours(0,0,0,0);
    return Math.round((d-today0)/86400000);
  };

  const filtered = cotacoes
    .filter(c=>filter==="Todos"||c.status===filter)
    .filter(c=>!search||c.customer.toLowerCase().includes(search.toLowerCase())||c.id.toLowerCase().includes(search.toLowerCase()))
    .filter(c=>filterByDate(c))
    .sort((a,b)=>b.date.localeCompare(a.date));

  const counts = COT_STATUS.reduce((acc,s)=>({...acc,[s]:cotacoes.filter(c=>c.status===s).length}),{});
  const totalAberto = cotacoes.filter(c=>["Em Aberto","Aprovada"].includes(c.status)).reduce((s,c)=>s+c.total,0);

  const st = (s) => COT_STATUS_ST[s]||{bg:"bg-gray-100",text:"text-gray-600"};

  // Detail view
  
  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg ${toast.ok?"bg-gray-900":"bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Modal de detalhe da cotação */}
      {detail && (() => {
        const dL = getDaysLeft(detail.validUntil);
        const cvt = detail.status === "Convertida";
        const st2 = (s) => COT_STATUS_ST[s] || { bg:"bg-gray-100", text:"text-gray-600" };
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e)=>{if(e.target===e.currentTarget)setDetail(null);}}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col">
              <div className="flex items-center gap-3 p-5 border-b border-gray-100 shrink-0">
                <div className="flex-1">
                  <p className="text-xs font-mono font-bold text-indigo-500">{detail.id}</p>
                  <h2 className="font-bold text-gray-900 text-lg">{detail.customer}</h2>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st2(detail.status).bg} ${st2(detail.status).text}`}>{detail.status}</span>
                <button onClick={()=>setDetail(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
              </div>
              <div className="overflow-y-auto p-5 space-y-4 flex-1">
                {cvt && <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-2"><span className="text-purple-600 font-medium text-sm">✅ Convertida no pedido</span><span className="font-mono font-bold text-purple-700">{detail.orderId}</span></div>}
                <div className="grid grid-cols-2 gap-3">
                  {[["📅 Data",detail.date],["⏳ Válida até",detail.validUntil||"—"],["💳 Pagamento",detail.payment],["📣 Canal",detail.channel]].map(([label,val])=>(
                    <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 border-b border-gray-50">Itens da Cotação</p>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <th className="px-4 py-2 text-left">Produto</th>
                      <th className="px-4 py-2 text-center">Qtd</th>
                      <th className="px-4 py-2 text-right">Preço Unit.</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr></thead>
                    <tbody>
                      {(detail.items||detail.itemsList||[]).map((it,i)=>(
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-4 py-2.5">{it.description||it.desc||it.sku||"—"}</td>
                          <td className="px-4 py-2.5 text-center">{it.qty||1} {it.unit||"un"}</td>
                          <td className="px-4 py-2.5 text-right">{fmt(it.unitPrice||0)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">{fmt(it.total||0)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="border-t-2 border-gray-200">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-600 text-base">{fmt(detail.total||0)}</td>
                    </tr></tfoot>
                  </table>
                </div>
                {detail.notes && <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">{detail.notes}</div>}
                {!["Convertida","Recusada","Expirada"].includes(detail.status) && canAlterar && (
                  <div className="flex flex-wrap gap-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase w-full">Alterar Status</p>
                    {["Em Aberto","Aprovada","Recusada"].filter(s=>s!==detail.status).map(s=>(
                      <button key={s} onClick={()=>{setCotacoes(prev=>prev.map(c=>c.id===detail.id?{...c,status:s}:c));setDetail(d=>({...d,status:s}));}}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${st2(s).bg} ${st2(s).text}`}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 p-5 border-t border-gray-100 shrink-0 flex-wrap">
                {canAlterar && !["Convertida","Recusada","Expirada"].includes(detail.status) && (
                  <button onClick={()=>{setModal(detail);setDetail(null);}} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Editar</button>
                )}
                {canAlterar && detail.status==="Aprovada" && (
                  <button onClick={()=>{handleConvert(detail);setDetail(null);}} className="flex-1 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">🛒 Converter em Pedido</button>
                )}
                <button onClick={async()=>{const e2=await window.storage.get(EMPRESA_KEY).catch(()=>null);gerarCotacaoPDF(detail,e2&&e2.value?JSON.parse(e2.value):{});}}
                  className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 text-sm font-medium hover:bg-indigo-100">🖨️ PDF</button>
                {canExcluir && detail.status!=="Convertida" && (
                  <button onClick={()=>setDelConf(detail)} className="px-3 py-2 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50">Excluir</button>
                )}
                <button onClick={()=>setDetail(null)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">Fechar</button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cotações</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cotacoes.length} cotação{cotacoes.length!==1?"ões":""} · {fmt(totalAberto)} em aberto</p>
        </div>
        {canIncluir && (
          <button onClick={()=>setModal("new")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
            + Nova Cotação
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        <button onClick={()=>setFilter("Todos")}
          className={`rounded-xl p-2 text-center transition-all border text-xs font-medium ${filter==="Todos"?"bg-gray-800 text-white border-gray-800":"bg-white border-gray-100 text-gray-500 hover:border-gray-200"}`}>
          Todos<br/><span className="font-bold text-base">{cotacoes.length}</span>
        </button>
        {COT_STATUS.map(s=>(
          <button key={s} onClick={()=>setFilter(filter===s?"Todos":s)}
            className={`rounded-xl p-2 text-center transition-all border ${filter===s?"border-indigo-300 shadow-sm":"border-transparent"} ${st(s).bg}`}>
            <p className={`text-lg font-bold ${st(s).text}`}>{counts[s]||0}</p>
            <p className={`text-[10px] font-medium ${st(s).text}`}>{s}</p>
          </button>
        ))}
      </div>

      <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por cliente ou número..."/>

      {/* Date filter */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex gap-1 flex-wrap">
          {[["todos","Todos"],["mes","Mês"],["ano","Ano"],["personalizado","Personalizado"]].map(([id,label])=>(
            <button key={id} onClick={()=>setFilterMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode===id?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {label}
            </button>
          ))}
        </div>
        {(filterMode==="mes"||filterMode==="ano") && (
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize min-w-[150px] text-center">{periodLabel()}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <span className="text-xs text-gray-400">{filtered.length} cotaç{filtered.length!==1?"ões":"ão"}</span>
          </div>
        )}
        {filterMode==="personalizado" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">De:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Até:</label>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
            </div>
            {(dateFrom||dateTo) && (
              <button onClick={()=>{setDateFrom("");setDateTo("");}} className="text-xs text-red-400 hover:text-red-600 font-medium">Limpar</button>
            )}
            <span className="text-xs text-gray-400">{filtered.length} cotaç{filtered.length!==1?"ões":"ão"}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {filtered.length===0 && <div className="text-center py-12 text-gray-400 text-sm">Nenhuma cotação encontrada</div>}
        {filtered.map(c => {
          const daysLeft = getDaysLeft(c.validUntil);
          const expired  = daysLeft!==null && daysLeft<0 && !["Convertida","Recusada","Expirada"].includes(c.status);
          return (
            <div key={c.id} onClick={()=>setDetail(c)}
              className={`bg-white border rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer ${expired?"border-orange-200 bg-orange-50/30":"border-gray-100"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-600">{c.id}</span>
                    <span className="font-semibold text-gray-800 text-sm">{c.customer}</span>
                    <Badge label={c.channel} style={CHANNEL_STYLES[c.channel]||{bg:"bg-gray-100",text:"text-gray-600"}}/>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st(c.status).bg} ${st(c.status).text}`}>{c.status}</span>
                    {c.orderId && <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">→ {c.orderId}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{c.items.map(it=>`${it.description} (${it.qty}${it.unit})`).join(" · ")}</p>
                  <div className="flex gap-3 mt-1 text-[10px] text-gray-400 flex-wrap">
                    <span>📅 {c.date}</span>
                    {c.validUntil && (
                      <span className={expired?"text-orange-500 font-medium":daysLeft===0?"text-amber-500 font-medium":""}>
                        {expired?`⏰ Venceu há ${Math.abs(daysLeft)}d`:
                         daysLeft===0?"⏰ Vence hoje":
                         daysLeft!==null?`⏳ Válida por ${daysLeft}d`:
                         `Válida até ${c.validUntil}`}
                      </span>
                    )}
                    <span>💳 {c.payment}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-base">{fmt(c.total)}</p>
                  {c.discount>0 && <p className="text-[10px] text-green-600">-{fmt(c.discount)} desc.</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && <CotacaoModal cotacao={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={handleSave} customers={customers} products={products} representantes={representantes} formasPagamento={formasPagamento} params={params} currentUser={currentUser}/>}
    </div>
  );
};

// ─── Cadastros Module ──────────────────────────────────────────────────────
const nextCadId = (list, prefix) => {
  const nums = list.map(x => parseInt((x.id||"").replace(`${prefix}-`,"")) || 0);
  return `${prefix}-${String(Math.max(0,...nums)+1).padStart(3,"0")}`;
};

// ── Modal: Representante ───────────────────────────────────────────────────
const RepresentanteModal = ({ rep, onClose, onSave }) => {
  const [form, setForm] = useState(() => ({
    nome:"", cpfCnpj:"", telefone:"", email:"", status:"Ativo",
    tipoComissao:"fixa", comissaoFixa:0, comissaoIncluiFrete:false,
    faixas:[{ ate:5, comissao:10 },{ ate:10, comissao:7 },{ ate:20, comissao:4 }],
    ...(rep||{}),
  }));
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const setFaixa = (i,k,v) => setForm(f=>{
    const faixas = f.faixas.map((fx,idx)=> idx===i ? {...fx,[k]: v===""?"":(parseFloat(v)||0)} : fx);
    return {...f, faixas};
  });
  const addFaixa = () => setForm(f=>({...f, faixas:[...f.faixas, { ate:0, comissao:0 }]}));
  const removeFaixa = (i) => setForm(f=>({...f, faixas: f.faixas.filter((_,idx)=>idx!==i)}));

  const handleSave = () => {
    if (!form.nome.trim()) return;
    // Faixas com "até %" em branco viravam "até 0%" no cálculo e capturavam os
    // pedidos sem desconto com a comissão errada — normaliza: vazio vira 0
    // explícito e faixas totalmente vazias (até 0 E comissão 0) são descartadas.
    const faixasOrdenadas = form.faixas
      .map(fx => ({ ate: Number(fx.ate)||0, comissao: Number(fx.comissao)||0 }))
      .filter(fx => !(fx.ate === 0 && fx.comissao === 0))
      .sort((a,b)=>a.ate-b.ate);
    onSave({ ...form, faixas: faixasOrdenadas });
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">{rep ? "Editar Representante" : "Novo Representante"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={18}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nome *</label>
              <input className={inp} value={form.nome} onChange={e=>set("nome",e.target.value)} placeholder="Nome do representante"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">CPF/CNPJ</label>
              <input className={`${inp} font-mono`} value={form.cpfCnpj} onChange={e=>set("cpfCnpj",fmtCpfCnpj(e.target.value))} placeholder="000.000.000-00" maxLength={18}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Telefone</label>
              <input className={inp} value={form.telefone} onChange={e=>set("telefone",fmtTelefone(e.target.value))} placeholder="(11) 99999-9999" maxLength={16}/>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">E-mail</label>
              <input type="email" className={inp} value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@exemplo.com"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select className={inp} value={form.status} onChange={e=>set("status",e.target.value)}>
                {REPR_STATUS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Comissão</p>
            <div className="flex gap-2">
              <button onClick={()=>set("tipoComissao","fixa")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${form.tipoComissao==="fixa"?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-500 border-gray-200"}`}>
                % Fixa
              </button>
              <button onClick={()=>set("tipoComissao","faixas")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${form.tipoComissao==="faixas"?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-500 border-gray-200"}`}>
                📊 Faixas por Desconto
              </button>
            </div>

            <label className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-indigo-600"
                checked={!!form.comissaoIncluiFrete}
                onChange={e=>set("comissaoIncluiFrete", e.target.checked)}/>
              <span className="text-xs text-gray-600">
                <strong className="text-gray-800">🚚 Comissão inclui frete e taxas</strong><br/>
                Marcado: a comissão é calculada sobre o <strong>total do pedido</strong> (mercadoria + frete + taxas).
                Desmarcado: só sobre a <strong>mercadoria</strong> (itens com desconto).
              </span>
            </label>

            {form.tipoComissao==="fixa" ? (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Comissão (%)</label>
                <input type="number" min="0" max="100" step="0.1" className={`${inp} bg-white`}
                  value={form.comissaoFixa===0?"":form.comissaoFixa}
                  onChange={e=>set("comissaoFixa", e.target.value==="" ? "" : parseFloat(e.target.value))}
                  onBlur={e=>{ if (e.target.value==="") set("comissaoFixa",0); }}/>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-400">Quanto maior o desconto dado pelo representante, menor a comissão.</p>
                {form.faixas.map((fx,i)=>(
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 shrink-0">Até</span>
                    <input type="number" min="0" max="100" step="0.1"
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      value={fx.ate===0?"":fx.ate} onChange={e=>setFaixa(i,"ate",e.target.value)}
                      onBlur={e=>{ if (e.target.value==="") setFaixa(i,"ate",0); }}/>
                    <span className="text-xs text-gray-500 shrink-0">% desconto →</span>
                    <input type="number" min="0" max="100" step="0.1"
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      value={fx.comissao===0?"":fx.comissao} onChange={e=>setFaixa(i,"comissao",e.target.value)}
                      onBlur={e=>{ if (e.target.value==="") setFaixa(i,"comissao",0); }}/>
                    <span className="text-xs text-gray-500 shrink-0">% comissão</span>
                    <button onClick={()=>removeFaixa(i)} className="ml-auto text-red-400 hover:text-red-600">
                      <Icon name="trash" size={14}/>
                    </button>
                  </div>
                ))}
                <button onClick={addFaixa} className="text-xs text-indigo-600 hover:underline font-medium">+ Adicionar faixa</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            {rep ? "Salvar Alterações" : "Criar Representante"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal: Conta Bancária ──────────────────────────────────────────────────
const ContaModal = ({ conta, onClose, onSave }) => {
  const [form, setForm] = useState(() => ({
    banco:"", agencia:"", conta:"", tipo:"Corrente", titular:"", cpfCnpjTitular:"",
    pix:"", principal:false, status:"Ativo",
    ...(conta||{}),
  }));
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = () => {
    if (!form.banco.trim() || !form.titular.trim()) return;
    onSave(form);
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">{conta ? "Editar Conta" : "Nova Conta Bancária"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={18}/></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Banco *</label>
              <input className={inp} list="bancos-br" value={form.banco} onChange={e=>set("banco",e.target.value)} placeholder="Selecione ou digite o banco"/>
              <datalist id="bancos-br">{BANCOS_BR.map(b=><option key={b} value={b}/>)}</datalist>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Agência</label>
              <input className={`${inp} font-mono`} value={form.agencia} onChange={e=>set("agencia",e.target.value)} placeholder="0000"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Conta</label>
              <input className={`${inp} font-mono`} value={form.conta} onChange={e=>set("conta",e.target.value)} placeholder="00000-0"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo</label>
              <select className={inp} value={form.tipo} onChange={e=>set("tipo",e.target.value)}>
                {CONTA_TIPOS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select className={inp} value={form.status} onChange={e=>set("status",e.target.value)}>
                <option>Ativo</option><option>Inativo</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Titular *</label>
              <input className={inp} value={form.titular} onChange={e=>set("titular",e.target.value)} placeholder="Nome do titular da conta"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">CPF/CNPJ do Titular</label>
              <input className={`${inp} font-mono`} value={form.cpfCnpjTitular} onChange={e=>set("cpfCnpjTitular",fmtCpfCnpj(e.target.value))} placeholder="000.000.000-00" maxLength={18}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Chave PIX (opcional)</label>
              <input className={inp} value={form.pix} onChange={e=>set("pix",e.target.value)} placeholder="CPF, e-mail, telefone..."/>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={!!form.principal} onChange={e=>set("principal",e.target.checked)} className="rounded text-indigo-600"/>
            <span className="text-sm text-gray-600">Conta principal da empresa</span>
          </label>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            {conta ? "Salvar Alterações" : "Criar Conta"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal: Forma de Pagamento ────────────────────────────────────────────────
const FormaPagamentoModal = ({ fp, onClose, onSave, contas=[] }) => {
  const [form, setForm] = useState(() => ({
    nome:"", taxa:0, prazoRecebimento:0, contaId:"", status:"Ativo",
    ...(fp||{}),
  }));
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = () => {
    if (!form.nome.trim()) return;
    onSave(form);
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">{fp ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={18}/></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Nome *</label>
            <input className={inp} value={form.nome} onChange={e=>set("nome",e.target.value)} placeholder="Ex: Pix, Cartão de Crédito, Depósito..."/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Taxa (%)</label>
              <input type="number" min="0" max="100" step="0.01" className={inp} value={form.taxa===0?"":form.taxa}
                onChange={e=>set("taxa", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                onBlur={e=>{ if (e.target.value==="") set("taxa",0); }} placeholder="0,00"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Prazo Recebimento (dias)</label>
              <input type="number" min="0" className={inp} value={form.prazoRecebimento===0?"":form.prazoRecebimento}
                onChange={e=>set("prazoRecebimento", e.target.value===""?"":(parseInt(e.target.value)||0))}
                onBlur={e=>{ if (e.target.value==="") set("prazoRecebimento",0); }} placeholder="0"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Conta de Recebimento (opcional)</label>
            <select className={inp} value={form.contaId} onChange={e=>set("contaId",e.target.value)}>
              <option value="">— Não vincular —</option>
              {contas.map(c=><option key={c.id} value={c.id}>{c.banco} · {c.titular}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
            <select className={inp} value={form.status} onChange={e=>set("status",e.target.value)}>
              {FORMAPAG_STATUS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            {fp ? "Salvar Alterações" : "Criar Forma de Pagamento"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Parser de códigos: aceita separados por vírgula, espaço ou linha; remove vazios e duplicados
function parseVariantCodes(text) {
  const codes = (text||"").split(/[\n,]+/).map(c=>c.trim()).filter(Boolean);
  return [...new Set(codes)];
}

const VariantCatalogModal = ({ catalog, onClose, onSave }) => {
  const [nome, setNome] = useState(catalog?.nome || "");
  const [codigosText, setCodigosText] = useState((catalog?.codigos||[]).join("\n"));
  const [err, setErr] = useState("");
  const codigos = useMemo(() => parseVariantCodes(codigosText), [codigosText]);

  const handleSave = () => {
    if (!nome.trim()) { setErr("Dê um nome pro catálogo (ex: Cores Linha 120)"); return; }
    if (codigos.length === 0) { setErr("Cole pelo menos um código"); return; }
    onSave({ ...(catalog||{}), nome: nome.trim(), codigos });
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">{catalog ? "Editar Catálogo de Variante" : "Novo Catálogo de Variante"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={18}/></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Nome do catálogo *</label>
            <input className={inp} value={nome} onChange={e=>{setNome(e.target.value); setErr("");}} placeholder="Ex: Cores Linha 120, Tamanhos Padrão..."/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Códigos das variações *</label>
            <textarea rows={6} className={`${inp} font-mono resize-none`} value={codigosText}
              onChange={e=>{setCodigosText(e.target.value); setErr("");}}
              placeholder={"Cole um código por linha (ou separados por vírgula):\n000\n001\n002\n..."}/>
            <p className="text-[11px] text-gray-400 mt-1">{codigos.length} código(s) identificado(s){codigos.length>0 && ` — ex: ${codigos.slice(0,4).join(", ")}${codigos.length>4?"...":""}`}</p>
          </div>
          {err && <p className="text-xs text-red-500">⚠️ {err}</p>}
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2.5">
            💡 Esse catálogo é só um molde: ao aplicá-lo num produto (na tela de Estoque), você escolhe quais códigos usar e o sistema gera uma variante pra cada um. Alterar o catálogo depois não afeta variantes já criadas.
          </p>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            {catalog ? "Salvar Alterações" : "Criar Catálogo"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MovimentosModule — Fechamento/Faturamento de Comissão dos Representantes ──
const MovimentosModule = ({ orders=[], representantes=[], fechamentos=[], setFechamentos, finance=[], setFinance, params, currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "movimentos", "incluir");
  const canAlterar = getUserPerm(currentUser, "movimentos", "alterar");
  const [period, setPeriod] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
  });
  const [showHistorico, setShowHistorico] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [faturando, setFaturando] = useState({});

  // Cancelado e Devolvido nunca comissionam — antes, um pedido pago e depois
  // cancelado (ou devolvido) continuava elegível e entrava no fechamento.
  const isEligible = (o) => o.status !== "Cancelado" && o.status !== "Devolvido" && (statusDelivered(params, o.status) || !!o.paidDate);

  const periodLabel = (() => {
    const [y,m] = period.split("-");
    return new Date(Number(y), Number(m)-1, 1).toLocaleDateString("pt-BR", { month:"long", year:"numeric" });
  })();

  const repBlocks = useMemo(() => {
    const byRep = {};
    orders.forEach(o => {
      if (!o.representanteId || !o.date || !o.date.startsWith(period) || !isEligible(o)) return;
      (byRep[o.representanteId] = byRep[o.representanteId]||[]).push(o);
    });
    return Object.entries(byRep).map(([repId, ords]) => {
      const rep = representantes.find(r=>r.id===repId);
      if (!rep) return null;
      const items = ords.map(o => {
        const gross = (o.itemsList||[]).reduce((s,it)=>s+((it.qty||0)*(it.unitPrice||0)),0);
        const net   = (o.itemsList||[]).reduce((s,it)=>s+(it.total||0),0);
        const discPercent = gross>0 ? Math.max(0,(1-net/gross)*100) : 0;
        const comissaoPercent = comissaoAplicavel(rep, discPercent);
        // Base da comissão conforme o acordo do representante (checkbox no
        // cadastro): marcado = total do pedido (inclui frete/taxas);
        // desmarcado (padrão) = só a mercadoria (itens com desconto).
        const baseComissao = rep.comissaoIncluiFrete ? (Number(o.total)||0) : net;
        const comissaoValor = baseComissao * (comissaoPercent/100);
        return { order:o, discPercent, comissaoPercent, comissaoValor, baseComissao };
      }).sort((a,b)=>(a.order.date||"").localeCompare(b.order.date||""));
      const totalComissao = items.reduce((s,it)=>s+it.comissaoValor,0);
      const fech = fechamentos.find(f=>f.representanteId===repId && f.periodo===period);
      return { rep, items, totalComissao, fech };
    }).filter(Boolean).sort((a,b)=>a.rep.nome.localeCompare(b.rep.nome));
  }, [orders, representantes, fechamentos, period]);

  const handleFaturar = (block) => {
    if (!canIncluir) return; // segurança extra, além do botão já escondido
    if (faturando[block.rep.id] || block.fech) return;
    setFaturando(f=>({...f,[block.rep.id]:true}));
    const finNums = finance.map(f=>parseInt((f.id||"").replace("FIN-",""))||0);
    const newFinId = `FIN-${String(Math.max(0,...finNums,0)+1).padStart(3,"0")}`;

    setFinance(prev => [{
      id: newFinId,
      type: "despesa",
      category: "Comissão de Representantes",
      description: `Comissão - ${block.rep.nome} (${periodLabel})`,
      amount: block.totalComissao,
      date: today(),
      dueDate: addDaysISO(today(), 5),
      status: "pendente",
      notes: `Fechamento de comissão referente a ${block.items.length} pedido(s) do período ${period}.`,
      representanteId: block.rep.id,
    }, ...prev]);

    const novo = {
      id: `FCH-${Date.now()}`,
      representanteId: block.rep.id,
      representanteNome: block.rep.nome,
      periodo: period,
      valorTotal: block.totalComissao,
      qtdPedidos: block.items.length,
      pedidosIds: block.items.map(it=>it.order.id),
      dataFechamento: today(),
      finLancamentoId: newFinId,
    };
    setFechamentos(prev => [...prev.filter(f=>!(f.representanteId===block.rep.id && f.periodo===period)), novo]);
  };

  const handleReabrir = (block) => {
    if (!canAlterar) return; // segurança extra, além do botão já escondido
    const fin = finance.find(f=>f.id===block.fech.finLancamentoId);
    if (fin && fin.status === "pago") {
      alert("O lançamento financeiro dessa comissão já foi marcado como pago no Financeiro. Reabrindo o fechamento aqui, mas o lançamento não será removido — ajuste manualmente se necessário.");
    } else if (fin) {
      setFinance(prev => prev.filter(f=>f.id!==fin.id));
    }
    setFechamentos(prev => prev.filter(f=>!(f.representanteId===block.rep.id && f.periodo===period)));
    setFaturando(f=>{ const n={...f}; delete n[block.rep.id]; return n; });
  };

  const historico = useMemo(() =>
    fechamentos.slice().sort((a,b)=>(b.periodo+b.dataFechamento).localeCompare(a.periodo+a.dataFechamento))
  , [fechamentos]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Movimentos</h1>
          <p className="text-sm text-gray-500">Fechamento de comissão dos representantes · {periodLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={period} onChange={e=>setPeriod(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
          <button onClick={()=>setShowHistorico(v=>!v)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${showHistorico?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            📜 Histórico
          </button>
        </div>
      </div>

      {showHistorico && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {historico.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum fechamento registrado ainda</p>
          ) : historico.map(f => {
            const [y,m] = f.periodo.split("-");
            const lbl = new Date(Number(y),Number(m)-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
            return (
              <div key={f.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{f.representanteNome}</p>
                  <p className="text-xs text-gray-400">{lbl} · {f.qtdPedidos||f.pedidosIds?.length||0} pedido(s) · faturado em {new Date(f.dataFechamento+"T00:00:00").toLocaleDateString("pt-BR")}{f.finLancamentoId?` · lançamento ${f.finLancamentoId}`:""}</p>
                </div>
                <p className="text-sm font-bold text-indigo-600">{fmt(f.valorTotal)}</p>
              </div>
            );
          })}
        </div>
      )}

      {repBlocks.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-3xl mb-2">🧾</p>
          <p className="text-sm text-gray-500">Nenhum pedido elegível (Entregue/Pago) com representante nesse período</p>
        </div>
      ) : (
        <div className="space-y-3">
          {repBlocks.map(block => {
            const isOpen = !collapsed[block.rep.id];
            const fechado = !!block.fech;
            // O fechamento congela o valor, mas os pedidos do período seguem
            // vivos: pedido que virou Entregue depois, ou foi cancelado depois,
            // faz o total recalculado divergir do fechado — sem esse aviso, a
            // divergência ficava invisível (o botão de faturar já sumiu).
            const divergiuFechamento = fechado && Math.abs((block.totalComissao||0) - (block.fech.valorTotal||0)) > 0.005;
            return (
              <div key={block.rep.id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${fechado?"border-green-200":"border-gray-100"}`}>
                <button onClick={()=>setCollapsed(c=>({...c,[block.rep.id]:isOpen}))}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs shrink-0 transition-transform ${isOpen?"rotate-90":"rotate-0"}`}>▶</span>
                    <span className="font-semibold text-sm text-gray-800 truncate">{block.rep.nome}</span>
                    {fechado && <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium shrink-0">🧾 Faturado</span>}
                    {divergiuFechamento && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0" title={`Fechado em ${fmt(block.fech.valorTotal||0)} · recalculado agora: ${fmt(block.totalComissao)}`}>⚠️ Período mudou após o fechamento — reabra para ajustar</span>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400">{block.items.length} pedido(s)</span>
                    <span className="font-bold text-indigo-600">{fmt(block.totalComissao)}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[11px] text-gray-400 uppercase border-b border-gray-50">
                            <th className="text-left px-4 py-2 font-medium">Pedido</th>
                            <th className="text-left px-4 py-2 font-medium">Data</th>
                            <th className="text-left px-4 py-2 font-medium">Cliente</th>
                            <th className="text-right px-4 py-2 font-medium">Total</th>
                            <th className="text-right px-4 py-2 font-medium">Desconto</th>
                            <th className="text-right px-4 py-2 font-medium">Comissão %</th>
                            <th className="text-right px-4 py-2 font-medium">Comissão R$</th>
                          </tr>
                        </thead>
                        <tbody>
                          {block.items.map(it => (
                            <tr key={it.order.id} className="border-b border-gray-50 last:border-0">
                              <td className="px-4 py-2 font-mono text-xs text-gray-500">{it.order.id}</td>
                              <td className="px-4 py-2 text-xs text-gray-500">{new Date(it.order.date+"T00:00:00").toLocaleDateString("pt-BR")}</td>
                              <td className="px-4 py-2 text-gray-700 truncate max-w-[180px]">{it.order.customer}</td>
                              <td className="px-4 py-2 text-right text-gray-700">{fmt(it.order.total)}</td>
                              <td className="px-4 py-2 text-right text-gray-400">{it.discPercent.toFixed(1)}%</td>
                              <td className="px-4 py-2 text-right text-gray-500">{it.comissaoPercent.toFixed(1)}%</td>
                              <td className="px-4 py-2 text-right font-semibold text-indigo-600">{fmt(it.comissaoValor)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                      <p className="text-sm text-gray-500">Total do período: <span className="font-bold text-gray-800">{fmt(block.totalComissao)}</span></p>
                      {fechado ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Faturado em {new Date(block.fech.dataFechamento+"T00:00:00").toLocaleDateString("pt-BR")} · lançamento {block.fech.finLancamentoId} em Contas a Pagar</span>
                          {canAlterar && <button onClick={()=>handleReabrir(block)} className="text-xs text-amber-600 hover:underline font-medium">Reabrir</button>}
                        </div>
                      ) : canIncluir ? (
                        <button onClick={()=>handleFaturar(block)} disabled={!!faturando[block.rep.id]}
                          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          {faturando[block.rep.id] ? "Faturando..." : "🧾 Faturar"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CadastrosModule = ({ representantes=[], setRepresentantes, contas=[], setContas, formasPagamento=[], setFormasPagamento, variantCatalogs=[], setVariantCatalogs, orders=[], fechamentos=[], currentUser }) => {
  const canIncluir = getUserPerm(currentUser, "cadastros", "incluir");
  const canAlterar = getUserPerm(currentUser, "cadastros", "alterar");
  const canExcluir = getUserPerm(currentUser, "cadastros", "excluir");
  const [tab, setTab]         = useState("representantes");
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]     = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3000); };

  // ── Representantes ──
  const filteredReps = useMemo(() => representantes.filter(r =>
    !search || [r.nome,r.cpfCnpj,r.email].some(f=>f?.toLowerCase().includes(search.toLowerCase()))
  ), [representantes, search]);

  const saveRep = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) setRepresentantes(prev=>prev.map(r=>r.id===data.id?data:r));
    else setRepresentantes(prev=>[...prev, {...data, id:nextCadId(prev,"REP")}]);
    setModal(null);
    showToast(data.id ? "✅ Representante atualizado!" : "✅ Representante cadastrado!");
  };
  const deleteRep = (r) => { if(!canExcluir) return; setRepresentantes(prev=>prev.filter(x=>x.id!==r.id)); setConfirmDelete(null); showToast("🗑️ Representante removido"); };

  // ── Contas ──
  const filteredContas = useMemo(() => contas.filter(c =>
    !search || [c.banco,c.titular,c.agencia,c.conta].some(f=>f?.toLowerCase().includes(search.toLowerCase()))
  ), [contas, search]);

  const saveConta = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) setContas(prev=>prev.map(c=>c.id===data.id?data:c));
    else setContas(prev=>[...prev, {...data, id:nextCadId(prev,"CTA")}]);
    setModal(null);
    showToast(data.id ? "✅ Conta atualizada!" : "✅ Conta cadastrada!");
  };
  const deleteConta = (c) => { if(!canExcluir) return; setContas(prev=>prev.filter(x=>x.id!==c.id)); setConfirmDelete(null); showToast("🗑️ Conta removida"); };

  // ── Formas de Pagamento ──
  const filteredFP = useMemo(() => formasPagamento.filter(f =>
    !search || f.nome?.toLowerCase().includes(search.toLowerCase())
  ), [formasPagamento, search]);

  const saveFP = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) setFormasPagamento(prev=>prev.map(f=>f.id===data.id?data:f));
    else setFormasPagamento(prev=>[...prev, {...data, id:nextCadId(prev,"FPG")}]);
    setModal(null);
    showToast(data.id ? "✅ Forma de pagamento atualizada!" : "✅ Forma de pagamento cadastrada!");
  };
  const deleteFP = (f) => { if(!canExcluir) return; setFormasPagamento(prev=>prev.filter(x=>x.id!==f.id)); setConfirmDelete(null); showToast("🗑️ Forma de pagamento removida"); };

  // ── Catálogo de Variante ──
  const filteredCatalogos = useMemo(() => variantCatalogs.filter(c =>
    !search || c.nome?.toLowerCase().includes(search.toLowerCase())
  ), [variantCatalogs, search]);

  const saveCatalogo = (data) => {
    if (data.id ? !canAlterar : !canIncluir) return; // segurança extra, além dos botões já escondidos
    if (data.id) setVariantCatalogs(prev=>prev.map(c=>c.id===data.id?data:c));
    else setVariantCatalogs(prev=>[...prev, {...data, id:nextCadId(prev,"VCT")}]);
    setModal(null);
    showToast(data.id ? "✅ Catálogo atualizado!" : "✅ Catálogo cadastrado!");
  };
  const deleteCatalogo = (c) => { if(!canExcluir) return; setVariantCatalogs(prev=>prev.filter(x=>x.id!==c.id)); setConfirmDelete(null); showToast("🗑️ Catálogo removido"); };

  const newLabel = { representantes:"Representante", contas:"Conta", formaspagamento:"Forma de Pagamento", catalogovariante:"Catálogo" }[tab];

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cadastros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Representantes, contas bancárias e formas de pagamento</p>
        </div>
        {canIncluir && (
          <button onClick={()=>setModal("new")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-1.5">
            <Icon name="plus" size={15}/> {newLabel}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5 overflow-x-auto">
        {[["representantes","🧑‍💼 Representantes"],["contas","🏦 Bancos e Contas"],["formaspagamento","💳 Forma de Pagamento"],["catalogovariante","🎨 Catálogo de Variante"]].map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id);setSearch("");}}
            className={`shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${tab===id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* ══ TAB: REPRESENTANTES ══ */}
      {tab==="representantes" && (
        filteredReps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <p className="text-3xl mb-2">🧑‍💼</p>
            <p className="text-sm text-gray-400">Nenhum representante cadastrado</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="col-span-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Nome</span>
              <span className="col-span-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Contato</span>
              <span className="col-span-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Comissão</span>
              <span className="col-span-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</span>
              <span className="col-span-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Ações</span>
            </div>
            {filteredReps.map(r=>(
              <Fragment key={r.id}>
                {/* Linha em tabela — telas md+ */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50">
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-gray-800">{r.nome}</p>
                    <p className="text-[11px] text-gray-400">{r.cpfCnpj || "—"}</p>
                  </div>
                  <div className="col-span-3 text-xs text-gray-500">
                    <p>{r.telefone || "—"}</p>
                    <p className="truncate">{r.email || "—"}</p>
                  </div>
                  <div className="col-span-3 text-xs text-gray-600">
                    {r.tipoComissao==="fixa"
                      ? <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{r.comissaoFixa}% fixa</span>
                      : <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">{(r.faixas||[]).length} faixa(s)</span>}
                  </div>
                  <div className="col-span-1">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${r.status==="Ativo"?"bg-green-50 text-green-600":"bg-gray-100 text-gray-400"}`}>{r.status}</span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-2">
                    {canAlterar && <button onClick={()=>setModal(r)} className="text-gray-400 hover:text-indigo-600"><Icon name="edit" size={15}/></button>}
                    {canExcluir && <button onClick={()=>setConfirmDelete({type:"rep",item:r})} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={15}/></button>}
                  </div>
                </div>
                {/* Card — mobile */}
                <div className="md:hidden flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.nome}</p>
                    <p className="text-[11px] text-gray-400">{r.cpfCnpj || "—"}</p>
                    <p className="text-xs text-gray-500 mt-1.5">{r.telefone || "—"}</p>
                    <p className="text-xs text-gray-500 truncate">{r.email || "—"}</p>
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {r.tipoComissao==="fixa"
                        ? <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{r.comissaoFixa}% fixa</span>
                        : <span className="text-[11px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">{(r.faixas||[]).length} faixa(s)</span>}
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${r.status==="Ativo"?"bg-green-50 text-green-600":"bg-gray-100 text-gray-400"}`}>{r.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2.5 shrink-0 pt-0.5">
                    {canAlterar && <button onClick={()=>setModal(r)} className="text-gray-400 hover:text-indigo-600"><Icon name="edit" size={16}/></button>}
                    {canExcluir && <button onClick={()=>setConfirmDelete({type:"rep",item:r})} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={16}/></button>}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        )
      )}

      {/* ══ TAB: CONTAS ══ */}
      {tab==="contas" && (
        filteredContas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <p className="text-3xl mb-2">🏦</p>
            <p className="text-sm text-gray-400">Nenhuma conta cadastrada</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="col-span-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Banco</span>
              <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Agência/Conta</span>
              <span className="col-span-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Titular</span>
              <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</span>
              <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Ações</span>
            </div>
            {filteredContas.map(c=>(
              <Fragment key={c.id}>
                {/* Linha em tabela — telas md+ */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50">
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-gray-800">{c.banco}</p>
                    <p className="text-[11px] text-gray-400">{c.tipo}</p>
                  </div>
                  <div className="col-span-2 text-xs text-gray-500 font-mono">
                    <p>Ag {c.agencia || "—"}</p>
                    <p>CC {c.conta || "—"}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-700">{c.titular}</p>
                    {c.principal && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">★ principal</span>}
                  </div>
                  <div className="col-span-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.status==="Ativo"?"bg-green-50 text-green-600":"bg-gray-100 text-gray-400"}`}>{c.status}</span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    {canAlterar && <button onClick={()=>setModal(c)} className="text-gray-400 hover:text-indigo-600"><Icon name="edit" size={15}/></button>}
                    {canExcluir && <button onClick={()=>setConfirmDelete({type:"conta",item:c})} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={15}/></button>}
                  </div>
                </div>
                {/* Card — mobile */}
                <div className="md:hidden flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{c.banco} <span className="text-[11px] text-gray-400 font-normal">· {c.tipo}</span></p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Ag {c.agencia || "—"} · CC {c.conta || "—"}</p>
                    <p className="text-xs text-gray-600 mt-1">{c.titular}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      {c.principal && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">★ principal</span>}
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.status==="Ativo"?"bg-green-50 text-green-600":"bg-gray-100 text-gray-400"}`}>{c.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2.5 shrink-0 pt-0.5">
                    {canAlterar && <button onClick={()=>setModal(c)} className="text-gray-400 hover:text-indigo-600"><Icon name="edit" size={16}/></button>}
                    {canExcluir && <button onClick={()=>setConfirmDelete({type:"conta",item:c})} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={16}/></button>}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        )
      )}

      {/* ══ TAB: FORMA DE PAGAMENTO ══ */}
      {tab==="formaspagamento" && (
        filteredFP.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-sm text-gray-400">Nenhuma forma de pagamento cadastrada</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="col-span-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Nome</span>
              <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Taxa</span>
              <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Prazo</span>
              <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</span>
              <span className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Ações</span>
            </div>
            {filteredFP.map(f=>{
              const conta = contas.find(c=>c.id===f.contaId);
              return (
                <div key={f.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50">
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-gray-800">{f.nome}</p>
                    {conta && <p className="text-[11px] text-gray-400">→ {conta.banco}</p>}
                  </div>
                  <div className="col-span-2 text-xs text-gray-600 text-right font-mono">{(f.taxa||0).toFixed(2)}%</div>
                  <div className="col-span-2 text-xs text-gray-600 text-right">{f.prazoRecebimento||0}d</div>
                  <div className="col-span-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${f.status==="Ativo"?"bg-green-50 text-green-600":"bg-gray-100 text-gray-400"}`}>{f.status}</span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    {canAlterar && <button onClick={()=>setModal(f)} className="text-gray-400 hover:text-indigo-600"><Icon name="edit" size={15}/></button>}
                    {canExcluir && <button onClick={()=>setConfirmDelete({type:"fp",item:f})} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={15}/></button>}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab==="catalogovariante" && (
        filteredCatalogos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <p className="text-3xl mb-2">🎨</p>
            <p className="text-sm text-gray-400">Nenhum catálogo de variante cadastrado</p>
            <p className="text-xs text-gray-300 mt-1">Cadastre uma lista de códigos (ex: cores) pra reaproveitar em vários produtos</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredCatalogos.map(c=>(
              <div key={c.id} className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{c.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(c.codigos||[]).length} código(s)</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(c.codigos||[]).slice(0,12).map(cod=>(
                      <span key={cod} className="text-[10px] font-mono bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded">{cod}</span>
                    ))}
                    {(c.codigos||[]).length>12 && <span className="text-[10px] text-gray-400">+{c.codigos.length-12}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 pt-0.5">
                  {canAlterar && <button onClick={()=>setModal(c)} className="text-gray-400 hover:text-indigo-600"><Icon name="edit" size={15}/></button>}
                  {canExcluir && <button onClick={()=>setConfirmDelete({type:"catalogo",item:c})} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={15}/></button>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modais */}
      {modal && tab==="representantes" && (
        <RepresentanteModal rep={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={saveRep}/>
      )}
      {modal && tab==="contas" && (
        <ContaModal conta={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={saveConta}/>
      )}
      {modal && tab==="formaspagamento" && (
        <FormaPagamentoModal fp={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={saveFP} contas={contas}/>
      )}
      {modal && tab==="catalogovariante" && (
        <VariantCatalogModal catalog={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={saveCatalogo}/>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <p className="font-bold text-gray-900 mb-1">Confirmar exclusão</p>
            <p className="text-sm text-gray-500 mb-4">
              {confirmDelete.type==="rep" && `Remover o representante "${confirmDelete.item.nome}"?`}
              {confirmDelete.type==="conta" && `Remover a conta "${confirmDelete.item.banco} - ${confirmDelete.item.titular}"?`}
              {confirmDelete.type==="fp" && `Remover a forma de pagamento "${confirmDelete.item.nome}"?`}
              {confirmDelete.type==="catalogo" && `Remover o catálogo "${confirmDelete.item.nome}"? Produtos já gerados a partir dele não são afetados.`}
            </p>
            {(() => {
              // Aviso de vínculos: excluir um representante com pedidos faz os
              // pedidos dele SUMIREM do fechamento de comissões (o bloco é
              // descartado quando o rep não existe); excluir uma conta deixa
              // formas de pagamento apontando pra conta inexistente.
              if (confirmDelete.type==="rep") {
                const nPed = orders.filter(o=>o.representanteId===confirmDelete.item.id).length;
                const nFch = fechamentos.filter(f=>f.representanteId===confirmDelete.item.id).length;
                if (nPed>0 || nFch>0) return (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                    ⚠️ Este representante tem <strong>{nPed} pedido(s)</strong>{nFch>0?<> e <strong>{nFch} fechamento(s) de comissão</strong></>:null} vinculado(s).
                    Ao excluir, os pedidos dele <strong>deixam de aparecer no fechamento de comissões</strong> e o histórico perde a referência.
                  </p>
                );
              }
              if (confirmDelete.type==="conta") {
                const nFp = formasPagamento.filter(f=>f.contaId===confirmDelete.item.id).length;
                if (nFp>0) return (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                    ⚠️ Esta conta está vinculada a <strong>{nFp} forma(s) de pagamento</strong> — elas ficarão sem conta de destino.
                  </p>
                );
              }
              return null;
            })()}
            <div className="flex gap-2">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={()=>{
                if (confirmDelete.type==="rep") deleteRep(confirmDelete.item);
                else if (confirmDelete.type==="conta") deleteConta(confirmDelete.item);
                else if (confirmDelete.type==="catalogo") deleteCatalogo(confirmDelete.item);
                else deleteFP(confirmDelete.item);
              }} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Params Module ────────────────────────────────────────────────────────
const CHANNEL_EMOJI_MAP = { "Mercado Livre":"🛒","Shopee":"🛍️","WhatsApp":"💬","Loja Própria":"🏪" };
const CHANNEL_DOT_COLOR = { "Mercado Livre":"bg-yellow-500","Shopee":"bg-orange-500","WhatsApp":"bg-green-500","Loja Própria":"bg-blue-500" };

const ParamsModule = ({ params, setParams, onSaveEmpresa, orders, setOrders, currentUser }) => {
  const canAlterar = getUserPerm(currentUser, "parametros", "alterar");
  const [tab, setTab]       = useState("empresa");
  const [toast, setToast]   = useState(null);
  const [revealed, setRevealed] = useState({});

  // Empresa tab — usa EMPRESA_KEY (mesma chave que EmpresaModule)
  const [empresa, setEmpresa]     = useState(EMPRESA_EMPTY);
  const [empLoading, setEmpLoading] = useState(true);
  const [logo, setLogo] = useState(null);
  const [logoSaved, setLogoSaved] = useState(false);
  const fileRef = useRef(null);

  // Params locais editáveis
  const [canais,  setCanais]  = useState(params?.canais        || PARAMS_DEFAULT.canais);
  const [alertas, setAlertas] = useState(params?.alertas       || PARAMS_DEFAULT.alertas);
  const [sync,    setSync]    = useState(params?.sincronizacao || PARAMS_DEFAULT.sincronizacao);
  const [vendas,  setVendas]  = useState(params?.vendas        || PARAMS_DEFAULT.vendas);
  const [fiscal,  setFiscal]  = useState(params?.fiscal        || PARAMS_DEFAULT.fiscal);
  const [compras, setCompras] = useState(params?.compras       || PARAMS_DEFAULT.compras);

  useEffect(() => {
    if (params) {
      setCanais(params.canais        || PARAMS_DEFAULT.canais);
      setAlertas(params.alertas      || PARAMS_DEFAULT.alertas);
      setSync(params.sincronizacao   || PARAMS_DEFAULT.sincronizacao);
      setVendas(params.vendas        || PARAMS_DEFAULT.vendas);
      setCompras(params.compras      || PARAMS_DEFAULT.compras);
      setFiscal(params.fiscal        || PARAMS_DEFAULT.fiscal); // única seção que faltava na re-sincronização
    }
  }, [params]);

  useEffect(() => {
    Promise.all([
      window.storage.get(EMPRESA_KEY).catch(()=>null),
      window.storage.get(LOGO_KEY).catch(()=>null),
    ]).then(([r, l]) => {
      if (r?.value) setEmpresa(prev => ({...prev,...JSON.parse(r.value)}));
      if (l?.value) setLogo(l.value);
      setEmpLoading(false);
    });
  }, []);

  const handleLogoUpload = (e) => {
    if (!canAlterar) return; // segurança extra, além do botão já escondido
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert("Imagem muito grande. Use uma imagem menor que 500KB."); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setLogo(base64);
      try {
        await window.storage.set(LOGO_KEY, base64);
        window.dispatchEvent(new CustomEvent("erp:logo-updated", { detail: { logo: base64 } }));
        setLogoSaved(true);
        setTimeout(()=>setLogoSaved(false), 2500);
      } catch (err) {
        alert("⚠️ Falha ao salvar o logo — verifique sua conexão e tente novamente.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = async () => {
    if (!canAlterar) return; // segurança extra, além do botão já escondido
    const anterior = logo;
    setLogo(null);
    try {
      await window.storage.delete(LOGO_KEY);
      window.dispatchEvent(new CustomEvent("erp:logo-updated", { detail: { logo: null } }));
    } catch (err) {
      setLogo(anterior);
      alert("⚠️ Falha ao remover o logo — verifique sua conexão e tente novamente.");
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2500); };
  const setE = (k,v) => setEmpresa(f=>({...f,[k]:v}));
  const [cepLoadingEmp, setCepLoadingEmp] = useState(false);
  const [cepErrorEmp,   setCepErrorEmp]   = useState("");
  const handleCepChangeEmp = (e) => {
    const raw = e.target.value.replace(/\D/g,"").slice(0,8);
    setE("cep", fmtCepGlobal(raw));
    if (raw.length === 8) buscarCepEmpresa(raw);
  };
  const buscarCepEmpresa = async (cep) => {
    setCepLoadingEmp(true); setCepErrorEmp("");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) { setCepErrorEmp("CEP não encontrado"); setCepLoadingEmp(false); return; }
      setE("rua",    d.logradouro||"");
      setE("bairro", d.bairro||"");
      setE("cidade", d.localidade||"");
      setE("estado", d.uf||"");
      setCepErrorEmp("");
    } catch { setCepErrorEmp("Erro ao buscar CEP"); }
    setCepLoadingEmp(false);
  };
  const setC = (ch,k,v) => setCanais(prev=>({...prev,[ch]:{...prev[ch],[k]:v}}));
  const setA = (k,v) => setAlertas(prev=>({...prev,[k]:v}));
  const setV = (k,v) => setVendas(prev=>({...prev,[k]:v}));
  const setFisc = (k,v) => setFiscal(prev=>({...prev,[k]:v}));
  const setS = (plat,k,v) => setSync(prev =>
    k==="backendUrl" ? {...prev,backendUrl:v} : {...prev,[plat]:{...prev[plat],[k]:v}}
  );

  const handleSaveEmpresa = async () => {
    if (!canAlterar) return; // segurança extra, além do botão já escondido
    await window.storage.set(EMPRESA_KEY, JSON.stringify(empresa)).catch(()=>{});
    if (onSaveEmpresa) onSaveEmpresa(empresa);
    showToast("✅ Dados da empresa salvos!");
  };

  const mergeAndSave = async (patch) => {
    if (!canAlterar) return; // segurança extra, além dos botões já escondidos
    const next = { ...(params||PARAMS_DEFAULT), ...patch };
    await saveParams(next);
    setParams(next);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white";

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-pulse">{toast}</div>}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 shadow-md">
          <Icon name="settings" size={18} className="text-white"/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Parâmetros do Sistema</h1>
          <p className="text-sm text-gray-500">Configurações gerais da MM Armarinhos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5 overflow-x-auto">
        {[["empresa","🏢 Empresa"],["canais","💳 Canais"],["vendas","🛒 Vendas"],["compras","📦 Compras"],["fiscal","📄 Fiscal"],["alertas","🔔 Alertas"],["sync","🔗 Sincronização"],["automacao","🤖 Automação"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${tab===id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ TAB: EMPRESA ══════════════════════════════════════════════ */}
      {tab==="empresa" && (
        empLoading
          ? <div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/></div>
          : <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">🖼️ Logo da Empresa</p>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
                    {logo
                      ? <img src={logo} alt="Logo" className="w-full h-full object-contain p-1"/>
                      : <div className="text-gray-300 text-center text-xs">Sem logo</div>
                    }
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-gray-600">
                      Aparece na barra lateral do sistema e nos documentos gerados (pedidos, cotações). Não altera a tela de login.
                    </p>
                    <p className="text-xs text-gray-400">PNG ou JPG · máximo 500KB · recomendado 200×200px</p>
                    <div className="flex gap-2 flex-wrap items-center">
                      {canAlterar && (
                        <>
                          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            className="hidden" onChange={handleLogoUpload}/>
                          <button onClick={()=>fileRef.current?.click()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                            {logo ? "Trocar Logo" : "Carregar Logo"}
                          </button>
                        </>
                      )}
                      {logo && canAlterar && (
                        <button onClick={handleLogoRemove}
                          className="px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                          Remover
                        </button>
                      )}
                      {logoSaved && <span className="text-xs text-green-600 font-medium">✓ Salvo!</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">🏛 Identificação</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Razão Social</label>
                    <input className={inp} value={empresa.razaoSocial||""} onChange={e=>setE("razaoSocial",e.target.value)} placeholder="MM Armarinhos Ltda"/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Nome Fantasia</label>
                    <input className={inp} value={empresa.nomeFantasia||""} onChange={e=>setE("nomeFantasia",e.target.value)} placeholder="MM Armarinhos"/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">CNPJ</label>
                    <input className={`${inp} font-mono`} value={empresa.cnpj||""} onChange={e=>setE("cnpj",fmtCpfCnpj(e.target.value))} placeholder="00.000.000/0001-00" maxLength={18}/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Inscrição Estadual</label>
                    <input className={`${inp} font-mono`} value={empresa.ie||""} onChange={e=>setE("ie",fmtIE(e.target.value))} placeholder="000.000.000.000" maxLength={15}/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Regime Tributário</label>
                    <select className={inp} value={empresa.regime||"Simples Nacional"} onChange={e=>setE("regime",e.target.value)}>
                      {REGIMES.map(r=><option key={r}>{r}</option>)}
                    </select></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Responsável</label>
                    <input className={inp} value={empresa.responsavel||""} onChange={e=>setE("responsavel",e.target.value)} placeholder="Nome do responsável"/></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📍 Endereço</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">CEP</label>
                    <div className="flex gap-2">
                      <input className={`${inp} font-mono flex-1`} value={empresa.cep||""} onChange={handleCepChangeEmp} placeholder="00000-000" maxLength={9}/>
                      {cepLoadingEmp && <div className="w-9 h-9 flex items-center justify-center shrink-0"><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/></div>}
                    </div>
                    {cepErrorEmp && <p className="text-[10px] text-red-500 mt-1">⚠️ {cepErrorEmp}</p>}</div>
                  <div className="col-span-2"><label className="text-xs font-medium text-gray-600 block mb-1">Logradouro</label>
                    <input className={inp} value={empresa.rua||""} onChange={e=>setE("rua",e.target.value)} placeholder="Rua, Av, etc."/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Número</label>
                    <input className={inp} value={empresa.numero||""} onChange={e=>setE("numero",e.target.value)} placeholder="123"/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Bairro</label>
                    <input className={inp} value={empresa.bairro||""} onChange={e=>setE("bairro",e.target.value)} placeholder="Bairro"/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Cidade / UF</label>
                    <div className="flex gap-1">
                      <input className={inp} value={empresa.cidade||""} onChange={e=>setE("cidade",e.target.value)} placeholder="Cidade"/>
                      <input className="w-14 border border-gray-200 rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-300" value={empresa.estado||""} onChange={e=>setE("estado",e.target.value.toUpperCase().slice(0,2))} placeholder="SP"/>
                    </div></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📞 Contato</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Telefone</label>
                    <input className={inp} value={empresa.telefone||""} onChange={e=>setE("telefone",fmtTelefone(e.target.value))} placeholder="(11) 0000-0000" maxLength={16}/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">WhatsApp / Celular</label>
                    <input className={inp} value={empresa.celular||""} onChange={e=>setE("celular",fmtTelefone(e.target.value))} placeholder="(11) 99999-9999" maxLength={16}/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">E-mail</label>
                    <input type="email" className={inp} value={empresa.email||""} onChange={e=>setE("email",e.target.value)} placeholder="contato@mmarmarinhos.com.br"/></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Site</label>
                    <input type="url" className={inp} value={empresa.site||""} onChange={e=>setE("site",e.target.value)} placeholder="https://mmarmarinhos.com.br"/></div>
                </div>
              </div>

              {canAlterar && (
                <button onClick={handleSaveEmpresa}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                  💾 Salvar Dados da Empresa
                </button>
              )}
            </div>
      )}

      {/* ══ TAB: CANAIS & COMISSÕES ═══════════════════════════════════ */}
      {tab==="canais" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
            💡 Taxas de referência para precificação. O mini-simulador mostra o custo real para um produto de R$ 100.
          </div>
          {CHANNELS.map(ch => {
            const cfg = canais[ch] || PARAMS_DEFAULT.canais[ch] || { comissao:0, gateway:0, ativo:true, sla:3, taxaFixa:0 };
            const taxa = (cfg.comissao||0) + (cfg.gateway||0);
            const taxaFixa = cfg.taxaFixa||0;
            const taxaTotalReais = (100 * taxa/100) + taxaFixa;
            return (
              <div key={ch} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-opacity ${!cfg.ativo?"opacity-55":""}`}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${CHANNEL_DOT_COLOR[ch]}`}/>
                    <span className="font-semibold text-gray-800 text-sm">{CHANNEL_EMOJI_MAP[ch]} {ch}</span>
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      total: <b>{taxa.toFixed(1)}%</b>{taxaFixa>0 && <> + <b>R$ {taxaFixa.toFixed(2).replace(".",",")}</b></>}
                    </span>
                  </div>
                  <button onClick={()=>setC(ch,"ativo",!cfg.ativo)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${cfg.ativo?"bg-green-50 text-green-600 border-green-200":"bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {cfg.ativo?"● Ativo":"○ Inativo"}
                  </button>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5 font-medium">Comissão marketplace</label>
                    <div className="flex items-center gap-1">
                      <input type="number" min="0" max="50" step="0.1"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={cfg.comissao===0?"":cfg.comissao}
                        onChange={e=>setC(ch,"comissao", e.target.value==="" ? "" : parseFloat(e.target.value))}
                        onBlur={e=>{ if (e.target.value==="") setC(ch,"comissao",0); }}/>
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5 font-medium">Gateway / Pagamento</label>
                    <div className="flex items-center gap-1">
                      <input type="number" min="0" max="10" step="0.1"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={cfg.gateway===0?"":cfg.gateway}
                        onChange={e=>setC(ch,"gateway", e.target.value==="" ? "" : parseFloat(e.target.value))}
                        onBlur={e=>{ if (e.target.value==="") setC(ch,"gateway",0); }}/>
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5 font-medium" title="Valor fixo em reais cobrado por venda, além do percentual — ex: taxa fixa do Mercado Livre em itens de baixo valor.">Taxa Fixa (R$)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">R$</span>
                      <input type="number" min="0" step="0.01"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={cfg.taxaFixa===0?"":cfg.taxaFixa}
                        onChange={e=>setC(ch,"taxaFixa", e.target.value==="" ? "" : parseFloat(e.target.value))}
                        onBlur={e=>{ if (e.target.value==="") setC(ch,"taxaFixa",0); }}/>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5 font-medium">SLA postagem (dias úteis)</label>
                    <input type="number" min="1" max="10"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={cfg.sla===0?"":cfg.sla}
                      onChange={e=>setC(ch,"sla", e.target.value==="" ? "" : parseInt(e.target.value))}
                      onBlur={e=>{ if (e.target.value==="") setC(ch,"sla",2); }}/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5 font-medium">Simulação (R$ 100,00)</label>
                    <div className="bg-indigo-50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-400">taxas totais</p>
                      <p className="font-bold text-indigo-700 text-lg leading-none mt-0.5">
                        − R$ {taxaTotalReais.toFixed(2).replace(".",",")}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">sobram R$ {(100-taxaTotalReais).toFixed(2).replace(".",",")}</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium" title="Dias em que você despacha pedidos desse canal. Desmarque sábado/domingo (ou qualquer dia que não despache) pra o prazo de postagem no Dashboard pular esses dias.">📅 Dias de despacho</label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map(w => {
                      const dias = cfg.diasDespacho || [1,2,3,4,5];
                      const marcado = dias.includes(w.v);
                      return (
                        <button key={w.v} type="button"
                          onClick={()=>setC(ch,"diasDespacho", marcado ? dias.filter(d=>d!==w.v) : [...dias, w.v].sort())}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${marcado ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                          {marcado ? "✓ " : ""}{w.l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          {canAlterar && (
            <button onClick={()=>{
                const canaisNorm = Object.fromEntries(Object.entries(canais).map(([ch,cfg])=>[ch,{...cfg,
                  comissao:Number(cfg.comissao)||0, taxaFixa:Number(cfg.taxaFixa)||0, diasDespacho:Number(cfg.diasDespacho)||0}]));
                setCanais(canaisNorm);
                mergeAndSave({canais:canaisNorm}).then(()=>showToast("✅ Canais & Comissões salvos!"));
              }}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              💾 Salvar Canais & Comissões
            </button>
          )}
        </div>
      )}

      {/* ══ TAB: ALERTAS ════════════════════════════════════════════════ */}
      {tab==="vendas" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📄 Cotações</p>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Validade da cotação (dias corridos)</label>
              <input type="number" min="1" className={inp + " max-w-[160px]"}
                value={vendas.validadeCotacaoDias===0?"":vendas.validadeCotacaoDias}
                onChange={e=>setV("validadeCotacaoDias", e.target.value===""?"":(parseInt(e.target.value)||0))}
                onBlur={e=>{ if (e.target.value==="") setV("validadeCotacaoDias",10); }}/>
              <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                Toda cotação nova nasce com "Válida até" igual à data de emissão + esse número de dias. Cotações já criadas não são alteradas.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">🏷️ Limite de Desconto</p>
            <p className="text-xs text-gray-500">
              Desconto máximo (%) que usuários <strong>não-administradores</strong> podem conceder por item em Pedidos e Cotações.
              <strong> Administradores podem exceder</strong> (válvula pra exceções negociadas). Deixe 0 pra não limitar.
              Dica: alinhe com o teto das faixas de comissão dos representantes.
            </p>
            <div className="max-w-[220px]">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Desconto máximo (%)</label>
              <input type="number" min="0" max="100" step="0.5" className={inp}
                value={vendas.descontoMaximoPercent===0?"":(vendas.descontoMaximoPercent??"")}
                placeholder="0 = sem limite"
                onChange={e=>setV("descontoMaximoPercent", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                onBlur={e=>{ if (e.target.value==="") setV("descontoMaximoPercent",0); }}/>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">⚠️ Cobrança por Atraso (Contas a Receber)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Multa por atraso (%)</label>
                <input type="number" min="0" max="100" step="0.1" className={inp}
                  value={vendas.multaAtrasoPercent===0?"":vendas.multaAtrasoPercent}
                  onChange={e=>setV("multaAtrasoPercent", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                  onBlur={e=>{ if (e.target.value==="") setV("multaAtrasoPercent",0); }}/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Juros por atraso (% ao mês)</label>
                <input type="number" min="0" max="100" step="0.1" className={inp}
                  value={vendas.jurosAtrasoPercentMes===0?"":vendas.jurosAtrasoPercentMes}
                  onChange={e=>setV("jurosAtrasoPercentMes", e.target.value===""?"":(parseFloat(e.target.value)||0))}
                  onBlur={e=>{ if (e.target.value==="") setV("jurosAtrasoPercentMes",0); }}/>
              </div>
            </div>
            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
              Multa: cobrada uma única vez sobre o valor em atraso (o limite legal pra consumidor no Brasil é 2%). Juros: cobrados proporcionalmente aos dias de atraso, com base no percentual mensal informado.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">🏷️ Status do Pedido de Venda</p>
            <p className="text-xs text-gray-400 -mt-2">
              Personalize os status que aparecem nos Pedidos de Venda.
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              ⚠️ <strong>Novo, Em Separação, Enviado, Entregue, Cancelado e Devolvido</strong> têm comportamento automático no sistema (estorno de estoque ao cancelar, liberação de devolução, débito de estoque conforme o status). Os essenciais têm 🔒 e semântica fixa. Ao adicionar um status próprio (ex: "Aguardando Retirada"), use as chavinhas pra declarar o comportamento dele: <strong>📦 Segura estoque</strong> (baixa/mantém o estoque), <strong>🚚 Conta como a enviar</strong> (entra no card do Dashboard e nos Prazos de Postagem) e <strong>✅ Entrega concluída</strong> (vale pra comissão do representante).
            </p>

            <div className="flex flex-wrap gap-2">
              {(vendas.statusList||[]).map((s,idx)=>{
                // Status essenciais do sistema (disparam estoque/financeiro) têm
                // cadeado e semântica fixa; os customizados declaram a própria
                // semântica nas chavinhas abaixo do chip.
                const essencial = ORDER_STATUSES.includes(s);
                const meta = essencial ? CORE_STATUS_META[s] : (vendas.statusMeta?.[s] || { holdsStock:false, toShip:false, delivered:false });
                const toggleMeta = (k) => setVendas(prev=>({...prev,
                  statusMeta: { ...(prev.statusMeta||{}), [s]: { ...(prev.statusMeta?.[s]||{ holdsStock:false, toShip:false, delivered:false }), [k]: !(prev.statusMeta?.[s]?.[k]) } }
                }));
                return (
                <div key={idx} className="bg-indigo-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-1.5 text-indigo-700 text-sm font-medium">
                    {s}
                    {essencial
                      ? <span className="text-indigo-300" title="Status essencial do sistema — não pode ser removido">🔒</span>
                      : <button onClick={()=>setVendas(prev=>({...prev,
                          statusList: prev.statusList.filter((_,i)=>i!==idx),
                          statusMeta: Object.fromEntries(Object.entries(prev.statusMeta||{}).filter(([k])=>k!==s)),
                        }))}
                          className="text-indigo-400 hover:text-red-500 font-bold">✕</button>}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {[["holdsStock","📦 Segura estoque"],["toShip","🚚 Conta como a enviar"],["delivered","✅ Entrega concluída"]].map(([k,label])=>(
                      essencial
                        ? <span key={k} className={`text-[10px] px-1.5 py-0.5 rounded-full ${meta[k]?"bg-indigo-200 text-indigo-800":"bg-white/60 text-gray-400 line-through"}`}>{label}</span>
                        : <button key={k} onClick={()=>toggleMeta(k)}
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-all ${meta[k]?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-400 border-gray-200 hover:border-indigo-300"}`}>{label}</button>
                    ))}
                  </div>
                </div>
              );})}
              {(!vendas.statusList || vendas.statusList.length===0) && <p className="text-xs text-gray-400 italic">Nenhum status configurado — usando os padrões do sistema.</p>}
            </div>

            <div className="flex gap-2">
              <input id="novo-status-venda" className={inp} placeholder="Ex: Aguardando Retirada"
                onKeyDown={e=>{
                  if (e.key==="Enter") {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val && !(vendas.statusList||[]).includes(val)) {
                      setVendas(prev=>({...prev, statusList:[...(prev.statusList||[]), val]}));
                    }
                    e.target.value = "";
                  }
                }}/>
              <button onClick={()=>{
                const el = document.getElementById("novo-status-venda");
                const val = el.value.trim();
                if (val && !(vendas.statusList||[]).includes(val)) {
                  setVendas(prev=>({...prev, statusList:[...(prev.statusList||[]), val]}));
                }
                el.value = "";
              }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 whitespace-nowrap">
                + Adicionar
              </button>
            </div>
          </div>

          {canAlterar && (
            <button onClick={()=>mergeAndSave({vendas}).then(()=>showToast("✅ Configurações de Vendas salvas!"))}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              💾 Salvar Vendas
            </button>
          )}
        </div>
      )}

      {tab==="compras" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📦 Status do Pedido de Compra</p>
            <p className="text-xs text-gray-400 -mt-2">
              Personalize os status que aparecem nos Pedidos de Compra. Eles não afetam outros módulos (Nota Fiscal, Cotação, Pedidos de venda continuam com seus próprios status).
            </p>

            <div className="flex flex-wrap gap-2">
              {(compras.statusList||[]).map((s,idx)=>{
                const essencial = PC_STATUS.includes(s); // "Baixado"/"Cancelado" disparam estoque e financeiro
                return (
                <span key={idx} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full pl-3 pr-2 py-1.5">
                  {s}
                  {essencial
                    ? <span className="text-indigo-300" title="Status essencial do sistema — não pode ser removido">🔒</span>
                    : <button onClick={()=>setCompras(prev=>({...prev, statusList: prev.statusList.filter((_,i)=>i!==idx)}))}
                        className="text-indigo-400 hover:text-red-500 font-bold">✕</button>}
                </span>
              );})}
              {(!compras.statusList || compras.statusList.length===0) && <p className="text-xs text-gray-400 italic">Nenhum status configurado — usando os padrões do sistema.</p>}
            </div>

            <div className="flex gap-2">
              <input id="novo-status-compra" className={inp} placeholder="Ex: Aguardando Pagamento"
                onKeyDown={e=>{
                  if (e.key==="Enter") {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val && !(compras.statusList||[]).includes(val)) {
                      setCompras(prev=>({...prev, statusList:[...(prev.statusList||[]), val]}));
                    }
                    e.target.value = "";
                  }
                }}/>
              <button onClick={()=>{
                const el = document.getElementById("novo-status-compra");
                const val = el.value.trim();
                if (val && !(compras.statusList||[]).includes(val)) {
                  setCompras(prev=>({...prev, statusList:[...(prev.statusList||[]), val]}));
                }
                el.value = "";
              }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 whitespace-nowrap">
                + Adicionar
              </button>
            </div>

            {canAlterar && (
              <button onClick={()=>mergeAndSave({compras}).then(()=>showToast("✅ Status de Compras salvos!"))}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                💾 Salvar Status de Compras
              </button>
            )}
          </div>
        </div>
      )}

      {tab==="fiscal" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📄 Emissão de Nota Fiscal</p>
            <p className="text-xs text-gray-400 -mt-2">
              Escolha o fornecedor de emissão fiscal que você já contratou e cole o token de acesso fornecido por ele. Cada empresa configura o seu próprio, de forma independente.
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 -mt-1">
              ℹ️ <b>IBS/CBS (Reforma Tributária):</b> calculados automaticamente conforme o regime cadastrado em Parâmetros &gt; Empresa. Empresas do <b>Simples Nacional</b> ainda não precisam declarar (exigência só a partir de jan/2027); <b>Lucro Presumido/Real</b> já recebem os campos com as alíquotas-teste de 2026. Recomendamos validar com seu contador antes de emitir em Produção.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {id:"", label:"Nenhum", desc:"Sem emissão integrada"},
                {id:"focus", label:"Focus NFe", desc:"focusnfe.com.br"},
                {id:"nfeio", label:"NFe.io", desc:"nfe.io"},
              ].map(p=>(
                <button key={p.id} onClick={()=>setFisc("provider",p.id)}
                  className={`text-left p-3 rounded-xl border-2 transition-colors ${fiscal.provider===p.id?"border-indigo-500 bg-indigo-50":"border-gray-100 hover:border-gray-200"}`}>
                  <p className="text-sm font-semibold text-gray-800">{p.label}</p>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </button>
              ))}
            </div>

            {fiscal.provider && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Token de acesso</label>
                  <input type="password" className={inp} value={fiscal.token} onChange={e=>setFisc("token",e.target.value)}
                    placeholder="Cole aqui o token fornecido pelo painel do fornecedor"/>
                  <p className="text-[10px] text-gray-400 mt-1">Guardado de forma protegida — nunca é exibido nem enviado ao navegador depois de salvo.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Ambiente</label>
                  <div className="flex gap-2">
                    {[["homologacao","🧪 Testes (Homologação)"],["producao","✅ Produção (notas reais)"]].map(([id,label])=>(
                      <button key={id} onClick={()=>setFisc("ambiente",id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${fiscal.ambiente===id?"border-indigo-500 bg-indigo-50 text-indigo-700":"border-gray-100 text-gray-500"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Comece em "Testes" pra validar a integração sem gerar nota fiscal de verdade. Troque pra "Produção" só quando tiver certeza que está tudo certo.</p>
                </div>
              </>
            )}

            {canAlterar && (
              <button onClick={()=>mergeAndSave({fiscal}).then(()=>showToast("✅ Configuração fiscal salva!"))}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                💾 Salvar Fiscal
              </button>
            )}
          </div>
        </div>
      )}

      {tab==="alertas" && (
        <div className="space-y-4">
          {/* Inatividade de clientes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">👥 Clientes</p>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">
                  Inativar cliente após <span className="font-bold text-indigo-700">{alertas.diasInatividade}</span> dias sem compras
                </label>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-bold">{alertas.diasInatividade}d</span>
              </div>
              <input type="range" min="7" max="90" step="1" className="w-full accent-indigo-600"
                value={alertas.diasInatividade} onChange={e=>setA("diasInatividade",parseInt(e.target.value))}/>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>7 dias</span><span>30 dias</span><span>90 dias</span>
              </div>
              <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                Clientes sem compras há mais de <b>{alertas.diasInatividade} dias</b> são marcados como <b>Inativo</b> automaticamente.
              </p>
            </div>
          </div>

          {/* SLA por canal */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📬 SLA de Postagem por Canal</p>
              <p className="text-xs text-gray-400 mt-1">Prazo máximo em dias úteis para postar o pedido (usado no Dashboard)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CHANNELS.map(ch=>{
                const cfg = canais[ch] || PARAMS_DEFAULT.canais[ch];
                return (
                  <div key={ch} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-700 font-medium">{CHANNEL_EMOJI_MAP[ch]} {ch}</span>
                    <div className="flex items-center gap-1.5">
                      <input type="number" min="1" max="10"
                        className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={cfg.sla===0?"":cfg.sla}
                        onChange={e=>setC(ch,"sla", e.target.value==="" ? "" : parseInt(e.target.value))}
                        onBlur={e=>{ if (e.target.value==="") setC(ch,"sla",2); }}/>
                      <span className="text-xs text-gray-400">dias</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400">⚡ Alterar o SLA aqui também atualiza a aba Canais & Comissões.</p>
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">📧 Notificações</p>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">E-mail para alertas do sistema</label>
              <input type="email" className={inp}
                value={alertas.emailAlertas||""} onChange={e=>setA("emailAlertas",e.target.value)}
                placeholder="email@mmarmarinhos.com.br"/>
              <p className="text-xs text-gray-400 mt-1.5">Alertas de estoque crítico, pedidos atrasados e obrigações fiscais.</p>
            </div>
          </div>

          {canAlterar && (
            <button onClick={()=>mergeAndSave({canais, alertas}).then(()=>showToast("✅ Alertas configurados!"))}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              💾 Salvar Alertas
            </button>
          )}
        </div>
      )}

      {/* ══ TAB: SINCRONIZAÇÃO ══════════════════════════════════════════ */}
      {tab==="sync" && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-800 leading-relaxed">
            🔐 As credenciais são armazenadas localmente no banco de dados do ERP. A chave nunca é transmitida sem HTTPS.
          </div>

          {/* Backend URL */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚙️</span>
                <p className="text-sm font-bold text-gray-700">Servidor de Sincronização</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sync.backendUrl?"bg-green-100 text-green-700":"bg-gray-100 text-gray-400"}`}>
                {sync.backendUrl?"● Configurado":"○ Não configurado"}
              </span>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">URL do Backend (Cloudflare Worker)</label>
              <input className={`${inp} font-mono`}
                value={sync.backendUrl||""} onChange={e=>setS(null,"backendUrl",e.target.value)}
                placeholder="https://mma-sync.usuario.workers.dev"/>
              <p className="text-xs text-gray-400 mt-1">Worker responsável pela comunicação com as APIs dos marketplaces.</p>
            </div>
          </div>

          {/* Mercado Livre */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-yellow-50 border-b border-yellow-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🛒</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Mercado Livre</p>
                  <p className="text-[11px] text-gray-500">ML for Business API v2</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sync.ml?.accessToken?"bg-green-100 text-green-700":"bg-gray-100 text-gray-400"}`}>
                {sync.ml?.accessToken?"● Configurado":"○ Não configurado"}
              </span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">App ID / Client ID</label>
                  <input className={`${inp} font-mono`} value={sync.ml?.clientId||""} onChange={e=>setS("ml","clientId",e.target.value)} placeholder="123456789"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Access Token</label>
                  <div className="flex gap-1">
                    <input type={revealed.mlToken?"text":"password"} className={`${inp} font-mono`}
                      value={sync.ml?.accessToken||""} onChange={e=>setS("ml","accessToken",e.target.value)} placeholder="APP_USR-..."/>
                    <button onClick={()=>setRevealed(r=>({...r,mlToken:!r.mlToken}))}
                      className="px-3 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 text-xs shrink-0">
                      {revealed.mlToken?"🙈":"👁️"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Refresh Token</label>
                  <div className="flex gap-1">
                    <input type={revealed.mlRefresh?"text":"password"} className={`${inp} font-mono`}
                      value={sync.ml?.refreshToken||""} onChange={e=>setS("ml","refreshToken",e.target.value)} placeholder="TG-..."/>
                    <button onClick={()=>setRevealed(r=>({...r,mlRefresh:!r.mlRefresh}))}
                      className="px-3 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 text-xs shrink-0">
                      {revealed.mlRefresh?"🙈":"👁️"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Importação automática de pedidos</label>
                  <button onClick={()=>setS("ml","autoImport",!sync.ml?.autoImport)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${sync.ml?.autoImport?"bg-green-50 text-green-700 border-green-200":"bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {sync.ml?.autoImport?"✅ Auto-importar ativo":"○ Auto-importar desativado"}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-[11px] text-gray-500 font-semibold">Webhook URL — configure no Painel ML Developers</p>
                <p className="text-[11px] font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 select-all break-all">
                  {sync.backendUrl?`${sync.backendUrl}/webhook/ml`:"⚠️ Configure o Backend URL primeiro"}
                </p>
              </div>
            </div>
          </div>

          {/* Shopee */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-orange-50 border-b border-orange-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🛍️</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Shopee</p>
                  <p className="text-[11px] text-gray-500">Shopee Open Platform API v2</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sync.shopee?.partnerKey?"bg-green-100 text-green-700":"bg-gray-100 text-gray-400"}`}>
                {sync.shopee?.partnerKey?"● Configurado":"○ Não configurado"}
              </span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Partner ID</label>
                  <input className={`${inp} font-mono`} value={sync.shopee?.partnerId||""} onChange={e=>setS("shopee","partnerId",e.target.value)} placeholder="1234567"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Partner Key</label>
                  <div className="flex gap-1">
                    <input type={revealed.shopeeKey?"text":"password"} className={`${inp} font-mono`}
                      value={sync.shopee?.partnerKey||""} onChange={e=>setS("shopee","partnerKey",e.target.value)} placeholder="••••••••••••••••"/>
                    <button onClick={()=>setRevealed(r=>({...r,shopeeKey:!r.shopeeKey}))}
                      className="px-3 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 text-xs shrink-0">
                      {revealed.shopeeKey?"🙈":"👁️"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Shop ID</label>
                  <input className={`${inp} font-mono`} value={sync.shopee?.shopId||""} onChange={e=>setS("shopee","shopId",e.target.value)} placeholder="123456789"/>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Importação automática de pedidos</label>
                  <button onClick={()=>setS("shopee","autoImport",!sync.shopee?.autoImport)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${sync.shopee?.autoImport?"bg-green-50 text-green-700 border-green-200":"bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {sync.shopee?.autoImport?"✅ Auto-importar ativo":"○ Auto-importar desativado"}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-[11px] text-gray-500 font-semibold">Webhook URL — configure no Shopee Partner Portal</p>
                <p className="text-[11px] font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 select-all break-all">
                  {sync.backendUrl?`${sync.backendUrl}/webhook/shopee`:"⚠️ Configure o Backend URL primeiro"}
                </p>
              </div>
            </div>
          </div>

          {canAlterar && (
            <button onClick={()=>{
              if (!canAlterar) return; // segurança extra
              const next={...(params||PARAMS_DEFAULT),sincronizacao:sync};
              saveParams(next).then(()=>{setParams(next);if(sync.backendUrl)localStorage.setItem("erp_backend_url",sync.backendUrl);showToast("✅ Configurações de sincronização salvas!");});
            }}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              💾 Salvar Sincronização
            </button>
          )}

          {/* Operação de sincronização (importar pedidos agora) */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">🔄 Operação</p>
            <SyncOperationsPanel orders={orders} setOrders={setOrders} backendUrl={sync.backendUrl}/>
          </div>
        </div>
      )}

      {/* ══ TAB: AUTOMAÇÃO ══════════════════════════════════════════════ */}
      {tab==="automacao" && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-800 leading-relaxed">
            🤖 Mensagens automáticas pós-venda enviadas via Mercado Livre, com base em pedidos entregues.
          </div>
          <MLAutomationPanel/>
        </div>
      )}
    </div>
  );
};

// ─── Nav Items ────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",  label: "Dashboard",       icon: "dashboard"  },
  { id: "receber",    label: "Contas a Receber", icon: "arrowDown"  },
  { id: "pagar",      label: "Contas a Pagar",   icon: "arrowUp"    },
  { id: "orders",     label: "Pedidos",          icon: "orders"     },
  { id: "cotacao",    label: "Cotações",         icon: "tag"        },
  { id: "crm",        label: "Clientes",         icon: "crm"        },
  { id: "suppliers",  label: "Fornecedores",     icon: "suppliers"  },
  { id: "purchases",  label: "Compras",          icon: "orders"     },
  { id: "inventory",  label: "Estoque",          icon: "inventory"  },
  { id: "pdv",        label: "🛒 PDV",           icon: "orders"     },
  { id: "fiscal",     label: "Fiscal",           icon: "finance"    },
  { id: "pricing",    label: "Tabela de Preços",  icon: "tag"        },
  { id: "pricehunt",  label: "PriceHunt",        icon: "search"     },
  { id: "reports",    label: "Relatórios",       icon: "reports"    },
  { id: "movimentos", label: "Movimentos",       icon: "finance"    },
  { id: "usuarios",   label: "Usuários",         icon: "crm"        },
  { id: "cadastros",  label: "Cadastros",        icon: "tag"        },
  { id: "parametros", label: "Parâmetros",       icon: "settings"   },
];

// ─── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppAuth>
      {({ currentUser, onLogout }) => <ERPApp currentUser={currentUser} onLogout={onLogout}/>}
    </AppAuth>
  );
}

const ChangePasswordModal = ({ onClose }) => {
  const [current, setCurrent] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setErr(""); setOk("");
    if (!current) { setErr("Informe a senha atual"); return; }
    if (pwd.length < 6) { setErr("Nova senha precisa ter no mínimo 6 caracteres"); return; }
    if (pwd !== pwd2) { setErr("As senhas não coincidem"); return; }
    setSaving(true);
    try {
      const token = getSession()?.token;
      const currentPasswordHash = await sha256(current);
      const newPasswordHash = await sha256(pwd);
      const r = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify({ currentPasswordHash, newPasswordHash }),
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok) { setErr(data.error||"Erro ao trocar senha"); setSaving(false); return; }
      setOk("✅ Senha alterada com sucesso!");
      setCurrent(""); setPwd(""); setPwd2("");
      setTimeout(onClose, 1800);
    } catch(e) { setErr("Erro: "+e.message); }
    setSaving(false);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Trocar senha</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Senha atual</label>
          <input type="password" className={inp} value={current} onChange={e=>setCurrent(e.target.value)}/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Nova senha</label>
          <input type="password" className={inp} value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Mínimo 6 caracteres"/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Confirmar nova senha</label>
          <input type="password" className={inp} value={pwd2} onChange={e=>setPwd2(e.target.value)}/>
        </div>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        {ok && <p className="text-green-600 text-sm font-medium">{ok}</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {saving?"Salvando...":"Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

function ERPApp({ currentUser, onLogout }) {
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [form, setEmpresaForm] = useState(EMPRESA_EMPTY); // empresa data for sidebar
  const [orders, setOrders]         = useState([]);
  const [finance, setFinance]       = useState([]);
  const [customers, setCustomers]   = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [products, setProducts]     = useState([]);
  const [movements, setMovements]   = useState([]);
  const [caixa, setCaixaState]      = useState([]);
  const [nfes, setNfes]             = useState([]);
  const [purchases, setPurchases]   = useState([]);
  const [cotacoes,  setCotacoes]    = useState([]);
  const [representantes, setRepresentantes_] = useState([]);
  const [contas,    setContas_]     = useState([]);
  const [formasPagamento, setFormasPagamento_] = useState([]);
  const [variantCatalogs, setVariantCatalogs_] = useState([]);
  const [fechamentos, setFechamentos_] = useState([]);
  const [params,    setParamsState] = useState(PARAMS_DEFAULT);
  const [loading, setLoading]       = useState(true);
  const [active, setActive]         = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [phQuery, setPhQuery]       = useState("");
  const [phPrice, setPhPrice]       = useState(null);
  const [appToast, setAppToast]     = useState(null);
  const [loadErrors, setLoadErrors] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [initialOrdersFilter, setInitialOrdersFilter] = useState(null);

  const showAppToast = (msg) => { setAppToast(msg); setTimeout(()=>setAppToast(null), 4000); };

  // Aviso visível quando uma gravação falha de vez (após retry) — antes isso
  // sumia em silêncio (ex: baixa de pedido gerando estoque mas não o
  // histórico de movimentação, porque o salvamento de "movements" falhou
  // sem nenhum aviso).
  useEffect(() => {
    const onSaveError = (e) => {
      const label = e?.detail?.label || "dado";
      showAppToast(`⚠️ Falha ao salvar "${label}" — verifique sua conexão e tente novamente.`);
    };
    window.addEventListener("erp:save-error", onSaveError);
    return () => window.removeEventListener("erp:save-error", onSaveError);
  }, []);

  // Aviso persistente (banner, não some sozinho) quando o CARREGAMENTO de um
  // dado falha de vez — diferente do save-error, isso geralmente acontece
  // logo ao abrir a página, então um toast de alguns segundos passaria
  // despercebido. Sem isso, o módulo simplesmente aparece vazio e parece que
  // os dados foram apagados, quando na verdade só não carregaram.
  useEffect(() => {
    const onLoadError = (e) => {
      const label = e?.detail?.label || "dado";
      setLoadErrors(prev => prev.includes(label) ? prev : [...prev, label]);
    };
    window.addEventListener("erp:load-error", onLoadError);
    return () => window.removeEventListener("erp:load-error", onLoadError);
  }, []);

  useEffect(() => {
    Promise.all([loadOrders(),loadFinance(),loadCustomers(),loadSuppliers(),loadProducts(),loadMovements(),loadNfes(),loadPurchases(),loadCotacoes(),loadParams(),
      loadRepresentantes(),loadContas(),loadFormasPagamento(),loadVariantCatalogs(),loadFechamentos(),loadCaixa(),
      window.storage.get(EMPRESA_KEY).catch(()=>null)])
      .then(([o,f,c,s,p,m,n,pc,cot,prm,reps,ctas,fps,vcats,fechs,cx,emp]) => {
        setOrders(o);setFinance(f);setSuppliers(s);setProducts(p);setMovements(m);setNfes(n);setPurchases(pc);setCotacoes(cot);
        if (prm) setParamsState(prm);
        setRepresentantes_(reps); setContas_(ctas); setFormasPagamento_(fps); setVariantCatalogs_(vcats); setFechamentos_(fechs);
        setCaixaState(cx);
        if (emp?.value) { try { setEmpresaForm(JSON.parse(emp.value)); } catch(e) { console.error("[MM ERP] Dados da empresa corrompidos, ignorando:", e); } }

        // ── Automação: inativar clientes sem compras há 30+ dias ──
        const now    = new Date();
        const DAYS   = 30;
        let changed  = 0;
        // ── Migração: converter segmentos obsoletos para os novos ──
        const LEGACY_MAP = { "VIP":"Ativo", "Regular":"Ativo", "Novo":"Desenvolvimento" };
        const migrated = c.map(cli =>
          LEGACY_MAP[cli.segment] ? { ...cli, segment: LEGACY_MAP[cli.segment] } : cli
        );
        const migratedCount = migrated.filter((cli,i) => cli.segment !== c[i].segment).length;
        if (migratedCount > 0) saveCustomers(migrated);

        const updated = migrated.map(cli => {
          if (cli.segment === "Inativo") return cli; // já inativo

          // Busca a data do último pedido deste cliente nos orders
          const clientOrders = o.filter(ord =>
            ord.customer?.toLowerCase() === cli.name?.toLowerCase() &&
            ord.status !== "Cancelado" &&
            ord.date
          );

          if (clientOrders.length === 0) return cli; // sem pedidos → não inativar

          // Pega a data do pedido mais recente
          const lastOrderDate = clientOrders
            .map(ord => new Date(ord.date + "T12:00:00"))
            .sort((a,b) => b - a)[0];

          const diffDays = Math.floor((now - lastOrderDate) / 86400000);
          if (diffDays >= DAYS) { changed++; return { ...cli, segment:"Inativo" }; }
          return cli;
        });
        setCustomers(updated);
        if (changed > 0) saveCustomers(updated);
        setLoading(false);

        if (changed > 0) {
          setTimeout(() => showAppToast(`⚠️ ${changed} cliente${changed>1?"s":""} marcado${changed>1?"s":""} como Inativo (sem compras há ${DAYS}+ dias)`), 800);
        }
      })
      .catch(err => {
        // Nunca deixar o app preso na tela de loading: se algo inesperado
        // falhar no carregamento inicial, libera a UI e avisa.
        console.error("[MM ERP] Erro no carregamento inicial:", err);
        setLoading(false);
        setTimeout(() => showAppToast("⚠️ Erro ao carregar parte dos dados — recarregue a página."), 500);
      });
  }, []);

  // ── Automação diária: re-verificar inatividade ──────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCustomers(prev => {
        let changed = 0;
        const updated = prev.map(cli => {
          if (cli.segment === "Inativo") return cli;

          const clientOrders = orders.filter(ord =>
            ord.customer?.toLowerCase() === cli.name?.toLowerCase() &&
            ord.status !== "Cancelado" &&
            ord.date
          );
          if (clientOrders.length === 0) return cli;

          const lastOrderDate = clientOrders
            .map(ord => new Date(ord.date + "T12:00:00"))
            .sort((a,b) => b - a)[0];

          const diffDays = Math.floor((now - lastOrderDate) / 86400000);
          if (diffDays >= 30) { changed++; return { ...cli, segment:"Inativo" }; }
          return cli;
        });
        if (changed > 0) {
          saveCustomers(updated);
          showAppToast(`⚠️ ${changed} cliente${changed>1?"s":""} marcado${changed>1?"s":""} como Inativo automaticamente`);
        }
        return updated;
      });
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const updateOrders = useCallback((updater) => {
    setOrders(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveOrders(next);
      return next;
    });
  }, []);

  const updateFinance = useCallback((updater) => {
    setFinance(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveFinance(next);
      return next;
    });
  }, []);

  const updateCustomers = useCallback((updater) => {
    setCustomers(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveCustomers(next);
      return next;
    });
  }, []);

  const updateSuppliers = useCallback((updater) => {
    setSuppliers(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveSuppliers(next);
      return next;
    });
  }, []);

  const updateProducts = useCallback((updater) => {
    setProducts(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveProducts(next);
      return next;
    });
  }, []);

  const updateMovements = useCallback((updater) => {
    setMovements(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveMovements(next);
      return next;
    });
  }, []);

  const updateCaixa = useCallback((updater) => {
    setCaixaState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveCaixa(next);
      return next;
    });
  }, []);

  const updateNfes = useCallback((updater) => {
    setNfes(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveNfes(next);
      return next;
    });
  }, []);

  const updatePurchases = useCallback((updater) => {
    setPurchases(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      savePurchases(next);
      return next;
    });
  }, []);

  const updateParams = useCallback((next) => {
    setParamsState(next);
    saveParams(next);
  }, []);

  const updateRepresentantes = useCallback((updater) => {
    setRepresentantes_(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveRepresentantes(next);
      return next;
    });
  }, []);

  const updateContas = useCallback((updater) => {
    setContas_(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveContas(next);
      return next;
    });
  }, []);

  const updateFormasPagamento = useCallback((updater) => {
    setFormasPagamento_(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveFormasPagamento(next);
      return next;
    });
  }, []);

  const updateVariantCatalogs = useCallback((updater) => {
    setVariantCatalogs_(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveVariantCatalogs(next);
      return next;
    });
  }, []);

  const updateFechamentos = useCallback((updater) => {
    setFechamentos_(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveFechamentos(next);
      return next;
    });
  }, []);

  const updateCotacoes = useCallback((updater) => {
    setCotacoes(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveCotacoes(next);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando ERP...</p>
        </div>
      </div>
    );
  }

  const renderModule = () => {
    switch (active) {
      case "dashboard": return <DashboardModule orders={orders} finance={finance} params={params} setActive={setActive}
        onGoToAEnviar={()=>{ setInitialOrdersFilter("A_ENVIAR"); setActive("orders"); }}
        onGoToEmAberto={()=>{ setInitialOrdersFilter("EM_ABERTO_FAT"); setActive("orders"); }}
        onGoToFaturados={()=>{ setInitialOrdersFilter("FATURADOS"); setActive("orders"); }} />;
      case "orders":    return <OrdersModule orders={orders} setOrders={updateOrders} customers={customers} setCustomers={updateCustomers} products={products} setProducts={updateProducts} movements={movements} setMovements={updateMovements} finance={finance} setFinance={updateFinance} setNfes={updateNfes} representantes={representantes} formasPagamento={formasPagamento} params={params} openOrderId={openOrderId} onConsumeOpenOrder={()=>setOpenOrderId(null)} initialStatusFilter={initialOrdersFilter} onConsumeStatusFilter={()=>setInitialOrdersFilter(null)} currentUser={currentUser}/>;
      case "cotacao":   return <CotacaoModule cotacoes={cotacoes} setCotacoes={updateCotacoes} orders={orders} setOrders={updateOrders} customers={customers} setCustomers={updateCustomers} products={products} setProducts={updateProducts} movements={movements} setMovements={updateMovements} empresa={form} representantes={representantes} formasPagamento={formasPagamento} params={params} currentUser={currentUser}/>;
      case "inventory": return <InventoryModule products={products} setProducts={updateProducts} movements={movements} setMovements={updateMovements} suppliers={suppliers} variantCatalogs={variantCatalogs} onPriceHunt={(name,price)=>{setPhQuery(name);setPhPrice(price);setActive("pricehunt");}} currentUser={currentUser}/>;
      case "pricing":   return <PricingModule products={products} setProducts={updateProducts} params={params} currentUser={currentUser}/>;
      case "receber":   return <FinanceModule key="fm-receber" finance={finance} setFinance={updateFinance} orders={orders} setOrders={updateOrders} purchases={purchases} setPurchases={updatePurchases} params={params} initialTab="receber" onViewOrder={(id)=>{ setOpenOrderId(id); setActive("orders"); }} currentUser={currentUser}/>;
      case "pagar":     return <FinanceModule key="fm-pagar" finance={finance} setFinance={updateFinance} orders={orders} setOrders={updateOrders} purchases={purchases} setPurchases={updatePurchases} params={params} initialTab="pagar" currentUser={currentUser}/>;
      case "crm":       return <CrmModule customers={customers} setCustomers={updateCustomers} orders={orders} setOrders={updateOrders} currentUser={currentUser}/>;
      case "suppliers": return <SupplierModule suppliers={suppliers} setSuppliers={updateSuppliers} finance={finance} setFinance={updateFinance} purchases={purchases} setPurchases={updatePurchases} currentUser={currentUser}/>;
      case "purchases": return <PurchasesModule purchases={purchases} setPurchases={updatePurchases} suppliers={suppliers} products={products} setProducts={updateProducts} movements={movements} setMovements={updateMovements} finance={finance} setFinance={updateFinance} params={params} currentUser={currentUser}/>;
      case "pdv": return <PdvModule products={products} setProducts={updateProducts} orders={orders} setOrders={updateOrders} movements={movements} setMovements={updateMovements} customers={customers} caixa={caixa} setCaixa={updateCaixa} setNfes={updateNfes} params={params} currentUser={currentUser}/>;
      case "usuarios":  return <UsersModule currentUser={currentUser}/>;
      case "cadastros": return <CadastrosModule representantes={representantes} setRepresentantes={updateRepresentantes} contas={contas} setContas={updateContas} formasPagamento={formasPagamento} setFormasPagamento={updateFormasPagamento} variantCatalogs={variantCatalogs} setVariantCatalogs={updateVariantCatalogs} orders={orders} fechamentos={fechamentos} currentUser={currentUser}/>;
      case "parametros": return <ParamsModule params={params} setParams={updateParams} onSaveEmpresa={(data)=>setEmpresaForm(data)} orders={orders} setOrders={updateOrders} currentUser={currentUser}/>;
      case "fiscal":    return <FiscalModule nfes={nfes} setNfes={updateNfes} currentUser={currentUser}/>;
      case "pricehunt": return <PriceHuntModule products={products} initialQuery={phQuery} initialPrice={phPrice}/>;
      case "reports":   return <ReportsModule orders={orders} finance={finance} customers={customers} suppliers={suppliers} purchases={purchases} products={products} params={params}/>;
      case "movimentos": return <MovimentosModule orders={orders} representantes={representantes} fechamentos={fechamentos} setFechamentos={updateFechamentos} finance={finance} setFinance={updateFinance} params={params} currentUser={currentUser}/>;
      default: return null;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
      {appToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 max-w-sm text-center">
          {appToast}
        </div>
      )}
      {loadErrors.length > 0 && (
        <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-sm px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
          <p className="flex-1">
            ⚠️ Não foi possível carregar: <strong>{loadErrors.join(", ")}</strong>. Seus dados <strong>não</strong> foram apagados — é uma falha de conexão. Tente atualizar a página.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={()=>window.location.reload()} className="px-3 py-1 bg-white text-red-700 rounded-lg text-xs font-semibold hover:bg-red-50">Atualizar</button>
            <button onClick={()=>setLoadErrors([])} className="text-white/80 hover:text-white text-lg leading-none">✕</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32}/>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{form?.nomeFantasia||"MM ERP"}</p>
              <p className="text-xs text-gray-400">Painel de Gestão</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.filter(item => currentUser?.modules?.includes(item.id)).map(item => (
            <button key={item.id} onClick={() => { setActive(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active === item.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
              <Icon name={item.icon} size={17} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-100 shrink-0">
          <div className="px-4 py-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
              {(currentUser?.displayName||"?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{currentUser?.displayName}</p>
              <p className={`text-[9px] font-semibold ${ROLES_DEF[currentUser?.role]?.color||"text-gray-500"}`}>
                {ROLES_DEF[currentUser?.role]?.label||currentUser?.role}
              </p>
            </div>
          </div>
          <button onClick={()=>setShowChangePwd(true)}
            className="w-full px-4 py-2 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L19 5m-7 7l3 3m1-4l2 2m-2.5-1.5l5 5"/>
            </svg>
            Trocar senha
          </button>
          <button onClick={onLogout}
            className="w-full px-4 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sair do sistema
          </button>
          <p className="text-[10px] text-gray-300 text-center pb-2">MM ERP v{APP_VERSION}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Icon name="menu" />
          </button>
          <p className="text-sm font-semibold text-gray-700 md:block hidden">
            {NAV.find(n => n.id === active)?.label}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative text-gray-400 hover:text-gray-600">
              <Icon name="bell" />
              {orders.filter(o => o.status === "Novo").length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {orders.filter(o => o.status === "Novo").length}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">T</div>
          </div>
        </header>

        {/* Page */}
        <main className={"flex-1 overflow-y-auto p-4 md:p-6"}>
          {renderModule()}
        </main>
      </div>
      {showChangePwd && <ChangePasswordModal onClose={()=>setShowChangePwd(false)}/>}
    </div>
  );
}
