'use client'
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Estatisticas() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    api.get('/ordens').then(res => setDados(res.data)).catch(console.error);
  }, []);

  const total = dados.length;
  const resolvidos = dados.filter((os: any) => os.status === 'Fechado').length;
  const abertos = total - resolvidos;
  const semTecnico = dados.filter((os: any) => !os.tecnico_id && os.status !== 'Fechado').length;
  const percResolvidos = total > 0 ? (resolvidos / total) * 100 : 0;

  const techMap: any = {};
  dados.filter((os: any) => os.status === 'Fechado').forEach((os: any) => {
    const nomeTecnico = os.tecnico?.nome || 'Sem Técnico';
    const idTecnico = os.tecnico_id || 'N/A';
    if (!techMap[idTecnico]) {
      techMap[idTecnico] = { nome: nomeTecnico, resolvidos: 0, id: idTecnico };
    }
    techMap[idTecnico].resolvidos += 1;
  });

  const categorias = ['Rede', 'Infraestrutura', 'Acesso'];
  const catMap = categorias.map(cat => ({
    nome: cat,
    total: dados.filter((os: any) => os.categoria === cat).length,
    abertos: dados.filter((os: any) => os.categoria === cat && os.status !== 'Fechado').length,
  }));

  const catCor: any = {
    'Rede':           'bg-purple-500',
    'Infraestrutura': 'bg-cyan-500',
    'Acesso':         'bg-green-500',
  };

  const listaTecnicos = Object.values(techMap);
  const card = "bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800";

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8">Estatísticas do Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* CARD 1: STATUS GERAL */}
        <div className={card}>
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest">Status dos Chamados</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-300">RESOLVIDOS</span>
                <span className="text-green-600 dark:text-green-400">{resolvidos}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${percResolvidos}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-300">EM ABERTO</span>
                <span className="text-blue-600 dark:text-blue-400">{abertos}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${total > 0 ? (abertos / total) * 100 : 0}%` }}></div>
              </div>
            </div>
            {semTecnico > 0 && (
              <div className="mt-4 flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-lg">
                <span className="text-xs font-bold">⚠️ {semTecnico} chamado{semTecnico > 1 ? 's' : ''} sem técnico atribuído</span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: TOP TÉCNICOS */}
        <div className={card}>
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest">Top Técnicos (Performance)</h3>
          <div className="space-y-4">
            {listaTecnicos.sort((a: any, b: any) => b.resolvidos - a.resolvidos).map((tech: any, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold p-2 rounded w-16 text-center">
                  #{tech.id}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">{tech.nome}</div>
                  <div className="text-[10px] text-slate-400">{tech.resolvidos} chamados finalizados</div>
                </div>
              </div>
            ))}
            {listaTecnicos.length === 0 && (
              <p className="text-xs text-slate-400 italic">Nenhum chamado resolvido ainda.</p>
            )}
          </div>
        </div>

        {/* CARD 3: TOTAL */}
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 flex flex-col justify-center items-center text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Total de Incidentes</span>
          <span className="text-6xl font-black">{total}</span>
        </div>

        {/* CARD 4: EFICIÊNCIA */}
        <div className={card}>
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Taxa de Eficiência</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-slate-800 dark:text-white">{percResolvidos.toFixed(0)}%</span>
            <span className="text-xs font-bold text-slate-400 mb-2">de resolução</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
            Métrica baseada na relação entre chamados totais e concluídos (Fechados).
          </p>
        </div>

        {/* CARD 5: POR CATEGORIA */}
        <div className={`${card} md:col-span-2`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest">Chamados por Categoria</h3>
          <div className="grid grid-cols-3 gap-6">
            {catMap.map((cat) => (
              <div key={cat.nome} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">{cat.nome}</span>
                  <span className="text-slate-400">{cat.total} total</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`${catCor[cat.nome]} h-full transition-all duration-1000`}
                    style={{ width: `${total > 0 ? (cat.total / total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-400">{cat.abertos} em aberto</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}