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
  const percResolvidos = total > 0 ? (resolvidos / total) * 100 : 0;

 
  const techMap: any = {};
  
  dados.filter((os: any) => os.status === 'Fechado').forEach((os: any) => {
   
    const nomeTecnico = os.usuario?.nome || 'Sem Técnico';
    const idTecnico = os.usuario_id || 'N/A';

    if (!techMap[idTecnico]) {
      techMap[idTecnico] = { 
        nome: nomeTecnico, 
        resolvidos: 0, 
        id: idTecnico 
      };
    }
    techMap[idTecnico].resolvidos += 1;
  });

  const listaTecnicos = Object.values(techMap);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-8">Estatísticas do Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD 1: STATUS GERAL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">Status dos Chamados</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>RESOLVIDOS</span>
                <span className="text-green-600">{resolvidos}</span>
              </div>
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${percResolvidos}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>EM ABERTO</span>
                <span className="text-blue-600">{abertos}</span>
              </div>
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${total > 0 ? (abertos / total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: PERFORMANCE POR TÉCNICO - CORRIGIDO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">Top Técnicos (Performance)</h3>
          <div className="space-y-4">
            {listaTecnicos.sort((a: any, b: any) => b.resolvidos - a.resolvidos).map((tech: any, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="bg-slate-800 text-white text-[10px] font-bold p-2 rounded w-16 text-center">ID: {tech.id}</div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-700 uppercase">{tech.nome}</div>
                  <div className="text-[10px] text-gray-400">{tech.resolvidos} chamados finalizados</div>
                </div>
              </div>
            ))}
            {listaTecnicos.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum chamado resolvido ainda.</p>}
          </div>
        </div>

        {/* CARD 3: VOLUMETRIA TOTAL */}
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 flex flex-col justify-center items-center text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Total de Incidentes</span>
          <span className="text-6xl font-black">{total}</span>
        </div>

        {/* CARD 4: TAXA DE EFICIÊNCIA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Taxa de Eficiência</h3>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-black text-gray-800">{percResolvidos.toFixed(0)}%</span>
             <span className="text-xs font-bold text-gray-400 mb-2">de resolução</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
            Métrica baseada na relação entre chamados totais e concluídos (Fechados).
          </p>
        </div>

      </div>
    </div>
  );
}