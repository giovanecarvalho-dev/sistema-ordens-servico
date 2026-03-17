'use client';

import { useEffect, useState } from 'react';
import api from '../services/api';

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [ordens, setOrdens] = useState([]);
    const meuId = typeof window !== 'undefined' ? localStorage.getItem('usuarioId') : null;

    useEffect(() => {
        Promise.all([
            api.get('/usuarios'),
            api.get('/ordens'),
        ])
        .then(([resUsuarios, resOrdens]) => {
            setUsuarios(resUsuarios.data);
            setOrdens(resOrdens.data);
        })
        .catch((err) => console.error("Erro ao carregar dados:", err));
    }, []);

    const contarOrdens = (userId: number) => {
        return ordens.filter((os: any) =>
            os.tecnico_id != null && os.tecnico_id == userId && os.status !== 'Fechado'
        ).length;
    };

    const alterarCargo = async (userId: number, novoCargo: string) => {
        try {
            await api.put(`/usuarios/${userId}`, { cargo: novoCargo });
            setUsuarios((prev: any) =>
                prev.map((u: any) => u.id === userId ? { ...u, cargo: novoCargo } : u)
            );
        } catch (err) {
            alert("Erro ao atualizar cargo.");
        }
    };

    const excluirUsuario = async (userId: number, userName: string) => {
        if (String(userId) === String(meuId)) {
            alert("Você não pode excluir sua própria conta!");
            return;
        }
        if (!confirm(`Deseja excluir o usuário "${userName}" permanentemente?`)) return;
        try {
            await api.delete(`/usuarios/${userId}`);
            setUsuarios((prev: any) => prev.filter((u: any) => u.id !== userId));
        } catch (err) {
            alert("Erro ao excluir usuário.");
        }
    };

    const cargoCor: any = {
        'Admin':   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Tecnico': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Usuario': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
                Usuários Cadastrados
            </h1>
            <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-slate-800 text-white text-left text-xs uppercase tracking-wider">
                            <th className="px-5 py-4 border-b border-slate-700 text-center w-20">ID</th>
                            <th className="px-5 py-4 border-b border-slate-700">Nome</th>
                            <th className="px-5 py-4 border-b border-slate-700">CPF</th>
                            <th className="px-5 py-4 border-b border-slate-700">Data de Cadastro</th>
                            <th className="px-5 py-4 border-b border-slate-700 text-center">Ordens Ativas</th>
                            <th className="px-5 py-4 border-b border-slate-700 text-center">Cargo</th>
                            <th className="px-5 py-4 border-b border-slate-700 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {usuarios.map((user: any) => {
                            const ordensAtivas = contarOrdens(user.id);
                            const ehEuMesmo = String(user.id) === String(meuId);
                            return (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-4 text-sm text-center font-mono text-blue-600 dark:text-blue-400">
                                        #{user.id}
                                    </td>
                                    <td className="px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {user.nome} {ehEuMesmo && <span className="text-[10px] text-blue-400 font-normal">(você)</span>}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {user.cpf}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {user.criado_em
                                            ? new Date(user.criado_em).toLocaleDateString('pt-BR')
                                            : 'Sem data'}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                            ordensAtivas === 0
                                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                                : ordensAtivas >= 3
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {ordensAtivas === 0 ? 'Nenhuma' : `${ordensAtivas} Ativa${ordensAtivas > 1 ? 's' : ''}`}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${cargoCor[user.cargo] || cargoCor['Usuario']}`}>
                                                {user.cargo || 'Usuario'}
                                            </span>
                                            <select
                                                value={user.cargo || 'Usuario'}
                                                onChange={(e) => alterarCargo(user.id, e.target.value)}
                                                className="text-xs p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                                            >
                                                <option value="Usuario">Usuário</option>
                                                <option value="Tecnico">Técnico</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-center">
                                        <button
                                            onClick={() => excluirUsuario(user.id, user.nome)}
                                            disabled={ehEuMesmo}
                                            className={`font-bold text-xs uppercase ${
                                                ehEuMesmo
                                                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                                    : 'text-red-500 hover:underline cursor-pointer'
                                            }`}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}