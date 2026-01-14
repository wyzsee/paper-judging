"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Trophy } from "@phosphor-icons/react";

export default function PodiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<any[]>([]);

  // Fungsi untuk mengambil data (dipisah biar bisa dipanggil ulang)
  const fetchData = async () => {
    const { data: participants } = await supabase.from("participants")
      .select(`
          id, name, title, display_order,
          scores (originality, applicable, result, strategic, presentation)
        `);

    if (participants) {
      const computed = participants.map((p: any) => {
        const currentScores = p.scores || [];
        let grandTotal = 0;
        currentScores.forEach((s: any) => {
          grandTotal += (s.originality || 0) + (s.applicable || 0) + (s.result || 0) + (s.strategic || 0) + (s.presentation || 0);
        });
        return { ...p, totalScore: grandTotal };
      });

      const sorted = computed.sort((a: any, b: any) => b.totalScore - a.totalScore);
      setWinners(sorted.slice(0, 3)); 
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      // 1. Cek Admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", session.user.id).single();
      if (profile?.role !== "admin") { router.push("/"); return; }

      // 2. Ambil Data Awal
      await fetchData();
    };

    checkUser();

    // 3. === SETUP REALTIME SUBSCRIPTION ===
    // Ini adalah "Telinga" yang mendengarkan perubahan di database
    const channel = supabase
      .channel('realtime-scores') // Nama channel bebas
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'scores' }, // Dengarkan tabel 'scores'
        (payload) => {
          console.log('Ada nilai baru masuk!', payload);
          fetchData(); // JIKA ADA PERUBAHAN, AMBIL ULANG DATA OTOMATIS
        }
      )
      .subscribe();

    // Cleanup: Matikan langganan saat pindah halaman biar ga memori leak
    return () => {
      supabase.removeChannel(channel);
    };

  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <h1 className="text-2xl font-bold animate-pulse">Menyiapkan Panggung...</h1>
    </div>
  );

  const champion = winners[0];      // Juara 1
  const runnerUp = winners[1];      // Juara 2
  const secondRunnerUp = winners[2]; // Juara 3

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black opacity-80 z-0"></div>
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent z-0"></div>

      {/* Header */}
      <div className="relative z-20 p-6 flex justify-between items-center bg-transparent">
        <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
        >
            <ArrowLeft size={20} /> <span className="text-sm font-medium">Kembali</span>
        </button>
        
        <div className="flex flex-col items-center">
            <h1 className="text-2xl md:text-4xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm">
                Hall of Fame
            </h1>
            <p className="text-xs text-yellow-500/80 tracking-widest mt-1 uppercase">Top 3 Participants</p>
        </div>
        
        <div className="w-24"></div>
      </div>

      {/* AREA PODIUM */}
      <div className="flex-grow flex items-end justify-center z-10 px-4 pb-0 relative mt-10 md:mt-0">
        
        {/* === JUARA 2 (KIRI) === */}
        <div className="flex flex-col items-center justify-end w-1/3 max-w-[280px] group order-1">
            {runnerUp ? (
                <>
                    <div className="mb-4 text-center opacity-0 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        <div className="w-16 h-16 mx-auto bg-gray-300 text-gray-800 rounded-full flex items-center justify-center font-bold text-xl mb-2 border-4 border-gray-500 shadow-lg">
                            {runnerUp.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-sm md:text-lg text-gray-200 line-clamp-1">{runnerUp.name}</h3>
                        <p className="text-xs text-gray-400 line-clamp-1 mb-2 px-2">{runnerUp.title}</p>
                        <span className="inline-block px-3 py-0.5 bg-gray-800 border border-gray-600 rounded-full text-xs font-mono text-gray-300 transition-all duration-500 transform hover:scale-110">
                            {runnerUp.totalScore} Pts
                        </span>
                    </div>
                    {/* Batang Podium Silver */}
                    <div className="w-full h-56 md:h-72 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 rounded-t-lg border-t-4 border-gray-200 shadow-[0_0_40px_rgba(156,163,175,0.2)] flex items-start justify-center pt-4 relative transform transition-all hover:brightness-110">
                        <span className="text-6xl font-black text-gray-500/30">2</span>
                    </div>
                </>
            ) : <div className="w-full h-56 md:h-72 bg-gray-800/30 rounded-t-lg"></div>}
        </div>

        {/* === JUARA 1 (TENGAH) === */}
        <div className="flex flex-col items-center justify-end w-1/3 max-w-[320px] group order-2 z-20 -mx-1 md:-mx-4 mb-0"> 
            {champion ? (
                <>
                    <div className="mb-6 text-center opacity-0 animate-slide-up relative" style={{animationDelay: '0.5s'}}>
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-yellow-400 animate-bounce drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">
                            <Crown size={48} weight="fill" />
                        </div>
                        
                        <div className="w-20 h-20 mx-auto bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-bold text-3xl mb-3 border-4 border-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.6)]">
                            {champion.name.charAt(0)}
                        </div>
                        
                        <h3 className="font-bold text-lg md:text-2xl text-yellow-400 line-clamp-2 leading-tight px-2">
                            {champion.name}
                        </h3>
                        <p className="text-xs text-yellow-200/60 line-clamp-1 mb-2 px-2">{champion.title}</p>
                        
                        <span className="inline-block px-5 py-1 bg-gradient-to-r from-yellow-600 to-yellow-800 border border-yellow-500 rounded-full text-lg font-mono font-bold text-white shadow-lg transition-all duration-500 transform hover:scale-110">
                            {champion.totalScore} Pts
                        </span>
                    </div>

                    {/* Batang Podium Gold */}
                    <div className="w-full h-72 md:h-[450px] bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 rounded-t-xl border-t-4 border-yellow-100 shadow-[0_0_60px_rgba(234,179,8,0.4)] flex items-start justify-center pt-6 relative transform transition-all hover:brightness-110">
                        <Trophy size={64} weight="fill" className="text-yellow-900/20 mt-4 absolute top-1/2 -translate-y-1/2" />
                        <span className="text-8xl font-black text-yellow-900/40 relative z-10">1</span>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                </>
            ) : <div className="w-full h-72 md:h-[450px] bg-gray-800/30 rounded-t-xl"></div>}
        </div>

        {/* === JUARA 3 (KANAN) === */}
        <div className="flex flex-col items-center justify-end w-1/3 max-w-[280px] group order-3">
            {secondRunnerUp ? (
                <>
                    <div className="mb-4 text-center opacity-0 animate-slide-up" style={{animationDelay: '0.3s'}}>
                        <div className="w-16 h-16 mx-auto bg-orange-300 text-orange-900 rounded-full flex items-center justify-center font-bold text-xl mb-2 border-4 border-orange-400 shadow-lg">
                            {secondRunnerUp.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-sm md:text-lg text-gray-200 line-clamp-1">{secondRunnerUp.name}</h3>
                        <p className="text-xs text-orange-200/60 line-clamp-1 mb-2 px-2">{secondRunnerUp.title}</p>
                        <span className="inline-block px-3 py-0.5 bg-gray-800 border border-gray-600 rounded-full text-xs font-mono text-gray-300 transition-all duration-500 transform hover:scale-110">
                            {secondRunnerUp.totalScore} Pts
                        </span>
                    </div>
                    {/* Batang Podium Bronze */}
                    <div className="w-full h-44 md:h-56 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-800 rounded-t-lg border-t-4 border-orange-300 shadow-[0_0_40px_rgba(249,115,22,0.2)] flex items-start justify-center pt-4 relative transform transition-all hover:brightness-110">
                        <span className="text-6xl font-black text-orange-900/30">3</span>
                    </div>
                </>
            ) : <div className="w-full h-44 md:h-56 bg-gray-800/30 rounded-t-lg"></div>}
        </div>
      </div>

      <div className="w-full h-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 z-20 border-t border-gray-700"></div>
      
      <style jsx global>{`
        @keyframes slide-up {
            0% { opacity: 0; transform: translateY(50px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation-name: slide-up;
            animation-duration: 0.8s;
            animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}