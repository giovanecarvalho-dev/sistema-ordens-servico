'use client'
import { useEffect, useState } from 'react';
import api from './services/api';
import ModoEscuro from './components/ModoEscuro'; 

export default function ListaChamados() {
  const [ordens, setOrdens] = useState([]);
  const [busca, setBusca] = useState('');
  const [tecnicos, setTecnicos] = useState([]);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any>(null);
  
  // Estados para Edição (Mantendo todos os seus campos originais)
  const [tecnicoId, setTecnicoId] = useState('');
  const [status, setStatus] = useState('');
  const [urgencia, setUrgencia] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [solucao, setSolucao] = useState('');

  const buscarDados = async () => {
    try {
      const [resOrdens, resTecnicos] = await Promise.all([
        api.get('/ordens'),
        api.get('/usuarios')
      ]);
      setOrdens(resOrdens.data);
      setTecnicos(resTecnicos.data);
    } catch (err) { console.error("Erro ao carregar dados"); }
  };

  useEffect(() => { buscarDados(); }, []);

  const ordensFiltradas = ordens.filter((os: any) => 
    os.titulo.toLowerCase().includes(busca.toLowerCase()) || os.id.toString().includes(busca)
  );

  const deletarChamado = async (id: number) => {
    if (confirm("Deseja excluir este chamado permanentemente?")) {
      try { await api.delete(`/ordens/${id}`); buscarDados(); } 
      catch (err) { alert("Erro ao excluir."); }
    }
  };

  const abrirModalEdicao = (os: any) => {
    setChamadoSelecionado(os);
    setStatus(os.status);
    setTecnicoId(os.usuario_id || '');
    setUrgencia(os.urgencia);
    setPrioridade(os.prioridade);
    setSolucao(os.solucao || '');
  };

  const salvarEdicao = async (e: any) => {
    e.preventDefault();
    try {
      await api.put(`/ordens/${chamadoSelecionado.id}`, {
        status, usuario_id: tecnicoId, urgencia, prioridade, solucao
      });
      buscarDados();
      setChamadoSelecionado(null);
    } catch (err) { alert("Erro ao atualizar."); }
  };

  return (
    <div className="p-10 min-h-screen transition-colors duration-300 dark:bg-slate-950">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase">
            Gestão de Chamados
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Filtrar por título ou ID..." 
            className="p-2.5 border rounded-xl text-xs w-64 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <ModoEscuro /> 
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-bold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Técnico</th>
              <th className="px-6 py-4">Urgência</th>
              <th className="px-6 py-4">Prioridade</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {ordensFiltradas.map((os: any) => (
              <tr key={os.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 font-bold">#{os.id}</td>
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{os.titulo}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                    os.status === 'Fechado' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {os.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {os.usuario?.nome || "Não atribuído"}
                </td> 
                <td className="px-6 py-4 dark:text-slate-300 font-medium">{os.urgencia}</td>
                <td className="px-6 py-4 dark:text-slate-300 font-medium">{os.prioridade}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => abrirModalEdicao(os)} className="text-blue-600 dark:text-blue-400 font-black hover:underline">EDITAR</button>
                    <button onClick={() => deletarChamado(os.id)} className="text-red-500 dark:text-red-400 font-black hover:underline">EXCLUIR</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO RESTAURADO COM TODOS OS CAMPOS */}
      {chamadoSelecionado && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl p-8 border dark:border-slate-800 shadow-2xl">
            <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white border-b dark:border-slate-800 pb-4">
              Editar Chamado #{chamadoSelecionado.id}
            </h3>
            <form onSubmit={salvarEdicao} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Técnico</label>
                  <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm dark:text-white">
                    <option value="">Selecione...</option>
                    {tecnicos.map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm dark:text-white">
                    <option>Novo</option><option>Em andamento</option><option>Fechado</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Urgência</label>
                  <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm dark:text-white">
                    <option>Baixa</option><option>Média</option><option>Alta</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Prioridade</label>
                  <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm dark:text-white">
                    <option>Baixa</option><option>Média</option><option>Alta</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Solução</label>
                <textarea value={solucao} onChange={(e) => setSolucao(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm h-28 dark:text-white" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setChamadoSelecionado(null)} className="text-xs font-bold text-slate-400">CANCELAR</button>
                <button type="submit" className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl text-xs shadow-lg">SALVAR ALTERAÇÕES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}