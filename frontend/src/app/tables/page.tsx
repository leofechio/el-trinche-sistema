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
    User,
    Printer,
    Trash2,
    Plus,
    Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { CATEGORIES, PRODUCTS } from "../constants";

import Header from "../../components/Header";

async function printReceipt(cart: any[], total: number) {
    try {
        const content = cart.map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}€`).join("\n");
        const fullContent = `MESA rápida\n----------------\n${content}\n----------------\nTOTAL: ${total.toFixed(2)}€`;

        const res = await fetch('/eltrinche/api/print', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                printerIp: '192.168.1.100', // Default mock IP
                content: fullContent
            })
        });
        return res.ok;
    } catch (err) {
        console.error(err);
        alert("Error enviando a la impresora. ¿Está encendida?");
        return false;
    }
}

export default function TablesPage() {
    const [tableName, setTableName] = useState("Cuenta rápida");
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tableId = params.get('table');
        if (tableId) setTableName(`Mesa ${tableId}`);
    }, []);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => {
            const existing = prev.find(item => item.id === productId);
            if (existing?.quantity === 1) {
                return prev.filter(item => item.id !== productId);
            }
            return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
        });
    };

    const clearCart = () => setCart([]);

    const sendOrder = async () => {
        if (cart.length === 0) return;

        try {
            const res = await fetch('/eltrinche/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: tableName,
                    items: cart.map(i => `${i.quantity}x ${i.name}`).join(", "),
                    total: total
                })
            });

            if (res.ok) {
                alert("¡Pedido enviado correctamente!");
                clearCart();
            } else {
                alert("Error al enviar el pedido.");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión con el servidor.");
        }
    };

    const currentProducts = (PRODUCTS as any)[activeTab] || [];
    const filteredProducts = currentProducts.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header
                activeTab="mesas"
                showVolver={tableName !== "Cuenta rápida"}
                onVolver={() => window.location.href = '/eltrinche/tables/map'}
            />

            <main className="flex flex-1 overflow-hidden">
                {/* Left Side: Product Selection */}
                <div className="flex-1 flex flex-col overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-4">
                            <TabButton active={activeTab === "menu"} onClick={() => setActiveTab("menu")}>
                                Cuenta rápida
                            </TabButton>
                            <TabButton active={activeTab === "bono"} onClick={() => setActiveTab("bono")}>
                                Bono
                            </TabButton>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none w-64 bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                        {CATEGORIES.map((cat) => (
                            <motion.button
                                key={cat.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(cat.id)}
                                className={clsx(
                                    "h-24 rounded-xl p-4 flex items-center justify-center text-center text-white font-bold text-[10px] md:text-xs uppercase shadow-sm transition-all",
                                    cat.color,
                                    activeTab === cat.id ? "ring-4 ring-emerald-200 scale-105" : "opacity-90 hover:opacity-100"
                                )}
                            >
                                {cat.name}
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex-1 border-t border-dashed pt-6 overflow-y-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
                            {filteredProducts.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addToCart(p)}
                                    className="bg-white border rounded-xl p-4 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors"
                                >
                                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 italic text-[10px]">
                                        No image
                                    </div>
                                    <div className="font-bold text-gray-800 text-sm h-10 line-clamp-2">
                                        {p.name}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-emerald-600 font-bold">{p.price.toFixed(2)}€</span>
                                        <button className="bg-emerald-50 text-emerald-600 p-1 rounded-full">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Comanda (Cart) */}
                <aside className="w-96 bg-white border-l flex flex-col shadow-2xl z-40">
                    <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0">
                        <span className="font-bold text-gray-800">{tableName}</span>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-emerald-600">{total.toFixed(2)}€</span>
                            <div className="flex gap-1">
                                <button onClick={clearCart} className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        <AnimatePresence>
                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                                    <ClipboardList size={48} className="mb-4" />
                                    <p className="text-sm">Selecciona productos...</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col bg-gray-50 rounded-lg p-3 border border-gray-100"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm text-gray-700 truncate mr-2">{item.name}</span>
                                            <span className="font-bold text-emerald-600 text-sm">{(item.price * item.quantity).toFixed(2)}€</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">{item.price.toFixed(2)}€ / un.</span>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white">
                                                    <Minus size={14} className="text-gray-500" />
                                                </button>
                                                <span className="font-bold text-sm bg-white px-3 py-1 rounded-md border">{item.quantity}</span>
                                                <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white text-emerald-600">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-4 bg-white border-t space-y-3">
                        <div className="flex gap-3">
                            <button
                                onClick={() => printReceipt(cart, total)}
                                disabled={cart.length === 0}
                                className="bg-gray-100 text-gray-600 p-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                                title="Imprimir ticket"
                            >
                                <Printer size={24} />
                            </button>
                            <button
                                disabled={cart.length === 0}
                                onClick={sendOrder}
                                className={clsx(
                                    "flex-1 font-bold text-white py-4 rounded-xl transition-all shadow-md",
                                    cart.length > 0 ? "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02]" : "bg-gray-300 cursor-not-allowed"
                                )}
                            >
                                Cerrar cuenta
                            </button>
                        </div>
                    </div>
                </aside>
            </main>
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
        <div
            onClick={onClick}
            className={clsx(
                "flex items-center gap-2 cursor-pointer transition-colors",
                active ? "text-emerald-600 font-bold" : "text-gray-500 hover:text-gray-800"
            )}>
            {icon}
            <span className="text-sm hidden md:inline">{label}</span>
        </div>
    );
}

function IconButton({ icon, small }: { icon: React.ReactNode; small?: boolean }) {
    return (
        <button className={clsx(
            "p-2 hover:bg-gray-100 rounded-full text-gray-500",
            small ? "p-1" : "p-2"
        )}>
            {icon}
        </button>
    );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "px-4 py-2 font-bold text-sm transition-all relative",
                active ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
            )}
        >
            {children}
            {active && (
                <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                />
            )}
        </button>
    );
}
