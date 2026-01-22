"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface BackgroundLayerProps {
  currentHour: number; // Tumatanggap na tayo ng exact hour (0-23)
}

export default function BackgroundLayer({ currentHour }: BackgroundLayerProps) {
  
  // 1. Calculate Rotation based on Time
  // 12 PM (Noon) = 0 degrees (Nasa Tuktok ang Araw)
  // 6 PM = 90 degrees (Nasa Right/Horizon ang Araw)
  // 12 AM (Midnight) = 180 degrees (Nasa Tuktok ang Buwan)
  // 6 AM = 270 degrees (-90) (Nasa Left/Horizon ang Araw)
  const rotation = (currentHour - 12) * 15;

  // 2. Sky Color Transition (Gradient para mas smooth)
  // Kukuha tayo ng color base sa oras
  const isNight = currentHour >= 18 || currentHour < 6;
  const skyColor = isNight ? "#020617" : "#38bdf8"; // Slate-950 (Night) vs Sky-400 (Day)

  return (
    <motion.div
      className="absolute inset-0 z-0 overflow-hidden"
      animate={{ backgroundColor: skyColor }}
      transition={{ duration: 2 }} // Smooth color change
    >
      {/* THE CELESTIAL WHEEL */}
      <motion.div
        // ADJUSTMENT: Tinaas ko yung 'bottom' value para lumitaw sa screen yung Sun/Moon
        // Dati kasi baka sobrang baba kaya natatago.
        className="absolute left-1/2 bottom-[-80vh] w-[180vh] h-[180vh] -translate-x-1/2 flex justify-center items-center rounded-full border border-white/5"
        animate={{ rotate: rotation }}
        transition={{ 
            type: "spring", 
            stiffness: 20, 
            damping: 15 
        }}
        style={{ transformOrigin: "center center" }}
      >
        {/* --- SUN (Top of Wheel) --- */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             {/* Counter-rotate para laging upright ang icon kahit umiikot ang wheel */}
            <motion.div animate={{ rotate: -rotation }} transition={{ type: "spring" }}>
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-[80px] opacity-60 rounded-full scale-150"></div>
                    <Sun size={100} className="text-yellow-300 fill-yellow-400 drop-shadow-2xl" />
                </div>
            </motion.div>
        </div>

        {/* --- MOON (Bottom of Wheel) --- */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
             {/* Counter-rotate din para upright */}
             <motion.div animate={{ rotate: -rotation }} transition={{ type: "spring" }}>
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 blur-[60px] opacity-30 rounded-full scale-150"></div>
                    <Moon size={80} className="text-slate-200 fill-slate-100 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
                </div>
            </motion.div>
        </div>

      </motion.div>
    </motion.div>
  );
}