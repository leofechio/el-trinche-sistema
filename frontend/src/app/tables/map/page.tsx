"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Utensils,
    Map as MapIcon,
    Plus,
    Clock,
    User,
    ChevronRight,
    Search,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";

export default function TablesMapPage() {
    const [zones, setZones] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeZone, setActiveZone] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s for updates
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [zonesRes, tablesRes, ordersRes] = await Promise.all([
                fetch('/eltrinche/api/zones'),
                fetch('/eltrinche/api/tables'),
                fetch('/eltrinche/api/orders')
            ]);

            const [zData, tData, oData] = await Promise.all([
                zonesRes.json(),
                tablesRes.json(),
                ordersRes.json()
            ]);

            setZones(zData || []);
            setTables(tData || []);
            setOrders(oData || []);

            if (zData.length > 0 && activeZone === null) {
                setActiveZone(zData[0].id);
            }
        } catch (err) {
            console.error("Error fetching map data", err);
        } finally {
            setLoading(false);
        }
    };

    const getTableStatus = (tableNumber: string) => {
        const activeOrder = orders.find(o => o.tableName === `Mesa ${tableNumber}` && o.status !== 'cobrado');
        if (activeOrder) return { status: 'occupied', order: activeOrder };
        return { status: 'free' };
    };

    const handleTableClick = (tableNumber: string) => {
        router.push(`/eltrinche/tables?table=${tableNumber}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Carregando Mapa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
            <Header activeTab="mesas" />

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                            <MapIcon size={40} className="text-emerald-600" />
                            Mapa de Mesas
                        </h2>
                        <p className="text-gray-500 font-bold mt-1">Selecione uma mesa para abrir ou gerenciar uma conta.</p>
                    </div>

                    <div className="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 border flex gap-1">
                        {zones.map(z => (
                            <button
                                key={z.id}
                                onClick={() => setActiveZone(z.id)}
                                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeZone === z.id
                                    ? 'bg-[#1A1A1A] text-white shadow-lg'
                                    : 'text-gray-400 hover:bg-gray-50'
                                    }`}
                            >
                                {z.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
                    {tables.filter(t => t.zoneId === activeZone).map(t => {
                        const { status, order } = getTableStatus(t.number);
                        return (
                            <motion.div
                                key={t.id}
                                whileHover={{ y: -8, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTableClick(t.number)}
                                className={`aspect-square rounded-[40px] p-6 cursor-pointer relative shadow-2xl transition-all border-4 ${status === 'occupied'
                                    ? 'bg-emerald-600 border-emerald-400 text-white'
                                    : 'bg-white border-transparent hover:border-emerald-500 text-gray-900'
                                    }`}
                            >
                                <div className="h-full flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black">{t.number}</span>
                                    {status === 'occupied' && (
                                        <div className="mt-2 flex flex-col items-center">
                                            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                                                <Clock size={8} /> {order.total.toFixed(2)}€
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {status === 'occupied' && (
                                    <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full animate-pulse shadow-sm"></div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* Botão de Conta Rápida */}
                    <motion.div
                        whileHover={{ y: -8, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTableClick('Rápida')}
                        className="aspect-square rounded-[40px] p-6 cursor-pointer relative shadow-2xl transition-all border-4 bg-[#1A1A1A] text-white border-transparent hover:border-emerald-500"
                    >
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Plus size={32} className="mb-2 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Conta<br />Rápida</span>
                        </div>
                    </motion.div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-12 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-md bg-white border shadow-sm"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mesa Livre</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-md bg-emerald-600 shadow-sm"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Com Cliente</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-md bg-[#1A1A1A] shadow-sm"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Venda Direta</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
