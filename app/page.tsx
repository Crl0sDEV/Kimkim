"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

import StarLayer from "@/components/StarLayer";
import ReadingBox from "@/components/ReadingBox";
import InputForm from "@/components/InputForm";
import BackgroundLayer from "@/components/BackgroundLayer";

type Star = {
  id: string;
  content: string;
  pos_x: number;
  pos_y: number;
  likes: number;
  created_at: string;
};

function useMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

export default function Home() {
  const [stars, setStars] = useState<Star[]>([]);
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null);
  const [now, setNow] = useState(new Date());

  const mounted = useMounted();
  
  // LIVE CLOCK
  useEffect(() => {
    const timer = setInterval(() => {
        setNow(new Date());
    }, 60000); 
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const minute = now.getMinutes();
  const preciseHour = hour + (minute / 60); 

  const isNight = hour >= 18 || hour < 6;

  const handleUpdateStarLikes = (starId: string, newLikes: number) => {
    setStars((prev) => prev.map((s) => (s.id === starId ? { ...s, likes: newLikes } : s)));
    if (hoveredStar && hoveredStar.id === starId) {
      setHoveredStar({ ...hoveredStar, likes: newLikes });
    }
  };

  const refreshStars = async () => {
     if(isNight) {
        const { data } = await supabase.from('stars').select('*').order('created_at', { ascending: false }).limit(50);
        if(data) setStars(data);
     }
  }

  if (!mounted) return null;

  return (
    <main className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      
      <BackgroundLayer currentHour={preciseHour} />

      <StarLayer 
        isNight={isNight} 
        mounted={mounted} 
        stars={stars}
        setStars={setStars}
        onHoverStar={setHoveredStar} 
      />

      {/* NIGHT STATUS: Mas malalim na Filipino text */}
      {isNight && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1 } }} className="absolute bottom-10 right-10 z-50 text-right pointer-events-none">
          <div className="text-white/30 font-mono text-[10px] tracking-widest space-y-1 uppercase">
            <p>DIWA: NAKIKINIG</p>
            <p>Pakinggan ang mga lihim</p>
          </div>
        </motion.div>
      )}

      <ReadingBox 
        isNight={isNight} 
        hoveredStar={hoveredStar} 
        onUpdateStar={handleUpdateStarLikes} 
      />

      <div className="relative z-40 w-full max-w-md px-6 text-center pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          {/* MAIN TITLE */}
          <h1 className={`text-xl md:text-2xl tracking-[0.8em] font-bold flex items-center justify-center gap-3 transition-colors duration-1000 ${isNight ? "text-white/90" : "text-black/80"}`}>
            K I M K I M
          </h1>
          
          {/* TAGLINE: The emotional hook */}
          <p className={`mt-4 text-[10px] md:text-xs font-mono tracking-widest uppercase opacity-60 transition-colors duration-1000 ${isNight ? "text-white/50" : "text-black/50"}`}>
            {isNight ? "Ang mga salitang hindi masabi" : "Pakawalan ang iyong dinadala"}
          </p>
        </motion.div>

        <InputForm isNight={isNight} onSuccess={refreshStars} />
      </div>
    </main>
  );
}