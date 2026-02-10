"use client";
import React, { useState, useEffect } from "react";

export default function AdminPage() {
    const [auth, setAuth] = useState(false);
    const [u, setU] = useState("");
    const [p, setP] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    const [colaboradores, setColaboradores] = useState<any[]>([]);
    const [printers, setPrinters] = useState<any[]>([]);

    const [showUserModal, setShowUserModal] = useState(false);
    const [showPrinterModal, setShowPrinterModal] = useState(false);

    // User States
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newPin, setNewPin] = useState("");
    const [newCargo, setNewCargo] = useState("Garçom");

    // Printer States
    const [printerName, setPrinterName] = useState("");
    const [printerIp, setPrinterIp] = useState("");

    const USERS_API = "/eltrinche/api/staff";
    const PRINTERS_API = "/eltrinche/api/printers";

    useEffect(() => {
        if (auth) {
            loadData();
        }
    }, [auth]);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadStaff(), loadPrinters()]);
        setLoading(false);
    };

    const loadStaff = async () => {
        try {
            const res = await fetch(USERS_API + '?t=' + Date.now());
            const data = await res.json();
            setColaboradores(data);
        } catch (e) {
            console.error("Erro ao carregar colaboradores:", e);
        }
    };

    const loadPrinters = async () => {
        try {
            const res = await fetch(PRINTERS_API + '?t=' + Date.now());
            const data = await res.json();
            setPrinters(data);
        } catch (e) {
            console.error("Erro ao carregar impressoras:", e);
        }
    };

    const handleLogin = (e: any) => {
        e.preventDefault();
        if (u === "697922008" && p === "8264") {
            setAuth(true);
            setErr("");
        } else {
            setErr("Erro: Credenciais Inválidas");
        }
    };

    const deleteColab = async (id: number) => {
        if (confirm("Deseja realmente remover este usuário?")) {
            await fetch(`${USERS_API}/${id}`, { method: "DELETE" });
            loadStaff();
        }
    };

    const deletePrinter = async (id: any) => {
        if (confirm("Deseja realmente remover esta impressora?")) {
            await fetch(`${PRINTERS_API}/${id}`, { method: "DELETE" });
            loadPrinters();
        }
    };

    const addUser = async (e: any) => {
        e.preventDefault();
        const payload = { name: newName, phone: newPhone, pin: newPin, role: newCargo };
        await fetch(USERS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        setShowUserModal(false);
        setNewName(""); setNewPhone(""); setNewPin("");
        loadStaff();
    };

    const addPrinter = async (e: any) => {
        e.preventDefault();
        const payload = { name: printerName, ip: printerIp, type: "thermal" };
        await fetch(PRINTERS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        setShowPrinterModal(false);
        setPrinterName(""); setPrinterIp("");
        loadPrinters();
    };

    if (!auth) {
        return (
            <div style={{ backgroundColor: "#0f172a", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "system-ui, sans-serif" }}>
                <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#1e293b" }}>ADMIN <span style={{ color: "#ef4444" }}>EL TRINCHE</span></h1>
                        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>Painel de Gestão e Segurança</p>
                    </div>
                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <input type="text" placeholder="ID de Usuário" value={u} onChange={e => setU(e.target.value)} style={{ padding: "14px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "16px", outline: "none" }} />
                        <input type="password" placeholder="Senha" value={p} onChange={e => setP(e.target.value)} style={{ padding: "14px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "16px", outline: "none" }} />
                        {err && <p style={{ color: "#ef4444", fontSize: "12px", fontWeight: "bold", textAlign: "center", margin: 0 }}>{err}</p>}
                        <button type="submit" style={{ backgroundColor: "#ef4444", color: "white", padding: "14px", borderRadius: "12px", border: "none", fontSize: "16px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}>ENTRAR NO PAINEL</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#1e293b" }}>
            <nav style={{ backgroundColor: "#0f172a", padding: "16px 40px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <h2 style={{ margin: 0, color: "#ef4444", fontWeight: "900" }}>EL TRINCHE</h2>
                    <span style={{ backgroundColor: "#1e293b", padding: "4px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: "bold", color: "#94a3b8" }}>CONFIGURAÇÃO</span>
                </div>
                <button onClick={() => setAuth(false)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>SAIR</button>
            </nav>

            <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
                {/* Staff Management Section */}
                <section style={{ marginBottom: "60px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "900" }}>Gestão de Equipe</h3>
                            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>Controle de acesso e funções dos colaboradores</p>
                        </div>
                        <button onClick={() => setShowUserModal(true)} style={{ backgroundColor: "#1e293b", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>+ NOVO COLABORADOR</button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                        {loading ? <p>Carregando...</p> : colaboradores.map((c: any) => (
                            <div key={c.id} style={{ backgroundColor: "white", padding: "24px", borderRadius: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "40px", height: "40px", backgroundColor: "#f1f5f9", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", color: "#475569" }}>{c.name[0]}</div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{c.name} {c.apellidos}</h4>
                                            <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.role}</p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
                                        <span style={{ fontSize: "11px", backgroundColor: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>Tel: {c.phone}</span>
                                        <span style={{ fontSize: "11px", backgroundColor: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>PIN: {c.pin}</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteColab(c.id)} style={{ backgroundColor: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", padding: "8px", borderRadius: "8px" }} onMouseOver={e => e.currentTarget.style.color = "#ef4444"} onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}>
                                    DEL
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Printer Management Section */}
                <section>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "900" }}>Impressoras Térmicas</h3>
                            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>Configuração de rede para recibos e cozinha</p>
                        </div>
                        <button onClick={() => setShowPrinterModal(true)} style={{ backgroundColor: "#1e293b", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>+ NOVA IMPRESSORA</button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                        {printers.map((p: any) => (
                            <div key={p.id} style={{ backgroundColor: "white", padding: "24px", borderRadius: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{p.name}</h4>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>IP: {p.ip}</p>
                                    <div style={{ marginTop: "8px" }}>
                                        <span style={{ fontSize: "10px", backgroundColor: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: "100px", fontWeight: "bold", border: "1px solid #10b98120" }}>ONLINE</span>
                                    </div>
                                </div>
                                <button onClick={() => deletePrinter(p.id)} style={{ backgroundColor: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", padding: "8px", borderRadius: "8px" }} onMouseOver={e => e.currentTarget.style.color = "#ef4444"} onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}>
                                    DEL
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* User Modal */}
            {showUserModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", zIndex: 100 }}>
                    <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "32px", width: "100%", maxWidth: "450px" }}>
                        <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "900" }}>Novo Colaborador</h3>
                        <form onSubmit={addUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <input type="text" placeholder="Nome" value={newName} onChange={e => setNewName(e.target.value)} required style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px" }} />
                            <input type="text" placeholder="Telefone" value={newPhone} onChange={e => setNewPhone(e.target.value)} required style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px" }} />
                            <input type="text" placeholder="PIN de Acesso" value={newPin} onChange={e => setNewPin(e.target.value)} required style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px" }} />
                            <select value={newCargo} onChange={e => setNewCargo(e.target.value)} style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px" }}>
                                <option value="Administrador">Administrador</option>
                                <option value="Garçom">Garçom</option>
                                <option value="Cozinha">Cozinha</option>
                                <option value="Gerente">Gerente</option>
                            </select>
                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button type="button" onClick={() => setShowUserModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "white", fontWeight: "bold", cursor: "pointer" }}>CANCELAR</button>
                                <button type="submit" style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", backgroundColor: "#ef4444", color: "white", fontWeight: "bold", cursor: "pointer" }}>SALVAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Printer Modal */}
            {showPrinterModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", zIndex: 100 }}>
                    <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "32px", width: "100%", maxWidth: "450px" }}>
                        <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "900" }}>Nova Impressora</h3>
                        <form onSubmit={addPrinter} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <input type="text" placeholder="Nome (ex. Barra, Cozinha)" value={printerName} onChange={e => setPrinterName(e.target.value)} required style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px" }} />
                            <input type="text" placeholder="Endereço IP (ex. 192.168.1.100)" value={printerIp} onChange={e => setPrinterIp(e.target.value)} required style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px" }} />
                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button type="button" onClick={() => setShowPrinterModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "white", fontWeight: "bold", cursor: "pointer" }}>CANCELAR</button>
                                <button type="submit" style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", backgroundColor: "#ef4444", color: "white", fontWeight: "bold", cursor: "pointer" }}>SALVAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
