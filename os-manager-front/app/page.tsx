"use client";
import { useEffect, useState, useCallback } from "react";
import api from "./services/api";

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
    page: 1
  });

  // --- 2. ESTADOS DE INTERFACE E MODAL ---
  const [tecnicos, setTecnicos] = useState([]);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any>(null);
  const [tecnicoId, setTecnicoId] = useState("");
  const [status, setStatus] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [solucao, setSolucao] = useState("");
  const [cargo, setCargo] = useState("");
  const [sla, setSla] = useState<any>({});

  // --- 3. BUSCA DE DADOS (SERVER-SIDE) ---
  const buscarChamados = useCallback(async () => {
    setCarregando(true);
    try {
      const { data } = await api.get("/ordens", { params: filtros });
      setOrdens(data.data); // Itens da página atual
      setMeta(data);      // Dados da paginação (total, last_page)
    } catch (err) {
      console.error("Erro ao carregar chamados");
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    const carregarIniciais = async () => {
      const c = localStorage.getItem("usuarioCargo") || "";
      setCargo(c);
      setSla({
        "Muito Alta": parseInt(localStorage.getItem("cfg_slaMuito") || "2"),
        Alta: parseInt(localStorage.getItem("cfg_slaAlta") || "4"),
        Média: parseInt(localStorage.getItem("cfg_slaMedia") || "8"),
        Baixa: parseInt(localStorage.getItem("cfg_slaBaixa") || "24"),
      });

      try {
        const res = await api.get("/usuarios");
        // CORREÇÃO DO ERRO: Verifica se a lista está em res.data ou res.data.data
        const listaBruta = Array.isArray(res.data) ? res.data : res.data.data;
        if (listaBruta) {
          setTecnicos(listaBruta.filter((u: any) => u.cargo !== 'Usuario'));
        }
      } catch (e) { console.error("Erro ao carregar técnicos:", e); }
    };
    carregarIniciais();
  }, []);

  useEffect(() => {
    const timer = setTimeout(buscarChamados, 300);
    return () => clearTimeout(timer);
  }, [buscarChamados]);

  // --- 4. FUNÇÕES DE AÇÃO ---
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
    setStatus(os.status);
    setTecnicoId(os.tecnico_id || "");
    setUrgencia(os.urgencia || "Média");
    setPrioridade(os.prioridade || "Média");
    setSolucao(os.solucao || "");
  };

  const salvarEdicao = async (e: any) => {
    e.preventDefault();
    try {
      const payload: any = { status, solucao };
      if (cargo === "Admin") {
        payload.urgencia = urgencia;
        payload.prioridade = prioridade;
        payload.tecnico_id = tecnicoId || null;
      }
      await api.put(`/ordens/${chamadoSelecionado.id}`, payload);
      setChamadoSelecionado(null);
      buscarChamados();
    } catch (err) { alert("Erro ao atualizar."); }
  };

  // --- 5. HELPERS DE ESTILO (PADRÃO ORIGINAL) ---
  const statusSla = (os: any) => {
    if (os.status === "Fechado" || !os.urgencia || !os.criado_em) return null;
    const limiteHoras = sla[os.urgencia];
    if (!limiteHoras) return null;
    const horasPassadas = (Date.now() - new Date(os.criado_em).getTime()) / 3600000;
    const perc = horasPassadas / limiteHoras;
    if (perc >= 1) return "vencido";
    if (perc >= 0.75) return "alerta";
    return "ok";
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

  const slaLabel: any = { vencido: "🔴 SLA Vencido", alerta: "🟡 SLA em Risco", ok: "🟢 No Prazo" };
  const filterClass = "p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white";
  const selectClass = "w-full p-3 mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-10">
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
          onChange={(e) => setFiltros({...filtros, busca: e.target.value, page: 1})}
        />
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filtros.status} onChange={(e) => setFiltros({...filtros, status: e.target.value, page: 1})} className={filterClass}>
          <option value="">Todos os status</option>
          <option>Novo</option>
          <option>Em andamento</option>
          <option>Fechado</option>
        </select>
        <select value={filtros.categoria} onChange={(e) => setFiltros({...filtros, categoria: e.target.value, page: 1})} className={filterClass}>
          <option value="">Todas as categorias</option>
          <option>Rede</option>
          <option>Infraestrutura</option>
          <option>Acesso</option>
        </select>
        <select value={filtros.urgencia} onChange={(e) => setFiltros({...filtros, urgencia: e.target.value, page: 1})} className={filterClass}>
          <option value="">Todas as urgências</option>
          <option>Muito Alta</option>
          <option>Alta</option>
          <option>Média</option>
          <option>Baixa</option>
        </select>
        {(filtros.status || filtros.categoria || filtros.urgencia) && (
          <button onClick={() => setFiltros({ ...filtros, status: "", categoria: "", urgencia: "", page: 1 })} className="text-xs font-bold text-red-400 hover:text-red-600 px-3">
            Limpar filtros
          </button>
        )}
      </div>

      {/* TABELA COM TODAS AS COLUNAS RESTAURADAS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Localização</th>
              <th className="px-6 py-4">Aberto por</th>
              <th className="px-6 py-4">Abertura</th>
              <th className="px-6 py-4">SLA</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Urgência</th>
              <th className="px-6 py-4">Prioridade</th>
              <th className="px-6 py-4">Técnico</th>
              <th className="px-6 py-4">Solução</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {carregando ? (
              <tr><td colSpan={13} className="px-6 py-10 text-center text-slate-400 animate-pulse uppercase font-black text-xs tracking-widest">Sincronizando com o servidor...</td></tr>
            ) : ordens.length === 0 ? (
              <tr><td colSpan={13} className="px-6 py-10 text-center text-slate-400 italic">Nenhum chamado encontrado.</td></tr>
            ) : (
              ordens.map((os: any) => {
                const slaStatus = statusSla(os);
                return (
                  <tr key={os.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${slaStatus === "vencido" ? "border-l-4 border-red-500" : slaStatus === "alerta" ? "border-l-4 border-yellow-400" : ""}`}>
                    <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">#{os.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{os.titulo}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${categoriaCor[os.categoria] || "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                        {os.categoria || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{os.localizacao || "—"}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{os.usuario?.nome || "-"}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[10px] whitespace-nowrap">
                      {os.criado_em ? new Date(os.criado_em).toLocaleString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {slaStatus ? (
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap ${slaStatus === "vencido" ? "bg-red-100 text-red-700" : slaStatus === "alerta" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {slaLabel[slaStatus]}
                        </span>
                      ) : <span className="text-xs text-slate-300 italic">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${os.status === "Fechado" ? "bg-slate-100 text-slate-500" : os.status === "Em andamento" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {os.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${urgenciaCor[os.urgencia] || "bg-slate-100 text-slate-400"}`}>
                        {os.urgencia || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${urgenciaCor[os.prioridade] || "bg-slate-100 text-slate-400"}`}>
                        {os.prioridade || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">{os.tecnico?.nome || "Não atribuído"}</td>
                    <td className="px-6 py-4 text-slate-500 text-[10px] max-w-[120px] truncate" title={os.solucao}>{os.solucao || "—"}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button onClick={() => abrirModalEdicao(os)} className="text-blue-600 font-bold mr-4 hover:underline text-xs">EDITAR</button>
                      {cargo === "Admin" && (
                        <button onClick={() => deletarChamado(os.id)} className="text-red-500 font-bold hover:underline text-xs">EXCLUIR</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINAÇÃO */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            disabled={filtros.page === 1} 
            onClick={() => setFiltros({...filtros, page: filtros.page - 1})}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-slate-50"
          >
            Anterior
          </button>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Página {filtros.page} de {meta.last_page}
          </span>
          <button 
            disabled={filtros.page === meta.last_page} 
            onClick={() => setFiltros({...filtros, page: filtros.page + 1})}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-slate-50"
          >
            Próximo
          </button>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {chamadoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black mb-1 text-slate-800 dark:text-white uppercase tracking-tighter">Editar Chamado #{chamadoSelecionado.id}</h3>
            <p className="text-xs text-slate-400 mb-6 font-bold uppercase truncate">{chamadoSelecionado.titulo}</p>
            
            <form onSubmit={salvarEdicao} className="space-y-4">
              {cargo === "Admin" && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Técnico Responsável</label>
                    <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} className={selectClass}>
                      <option value="">Não atribuído</option>
                      {tecnicos.map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgência</label>
                      <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)} className={selectClass}>
                        <option>Muito Alta</option><option>Alta</option><option>Média</option><option>Baixa</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridade</label>
                      <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className={selectClass}>
                        <option>Muito Alta</option><option>Alta</option><option>Média</option><option>Baixa</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status do Atendimento</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                  {cargo === "Admin" && <option>Novo</option>}
                  <option>Em andamento</option>
                  <option>Fechado</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solução / Notas Técnica</label>
                <textarea
                  value={solucao}
                  onChange={(e) => setSolucao(e.target.value)}
                  placeholder="O que foi feito para resolver este chamado?"
                  className={`${selectClass} h-28 resize-none text-sm`}
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setChamadoSelecionado(null)} className="text-xs font-black text-slate-400 hover:text-slate-600">CANCELAR</button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs shadow-lg shadow-blue-500/20 uppercase tracking-widest">SALVAR ALTERAÇÕES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}