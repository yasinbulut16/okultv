import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, Settings, UserCheck, Cake, X, Save, GraduationCap,
  CalendarDays, Timer, PartyPopper, Plus, Trash2, Sun, Moon, Info, School
} from 'lucide-react';
import { Clock } from './Clock';
import { WeatherWidget } from './WeatherWidget';
import { BoardConfig, SchoolData, LessonSlot, SpecialDay, DutySection } from './types';

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
    const baseSchool = (name: string, motto: string, start: string, end: string, isMorning: boolean): SchoolData => ({
      name, motto, startTime: start, endTime: end, slots: createInitialSlots(isMorning),
      announcements: [], dutyTeachers: createEmptyDuty(), specialDays: []
    });
    return {
      morning: baseSchool("SABAH OKULU", "Bilgi Aydınlıktır", "07:00", "13:20", true),
      afternoon: baseSchool("ÖĞLE OKULU", "Gelecek Burada Başlar", "13:21", "19:00", false),
      course: baseSchool("KURS MERKEZİ", "Başarıya Odaklan", "08:00", "17:00", true)
    };
  });

  const [activeEditTab, setActiveEditTab] = useState<'morning' | 'afternoon' | 'course'>('morning');
  const [selectedDutyDay, setSelectedDutyDay] = useState<string>("Pazartesi");
  const [displayMode, setDisplayMode] = useState<'morning' | 'afternoon' | 'course'>('morning');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dutyScrollIndex, setDutyScrollIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('schoolBoardConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentDayName = now.toLocaleDateString('tr-TR', { weekday: 'long' });
      const timeNum = now.getHours() * 100 + now.getMinutes();
      if (currentDayName === "Cumartesi" || currentDayName === "Pazar") {
        setDisplayMode('course'); return;
      }
      const mS = parseInt(config.morning.startTime.replace(':', ''));
      const mE = parseInt(config.morning.endTime.replace(':', ''));
      const aS = parseInt(config.afternoon.startTime.replace(':', ''));
      const aE = parseInt(config.afternoon.endTime.replace(':', ''));
      if (timeNum >= mS && timeNum <= mE) setDisplayMode('morning');
      else if (timeNum >= aS && timeNum <= aE) setDisplayMode('afternoon');
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [config]);

  useEffect(() => {
    const interval = setInterval(() => setDutyScrollIndex(prev => (prev + 1) % 5), 6000);
    return () => clearInterval(interval);
  }, []);

  const currentDay = useMemo(() => currentTime.toLocaleDateString('tr-TR', { weekday: 'long' }), [currentTime]);
  const activeDisplayData = config[displayMode];
  
  const lessonInfo = useMemo(() => {
    const nowStr = currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const [h, m, s] = nowStr.split(':').map(Number);
    const totalSec = h * 3600 + m * 60 + s;
    for (const slot of activeDisplayData.slots) {
      const [sh, sm] = slot.start.split(':').map(Number);
      const [eh, em] = slot.end.split(':').map(Number);
      const sS = sh * 3600 + sm * 60; const eS = eh * 3600 + em * 60;
      if (totalSec >= sS && totalSec <= eS) return { status: 'DERS DEVAM EDİYOR', label: slot.label, remaining: eS - totalSec };
    }
    return { status: 'EĞİTİM SAATLERİ DIŞI', label: '-', remaining: 0 };
  }, [currentTime, activeDisplayData]);

  const updateSchoolField = (school: 'morning' | 'afternoon' | 'course', field: keyof SchoolData, value: any) => {
    setConfig(prev => ({ ...prev, [school]: { ...prev[school], [field]: value } }));
  };

  return (
    <div className="h-screen w-screen bg-[#050507] flex flex-col overflow-hidden text-white">
      <header className={`h-24 flex items-center justify-between px-10 border-b border-white/10 ${displayMode === 'morning' ? 'bg-[#0a1025]' : displayMode === 'afternoon' ? 'bg-[#1a0a25]' : 'bg-[#0a2510]'}`}>
        <div className="flex items-center gap-6">
          <GraduationCap size={44} className="text-blue-400" />
          <div>
            <h1 className="text-4xl font-black uppercase">{activeDisplayData.name}</h1>
            <p className="text-white/40 text-sm font-bold uppercase">{activeDisplayData.motto}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <WeatherWidget /> <Clock />
        </div>
      </header>

      <main className="flex-1 flex p-6 gap-6">
        <aside className="w-80 flex flex-col gap-4">
          <div className="bg-[#0f0f14] rounded-[2.5rem] p-8 flex-1 border border-white/5 relative overflow-hidden">
            <div className="mb-6">
              <div className={`flex items-center gap-2 mb-1 ${displayMode === 'morning' ? 'text-blue-400' : displayMode === 'afternoon' ? 'text-purple-400' : 'text-green-400'}`}>
                <UserCheck size={28} />
                <h2 className="text-xl font-black uppercase">Nöbetçiler</h2>
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase">{currentDay}</div>
            </div>
            <div className="space-y-4">
              {activeDisplayData.dutyTeachers[currentDay]?.map((d, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black uppercase text-blue-400">{d.sectionName}</div>
                  <div className="text-lg font-bold">{d.teachers || "Girilmedi"}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 bg-[#09090c] rounded-[3.5rem] p-12 border border-white/5 flex flex-col items-center justify-center">
            <div className="text-[15rem] leading-none font-black">{lessonInfo.status === 'EĞİTİM SAATLERİ DIŞI' ? '--:--' : Math.floor(lessonInfo.remaining/60)}</div>
            <div className="mt-8 text-5xl font-bold text-slate-400 uppercase tracking-widest">{lessonInfo.status}</div>
        </section>
      </main>

      <button onClick={() => setIsSettingsOpen(true)} className="fixed bottom-10 right-10 bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
        <Settings size={36} className="text-white/50" />
      </button>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-[#0d0d12] p-10 rounded-[3rem] border border-white/10">
            <div className="flex justify-between mb-10">
              <h2 className="text-3xl font-black">AYARLAR</h2>
              <button onClick={() => setIsSettingsOpen(false)}><X size={40} /></button>
            </div>
            <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                    <input type="text" value={config[activeEditTab].name} onChange={e => updateSchoolField(activeEditTab, 'name', e.target.value)} className="w-full bg-black p-4 rounded-xl border border-white/10" placeholder="Okul Adı" />
                    <div className="flex gap-4">
                        <input type="time" value={config[activeEditTab].startTime} onChange={e => updateSchoolField(activeEditTab, 'startTime', e.target.value)} className="w-full bg-black p-4 rounded-xl" />
                        <input type="time" value={config[activeEditTab].endTime} onChange={e => updateSchoolField(activeEditTab, 'endTime', e.target.value)} className="w-full bg-black p-4 rounded-xl" />
                    </div>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-blue-600 p-6 rounded-2xl font-black text-2xl">KAYDET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;