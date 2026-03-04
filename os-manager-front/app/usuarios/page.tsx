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
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Técnicos Cadastrados</h1>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-slate-800 text-white text-left text-sm uppercase tracking-wider">
                            <th className="px-5 py-3 border-b text-center w-20">ID</th>
                            <th className="px-5 py-3 border-b">Nome</th>
                            <th className="px-5 py-3 border-b">CPF</th>
                            <th className="px-5 py-3 border-b">Data de Cadastro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((user: any) => (
                            <tr key={user.id} className="hover:bg-slate-100 transition-colors">
                                <td className="px-5 py-4 border-b text-sm text-center font-mono text-blue-600">
                                    #{user.id}
                                </td>
                                <td className="px-5 py-4 border-b text-sm font-bold text-slate-700">{user.nome}</td>
                                <td className="px-5 py-4 border-b text-sm">{user.cpf}</td>
                                <td className="px-5 py-4 border-b text-sm">
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