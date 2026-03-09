'use client';

import { useEffect, useState } from 'react';

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/usuarios')
            .then((res) => res.json())
            .then((data) => setUsuarios(data))
            .catch((err) => console.error("Erro ao carregar técnicos:", err));
    }, []);

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
                Técnicos Cadastrados
            </h1>

            <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-slate-800 dark:bg-slate-800 text-white text-left text-xs uppercase tracking-wider">
                            <th className="px-5 py-4 border-b border-slate-700 text-center w-20">ID</th>
                            <th className="px-5 py-4 border-b border-slate-700">Nome</th>
                            <th className="px-5 py-4 border-b border-slate-700">CPF</th>
                            <th className="px-5 py-4 border-b border-slate-700">Data de Cadastro</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {usuarios.map((user: any) => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-5 py-4 text-sm text-center font-mono text-blue-600 dark:text-blue-400">
                                    #{user.id}
                                </td>
                                <td className="px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {user.nome}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {user.cpf}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {user.criado_em
                                        ? new Date(user.criado_em).toLocaleDateString('pt-BR')
                                        : 'Sem data'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}