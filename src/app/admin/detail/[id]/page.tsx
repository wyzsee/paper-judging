'use client';
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, PresentationChart, Gavel } from "@phosphor-icons/react";

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const participantId = resolvedParams.id;
    const router = useRouter();
    const [participant, setParticipant] = useState<any>(null);
    const [scores, setScores] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: p } = await supabase.from('participants').select('*').eq('id', participantId).single();
            setParticipant(p);

            // Ambil Nama Lengkap Juri dari tabel Profiles
            const { data: s } = await supabase.from('scores')
                .select(`*, profiles (email, full_name)`).eq('participant_id', participantId);
            setScores(s || []);
        };
        fetchData();
    }, [participantId]);

    const getJudgeName = (profile: any) => {
        if (profile?.full_name) return profile.full_name;
        return profile?.email ? profile.email.split('@')[0].toUpperCase() : 'Unknown Judge';
    };

    return (
        <div className="min-h-screen w-full font-poppins relative selection:bg-cyan-500 selection:text-black text-white pb-20">
            {/* Background Fixed */}
            <div className="fixed inset-0 z-0"
                style={{ 
                    backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.95), rgba(2, 6, 23, 0.85)), url('/bg-audit.jpg')`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                }}
            ></div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10">
                
                {/* Tombol Kembali */}
                <button 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition-colors group"
                >
                    <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all">
                        <ArrowLeft size={18} /> 
                    </div>
                    <span className="text-sm font-medium uppercase tracking-wider">Kembali ke Dashboard</span>
                </button>
                
                {/* Header Card */}
                <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl mb-8">
                     <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] rotate-12">
                        <PresentationChart size={300} color="white" />
                     </div>
                     
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-widest">
                                Detail Penilaian
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                            {participant?.title}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-sm text-slate-300 mt-6 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <User weight="duotone" className="text-slate-500" />
                                <p><span className="text-slate-500 uppercase text-[10px] tracking-widest font-bold mr-2">Moderator:</span> {participant?.moderator}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <User weight="duotone" className="text-slate-500" />
                                <p><span className="text-slate-500 uppercase text-[10px] tracking-widest font-bold mr-2">Presenter:</span> {participant?.presenters?.join(', ')}</p>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Table Detail Nilai */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-widest border-b border-white/10">
                                    <th className="p-5 font-bold text-cyan-400">Nama Juri</th>
                                    <th className="p-5 text-center w-24">Originalitas</th>
                                    <th className="p-5 text-center w-24">Applicable</th>
                                    <th className="p-5 text-center w-24">Manfaat</th>
                                    <th className="p-5 text-center w-24">Kolaboratif</th>
                                    <th className="p-5 text-center w-24">Presentasi</th>
                                    <th className="p-5 text-right text-white">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {scores.map((s, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="p-5 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0 border border-white/5 shadow-inner">
                                                <Gavel weight="fill" size={18} />
                                            </div>
                                            <span className="font-bold text-slate-200 text-sm">{getJudgeName(s.profiles)}</span>
                                        </td>
                                        <td className="p-5 text-center text-slate-400">{s.originality}</td>
                                        <td className="p-5 text-center text-slate-400">{s.applicable}</td>
                                        <td className="p-5 text-center text-slate-400">{s.benefit}</td>
                                        <td className="p-5 text-center text-slate-400">{s.collaborative}</td>
                                        <td className="p-5 text-center text-slate-400">{s.presentation}</td>
                                        <td className="p-5 text-right font-mono font-bold text-cyan-400 text-lg border-l border-white/5 bg-white/[0.02]">
                                            {s.total_score}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {scores.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                            <Gavel size={48} weight="duotone" className="mb-2 opacity-20" />
                            <p className="text-sm">Belum ada juri yang memberikan penilaian.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}