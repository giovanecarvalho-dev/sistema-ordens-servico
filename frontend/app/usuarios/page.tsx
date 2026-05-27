'use client';

import { useEffect, useState } from 'react';
import api from '../services/api';
import Paginacao from '../components/Paginacao';

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [filtroId, setFiltroId] = useState('');
    const [itensPorPagina, setItensPorPagina] = useState(15);

    const meuId = typeof window !== 'undefined' ? sessionStorage.getItem('usuarioId') : null;

    // Busca os dados da API já filtrados, paginados e calculados pelo back-end!
    const buscarUsuarios = () => {
        const params = new URLSearchParams({ page: paginaAtual.toString(), per_page: itensPorPagina.toString() });
        if (filtroId) params.append('id', filtroId);

        api.get(`/usuarios?${params.toString()}`)
            .then((res) => {
                // Acessa o .data interno por causa da paginação do Laravel
                setUsuarios(res.data.data || []);
                setTotalPaginas(res.data.last_page || 1);
            })
            .catch((err) => console.error("Erro ao carregar dados:", err));
    };

    // Recarrega sempre que a página ou a quantidade por página mudar
    useEffect(() => {
        buscarUsuarios();
    }, [paginaAtual, itensPorPagina]);

    const alterarCargo = async (userId: number, novoCargo: string) => {
        if (!confirm(`Tem certeza de que deseja alterar o cargo deste usuário para "${novoCargo}"?`)) {
            buscarUsuarios();
            return;
        }
        try {
            const res = await api.put(`/usuarios/${userId}`, { cargo: novoCargo });
            const usuarioAtualizado = res.data;
            setUsuarios((prev: any) =>
                prev.map((u: any) => u.id === userId ? usuarioAtualizado : u)
            );
        } catch (err) {
            alert("Erro ao atualizar cargo.");
            buscarUsuarios();
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
            buscarUsuarios(); // Recarrega a lista para atualizar a paginação corretamente
        } catch (err) {
            alert("Erro ao excluir usuário.");
        }
    };

    const cargoCor: any = {
        'Admin': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Tecnico': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Usuario': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen max-w-full overflow-hidden">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
                Usuários Cadastrados
            </h1>

            {/* Nova barra de Filtros */}
            <div className="mb-6 flex gap-4">
                <input
                    type="number"
                    placeholder="Filtrar por ID"
                    value={filtroId}
                    onChange={(e) => setFiltroId(e.target.value)}
                    className="p-2 border rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                    onClick={() => { setPaginaAtual(1); buscarUsuarios(); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Buscar
                </button>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Itens por página:</span>
                    <select
                        value={itensPorPagina}
                        onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPaginaAtual(1); }}
                        className="p-2 border rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <table className="w-full leading-normal text-[11px] table-fixed">
                    <thead>
                        <tr className="bg-slate-800 text-white text-left text-[10px] uppercase tracking-wider">
                            <th className="px-3 py-3 border-b border-slate-700 text-center w-16">ID</th>
                            <th className="px-3 py-3 border-b border-slate-700">Nome</th>
                            <th className="px-3 py-3 border-b border-slate-700">CPF</th>
                            <th className="px-3 py-3 border-b border-slate-700 text-center">Ordens Ativas</th>
                            <th className="px-3 py-3 border-b border-slate-700 text-center">Cargo</th>
                            <th className="px-3 py-3 border-b border-slate-700 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {usuarios.map((user: any) => {
                            const ehEuMesmo = String(user.id) === String(meuId);
                            // Agora lê direto da propriedade mágica do Laravel!
                            const ordensAtivas = user.ordens_ativas || 0;

                            return (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-3 py-3 text-center font-mono text-blue-600 dark:text-blue-400">
                                        #{user.id}
                                    </td>
                                    <td className="px-3 py-3 font-bold text-slate-700 dark:text-slate-200">
                                        {user.nome} {ehEuMesmo && <span className="text-[9px] text-blue-400 font-normal">(você)</span>}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                                        {user.cpf}
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${ordensAtivas === 0
                                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                            : ordensAtivas >= 3
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {ordensAtivas === 0 ? 'Nenhuma' : `${ordensAtivas} Ativa${ordensAtivas > 1 ? 's' : ''}`}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${cargoCor[user.cargo?.nome || user.cargo] || cargoCor['Usuario']}`}>
                                                {user.cargo?.nome || user.cargo || 'Usuario'}
                                            </span>
                                            <select
                                                value={user.cargo?.nome || user.cargo || 'Usuario'}
                                                onChange={(e) => alterarCargo(user.id, e.target.value)}
                                                className="text-xs p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                                            >
                                                <option value="Usuario">Usuário</option>
                                                <option value="Tecnico">Técnico</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <button
                                            onClick={() => excluirUsuario(user.id, user.nome)}
                                            disabled={ehEuMesmo}
                                            className={`font-bold text-[10px] uppercase ${ehEuMesmo
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

            {/* Controles de Paginação */}
            <div className="mt-6 flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                <span>Página {paginaAtual} de {totalPaginas}</span>
                <div className="flex gap-2 items-center">
                    <button
                        disabled={paginaAtual === 1}
                        onClick={() => setPaginaAtual(prev => prev - 1)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        Anterior
                    </button>
                    
                    <Paginacao
                        currentPage={paginaAtual}
                        lastPage={totalPaginas}
                        onPageChange={(page) => setPaginaAtual(page)}
                    />

                    <button
                        disabled={paginaAtual >= totalPaginas}
                        onClick={() => setPaginaAtual(prev => prev + 1)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>
    );
}