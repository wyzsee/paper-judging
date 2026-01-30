"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { SignOut, Trophy, PresentationChart, Crown } from "@phosphor-icons/react";
import Swal from "sweetalert2";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const fetchData = async () => {
      // 1. Cek Sesi
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // 2. Cek Role & Ambil Profil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData?.role !== "admin") {
        router.push("/"); return;
      }
      setProfile(profileData);

      // 3. Ambil Data Peserta & Skor
      const { data: participants, error } = await supabase.from("participants")
        .select(`
            id, title, moderator, presenters, display_order,
            scores (originality, applicable, benefit, collaborative, presentation)
          `);
      
      if (error) console.error("Error fetching data:", error);

      if (participants) {
        const computed = participants.map((p: any) => {
          const currentScores = p.scores || [];
          let grandTotal = 0;
          currentScores.forEach((s: any) => {
            grandTotal += (s.originality || 0) + (s.applicable || 0) + (s.benefit || 0) + (s.collaborative || 0) + (s.presentation || 0);
          });

          const judgeCount = currentScores.length;
          const averageScore = judgeCount > 0 ? (grandTotal/judgeCount) : 0;

          return {
            ...p,
            totalScore: grandTotal,
            judgeCount: currentScores.length,
            averageScore: averageScore
          };
        });

        // Sort Highest Score
        const sorted = computed.sort((a: any, b: any) => b.averageScore - a.averageScore);
        setLeaderboard(sorted);
      }
      setLoading(false);
    };

    fetchData();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  const handleLogout = async () => {
    const result = await Swal.fire({
        title: 'Sign Out?',
        text: "Anda akan keluar dari panel admin.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Ya, Keluar',
        background: '#0f172a',
        color: '#fff'
    });

    if (result.isConfirmed) {
        await supabase.auth.signOut();
        router.push("/login");
    }
};

  const adminName = profile?.full_name || "Administrator";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-400 font-poppins">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="animate-pulse tracking-widest uppercase text-xs">Memuat Data...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full font-poppins relative selection:bg-cyan-500 selection:text-black text-white pb-20">
      
      {/* Background Fixed */}
      <div className="fixed inset-0 z-0"
        style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), url('/bg-audit.jpg')`,
            backgroundSize: 'cover', backgroundPosition: 'center'
        }}
      ></div>

      {/* Navbar Glass */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                  A
              </div>
              <div className="leading-tight">
                  <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Admin Panel</p>
                  <p className="text-white font-bold text-sm md:text-base">{adminName}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all">
              <span className="text-xs font-medium hidden md:block uppercase">Sign Out</span>
              <SignOut size={18} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-500 mb-2 drop-shadow-md">
                    Leaderboard Live
                </h1>
                <p className="text-slate-400 text-sm">Pantau perolehan skor peserta secara real-time.</p>
            </div>
            
            <button 
                onClick={() => router.push('/admin/podium')}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 cursor-pointer text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300 font-bold text-sm uppercase tracking-wider"
            >
                <Trophy size={20} weight="fill" />
                Lihat Podium
            </button>
        </div>

        {/* Glass Table Container */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest border-b border-white/10">
                  <th className="p-5 text-center w-20">Rank</th>
                  <th className="p-5">Judul Makalah & Tim</th>
                  <th className="p-5 text-center">Juri Masuk</th>
                  <th className="p-5 text-right">Total Skor</th>
                  <th className="p-5 text-right">Rata-rata</th>
                  <th className="p-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((team, index) => {
                    // Styling Khusus Top 3
                    let rankColor = "text-slate-500";
                    let rankIcon = null;
                    if(index === 0) { rankColor = "text-yellow-400"; rankIcon = <Crown weight="fill" className="mb-1 inline text-yellow-500" /> }
                    if(index === 1) { rankColor = "text-slate-300"; }
                    if(index === 2) { rankColor = "text-orange-400"; }

                    return (
                        <tr key={team.id} className="hover:bg-white/5 transition-colors group">
                            <td className={`p-5 text-center font-bold text-xl ${rankColor}`}>
                                {rankIcon} {index + 1}
                            </td>
                            <td className="p-5">
                                <div className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors mb-1 line-clamp-1">
                                    {team.title}
                                </div>
                                <div className="flex flex-col md:flex-row gap-1 md:gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <span className="font-bold text-slate-500">MOD:</span> {team.moderator}
                                    </span>
                                    <span className="hidden md:inline text-slate-600">|</span>
                                    <span className="flex items-center gap-1">
                                        <span className="font-bold text-slate-500">PRES:</span> {team.presenters?.join(', ')}
                                    </span>
                                </div>
                            </td>
                            <td className="p-5 text-center">
                                <span className="bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3 py-1 rounded-full">
                                    {team.judgeCount} Orang
                                </span>
                            </td>
                            <td className="p-5 text-right">
                                <span className="font-mono font-bold text-2xl text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                    {team.totalScore}
                                </span>
                            </td>
                            <td className="p-5 text-right">
                                <span className="font-mono font-bold text-2xl text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                    {team.averageScore.toFixed(2)}
                                </span>
                            </td>
                            <td className="p-5 text-center">
                                <button 
                                    onClick={() => router.push(`/admin/detail/${team.id}`)}
                                    className="p-2 rounded-lg bg-slate-800 cursor-pointer text-slate-400 hover:bg-cyan-600 hover:text-white transition-all border border-slate-700 hover:border-cyan-500"
                                    title="Lihat Detail"
                                >
                                    <PresentationChart size={20} />
                                </button>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
          {leaderboard.length === 0 && (
             <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                <Trophy size={40} className="mb-2 opacity-20" />
                <p>Belum ada data peserta yang tersedia.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}