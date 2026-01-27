"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { LockKey, User, Notebook, Eye, EyeSlash } from "@phosphor-icons/react";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const fakeEmail = `${username.trim()}@event.com`;

    // Login Function
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: password,
    });

    if (error) {
      setLoading(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Username atau Password salah. Silakan coba lagi.',
        background: '#020617', // Hitam pekat gradient
        color: '#fff',
        confirmButtonColor: '#d946ef', // Pink/Red neon untuk error
        customClass: {
            popup: 'border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
        }
      });
      return;
    }

    // Checking Role First
    if (data.user) {
      // Get daya from table profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Redirect Logic
      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black relative font-poppins px-4">
      <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 rotate-3">
            <Notebook size={32} weight="fill" className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-wide">
            JUDGING SYSTEM
          </h1>

          <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mt-1">
            Redefining Audit Excellence
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Username (ID)
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="text-slate-500" size={20} />
              </div>

              <input
                type="text"
                required
                placeholder="Contoh: ABC"
                className="w-full bg-slate-950/50 border border-slate-700 text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockKey className="text-slate-500" size={20} />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-700 text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none"
              >
                {showPassword ? (
                  <Eye size={22} weight="regular" />
                ) : (
                  <EyeSlash size={22} weight="regular" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 transform active:scale-[0.98]"
          >
            {loading ? "Memproses..." : "Masuk Sistem"}
          </button>
        </form>
      </div>
    </div>
  );
}
