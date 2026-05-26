'use client'
import { useEffect, useState } from 'react';
import api from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function Estatisticas() {
  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.get('/dashboard/estatisticas')
      .then(res => {
        setDados(res.data.data);
      })
      .catch(err => {
        if (err.response && err.response.status === 403) {
          setErro('Acesso negado. Apenas administradores podem ver as estatísticas.');
        } else {
          setErro('Erro ao carregar os dados do painel.');
        }
        console.error(err);
      });
  }, []);

  if (erro) return <div className="p-8 text-red-500 font-bold bg-red-50 min-h-screen flex items-center justify-center">{erro}</div>;
  if (!dados || !mounted) return <div className="p-8 text-slate-500 font-bold min-h-screen flex items-center justify-center">Carregando métricas...</div>;

  const { geral, top_tecnicos, categorias } = dados;

  const dataGrafico = (categorias || []).map((cat: any) => ({
    name: cat.categoria,
    "Em Aberto": cat.abertos,
    "Resolvidos": Math.max(0, cat.total - cat.abertos),
  }));

  const catCor: any = {
    'Rede': 'bg-purple-500',
    'Infraestrutura': 'bg-cyan-500',
    'Acesso': 'bg-green-500',
  };

  const card = "bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col";

  // Previne divisão por zero
  const totalGeralComLixo = geral.total + geral.excluidos;

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 h-full flex flex-col">
      <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4 md:mb-6">Estatísticas do Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">

        {/* CARD 1: STATUS GERAL */}
        <div className={card}>
          <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Status dos Chamados</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] md:text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-300">RESOLVIDOS</span>
                <span className="text-green-600 dark:text-green-400">{geral.resolvidos}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 md:h-4 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${geral.perc_resolvidos}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] md:text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-300">EM ABERTO</span>
                <span className="text-blue-600 dark:text-blue-400">{geral.abertos}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 md:h-4 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${geral.total > 0 ? (geral.abertos / geral.total) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* LIXEIRA AQUI */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
              <div className="flex justify-between text-[10px] md:text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  NA LIXEIRA (Inativos)
                </span>
                <span className="text-red-600 dark:text-red-400">{geral.excluidos}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${totalGeralComLixo > 0 ? (geral.excluidos / totalGeralComLixo) * 100 : 0}%` }}></div>
              </div>
            </div>

            {geral.sem_tecnico > 0 && (
              <div className="mt-2 flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-lg">
                <span className="text-[10px] font-bold">⚠️ {geral.sem_tecnico} chamado{geral.sem_tecnico > 1 ? 's' : ''} sem técnico</span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: TOP TÉCNICOS */}
        <div className={card}>
          <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Top Técnicos (Performance)</h3>
          <div className="space-y-3 overflow-y-auto max-h-36 pr-2">
            {top_tecnicos.map((tech: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-slate-800 dark:bg-slate-700 text-white text-[9px] font-bold p-1.5 rounded w-12 text-center">
                  #{tech.id}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200 uppercase truncate">{tech.nome}</div>
                  <div className="text-[9px] md:text-[10px] text-slate-400">{tech.resolvidos} chamados finalizados</div>
                </div>
              </div>
            ))}
            {top_tecnicos.length === 0 && (
              <p className="text-[10px] md:text-xs text-slate-400 italic">Nenhum chamado resolvido ainda.</p>
            )}
          </div>
        </div>

        {/* CARD 3: TOTAL */}
        <div className="bg-blue-600 p-4 md:p-6 rounded-2xl shadow-lg shadow-blue-500/20 flex flex-col justify-center items-center text-white">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80 text-center">Total de Incidentes (Ativos)</span>
          <span className="text-4xl md:text-6xl font-black">{geral.total}</span>
        </div>

        {/* CARD 4: EFICIÊNCIA */}
        <div className={card}>
          <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Taxa de Eficiência</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white leading-none">{geral.perc_resolvidos}%</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 mb-1">de resolução</span>
          </div>
          <p className="text-[9px] md:text-[10px] text-slate-400 leading-relaxed mt-auto">
            Métrica baseada na relação entre chamados totais (ativos) e concluídos (Fechados).
          </p>
        </div>

        {/* CARD 5: POR CATEGORIA */}
        <div className={`${card} md:col-span-2`}>
          <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Chamados por Categoria</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Barras de progresso à esquerda */}
            <div className="space-y-4">
              {categorias.map((cat: any) => (
                <div key={cat.categoria} className="space-y-1 md:space-y-2">
                  <div className="flex justify-between text-[10px] md:text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">{cat.categoria}</span>
                    <span className="text-slate-400 font-bold">{cat.total} total</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 md:h-3 rounded-full overflow-hidden">
                    <div
                      className={`${catCor[cat.categoria] || 'bg-gray-500'} h-full transition-all duration-1000`}
                      style={{ width: `${geral.total > 0 ? (cat.total / geral.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] md:text-[10px] text-slate-400">
                    {cat.abertos} em aberto • {Math.max(0, cat.total - cat.abertos)} resolvidos
                  </div>
                </div>
              ))}
              {categorias.length === 0 && (
                <p className="text-[10px] md:text-xs text-slate-400 italic">Nenhuma categoria registrada.</p>
              )}
            </div>

            {/* Gráfico do Recharts à direita */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px',
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Em Aberto" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Em Aberto" />
                  <Bar dataKey="Resolvidos" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolvidos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}