"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    Minus,
    Monitor,
    Cloud,
    CreditCard,
    Banknote,
    X,
    CheckCircle2,
    Clock,
    Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import Header from "@/components/Header";
import { CATEGORIES, PRODUCTS } from "../constants";

export default function TablesPage() {
    const router = useRouter();
    const [tableName, setTableName] = useState("Conta Rápida");
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    // Cash Register State
    const [currentRegister, setCurrentRegister] = useState<any>(null);
    const [showCashModal, setShowCashModal] = useState(false);
    const [cashInitialAmount, setCashInitialAmount] = useState("100");

    // Order & Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Print config
    const [printMode, setPrintMode] = useState<"browser" | "vps">("browser");
    const [printers, setPrinters] = useState<any[]>([]);
    const [selectedPrinterIp, setSelectedPrinterIp] = useState("");

    const [allData, setAllData] = useState<any>({ categories: [], products: [] });

    const currentUser = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('eltrinche_user') || '{}') : '{}');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tableId = params.get('table');
        if (tableId) setTableName(`Mesa ${tableId}`);

        checkCashRegister();
        loadPrinters();

        // Socket for real-time updates
        const socket = (window as any).io ? (window as any).io({ path: '/eltrinche/socket.io/' }) : null;
        if (socket) {
            socket.on('initial_data', (receivedData: any) => {
                setAllData(receivedData);
            });
        }

        const savedMode = localStorage.getItem('eltrinche_printmode');
        if (savedMode) setPrintMode(savedMode as any);

        return () => { if (socket) (socket as any).disconnect(); };
    }, []);

    const checkCashRegister = async () => {
        try {
            const res = await fetch('/eltrinche/api/cash-registers/current');
            if (res.ok) {
                const data = await res.json();
                setCurrentRegister(data.data || data);
                setShowCashModal(false);
            } else {
                setShowCashModal(true);
            }
        } catch (err) {
            console.error("Error checking cash register", err);
        }
    };

    const loadPrinters = async () => {
        try {
            const res = await fetch('/eltrinche/api/printers');
            const data = await res.json();
            setPrinters(data || []);
            if (data && data.length > 0) setSelectedPrinterIp(data[0].ip);
        } catch (err) {
            console.error("Error loading printers", err);
        }
    };

    const openCashRegister = async () => {
        try {
            const res = await fetch('/eltrinche/api/cash-registers/open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id || 1,
                    userName: currentUser.name || "Admin",
                    initialAmount: parseFloat(cashInitialAmount)
                })
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentRegister(data.register);
                setShowCashModal(false);
            } else {
                alert("Erro ao abrir caixa");
            }
        } catch (err) {
            alert("Erro de conexão");
        }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const addToCart = (product: any, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
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

    const clearCart = () => {
        if (confirm("Deseja limpar o pedido?")) setCart([]);
    };

    const handleTableClick = (tableNumber: string) => {
        router.push(`/eltrinche/tables?table=${tableNumber}`);
    };

    const handleCheckout = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (cart.length === 0) return;
        setShowPaymentModal(true);
    };

    const confirmPayment = async () => {
        setIsProcessing(true);
        try {
            // 1. Create Order
            const orderRes = await fetch('/eltrinche/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableName,
                    items: cart,
                    total: total,
                    userId: currentUser.id,
                    userName: currentUser.name
                })
            });
            const orderRoot = await orderRes.json();

            // 2. Pay Order
            const payRes = await fetch(`/eltrinche/api/orders/${orderRoot.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMethod,
                    amount: total
                })
            });

            if (payRes.ok) {
                setOrderSuccess(true);
                if (printMode === 'vps') {
                    printReceipt(cart, total);
                }
                setTimeout(() => {
                    setOrderSuccess(false);
                    setShowPaymentModal(false);
                    setCart([]);
                    router.push('/tables/map');
                }, 2000);
            } else {
                alert("Erro ao processar pagamento no servidor.");
            }
        } catch (err) {
            alert("Erro de conexão com o servidor. Verifique se o backend está rodando.");
        } finally {
            setIsProcessing(false);
        }
    };

    const printReceipt = async (items: any[], totalValue: number) => {
        if (printMode === "browser") {
            window.print();
            return;
        }

        // Check if jspdf is available, if not try to load it
        if (!(window as any).jspdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => generatePDF(items, totalValue);
            document.head.appendChild(script);
        } else {
            generatePDF(items, totalValue);
        }

        // Also try VPS print if selected
        if (printMode === "vps") {
            try {
                const date = new Date().toLocaleString();
                const itemsText = items.map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}€`).join('\n');
                const fullContent = `
=== EL TRINCHE ===
Fecha: ${date}
Mesa: ${tableName}
------------------
${itemsText}
------------------
TOTAL: ${totalValue.toFixed(2)}€
Grs. por su visita
==================
`;

                await fetch('/eltrinche/api/print', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        printerIp: selectedPrinterIp || '192.168.1.100',
                        content: fullContent
                    })
                });
            } catch (err) {
                console.error("VPS Print failed", err);
            }
        }
    };

    const generatePDF = (items: any[], totalValue: number) => {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF({
            unit: 'mm',
            format: [80, 150]
        });

        doc.setFontSize(16);
        doc.text("EL TRINCHE", 40, 10, { align: 'center' });
        doc.setFontSize(8);
        doc.text("TICKET DE VENDA", 40, 15, { align: 'center' });

        doc.setLineDashPattern([1, 1], 0);
        doc.line(5, 20, 75, 20);

        doc.text(`Data: ${new Date().toLocaleString()}`, 5, 25);
        doc.text(`Mesa: ${tableName}`, 5, 30);

        doc.line(5, 35, 75, 35);

        let y = 40;
        items.forEach(item => {
            doc.text(`${item.quantity}x ${item.name}`, 5, y);
            doc.text(`${(item.price * item.quantity).toFixed(2)}€`, 75, y, { align: 'right' });
            y += 5;
        });

        doc.line(5, y, 75, y);
        y += 7;

        doc.setFontSize(14);
        doc.text("TOTAL", 5, y);
        doc.text(`${totalValue.toFixed(2)}€`, 75, y, { align: 'right' });

        y += 10;
        doc.setFontSize(8);
        doc.text("Obrigado pela preferência!", 40, y, { align: 'center' });

        doc.save(`ticket-${Date.now()}.pdf`);
    };

    const uiCategories = allData.categories.length > 0 ? allData.categories : CATEGORIES;
    const uiProducts = allData.products.length > 0 ?
        allData.products.reduce((acc: any, p: any) => {
            if (!acc[p.category]) acc[p.category] = [];
            acc[p.category].push(p);
            return acc;
        }, {}) : PRODUCTS;

    const categoryProducts = (uiProducts as any)[activeTab] || [];
    const filteredProducts = categoryProducts.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-[#F5F7FA] min-h-screen flex flex-col font-sans overflow-hidden">
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #p-receipt, #p-receipt * { visibility: visible !important; }
                    #p-receipt { 
                        position: absolute !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        width: 80mm !important; 
                        margin: 0 !important;
                        padding: 10px !important;
                        background: white !important;
                        color: black !important;
                        font-family: 'Courier New', Courier, monospace !important;
                        font-size: 11px !important;
                    }
                    @page { margin: 0; size: auto; }
                }
            `}</style>

            <Header
                activeTab="mesas"
                showVolver={true}
                onVolver={() => router.push('/tables/map')}
            />

            <main className="flex-1 flex overflow-hidden">
                {/* Menu Central */}
                <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-[300px] relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Procurar prato ou bebida..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border-2 border-transparent rounded-3xl py-4 pl-14 pr-6 shadow-xl shadow-gray-200/50 outline-none focus:border-emerald-500 transition-all font-bold text-gray-700"
                            />
                        </div>

                        <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-lg shadow-gray-200/50 border">
                            <button
                                onClick={() => { setPrintMode('browser'); localStorage.setItem('eltrinche_printmode', 'browser'); }}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    printMode === 'browser' ? "bg-[#1A1A1A] text-white shadow-xl" : "text-gray-400 hover:bg-gray-50"
                                )}
                            >
                                <Monitor size={16} /> Navegador
                            </button>
                            <button
                                onClick={() => { setPrintMode('vps'); localStorage.setItem('eltrinche_printmode', 'vps'); }}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    printMode === 'vps' ? "bg-[#1A1A1A] text-white shadow-xl" : "text-gray-400 hover:bg-gray-50"
                                )}
                            >
                                <Cloud size={16} /> VPS
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {uiCategories.map((cat: any) => (
                            <motion.button
                                key={cat.id}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(cat.id)}
                                className={clsx(
                                    "whitespace-nowrap px-8 py-4 rounded-2xl flex items-center justify-center text-center text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all",
                                    cat.color || 'bg-emerald-600',
                                    activeTab === cat.id ? "ring-4 ring-emerald-500 ring-offset-4 ring-offset-[#F5F7FA]" : "opacity-70 hover:opacity-100"
                                )}
                            >
                                {cat.name}
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                            {filteredProducts.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={(e) => addToCart(p, e)}
                                    className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/40 cursor-pointer border-2 border-transparent hover:border-emerald-500 transition-all group relative overflow-hidden"
                                >
                                    <div className="aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center text-gray-200 group-hover:bg-emerald-50 group-hover:text-emerald-200 transition-all">
                                        <Utensils size={48} />
                                    </div>
                                    <h4 className="font-black text-gray-800 text-sm mb-1 line-clamp-2 h-10 group-hover:text-emerald-700">{p.name}</h4>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-emerald-600 font-black text-lg">{p.price.toFixed(2)}€</span>
                                        <div className="bg-[#1A1A1A] text-white p-3 rounded-2xl group-hover:bg-emerald-600 group-hover:scale-110 transition-all shadow-lg active:scale-90">
                                            <Plus size={24} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Comanda Lateral */}
                <aside className="w-[420px] bg-white border-l shadow-2xl z-40 flex flex-col">
                    <div className="p-8 border-b flex items-center justify-between bg-white relative">
                        <div className="flex flex-col">
                            <h2 className="font-black text-2xl text-gray-900 tracking-tight">{tableName}</h2>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} className="text-emerald-500" /> EM ANDAMENTO
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Geral</p>
                            <p className="font-black text-4xl text-emerald-600 tabular-nums">{total.toFixed(2)}€</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4 scrollbar-hide">
                        <AnimatePresence>
                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-200 space-y-4">
                                    <ClipboardList size={80} className="opacity-20 translate-y-4" />
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest text-center">Nenhum item<br />selecionado</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-gray-50 rounded-[24px] p-5 border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-black text-gray-800 text-sm">{item.name}</span>
                                            <span className="font-black text-emerald-600 tabular-nums">{(item.price * item.quantity).toFixed(2)}€</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.price.toFixed(2)}€ Unid.</span>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 rounded-xl bg-white border shadow-sm flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all font-black">
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-black text-sm w-8 text-center tabular-nums">{item.quantity}</span>
                                                <button onClick={() => addToCart(item)} className="w-10 h-10 rounded-xl bg-white border shadow-sm flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 transition-all font-black text-emerald-600">
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-8 bg-white border-t space-y-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
                        {printMode === 'vps' && printers.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 border">
                                <Printer className="text-gray-400" size={20} />
                                <div className="flex-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">IMPRESSORA ATIVA</p>
                                    <select
                                        value={selectedPrinterIp}
                                        onChange={(e) => setSelectedPrinterIp(e.target.value)}
                                        className="w-full bg-transparent text-[10px] font-black text-gray-800 outline-none uppercase"
                                    >
                                        {printers.map(p => <option key={p.id} value={p.ip}>{p.name} - {p.ip}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => printReceipt(cart, total)}
                                disabled={cart.length === 0}
                                className="w-20 h-20 bg-gray-100 text-gray-400 rounded-[24px] hover:bg-[#1A1A1A] hover:text-white transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm"
                            >
                                <Printer size={28} className="group-hover:scale-110 transition-all" />
                            </button>
                            <div className="flex gap-6 mt-auto pt-6 border-t border-gray-100">
                                <button
                                    onClick={clearCart}
                                    disabled={cart.length === 0}
                                    className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[28px] hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm border-2 border-rose-100"
                                >
                                    <Trash2 size={28} className="group-hover:scale-110 transition-all" />
                                </button>

                                <button
                                    disabled={cart.length === 0 || isProcessing}
                                    onClick={handleCheckout}
                                    className={clsx(
                                        "flex-1 h-20 font-black text-white rounded-[28px] transition-all shadow-2xl flex items-center justify-center gap-3 text-xl tracking-tight",
                                        cart.length > 0 ? "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] shadow-emerald-200" : "bg-gray-300 cursor-not-allowed"
                                    )}
                                >
                                    {isProcessing ? "PROCESSANDO..." : "FECHAR CONTA"}
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Modal de Abertura de Caixa */}
            {showCashModal && (
                <div className="fixed inset-0 bg-[#1A1A1A]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl text-center"
                    >
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                            <Wallet size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Abrir Caixa</h2>
                        <p className="text-gray-500 font-bold mb-8">Informe o valor de fundo de caixa para iniciar os trabalhos.</p>

                        <div className="bg-gray-50 p-8 rounded-[32px] border-2 border-dashed border-gray-200 mb-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Valor Inicial (€)</p>
                            <input
                                type="number"
                                value={cashInitialAmount}
                                onChange={(e) => setCashInitialAmount(e.target.value)}
                                className="w-full bg-transparent text-5xl font-black text-center text-gray-900 outline-none"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={openCashRegister}
                            className="w-full bg-emerald-600 text-white py-6 rounded-[28px] font-black text-lg shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
                        >
                            INICIAR TURNO
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Modal de Pagamento */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white w-full max-w-xl rounded-[48px] overflow-hidden shadow-2xl"
                    >
                        {orderSuccess ? (
                            <div className="p-16 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8"
                                >
                                    <CheckCircle2 size={64} />
                                </motion.div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2">Venda Realizada!</h3>
                                <p className="text-gray-500 font-bold mb-8">O pedido foi registrado e o caixa atualizado.</p>
                                <div className="font-black text-emerald-600 text-5xl animate-bounce">{total.toFixed(2)}€</div>
                            </div>
                        ) : (
                            <>
                                <div className="p-10 border-b flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-gray-900">Finalizar Venda</h3>
                                    <button onClick={() => setShowPaymentModal(false)} className="p-3 bg-gray-100 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-10 space-y-10">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TOTAL A PAGAR</p>
                                        <p className="text-6xl font-black text-gray-900">{total.toFixed(2)}€</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={clsx(
                                                "p-8 rounded-[36px] flex flex-col items-center gap-4 border-4 transition-all",
                                                paymentMethod === 'cash' ? "border-emerald-500 bg-emerald-50" : "border-gray-50 bg-gray-50 opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <Banknote size={48} className={paymentMethod === 'cash' ? "text-emerald-600" : "text-gray-400"} />
                                            <span className="font-black text-gray-800 uppercase tracking-widest text-xs">DINHEIRO</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={clsx(
                                                "p-8 rounded-[36px] flex flex-col items-center gap-4 border-4 transition-all",
                                                paymentMethod === 'card' ? "border-blue-500 bg-blue-50" : "border-gray-50 bg-gray-50 opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <CreditCard size={48} className={paymentMethod === 'card' ? "text-blue-600" : "text-gray-400"} />
                                            <span className="font-black text-gray-800 uppercase tracking-widest text-xs">CARTÃO</span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={confirmPayment}
                                        disabled={isProcessing}
                                        className="w-full bg-[#1A1A1A] text-white py-6 rounded-[28px] font-black text-xl shadow-2xl hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        {isProcessing ? 'PROCESSANDO...' : 'CONFIRMAR PAGAMENTO'}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Elemento Oculto para Impressão */}
            <div id="p-receipt" className="hidden">
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>EL TRINCHE</h2>
                    <p style={{ margin: '2px 0', fontSize: '10px' }}>CIF: B-12345678</p>
                </div>
                <div style={{ margin: '10px 0', borderBottom: '1px dashed #000', borderTop: '1px dashed #000', padding: '5px 0', fontSize: '10px' }}>
                    Data: {new Date().toLocaleString()}<br />
                    Mesa: {tableName}<br />
                    Atendido por: {currentUser.name || 'Staff'}
                </div>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '5px 0' }}>Q</th>
                            <th style={{ textAlign: 'left', padding: '5px 0' }}>PRODUTO</th>
                            <th style={{ textAlign: 'right', padding: '5px 0' }}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '3px 0' }}>{item.quantity}</td>
                                <td style={{ padding: '3px 0' }}>{item.name}</td>
                                <td style={{ textAlign: 'right', padding: '3px 0' }}>{(item.price * item.quantity).toFixed(2)}€</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                        <span>TOTAL</span>
                        <span>{total.toFixed(2)}€</span>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '10px', borderTop: '1px solid #000', paddingTop: '10px' }}>
                    ¡Gracias por su visita!<br />
                    Obrigado pela preferência!
                </div>
            </div>
        </div>
    );
}
