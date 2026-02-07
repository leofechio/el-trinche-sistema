"use client";

import { useState, useEffect } from "react";
import { 
    Utensils, 
    ClipboardList, 
    Settings, 
    Bell, 
    Maximize2, 
    Menu, 
    User, 
    LogOut, 
    HelpCircle, 
    ChefHat,
    ChevronLeft,
    Users,
    Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function Header({ showVolver, onVolver }: any) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showStaffPopover, setShowStaffPopover] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [printerStatus, setPrinterStatus] = useState("Connected");

    useEffect(() => {
        // Load staff for the popover
        fetch("/api/staff")
            .then(res => res.json())
            .then(setStaff)
            .catch(console.error);

        // Load current user from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
    }, []);

    const activeTab = pathname.includes("tables") ? "mesas" : 
                       pathname.includes("orders") ? "pedidos" : 
                       pathname.includes("control") ? "control" : "";

    return (
        <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between relative z-50">
            {/* Left Section: Logo & Staff */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <button 
                        onClick={() => setShowStaffPopover(!showStaffPopover)}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform">
                            ET
                        </div>
                        <div className="text-left hidden lg:block">
                            <h2 className="text-sm font-black text-gray-900 leading-tight">El Trinche</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Restaurante POS</p>
                        </div>
                    </button>

                    <AnimatePresence>
                        {showStaffPopover && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-16 left-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden"
                            >
                                <div className="p-3 bg-gray-50 rounded-xl mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Personal en Turno</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-1">
                                    {staff.map((s: any) => (
                                        <div key={s.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-700">{s.name}</div>
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase">{s.role}</div>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-8 w-px bg-gray-100" />

                {showVolver && (
                    <button 
                        onClick={onVolver}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft size={14} />
                        Volver
                    </button>
                )}
            </div>

            {/* Center Section: Navigation & Printer Alert */}
            <div className="flex flex-col items-center gap-2">
                <nav className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
                    <NavLink 
                        href="/tables/map" 
                        active={activeTab === "mesas"} 
                        icon={<Utensils size={18} />} 
                        label="Mesas" 
                    />
                    <NavLink 
                        href="/orders" 
                        active={activeTab === "pedidos"} 
                        icon={<ClipboardList size={18} />} 
                        label="Pedidos" 
                        badge={3}
                    />
                    <NavLink 
                        href="/control" 
                        active={activeTab === "control"} 
                        icon={<Settings size={18} />} 
                        label="Control" 
                    />
                </nav>
                
                {/* Printer Status Link/Control */}
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                    <Printer size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Impresora Online</span>
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <IconButton 
                        icon={<Bell size={20} />} 
                        active={showNotifications}
                        onClick={() => setShowNotifications(!showNotifications)}
                    />
                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Notificaciones</span>
                                    <button className="text-[10px] text-emerald-600 font-bold hover:underline">Limpiar</button>
                                </div>
                                <div className="space-y-2">
                                    <NotificationItem title="Mesa 4 requiere asistencia" time="Hace 2 min" type="warning" />
                                    <NotificationItem title="Nuevo pedido web #1234" time="Hace 5 min" type="success" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <IconButton icon={<Maximize2 size={20} />} onClick={() => document.documentElement.requestFullscreen()} />
                
                <div className="h-8 w-px bg-gray-100" />

                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-gray-900">{currentUser?.name || "Cargando..."}</div>
                            <div className="text-[10px] text-gray-400 font-medium uppercase">{currentUser?.role || "Personal"}</div>
                        </div>
                        <div className="w-9 h-9 bg-gray-900 text-white rounded-lg flex items-center justify-center shadow-lg shadow-gray-200">
                            <Menu size={18} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-16 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden"
                            >
                                <div className="p-3 bg-gray-50 rounded-xl mb-2 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                        <ChefHat size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{currentUser?.name || "Usuario"}</div>
                                        <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                            En Linea
                                        </div>
                                    </div>
                                </div>
                                
                                <MenuLink icon={<User size={16} />} label="Mi Perfil" />
                                <MenuLink icon={<HelpCircle size={16} />} label="Centro de Ayuda" />
                                <div className="h-px bg-gray-100 my-1" />
                                <MenuLink 
                                    icon={<LogOut size={16} />} 
                                    label="Cerrar Sesión" 
                                    danger 
                                    onClick={() => {
                                        localStorage.removeItem("user");
                                        window.location.href = "/eltrinche";
                                    }} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}

function NavLink({ href, active, icon, label, badge }: any) {
    return (
        <Link 
            href={href}
            className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative group",
                active ? "bg-[#1A1A1A] text-white shadow-md font-bold" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold"
            )}
        >
            {icon}
            <span className="text-sm tracking-wide">{label}</span>
            {badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {badge}
                </span>
            )}
        </Link>
    );
}

function IconButton({ icon, onClick, active }: any) {
    return (
        <button 
            onClick={onClick}
            className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                active ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            )}
        >
            {icon}
        </button>
    );
}

function NotificationItem({ title, time, type }: any) {
    return (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer group">
            <div className="font-bold text-xs text-gray-800 group-hover:text-emerald-600 transition-colors">{title}</div>
            <div className="text-[9px] text-gray-400 mt-1 uppercase font-bold">{time}</div>
        </div>
    );
}

function MenuLink({ icon, label, danger, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                danger ? "text-rose-500 hover:bg-rose-50" : "text-gray-600 hover:bg-gray-50"
            )}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}
