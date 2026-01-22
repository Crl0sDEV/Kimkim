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

// --- SUB-COMPONENT: STAR ITEM (With Fading Logic) ---
const StarItem = ({ star, onHover }: { star: Star; onHover: (s: Star) => void }) => {
  
  // 1. DETERMINISTIC SPEED (Para iwas linter error)
  const seed = parseInt(star.id.slice(-2), 16) || 0;
  const duration = 2 + (seed / 255) * 3; 

  // 2. FADING LOGIC (Life Force Calculation)
  // Kinakalkula nito kung gaano na katanda ang star.
  const lifeForce = useMemo(() => {
    const now = new Date().getTime();
    const created = new Date(star.created_at).getTime();
    const hoursOld = (now - created) / (1000 * 60 * 60); // Convert ms to hours
    const maxLife = 72; // 3 Days lifespan
    
    // Formula: 1.0 (Fresh) to 0.0 (Dead)
    // Math.max(0, ...) ensures hindi magne-negative
    return Math.max(0, 1 - (hoursOld / maxLife));
  }, [star.created_at]);

  // Kung patay na (0 opacity), wag na i-render para tipid sa memory
  if (lifeForce <= 0) return null;

  return (
    <motion.div
      onMouseEnter={() => onHover(star)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        // Dito natin ina-apply ang fading.
        // Ang brightness ay base sa 'lifeForce'.
        opacity: [lifeForce * 0.4, lifeForce, lifeForce * 0.4], 
        scale: lifeForce // Optional: Lumiliit din habang tumatanda
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ left: `${star.pos_x}%`, top: `${star.pos_y}%` }}
      // Dinagdagan ko ng konting shadow glow na base din sa lifeForce
      className="absolute w-2 h-2 bg-white rounded-full cursor-pointer hover:scale-150 hover:bg-yellow-100 transition-transform duration-300 z-20"
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
          .limit(100); // Tinaasan ko limit para makita mo marami

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