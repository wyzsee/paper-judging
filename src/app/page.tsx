'use client';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard(){
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
    // Check User already login?
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if(!session){
        router.push('login');
      } else {
        setUser(session.user);
        fetchParticipants();
      }
    };

    // Get Participants Data
    const fetchParticipants = async () => {
      const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('display_order', { ascending: true});

      if(error) console.log('Error: ', error);
      else setParticipants(data || []);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  // Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login')
  }

  if (loading) return <div className="p-8 text-center">Loading Data...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <header className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard Penilaian</h1>
          <p className="text-sm text-gray-500">Halo, {user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm cursor-pointer text-red-600 hover:text-red-800 font-medium"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto space-y-4">
        {participants.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">
                Peserta #{item.display_order}
              </div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">{item.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{item.title}</p>
            </div>
            
            {/* Tombol Nilai (Nanti kita fungsikan) */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Nilai
            </button>
          </div>
        ))}
      </main>
    </div>
  )
}