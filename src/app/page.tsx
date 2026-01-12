"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";
import {
  SignOut,
  Users,
  CheckCircle,
  Clock,
  PencilSimple,
} from "@phosphor-icons/react";

export default function Dashboard() {
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan ID peserta yang SUDAH dinilai
  const [myScores, setMyScores] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      // Check Login Session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    };

    const fetchData = async (userId: string) => {
      try {
        // Get all participants
        const { data: dataPeserta, error: errorPeserta } = await supabase
          .from("participants")
          .select("*")
          .order("display_order", { ascending: true });

        if (errorPeserta) console.error("Error ambil peserta:", errorPeserta);
        setParticipants(dataPeserta || []);

        //  Ambil Data Nilai
        const { data: dataNilai, error: errorNilai } = await supabase
          .from("scores")
          .select("participant_id, total_score")
          .eq("judge_id", userId);

        if (errorNilai) console.error("Error ambil nilai:", errorNilai);

        if (dataNilai) {
          setMyScores(dataNilai);
        }
      } catch (err) {
        console.error("Terjadi kesalahan:", err);
      } finally {
        // 4. Pastikan Loading berhenti apapun yang terjadi
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Stats
  const totalPeserta = participants.length;
  const sudahDinilai = myScores.length;
  const belumDinilai = totalPeserta - sudahDinilai;

  // Helper Initial Participants
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading)
    return <div className="p-8 text-center">Memuat data dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-8 font-sans">
      <header className="flex justify-between px-4 py-6 bg-white border-b border-gray-300 shadow-2xs items-center mb-8 max-w-2xl mx-auto">
        <div className="flex items-center">
          <div className="flex items-center justify-center shadow-sm w-12 h-12 rounded-full bg-linear-to-br from-sky-500 to-indigo-500 mr-4">
            <div className="text-2xl font-semibold text-white">J</div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800">
              Hello, {user.email}!
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

      <main className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="w-full flex justify-evenly items-center">
          <div className="flex flex-col p-5 justify-between items-start h-32 w-36 bg-white rounded-2xl shadow-md">
            <div className="flex space-x-2 text-gray-600">
              <Users size={24} />
              <p>Total</p>
            </div>
            <div className="text-gray-900 font-semibold text-5xl">
              {totalPeserta}
            </div>
          </div>
          <div className="flex flex-col p-5 justify-between items-start h-32 w-36 bg-green-100 rounded-2xl shadow-md">
            <div className="flex space-x-2 text-green-600">
              <CheckCircle size={24} />
              <p>Selesai</p>
            </div>
            <div className="text-green-600 font-semibold text-5xl">
              {sudahDinilai}
            </div>
          </div>
          <div className="flex flex-col p-5 justify-between items-start h-32 w-36 bg-orange-100 rounded-2xl shadow-md">
            <div className="flex space-x-2 text-orange-800">
              <Clock size={24} />
              <p>Pending</p>
            </div>
            <div className="text-orange-800 font-semibold text-5xl">
              {belumDinilai}
            </div>
          </div>
        </div>

        {/* Participant List */}
        <div className="space-y-4">
          <div>
            <h1 className="font-semibold text-gray-800 text-2xl">
              Daftar Partisipan
            </h1>

            <p className="text-sm text-gray-600">
              Tap tombol warna biru untuk memberi nilai!
            </p>
          </div>

          {participants.map((item) => {
            // Cari apakah peserta ini ada di daftar nilai saya?
            const scoreData = myScores.find(
              (s) => s.participant_id === item.id
            );
            const isDone = !!scoreData; // true jika sudah ada nilai

            return (
              <div
                key={item.id}
                className="group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                {/* Edit Score */}
                {isDone && (
                  <button
                    onClick={() => router.push(`/nilai/${item.id}`)}
                    title="Edit Nilai"
                    className="absolute top-3 right-3 p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 cursor-pointer rounded-full transition-colors"
                  >
                    <PencilSimple size={18} weight="bold" />
                  </button>
                )}

                <div className="flex flex-col items-start gap-4">
                  <div className="flex gap-4">
                    {/* 1. AVATAR INISIAL */}
                    <div
                      className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                      ${
                        isDone
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }
                    `}
                    >
                      {getInitials(item.name)}
                    </div>
                    <div className="grow min-w-0 pr-8">
                      {" "}
                      {/* pr-8 biar gak nabrak tombol edit */}
                      <h2 className="text-base font-bold text-gray-800 truncate">
                        {item.name}
                      </h2>
                      <p className="text-xs text-gray-500 truncate mb-2">
                        {item.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full justify-between">
                    {/* Badge Status */}
                    <div className="flex items-start">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-normal">
                          <CheckCircle size={12} weight="fill" /> Selesai
                          Dinilai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-sm px-3 py-1 rounded-full font-normal">
                          <Clock size={12} weight="fill" /> Menunggu Penilaian
                        </span>
                      )}
                    </div>
                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      {isDone ? (
                        // JIKA SUDAH: Tampilkan Total Skor
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
                            Total Skor
                          </span>
                          <span className="text-2xl font-bold text-gray-800 font-mono">
                            {scoreData.total_score}
                          </span>
                        </div>
                      ) : (
                        // JIKA BELUM: Tampilkan Tombol Nilai
                        <button
                          onClick={() => router.push(`/nilai/${item.id}`)}
                          className="flex items-center gap-1 bg-linear-to-br from-sky-500 to-indigo-500 text-white px-4 py-2 rounded-full cursor-pointer text-sm font-bold shadow-blue-200 shadow-md hover:opacity-90 hover:shadow-lg transition-all active:scale-95"
                        >
                          Nilai <CaretRight size={16} weight="bold" />
                        </button>
                      )}
                    </div>
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

// Komponen Kecil untuk Statistik
function StatCard({ icon, val, label, color }: any) {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
      <div className={`p-2 rounded-full mb-1 ${color}`}>{icon}</div>
      <span className="text-xl font-bold text-gray-800">{val}</span>
      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
        {label}
      </span>
    </div>
  );
}
