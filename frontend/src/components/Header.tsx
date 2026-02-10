'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Utensils,
    LogOut,
    Bell,
    User,
    ArrowLeft,
    Settings
} from 'lucide-react';

interface HeaderProps {
    showControl?: boolean;
    activeTab?: string;
    showVolver?: boolean;
    onVolver?: () => void;
}

export default function Header({ showControl, activeTab, showVolver, onVolver }: HeaderProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('eltrinche_user');
        router.push('/eltrinche/login');
    };

    return (
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push('/eltrinche/tables/map')}
                >
                    <div className="bg-emerald-600 p-2 rounded-xl">
                        <Utensils className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none">EL TRINCHE</h1>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sistema POS</p>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-2">
                    {showVolver && (
                        <button
                            onClick={onVolver}
                            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-900 transition-all font-bold text-sm"
                        >
                            <ArrowLeft size={18} /> Voltar
                        </button>
                    )}
                    <HeaderNavItem
                        icon={<Utensils size={20} />}
                        label="Mesas"
                        active={activeTab === 'mesas'}
                        onClick={() => router.push('/eltrinche/tables/map')}
                    />
                    <HeaderNavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Painel"
                        active={activeTab === 'control'}
                        onClick={() => router.push('/eltrinche/control')}
                    />
                    <HeaderNavItem
                        icon={<Settings size={20} />}
                        label="Config"
                        active={activeTab === 'admin'}
                        onClick={() => router.push('/eltrinche/admin')}
                    />
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-10 w-px bg-gray-100 mx-2"></div>

                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl pr-4 border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <User className="text-emerald-600" size={20} />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs font-black text-gray-900 leading-none">Admin</p>
                        <p className="text-[10px] font-bold text-gray-400">Online</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all"
                    title="Sair"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}

function HeaderNavItem({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-bold text-sm ${active
                ? 'bg-[#1A1A1A] text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-50'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
