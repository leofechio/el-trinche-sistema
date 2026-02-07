"use client";

import { useState, useEffect } from "react";
import { MoveLeft, Check, Delete, Smartphone, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState(1); // 1: Phone, 2: PIN
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/eltrinche/api/staff")
      .then(res => res.json())
      .then(setStaff)
      .catch(console.error);
  }, []);

  const handleNumberClick = (num: string) => {
    setError("");
    if (step === 1) {
      if (phoneNumber.length < 12) setPhoneNumber((prev) => prev + num);
    } else {
      if (pin.length < 4) setPin((prev) => prev + num);
    }
  };

  const handleClear = () => {
    if (step === 1) {
      setPhoneNumber((prev) => prev.slice(0, -1));
    } else {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  const handleOk = () => {
    if (step === 1) {
      if (phoneNumber.length >= 9) {
        setStep(2);
      } else {
        setError("Número incompleto");
      }
    } else if (step === 2) {
      if (pin.length === 4) {
        setLoading(true);
        const user = staff.find(s => s.phone === phoneNumber && s.pin === pin);
        if (user) {
          // Save user to localStorage
          localStorage.setItem("user", JSON.stringify(user));
          setTimeout(() => {
            window.location.href = "/eltrinche/tables/map";
          }, 800);
        } else {
          setLoading(false);
          setError("PIN o teléfono incorrecto");
          setPin("");
        }
      }
    }
  };

  const KeyButton = ({ value, label, color, onClick, icon }: any) => (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick || (() => handleNumberClick(value))}
      className={clsx(
        "w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex flex-col items-center justify-center text-xl md:text-2xl font-black transition-all shadow-sm",
        color === "pink" ? "border-rose-100 text-rose-500 hover:bg-rose-50" :
          color === "green" ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-emerald-200" :
            "border-gray-100 text-gray-700 hover:bg-gray-50 bg-white"
      )}
    >
      {icon ? icon : (label || value)}
      {value && <span className="text-[9px] text-gray-300 font-bold mt-[-4px] uppercase tracking-tighter">
        {value === "2" ? "ABC" : value === "3" ? "DEF" : value === "4" ? "GHI" : value === "5" ? "JKL" : value === "6" ? "MNO" : value === "7" ? "PQRS" : value === "8" ? "TUV" : value === "9" ? "WXYZ" : ""}
      </span>}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center font-sans text-gray-900">
      <div className="fixed top-0 left-0 w-full h-1.5 bg-emerald-500" />
      
      <div className="max-w-md w-full px-8 py-10 flex flex-col items-center bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-200">ET</div>
           <div>
             <h1 className="text-2xl font-black text-gray-800 tracking-tight">El Trinche</h1>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Terminal POS v2.4</p>
           </div>
        </div>

        <div className="w-full mb-8">
          <h2 className="text-xl font-bold text-gray-800 text-center flex items-center justify-center gap-2 mb-2">
            {step === 1 ? <Smartphone size={20} className="text-emerald-500" /> : <ShieldCheck size={20} className="text-emerald-500" />}
            {step === 1 ? "Acceso de Personal" : "Introducir PIN"}
          </h2>
          <p className="text-gray-400 text-xs text-center">
            {step === 1 ? "Introduce tu número de teléfono registrado" : "Ingresa tu código de seguridad personal"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center"
          >
            <div className={clsx(
              "w-full bg-gray-50 border-2 rounded-3xl px-6 py-6 flex items-center justify-center mb-8 transition-colors min-h-[90px]",
              error ? "border-rose-200 bg-rose-50" : "border-gray-50"
            )}>
              {step === 1 ? (
                <span className="text-3xl font-black tracking-widest text-gray-800 font-mono">
                   {phoneNumber || <span className="text-gray-200">600 000 000</span>}
                </span>
              ) : (
                <div className="flex gap-4">
                   {[...Array(4)].map((_, i) => (
                     <div key={i} className={clsx(
                       "w-4 h-4 rounded-full transition-all duration-300",
                       pin[i] ? "bg-emerald-500 scale-125" : "bg-gray-200"
                     )} />
                   ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-xs font-bold mb-6 uppercase tracking-wider">{error}</motion.p>}

        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <KeyButton key={num} value={num.toString()} />
          ))}
          <KeyButton icon={<Delete size={24} />} color="pink" onClick={handleClear} />
          <KeyButton value="0" />
          <KeyButton
            icon={loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-4 border-white border-t-transparent rounded-full" /> : <Check size={28} />}
            color="green"
            onClick={handleOk}
          />
        </div>

        {step === 2 && !loading && (
          <button
            onClick={() => { setStep(1); setPin(""); }}
            className="text-gray-400 flex items-center gap-2 hover:text-emerald-600 font-bold transition-colors group text-sm"
          >
            <MoveLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Cambiar teléfono
          </button>
        )}
      </div>
      
      <div className="mt-10 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
        Desarrollado para El Trinche © 2026
      </div>
    </div>
  );
}
