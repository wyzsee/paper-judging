"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Crown, CaretLeft, Trophy } from "@phosphor-icons/react";

export default function PodiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil Data
      const { data: participants, error } = await supabase.from("participants")
        .select(`
            id, title, moderator, presenters, display_order, image_url,
            scores (originality, applicable, benefit, collaborative, presentation)
          `);
      
      if (error) console.error("Error fetching podium data:", error);

      if (participants) {
        // 2. Hitung Total Skor
        const computed = participants.map((p: any) => {
          const currentScores = p.scores || [];
          let grandTotal = 0;
          currentScores.forEach((s: any) => {
            grandTotal += 
                (s.originality || 0) + 
                (s.applicable || 0) + 
                (s.benefit || 0) +        
                (s.collaborative || 0) +  
                (s.presentation || 0);
          });

          return { ...p, totalScore: grandTotal };
        });

        // 3. Urutkan & Ambil Top 3
        const sorted = computed.sort((a: any, b: any) => b.totalScore - a.totalScore);
        setWinners(sorted.slice(0, 3));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Helper Avatar
  const getAvatar = (item: any) => {
      if (item.image_url && item.image_url !== "") {
        return (
            <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-110"
                style={{ backgroundImage: `url('${item.image_url}')` }} 
            ></div>
        );
      } else {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                <Trophy size={32} weight="duotone" />
            </div>
        );
      }
  }

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] text-amber-500 font-poppins">
        <div className="flex flex-col items-center gap-4">
            <Trophy size={48} className="animate-bounce" />
            <p className="tracking-widest uppercase text-xs animate-pulse">Calculating Champions...</p>
        </div>
    </div>
  );

  const champion = winners[0];
  const runnerUp = winners[1];
  const thirdPlace = winners[2];

  return (
    // FIX: Gunakan h-screen dan overflow-hidden agar tidak ada scroll
    <div className="h-screen w-full font-poppins relative text-white overflow-hidden flex flex-col bg-[#0f172a]">
      
      {/* Background Gelap Elegan */}
      <div className="absolute inset-0 z-0 bg-[#0f172a]">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar (Header) - Z-Index tinggi agar di atas crown */}
      <div className="relative z-30 px-6 py-4 flex justify-between items-start shrink-0">
        <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/30"
        >
            <CaretLeft size={16} weight="bold" /> KEMBALI
        </button>
        
        <div className="text-center absolute left-1/2 transform -translate-x-1/2 top-4">
            <h1 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] tracking-widest uppercase font-poppins">
                HALL OF FAME
            </h1>
        </div>
        
        <div className="w-24"></div> 
      </div>

      {/* Main Podium Area - Flex-1 agar mengisi sisa ruang, items-end agar nempel bawah */}
      <main className="relative z-10 flex-1 flex items-end justify-center pb-0 px-4 w-full h-full">
        
        <div className="flex items-end justify-center gap-2 md:gap-4 w-full max-w-6xl h-full pb-0">
            
            {/* === JUARA 2 (KIRI) === */}
            {runnerUp && (
                <div className="order-1 flex flex-col items-center justify-end w-[30%] h-full group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                     {/* Info Card */}
                     <div className="mb-2 md:mb-4 flex flex-col items-center w-full">
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-[3px] border-slate-400 overflow-hidden shadow-[0_0_25px_rgba(148,163,184,0.4)] mb-2 bg-slate-800 relative z-10">
                             {getAvatar(runnerUp)}
                        </div>
                        <h3 className="font-bold text-slate-200 text-xs md:text-base leading-tight text-center px-1 line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                            {runnerUp.title}
                        </h3>
                        <p className="hidden md:block text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-extrabold">Runner Up</p>
                        <div className="mt-1 md:mt-2 bg-slate-800/80 px-3 md:px-5 py-0.5 md:py-1 rounded-full border border-slate-600 inline-block font-mono text-sm md:text-lg font-bold text-slate-300">
                            {runnerUp.totalScore}
                        </div>
                     </div>
                     
                     {/* Podium Box - Tinggi Responsive (35% layar) */}
                     <div className="w-full h-[35vh] bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 rounded-t-xl border-t-[3px] border-slate-500 shadow-[0_0_60px_rgba(100,116,139,0.2)] flex items-end justify-center pb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                        <div className="text-6xl md:text-8xl font-black text-black/20 absolute bottom-0 select-none">2</div>
                     </div>
                </div>
            )}

            {/* === JUARA 1 (TENGAH - TERTINGGI) === */}
            {champion && (
                <div className="order-2 flex flex-col items-center justify-end w-[36%] h-full z-20 group animate-fade-in-up">
                     
                     {/* Info Card + Crown */}
                     <div className="mb-2 md:mb-4 flex flex-col items-center w-full relative">
                        {/* Crown tidak absolut lagi, tapi block agar tidak nabrak */}
                        <Crown size={40} weight="fill" className="text-yellow-400 mb-1 md:mb-2 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-bounce md:w-[56px] md:h-[56px]" />
                        
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-[4px] border-yellow-400 overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.6)] mb-2 md:mb-3 bg-slate-800 relative z-10">
                             {getAvatar(champion)}
                        </div>

                        <h3 className="font-extrabold text-white text-sm md:text-xl leading-tight text-center px-1 text-shadow-glow line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                            {champion.title}
                        </h3>

                        <p className="hidden md:block text-yellow-400 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Champion</p>
                        <div className="mt-1 md:mt-3 bg-gradient-to-r from-yellow-900/50 to-amber-900/50 px-4 md:px-8 py-1 md:py-2 rounded-full border border-yellow-500 inline-block font-mono text-xl md:text-3xl font-black text-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                            {champion.totalScore}
                        </div>
                     </div>
                     
                     {/* Podium Box - Tinggi Responsive (50% layar) */}
                     <div className="w-full h-[50vh] bg-gradient-to-t from-yellow-950 via-yellow-700 to-yellow-500 rounded-t-2xl border-t-[4px] border-yellow-300 shadow-[0_0_100px_rgba(234,179,8,0.3)] flex items-end justify-center pb-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                        <div className="text-7xl md:text-9xl font-black text-yellow-900/30 absolute bottom-0 select-none">1</div>
                     </div>
                </div>
            )}

            {/* === JUARA 3 (KANAN) === */}
            {thirdPlace && (
                <div className="order-3 flex flex-col items-center justify-end w-[30%] h-full group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                     {/* Info Card */}
                     <div className="mb-2 md:mb-4 flex flex-col items-center w-full">
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-[3px] border-orange-600 overflow-hidden shadow-[0_0_25px_rgba(234,88,12,0.4)] mb-2 bg-slate-800 relative z-10">
                             {getAvatar(thirdPlace)}
                        </div>

                        <h3 className="font-bold text-orange-100 text-xs md:text-base leading-tight text-center px-1 line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                            {thirdPlace.title}
                        </h3>
                        
                        <p className="hidden md:block text-orange-500 text-[10px] mt-1 uppercase tracking-widest font-extrabold">3rd Place</p>
                        <div className="mt-1 md:mt-2 bg-orange-900/40 px-3 md:px-5 py-0.5 md:py-1 rounded-full border border-orange-600 inline-block font-mono text-sm md:text-lg font-bold text-orange-400">
                            {thirdPlace.totalScore}
                        </div>
                     </div>
                     
                     {/* Podium Box - Tinggi Responsive (25% layar) */}
                     <div className="w-full h-[25vh] bg-gradient-to-t from-orange-950 via-orange-900 to-orange-700 rounded-t-xl border-t-[3px] border-orange-500 shadow-[0_0_60px_rgba(234,88,12,0.2)] flex items-end justify-center pb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                        <div className="text-6xl md:text-8xl font-black text-black/20 absolute bottom-0 select-none">3</div>
                     </div>
                </div>
            )}

        </div>
      </main>
      
      <style jsx global>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .text-shadow-glow {
            text-shadow: 0 0 20px rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}