
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Settings, 
  UserCheck, 
  Cake, 
  X, 
  Save, 
  GraduationCap,
  CalendarDays,
  Timer,
  FileSpreadsheet,
  PartyPopper,
  Plus,
  Trash2,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { Clock } from './Clock'
import { WeatherWidget } from './WeatherWidget'
import { BoardConfig, SchoolData, LessonSlot, SpecialDay, Announcement, DutySection } from './types';

const App: React.FC = () => {
  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

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
    // 1. Önce hafızada kayıt var mı kontrol et
    const saved = localStorage.getItem('schoolBoardConfig');
    
    // 2. Varsa onu kullan, yoksa varsayılan boş ayarları getir
    if (saved) {
      return JSON.parse(saved);
    } else {
      return {
        morning: {
          name: "SABAH ANADOLU LİSESİ",
          motto: "Bilgi Aydınlıktır",
          slots: createInitialSlots(true),
          announcements: [],
          dutyTeachers: createEmptyDuty(),
          specialDays: [{ name: "Yasin Bulut", date: "01.02", type: "Doğum Günü" }]
        },
        afternoon: {
          name: "ÖĞLE ANADOLU LİSESİ",
          motto: "Gelecek Burada Başlar",
          slots: createInitialSlots(false),
          announcements: [],
          dutyTeachers: createEmptyDuty(),
          specialDays: []
        }
      };
    }
  });

  const [activeEditTab, setActiveEditTab] = useState<'morning' | 'afternoon'>('morning');
  const [selectedDutyDay, setSelectedDutyDay] = useState<string>("Pazartesi");
  const [bulkInput, setBulkInput] = useState("");
  const [isMorningMode, setIsMorningMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dutyScrollIndex, setDutyScrollIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  // Verileri tarayıcı hafızasına kaydetme (Otomatik çalışır)
  useEffect(() => {
    localStorage.setItem('schoolBoardConfig', JSON.stringify(config));
  }, [config]); // config her değiştiğinde (yeni isim eklendiğinde) kaydeder.

  // YENİ HALİ (Saate göre değişen)
useEffect(() => {
  const checkTime = () => {
    const now = new Date();
    const currentTimeStr = now.getHours() * 100 + now.getMinutes(); // Örn: 13:20 -> 1320
    
    // Saat 13:20'den (1320) küçükse SABAH modu (true), büyükse ÖĞLE modu (false)
    if (currentTimeStr < 1320) {
      setIsMorningMode(true);
    } else {
      setIsMorningMode(false);
    }
  };

  checkTime(); // İlk açılışta kontrol et
  const interval = setInterval(checkTime, 60000); // Her dakikada bir saati kontrol et
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDutyScrollIndex(prev => (prev + 1) % 5);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentDay = useMemo(() => 
    currentTime.toLocaleDateString('tr-TR', { weekday: 'long' }), 
  [currentTime]);

  const activeDisplayData = isMorningMode ? config.morning : config.afternoon;
  
  const lessonInfo = useMemo(() => {
    const nowStr = currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const [h, m, s] = nowStr.split(':').map(Number);
    const totalSecondsNow = h * 3600 + m * 60 + s;

    for (const slot of activeDisplayData.slots) {
      if (!slot.start || !slot.end) continue;
      const [sh, sm] = slot.start.split(':').map(Number).concat([0]);
      const [eh, em] = slot.end.split(':').map(Number).concat([0]);
      const startSec = sh * 3600 + sm * 60;
      const endSec = eh * 3600 + em * 60;

      if (totalSecondsNow >= startSec && totalSecondsNow <= endSec) {
        return { status: 'DERS DEVAM EDİYOR', label: slot.label, remaining: endSec - totalSecondsNow };
      }
    }

    for (let i = 0; i < activeDisplayData.slots.length - 1; i++) {
      const current = activeDisplayData.slots[i];
      const next = activeDisplayData.slots[i+1];
      if (!current.end || !next.start) continue;
      const [eh, em] = current.end.split(':').map(Number).concat([0]);
      const [sh, sm] = next.start.split(':').map(Number).concat([0]);
      const endSec = eh * 3600 + em * 60;
      const startSec = sh * 3600 + sm * 60;

      if (totalSecondsNow > endSec && totalSecondsNow < startSec) {
        return { status: 'TENEFFÜS / ARA', label: 'ZİLE KALAN', remaining: startSec - totalSecondsNow };
      }
    }

    return { status: 'EĞİTİM SAATLERİ DIŞI', label: '-', remaining: 0 };
  }, [currentTime, activeDisplayData]);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const todaysSpecial = useMemo(() => {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  
  // Olası tüm formatları hazırlıyoruz
  const bugun1 = `${d < 10 ? '0' : ''}${d}.${m < 10 ? '0' : ''}${m}`; // "01.02"
  const bugun2 = `${d}.${m}`; // "1.2"

  // Sabah ve Öğle listelerinin ikisini de birleştirip kontrol et
  const tumListe = [
    ...(config.morning.specialDays || []), 
    ...(config.afternoon.specialDays || [])
  ];
  
  return tumListe.filter(item => {
  const tarih = item.date.trim();
  // Bilgisayarın tarihinden gelen formatlar
  const eslesme = tarih === bugun1 || tarih === bugun2;
  // Manuel kontrol (Eğer bugun1-2 hatalıysa bile 01.02'yi yakalar)
  const manuelKontrol = tarih === "01.02" || tarih === "1.2";
  
  return eslesme || manuelKontrol;
});
}, [config.morning.specialDays, config.afternoon.specialDays, currentTime]);

  const handleBulkParse = (school: 'morning' | 'afternoon') => {
    const lines = bulkInput.split('\n');
    const newItems = lines.map(line => {
      const parts = line.split(';').map(s => s.trim());
      if (parts.length >= 2) {
        return { name: parts[0], date: parts[1], type: (parts[2] as any) || 'Doğum Günü' };
      }
      return null;
    }).filter(Boolean) as SpecialDay[];
    
    setConfig(prev => ({
      ...prev,
      [school]: { ...prev[school], specialDays: [...prev[school].specialDays, ...newItems] }
    }));
    setBulkInput("");
  };

  const updateSchoolField = (school: 'morning' | 'afternoon', field: keyof SchoolData, value: any) => {
    setConfig(prev => ({
      ...prev,
      [school]: { ...prev[school], [field]: value }
    }));
  };

  const currentDutyList = activeDisplayData.dutyTeachers[currentDay] || [];

  return (
    <div className="h-screen w-screen bg-[#050507] flex flex-col overflow-hidden text-white font-sans">
      
      {/* HEADER */}
      <header className={`h-24 transition-all duration-1000 flex items-center justify-between px-10 shadow-2xl relative z-20 border-b border-white/10 ${isMorningMode ? 'bg-[#0a1025]' : 'bg-[#1a0a25]'}`}>
        <div className="flex items-center gap-6">
          <div className={`p-3 rounded-2xl border transition-all duration-1000 ${isMorningMode ? 'bg-blue-600/20 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-purple-600/20 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]'}`}>
            <GraduationCap size={44} className={isMorningMode ? 'text-blue-400' : 'text-purple-400'} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight transition-all duration-1000 uppercase">
              {activeDisplayData.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
               <span className={`px-2 py-0.5 text-black text-[10px] font-black rounded uppercase transition-colors duration-1000 ${isMorningMode ? 'bg-blue-400' : 'bg-purple-400'}`}>
                 {isMorningMode ? "SABAH OKULU" : "ÖĞLE OKULU"}
               </span>
               <p className="text-white/40 text-sm font-bold tracking-[0.2em] uppercase">{activeDisplayData.motto}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <WeatherWidget />
          <Clock />
        </div>
      </header>

      {/* ANA GÖVDE */}
      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        
        {/* SOL: Nöbetçi Öğretmenler (Kayar) */}
        <aside className="w-80 flex flex-col gap-4">
          <div className="bg-[#0f0f14] rounded-[2.5rem] p-8 flex-1 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-1000 ${isMorningMode ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]' : 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)]'}`}></div>
            
            <div className="mb-6">
              <div className={`flex items-center gap-2 mb-1 transition-colors duration-1000 ${isMorningMode ? 'text-blue-400' : 'text-purple-400'}`}>
                <UserCheck size={28} />
                <h2 className="text-xl font-black uppercase tracking-tighter">Nöbetçi Öğretmenler</h2>
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                <CalendarDays size={14} /> {currentDay}
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <div 
                className="transition-all duration-1000 ease-in-out space-y-4"
                style={{ transform: `translateY(-${dutyScrollIndex * 110}px)` }}
              >
                {currentDutyList.map((d, i) => (
                  <div key={i} className={`h-[100px] p-6 rounded-3xl border transition-all flex flex-col justify-center ${
                    dutyScrollIndex === i ? 'bg-white/10 border-white/20 scale-[1.02] shadow-lg' : 'bg-white/5 border-transparent opacity-30'
                  }`}>
                    <div className={`text-[10px] font-black uppercase mb-1 ${isMorningMode ? 'text-blue-400' : 'text-purple-400'}`}>{d.sectionName}</div>
                    <div className="text-lg font-bold leading-tight line-clamp-2">{d.teachers || "Girilmedi"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ORTA: Dev Saat Sistemi */}
        <section className="flex-1 flex flex-col">
          <div className="flex-1 bg-[#09090c] rounded-[3.5rem] p-12 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none transition-all duration-1000 ${isMorningMode ? 'bg-blue-600/10' : 'bg-purple-600/10'}`}></div>

            <div className="z-10 w-full">
              <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10 mb-6">
                <Timer className={isMorningMode ? 'text-blue-400' : 'text-purple-400'} size={24} />
                <span className="text-xl font-black tracking-widest uppercase">{lessonInfo.status}</span>
              </div>

              <div className="text-[15rem] leading-none font-black tabular-nums tracking-tighter text-white drop-shadow-[0_20px_50px_rgba(0,0,0,1)]">
                {lessonInfo.status === 'EĞİTİM SAATLERİ DIŞI' ? '--:--' : formatCountdown(lessonInfo.remaining)}
              </div>

              <div className="mt-8 text-5xl font-bold text-slate-400 uppercase tracking-[0.5em]">
                {lessonInfo.label}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ALT BANT */}
      <footer className="h-20 bg-black flex items-center overflow-hidden border-t border-white/10 relative z-30">
        <div className={`h-full flex items-center px-10 z-10 shadow-2xl relative transition-all duration-1000 ${isMorningMode ? 'bg-blue-700' : 'bg-purple-700'}`}>
          <span className="text-2xl font-black uppercase italic text-white tracking-tighter">BİLGİ AKIŞI</span>
        </div>
        <div className="flex-1 whitespace-nowrap overflow-hidden flex items-center h-full bg-[#030305]">
          <div className="animate-marquee inline-flex items-center text-2xl font-medium">
            {todaysSpecial.map((s, i) => (
              <span key={`s-${i}`} className={`mx-16 flex items-center gap-5 font-black ${s.type === 'Doğum Günü' ? 'text-yellow-400' : 'text-green-400'}`}>
                {s.type === 'Doğum Günü' ? <Cake size={36} /> : <PartyPopper size={36} />}
                {s.name.toUpperCase()} - {s.type === 'Doğum Günü' ? 'İYİ Kİ DOĞDUN! 🎉' : 'KUTLU OLSUN! 🇹🇷'}
              </span>
            ))}
            {activeDisplayData.announcements.map(ann => (
               <span key={ann.id} className="mx-16 flex items-center gap-5 text-slate-100 uppercase font-black tracking-tight">
                 <Bell size={32} className={isMorningMode ? 'text-blue-400' : 'text-purple-400'} />
                 {ann.text}
               </span>
            ))}
          </div>
        </div>
      </footer>

      {/* AYARLAR BUTONU */}
      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-28 right-10 bg-white/5 backdrop-blur-xl p-5 rounded-2xl shadow-2xl hover:bg-white/10 transition-all z-50 border border-white/10 group active:scale-90"
      >
        <Settings size={36} className="group-hover:rotate-90 transition-transform duration-500 text-white/50 group-hover:text-white" />
      </button>

      {/* YÖNETİM PANELİ */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
          <div className="w-full h-full max-w-7xl bg-[#0d0d12] rounded-[3rem] border border-white/10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex flex-col md:flex-row justify-between items-center p-8 border-b border-white/5 bg-white/2 gap-6">
              <div className="flex items-center gap-4">
                <Settings size={40} className="text-blue-500" />
                <h2 className="text-4xl font-black uppercase tracking-tighter">PANO YÖNETİM MERKEZİ</h2>
              </div>
              <div className="flex bg-black p-1.5 rounded-[1.5rem] border border-white/5 shadow-inner">
                <button 
                  onClick={() => setActiveEditTab('morning')}
                  className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-black text-sm transition-all ${activeEditTab === 'morning' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <Sun size={20} /> SABAH OKULU AYARLARI
                </button>
                <button 
                  onClick={() => setActiveEditTab('afternoon')}
                  className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-black text-sm transition-all ${activeEditTab === 'afternoon' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <Moon size={20} /> ÖĞLE OKULU AYARLARI
                </button>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-4 bg-white/5 rounded-full hover:bg-red-500/20 group transition-colors"><X size={32} className="group-hover:text-red-500" /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  
                  {/* SOL KOLON: Kurumsal Bilgiler, Saatler, Duyurular */}
                  <div className="space-y-8">
                    <section className="bg-white/2 p-8 rounded-[2rem] border border-white/5 space-y-4">
                      <div className="flex items-center gap-3 mb-2 text-blue-400 font-black uppercase text-sm tracking-widest">
                        <Info size={18}/> Temel Kurumsal Bilgiler
                      </div>
                      <input 
                        type="text" 
                        value={config[activeEditTab].name} 
                        onChange={e => updateSchoolField(activeEditTab, 'name', e.target.value)}
                        className="w-full bg-black/60 p-5 rounded-2xl border border-white/10 outline-none focus:border-blue-500 font-black text-xl"
                        placeholder="Okul Adı"
                      />
                      <input 
                        type="text" 
                        value={config[activeEditTab].motto} 
                        onChange={e => updateSchoolField(activeEditTab, 'motto', e.target.value)}
                        className="w-full bg-black/40 p-5 rounded-2xl border border-white/5 outline-none focus:border-blue-500 text-slate-400"
                        placeholder="Okul Sloganı"
                      />
                    </section>

                    <section className="bg-white/2 p-8 rounded-[2rem] border border-white/5">
                      <h3 className="text-sm font-black text-blue-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                        <Timer size={18}/> Ders & Teneffüs Saatleri
                      </h3>
                      <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {config[activeEditTab].slots.map((s, idx) => (
                          <div key={idx} className="flex gap-4 items-center bg-black/40 p-3 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                            <span className="w-16 text-[10px] font-black text-slate-600 uppercase">{s.label}</span>
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <input type="time" value={s.start} onChange={e => {
                                const newSlots = [...config[activeEditTab].slots];
                                newSlots[idx].start = e.target.value;
                                updateSchoolField(activeEditTab, 'slots', newSlots);
                              }} className="w-full bg-black text-sm p-2 rounded-lg border border-white/5 text-white outline-none focus:border-blue-500" />
                              <input type="time" value={s.end} onChange={e => {
                                const newSlots = [...config[activeEditTab].slots];
                                newSlots[idx].end = e.target.value;
                                updateSchoolField(activeEditTab, 'slots', newSlots);
                              }} className="w-full bg-black text-sm p-2 rounded-lg border border-white/5 text-white outline-none focus:border-blue-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-white/2 p-8 rounded-[2rem] border border-white/5">
                      <h3 className="text-sm font-black text-blue-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                        <Bell size={18}/> Duyurular
                      </h3>
                      <div className="space-y-4">
                        {config[activeEditTab].announcements.map((ann, idx) => (
                          <div key={idx} className="flex gap-3 group">
                            <input 
                              value={ann.text} 
                              onChange={e => {
                                const newAnn = [...config[activeEditTab].announcements];
                                newAnn[idx].text = e.target.value;
                                updateSchoolField(activeEditTab, 'announcements', newAnn);
                              }}
                              className="flex-1 bg-black/40 p-4 rounded-2xl border border-white/5 text-sm outline-none focus:border-blue-500"
                            />
                            <button 
                              onClick={() => {
                                const newAnn = config[activeEditTab].announcements.filter((_, i) => i !== idx);
                                updateSchoolField(activeEditTab, 'announcements', newAnn);
                              }}
                              className="p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                            ><Trash2 size={20}/></button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newAnn = [...config[activeEditTab].announcements, { id: Date.now().toString(), text: "" }];
                            updateSchoolField(activeEditTab, 'announcements', newAnn);
                          }}
                          className="w-full p-4 border-2 border-dashed border-white/5 rounded-2xl text-xs font-black text-slate-600 hover:text-blue-500 hover:border-blue-500/50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={16}/> DUYURU EKLE
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* SAĞ KOLON: Nöbetçiler ve Özel Günler (Okula Özel) */}
                  <div className="space-y-8">
                    {/* Nöbetçi Çizelgesi */}
                    <section className="bg-white/2 p-8 rounded-[2rem] border border-white/5">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                          <UserCheck size={18}/> NÖBET ÇİZELGESİ
                        </h3>
                        <div className="flex bg-black p-1 rounded-xl border border-white/5 scale-90">
                          {days.map(day => (
                            <button 
                              key={day}
                              onClick={() => setSelectedDutyDay(day)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedDutyDay === day ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                            >
                              {day.substring(0,3)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {config[activeEditTab].dutyTeachers[selectedDutyDay]?.map((d, i) => (
                          <div key={i} className="bg-black/40 p-4 rounded-2xl border border-white/5 grid grid-cols-2 gap-3">
                            <input 
                              value={d.sectionName} 
                              onChange={e => {
                                const newList = { ...config[activeEditTab].dutyTeachers };
                                newList[selectedDutyDay][i].sectionName = e.target.value;
                                updateSchoolField(activeEditTab, 'dutyTeachers', newList);
                              }}
                              className="w-full bg-black/60 p-2 rounded-xl border border-white/5 text-xs font-bold" 
                            />
                            <input 
                              value={d.teachers} 
                              onChange={e => {
                                const newList = { ...config[activeEditTab].dutyTeachers };
                                newList[selectedDutyDay][i].teachers = e.target.value;
                                updateSchoolField(activeEditTab, 'dutyTeachers', newList);
                              }}
                              placeholder="Öğretmenler"
                              className="w-full bg-black/60 p-2 rounded-xl border border-white/5 text-xs" 
                            />
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Özel Günler (Toplu Giriş ve Liste) */}
                    <section className="bg-white/2 p-8 rounded-[2rem] border border-white/5">
                      <h3 className="text-sm font-black text-blue-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                        <Cake size={18}/> ÖZEL GÜNLER & DOĞUM GÜNLERİ
                      </h3>
                      
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 mb-4">
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase">Toplu Veri Aktarımı (İsim;GG.AA)</label>
                        <textarea 
                          value={bulkInput}
                          onChange={e => setBulkInput(e.target.value)}
                          className="w-full h-24 bg-black p-3 rounded-xl border border-white/10 outline-none text-xs font-mono mb-3"
                          placeholder="Ahmet Yılmaz;12.05"
                        />
                        <button 
                          onClick={() => handleBulkParse(activeEditTab)}
                          className="w-full py-3 bg-blue-600 rounded-xl font-black text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={14}/> LİSTEYE EKLE
                        </button>
                      </div>

                      <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                        {config[activeEditTab].specialDays.map((d, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/60 p-3 rounded-xl border border-white/5">
                            <div>
                              <div className="font-bold text-xs">{d.name}</div>
                              <div className="text-[8px] text-slate-500 uppercase">{d.type}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-blue-400 font-mono font-black text-sm">{d.date}</span>
                              <button onClick={() => {
                                const newList = config[activeEditTab].specialDays.filter((_, idx) => idx !== i);
                                updateSchoolField(activeEditTab, 'specialDays', newList);
                              }} className="text-slate-700 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-center">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-24 py-6 bg-blue-600 rounded-[2rem] text-3xl font-black flex items-center gap-6 hover:bg-blue-500 shadow-[0_20px_60px_rgba(59,130,246,0.3)] transition-all active:scale-95"
              >
                <Save size={40} /> AYARLARI KAYDET VE KAPAT
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.2); }
      `}</style>
    {/* CSS AYARLARI - BURAYI KOPYALAYIP EN ALTA YAPIŞTIRIN */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .animate-marquee {
          display: inline-flex;
          white-space: nowrap;
          animation: marquee 25s linear infinite; /* HIZI BURADAN AYARLAYABİLİRSİNİZ (25s) */
          min-width: 100%;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.1); 
          border-radius: 10px; 
        }
      `}</style>

    </div>
  );
};

export default App;
