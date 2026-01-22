"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Star = {
  id: string;
  content: string;
  likes: number;
};

interface ReadingBoxProps {
  isNight: boolean;
  hoveredStar: Star | null;
  onUpdateStar: (starId: string, newLikes: number) => void; // Callback to update parent state
}

export default function ReadingBox({ isNight, hoveredStar, onUpdateStar }: ReadingBoxProps) {
  const [reactedStars, setReactedStars] = useState<Set<string>>(new Set());

  const handleReact = async (starId: string, currentLikes: number) => {
    if (reactedStars.has(starId)) return;

    const newLikes = currentLikes + 1;
    setReactedStars((prev) => new Set(prev).add(starId));
    
    // 1. Update UI agad (Optimistic)
    onUpdateStar(starId, newLikes);

    // 2. Secure RPC Call (Backend)
    try {
      // Dito na tayo tatawag sa FUNCTION, hindi sa Table update
      await supabase.rpc('increment_likes', { row_id: starId });
    } catch (err) {
      console.error("Error reacting", err);
    }
  };

  return (
    <AnimatePresence>
      {isNight && hoveredStar && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-24 z-50 w-full max-w-lg px-6 pointer-events-auto"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl text-center shadow-2xl shadow-white/5 relative group">
            <Sparkles className="w-4 h-4 text-yellow-200 mx-auto mb-3 opacity-80" />
            <p className="text-white text-sm md:text-base font-light tracking-wide leading-relaxed font-mono mb-6">
              &quot;{hoveredStar.content}&quot;
            </p>

            <div className="flex justify-center items-center">
              <button
                onClick={() => handleReact(hoveredStar.id, hoveredStar.likes)}
                className={`flex items-center gap-3 px-5 py-2 rounded-full text-xs font-mono transition-all duration-300 group ${
                  reactedStars.has(hoveredStar.id)
                    ? "bg-red-500/10 text-red-200 border border-red-500/30"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                <Heart
                  size={14}
                  className={`transition-colors duration-300 ${
                    reactedStars.has(hoveredStar.id)
                      ? "fill-red-400 text-red-400"
                      : "group-hover:text-red-300"
                  }`}
                />
                <span className="font-bold tracking-wider">
                  {hoveredStar.likes} {hoveredStar.likes === 1 ? "Resonate" : "Resonates"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}