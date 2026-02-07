"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { 
    Printer, 
    BarChart3, 
    Users, 
    Settings as SettingsIcon, 
    Plus, 
    X, 
    ChevronRight, 
    Database,
    Tag,
    Layers,
    Receipt,
    History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

export default function ControlPage() {
    const [view, setView] = useState("main");
    const [staff, setStaff] = useState<any[]>([]);
    const [printers, setPrinters] = useState<any[]>([]);
    const [showPrinterModal, setShowPrinterModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<any>(null);

    const loadData = async () => {
        try {
            const [sRes, pRes] = await Promise.all([
                fetch("/eltrinche/api/staff"),
                fetch("/eltrinche/api/printers")
            ]);
            if (sRes.ok) setStaff(await sRes.json());
            if (pRes.ok) setPrinters(await pRes.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddPrinter = async (data: any) => {
        try {
            const res = await fetch("/eltrinche/api/printers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setShowPrinterModal(false);
                loadData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeletePrinter = async (id: number) => {
        if (!confirm("¿Eliminar esta impresora?")) return;
        try {
            await fetch(`/eltrinche/api/printers/${id}`, { method: "DELETE" });
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20">
            <Header showVolver={view !== "main"} onVolver={() => setView("main")} />
            
            <main className="max-w-7xl mx-auto px-6 pt-12">
                <AnimatePresence mode="wait">
                    {view === "main" && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Centro de Control</h1>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Gestión avanzada del sistema</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <SmallCard title="Analíticas" icon={<BarChart3 />} onClick={() => setView("stats")} color="emerald" />
                                <SmallCard title="Dispositivos" icon={<Printer />} onClick={() => setView("devices")} color="blue" />
                                <SmallCard title="Personal" icon={<Users />} onClick={() => setView("staff")} color="orange" />
                                <SmallCard title="Productos" icon={<Layers />} onClick={() => alert("Módulo de Productos")} color="purple" />
                                <SmallCard title="Categorías" icon={<Tag />} onClick={() => alert("Módulo de Categorías")} color="pink" />
                                <SmallCard title="Mesas/Zonas" icon={<Database />} onClick={() => alert("Módulo de Zonas")} color="indigo" />
                                <SmallCard title="Historial" icon={<History />} onClick={() => alert("Módulo de Historial")} color="yellow" />
                                <SmallCard title="Ajustes" icon={<SettingsIcon />} onClick={() => alert("Ajustes Generales")} color="gray" />
                            </div>
                        </motion.div>
                    )}

                    {view === "devices" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <DevicesView 
                                printers={printers} 
                                onAdd={() => setShowPrinterModal(true)} 
                                onDelete={handleDeletePrinter}
                            />
                        </motion.div>
                    )}

                    {view === "staff" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <StaffView 
                                staff={staff} 
                                onEdit={(s: any) => { setEditingStaff(s); setShowStaffModal(true); }}
                            />
                        </motion.div>
                    )}

                    {view === "stats" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <ArqueosView />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showPrinterModal && (
                    <PrinterModal 
                        onClose={() => setShowPrinterModal(false)} 
                        onSave={handleAddPrinter} 
                    />
                )}
                {showStaffModal && (
                    <StaffEditModal 
                        employee={editingStaff} 
                        onClose={() => setShowStaffModal(false)} 
                        onSave={async (data: any) => {
                            await fetch(`/eltrinche/api/staff/${data.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(data)
                            });
                            setShowStaffModal(false);
                            loadData();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function SmallCard({ title, icon, onClick, color }: any) {
    const colors: any = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600",
        blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600",
        orange: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600",
        purple: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600",
        pink: "bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-600",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-100 group-hover:bg-yellow-600",
        gray: "bg-gray-50 text-gray-600 border-gray-100 group-hover:bg-gray-600",
    };

    return (
        <div onClick={onClick} className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-transparent hover:border-gray-100 transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
                <div className={clsx("p-4 rounded-2xl transition-all shadow-sm group-hover:text-white", colors[color])}>
                    {icon}
                </div>
                <ChevronRight size={18} className="text-gray-200 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">{title}</h4>
        </div>
    );
}

function DevicesView({ printers, onAdd, onDelete }: any) {
    return (
        <div className="bg-white p-12 rounded-[56px] shadow-xl shadow-gray-200/50 border border-gray-50">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3"><Printer className="text-blue-500" /> Impresoras</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase mt-1">Configuración de tickets y comandas</p>
                </div>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
                >
                    <Plus size={16} /> Añadir Impresora
                </button>
            </div>
            
            {printers.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Printer className="text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-bold">No hay impresoras configuradas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {printers.map((p: any) => (
                        <div key={p.id} className="p-8 bg-gray-50 rounded-[40px] border border-transparent hover:border-blue-200 hover:bg-white transition-all group shadow-sm hover:shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-white rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <Printer size={28} />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-all text-[10px] uppercase">Probar</button>
                                    <button onClick={() => onDelete(p.id)} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-all text-[10px] uppercase">Eliminar</button>
                                </div>
                            </div>
                            <h4 className="text-lg font-black text-gray-900 leading-tight">{p.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.type} • {p.ip}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StaffView({ staff, onEdit }: any) {
    return (
        <div className="bg-white p-12 rounded-[56px] shadow-xl shadow-gray-200/50 border border-gray-50">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-10"><Users className="text-orange-500" /> Mi Equipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((s: any) => (
                    <div key={s.id} onClick={() => onEdit(s)} className="p-6 bg-gray-50 rounded-[32px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-orange-100 cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 font-black shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                {s.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900">{s.name}</h4>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{s.role}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400">{s.phone}</span>
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Activo</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PrinterModal({ onClose, onSave }: any) {
    const [name, setName] = useState("");
    const [ip, setIp] = useState("");
    const [type, setType] = useState("USB");

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-gray-900">Nueva Impresora</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X /></button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del dispositivo</label>
                        <input className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-500 transition-colors" placeholder="Ej: Cocina 1" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IP o Puerto</label>
                            <input className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-500 transition-colors" placeholder="192.168.1.100" value={ip} onChange={e => setIp(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</label>
                            <select className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-500 appearance-none transition-colors" value={type} onChange={e => setType(e.target.value)}>
                                <option value="USB">USB</option>
                                <option value="ETHERNET">Ethernet</option>
                                <option value="WIFI">WiFi</option>
                            </select>
                        </div>
                    </div>
                    <button 
                        onClick={() => onSave({ name, ip, type })}
                        className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl shadow-blue-100 hover:shadow-2xl transition-all mt-6"
                    >
                        Guardar Dispositivo
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function StaffEditModal({ employee, onClose, onSave }: any) {
    const [form, setForm] = useState(employee);
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-gray-900">Editar Perfil</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X /></button>
                </div>
                <div className="space-y-6">
                    <input className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 font-bold outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 font-bold outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    <select className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 font-bold outline-none" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                        <option value="Administrador">Administrador</option>
                        <option value="Gerente">Gerente</option>
                        <option value="Camarero">Camarero</option>
                    </select>
                    <button onClick={() => onSave(form)} className="w-full py-5 bg-orange-600 text-white rounded-3xl font-black shadow-xl shadow-orange-100">Actualizar</button>
                </div>
            </motion.div>
        </div>
    );
}

function ArqueosView() {
    return (
        <div className="bg-white p-12 rounded-[56px] shadow-xl shadow-gray-200/50 border border-gray-50">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-10"><BarChart3 className="text-emerald-500" /> Analíticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-10 bg-emerald-50 rounded-[48px] border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Ventas Brutas</p>
                    <p className="text-5xl font-black text-gray-900 tracking-tighter">0€</p>
                </div>
                <div className="p-10 bg-blue-50 rounded-[48px] border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Pedidos</p>
                    <p className="text-5xl font-black text-gray-900 tracking-tighter">0</p>
                </div>
                <div className="p-10 bg-gray-900 rounded-[48px] shadow-2xl shadow-gray-400">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Estado Caja</p>
                    <p className="text-3xl font-black text-white">Cerrada</p>
                </div>
            </div>
            <div className="mt-12 h-64 border-2 border-dashed border-gray-100 rounded-[48px] flex items-center justify-center">
                <span className="text-gray-300 font-bold uppercase tracking-widest text-xs">Gráfico de Actividad</span>
            </div>
        </div>
    );
}
