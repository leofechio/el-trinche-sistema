"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Upload, Save, Image as ImageIcon } from "lucide-react";

export default function AdminPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [uploading, setUploading] = useState<number | null>(null);

    useEffect(() => {
        fetch("/eltrinche/api/products")
            .then(res => res.json())
            .then(setProducts)
            .catch(console.error);
    }, []);

    const handleImageUpload = async (productId: number, file: File) => {
        setUploading(productId);
        const formData = new FormData();
        formData.append("file", file);

        try {
            // 1. Upload File
            const uploadRes = await fetch("/eltrinche/api/upload", {
                method: "POST",
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (uploadData.success) {
                // 2. Update Product with Image URL
                const updateRes = await fetch(`/eltrinche/api/products/${productId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: uploadData.url })
                });

                if (updateRes.ok) {
                    setProducts(prev => prev.map(p =>
                        p.id === productId ? { ...p, image: uploadData.url } : p
                    ));
                    alert("Imagem atualizada com sucesso!");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao fazer upload");
        } finally {
            setUploading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header activeTab="admin" showVolver={true} onVolver={() => router.push('/tables/map')} />

            <main className="p-8 max-w-5xl mx-auto w-full">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Administração de Produtos</h1>

                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 font-black text-xs text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="p-4 font-black text-xs text-gray-400 uppercase tracking-widest">Produto</th>
                                <th className="p-4 font-black text-xs text-gray-400 uppercase tracking-widest">Imagem Atual</th>
                                <th className="p-4 font-black text-xs text-gray-400 uppercase tracking-widest">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-gray-500">{product.id}</td>
                                    <td className="p-4 font-bold text-gray-800">{product.name}</td>
                                    <td className="p-4">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-12 h-12 rounded-lg object-cover border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id={`file-${product.id}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        handleImageUpload(product.id, e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={`file-${product.id}`}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${uploading === product.id
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-[#1A1A1A] text-white hover:bg-emerald-600 hover:shadow-lg"
                                                    }`}
                                            >
                                                {uploading === product.id ? (
                                                    "Enviando..."
                                                ) : (
                                                    <>
                                                        <Upload size={14} /> Upload Foto
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
