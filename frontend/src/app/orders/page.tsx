"use client";

import { useState, useEffect } from "react";
import {
    Utensils,
    ClipboardList,
    Settings,
    Search,
    Bell,
    Menu as MenuIcon,
    ChevronDown,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { io } from "socket.io-client";
import Header from "../../components/Header";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        // Initial fetch
        fetch('/eltrinche/api/orders')
            .then(res => res.json())
            .then(data => setOrders(data));

        // Socket.io connection
        const socket = io({ path: '/socket.io' });

        socket.on('initial_data', (data) => {
            if (data.orders) setOrders(data.orders);
        });

        socket.on('new_order', (order) => {
            setOrders(prev => [...prev.filter(o => o.id !== order.id), order]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const moveOrder = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`/eltrinche/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) alert("Error al actualizar el estado del pedido.");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header activeTab="pedidos" />

            <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                <OrderColumn
                    title="En cola"
                    color="border-orange-400"
                    orders={orders.filter(o => o.status === "cola")}
                    onAction={(id: number) => moveOrder(id, "preparando")}
                    actionIcon={<Clock size={16} />}
                    actionLabel="Preparar"
                />
                <OrderColumn
                    title="Preparando"
                    color="border-indigo-400"
                    orders={orders.filter(o => o.status === "preparando")}
                    onAction={(id: number) => moveOrder(id, "listo")}
                    actionIcon={<CheckCircle2 size={16} />}
                    actionLabel="Listo"
                />
                <OrderColumn
                    title="Listo"
                    color="border-emerald-400"
                    orders={orders.filter(o => o.status === "listo")}
                    onAction={(id: number) => moveOrder(id, "entregado")}
                    actionIcon={<AlertCircle size={16} />}
                    actionLabel="Entregar"
                />
            </main>
        </div>
    );
}

function OrderColumn({ title, color, orders, onAction, actionIcon, actionLabel }: {
    title: string;
    color: string;
    orders: any[];
    onAction: (id: number) => void;
    actionIcon: React.ReactNode;
    actionLabel: string;
}) {
    return (
        <div className={clsx("flex flex-col bg-white rounded-xl shadow-sm border-t-4 overflow-hidden", color)}>
            <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-gray-700 uppercase tracking-wider text-sm">{title}</h2>
                <span className="bg-white border px-2 py-0.5 rounded text-xs font-bold text-gray-500">{orders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {orders.map((order: any) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-800">{order.table}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{order.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{order.items}</p>
                        <div className="flex justify-between items-center pt-3 border-t">
                            <span className="font-bold text-emerald-600 text-sm">{order.total.toFixed(2)}€</span>
                            <button
                                onClick={() => onAction(order.id)}
                                className="flex items-center gap-1.5 bg-gray-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-black transition-colors"
                            >
                                {actionIcon} {actionLabel}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <div onClick={onClick} className={clsx(
            "flex items-center gap-2 cursor-pointer transition-colors",
            active ? "text-emerald-600 font-bold" : "text-gray-500 hover:text-gray-800"
        )}>
            {icon}
            <span className="text-sm hidden md:inline">{label}</span>
        </div>
    );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
    return <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">{icon}</button>;
}
