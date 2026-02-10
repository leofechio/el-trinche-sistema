'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
    BarChart3,
    TrendingUp,
    Users,
    CreditCard,
    Clock,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react';

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const res = await fetch('/eltrinche/api/analytics');
                const analyticsData = await res.json();
                setData(analyticsData);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-gray-400">CARREGANDO MÉTRICAS...</div>;

    return (
        <div className="min-h-screen bg-[#F5F7FA] pb-20">
            <Header activeTab="analytics" />

            <div className="max-w-7xl mx-auto px-6 mt-10">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Analytics El Trinche</h1>
                        <p className="text-gray-500 font-bold mt-1">Visão geral do desempenho do seu restaurante</p>
                    </div>
                    <div className="bg-white p-2 rounded-2xl shadow-sm border flex gap-1">
                        <button className="px-6 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-black">HOJE</button>
                        <button className="px-6 py-2 text-gray-400 hover:bg-gray-50 rounded-xl text-xs font-black transition-all">ESTA SEMANA</button>
                        <button className="px-6 py-2 text-gray-400 hover:bg-gray-50 rounded-xl text-xs font-black transition-all">ESTE MÊS</button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <MetricCard
                        title="Vendas Totais"
                        value={`${(data?.totalSales || 0).toFixed(2)}€`}
                        trend="+12.5%"
                        icon={<TrendingUp size={24} />}
                        color="emerald"
                    />
                    <MetricCard
                        title="Total de Pedidos"
                        value={data?.totalOrders || 0}
                        trend="+8.2%"
                        icon={<Package size={24} />}
                        color="blue"
                    />
                    <MetricCard
                        title="Ticket Médio"
                        value={`${(data?.averageTicket || 0).toFixed(2)}€`}
                        trend="-2.4%"
                        icon={<CreditCard size={24} />}
                        color="purple"
                    />
                    <MetricCard
                        title="Clientes"
                        value={data?.totalOrders || 0}
                        trend="+5.1%"
                        icon={<Users size={24} />}
                        color="amber"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Sales by Payment Method */}
                    <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50 flex flex-col">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Métodos de Pagamento</h3>
                        <div className="space-y-6 flex-1">
                            {Object.entries(data?.salesByPaymentMethod || {}).map(([method, amount]: [any, any]) => (
                                <div key={method} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500">
                                            {method === 'cash' ? <CreditCard size={20} /> : <CreditCard size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 capitalize">{method === 'cash' ? 'Dinheiro' : 'Cartão'}</p>
                                            <div className="w-32 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${(amount / (data?.totalSales || 1) * 100).toFixed(0)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-black text-gray-900">{amount.toFixed(2)}€</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Most Sold Products */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Produtos Mais Vendidos</h3>
                            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Ver Todos</button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {Object.entries(data?.productSales || {}).slice(0, 4).map(([name, stats]: [any, any]) => (
                                <div key={name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-transparent hover:border-emerald-100 hover:bg-white transition-all group">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                                        <Package size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-800 line-clamp-1">{name}</p>
                                        <p className="text-xs text-gray-400 font-bold">{stats.quantity} Unidades vendidas</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-emerald-600">{stats.total.toFixed(2)}€</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sales by Hour (Simple representation) */}
                <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50 mb-10">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 text-center">Fluxo de Vendas por Hora</h3>
                    <div className="flex items-end justify-between h-48 gap-2 px-4">
                        {Array.from({ length: 24 }).map((_, i) => {
                            const val = data?.salesByHour[i] || 0;
                            const max = Math.max(...Object.values(data?.salesByHour || {}).map((v: any) => v), 1);
                            const height = (val / max * 100);
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-full relative flex items-end justify-center h-40">
                                        <div
                                            className={`w-full rounded-full transition-all duration-500 ${val > 0 ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-gray-100'}`}
                                            style={{ height: `${height}%` }}
                                        >
                                            {val > 0 && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-2 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                                    {val.toFixed(2)}€
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-300">{i}h</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Cash History */}
                <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Histórico de Caixas</h3>
                    <div className="overflow-hidden border rounded-[32px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Responsável</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Abertura / Fechamento</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Faturamento</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Estado</th>
                                    <th className="p-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.cashRegistersSummary || []).map((cr: any) => (
                                    <tr key={cr.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-all">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 shadow-sm">{cr.userName[0]}</div>
                                                <span className="font-black text-gray-800">{cr.userName}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                    <Clock size={14} className="text-emerald-500" />
                                                    {new Date(cr.openedAt).toLocaleString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                                                    <Clock size={14} />
                                                    {cr.closedAt ? new Date(cr.closedAt).toLocaleString() : '---'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-gray-900">{cr.totalSales.toFixed(2)}€</p>
                                            <p className="text-[10px] font-bold text-gray-400">{cr.salesCount} Vendas realizadas</p>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cr.status === 'open'
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {cr.status === 'open' ? 'Aberto' : 'Fechado'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button className="p-2 text-gray-300 hover:text-emerald-500 transition-all"><ChevronRight /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, trend, icon, color }: any) {
    const isPositive = trend.startsWith('+');
    const colorClasses: any = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50 hover:scale-105 transition-all cursor-default group overflow-hidden relative">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-500 ${color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

            <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl ${colorClasses[color]} group-hover:bg-[#1A1A1A] group-hover:text-white transition-all shadow-sm`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-3xl font-black text-gray-900">{value}</h4>
        </div>
    );
}
