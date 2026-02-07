"use client";
import React, { useState, useEffect } from "react";

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newCargo, setNewCargo] = useState("Camarero");

  const API_URL = "/eltrinche/api/staff";

  useEffect(() => {
    if (auth) {
      loadStaff();
    }
  }, [auth]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL + '?t=' + Date.now());
      const data = await res.json();
      setColaboradores(data);
    } catch (e) {
      console.error("Erro ao carregar colaboradores:", e);
    } finally {
      setLoading(false);
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
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      loadStaff();
    }
  };

  const addColab = async (e: any) => {
    e.preventDefault();
    if (newName.trim() && newPin.trim()) {
      const payload = {
        name: newName,
        phone: newPhone,
        pin: newPin,
        role: newCargo
      };
      
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setNewName("");
      setNewPhone("");
      setNewPin("");
      setShowModal(false);
      loadStaff();
    }
  };

  if (!auth) {
    return (
      <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", width: "380px", border: "1px solid #334155" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ color: "#ef4444", fontSize: "32px", fontWeight: "900", letterSpacing: "2px", margin: "0" }}>EL TRINCHE</h1>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px", textTransform: "uppercase", fontWeight: "bold" }}>Controle de Acesso</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>IDENTIFICAÇÃO ADMIN</label>
              <input 
                placeholder="ID" 
                value={u} 
                onChange={e => setU(e.target.value)} 
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "white", outline: "none" }} 
              />
            </div>
            <div>
              <label style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>SENHA MESTRA</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={p} 
                onChange={e => setP(e.target.value)} 
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "white", outline: "none" }} 
              />
            </div>
            {err && <div style={{ backgroundColor: "#450a0a", color: "#fca5a5", padding: "10px", borderRadius: "8px", fontSize: "12px", textAlign: "center", border: "1px solid #7f1d1d" }}>{err}</div>}
            <button type="submit" style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#ef4444", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "8px", fontSize: "14px" }}>AUTENTICAR</button>
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
          <span style={{ backgroundColor: "#1e293b", padding: "4px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: "bold", color: "#94a3b8" }}>PAINEL DE CONFIGURAÇÃO</span>
        </div>
        <button onClick={() => setAuth(false)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>SAIR</button>
      </nav>
      
      <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div style={{ padding: "20px 30px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Gestão de Acessos (QPOS)</h3>
            <button 
              onClick={() => setShowModal(true)}
              style={{ backgroundColor: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
            >
              + NOVO USUÁRIO QPOS
            </button>
          </div>
          
          <div style={{ padding: "0 30px" }}>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Carregando dados...</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "20px 10px", color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Funcionário</th>
                    <th style={{ padding: "20px 10px", color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Telefone</th>
                    <th style={{ padding: "20px 10px", color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Senha (PIN)</th>
                    <th style={{ padding: "20px 10px", color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Cargo</th>
                    <th style={{ padding: "20px 10px", color: "#64748b", fontSize: "11px", textTransform: "uppercase", textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradores.map(c => (
                    <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px 10px", fontWeight: "600" }}>{c.name}</td>
                      <td style={{ padding: "16px 10px", color: "#64748b", fontSize: "14px" }}>{c.phone}</td>
                      <td style={{ padding: "16px 10px" }}>
                        <code style={{ backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", letterSpacing: "2px" }}>{c.pin}</code>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>{c.role}</span>
                      </td>
                      <td style={{ padding: "16px 10px", textAlign: "right" }}>
                        <button 
                          onClick={() => deleteColab(c.id)}
                          style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", width: "420px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginTop: 0, marginBottom: "24px", color: "#0f172a" }}>Configurar Novo Acesso</h3>
            <form onSubmit={addColab} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", display: "block", marginBottom: "6px" }}>NOME DO FUNCIONÁRIO</label>
                <input 
                  autoFocus
                  placeholder="Nome Completo" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none" }} 
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", display: "block", marginBottom: "6px" }}>TELEFONE</label>
                  <input 
                    placeholder="(99) 99999-9999" 
                    value={newPhone} 
                    onChange={e => setNewPhone(e.target.value)} 
                    style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none" }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", display: "block", marginBottom: "6px" }}>SENHA (PIN 4 DÍGITOS)</label>
                  <input 
                    type="text"
                    maxLength={4}
                    placeholder="1234" 
                    value={newPin} 
                    onChange={e => setNewPin(e.target.value)} 
                    style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none", fontWeight: "bold", textAlign: "center", letterSpacing: "4px" }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", display: "block", marginBottom: "6px" }}>CARGO / PERMISSÃO</label>
                <select 
                  value={newCargo} 
                  onChange={e => setNewCargo(e.target.value)} 
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "white", outline: "none" }}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Camarero">Garçom (Camarero)</option>
                  <option value="Cozinha">Cozinha</option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "white", cursor: "pointer", fontWeight: "bold" }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#ef4444", color: "white", fontWeight: "bold", cursor: "pointer" }}
                >
                  SALVAR ACESSO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
