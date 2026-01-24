"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Ripple = {
  id: number;
  x: number;
  y: number;
};

export default function CosmicRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Create new ripple
      const newRipple = {
        id: Date.now(),
        x: e.pageX,
        y: e.pageY,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after 1 second (cleanup)
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1000);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ 
                opacity: 0.5, 
                scale: 0,
                x: ripple.x - 50, // Center the div (100px width / 2)
                y: ripple.y - 50 
            }}
            animate={{ 
                opacity: 0, 
                scale: 4, // Laki ng spread
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-25 h-25 rounded-full border border-white/20 bg-white/5 blur-sm"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}