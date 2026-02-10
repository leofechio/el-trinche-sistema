'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
    LayoutDashboard,
    Settings,
    Map as MapIcon,
    Package,
    Users,
    Printer,
    BarChart3,
    ChevronRight,
    Plus,
    Save,
    X,
    Trash2,
    Edit2,
    Clock,
    Globe,
    Building2,
    CreditCard,
    Bell,
    ShieldCheck,
    Image as ImageIcon,
    Check
} from 'lucide-react';
import { io } from 'socket.io-client';

const ALLERGENS = [
    { id: 'gluten', name: 'Gluten', icon: '🌾' },
    { id: 'crustaceos', name: 'Crustáceos', icon: '🦀' },
    { id: 'huevos', name: 'Huevos', icon: '🥚' },
    { id: 'pescado', name: 'Pescado', icon: '🐟' },
    { id: 'cacahuetes', name: 'Cacahuetes', icon: '🥜' },
    { id: 'soja', name: 'Soja', icon: '🫘' },
    { id: 'lacteos', name: 'Lácteos', icon: '🥛' },
    { id: 'frutos_secos', name: 'Frutos secos', icon: '🌰' },
];

export default function ControlPanel() {
    const [activeTab, setActiveTab] = useState('general');
    const [data, setData] = useState<any>({
        orders: [],
        categories: [],
        products: [],
        staff: [],
        printers: [],
        zones: [],
        tables: [],
        settings: {}
    });

    useEffect(() => {
        const socket = io({ path: '/eltrinche/socket.io/' });
        socket.on('initial_data', (receivedData) => setData(receivedData));
        return () => { socket.disconnect(); };
    }, []);

    const handleSave = async (type: string, payload: any) => {
        let endpoint = '';
        let method = payload.id ? 'PUT' : 'POST';

        if (type === 'settings') endpoint = '/eltrinche/api/settings';
        else if (type === 'product') endpoint = '/eltrinche/api/products' + (payload.id ? `/${payload.id}` : '');
        else if (type === 'category') endpoint = '/eltrinche/api/categories' + (payload.id ? `/${payload.id}` : '');
        else if (type === 'staff') endpoint = '/eltrinche/api/staff' + (payload.id ? `/${payload.id}` : '');
        else if (type === 'table') endpoint = '/eltrinche/api/tables' + (payload.id ? `/${payload.id}` : '');
        else if (type === 'zone') endpoint = '/eltrinche/api/zones' + (payload.id ? `/${payload.id}` : '');

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                console.log('Saved successfully');
            }
        } catch (err) {
            console.error('Save failed', err);
        }
    };

    const handleDelete = async (type: string, id: any) => {
        if (!confirm('Deseja realmente excluir?')) return;
        let endpoint = '';
        if (type === 'table') endpoint = `/eltrinche/api/tables/${id}`;
        else if (type === 'zone') endpoint = `/eltrinche/api/zones/${id}`;

        try {
            const res = await fetch(endpoint, { method: 'DELETE' });
            if (res.ok) console.log('Deleted successfully');
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralDashboard data={data} setActiveTab={setActiveTab} />;
            case 'restaurante': return <RestaurantView settings={data.settings} onSave={(s: any) => handleSave('settings', s)} />;
            case 'operativas': return <OperativasView settings={data.settings} onSave={(s: any) => handleSave('settings', s)} />;
            case 'mapa': return <MapEditor zones={data.zones} tables={data.tables} onSave={handleSave} onDelete={handleDelete} />;
            case 'products': return <ProductsView categories={data.categories} products={data.products} onSave={(type: string, p: any) => handleSave(type, p)} />;
            case 'categories': return <CategoriesView categories={data.categories} onSave={(c: any) => handleSave('category', c)} onDelete={(id: any) => handleDelete('category', id)} />;
            case 'staff': return <StaffView staff={data.staff} onSave={(s: any) => handleSave('staff', s)} />;
            case 'devices': return <DevicesView printers={data.printers} onSave={(p: any) => handleSave('printer', p)} />;
            case 'arqueos': return <ArqueosView data={data} />;
            default: return <GeneralDashboard data={data} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] pb-20">
            <Header showControl={true} activeTab="control" />
            <div className="max-w-7xl mx-auto px-6 mt-8 flex gap-8">
                <div className="w-72 flex-shrink-0">
                    <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50 flex flex-col gap-2">
                        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Administración</p>
                        <SidebarItem icon={<LayoutDashboard size={20} />} label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                        <SidebarItem icon={<Building2 size={20} />} label="Restaurante" active={activeTab === 'restaurante'} onClick={() => setActiveTab('restaurante')} />
                        <SidebarItem icon={<Settings size={20} />} label="Operativas" active={activeTab === 'operativas'} onClick={() => setActiveTab('operativas')} />
                        <SidebarItem icon={<MapIcon size={20} />} label="Mapa de Mesas" active={activeTab === 'mapa'} onClick={() => setActiveTab('mapa')} />
                        <SidebarItem icon={<Package size={20} />} label="Gestión de Carta" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                        <SidebarItem icon={<ClipboardList size={20} />} label="Categorías" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
                        <SidebarItem icon={<Users size={20} />} label="Personal" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />
                        <SidebarItem icon={<Printer size={20} />} label="Dispositivos" active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
                        <SidebarItem icon={<BarChart3 size={20} />} label="Arqueos" active={activeTab === 'arqueos'} onClick={() => setActiveTab('arqueos')} />
                    </div>
                </div>

                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            {icon}
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </button>
    );
}

function GeneralDashboard({ data, setActiveTab }: any) {
    return (
        <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Actividad en Sala</h3>
                    <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Tiempo Real</div>
                </div>
                <div className="flex gap-8">
                    <div className="flex-1 bg-[#1A1A1A] p-8 rounded-[36px] text-white">
                        <div className="text-6xl font-black mb-2">{data.orders.filter((o: any) => o.status !== 'cobrado').length}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cuentas Abiertas</div>
                    </div>
                    <div className="flex-1 bg-gray-50 p-8 rounded-[36px]">
                        <div className="text-6xl font-black mb-2 text-gray-800">0</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cerradas Hoy</div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Estado de Caja</h3>
                    <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Activa</div>
                </div>
                <div className="bg-gray-50 p-8 rounded-[36px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Recaudación Total</p>
                    <div className="text-6xl font-black text-center text-gray-900 mb-8">{data.orders.reduce((acc: any, o: any) => acc + (o.total || 0), 0).toFixed(2)}€</div>
                    <div className="flex gap-4">
                        <button className="flex-1 bg-white py-4 rounded-2xl font-bold text-sm border-2 border-gray-100 hover:border-gray-200 transition-all" onClick={() => setActiveTab('arqueos')}>Ver Historial</button>
                        <button
                            className="flex-1 bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold text-sm hover:shadow-lg transition-all shadow-[#1A1A1A]/20"
                            onClick={async () => {
                                const finalAmount = prompt('Informe o valor final em caixa:');
                                if (finalAmount) {
                                    const res = await fetch('/eltrinche/api/cash-registers/close', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ finalAmount })
                                    });
                                    if (res.ok) alert('Caixa fechado com sucesso!');
                                }
                            }}
                        >
                            Cierre de Caja
                        </button>
                    </div>
                </div>
            </div>

            <SmallCard title="Carta" icon={<Package />} onClick={() => setActiveTab('products')} />
            <SmallCard title="Categorías" icon={<ClipboardList />} onClick={() => setActiveTab('categories')} />
            <SmallCard title="Personal" icon={<Users />} onClick={() => setActiveTab('staff')} />
            <SmallCard title="Impresoras" icon={<Printer />} onClick={() => setActiveTab('devices')} />
            <SmallCard title="Métricas" icon={<BarChart3 />} onClick={() => setActiveTab('arqueos')} />
        </div>
    );
}

function OperativasView({ settings, onSave }: any) {
    const opts = settings.operativas || {};
    const toggle = (key: string) => {
        onSave({ ...settings, operativas: { ...opts, [key]: !opts[key] } });
    };

    return (
        <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
            <h3 className="text-xl font-black mb-8 text-gray-900 flex items-center gap-3">
                <Settings className="text-emerald-500" /> Configuración Operativa
            </h3>
            <div className="space-y-4">
                <ToggleItem label="Cobrar al comandar" description="Los pedidos se cobran antes de ser preparados" active={opts.payBefore} onClick={() => toggle('payBefore')} />
                <ToggleItem label="Modo Quiosco" description="Interfaz optimizada para autoservicio" active={opts.kioskMode} onClick={() => toggle('kioskMode')} />
                <ToggleItem label="Envío a Domicilio" description="Habilitar gestión de deliveries" active={opts.homeDelivery} onClick={() => toggle('homeDelivery')} />
                <ToggleItem label="Aceptar automáticamente" description="Los pedidos de la web se aceptan sin intervención" active={opts.autoAccept} onClick={() => toggle('autoAccept')} />
                <ToggleItem label="Propina (Tips)" description="Habilitar opción de propina en el pago" active={opts.tips} onClick={() => toggle('tips')} />
                <ToggleItem label="Descuentos" description="Permitir aplicar descuentos manuales" active={opts.discounts} onClick={() => toggle('discounts')} />
            </div>
        </div>
    );
}

function ToggleItem({ label, description, active, onClick }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-gray-100/50 transition-all">
            <div>
                <p className="font-black text-gray-800 tracking-tight">{label}</p>
                <p className="text-xs text-gray-400 font-medium">{description}</p>
            </div>
            <button
                onClick={onClick}
                className={`w-14 h-8 rounded-full relative transition-all ${active ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${active ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    );
}

function MapEditor({ zones, tables, onSave, onDelete }: any) {
    const addZone = () => {
        const name = prompt('Nome da nova zona (ex: Terraza, Salón):');
        if (name) onSave('zone', { name });
    };

    const addTable = (zoneId: number) => {
        const number = prompt('Número da mesa:');
        if (number) onSave('table', { number, zoneId });
    };

    return (
        <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
            <div className="flex items-center justify-between mb-8 text-gray-900">
                <h3 className="text-xl font-black flex items-center gap-3"><MapIcon className="text-indigo-500" /> Editor de Sala</h3>
                <button
                    onClick={addZone}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
                >
                    + Nova Zona
                </button>
            </div>

            <div className="space-y-12">
                {zones.length === 0 && (
                    <div className="text-center py-10 text-gray-400 font-bold border-2 border-dashed rounded-[36px]">
                        Nenhuma zona configurada.
                    </div>
                )}
                {zones.map((z: any) => (
                    <div key={z.id} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-black text-gray-800 uppercase tracking-widest">{z.name}</h4>
                            <button
                                onClick={() => onDelete('zone', z.id)}
                                className="text-xs text-rose-500 font-bold hover:underline"
                            >
                                Excluir Zona
                            </button>
                        </div>

                        <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
                            {tables.filter((t: any) => t.zoneId === z.id).map((t: any) => (
                                <div key={t.id} className="relative group">
                                    <div className="bg-emerald-500 w-full aspect-square rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform transition-all group-hover:scale-110">
                                        {t.number}
                                    </div>
                                    <button
                                        onClick={() => onDelete('table', t.id)}
                                        className="absolute -top-2 -right-2 bg-white text-rose-500 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => addTable(z.id)}
                                className="border-2 border-dashed border-gray-200 aspect-square rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition-all gap-2"
                            >
                                <Plus size={24} />
                                <span className="text-[10px] font-black uppercase">Mesa</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProductsView({ categories, products, onSave }: any) {
    const [editingProduct, setEditingProduct] = useState<any>(null);

    return (
        <div className="space-y-8">
            <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Categorías</h3>
                    <button
                        onClick={() => {
                            const name = prompt('Nome da categoria:');
                            if (name) onSave('category', { name, color: 'bg-emerald-600' });
                        }}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                    >
                        <Plus />
                    </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {categories.map((c: any) => (
                        <div key={c.id} className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black text-white cursor-pointer shadow-lg hover:scale-105 transition-all ${c.color}`}>
                            {c.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Lista de Productos</h3>
                    <button
                        onClick={() => setEditingProduct({ name: '', price: 0, category: categories[0]?.id, allergens: [], visible: true, available: true, interactive: true })}
                        className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:shadow-xl transition-all"
                    >
                        <Plus size={18} /> Nuevo Producto
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {products.map((p: any) => (
                        <div
                            key={p.id}
                            onClick={() => setEditingProduct(p)}
                            className="bg-gray-50 p-6 rounded-[32px] hover:bg-white hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-emerald-100"
                        >
                            <div className="w-full aspect-square bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400"><ImageIcon size={32} /></div>
                                {p.topProduct && <div className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg shadow-lg"><ShieldCheck size={14} /></div>}
                            </div>
                            <h4 className="font-black text-gray-800 mb-1">{p.name}</h4>
                            <p className="text-emerald-600 font-black mb-4">{p.price.toFixed(2)}€</p>
                            <div className="flex gap-2">
                                {p.visible && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                {p.available && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                {p.interactive && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editingProduct && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    onClose={() => setEditingProduct(null)}
                    onSave={(p: any) => { onSave('product', p); setEditingProduct(null); }}
                />
            )}
        </div>
    );
}

function ProductModal({ product, categories, onClose, onSave }: any) {
    const [form, setForm] = useState(product);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden flex">
                <div className="flex-1 p-10 space-y-6 overflow-y-auto max-h-[80vh]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-gray-900">Editar Producto</h2>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"><X /></button>
                    </div>

                    <div className="space-y-4">
                        <Input label="Nombre" value={form.name} onChange={(v: any) => setForm({ ...form, name: v })} />
                        <Input label="Nombre Interno (Cocina)" value={form.internalName} onChange={(v: any) => setForm({ ...form, internalName: v })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Precio (€)" type="number" value={form.price} onChange={(v: any) => setForm({ ...form, price: parseFloat(v) })} />
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Categoría</label>
                                <select
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500 transition-all appearance-none"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                >
                                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Estados</label>
                            <div className="flex gap-4">
                                <ToggleSwitch label="Visible" active={form.visible} onClick={() => setForm({ ...form, visible: !form.visible })} />
                                <ToggleSwitch label="Disponible" active={form.available} onClick={() => setForm({ ...form, available: !form.available })} />
                                <ToggleSwitch label="Interactivo" active={form.interactive} onClick={() => setForm({ ...form, interactive: !form.interactive })} />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Alérgenos</label>
                            <div className="grid grid-cols-4 gap-3">
                                {ALLERGENS.map(a => (
                                    <div
                                        key={a.id}
                                        onClick={() => {
                                            const newAllergens = form.allergens.includes(a.id)
                                                ? form.allergens.filter((i: any) => i !== a.id)
                                                : [...form.allergens, a.id];
                                            setForm({ ...form, allergens: newAllergens });
                                        }}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2 ${form.allergens.includes(a.id) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 grayscale hover:grayscale-0 bg-gray-50 text-gray-400'}`}
                                    >
                                        <span className="text-xl">{a.icon}</span>
                                        <span className="text-[10px] font-black uppercase">{a.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-8">
                        <button onClick={onClose} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-all">Cancelar</button>
                        <button onClick={() => onSave(form)} className="flex-1 py-4 bg-emerald-600 shadow-xl shadow-emerald-100 rounded-2xl font-black text-white hover:scale-105 transition-all">Guardar Cambios</button>
                    </div>
                </div>

                <div className="w-80 bg-gray-50 p-10 flex flex-col items-center justify-center text-center border-l-2 border-gray-100">
                    <div className="bg-white p-8 rounded-[40px] shadow-xl mb-6 w-full">
                        <div className="w-full aspect-square bg-gray-100 rounded-3xl mb-6 flex items-center justify-center text-gray-300"><ImageIcon size={64} /></div>
                        <h4 className="text-xl font-black text-gray-900 mb-2">{form.name || 'Sin nombre'}</h4>
                        <p className="text-emerald-500 font-black text-2xl">{(form.price || 0).toFixed(2)}€</p>
                    </div>
                    <button className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Subir Imagen</button>
                </div>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, type = 'text' }: any) {
    return (
        <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{label}</label>
            <input
                type={type}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function ToggleSwitch({ label, active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${active ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 bg-gray-50 text-gray-400 grayscale'}`}
        >
            {active && <Check size={14} />}
            <span className="text-[10px] font-black uppercase">{label}</span>
        </div>
    );
}

function RestaurantView({ settings, onSave }: any) {
    const [form, setForm] = useState(settings.restaurant || {});

    return (
        <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3"><Building2 className="text-rose-500" /> Información del Local</h3>
                <button onClick={() => onSave({ ...settings, restaurant: form })} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-lg shadow-emerald-100 hover:scale-105 transition-all">Guardar Perfil</button>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Input label="Nombre del Restaurante" value={form.name} onChange={(v: any) => setForm({ ...form, name: v })} />
                    <Input label="Teléfono de Contacto" value={form.phone} onChange={(v: any) => setForm({ ...form, phone: v })} />
                    <Input label="Dirección" value={form.address} onChange={(v: any) => setForm({ ...form, address: v })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Código Postal" value={form.cp} onChange={(v: any) => setForm({ ...form, cp: v })} />
                        <Input label="Ciudad" value={form.city} onChange={(v: any) => setForm({ ...form, city: v })} />
                    </div>
                </div>
                <div className="bg-gray-50 p-8 rounded-[40px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                    <div className="w-32 h-32 bg-white rounded-3xl shadow-sm flex items-center justify-center text-gray-300 mb-4"><ImageIcon size={48} /></div>
                    <p className="font-bold text-gray-400 text-sm">Logo Principal</p>
                    <button className="mt-4 text-[10px] font-black text-rose-500 uppercase tracking-widest">Cambiar Imagen</button>
                </div>
            </div>
        </div>
    );
}

function StaffView({ staff, onSave }: any) {
    const [editingStaff, setEditingStaff] = useState<any>(null);

    return (
        <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black flex items-center gap-3"><Users className="text-emerald-500" /> Equipo de Trabalho</h3>
                <button
                    onClick={() => setEditingStaff({ name: '', phone: '', pin: '', role: 'Garçom', active: true })}
                    className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:shadow-xl transition-all"
                >
                    <Plus size={18} /> Novo Empleado
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {staff.map((s: any) => (
                    <div key={s.id} onClick={() => setEditingStaff(s)} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black text-gray-300 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all shadow-sm">{s.name[0]}</div>
                            <div>
                                <h4 className="font-black text-gray-800 tracking-tight">{s.name} {s.surnames}</h4>
                                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{s.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono</p>
                                <p className="font-bold text-gray-700">+34 {s.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PIN</p>
                                <p className="font-bold text-gray-700">****</p>
                            </div>
                            <ChevronRight className="text-gray-200 group-hover:text-emerald-500 transition-all" />
                        </div>
                    </div>
                ))}
            </div>

            {editingStaff && (
                <StaffModal
                    employee={editingStaff}
                    onClose={() => setEditingStaff(null)}
                    onSave={(s: any) => { onSave(s); setEditingStaff(null); }}
                />
            )}
        </div>
    );
}

function StaffModal({ employee, onClose, onSave }: any) {
    const [form, setForm] = useState(employee);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden p-10 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-gray-900">Editar Empleado</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"><X /></button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Nombre" value={form.name} onChange={(v: any) => setForm({ ...form, name: v })} />
                    <Input label="Apellidos" value={form.surnames} onChange={(v: any) => setForm({ ...form, surnames: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Teléfono" value={form.phone} onChange={(v: any) => setForm({ ...form, phone: v })} />
                    <Input label="Código PIN" value={form.pin} onChange={(v: any) => setForm({ ...form, pin: v })} />
                </div>
                <Input label="DNI / NIF" value={form.dni} onChange={(v: any) => setForm({ ...form, dni: v })} />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tipo</label>
                        <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                            <option value="Camarero">Camarero</option>
                            <option value="Cocinero">Cocinero</option>
                            <option value="Repartidor">Repartidor</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Rol</label>
                        <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="Administrador">Administrador</option>
                            <option value="Camarero">Camarero</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 pt-8">
                    <button onClick={onClose} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-all">Cancelar</button>
                    <button onClick={() => onSave(form)} className="flex-1 py-4 bg-emerald-600 shadow-xl shadow-emerald-100 rounded-2xl font-black text-white">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
}

function SmallCard({ title, icon, onClick }: any) {
    return (
        <div onClick={onClick} className="bg-white p-7 rounded-[32px] shadow-sm border-2 border-transparent hover:border-emerald-200 transition-all cursor-pointer group hover:bg-[#F8FDF9]">
            <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all transform group-hover:rotate-12 group-hover:scale-110 shadow-sm">{icon}</div>
                <ChevronRight size={18} className="text-gray-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">{title}</h4>
        </div>
    );
}
function DevicesView({ printers, onSave }: any) {
    const handlePrintTest = async (printer: any) => {
        try {
            const res = await fetch('/eltrinche/api/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ printerIp: printer.ip, content: "TEST PAGE" })
            });
            alert(res.ok ? "Prueba de impresión enviada" : "Error en la prueba");
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        }
    };

    return (
        <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
            <h3 className="text-xl font-black mb-8 text-gray-900 flex items-center gap-3"><Printer className="text-emerald-500" /> Dispositivos e Impresoras</h3>
            <div className="space-y-4">
                {printers.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white rounded-2xl text-gray-400 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all shadow-sm"><Printer size={24} /></div>
                            <div>
                                <h4 className="font-black text-gray-800">{p.name}</h4>
                                <p className="text-xs text-gray-400 font-bold">{p.ip} ({p.type})</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handlePrintTest(p)} className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all">Probar</button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-300 transition-all">Configurar</button>
                        </div>
                    </div>
                ))}
                <div
                    onClick={() => {
                        const name = prompt('Nome da impressora:');
                        const ip = prompt('IP da impressora:');
                        if (name && ip) onSave('printer', { name, ip, type: 'thermal' });
                    }}
                    className="p-6 border-2 border-dashed border-gray-200 rounded-3xl text-center text-gray-400 cursor-pointer hover:border-emerald-500 hover:text-emerald-500 transition-all"
                >
                    <Plus className="mx-auto mb-2" />
                    <span className="font-bold text-sm">Añadir Nueva Impresora</span>
                </div>
            </div>
        </div>
    );
}

function ArqueosView({ data }: any) {
    return (
        <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
            <h3 className="text-xl font-black mb-8 text-gray-900 flex items-center gap-3"><BarChart3 className="text-emerald-500" /> Arqueos y Métricas</h3>
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-emerald-50 p-6 rounded-[32px]">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Ventas Hoy</p>
                    <p className="text-3xl font-black text-gray-900">{data.orders.reduce((acc: any, o: any) => acc + (o.total || 0), 0).toFixed(2)}€</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-[32px]">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Pedidos</p>
                    <p className="text-3xl font-black text-gray-900">{data.orders.length}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-[32px]">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Ticket Medio</p>
                    <p className="text-3xl font-black text-gray-900">{data.orders.length ? (data.orders.reduce((acc: any, o: any) => acc + (o.total || 0), 0) / data.orders.length).toFixed(2) : "0.00"}€</p>
                </div>
            </div>
            <div className="h-64 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-300 font-bold border-2 border-dashed border-gray-200">
                Gráfico de Ventas en Tiempo Real (Demo)
            </div>
        </div>
    );
}



function CategoriesView({ categories, onSave, onDelete }: any) {
    if (!categories) return <div className="p-10 text-center text-gray-400 font-bold">Cargando categorías...</div>;
    return (
        <div className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ClipboardList size={24} /></div>
                    Categorías
                </h3>
                <button
                    onClick={() => {
                        const name = prompt('Nombre de la categoría:');
                        if (name) onSave({ name, color: 'bg-emerald-600' });
                    }}
                    className="bg-[#1A1A1A] text-white px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={18} /> Nueva Categoría
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-300 border-2 border-dashed border-gray-100 rounded-[32px] font-bold">
                        No hay categorías creadas
                    </div>
                ) : categories.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] group hover:bg-white hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-100">
                        <div className="flex items-center gap-4">
                            <div className={clsx("w-3 h-12 rounded-full", c.color || "bg-emerald-500")} />
                            <div>
                                <h4 className="font-black text-gray-800">{c.name}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">ID: {c.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); if (confirm('¿Desea eliminar esta categoría?')) onDelete(c.id); }}
                            className="p-4 bg-white text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
