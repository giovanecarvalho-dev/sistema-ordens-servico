"use client";
import { useEffect, useState, useCallback } from "react";
import api from "./services/api";

const isUrlSegura = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const apiEnvUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const backendUrl = new URL(apiEnvUrl);
    
    const hostAnexo = parsedUrl.hostname.toLowerCase();
    const hostBackend = backendUrl.hostname.toLowerCase();
    
    // Conjunto de domínios/hosts confiáveis
    const hostnamesConfiaveis = new Set([
      hostBackend,
      'localhost',
      '127.0.0.1'
    ]);
    
    // Adiciona o hostname onde o frontend está rodando no navegador (ex: IP local ou domínio de produção)
    if (typeof window !== 'undefined') {
      hostnamesConfiaveis.add(window.location.hostname.toLowerCase());
    }
    
    return hostnamesConfiaveis.has(hostAnexo);
  } catch {
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
};

export default function ListaChamados() {
  // --- 1. ESTADOS DE DADOS ---
  const [ordens, setOrdens] = useState([]);
  const [meta, setMeta] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  const [filtros, setFiltros] = useState({
    busca: "",
    status: "",
    categoria: "",
    urgencia: "",
    prioridade: "",
    page: 1,
    per_page: 15
  });

  // --- ESTADOS AUXILIARES (METADADOS DA API) ---
  const [listaCategorias, setListaCategorias] = useState<any[]>([]);
  const [listaStatus, setListaStatus] = useState<any[]>([]);
  const [listaUrgencias, setListaUrgencias] = useState<any[]>([]);
  const [listaPrioridades, setListaPrioridades] = useState<any[]>([]);

  const categorias = listaCategorias.length ? listaCategorias : [
    { id: 1, nome: "Rede" }, { id: 2, nome: "Acesso" }, { id: 3, nome: "Infraestrutura" }
  ];
  const statusList = listaStatus.length ? listaStatus : [
    { id: 1, nome: "Novo" }, { id: 2, nome: "Em Andamento" }, { id: 3, nome: "Aguardando Peça" }, { id: 4, nome: "Pausado" }, { id: 5, nome: "Fechado" }, { id: 6, nome: "Concluído" }
  ];
  const urgenciasList = listaUrgencias.length ? listaUrgencias : [
    { id: 1, nome: "Baixa" }, { id: 2, nome: "Media" }, { id: 3, nome: "Alta" }, { id: 4, nome: "Muito Alta" }
  ];
  const prioridadesList = listaPrioridades.length ? listaPrioridades : [
    { id: 1, nome: "Baixa" }, { id: 2, nome: "Media" }, { id: 3, nome: "Alta" }, { id: 4, nome: "Muito Alta" }
  ];

  // --- 2. ESTADOS DE INTERFACE E MODAL ---
  const [tecnicos, setTecnicos] = useState([]);

  const [chamadoSelecionado, setChamadoSelecionado] = useState<any>(null);
  const [tecnicoId, setTecnicoId] = useState("");
  const [status, setStatus] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [solucao, setSolucao] = useState("");
  const [motivoPausa, setMotivoPausa] = useState("");
  const [editAnexo, setEditAnexo] = useState<File | null>(null);
  const [anexoPreview, setAnexoPreview] = useState<{url: string, osId: number} | null>(null);

  const [cargo, setCargo] = useState("");
  const [meuUsuarioId, setMeuUsuarioId] = useState("");

  // --- 3. BUSCA DE DADOS (SERVER-SIDE) ---
  const buscarChamados = useCallback(async () => {
    setCarregando(true);
    try {
      // Pega os dados locais direto na hora do request para garantir que não vai vazio
      const currentCargo = localStorage.getItem("usuarioCargo") || "";
      const currentUserId = localStorage.getItem("usuarioId") || "";

      // Monta os parâmetros que serão enviados na URL da API
      const params: any = {
        page: filtros.page,
        per_page: filtros.per_page,
      };
     if (filtros.busca) {
       if (/^\d+$/.test(filtros.busca.trim())) {
    params.id = filtros.busca.trim();
      } else {
    params.busca = filtros.busca;
      }
      }
      if (filtros.status) params.status = filtros.status;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.urgencia) params.urgencia = filtros.urgencia;
      if (filtros.prioridade) params.prioridade = filtros.prioridade;

      // Se for técnico, a API do Laravel vai filtrar apenas os chamados dele
      if (currentCargo === "Tecnico" && currentUserId) {
        params.tecnico_id = currentUserId;
      }

      // Apenas admins podem buscar a lista de usuários técnicos
      let resTecnicos = null;
      if (currentCargo === "Admin") {
        try {
          resTecnicos = await api.get("/usuarios", {
            params: {
              cargo: "Tecnico,Admin",
              per_page: 100,
              ativo: true
            }
          });
        } catch (err) {
          console.error("Erro ao carregar lista de técnicos", err);
        }
      }

      const resOrdens = await api.get("/ordens", { params });

      // Laravel paginate() retorna { data: [...], current_page, last_page, per_page, total, ... }
      const resData = resOrdens.data;
      const listaOrdens = Array.isArray(resData) ? resData : (resData?.data || []);
      const listaTecnicos = resTecnicos ? (Array.isArray(resTecnicos.data) ? resTecnicos.data : (resTecnicos.data?.data || [])) : [];

      setOrdens(listaOrdens);
      setTecnicos(listaTecnicos);

      // Extrai os metadados de paginação do Laravel
      if (!Array.isArray(resData) && resData?.last_page) {
        setMeta({
          current_page: resData.current_page,
          last_page: resData.last_page,
          per_page: resData.per_page,
          total: resData.total,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    // Busca dados auxiliares/meta da API para evitar opções hardcoded
    Promise.all([
      api.get("/categorias"),
      api.get("/status"),
      api.get("/urgencias"),
      api.get("/prioridades")
    ]).then(([resCat, resStatus, resUrg, resPri]) => {
      setListaCategorias(resCat.data);
      setListaStatus(resStatus.data);
      setListaUrgencias(resUrg.data);
      setListaPrioridades(resPri.data);
    }).catch(err => console.error("Erro ao carregar dados auxiliares da API", err));

    // Busca os dados atualizados do perfil diretamente da API, ignorando manipulação manual de localStorage
    api.get("/perfil")
      .then((res) => {
        const perfilCargo = res.data.cargo?.nome || res.data.cargo || "";
        const perfilId = res.data.id?.toString() || "";
        
        setCargo(perfilCargo);
        setMeuUsuarioId(perfilId);
        
        // Sincroniza o localStorage com a verdade do servidor (apenas para UX, a segurança real vem do backend)
        localStorage.setItem("usuarioCargo", perfilCargo);
        localStorage.setItem("usuarioId", perfilId);
      })
      .catch((err) => {
        console.error("Erro ao validar perfil", err);
      });
  }, []);

  // Refaz a busca na API toda vez que um filtro mudar (com um leve atraso para a digitação)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      buscarChamados();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filtros, buscarChamados]);

  // Reflete apenas o que o back enviou
  const statusSla = (os: any) => {
    const statusNome = os.status?.nome || os.status;
    if (statusNome === "Fechado") return null;
    if (["Pausado", "Aguardando Peça"].includes(statusNome)) return "pausado";

    // O Laravel envia essa propriedade pronta com 'ok', 'alerta' ou 'vencido'
    return os.status_sla || null;
  };
  const deletarChamado = async (id: number) => {
    if (confirm("Deseja excluir este chamado permanentemente?")) {
      try {
        await api.delete(`/ordens/${id}`);

        buscarChamados();
      } catch (err) { alert("Erro ao excluir."); }
    }
  };

  const abrirModalEdicao = (os: any) => {
    setChamadoSelecionado(os);
    setStatus(os.status?.nome || os.status);
    setTecnicoId(os.tecnico_id || "");
    setUrgencia(os.urgencia?.nome || os.urgencia || "Média");
    setPrioridade(os.prioridade?.nome || os.prioridade || "Média");
    setSolucao(os.solucao || "");
    setMotivoPausa(os.motivo_pausa || "");
    setEditAnexo(null);
  };

  const salvarEdicao = async (e: any) => {
    e.preventDefault();
    try {
      if (editAnexo) {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("status", status);
        formData.append("solucao", solucao || "");
        if (["Pausado", "Aguardando Peça"].includes(status)) formData.append("motivo_pausa", motivoPausa || "");
        if (cargo === "Admin") {
          formData.append("urgencia", urgencia);
          formData.append("prioridade", prioridade);
          formData.append("tecnico_id", tecnicoId || "");
        }
        formData.append("anexo", editAnexo);

        await api.post(`/ordens/${chamadoSelecionado.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        const payload: any = {
          status,
          solucao,
          motivo_pausa: ["Pausado", "Aguardando Peça"].includes(status) ? motivoPausa : null
        };

        if (cargo === "Admin") {
          payload.urgencia = urgencia;
          payload.prioridade = prioridade;
          payload.tecnico_id = tecnicoId || null;
        }

        await api.put(`/ordens/${chamadoSelecionado.id}`, payload);
      }
      setChamadoSelecionado(null);
      setEditAnexo(null);
      buscarChamados();
    } catch (err) {
      alert("Erro ao atualizar a ordem de serviço.");
    }
  };

  const urgenciaCor: any = {
    "Muito Alta": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Alta: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Média: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Baixa: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const categoriaCor: any = {
    Rede: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Infraestrutura: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Acesso: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  const slaLabel: any = {
    vencido: "🔴 SLA Vencido",
    alerta: "🟡 SLA em Risco",
    ok: "🟢 No Prazo",
    pausado: "⏸️ SLA Suspenso",
  };

  const selectClass = "w-full p-3 mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500";
  const filterClass = "p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white";

  const ordensExibicao = Array.isArray(ordens) ? ordens : [];

  const renderPagination = () => {
    if (!meta || meta.last_page <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, filtros.page - Math.floor(maxVisible / 2));
    let end = Math.min(meta.last_page, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const buttonClass = (isActive: boolean) =>
      `w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-xs font-bold ${
        isActive
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      }`;

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setFiltros({ ...filtros, page: i })}
          className={buttonClass(filtros.page === i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex gap-1 items-center">
        {start > 1 && (
          <>
            <button onClick={() => setFiltros({ ...filtros, page: 1 })} className={buttonClass(filtros.page === 1)}>
              1
            </button>
            {start > 2 && <span className="px-1 text-slate-400">...</span>}
          </>
        )}
        {pages}
        {end < meta.last_page && (
          <>
            {end < meta.last_page - 1 && <span className="px-1 text-slate-400">...</span>}
            <button onClick={() => setFiltros({ ...filtros, page: meta.last_page })} className={buttonClass(filtros.page === meta.last_page)}>
              {meta.last_page}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <>
    <div className="p-4 md:p-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Gestão de Chamados</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Visualize e gerencie as ordens de serviço.</p>
        </div>
        <input
          type="text"
          placeholder="Filtrar por ID ou título..."
          className={`${filterClass} w-64`}
          value={filtros.busca}
          onChange={(e) => setFiltros({ ...filtros, busca: e.target.value, page: 1 })}
        />
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value, page: 1 })} className={filterClass}>
          <option value="">Todos os status</option>
          {statusList.map((s: any) => (
            <option key={s.id} value={s.nome}>{s.nome}</option>
          ))}
        </select>
        <select value={filtros.categoria} onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value, page: 1 })} className={filterClass}>
          <option value="">Todas as categorias</option>
          {categorias.map((c: any) => (
            <option key={c.id} value={c.nome}>{c.nome}</option>
          ))}
        </select>
        <select value={filtros.urgencia} onChange={(e) => setFiltros({ ...filtros, urgencia: e.target.value, page: 1 })} className={filterClass}>
          <option value="">Todas as urgências</option>
          {urgenciasList.map((u: any) => (
            <option key={u.id} value={u.nome}>{u.nome}</option>
          ))}
        </select>
        <select value={filtros.prioridade} onChange={(e) => setFiltros({ ...filtros, prioridade: e.target.value, page: 1 })} className={filterClass}>
          <option value="">Todas as prioridades</option>
          {prioridadesList.map((p: any) => (
            <option key={p.id} value={p.nome}>{p.nome}</option>
          ))}
        </select>
        <select value={filtros.per_page} onChange={(e) => setFiltros({ ...filtros, per_page: Number(e.target.value), page: 1 })} className={filterClass}>
          <option value={15}>15 por página</option>
          <option value={30}>30 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>
        {(filtros.status || filtros.categoria || filtros.urgencia || filtros.prioridade) && (
          <button onClick={() => setFiltros({ ...filtros, status: "", categoria: "", urgencia: "", prioridade: "", page: 1, per_page: 15 })} className="text-xs font-bold text-red-400 hover:text-red-600 px-3">
            Limpar filtros
          </button>
        )}
      </div>

      {/* TABELA COM TODAS AS COLUNAS RESTAURADAS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
        <table className="w-full text-left text-[11px] table-fixed">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-2 py-3 w-[4%]">ID</th>
              <th className="px-2 py-3 w-[10%]">Título</th>
              <th className="px-2 py-3 w-[7%]">Categoria</th>
              <th className="px-2 py-3 w-[8%]">Localização</th>
              <th className="px-2 py-3 w-[7%]">Aberto por</th>
              <th className="px-2 py-3 w-[7%] text-center">Abertura</th>
              <th className="px-2 py-3 w-[8%] text-center">SLA</th>
              <th className="px-2 py-3 w-[8%] text-center">Status</th>
              <th className="px-2 py-3 w-[8%]">Motivo</th>
              <th className="px-2 py-3 w-[7%] text-center">Urgência</th>
              <th className="px-2 py-3 w-[7%] text-center">Prioridade</th>
              <th className="px-2 py-3 w-[7%]">Técnico</th>
              <th className="px-2 py-3 w-[7%]">Solução</th>
              <th className="px-2 py-3 w-[5%] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {ordensExibicao.length === 0 && (
              <tr>
                <td colSpan={14} className="px-6 py-10 text-center text-slate-400 dark:text-slate-600 italic text-sm">
                  Nenhum chamado encontrado.
                </td>
              </tr>
            )}
            {ordensExibicao.map((os: any) => {
              const slaStatus = statusSla(os);
              return (
                <tr
                  key={os.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${slaStatus === "vencido" ? "border-l-4 border-red-500" : slaStatus === "alerta" ? "border-l-4 border-yellow-400" : ""}`}
                >
                  <td className="px-2 py-3 font-mono text-blue-600 dark:text-blue-400 truncate overflow-hidden">#{os.id}</td>
                  <td className="px-2 py-3 font-bold text-slate-800 dark:text-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="truncate overflow-hidden">{os.titulo}</span>
                      {os.anexo_url && (
                        <button onClick={() => setAnexoPreview({url: os.anexo_url, osId: os.id})} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold uppercase flex-shrink-0 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">📎 Anexo</button>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 overflow-hidden">
                    <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${categoriaCor[os.categoria?.nome || os.categoria] || "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {os.categoria?.nome || os.categoria || "-"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-500 dark:text-slate-400 text-[10px] truncate overflow-hidden">
                    {os.localizacao || <span className="italic text-slate-300 dark:text-slate-600">Não informada</span>}
                  </td>
                  <td className="px-2 py-3 text-slate-500 dark:text-slate-400 text-[10px] truncate overflow-hidden">
                    {os.usuario?.nome || "-"}
                  </td>
                  <td className="px-2 py-3 text-slate-500 dark:text-slate-400 text-[10px] text-center truncate overflow-hidden">
                    {os.criado_em ? new Date(os.criado_em).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="px-2 py-3 text-center overflow-hidden">
                    {slaStatus ? (
                      <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase truncate ${slaStatus === "vencido" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : slaStatus === "alerta" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : slaStatus === "pausado" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {slaLabel[slaStatus]}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">—</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center overflow-hidden">
                    <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase truncate ${(os.status?.nome || os.status) === "Fechado" ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      : ["Pausado", "Aguardando Peça"].includes(os.status?.nome || os.status) ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : (os.status?.nome || os.status) === "Em Andamento" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {os.status?.nome || os.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 overflow-hidden">
                    {os.motivo_pausa ? (
                      <span
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block truncate"
                        title={os.motivo_pausa}
                      >
                        {os.motivo_pausa}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">—</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center overflow-hidden">
                    <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${urgenciaCor[os.urgencia?.nome || os.urgencia] || "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {os.urgencia?.nome || os.urgencia || "-"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center overflow-hidden">
                    <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${urgenciaCor[os.prioridade?.nome || os.prioridade] || "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {os.prioridade?.nome || os.prioridade || "-"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-500 dark:text-slate-400 text-[10px] truncate overflow-hidden">
                    {os.tecnico?.nome || <span className="italic text-slate-300 dark:text-slate-600">Não atribuído</span>}
                  </td>
                  <td className="px-2 py-3 text-slate-500 dark:text-slate-400 overflow-hidden">
                    {os.solucao ? (
                      <span className="truncate block text-[10px]" title={os.solucao}>
                        {os.solucao}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">Sem solução</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-right overflow-hidden">
                    <button onClick={() => abrirModalEdicao(os)} className="text-blue-600 font-bold mr-1 hover:underline text-[10px]">
                      EDITAR
                    </button>
                    {cargo === "Admin" && (
                      <button onClick={() => deletarChamado(os.id)} className="text-red-500 font-bold hover:underline text-[10px]">
                        EXCLUIR
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINAÇÃO */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 flex-wrap">
          <button
            disabled={filtros.page === 1}
            onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Anterior
          </button>
          
          {renderPagination()}

          <div className="text-center hidden md:block">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">
              Página {filtros.page} de {meta.last_page}
            </span>
            <span className="text-[10px] text-slate-400">{meta.total} registro{meta.total !== 1 ? 's' : ''} no total</span>
          </div>
          <button
            disabled={filtros.page === meta.last_page}
            onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Próximo
          </button>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {chamadoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">
              Editar Chamado #{chamadoSelecionado.id}
            </h3>
            <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold">
              {chamadoSelecionado.titulo}
            </p>
            <form onSubmit={salvarEdicao} className="space-y-4">
              {cargo === "Admin" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Técnico</label>
                    <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} className={selectClass}>
                      <option value="">Não atribuído</option>
                      {tecnicos.filter((t: any) => (t.cargo?.nome || t.cargo) === "Tecnico" || (t.cargo?.nome || t.cargo) === "Admin").map((t: any) => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Urgência</label>
                      <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)} className={selectClass}>
                        {urgenciasList.map((u: any) => (
                          <option key={u.id} value={u.nome}>{u.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Prioridade</label>
                      <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className={selectClass}>
                        {prioridadesList.map((p: any) => (
                          <option key={p.id} value={p.nome}>{p.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                  {statusList.map((s: any) => {
                    if (s.nome === "Novo" && cargo !== "Admin") return null;
                    return (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    );
                  })}
                </select>
              </div>

              {["Pausado", "Aguardando Peça"].includes(status) && (
                <div className="mt-2">
                  <label className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase">
                    Motivo da Pausa / Pendência
                  </label>
                  <textarea
                    value={motivoPausa}
                    onChange={(e) => setMotivoPausa(e.target.value)}
                    maxLength={150}
                    placeholder="Descreva o motivo (máx 150 caracteres)..."
                    className={`${selectClass} h-20 resize-none border-indigo-200 dark:border-indigo-900/50 focus:ring-indigo-500`}
                    required
                  />
                  <div className="text-[10px] text-right text-slate-400 mt-1">
                    {motivoPausa.length}/150
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Solução</label>
                <textarea
                  value={solucao}
                  onChange={(e) => setSolucao(e.target.value)}
                  placeholder="O que foi feito para resolver este chamado?"
                  className={`${selectClass} h-28 resize-none text-sm`}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Anexo</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditAnexo(e.target.files?.[0] || null)} className="mt-1 text-sm text-slate-500" />
                {chamadoSelecionado.anexo_url && (
                  <div className="text-[12px] mt-1">
                    <button type="button" onClick={() => setAnexoPreview({url: chamadoSelecionado.anexo_url, osId: chamadoSelecionado.id})} className="text-blue-600 underline hover:text-blue-800 transition-colors">Visualizar anexo atual</button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setChamadoSelecionado(null)} className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200">
                  CANCELAR
                </button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20">
                  SALVAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

      {/* MODAL DE PREVIEW DO ANEXO */}
      {anexoPreview && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={() => setAnexoPreview(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Visualizar Anexo</h3>
              <div className="flex items-center gap-2">
                <button onClick={async () => {
                  try {
                    const res = await api.get(`/ordens/${anexoPreview.osId}/anexo`, { responseType: 'blob' });
                    const url = window.URL.createObjectURL(res.data);
                    const a = document.createElement('a');
                    a.href = url;
                    const ext = anexoPreview.url.split('.').pop() || 'pdf';
                    a.download = `anexo_os_${anexoPreview.osId}.${ext}`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch { alert('Erro ao baixar anexo.'); }
                }} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">BAIXAR</button>
                <button onClick={() => setAnexoPreview(null)} className="px-3 py-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold transition-colors">FECHAR</button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center min-h-[400px]">
              {!isUrlSegura(anexoPreview.url) ? (
                <div className="text-red-500 font-bold text-sm text-center">
                  ⚠️ URL de anexo bloqueada por motivos de segurança (domínio externo não confiável).
                </div>
              ) : anexoPreview.url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                <img src={anexoPreview.url} alt="Anexo" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : (
                <iframe src={anexoPreview.url} className="w-full h-[70vh] rounded-lg border-0" title="Anexo PDF" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}