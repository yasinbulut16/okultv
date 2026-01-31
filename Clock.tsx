
import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end justify-center">
      <div className="text-5xl font-black text-white tracking-tighter">
        {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-lg font-medium text-blue-100 uppercase tracking-widest">
        {time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  );
};
