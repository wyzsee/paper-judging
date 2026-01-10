'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk menyimpan ID peserta yang SUDAH dinilai
  const [judgedIds, setJudgedIds] = useState<number[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      // 1. Cek Sesi Login
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    };

    const fetchData = async (userId: string) => {
      try {
        // 2. Ambil SEMUA Daftar Peserta (Tanpa filter ID aneh-aneh)
        const { data: dataPeserta, error: errorPeserta } = await supabase
          .from('participants')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (errorPeserta) console.error("Error ambil peserta:", errorPeserta);
        setParticipants(dataPeserta || []);

        // 3. Ambil Data Nilai milik Juri ini (Untuk tanda centang)
        const { data: dataNilai, error: errorNilai } = await supabase
          .from('scores')
          .select('participant_id')
          .eq('judge_id', userId);

        if (errorNilai) console.error("Error ambil nilai:", errorNilai);

        if (dataNilai) {
          const ids = dataNilai.map((item: any) => item.participant_id);
          setJudgedIds(ids);
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
    router.push('/login');
  };

  if (loading) return <div className="p-8 text-center">Memuat data dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <header className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard Penilaian</h1>
          <p className="text-sm text-gray-500">Halo, {user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto space-y-4">
        {participants.length === 0 && (
          <div className="text-center text-gray-500 p-4">Belum ada data peserta.</div>
        )}

        {participants.map((item) => {
          // Cek apakah ID peserta ini ada di daftar judgedIds?
          const isDone = judgedIds.includes(item.id);

          return (
            <div 
              key={item.id} 
              className={`
                relative p-5 rounded-xl shadow-sm border transition-all
                ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:shadow-md'}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      text-xs font-bold uppercase tracking-wide
                      ${isDone ? 'text-green-600' : 'text-blue-600'}
                    `}>
                      Peserta #{item.display_order}
                    </span>
                    {/* Tanda Centang jika sudah selesai */}
                    {isDone && (
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Sudah Dinilai ✅
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-lg font-bold text-gray-800 leading-tight">{item.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{item.title}</p>
                </div>
                
                {/* Tombol Nilai */}
                <button 
                  // PENTING: Pakai backtick ` ` bukan kutip ' '
                  onClick={() => router.push(`/nilai/${item.id}`)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isDone 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'}
                  `}
                >
                  {isDone ? 'Edit Nilai' : 'Nilai'}
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}