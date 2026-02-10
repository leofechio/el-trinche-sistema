"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, User, Lock } from "lucide-react";

export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/eltrinche/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, pin })
            });

            const data = await res.json();

            if (data.success) {
                // Save user data to localStorage
                localStorage.setItem("eltrinche_user", JSON.stringify(data.user));

                // Redirect to tables page
                router.push("/tables/map");
            } else {
                setError(data.error || "Erro ao fazer login");
            }
        } catch (err) {
            setError("Erro de conexão com o servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-emerald-100">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-2xl mb-4">
                            <span className="text-3xl font-black text-white">ET</span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">EL TRINCHE</h1>
                        <p className="text-gray-500 font-medium">Sistema POS - Faça login para continuar</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <User className="inline w-4 h-4 mr-2" />
                                Telefone
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="684165307"
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Lock className="inline w-4 h-4 mr-2" />
                                PIN
                            </label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="••••"
                                required
                                maxLength={4}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium"
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                "Entrando..."
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    ENTRAR NO SISTEMA
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 mb-2">CREDENCIAIS DE TESTE:</p>
                        <div className="text-xs space-y-1">
                            <p className="font-mono"><span className="font-bold">Admin:</span> 684165307 / 1111</p>
                            <p className="font-mono"><span className="font-bold">Garçom:</span> 600500400 / 2222</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
