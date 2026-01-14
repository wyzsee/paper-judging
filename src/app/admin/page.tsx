"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { SignOut, Trophy } from "@phosphor-icons/react";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading)
    return (
      <div className="p-8 text-center font-bold">
        Menghitung Data Rekapitulasi...
      </div>
    );
  return (
    <div className="min-h-screen w-screen pb-4 bg-gray-100 font-sans">
      <header className="flex justify-between px-4 md:px-20 py-6 bg-white border-b border-gray-300 shadow-2xs items-center mb-8 mx-auto">
        <div className="flex items-center">
          <div className="flex items-center justify-center shadow-sm w-12 h-12 rounded-full bg-linear-to-br from-sky-500 to-indigo-500 mr-4">
            <div className="text-2xl font-semibold text-white">J</div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800">
              Hello, Admin!
            </h1>
            <p className="text-sm text-gray-500">Silahkan lakukan penilaian!</p>
          </div>
        </div>
        <div></div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-800 hover:text-red-600 font-semibold cursor-pointer"
        >
          <SignOut size={24} />
        </button>
      </header>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-start mb-6">
          <button 
            onClick={() => router.push('/admin/podium')}
            className="flex items-center gap-2 bg-linear-to-r cursor-pointer from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold"
          >
            <Trophy size={24} weight="fill" />
            Lihat Podium Juara
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-linear-to-br from-sky-500 to-indigo-500 text-white">
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
