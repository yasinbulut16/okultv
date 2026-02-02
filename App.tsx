import React, { useState, useEffect } from 'react';
import { Settings, UserCheck, X, GraduationCap } from 'lucide-react';

import { Clock } from './Clock';
import { WeatherWidget } from './WeatherWidget';
import { BoardConfig, SchoolData, DutySection } from './types';

const App: React.FC = () => {
  const days = [
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar'
  ];

  /* ---------------- HELPERS ---------------- */

  const createEmptyDuty = () => {
    const duty: Record<string, DutySection[]> = {};
    days.forEach(day => {
      duty[day] = Array.from({ length: 5 }, (_, i) => ({
        sectionName: `${i + 1}. Kat`,
        teachers: ''
      }));
    });
    return duty;
  };

  const baseSchool = (
    name: string,
    motto: string,
    startTime: string,
    endTime: string
  ): SchoolData => ({
    name,
    motto,
    startTime,
    endTime,
    slots: [],
    announcements: [],
    dutyTeachers: createEmptyDuty(),
    specialDays: []
  });

  /* ---------------- STATE ---------------- */

  const [config, setConfig] = useState<BoardConfig>(() => {
    const saved = localStorage.getItem('schoolBoardConfig');
    if (saved) return JSON.parse(saved);

    return {
      morning: baseSchool('SABAH OKULU', 'Bilgi Aydınlıktır', '07:00', '13:20'),
      afternoon: baseSchool('ÖĞLE OKULU', 'Gelecek Burada Başlar', '13:21', '19:00'),
      course: baseSchool('KURS MERKEZİ', 'Başarıya Odaklan', '08:00', '17:00')
    };
  });

  const [displayMode, setDisplayMode] =
    useState<'morning' | 'afternoon' | 'course'>('morning');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  /* ---------------- TIME ---------------- */

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const checkMode = () => {
      const now = new Date();
      const day = now.toLocaleDateString('tr-TR', { weekday: 'long' });
      const time = now.getHours() * 100 + now.getMinutes();

      if (day === 'Cumartesi' || day === 'Pazar') {
        setDisplayMode('course');
        return;
      }

      const mS = Number(config.morning.startTime.replace(':', ''));
      const mE = Number(config.morning.endTime.replace(':', ''));
      const aS = Number(config.afternoon.startTime.replace(':', ''));
      const aE = Number(config.afternoon.endTime.replace(':', ''));

      if (time >= mS && time <= mE) setDisplayMode('morning');
      else if (time >= aS && time <= aE) setDisplayMode('afternoon');
      else setDisplayMode('course');
    };

    checkMode();
    const i = setInterval(checkMode, 60000);
    return () => clearInterval(i);
  }, [config]);

  /* ---------------- THEME ---------------- */

  const themeColor =
    displayMode === 'morning'
      ? 'text-blue-400'
      : displayMode === 'afternoon'
      ? 'text-purple-400'
      : 'text-green-400';

  const headerBg =
    displayMode === 'morning'
      ? 'bg-[#0a1025]'
      : displayMode === 'afternoon'
      ? 'bg-[#1a0a25]'
      : 'bg-[#0a2510]';

  /* ---------------- DATA ---------------- */

  const currentDay = currentTime.toLocaleDateString('tr-TR', { weekday: 'long' });
  const activeData = config[displayMode];

  /* ---------------- UI ---------------- */

  return (
    <div className="h-screen w-screen bg-[#050507] flex flex-col text-white overflow-hidden">

      {/* HEADER */}
      <header className={`h-24 px-10 flex items-center justify-between border-b border-white/10 ${headerBg}`}>
        <div className="flex items-center gap-6">
          <GraduationCap size={44} className={themeColor} />
          <div>
            <h1 className="text-4xl font-black uppercase">{activeData.name}</h1>
            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">
              {activeData.motto}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <WeatherWidget />
          <Clock />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex gap-6 p-6 overflow-hidden">

        {/* DUTY */}
        <aside className="w-80">
          <div className="h-full bg-[#0f0f14] rounded-[2.5rem] p-8 border border-white/5 flex flex-col">
            <div className="mb-6">
              <div className={`flex items-center gap-2 ${themeColor}`}>
                <UserCheck size={28} />
                <h2 className="text-xl font-black uppercase">Nöbetçiler</h2>
              </div>
              <div className="text-sm text-slate-500 font-bold uppercase">
                {currentDay}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {activeData.dutyTeachers[currentDay]?.map((d, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className={`text-[10px] font-black uppercase mb-1 ${themeColor}`}>
                    {d.sectionName}
                  </div>
                  <div className="text-lg font-bold">
                    {d.teachers
                      ? d.teachers.split(',').map((t, idx) => (
                          <span key={idx} className="block">{t.trim()}</span>
                        ))
                      : 'Girilmedi'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <section className="flex-1 bg-[#09090c] rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center">
          <div className="text-[12rem] font-black">--:--</div>
          <div className="text-4xl font-bold text-slate-500 uppercase tracking-widest">
            Eğitim Saatleri Dışı
          </div>
        </section>
      </main>

      {/* SETTINGS */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-10 right-10 bg-white/10 p-5 rounded-2xl border border-white/20 hover:scale-110 transition-all z-50"
      >
        <Settings size={36} />
      </button>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6">
          <div className="w-full max-w-4xl bg-[#0d0d12] p-10 rounded-[3rem] border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase">Pano Yönetimi</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white"
              >
                <X />
              </button>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('schoolBoardConfig', JSON.stringify(config));
                setIsSettingsOpen(false);
              }}
              className="w-full mt-6 bg-blue-600 p-6 rounded-2xl font-black text-xl hover:bg-blue-500"
            >
              DEĞİŞİKLİKLERİ KAYDET
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
