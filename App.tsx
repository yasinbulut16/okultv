import React, { useState, useEffect } from 'react';
import { Settings, UserCheck, X, GraduationCap } from 'lucide-react';
import { Clock } from './Clock';
import { WeatherWidget } from './WeatherWidget';
import { BoardConfig, SchoolData, DutySection } from './types';

const App: React.FC = () => {
  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  
  const createEmptyDuty = () => {
    const duty: { [day: string]: DutySection[] } = {};
    days.forEach(day => {
      duty[day] = Array.from({ length: 5 }, (_, i) => ({ sectionName: `${i + 1}. Kat`, teachers: "" }));
    });
    return duty;
  };

  const [config, setConfig] = useState<BoardConfig>(() => {
    const saved = localStorage.getItem('schoolBoardConfig');
    if (saved) return JSON.parse(saved);
    const base = (n: string, m: string, s: string, e: string): SchoolData => ({
      name: n, motto: m, startTime: s, endTime: e, slots: [],
      announcements: [], dutyTeachers: createEmptyDuty(), specialDays: []
    });
    return {
      morning: base("SABAH OKULU", "Bilgi Aydınlıktır", "07:00", "13:20"),
      afternoon: base("ÖĞLE OKULU", "Gelecek Burada Başlar", "13:21", "19:00"),
      course: base("KURS MERKEZİ", "Başarıya Odaklan", "08:00", "17:00")
    };
  });

  const [displayMode, setDisplayMode] = useState<'morning' | 'afternoon' | 'course'>('morning');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkMode = () => {
      const now = new Date();
      const day = now.toLocaleDateString('tr-TR', { weekday: 'long' });
      const time = now.getHours() * 100 + now.getMinutes();
      if (day === "Cumartesi" || day === "Pazar") { setDisplayMode('course'); return; }
      
      const mS = parseInt(config.morning.startTime.replace(':', ''));
      const mE = parseInt(config.morning.endTime.replace(':', ''));
      const aS = parseInt(config.afternoon.startTime.replace(':', ''));
      const aE = parseInt(config.afternoon.endTime.replace(':', ''));
      
      if (time >= mS && time <= mE) setDisplayMode('morning');
      else if (time >= aS && time <= aE) setDisplayMode('afternoon');
    };
    checkMode();
    const interval = setInterval(checkMode, 60000);
    return () => clearInterval(interval);
  }, [config]);

  // Hata veren 219. satırın güvenli fonksiyonel hali
  const getThemeColor = () => {
    if (displayMode === 'morning') return 'text-blue-400';
    if (displayMode === 'afternoon') return 'text-purple-400';
    return 'text-green-400';
  };

  const currentDay = currentTime.toLocaleDateString('tr-TR', { weekday: 'long' });
  const activeData = config[displayMode];

  return (
    <div className="h-screen w-screen bg-[#050507] flex flex-col overflow-hidden text-white font-sans">
      <header className="h-24 flex items-center justify-between px-10 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-6">
          <GraduationCap size={44} className={getThemeColor()} />
          <div>
            <h1 className="text-4xl font-black uppercase">{activeData.name}</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{activeData.motto}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <WeatherWidget /> <Clock />
        </div>
      </header>

      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        <aside className="w-80 flex flex-col gap-4">
          <div className="bg-[#0f0f14] rounded-[2.5rem] p-8 flex-1 border border-white/5 overflow-hidden flex flex-col">
            <div className="mb-6">
              <div className={`flex items-center gap-2 mb-1 ${getThemeColor()}`}>
                <UserCheck size={28} />
                <h2 className="text-xl font-black uppercase tracking-tighter">Nöbetçiler</h2>
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase">{currentDay}</div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {activeData.dutyTeachers[currentDay]?.map((d, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className={`text-[10px] font-black uppercase mb-1 ${getThemeColor()}`}>{d.sectionName}</div>
                  <div className="text-lg font-bold leading-tight">{d.teachers || "Girilmedi"}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 bg-[#09090c] rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center">
            <div className="text-[12rem] font-black tracking-tighter">--:--</div>
            <div className="text-4xl font-bold text-slate-500 uppercase tracking-widest">Eğitim Saatleri Dışı</div>
        </section>
      </main>

      <button onClick={() => setIsSettingsOpen(true)} className="fixed bottom-10 right-10 bg-white/10 p-5 rounded-2xl border border-white/20 hover:scale-110 transition-all z-50">
        <Settings size={36} />
      </button>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-[#0d0d12] p-10 rounded-[3rem] border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Ayarlar</h2>
              <button onClick={() => setIsSettingsOpen(false)}><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {/* Ayar alanları buraya gelecek */}
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-10 bg-blue-600 p-6 rounded-2xl font-black text-xl">KAYDET VE KAPAT</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;