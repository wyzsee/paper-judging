'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { SignOut, CheckCircle, Star, User, PresentationChart } from "@phosphor-icons/react";

export default function Dashboard() {
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null); // State untuk simpan data profil (Nama Asli)
  const [myScores, setMyScores] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const fetchData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if(!session) return router.push('/login');

        // 1. Ambil Data Profil (Untuk Nama Lengkap & Username)
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        setProfile(profileData);

        // 2. Ambil Data Peserta
        const { data: dataPeserta } = await supabase
          .from('participants').select('*').order('display_order');
        setParticipants(dataPeserta || []);

        // 3. Ambil Skor Saya
        const { data: dataNilai } = await supabase
          .from('scores').select('participant_id, total_score').eq('judge_id', session.user.id);
        setMyScores(dataNilai || []);
    };
    fetchData();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Helper Display Name
  // Prioritas: Nama Lengkap -> Username -> Email
  const displayName = profile?.full_name || "Nama Juri";
  const displayId = profile?.username || "JURI";

  return (
    <div className="min-h-screen w-full pb-20 font-poppins relative selection:bg-cyan-500 selection:text-black">
      
      {/* === BACKGROUND IMAGE FIXED === */}
      <div 
        className="fixed inset-0 z-0"
        style={{ 
            backgroundImage: `
              linear-gradient(to bottom, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.7)),
              url('/bg-audit.jpeg') 
            `, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      ></div>

      {/* === NAVBAR GLASS === */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 ${
          isScrolled 
            ? 'bg-slate-950/80 backdrop-blur-md shadow-lg border-b border-white/10 py-3' 
            : 'bg-transparent py-6'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              {/* Avatar Inisial */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg border border-white/10">
                  {displayName.charAt(0)}
              </div>
              
              {/* Info Nama Juri */}
              <div className="leading-tight">
                  <p className="text-[10px] text-cyan-300 uppercase tracking-widest font-bold mb-0.5">
                    ID: {displayId}
                  </p>
                  <p className="text-white font-bold text-base md:text-lg tracking-wide">
                    {displayName}
                  </p>
              </div>
           </div>

           <button 
             onClick={handleLogout}
             className="group cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full text-blue-400 border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 backdrop-blur-md"
           >
              <span className="text-xs font-semibold hidden md:block uppercase tracking-wider">Log Out</span>
              <SignOut size={18} weight="bold"/>
           </button>
        </div>
      </header> 

      {/* === CONTENT === */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-36">
        
        {/* Title Section */}
        <div className="text-center mb-14">
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-blue-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.2)] mb-4">
                Penilaian Makalah
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Selamat datang di sistem penilaian makalah. Silakan pilih peserta untuk memulai proses evaluasi berdasarkan kriteria yang telah ditetapkan.
            </p>
        </div>

        {/* Grid Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {participants.map((item) => {
            const scoreData = myScores.find(s => s.participant_id === item.id);
            const isDone = !!scoreData;

            return (
                <div 
                  key={item.id} 
                  className="group relative bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 hover:border-cyan-500/40 overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] hover:-translate-y-2 flex flex-col"
                >
                  {/* IMAGE SECTION */}
                  <div className="relative h-52 w-full overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url('${item.image_url || '/img/default.jpg'}')` }} 
                      ></div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        {isDone ? (
                            <span className="flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg">
                                <CheckCircle size={13} weight="fill" /> Selesai: {scoreData.total_score}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg animate-pulse">
                                <Star size={13} weight="fill" /> Menunggu
                            </span>
                        )}
                      </div>
                  </div>

                  {/* CONTENT SECTION */}
                  <div className="p-6 flex-1 flex flex-col -mt-12 relative z-10">
                     {/* Glass Overlay for Content */}
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 pointer-events-none"></div>

                     {/* Content Body */}
                     <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-cyan-500/20 p-1.5 rounded-lg text-cyan-300 border border-cyan-500/20 backdrop-blur-md">
                                <PresentationChart size={18} weight="duotone" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-cyan-200/80 font-bold bg-cyan-900/30 px-2 py-1 rounded-md">
                                Peserta #{item.display_order}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-white leading-snug mb-4 group-hover:text-cyan-300 transition-colors drop-shadow-md min-h-[3.5rem]">
                            {item.title}
                        </h3>

                        {/* Detail Info */}
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-white/5">
                                    <User size={16} weight="fill" />
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">Moderator</span>
                                    <span className="text-sm text-slate-200 font-medium">{item.moderator}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-white/5">
                                    <User size={16} weight="duotone" />
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">Presenter</span>
                                    <span className="text-sm text-slate-200 font-medium line-clamp-1">{item.presenters?.join(', ')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={() => router.push(`/nilai/${item.id}`)}
                            className={`
                                mt-6 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg
                                ${isDone 
                                    ? 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-500' 
                                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-transparent hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-[1.02]'}
                            `}
                        >
                            {isDone ? 'Edit Penilaian' : 'Mulai Penilaian'}
                        </button>
                     </div>
                  </div>
                </div>
            );
            })}
        </div>
      </main>
    </div>
  );
}