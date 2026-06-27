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
    `${SB_URL}/rest/v1/sessions?token=eq.${encodeURIComponent(token)}&select=username,role,expires_at&limit=1`,
    { headers: secretHeaders() }
  );
  if (!r.ok) return null;
  const rows = await r.json();
  const session = rows && rows[0];
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
}

async function getKv(key) {
  const r = await fetch(`${SB_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}&limit=1`, { headers: secretHeaders() });
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
    items: (order.itemsList||[]).map((it, i) => ({
      numero_item: i+1,
      codigo_produto: it.sku || it._prodId || String(i+1),
      descricao: it.description || it.name,
      cfop: it.cfop || "5102",
      quantidade_comercial: Number(it.qty)||1,
      valor_unitario_comercial: Number(it.unitPrice)||0,
      valor_bruto: Number(it.total)||0,
      codigo_ncm: (it.ncm || "00000000").replace(/\D/g,""),
      unidade_comercial: "UN", unidade_tributavel: "UN",
      inclui_no_total: 1,
      icms_origem: 0,
      icms_situacao_tributaria: empresa.regime === "Simples Nacional" ? "102" : "41",
    })),
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
    const { order, ref } = req.body || {};
    if (!order) return res.status(400).json({ error: "Informe os dados do pedido" });

    const fiscalCfg = await getKv("erp-mmarmarinhos-params"); // params completo
    const fiscal = fiscalCfg?.fiscal;
    const empresa = await getKv("erp_empresa_dados");

    if (!fiscal || !fiscal.provider || !fiscal.token) {
      return res.status(400).json({ error: "Nenhum fornecedor de NF-e configurado. Acesse Parâmetros > Fiscal." });
    }
    if (!empresa || !empresa.cnpj) {
      return res.status(400).json({ error: "Dados da empresa incompletos. Acesse Parâmetros > Empresa." });
    }

    const args = { token: fiscal.token, ambiente: fiscal.ambiente||"homologacao", empresa, order, ref: ref || `mmerp-${Date.now()}` };

    let result;
    if (fiscal.provider === "focus") result = await issueViaFocusNFe(args);
    else if (fiscal.provider === "nfeio") result = await issueViaNFeIo(args);
    else return res.status(400).json({ error: "Fornecedor de NF-e não reconhecido" });

    if (!result.ok) return res.status(422).json(result);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro em /api/nfe-issue:", err);
    return res.status(500).json({ error: "Erro interno: " + err.message });
  }
}
