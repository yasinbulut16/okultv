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
  PartyPopper,
  Plus,
  Trash2,
  Sun,
  Moon,
  Info,
  School
} from 'lucide-react';
import { Clock } from './Clock';
import { WeatherWidget } from './WeatherWidget';
import { BoardConfig, SchoolData, LessonSlot, SpecialDay, DutySection } from './types';

const App: React.FC = () => {
  // Hafta sonu günleri eklendi
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
    if (saved) {
      return JSON.parse(saved);
    } else {
      const baseSchool = (name: string, motto: string, start: string, end: string, isMorning: boolean): SchoolData => ({
        name,
        motto,
        startTime: start,
        endTime: end,
        slots: createInitialSlots(isMorning),
        announcements: [],
        dutyTeachers: createEmptyDuty(),
        specialDays: []
      });

      return {
        morning: baseSchool("SABAH ANADOLU LİSESİ", "Bilgi Aydınlıktır", "07:00", "13:20", true),
        afternoon: baseSchool("ÖĞLE ANADOLU LİSESİ", "Gelecek Burada Başlar", "13:21", "19:00", false),
        course: baseSchool("KURS MERKEZİ", "Hafta Sonu Kurs Programı", "08:00", "17:00", true)
      };
    }
  });

  const [activeEditTab, setActiveEditTab] = useState<'morning' | 'afternoon' | 'course'>('morning');
  const [selectedDutyDay, setSelectedDutyDay] = useState<string>("Pazartesi");
  const [bulkInput, setBulkInput] = useState("");
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

  // AKILLI MOD SEÇİCİ (Saat ve Gün Kontrolü)
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentDayName = now.toLocaleDateString('tr-TR', { weekday: 'long' });
      const currentTimeNum = now.getHours() * 100 + now.getMinutes();

      // 1. Hafta sonu kontrolü
      if (currentDayName === "Cumartesi" || currentDayName === "Pazar") {
        setDisplayMode('course');
        return;
      }

      // 2. Hafta içi saat aralığı kontrolü
      const morningStart = parseInt(config.morning.startTime.replace(':', ''));
      const morningEnd = parseInt(config.morning.endTime.replace(':', ''));
      const afternoonStart = parseInt(config.afternoon.startTime.replace(':', ''));
      const afternoonEnd = parseInt(config.afternoon.endTime.replace(':', ''));

      if (currentTimeNum >= morningStart && currentTimeNum <= morningEnd) {
        setDisplayMode('morning');
      } else if (currentTimeNum >= afternoonStart && currentTimeNum <= afternoonEnd) {
        setDisplayMode('afternoon');
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [config]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDutyScrollIndex(prev => (prev + 1) % 5);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentDay = useMemo(() => 
    currentTime.toLocaleDateString('tr-TR', { weekday: 'long' }), 
  [currentTime]);

  const activeDisplayData = config[displayMode];
  
  const lessonInfo = useMemo(() => {
    const nowStr = currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const [h, m, s] = nowStr.split(':').map(Number);
    const totalSecondsNow = h * 3600 + m * 60 + s;

    for (const slot of activeDisplayData.slots) {
      if (!slot.start || !slot.end) continue;
      const [sh, sm] = slot.start.split(':').map(Number);
      const [eh, em] = slot.end.split(':').map(Number);
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
      const [eh, em] = current.end.split(':').map(Number);
      const [sh, sm] = next.start.split(':').map(Number);
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
    const bugun = `${d < 10 ? '0' : ''}${d}.${m < 10 ? '0' : ''}${m}`;
    const tumListe = [...config.morning.specialDays, ...config.afternoon.specialDays, ...config.course.specialDays];
    return tumListe.filter(item => item.date.trim() === bugun);
  }, [config, currentTime]);

  const updateSchoolField = (school: 'morning' | 'afternoon' | 'course', field: keyof SchoolData, value: any) => {
    setConfig(prev => ({
      ...prev,
      [school]: { ...prev[school], [field]: value }
    }));
  };

  const currentDutyList = activeDisplayData.dutyTeachers[currentDay] || [];

  return (
    <div className="h-screen w-screen bg-[#050507] flex flex-col overflow-hidden text-white font-sans">
      
      {/* HEADER */}
      <header className={`h-24 transition-all duration-1000 flex items-center justify-between px-10 shadow-2xl relative z-20 border-b border-white/10 ${displayMode === 'morning' ? 'bg-[#0a1025]' : displayMode === 'afternoon' ? 'bg-[#1a0a25]' : 'bg-[#0a2510]'}`}>
        <div className="flex items-center gap-6">
          <div className={`p-3 rounded-2xl border transition-all duration-1000 ${displayMode === 'morning' ? 'bg-blue-600/20 border-blue-500/30' : displayMode === 'afternoon' ? 'bg-purple-600/20 border-purple-500/30' : 'bg-green-600/20 border-green-500/30'}`}>
            <GraduationCap size={44} className={displayMode === 'morning' ? 'text-blue-400' : displayMode === 'afternoon' ? 'text-purple-400' : 'text-green-400'} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase">{activeDisplayData.name}</h1>
            <div className="flex items-center gap-3 mt-1">
               <span className={`px-2 py-0.5 text-black text-[10px] font-black rounded uppercase ${displayMode === 'morning' ? 'bg-blue-400' : displayMode === 'afternoon' ? 'bg-purple-400' : 'bg-green-400'}`}>
                 {displayMode === 'morning' ? "SABAH OKULU" : displayMode === 'afternoon' ? "ÖĞLE OKULU" : "KURS MERKEZİ"}
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
        
        {/* SOL: Nöbetçi Öğretmenler (Alt Alta Liste Desteği) */}
        <aside className="w-80 flex flex-col gap-4">
          <div className="bg-[#0f0f14] rounded-[2.5rem] p-8 flex-1 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${displayMode === 'morning' ? 'bg-blue-500' : displayMode === 'afternoon' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            
            // App.tsx dosyasındaki 218-223 arası satırlar şuna benzemeli:
<div className="mb-6">
  <div className={`flex items-center gap-2 mb-1 ${displayMode === 'morning' ? 'text-blue-400' : displayMode === 'afternoon' ? 'text-purple-400' : 'text-green-400'}`}>
    <UserCheck size={28} />
    <h2 className="text-xl font-black uppercase tracking-tighter">Nöbetçi Öğretmenler</h2>
  </div>