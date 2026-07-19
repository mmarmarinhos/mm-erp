// api/nfe-issue.js
// Emite uma NF-e a partir dos dados de um pedido, usando o fornecedor que
// CADA empresa cliente escolheu e configurou em Parâmetros > Fiscal. O
// token de cada fornecedor nunca é exposto ao navegador — é lido aqui,
// no servidor, direto do banco (com a chave secreta).
//
// Hoje com 2 fornecedores reconhecidos: Focus NFe e NFe.io. A estrutura é
// feita pra ser fácil de adicionar mais um fornecedor no futuro (cada um
// só precisa de uma função "issueViaXxx" nova).

const SB_URL = process.env.SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;

function secretHeaders(extra = {}) {
  return { apikey: SB_SECRET, 'Content-Type': 'application/json', ...extra };
}

async function validateSession(token) {
  if (!token) return null;
  const r = await fetch(
    `${SB_URL}/rest/v1/sessions?token=eq.${encodeURIComponent(token)}&select=username,role,expires_at,tenant_id&limit=1`,
    { headers: secretHeaders() }
  );
  if (!r.ok) return null;
  const rows = await r.json();
  const session = rows && rows[0];
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
}

async function getKv(key, tenantId) {
  const r = await fetch(`${SB_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}&tenant_id=eq.${tenantId}&limit=1`, { headers: secretHeaders() });
  const rows = await r.json();
  const row = rows && rows[0];
  return row ? JSON.parse(row.value) : null;
}

// Mapeia o regime tributário cadastrado em Parâmetros > Empresa pro código
// que as APIs fiscais esperam.
function regimeCodigo(regime) {
  if (regime === "Lucro Presumido" || regime === "Lucro Real") return 3; // Regime Normal
  return 1; // Simples Nacional (também usado como aproximação pra MEI/Imune)
}

function soNumeros(s) { return String(s||"").replace(/\D/g, ""); }

// ───────────────────────── Focus NFe ─────────────────────────
async function issueViaFocusNFe({ token, ambiente, empresa, order, ref }) {
  const baseUrl = ambiente === "producao" ? "https://api.focusnfe.com.br/v2" : "https://homologacao.focusnfe.com.br/v2";
  const auth = "Basic " + Buffer.from(token + ":").toString("base64");

  const cnpjDest = soNumeros(order.cpfCnpj || order.customerCnpj);
  const isCnpj = cnpjDest.length === 14;

  const payload = {
    natureza_operacao: "Venda",
    data_emissao: new Date().toISOString(),
    tipo_documento: 1, // Saída
    finalidade_emissao: 1, // Normal
    consumidor_final: 1,
    presenca_comprador: 2, // não presencial, internet (ajuste pra 1 se for venda de balcão)
    cnpj_emitente: soNumeros(empresa.cnpj),
    nome_emitente: empresa.razaoSocial || empresa.nomeFantasia,
    nome_fantasia_emitente: empresa.nomeFantasia,
    logradouro_emitente: empresa.rua, numero_emitente: empresa.numero,
    bairro_emitente: empresa.bairro, municipio_emitente: empresa.cidade,
    uf_emitente: empresa.estado, cep_emitente: soNumeros(empresa.cep),
    inscricao_estadual_emitente: empresa.ie,
    regime_tributario_emitente: regimeCodigo(empresa.regime),
    nome_destinatario: order.customer,
    ...(isCnpj ? { cnpj_destinatario: cnpjDest } : { cpf_destinatario: cnpjDest }),
    valor_frete: Number(order.freight)||0,
    valor_desconto: Number(order.discount)||0,
    valor_total: Number(order.total)||0,
    valor_produtos: Number(order.subtotal)||Number(order.total)||0,
    modalidade_frete: 9,
    items: (order.itemsList||[]).map((it, i) => {
      const valorBruto = Number(it.total)||0;
      const isRegimeNormal = empresa.regime === "Lucro Presumido" || empresa.regime === "Lucro Real";
      // IBS/CBS só é obrigatório pra Regime Normal em 2026 (LC 214/2025, art. 348);
      // Simples Nacional/MEI só entram nessa exigência a partir de jan/2027.
      // Alíquotas-teste de 2026 (simbólicas, sem efeito de caixa: CBS 0,9% / IBS-UF 0,1% / IBS-Mun 0%).
      // cClassTrib "000001" = operação tributada integralmente (padrão pra venda comum) — VALIDAR
      // com o contador se algum produto tiver tratamento diferente (isento, ZFM, monofásico, etc).
      const ibsCbs = isRegimeNormal ? {
        ibs_cbs_situacao_tributaria: "000",
        ibs_cbs_classificacao_tributaria: "000001",
        ibs_cbs_base_calculo: valorBruto,
        cbs_aliquota: 0.9, cbs_valor: Number((valorBruto*0.009).toFixed(2)),
        ibs_uf_aliquota: 0.1, ibs_uf_valor: Number((valorBruto*0.001).toFixed(2)),
        ibs_mun_aliquota: 0, ibs_mun_valor: 0,
      } : {};
      return {
        numero_item: i+1,
        codigo_produto: it.sku || it._prodId || String(i+1),
        descricao: it.description || it.name,
        cfop: it.cfop || "5102",
        quantidade_comercial: Number(it.qty)||1,
        valor_unitario_comercial: Number(it.unitPrice)||0,
        valor_bruto: valorBruto,
        codigo_ncm: (it.ncm || "00000000").replace(/\D/g,""),
        unidade_comercial: "UN", unidade_tributavel: "UN",
        inclui_no_total: 1,
        icms_origem: 0,
        icms_situacao_tributaria: empresa.regime === "Simples Nacional" ? "102" : "41",
        ...ibsCbs,
      };
    }),
  };

  const r = await fetch(`${baseUrl}/nfe?ref=${encodeURIComponent(ref)}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(()=>({}));
  if (r.status === 201) {
    return { ok:true, status:"autorizado", chave: data.chave_nfe, numero: data.numero, serie: data.serie,
      xmlUrl: data.caminho_xml_nota_fiscal ? `https://api.focusnfe.com.br${data.caminho_xml_nota_fiscal}` : null,
      pdfUrl: data.caminho_danfe ? `https://api.focusnfe.com.br${data.caminho_danfe}` : null, raw: data };
  }
  if (r.status === 202) {
    return { ok:true, status:"processando", ref, raw: data };
  }
  return { ok:false, error: data.mensagem || `Erro ${r.status}`, detalhes: data.erros, raw: data };
}

// ───────────────────────── Focus NFC-e (venda no balcão) ─────────────────────────
// Forma de pagamento (tPag): 01 Dinheiro / 03 Crédito / 04 Débito / 20 Pix estático.
// Usamos Pix "estático" (20) em vez do "dinâmico" (17) porque o último passou a
// exigir dados de maquininha/TEF integrados (NT 2025.001) que não temos hoje.
const FORMA_PAGAMENTO_NFCE = { dinheiro: "01", credito: "03", debito: "04", pix: "20" };

async function issueViaFocusNFCe({ token, ambiente, empresa, order, ref }) {
  const baseUrl = ambiente === "producao" ? "https://api.focusnfe.com.br/v2" : "https://homologacao.focusnfe.com.br/v2";
  const auth = "Basic " + Buffer.from(token + ":").toString("base64");

  const payload = {
    cnpj_emitente: soNumeros(empresa.cnpj),
    data_emissao: new Date().toISOString(),
    presenca_comprador: "1", // presencial (balcão)
    modalidade_frete: "9",
    local_destino: "1",
    natureza_operacao: "VENDA AO CONSUMIDOR",
    items: (order.itemsList||[]).map((it, i) => ({
      numero_item: String(i+1),
      codigo_ncm: (it.ncm||"00000000").replace(/\D/g,""),
      codigo_produto: it.sku || it._prodId || String(i+1),
      descricao: it.description || it.name,
      quantidade_comercial: Number(it.qty)||1,
      quantidade_tributavel: Number(it.qty)||1,
      cfop: it.cfop || "5102",
      valor_unitario_comercial: Number(it.unitPrice)||0,
      valor_unitario_tributavel: Number(it.unitPrice)||0,
      valor_bruto: Number(it.total)||0,
      unidade_comercial: "UN", unidade_tributavel: "UN",
      icms_origem: "0",
      icms_situacao_tributaria: empresa.regime === "Simples Nacional" ? "102" : "41",
    })),
    formas_pagamento: [{
      forma_pagamento: FORMA_PAGAMENTO_NFCE[order.payment] || "99",
      valor_pagamento: Number(order.total)||0,
      tipo_integracao: "2", // não integrado (sem maquininha conectada ao sistema)
    }],
  };

  const r = await fetch(`${baseUrl}/nfce?ref=${encodeURIComponent(ref)}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(()=>({}));
  if (r.status === 201 && data.status === "autorizado") {
    return { ok:true, status:"autorizado", chave: data.chave_nfe, numero: data.numero, serie: data.serie,
      pdfUrl: data.caminho_danfe ? `https://api.focusnfe.com.br${data.caminho_danfe}` : null,
      qrcodeUrl: data.qrcode_url || null, raw: data };
  }
  return { ok:false, error: data.mensagem_sefaz || data.mensagem || `Erro ${r.status}`, raw: data };
}

// ───────────────────────── NFe.io ─────────────────────────
async function issueViaNFeIo({ token, ambiente, empresa, order, ref }) {
  const baseUrl = "https://api.nfe.io/v1";
  const auth = "Basic " + Buffer.from(token + ":").toString("base64");
  const cnpjDest = soNumeros(order.cpfCnpj || order.customerCnpj);
  const isCnpj = cnpjDest.length === 14;

  const payload = {
    operationType: "Outgoing",
    purposeType: "Normal",
    destination: "Internal_Operation",
    consumerType: "FinalConsumer",
    presenceType: "Internet",
    buyer: {
      name: order.customer,
      federalTaxNumber: cnpjDest,
      type: isCnpj ? "LegalPerson" : "NaturalPerson",
      stateTaxNumberIndicator: "NonTaxPayer",
      address: {
        street: empresa.rua||"", number: empresa.numero||"", district: empresa.bairro||"",
        city: { name: empresa.cidade||"" }, state: empresa.estado||"", postalCode: soNumeros(empresa.cep), country: "BRA",
      },
    },
    items: (order.itemsList||[]).map(it => ({
      code: it.sku || it._prodId || "",
      description: it.description || it.name,
      ncm: (it.ncm||"00000000").replace(/\D/g,""),
      cfop: Number(it.cfop || 5102),
      quantity: Number(it.qty)||1,
      unit: "UN",
      unitAmount: Number(it.unitPrice)||0,
      totalAmount: Number(it.total)||0,
      totalIndicator: true,
    })),
  };

  const r = await fetch(`${baseUrl}/companies/${soNumeros(empresa.cnpj)}/productinvoices`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(()=>({}));
  if (r.ok) {
    return { ok:true, status:"processando", id: data.id, raw: data };
  }
  return { ok:false, error: data.message || `Erro ${r.status}`, raw: data };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });
  if (!SB_URL || !SB_SECRET) return res.status(500).json({ error: "Servidor não configurado" });

  const authHeader = req.headers.authorization || "";
  const sessionToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const session = await validateSession(sessionToken);
  if (!session) return res.status(401).json({ error: "Sessão inválida ou expirada, faça login novamente" });

  try {
    const { order, ref, tipo } = req.body || {};
    if (!order) return res.status(400).json({ error: "Informe os dados do pedido" });
    const docTipo = tipo === "nfce" ? "nfce" : "nfe";

    const fiscalCfg = await getKv("erp-mmarmarinhos-params", session.tenant_id); // params completo
    const fiscal = fiscalCfg?.fiscal;
    const empresa = await getKv("erp_empresa_dados", session.tenant_id);

    if (!fiscal || !fiscal.provider || !fiscal.token) {
      return res.status(400).json({ error: "Nenhum fornecedor de NF-e configurado. Acesse Parâmetros > Fiscal." });
    }
    if (!empresa || !empresa.cnpj) {
      return res.status(400).json({ error: "Dados da empresa incompletos. Acesse Parâmetros > Empresa." });
    }

    const args = { token: fiscal.token, ambiente: fiscal.ambiente||"homologacao", empresa, order, ref: ref || `mmerp-${Date.now()}` };

    let result;
    if (docTipo === "nfce") {
      if (fiscal.provider !== "focus") return res.status(400).json({ error: "Emissão de NFC-e hoje só está disponível pelo fornecedor Focus NFe." });
      result = await issueViaFocusNFCe(args);
    } else if (fiscal.provider === "focus") result = await issueViaFocusNFe(args);
    else if (fiscal.provider === "nfeio") result = await issueViaNFeIo(args);
    else return res.status(400).json({ error: "Fornecedor de NF-e não reconhecido" });

    if (!result.ok) return res.status(422).json(result);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro em /api/nfe-issue:", err);
    return res.status(500).json({ error: "Erro interno: " + err.message });
  }
}
