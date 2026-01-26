"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export default function DailyQuote() {
  const [quote, setQuote] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch("/api/daily-quote");
        const data = await res.json();
        setQuote(data.content);
        
        // Delay konti bago lumabas para dramatic
        setTimeout(() => setIsVisible(true), 2000);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuote();
  }, []);

  if (!quote) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-6 left-6 z-40 max-w-62.5 md:max-w-sm pointer-events-auto"
        >
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-tr-2xl rounded-bl-2xl shadow-lg group">
            
            {/* Close Button (Optional) */}
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 text-white/20 hover:text-white transition-colors"
            >
                <X size={12} />
            </button>

            <Sparkles className="w-4 h-4 text-sky-300 mb-2 opacity-80" />
            
            <p className="text-white/80 text-xs md:text-sm font-light italic leading-relaxed font-mono tracking-wide">
              &quot;{quote}&quot;
            </p>
            
            <p className="text-sky-500/50 text-[10px] font-bold uppercase tracking-widest mt-3 text-right">
              — Mensahe ng Araw
            </p>

            {/* Glowing Corner Accent */}
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-sky-400/50 rounded-bl-xl" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}