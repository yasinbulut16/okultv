
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer, CloudLightning } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const [temp, setTemp] = useState<number | null>(null);
  const [condition, setCondition] = useState<string>('Yükleniyor...');
  const [icon, setIcon] = useState<React.ReactNode>(<Sun size={28} />);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Bursa için ücretsiz hava durumu verisi çeker
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=40.1885&longitude=29.0610&current_weather=true`
        );
        const data = await response.json();
        const weather = data.current_weather;

        setTemp(Math.round(weather.temperature));
        
        // Hava durumu koduna göre metin ve ikon belirler
        if (weather.weathercode === 0) {
          setCondition('Açık');
          setIcon(<Sun size={28} />);
        } else if (weather.weathercode <= 3) {
          setCondition('Parçalı Bulutlu');
          setIcon(<Cloud size={28} />);
        } else {
          setCondition('Yağmurlu');
          setIcon(<CloudRain size={28} />);
        }
      } catch (error) {
        console.error("Hava durumu çekilemedi", error);
        setCondition('Hata');
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10 dakikada bir güncelle
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white">
      <div className="bg-yellow-400 p-2 rounded-full text-yellow-900 shadow-lg shadow-yellow-500/20">
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold flex items-center">
          {temp !== null ? temp : '--'}<span className="text-sm font-normal ml-1 text-blue-100">°C</span>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-200">{condition}</div>
      </div>
    </div>
  );
};
