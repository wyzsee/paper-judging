"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const participantId = resolvedParams.id;

  const router = useRouter();
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. STATE MENGGUNAKAN BAHASA INGGRIS (Sesuai Kolom DB)
  const [scores, setScores] = useState({
    originality: 70,
    applicable: 70,
    result: 70,
    strategic: 70,
    presentation: 70,
  });

  // Hitung total (pastikan ejaan sama persis dengan state di atas)
  const totalScore =
    scores.originality +
    scores.applicable +
    scores.result +
    scores.strategic +
    scores.presentation;

  useEffect(() => {
    const initData = async () => {
      if (!participantId) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from("participants")
        .select("*")
        .eq("id", participantId)
        .single();

      setParticipant(data);
    };

    initData();
  }, [participantId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Yakin dengan nilai ini? Data akan disimpan")) return;

    setLoading(true);

    // 2. INSERT KE DATABASE (Kolom Kiri = Nama Kolom DB, Kanan = State)
    const { error } = await supabase.from("scores").insert({
      judge_id: user.id,
      participant_id: participantId,
      originality: scores.originality, // Sesuai DB
      applicable: scores.applicable, // Sesuai DB
      result: scores.result, // Sesuai DB
      strategic: scores.strategic, // Sesuai DB
      presentation: scores.presentation, // Sesuai DB
      // total_score dihitung otomatis oleh database (generated column)
    });

    if (error) {
      alert("Gagal Menyimpan: " + error.message);
      setLoading(false);
    } else {
      alert("Berhasil dinilai!");
      router.push("/");
    }
  };

  // Helper update score
  const handleScoreChange = (field: string, value: string) => {
    // ParseInt penting agar jadi angka, bukan teks
    setScores((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  if (!participant)
    return <div className="p-8 text-center">Memuat data peserta...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h2 className="text-sm font-medium opacity-90">
            Menilai Peserta #{participant.display_order}
          </h2>
          <h1 className="text-2xl font-bold mt-1">{participant.name}</h1>
          <p className="mt-2 text-blue-100 text-sm">{participant.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PENTING: 
                        1. value={scores.originality} -> Mengambil dari state
                        2. handleScoreChange('originality', ...) -> Mengupdate key yang SAMA
                    */}

          <ScoreInput
            label="Originalitas"
            desc="Kebaruan metode atau pengembangan yang dilakukan."
            value={scores.originality}
            onChange={(val: string) => handleScoreChange("originality", val)}
          />
          <ScoreInput
            label="Aplicable"
            desc="Tingkat inovasi dapat dilaksanakan di wilayah lain."
            value={scores.applicable}
            onChange={(val: string) => handleScoreChange("applicable", val)}
          />
          <ScoreInput
            label="Hasil"
            desc="Tingkat keberhasilan, akurasi, dan penyelesaian masalah."
            value={scores.result}
            onChange={(val: string) => handleScoreChange("result", val)}
          />
          <ScoreInput
            label="Aspek Strategis"
            desc="Pemanfaatan teknologi & keberlanjutan inovasi."
            value={scores.strategic}
            onChange={(val: string) => handleScoreChange("strategic", val)}
          />
          <ScoreInput
            label="Presentasi"
            desc="Penyajian materi, cara penyampaian, dan ketepatan waktu."
            value={scores.presentation}
            onChange={(val: string) => handleScoreChange("presentation", val)}
          />

          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600 font-medium">Total Skor</span>
              <span className="text-3xl font-bold text-blue-600">
                {totalScore}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? "Menyimpan..." : "Kirim Nilai"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Komponen Input dengan proteksi 'undefined'
function ScoreInput({ label, desc, value, onChange }: any) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="font-bold text-gray-800">{label}</label>
        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 rounded">
          {value ?? 0}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{desc}</p>
      <input
        type="range"
        min="10"
        max="100"
        // Proteksi agar tidak pernah undefined
        value={value ?? 0}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>10</span>
        <span>100</span>
      </div>
    </div>
  );
}
