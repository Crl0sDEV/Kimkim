"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface BackgroundLayerProps {
  currentHour: number;
}

type ShootingStar = {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number; 
};

export default function BackgroundLayer({ currentHour }: BackgroundLayerProps) {
  const [shootingStar, setShootingStar] = useState<ShootingStar | null>(null);

  const rotation = (currentHour - 12) * 15;
  const isNight = currentHour >= 18 || currentHour < 6;
  const skyColor = isNight ? "#020617" : "#38bdf8"; 

  useEffect(() => {
    if (!isNight) return;

    const triggerStar = () => {
        const id = Date.now();
        const isLeftToRight = Math.random() > 0.5;
        const randomY = 10 + Math.random() * 50; 
        const startY = randomY;
        const endY = randomY;

        let startX, endX;

        if (isLeftToRight) {
            startX = -10; 
            endX = 110;   
        } else {
            startX = 110; 
            endX = -10;   
        }

        const dx = endX - startX;
        const dy = endY - startY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        setShootingStar({ id, startX, startY, endX, endY, angle });
        setTimeout(() => setShootingStar(null), 2000);
    };

    const minTime = 60000;
    const maxTime = 300000;
    
    let timeoutId: NodeJS.Timeout;

    const scheduleNextStar = () => {
        const nextInterval = Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
        timeoutId = setTimeout(() => {
            triggerStar();
            scheduleNextStar();
        }, nextInterval);
    };

    scheduleNextStar();
    return () => clearTimeout(timeoutId);
  }, [isNight]);

  return (
    <motion.div
      className="absolute inset-0 z-0 overflow-hidden"
      animate={{ backgroundColor: skyColor }}
      transition={{ duration: 2 }} 
    >
      {/* --- FIXED SHOOTING STAR --- */}
      <AnimatePresence>
        {isNight && shootingStar && (
            <motion.div
                key={shootingStar.id}
                initial={{ 
                    left: `${shootingStar.startX}%`, 
                    top: `${shootingStar.startY}%`,
                    rotate: shootingStar.angle, 
                    opacity: 0, 
                    scale: 0.5 
                }}
                animate={{ 
                    left: `${shootingStar.endX}%`, 
                    top: `${shootingStar.endY}%`, 
                    opacity: [0, 1, 1, 0], 
                    scale: [0.8, 1, 0.8] 
                }}
                transition={{ 
                    duration: 2, 
                    ease: "linear", 
                    times: [0, 0.1, 0.9, 1] 
                }}
                className="absolute z-10 h-0.5 w-37.5 origin-left blur-[0.5px]"
                style={{
                    
                    background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255, 255, 255, 1) 100%)'
                }}
            >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-[2px] shadow-[0_0_10px_rgba(255,255,255,1)]" />
            </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute left-1/2 bottom-[-80vh] w-[180vh] h-[180vh] -translate-x-1/2 flex justify-center items-center rounded-full border border-white/5"
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 20, damping: 15 }}
        style={{ transformOrigin: "center center" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <motion.div animate={{ rotate: -rotation }} transition={{ type: "spring" }}>
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-[80px] opacity-60 rounded-full scale-150"></div>
                    <Sun size={100} className="text-yellow-300 fill-yellow-400 drop-shadow-2xl" />
                </div>
            </motion.div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
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