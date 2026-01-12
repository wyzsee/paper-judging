"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, LockKey, Envelope } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Login Function
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg("Login Gagal: " + error.message);
      setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-4xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-2">
          Welcome! 👋
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Silahkan masuk untuk melakukan penilaian
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <div className="relative mt-4">
              {/* Icon Amplop di Kiri */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Envelope size={20} className="text-gray-400" />
              </div>
              
              <input
                type="email"
                required
                placeholder="email@example.com"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="relative mt-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockKey size={20} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="********"
                className="mt-1 block pl-10 w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-md font-medium text-white bg-linear-to-br from-sky-500 to-indigo-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
