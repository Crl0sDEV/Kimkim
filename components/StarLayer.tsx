"use client";

import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

type Star = {
  id: string;
  content: string;
  pos_x: number;
  pos_y: number;
  likes: number;
  created_at: string;
};

interface StarLayerProps {
  isNight: boolean;
  mounted: boolean;
  onHoverStar: (star: Star | null) => void;
  stars: Star[];
  setStars: React.Dispatch<React.SetStateAction<Star[]>>;
}

// --- SUB-COMPONENT: STAR ITEM (With Final Flicker Logic) ---
const StarItem = ({ star, onHover }: { star: Star; onHover: (s: Star) => void }) => {
  
  // 1. DETERMINISTIC SPEED
  // Base speed (Normal life)
  const seed = parseInt(star.id.slice(-2), 16) || 0;
  const normalDuration = 2 + (seed / 255) * 3; 

  // 2. ADVANCED LIFE CALCULATION
  const { lifeForce, isCritical } = useMemo(() => {
    const now = new Date().getTime();
    const created = new Date(star.created_at).getTime();
    const hoursOld = (now - created) / (1000 * 60 * 60); // Hours since creation
    const maxLife = 72; // 72 Hours Lifespan
    
    // Remaining hours
    const hoursLeft = maxLife - hoursOld;

    // Fading Formula: 1.0 (Fresh) -> 0.0 (Dead)
    const lf = Math.max(0, 1 - (hoursOld / maxLife));

    // CRITICAL CONDITION:
    // Kapag 2 hours (or less) na lang ang natitira, "Critical" na siya.
    // Pwede mong baguhin yung '2' kung gusto mo mas maaga o mas late mag-flicker.
    const critical = hoursLeft <= 2 && hoursLeft > 0;

    return { lifeForce: lf, isCritical: critical };
  }, [star.created_at]);

  // Kung patay na, wag i-render
  if (lifeForce <= 0) return null;

  return (
    <motion.div
      onMouseEnter={() => onHover(star)}
      initial={{ opacity: 0, scale: 0 }}
      
      // --- DYNAMIC ANIMATION ---
      animate={{ 
        opacity: isCritical 
          ? [0.2, 1, 0.1, 0.8, 0] // VIOLENT FLICKER: Magulo ang opacity pag critical
          : [lifeForce * 0.4, lifeForce, lifeForce * 0.4], // NORMAL: Smooth pulse
        
        scale: isCritical
           ? [lifeForce * 0.8, lifeForce * 1.2, lifeForce * 0.9] // Pulsing size pag critical
           : lifeForce // Normal scale
      }}
      
      transition={{
        // DURATION LOGIC:
        // Pag Critical: 0.15s (Sobrang bilis/Strobe effect)
        // Pag Normal: Base sa calculated duration (2s - 5s)
        duration: isCritical ? 0.15 : normalDuration,
        
        repeat: Infinity,
        ease: isCritical ? "linear" : "easeInOut", // Linear para mas mukhang robotic/erratic pag flicker
      }}
      
      style={{ left: `${star.pos_x}%`, top: `${star.pos_y}%` }}
      
      // Style changes:
      // Pag Critical: Nagiging 'Reddish-White' para mukhang unstable (optional, remove 'shadow-red' if ayaw mo)
      className={`absolute w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform duration-300 z-20 ${
          isCritical ? "bg-red-100 shadow-[0_0_15px_rgba(255,200,200,0.8)]" : "bg-white hover:bg-yellow-100"
      }`}
    />
  );
};

export default function StarLayer({ isNight, mounted, onHoverStar, stars, setStars }: StarLayerProps) {
  
  useEffect(() => {
    if (isNight && mounted) {
      const fetchStars = async () => {
        const { data, error } = await supabase
          .from('stars')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) console.error("Error fetching stars");
        else setStars(data || []);
      };

      fetchStars();
    }
  }, [isNight, mounted, setStars]);

  if (!isNight) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence>
        {stars.map((star) => (
          <StarItem key={star.id} star={star} onHover={onHoverStar} />
        ))}
      </AnimatePresence>
      <div className="absolute inset-0 z-10" onClick={() => onHoverStar(null)} />
    </div>
  );
}