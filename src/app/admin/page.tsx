"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Check is the user admin?
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Check Role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        alert("Akses Ditolak! Halaman ini khusus Admin.");
        router.push("/");
        return;
      }

      // Get all Data
      const { data: participants } = await supabase.from("participants")
        .select(`
          id, name, title, display_order,
          scores (
            originality, applicable, result, strategic, presentation
          )
        `);

      if (participants) {
        const computed = participants.map((p: any) => {
          // Data Summary
          const currentScores = p.scores || [];
          const totalJudges = p.scores.length;

          // Sum Total Score
          let grandTotal = 0;
          currentScores.forEach((s: any) => {
            grandTotal +=
              (s.originality || 0) +
              (s.applicable || 0) +
              (s.result || 0) +
              (s.strategic || 0) +
              (s.presentation || 0);
          });

          return {
            ...p,
            totalScore: grandTotal,
            judgeCount: totalJudges,
          };
        });

        // Sort from the highest
        const sorted = computed.sort(
          (a: any, b: any) => b.totalScore - a.totalScore
        );
        setLeaderboard(sorted);
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading)
    return (
      <div className="p-8 text-center font-bold">
        Menghitung Data Rekapitulasi...
      </div>
    );
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🏆 Leaderboard Penilaian
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:underline"
          >
            Kembali ke Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4 text-center w-16">Rank</th>
                <th className="p-4">Nama Tim</th>
                <th className="p-4 text-center">Juri Masuk</th>
                <th className="p-4 text-right">Total Skor</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, index) => (
                <tr
                  key={team.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-center font-bold text-xl text-gray-500">
                    {index + 1}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-lg text-gray-800">
                      {team.name}
                    </div>
                    <div className="text-sm text-gray-500">{team.title}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                      {team.judgeCount} Orang
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-2xl text-blue-600">
                    {team.totalScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
