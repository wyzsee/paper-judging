"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { PaperPlaneTilt, CaretLeft, PresentationChart, User } from "@phosphor-icons/react";
import Swal from "sweetalert2";

export default function ScoringPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const participantId = resolvedParams.id;
  const router = useRouter();
  
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // UPDATE STATE: Sesuaikan dengan kolom database baru
  const [scores, setScores] = useState({
    originality: 70,    // Originalitas
    applicable: 70,     // Applicable
    benefit: 70,        // Manfaat (Dulu Result)
    collaborative: 70,  // Kolaboratif (Dulu Strategic)
    presentation: 70,   // Presentasi
  });

  const totalScore =
    scores.originality +
    scores.applicable +
    scores.benefit +
    scores.collaborative +
    scores.presentation;

  useEffect(() => {
    const initData = async () => {
      if (!participantId) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUser(session.user);

      try {
        const { data: participantData } = await supabase
          .from("participants").select("*").eq("id", participantId).single();

        const { data: scoreData } = await supabase
          .from("scores")
          .select("*")
          .eq("participant_id", participantId)
          .eq("judge_id", session.user.id)
          .single();

        if (participantData) setParticipant(participantData);

        // UPDATE LOAD DATA: Mapping kolom database ke state
        if (scoreData) {
          setScores({
            originality: scoreData.originality,
            applicable: scoreData.applicable,
            benefit: scoreData.benefit,             // Baru
            collaborative: scoreData.collaborative, // Baru
            presentation: scoreData.presentation,
          });
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [participantId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Ganti Confirm Standar dengan SweetAlert Custom
    const result = await Swal.fire({
      title: 'Konfirmasi Penilaian',
      html: `
        <div class="text-left text-sm text-slate-300">
          <p>Apakah Anda yakin dengan nilai total: <strong class="text-cyan-400 text-lg">${totalScore}</strong>?</p>
          <p class="mt-2 text-xs italic">Data yang disimpan tidak dapat diubah lagi.</p>
        </div>
      `,
      icon: 'question',
      iconColor: '#22d3ee', // Cyan Neon
      background: '#0f172a', // Slate-950 (Dark Theme)
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan Nilai',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0891b2', // Cyan-600
      cancelButtonColor: '#475569', // Slate-600
      customClass: {
        popup: 'border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10'
      }
    });

    // Jika user klik Batal, berhenti di sini
    if (!result.isConfirmed) return;

    setLoading(true);

    const { error } = await supabase.from("scores").upsert(
      {
        judge_id: user.id,
        participant_id: participantId,
        originality: scores.originality,
        applicable: scores.applicable,
        benefit: scores.benefit,
        collaborative: scores.collaborative,
        presentation: scores.presentation,
        total_score: totalScore
      },
      { onConflict: "judge_id, participant_id" }
    );

    if (error) {
      setLoading(false);
      // 2. Ganti Alert Error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.message,
        background: '#0f172a',
        color: '#fff'
      });
    } else {
      // 3. Ganti Alert Sukses
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Penilaian telah berhasil disimpan ke sistem.',
        background: '#0f172a',
        color: '#fff',
        iconColor: '#22d3ee',
        confirmButtonColor: '#0891b2',
        timer: 2000,
        timerProgressBar: true
      });
      
      router.push("/"); // Kembali ke Dashboard
    }
  };

  const handleScoreChange = (field: string, value: string) => {
    setScores((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-400 font-poppins">Loading...</div>;
  if (!participant) return <div className="text-white text-center pt-20">Data tidak ditemukan.</div>;

  return (
    <div className="min-h-screen w-full font-poppins relative text-white pb-32">
      <div className="fixed inset-0 z-0" style={{ backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.95), rgba(2, 6, 23, 0.9)), url('/bg-audit.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
            <CaretLeft size={20} /><span className="text-sm font-bold uppercase">Kembali</span>
        </button>

        {/* Card Info Peserta */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-widest">Peserta #{participant.display_order}</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white my-2 leading-tight">{participant.title}</h1>
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5 text-sm text-slate-300">
                <div className="flex items-center gap-2"><User weight="fill" className="text-slate-500" /><span className="text-slate-500 text-xs font-bold uppercase w-24">Moderator</span><span className="font-medium text-cyan-100">{participant.moderator}</span></div>
                <div className="flex items-center gap-2"><User weight="duotone" className="text-slate-500" /><span className="text-slate-500 text-xs font-bold uppercase w-24">Presenter</span><span className="font-medium text-cyan-100">{participant.presenters?.join(', ')}</span></div>
            </div>
          </div>
        </div>

        {/* UPDATE FORM INPUT: Label Baru */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <ScoreInput label="Originalitas" desc="Merupakan Innovasi baru atau pengembangan dari inovsi yang sudah pernah dilakukan" value={scores.originality} onChange={(val: string) => handleScoreChange("originality", val)} />
          <ScoreInput label="Applicable" desc="Bentuk inovasi dapat dilaksanakan oleh seluruh uditor, departemen lain, bahkan oleh unit Operation dan keberlanjutan inovasi." value={scores.applicable} onChange={(val: string) => handleScoreChange("applicable", val)} />
          
          {/* Ganti Result -> Manfaat */}
          <ScoreInput label="Manfaat" desc="Seberapa besar manfaat innovasi ini apabila di aplikasikan/setelah diaplikasikan." value={scores.benefit} onChange={(val: string) => handleScoreChange("benefit", val)} />
          
          {/* Ganti Strategic -> Kolaboratif */}
          <ScoreInput label="Kolaboratif" desc="Pemanfaatan teknologi, kolaborasi dengan departemen dan divisi lain." value={scores.collaborative} onChange={(val: string) => handleScoreChange("collaborative", val)} />
          
          <ScoreInput label="Presentasi" desc="Cara penyajian materi dan cara penyampaian presenter." value={scores.presentation} onChange={(val: string) => handleScoreChange("presentation", val)} />
        </form>
      </div>

      <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Score</span>
                <div className="flex items-baseline gap-1"><span className="text-3xl md:text-4xl font-black text-cyan-400 font-mono">{totalScore}</span><span className="text-sm text-slate-500 font-bold">/ 500</span></div>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95">
                {loading ? "Saving..." : <><span>Submit Nilai</span><PaperPlaneTilt size={20} weight="fill" /></>}
            </button>
        </div>
      </div>
    </div>
  );
}

// Komponen Slider Bulat (Sama seperti sebelumnya)
function ScoreInput({ label, desc, value, onChange }: any) {
  const getColor = (val: number) => {
    if (val < 50) return "text-red-400 border-red-500/30 bg-red-500/10";
    if (val < 80) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
  };
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-cyan-500/30 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <label className="font-bold text-white text-lg tracking-wide">{label}</label>
        <span className={`font-mono font-bold px-3 py-1 rounded-lg text-sm border ${getColor(value)}`}>{value}</span>
      </div>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed border-l-2 border-slate-700 pl-3">{desc}</p>
      <div className="relative h-6 flex items-center group">
        <div className="absolute w-full h-2 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-400 transition-all duration-100 ease-out" style={{ width: `${value}%` }}></div>
        </div>
        <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(e.target.value)}
            className="absolute w-full h-full opacity-0 cursor-pointer z-10 
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6"
            /* NOTE: Gunakan CSS Thumb yang saya kasih sebelumnya di sini agar buletannya muncul */
        />
        {/* Indikator Visual Thumb (Optional jika CSS thumb browser tidak muncul) */}
        <div className="absolute h-6 w-6 bg-white border-4 border-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] pointer-events-none transition-all" style={{ left: `calc(${value}% - 12px)` }}></div>
      </div>
    </div>
  );
}