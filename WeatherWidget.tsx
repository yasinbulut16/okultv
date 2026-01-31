
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const [temp, setTemp] = useState(22);
  const [condition, setCondition] = useState('Güneşli');

  useEffect(() => {
    // Simulate weather fetching
    const interval = setInterval(() => {
      setTemp(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white">
      <div className="bg-yellow-400 p-2 rounded-full text-yellow-900 shadow-lg shadow-yellow-500/20">
        <Sun size={28} />
      </div>
      <div>
        <div className="text-3xl font-bold flex items-center">
          {temp}°<span className="text-sm font-normal ml-1 text-blue-100">C</span>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-200">{condition}</div>
      </div>
    </div>
  );
};
