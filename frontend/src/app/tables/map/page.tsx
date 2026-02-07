
"use client";

import { useState, useEffect } from "react";
import {
    Map as MapIcon,
    LayoutGrid,
    Users,
    ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import Header from "../../../components/Header";

export default function TableMapPage() {
    const [zones, setZones] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [activeZone, setActiveZone] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [zRes, tRes, oRes] = await Promise.all([
                    fetch('/eltrinche/api/zones'),
                    fetch('/eltrinche/api/tables'),
                    fetch('/eltrinche/api/orders')
                ]);
                
                const zonesData = await zRes.json();
                const tablesData = await tRes.json();
                const ordersData = await oRes.json();

                setZones(zonesData);
                if (zonesData.length > 0) setActiveZone(zonesData[0].id);

                // Merge status from orders
                const enrichedTables = tablesData.map((t: any) => {
                    const hasOrder = ordersData.some((o: any) => 
                        o.table === `Mesa ${t.name}` || o.table === t.name
                    );
                    return { ...t, status: hasOrder ? 'occupied' : 'available' };
                });
                setTables(enrichedTables);
            } catch (err) {
                console.error("Error fetching map data:", err);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling for updates
        return () => clearInterval(interval);
    }, []);

    const filteredTables = tables.filter(t => t.zoneId === activeZone);

    return (
        <div className="min-h-screen bg-[#F4F7FA] flex flex-col font-sans">
            <Header activeTab="mesas" />

            <div className="flex-1 flex flex-col">
                {/* Zone Switcher & Controls */}
                <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-16 z-30 shadow-sm">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        {zones.map(zone => (
                            <button
                                key={zone.id}
                                onClick={() => setActiveZone(zone.id)}
                                className={clsx(
                                    "px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                    activeZone === zone.id 
                                        ? "bg-[#1A1A1A] text-white shadow-lg" 
                                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                )}
                            >
                                {zone.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border">
                        <button 
                            onClick={() => setViewMode('map')}
                            className={clsx(
                                "p-2 rounded-xl transition-all",
                                viewMode === 'map' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <MapIcon size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-2 rounded-xl transition-all",
                                viewMode === 'list' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>

                <main className="flex-1 p-8 relative overflow-hidden">
                    <div className="mx-auto max-w-6xl h-full min-h-[600px] bg-[#EAECEF] rounded-[40px] shadow-inner relative border-8 border-white overflow-hidden">
                        {/* Interactive Area */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                        <AnimatePresence mode="wait">
                          <motion.div 
                            key={activeZone && (activeZone as any) + viewMode}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="w-full h-full relative"
                          >
                            {viewMode === 'map' ? (
                                filteredTables.map((table) => (
                                    <motion.div
                                        key={table.id}
                                        style={{ left: table.x, top: table.y }}
                                        className={clsx(
                                            "absolute flex flex-col items-center justify-center cursor-pointer shadow-xl transition-all hover:scale-105 active:scale-95 group",
                                            table.type === "circle" ? "w-24 h-24 rounded-full" :
                                                table.type === "bar" ? "w-48 h-12 rounded-2xl" : "w-20 h-20 rounded-3xl",
                                            table.status === "occupied" ? "bg-[#FF3B30] text-white" : "bg-emerald-500 text-white ring-4 ring-white/20"
                                        )}
                                        onClick={() => window.location.href = `/tables?table=${table.name}`}
                                    >
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="font-black text-xl tracking-tighter">{table.name}</span>
                                        </div>
                                        {table.status === "occupied" && (
                                            <div className="mt-1 text-[9px] font-black uppercase tracking-widest bg-black/10 px-2 py-0.5 rounded-full">
                                                Ocupada
                                            </div>
                                        )}
                                        {/* Dynamic details on hover */}
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50">
                                            Mesa {table.name} • {table.status === 'occupied' ? 'Ver Comanda' : 'Abrir Cuenta'}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-10 overflow-y-auto max-h-full">
                                    {filteredTables.map(table => (
                                        <motion.div
                                            key={table.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => window.location.href = `/tables?table=${table.name}`}
                                            className={clsx(
                                                "aspect-square rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer transition-all",
                                                table.status === 'occupied' ? 'bg-[#FF3B30] text-white' : 'bg-white text-gray-800 hover:border-emerald-500 border-2 border-transparent'
                                            )}
                                        >
                                            <span className="text-3xl font-black mb-1">{table.name}</span>
                                            <span className="text-[10px] font-black uppercase opacity-60">{table.status === 'occupied' ? 'Ocupada' : 'Libre'}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                          </motion.div>
                        </AnimatePresence>

                        {/* Summary Legend */}
                        <div className="absolute bottom-8 right-8 flex flex-col gap-3 bg-white/80 backdrop-blur-md p-5 rounded-3xl border shadow-xl z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-200" />
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Libre</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-[#FF3B30] shadow-md shadow-rose-200" />
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Ocupada</span>
                            </div>
                            <div className="flex items-center gap-4 border-t pt-3 mt-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-200" />
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Cuenta</span>
                            </div>
                        </div>
                        
                        {/* Zone Capacity Hint */}
                        <div className="absolute top-8 right-8 bg-black/5 px-4 py-2 rounded-2xl backdrop-blur-sm">
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Capacidad: <span className="text-gray-800">{filteredTables.length} Mesas</span>
                             </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
