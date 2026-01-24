"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  const seed = parseInt(star.id.slice(-2), 16) || 0;
  const normalDuration = 2 + (seed / 255) * 3; 

  const { lifeForce, isCritical } = useMemo(() => {
    const now = new Date().getTime();
    const created = new Date(star.created_at).getTime();
    const hoursOld = (now - created) / (1000 * 60 * 60); 
    const maxLife = 72; 
    
    const hoursLeft = maxLife - hoursOld;
    const lf = Math.max(0, 1 - (hoursOld / maxLife));
    const critical = hoursLeft <= 2 && hoursLeft > 0;

    return { lifeForce: lf, isCritical: critical };
  }, [star.created_at]);

  if (lifeForce <= 0) return null;

  return (
    <motion.div
      onMouseEnter={() => onHover(star)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isCritical 
          ? [0.2, 1, 0.1, 0.8, 0] 
          : [lifeForce * 0.4, lifeForce, lifeForce * 0.4], 
        scale: isCritical
           ? [lifeForce * 0.8, lifeForce * 1.2, lifeForce * 0.9] 
           : lifeForce 
      }}
      transition={{
        duration: isCritical ? 0.15 : normalDuration,
        repeat: Infinity,
        ease: isCritical ? "linear" : "easeInOut", 
      }}
      style={{ left: `${star.pos_x}%`, top: `${star.pos_y}%` }}
      className={`absolute w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform duration-300 z-20 ${
          isCritical ? "bg-red-100 shadow-[0_0_15px_rgba(255,200,200,0.8)]" : "bg-white hover:bg-yellow-100"
      }`}
    />
  );
};

export default function StarLayer({ isNight, mounted, onHoverStar, stars, setStars }: StarLayerProps) {
  // State para sa Mouse Position (in Percentage para match sa stars)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  
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

  // Handle Mouse Move to update position
  const handleMouseMove = (e: React.MouseEvent) => {
    // I-convert natin ang Mouse Pixels to Percentage relative sa window size
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePos({ x, y });
  };

  if (!isNight) return null;

  return (
    <div 
        className="absolute inset-0 z-0 overflow-hidden" 
        onMouseMove={handleMouseMove} // Listen for mouse movement
        onMouseLeave={() => setMousePos({ x: -100, y: -100 })} // Hide lines pag lumabas ang mouse
    >
      
      {/* --- CONSTELLATION SVG LAYER (Background Lines) --- */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {stars.map((star) => {
            // Calculate Distance between Mouse and Star (Pythagorean Theorem)
            // Simplified: Assuming square aspect ratio for speed (pero oks lang visually)
            const dx = star.pos_x - mousePos.x;
            const dy = star.pos_y - mousePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // THRESHOLD: Kung gaano kalapit bago mag-connect (15% ng screen size)
            const maxDist = 15; 

            // Kung pasok sa range, draw line
            if (dist < maxDist) {
                // Calculate opacity: Mas malapit, mas malinaw
                const opacity = 1 - (dist / maxDist);
                
                return (
                    <line
                        key={`line-${star.id}`}
                        x1={`${mousePos.x}%`}
                        y1={`${mousePos.y}%`}
                        x2={`${star.pos_x}%`}
                        y2={`${star.pos_y}%`}
                        stroke="white"
                        strokeWidth="0.5"
                        strokeOpacity={opacity * 0.4} // Medyo transparent lang (0.4 max)
                        strokeLinecap="round"
                    />
                );
            }
            return null;
        })}
      </svg>

      <AnimatePresence>
        {stars.map((star) => (
          <StarItem key={star.id} star={star} onHover={onHoverStar} />
        ))}
      </AnimatePresence>
      
      {/* Click overlay to close reading box */}
      <div className="absolute inset-0 z-0" onClick={() => onHoverStar(null)} />
    </div>
  );
}