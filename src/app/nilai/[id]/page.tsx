"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { PaperPlaneTilt } from "@phosphor-icons/react";

export default function ScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const participantId = resolvedParams.id;

  const router = useRouter();
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Default loading true agar tidak glitch
  const [user, setUser] = useState<any>(null);

  // State Nilai
  const [scores, setScores] = useState({
    originality: 70,
    applicable: 70,
    result: 70,
    strategic: 70,
    presentation: 70,
  });

  // Hitung total realtime
  const totalScore =
    scores.originality +
    scores.applicable +
    scores.result +
    scores.strategic +
    scores.presentation;

  useEffect(() => {
    const initData = async () => {
      if (!participantId) return;

      // Session Check
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      try {
        // Get Participant Data
        const participantReq = supabase
          .from("participants")
          .select("*")
          .eq("id", participantId)
          .single();

        // Check is that judge was scored the participants?
        const scoreReq = supabase
          .from("scores")
          .select("*")
          .eq("participant_id", participantId)
          .eq("judge_id", session.user.id)
          .single();

        const [participantRes, scoreRes] = await Promise.all([
          participantReq,
          scoreReq,
        ]);

        if (participantRes.data) {
          setParticipant(participantRes.data);
        }

        // If scored, old data
        if (scoreRes.data) {
          setScores({
            originality: scoreRes.data.originality,
            applicable: scoreRes.data.applicable,
            result: scoreRes.data.result,
            strategic: scoreRes.data.strategic,
            presentation: scoreRes.data.presentation,
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
    if (!confirm("Yakin dengan nilai ini? Data akan disimpan")) return;

    setLoading(true);

    // Use insert if new, use upsert if no
    const { error } = await supabase.from("scores").upsert(
      {
        judge_id: user.id,
        participant_id: participantId,
        originality: scores.originality,
        applicable: scores.applicable,
        result: scores.result,
        strategic: scores.strategic,
        presentation: scores.presentation
      },
      { onConflict: "judge_id, participant_id" }
    );

    if (error) {
      alert("Gagal Menyimpan: " + error.message);
      setLoading(false);
    } else {
      alert("Berhasil dinilai!");
      router.push("/");
    }
  };

  const handleScoreChange = (field: string, value: string) => {
    setScores((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const getInitials = (name: string) => {
    return (name || "")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading || !participant)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat data...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans">
      <div className="max-w-xl mx-auto rounded-xl overflow-hidden">
        {/* Header Participants */}
        <div className="bg-linear-to-br from-sky-500 to-indigo-500 p-6 rounded-t-4xl text-white shadow-lg">
          <div className="flex gap-4 items-center">
            <div className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold bg-white text-blue-600 shadow-inner">
              {getInitials(participant.name)}
            </div>
            <div className="grow min-w-0">
              {/* PERBAIKAN DI SINI: Menggunakan participant.name bukan item.name */}
              <h2 className="text-xl font-bold text-white truncate">
                {participant.name}
              </h2>
              <p className="text-sm text-blue-100 truncate">
                {participant.title}
              </p>
            </div>
          </div>
        </div>

        {/* FORM NILAI */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 space-y-6 rounded-b-2xl"
        >
          <ScoreInput
            label="Originalitas"
            desc="Apakah metode pemeriksaan baru atau pengembangan dari yang sudah pernah dilakukan"
            value={scores.originality}
            onChange={(val: string) => handleScoreChange("originality", val)}
          />
          <ScoreInput
            label="Applicable"
            desc="Tingkat/persentase inovasi dapat dilaksanakan di wilayah lain"
            value={scores.applicable}
            onChange={(val: string) => handleScoreChange("applicable", val)}
          />
          <ScoreInput
            label="Hasil"
            desc="Seberapa besar tingkat keberhasilan inovasi, hasil akurat, penyelesaian masalah"
            value={scores.result}
            onChange={(val: string) => handleScoreChange("result", val)}
          />
          <ScoreInput
            label="Aspek Strategis"
            desc="Pemanfaatan teknologi, kolaborasi dengan divisi lain, & keberlanjutan inovasi."
            value={scores.strategic}
            onChange={(val: string) => handleScoreChange("strategic", val)}
          />
          <ScoreInput
            label="Presentasi"
            desc="Penyajian materi, cara penyampaian, dan ketepatan waktu"
            value={scores.presentation}
            onChange={(val: string) => handleScoreChange("presentation", val)}
          />

          {/* TOTAL & BUTTONS */}
          <div className="pb-20"></div>

          {/* 2. FIXED FOOTER: Bagian Total & Tombol yang menempel di bawah */}
          <div className="fixed px-6 bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
            {/* Wrapper max-w-xl agar posisi lurus dengan form di atasnya */}
            <div className="max-w-xl mx-auto p-4 md:p-6">
              <div className="w-full gap-6 flex justify-center items-center mb-4">
                <div className="flex flex-col bg-gray-100 p-6 rounded-full justify-center items-center">
                  <span className="text-gray-600 font-medium text-xs md:text-sm tracking-wider">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-gray-800 font-mono">
                    {totalScore}
                  </span>
                </div>
                <div className="w-full">
                  {/* <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button> */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex justify-center gap-4 items-center w-full p-3 bg-linear-to-br from-sky-500 to-indigo-500 text-white rounded-full font-bold hover:opacity-90 cursor-pointer transition-all shadow-blue-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <PaperPlaneTilt size={20} />
                    {loading ? "Menyimpan..." : "Simpan Nilai"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub Component
function ScoreInput({ label, desc, value, onChange }: any) {
  // Logic warna slider
  const getColor = (val: number) => {
    if (val < 50) return "text-red-500 bg-red-50";
    if (val < 80) return "text-orange-500 bg-orange-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <div>
      <div className="flex justify-between mb-1 items-center">
        <label className="font-semibold text-gray-800 text-lg md:text-base">
          {label}
        </label>
        <span
          className={`font-mono font-bold px-3 py-1 rounded text-sm ${getColor(
            value
          )}`}
        >
          {value}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{desc}</p>
      <input
        type="range"
        min="10"
        max="100"
        value={value ?? 0}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold uppercase">
        <span>Min (10)</span>
        <span>Max (100)</span>
      </div>
    </div>
  );
}
