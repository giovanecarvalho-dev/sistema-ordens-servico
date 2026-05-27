"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import api from "./services/api";
import Paginacao from "./components/Paginacao";

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

const renderSlaInfo = (os: any) => {
  if (!os || !os.sla_limite_data) return null;
  
  const statusSla = os.status_sla;
  const statusNome = os.status?.nome || os.status;
  if (statusNome === "Fechado") return null;

  const deadline = new Date(os.sla_limite_data);
  const now = new Date();
  
  const diffMs = deadline.getTime() - now.getTime();
  const diffMinTotal = Math.floor(diffMs / (1000 * 60));
  const isOverdue = diffMinTotal < 0;
  
  const absMin = Math.abs(diffMinTotal);
  const horas = Math.floor(absMin / 60);
  const minutos = absMin % 60;
  
  let formattedTime = "";
  if (horas > 0) {
    formattedTime = `${horas}h e ${minutos}min`;
  } else {
    formattedTime = `${minutos}min`;
  }

  let textClass = "text-green-600 dark:text-green-400";
  let bgClass = "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30";
  
  if (statusSla === "vencido") {
    textClass = "text-red-600 dark:text-red-400 font-bold";
    bgClass = "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30";
  } else if (statusSla === "alerta") {
    textClass = "text-yellow-600 dark:text-yellow-400 font-bold";
    bgClass = "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30";
  } else if (statusSla === "pausado") {
    textClass = "text-indigo-600 dark:text-indigo-400";
    bgClass = "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/30";
  }

  return (
    <div className={`p-4 rounded-xl border ${bgClass} mb-6 flex flex-col gap-1.5`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Controle de SLA</span>
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
          statusSla === "vencido" ? "bg-red-100 text-red-700" :
          statusSla === "alerta" ? "bg-yellow-100 text-yellow-700" :
          statusSla === "pausado" ? "bg-indigo-100 text-indigo-700" :
          "bg-green-100 text-green-700"
        }`}>
          {statusSla === "vencido" ? "Vencido" :
           statusSla === "alerta" ? "Em Alerta" :
           statusSla === "pausado" ? "Pausado" : "No Prazo"}
        </span>
      </div>
      <div className="flex justify-between items-end mt-1">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">Prazo de Resolução</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {deadline.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">
            {statusSla === "pausado" ? "Contagem Suspensa" : isOverdue ? "Atrasado há" : "Tempo Restante"}
          </span>
          <span className={`text-sm font-black ${textClass}`}>
            {statusSla === "pausado" ? "—" : formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
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
  const statusList = (listaStatus.length ? listaStatus : [
    { id: 1, nome: "Novo" }, { id: 2, nome: "Em Andamento" }, { id: 3, nome: "Aguardando Peça" }, { id: 4, nome: "Pausado" }, { id: 5, nome: "Fechado" }
  ]).filter((s: any) => s.nome !== "Concluído");
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
  const [abaModal, setAbaModal] = useState<"comentarios" | "historico">("comentarios");
  const [novoComentario, setNovoComentario] = useState("");
  const inputComentarioRef = useRef<HTMLInputElement>(null);


  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [comentarioEditandoId, setComentarioEditandoId] = useState<number | null>(null);
  const [comentarioEditandoConteudo, setComentarioEditandoConteudo] = useState("");
  const [comentarioRespondendo, setComentarioRespondendo] = useState<any>(null);

  useEffect(() => {
    if (comentarioRespondendo) {
      // Pequeno timeout para garantir que o render ocorreu antes de focar
      setTimeout(() => {
        inputComentarioRef.current?.focus();
      }, 50);
    }
  }, [comentarioRespondendo]);

  const salvarEdicaoComentario = async (id: number) => {
    try {
      await api.put(`/ordens/${chamadoSelecionado.id}/comentarios/${id}`, { conteudo: comentarioEditandoConteudo });
      setComentarioEditandoId(null);
      await recarregarChamado(chamadoSelecionado.id);
    } catch (err) { alert("Erro ao editar comentário."); }
  };

  const deletarComentario = async (id: number, tipo: 'mim' | 'todos') => {
    if (confirm(`Deseja excluir este comentário para ${tipo === 'todos' ? 'todos' : 'você'}?`)) {
      try {
        await api.delete(`/ordens/${chamadoSelecionado.id}/comentarios/${id}?tipo=${tipo}`);
        await recarregarChamado(chamadoSelecionado.id);
      } catch (err) { alert("Erro ao excluir comentário."); }
    }
  };

  const [cargo, setCargo] = useState("");
  const [meuUsuarioId, setMeuUsuarioId] = useState("");

  // --- 3. BUSCA DE DADOS (SERVER-SIDE) ---
  const buscarChamados = useCallback(async () => {
    setCarregando(true);
    try {
      // Pega os dados locais direto na hora do request para garantir que não vai vazio
      const currentCargo = sessionStorage.getItem("usuarioCargo") || "";
      const currentUserId = sessionStorage.getItem("usuarioId") || "";

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
    // 1. Inicialização síncrona com base no sessionStorage para evitar atraso visual
    const localCargo = sessionStorage.getItem("usuarioCargo") || "";
    const localId = sessionStorage.getItem("usuarioId") || "";
    setCargo(localCargo);
    setMeuUsuarioId(localId);

    // Helpers de cache em sessionStorage
    const getCachedData = (key: string) => {
      try {
        const val = sessionStorage.getItem(key);
        return val ? JSON.parse(val) : null;
      } catch { return null; }
    };
    const setCachedData = (key: string, val: any) => {
      try { sessionStorage.setItem(key, JSON.stringify(val)); } catch {}
    };

    const cachedCat = getCachedData("aux_categorias");
    const cachedStatus = getCachedData("aux_status");
    const cachedUrg = getCachedData("aux_urgencias");
    const cachedPri = getCachedData("aux_prioridades");

    if (cachedCat && cachedStatus && cachedUrg && cachedPri) {
      setListaCategorias(cachedCat);
      setListaStatus(cachedStatus);
      setListaUrgencias(cachedUrg);
      setListaPrioridades(cachedPri);
    } else {
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

        setCachedData("aux_categorias", resCat.data);
        setCachedData("aux_status", resStatus.data);
        setCachedData("aux_urgencias", resUrg.data);
        setCachedData("aux_prioridades", resPri.data);
      }).catch(err => console.error("Erro ao carregar dados auxiliares da API", err));
    }

    // Busca perfil em segundo plano apenas se ainda não estiver definido localmente
    if (!localCargo || !localId) {
      api.get("/perfil")
        .then((res) => {
          const perfilCargo = res.data.cargo?.nome || res.data.cargo || "";
          const perfilId = res.data.id?.toString() || "";
          
          setCargo(perfilCargo);
          setMeuUsuarioId(perfilId);
          
          sessionStorage.setItem("usuarioCargo", perfilCargo);
          sessionStorage.setItem("usuarioId", perfilId);
        })
        .catch((err) => {
          console.error("Erro ao validar perfil", err);
        });
    }
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

  const abrirModalEdicao = async (os: any) => {
    setAbaModal("comentarios");
    setNovoComentario("");
    try {
      const res = await api.get(`/ordens/${os.id}`);
      const osDetalhes = res.data;
      setChamadoSelecionado(osDetalhes);
      setStatus(osDetalhes.status?.nome || osDetalhes.status || "Novo");
      setTecnicoId(osDetalhes.tecnico_id || "");
      setUrgencia(osDetalhes.urgencia?.nome || osDetalhes.urgencia || "Média");
      setPrioridade(osDetalhes.prioridade?.nome || osDetalhes.prioridade || "Média");
      setSolucao(osDetalhes.solucao || "");
      setMotivoPausa(osDetalhes.motivo_pausa || "");
      setEditAnexo(null);
    } catch (err) {
      console.error("Erro ao carregar detalhes do chamado", err);
      setChamadoSelecionado(os);
      setStatus(os.status?.nome || os.status);
      setTecnicoId(os.tecnico_id || "");
      setUrgencia(os.urgencia?.nome || os.urgencia || "Média");
      setPrioridade(os.prioridade?.nome || os.prioridade || "Média");
      setSolucao(os.solucao || "");
      setMotivoPausa(os.motivo_pausa || "");
      setEditAnexo(null);
    }
  };

  const recarregarChamado = async (id: number) => {
    try {
      const res = await api.get(`/ordens/${id}`);
      setChamadoSelecionado(res.data);
    } catch (err) {
      console.error("Erro ao recarregar chamado", err);
    }
  };

  const enviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoComentario.trim() || enviandoComentario) return;

    setEnviandoComentario(true);
    try {
      await api.post(`/ordens/${chamadoSelecionado.id}/comentarios`, {
        conteudo: novoComentario,
        parent_id: comentarioRespondendo ? comentarioRespondendo.id : null
      });
      setNovoComentario("");
      setComentarioRespondendo(null);
      await recarregarChamado(chamadoSelecionado.id);
    } catch (err) {
      alert("Erro ao enviar comentário.");
    } finally {
      setEnviandoComentario(false);
    }
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

  const renderLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => 
      urlRegex.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline break-all font-semibold" onClick={(e) => e.stopPropagation()}>{part}</a> : part
    );
  };

  const renderFormComentario = () => (
    <div className="mt-auto border-t border-slate-150 dark:border-slate-800/80 pt-3 flex flex-col gap-2">
      {comentarioRespondendo && (
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl flex justify-between items-start border-l-4 border-blue-500 shadow-sm relative">
          <div className="pr-6">
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">Respondendo a {comentarioRespondendo.usuario_nome}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-[250px] italic">{comentarioRespondendo.conteudo}</p>
          </div>
          <button type="button" onClick={() => setComentarioRespondendo(null)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      )}
      <form onSubmit={enviarComentario} className="flex gap-2">
        <input
          ref={inputComentarioRef}
          type="text"
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          placeholder="Digite sua mensagem..."
          maxLength={1000}
          className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-150"
          required
        />
        <button
          type="submit"
          disabled={enviandoComentario || !novoComentario.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors"
        >
          {enviandoComentario ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );

  const renderComentarios = () => (
    <div className="flex-1 space-y-3 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-2 pb-2">
      {(!chamadoSelecionado.comentarios || chamadoSelecionado.comentarios.length === 0) ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4">Nenhuma mensagem enviada.</p>
      ) : (
        chamadoSelecionado.comentarios.map((c: any) => {
          const isMe = String(c.usuario_id) === String(meuUsuarioId);
          const isEditing = comentarioEditandoId === c.id;
          const editTimeExpired = new Date().getTime() - new Date(c.criado_em).getTime() > 5 * 60 * 1000;
          const canEdit = isMe && (cargo === "Admin" || !editTimeExpired);

          return (
            <div key={c.id} className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}>
              <span className="text-[9px] font-bold text-slate-400 mb-0.5">
                {c.usuario_nome} <span className="font-normal">({c.usuario_cargo})</span>
              </span>
              
              {isEditing ? (
                <div className="flex flex-col w-full gap-2 mt-1">
                  <textarea
                    value={comentarioEditandoConteudo}
                    onChange={(e) => setComentarioEditandoConteudo(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setComentarioEditandoId(null)} className="text-[10px] px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-bold transition-colors uppercase">Cancelar</button>
                    <button onClick={() => salvarEdicaoComentario(c.id)} className="text-[10px] px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold transition-colors uppercase">Salvar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed group relative ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50"
                  }`}>
                    {c.parent && (
                      <div className={`mb-2 p-2 rounded-lg text-[10px] opacity-90 border-l-2 bg-black/10 dark:bg-white/10 ${isMe ? "border-blue-200" : "border-slate-400"}`}>
                        <p className="font-bold mb-0.5">{c.parent.usuario?.nome || "Usuário"}</p>
                        <p className="line-clamp-2 max-w-[200px]">{c.parent.conteudo}</p>
                      </div>
                    )}
                    {renderLinks(c.conteudo)}
                    
                    <div className={`hidden group-hover:flex absolute -top-3 ${isMe ? "right-0" : "left-0"} bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 p-1 gap-1 z-10 items-center`}>
                      <button onClick={() => setComentarioRespondendo(c)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-green-500 transition-colors" title="Responder">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                      </button>
                      {(isMe || cargo === "Admin") && (
                        <>
                          {canEdit && (
                            <button onClick={() => { setComentarioEditandoId(c.id); setComentarioEditandoConteudo(c.conteudo); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-500 transition-colors" title="Editar">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                          )}
                          <button onClick={() => deletarComentario(c.id, 'mim')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-orange-500 transition-colors" title="Excluir apenas para mim">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                          </button>
                          <button onClick={() => deletarComentario(c.id, 'todos')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500 transition-colors" title="Excluir para todos">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[8px] text-slate-400 font-medium">
                      {new Date(c.criado_em).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {c.editado && (
                      <span className="text-[8px] text-slate-400 font-medium italic">
                        • editado
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const exportarCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.busca) params.append("busca", filtros.busca);
      if (filtros.status) params.append("status", filtros.status);
      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.urgencia) params.append("urgencia", filtros.urgencia);
      if (filtros.prioridade) params.append("prioridade", filtros.prioridade);
      params.append("per_page", "1000");

      const res = await api.get(`/ordens?${params.toString()}`);
      const dadosExportar = res.data.data || res.data || [];

      if (dadosExportar.length === 0) {
        alert("Nenhum chamado encontrado para exportar.");
        return;
      }

      const cabecalho = ["ID", "Titulo", "Dono", "Tecnico", "Status", "Categoria", "Urgencia", "Prioridade", "Criado Em"];
      const linhas = dadosExportar.map((os: any) => [
        os.id,
        `"${(os.titulo || "").replace(/"/g, '""')}"`,
        `"${(os.usuario?.nome || "").replace(/"/g, '""')}"`,
        `"${(os.tecnico?.nome || "Não atribuído").replace(/"/g, '""')}"`,
        `"${(os.status?.nome || os.status || "").replace(/"/g, '""')}"`,
        `"${(os.categoria?.nome || os.categoria || "").replace(/"/g, '""')}"`,
        `"${(os.urgencia?.nome || os.urgencia || "").replace(/"/g, '""')}"`,
        `"${(os.prioridade?.nome || os.prioridade || "").replace(/"/g, '""')}"`,
        os.criado_em || os.created_at || ""
      ]);

      const conteudoCSV = "\uFEFF" + [cabecalho.join(","), ...linhas.map((l: any) => l.join(","))].join("\n");
      const blob = new Blob([conteudoCSV], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `exportacao_chamados_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao exportar dados", err);
      alert("Erro ao exportar dados.");
    }
  };

  const urgenciaCor: any = {
    "Muito Alta": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Alta: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "Média": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Media: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
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

  return (
    <>
    <div className="p-4 md:p-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Gestão de Chamados</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Visualize e gerencie as ordens de serviço.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
          >
            Exportar CSV
          </button>
          <input
            type="text"
            placeholder="Filtrar por ID ou título..."
            className={`${filterClass} w-64`}
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {cargo !== "Usuario" && (
          <select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value, page: 1 })} className={filterClass}>
            <option value="">Todos os status</option>
            {statusList.map((s: any) => (
              <option key={s.id} value={s.nome}>{s.nome}</option>
            ))}
          </select>
        )}
        <select value={filtros.categoria} onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value, page: 1 })} className={filterClass}>
          <option value="">Todas as categorias</option>
          {categorias.map((c: any) => (
            <option key={c.id} value={c.nome}>{c.nome}</option>
          ))}
        </select>
        {cargo !== "Usuario" && (
          <>
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
          </>
        )}
        <select value={filtros.per_page} onChange={(e) => setFiltros({ ...filtros, per_page: Number(e.target.value), page: 1 })} className={filterClass}>
          <option value={15}>15 por página</option>
          <option value={30}>30 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>
        {((cargo !== "Usuario" && (filtros.status || filtros.urgencia || filtros.prioridade)) || filtros.categoria) && (
          <button onClick={() => setFiltros({ ...filtros, status: "", categoria: "", urgencia: "", prioridade: "", page: 1, per_page: 15 })} className="text-xs font-bold text-red-400 hover:text-red-600 px-3">
            Limpar filtros
          </button>
        )}
      </div>

      {/* TABELA CONDICIONAL (SIMPLIFICADA PARA CLIENTE OU COMPLETA PARA ADMIN/TECNICO) */}
      {cargo === "Usuario" ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
          <table className="w-full text-left text-[11px] table-fixed">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-4 py-3 w-[45%]">Título</th>
                <th className="px-4 py-3 w-[15%]">Categoria</th>
                <th className="px-4 py-3 w-[15%]">Localização</th>
                <th className="px-4 py-3 w-[12%] text-center">Data de Abertura</th>
                <th className="px-4 py-3 w-[10%] text-center">Situação</th>
                <th className="px-4 py-3 w-[8%] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ordensExibicao.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400 dark:text-slate-600 italic text-sm">
                    Você ainda não abriu nenhum chamado.
                  </td>
                </tr>
              )}
              {ordensExibicao.map((os: any) => (
                <tr
                  key={os.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="truncate overflow-hidden">{os.titulo}</span>
                      {os.anexo_url && (
                        <button onClick={() => setAnexoPreview({url: os.anexo_url, osId: os.id})} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold uppercase flex-shrink-0 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">📎 Anexo</button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 overflow-hidden">
                    <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${categoriaCor[os.categoria?.nome || os.categoria] || "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {os.categoria?.nome || os.categoria || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[10px] truncate overflow-hidden">
                    {os.localizacao || <span className="italic text-slate-300 dark:text-slate-600">Não informada</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[10px] text-center truncate overflow-hidden">
                    {os.criado_em ? new Date(os.criado_em).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="px-4 py-3 text-center overflow-hidden">
                    <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase truncate ${(os.status?.nome || os.status) === "Fechado" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                    >
                      {(os.status?.nome || os.status) === "Fechado" ? "Resolvido" : "Em Atendimento"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right overflow-hidden">
                    <button onClick={() => abrirModalEdicao(os)} className="text-blue-600 font-bold hover:underline text-[10px] tracking-wider uppercase">
                      DETALHES
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
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
      )}

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
          
          <Paginacao
            currentPage={filtros.page}
            lastPage={meta.last_page}
            onPageChange={(page) => setFiltros({ ...filtros, page })}
          />

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

      {/* MODAL DE EDIÇÃO E DETALHES */}
      {chamadoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[95vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">
              {cargo === "Usuario" ? "Acompanhamento do Chamado" : `Detalhes e Edição do Chamado #${chamadoSelecionado.id}`}
            </h3>
            <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold">
              {chamadoSelecionado.titulo}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cargo === "Usuario" ? (
                /* Coluna da Esquerda: Informações em modo de leitura para Cliente */
                <div className="space-y-5">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Categoria</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5 block">
                        {chamadoSelecionado.categoria?.nome || chamadoSelecionado.categoria || "Geral"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Localização</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5 block">
                        {chamadoSelecionado.localizacao || "Não informada"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Situação</span>
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase mt-1 ${(chamadoSelecionado.status?.nome || chamadoSelecionado.status) === "Fechado"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {(chamadoSelecionado.status?.nome || chamadoSelecionado.status) === "Fechado" ? "Resolvido" : "Em Atendimento"}
                      </span>
                    </div>

                    {/* Solução */}
                    {(chamadoSelecionado.solucao || (chamadoSelecionado.status?.nome || chamadoSelecionado.status) === "Fechado") && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block">Solução</span>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1 leading-relaxed whitespace-pre-line bg-green-50/50 dark:bg-green-950/10 p-3 rounded-xl border border-green-100/50 dark:border-green-900/20">
                          {chamadoSelecionado.solucao || "Chamado resolvido."}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Anexo do Chamado</span>
                    {chamadoSelecionado.anexo_url ? (
                      <div className="text-[12px]">
                        <button type="button" onClick={() => setAnexoPreview({url: chamadoSelecionado.anexo_url, osId: chamadoSelecionado.id})} className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-semibold">
                          Visualizar anexo enviado
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">Sem anexo cadastrado</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button type="button" onClick={() => setChamadoSelecionado(null)} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-center block">
                      FECHAR
                    </button>
                  </div>
                </div>
              ) : (
                /* Coluna da Esquerda: Formulário de Edição (Admin/Técnico) */
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
                    <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={cargo === "Usuario"} className={selectClass}>
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
                        disabled={cargo === "Usuario"}
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
                      disabled={cargo === "Usuario"}
                      placeholder="O que foi feito para resolver este chamado?"
                      className={`${selectClass} h-28 resize-none text-sm`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Anexo</label>
                    {chamadoSelecionado.anexo_url ? (
                      <div className="text-[12px] mt-1.5">
                        <button type="button" onClick={() => setAnexoPreview({url: chamadoSelecionado.anexo_url, osId: chamadoSelecionado.id})} className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-semibold">
                          Visualizar anexo atual
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-1.5">Sem anexo cadastrado</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    {cargo === "Usuario" ? (
                      <button type="button" onClick={() => setChamadoSelecionado(null)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all">
                        FECHAR
                      </button>
                    ) : (
                      <>
                        <button type="button" onClick={() => setChamadoSelecionado(null)} className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 text-xs tracking-wider uppercase">
                          CANCELAR
                        </button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 text-xs tracking-wider uppercase transition-all">
                          SALVAR
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}

              {/* Coluna da Direita: Histórico e Discussão */}
              <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-8 pt-6 md:pt-0">
                {cargo === "Usuario" ? (
                  /* APENAS CHAT PARA O CLIENTE */
                  <div className="flex flex-col h-[360px]">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                      Mensagens e Discussão
                    </h4>
                    {/* Lista de comentários */}
                    {renderComentarios()}

                    {/* Formulário de envio de comentário */}
                    {renderFormComentario()}
                  </div>
                ) : (
                  /* ESTRUTURA ORIGINAL COM SLA E ABAS SWITCHER PARA ADMIN/TECNICO */
                  <>
                    {renderSlaInfo(chamadoSelecionado)}

                    {/* Abas Switcher */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 gap-4">
                      <button
                        type="button"
                        onClick={() => setAbaModal("comentarios")}
                        className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors relative ${
                          abaModal === "comentarios"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                      >
                        Discussão ({chamadoSelecionado.comentarios?.length || 0})
                        {abaModal === "comentarios" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAbaModal("historico")}
                        className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors relative ${
                          abaModal === "historico"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                      >
                        Histórico ({chamadoSelecionado.historicos?.length || 0})
                        {abaModal === "historico" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                      </button>
                    </div>

                    {abaModal === "comentarios" && (
                      <div className="flex flex-col h-[360px]">
                        {/* Lista de comentários */}
                        {renderComentarios()}

                        {/* Formulário de envio de comentário */}
                        {renderFormComentario()}
                      </div>
                    )}

                    {abaModal === "historico" && (
                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {(!chamadoSelecionado.historicos || chamadoSelecionado.historicos.length === 0) ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">Nenhum registro de histórico.</p>
                        ) : (
                          [...chamadoSelecionado.historicos].reverse().map((h: any) => (
                            <div key={h.id} className="relative pl-6 border-l border-blue-500/30 pb-4 last:pb-0">
                              <div className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30" />
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider block">
                                {h.acao}
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-semibold leading-relaxed">
                                {h.descricao}
                              </p>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block mt-1">
                                Por: {h.usuario?.nome || 'Sistema'} • {new Date(h.criado_em || h.data).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
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