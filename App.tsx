import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, UserCheck, X, Save, GraduationCap,
  Timer, Sun, Moon, School
} from 'lucide-react';
import { Clock } from './Clock';
import { WeatherWidget } from './WeatherWidget';
import { BoardConfig, SchoolData, LessonSlot, DutySection } from './types';

const App: React.FC = () => {
  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const createEmptyDuty = () => {
    const duty: { [day: string]: DutySection[] } = {};
    days.forEach(day => {
      duty[day] = Array.from({ length: 5 }, (_, i) => ({ sectionName: `${i + 1}. Kat`, teachers: "" }));
    });
    return duty;
  };

  const createInitialSlots = (isMorning: boolean): LessonSlot[] => Array.from({ length: 8 }, (_, i) => ({
    label: `${i + 1}. Ders`,
    start: isMorning ? `${8 + i}:30` : `${13 + i}:30`,
    end: isMorning ? `${9 + i}:10` : `${14 + i}:10`
  }));

  const [config, setConfig] = useState<BoardConfig>(() => {
    const saved = localStorage.getItem('schoolBoardConfig');
    if (saved) return JSON.parse(saved);
    const base = (n: string, m: string, s: string, e: string, isM: boolean): SchoolData => ({
      name: n, motto: m, startTime: s, endTime: e, slots: createInitialSlots(isM),
      announcements: [], dutyTeachers: createEmptyDuty(), specialDays: []
    });
    return {
      morning: base("SABAH OKULU", "Bilgi Aydınlıktır", "07:00", "13:20", true),
      afternoon: base("ÖĞLE OKULU", "Gelecek Burada Başlar", "13:21", "19:00", false),
      course: base("KURS MERKEZİ", "Başarıya Odaklan", "08:00", "17:00", true)
    };
  });

  const [activeEditTab, setActiveEditTab] = useState<'morning' | 'afternoon' | 'course'>('morning');
  const [displayMode, setDisplayMode] = useState<'morning' | 'afternoon' | 'course'>('morning');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('schoolBoardConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const checkMode = () => {
      const now = new Date();
      const dayName = now.toLocaleDateString('tr-TR', { weekday: 'long' });
      const timeNum = now.getHours() * 100 + now.getMinutes();
      
      if (dayName === "Cumartesi" || dayName === "Pazar") {
        setDisplayMode('course');
        return;
      }

      const mStart = parseInt(config.morning.startTime.replace(':', ''));
      const mEnd = parseInt(config.morning.endTime.replace(':', ''));
      const aStart = parseInt(config.afternoon.startTime.replace(':', ''));
      const aEnd = parseInt(config.afternoon.endTime.replace(':', ''));

      if (timeNum >= mStart && timeNum <= mEnd) setDisplayMode('morning');
      else if (timeNum >= aStart && timeNum <= aEnd) setDisplayMode('afternoon');
    };
    checkMode();
    const interval = setInterval(checkMode, 60000);
    return () => clearInterval(interval);
  }, [config]);

  const activeData = config[displayMode];
  const currentDay = currentTime.toLocaleDateString('tr-TR', { weekday: 'long' });

  // Renk yönetimi için yardımcı fonksiyon (Hata payını sıfırladık)
  const getThemeColor = () => {
    if (displayMode === 'morning') return 'text-blue-400';
    if (displayMode === 'afternoon') return 'text-purple-400';
    return 'text-green-400';
  };

  const getBgColor = () => {
    if (displayMode === 'morning') return 'bg-[#0a1025]';
    if (displayMode === 'afternoon') return 'bg-[#1a0a25]';
    return 'bg-[#0a2510]';
  };

  return (
    <div className="h-screen w-screen bg-[#050507] flex flex-col overflow-hidden text-white">
      <header className={`h-24 flex items-center justify-between px-10 border-b border-white/10 ${getBgColor()}`}>
        <div className="flex items-center gap-6">
          <GraduationCap size={44} className={getThemeColor()} />
          <div>
            <h1 className="text-4xl font-black uppercase">{activeData.name}</h1>
            <p className="text-white/40 text-sm font-bold uppercase">{activeData.motto}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <WeatherWidget /> <Clock />
        </div>
      </header>

      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        <aside className="w-80 flex flex-col gap-4">
          <div className="bg-[#0f0f14] rounded-[2.5rem] p-8 flex-1 border border-white/5 overflow-hidden">
            <div className="mb-6">
              <div className={`flex items-center gap-2 mb-1 ${getThemeColor()}`}>
                <UserCheck size={28} />
                <h2 className="text-xl font-black uppercase tracking-tighter">Nöbetçiler</h2>
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase">{currentDay}</div>
            </div>
            <div className="space-y-4">
              {activeData.dutyTeachers[currentDay]?.map((d, i) => (
                <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <div className={`text-[10px] font-black uppercase mb-1 ${getThemeColor()}`}>{d.sectionName}</div>
                  <div className="text-lg font-bold leading-tight">
                    {d.teachers ? d.teachers.split(',').map((name, idx) => (
                      <span key={idx} className="block">{name.trim()}</span>
                    )) : "Girilmedi"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 bg-[#09090c] rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center">
            <div className="text-[12rem] font-black tracking-tighter">--:--</div>
            <div className="text-4xl font-bold text-slate-500 uppercase tracking-[0.3em]">Mola / Beklemede</div>
        </section>
      </main>

      <button onClick={() => setIsSettingsOpen(true)} className="fixed bottom-10 right-10 bg-white/10 p-5 rounded-2xl border border-white/20 hover:scale-110 transition-all">
        <Settings size={36} />
      </button>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl bg-[#0d0d12] p-10 rounded-[3rem] border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase">Pano Ayarları</h2>
              <div className="flex gap-2">
                {['morning', 'afternoon', 'course'].map((m) => (
                  <button key={m} onClick={() => setActiveEditTab(m as any)} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeEditTab === m ? 'bg-blue-600' : 'bg-white/5'}`}>{m.toUpperCase()}</button>
                ))}
                <button onClick={() => setIsSettingsOpen(false)} className="ml-4 p-2 bg-red-500/20 rounded-full"><X /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500">KURUM ADI VE SAATLER</label>
                <input type="text" value={config[activeEditTab].name} onChange={e => setConfig({...config, [activeEditTab]: {...config[activeEditTab], name: e.target.value}})} className="w-full bg-black p-4 rounded-xl border border-white/10" />
                <div className="flex gap-4">
                  <input type="time" value={config[activeEditTab].startTime} onChange={e => setConfig({...config, [activeEditTab]: {...config[activeEditTab], startTime: e.target.value}})} className="w-full bg-black p-4 rounded-xl border border-white/10" />
                  <input type="time" value={config[activeEditTab].endTime} onChange={e => setConfig({...config, [activeEditTab]: {...config[activeEditTab], endTime: e.target.value}})} className="w-full bg-black p-4 rounded-xl border border-white/10" />
                </div>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-blue-400 mb-4 uppercase">Nöbetçi Bilgisi (Virgülle Ayırın)</p>
                {/* Nöbetçi düzenleme alanları buraya gelecek */}
                <p className="text-slate-500 text-sm italic">Bu bölümden nöbetçileri güncelleyebilirsiniz.</p>
              </div>
            </div>
            
            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-8 bg-blue-600 p-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3">
              <Save /> DEĞİŞİKLİKLERİ KAYDET
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;