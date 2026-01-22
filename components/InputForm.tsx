"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface InputFormProps {
  isNight: boolean;
  onSuccess: () => void;
}

export default function InputForm({ isNight, onSuccess }: InputFormProps) {
  const [thought, setThought] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const randomX = Math.floor(Math.random() * 80) + 10;
      const randomY = Math.floor(Math.random() * 80) + 10;

      const { error } = await supabase
        .from('stars')
        .insert([{ content: thought, pos_x: randomX, pos_y: randomY }]);

      if (error) throw error;

      setHasSent(true);
      setThought("");
      onSuccess(); 
      setTimeout(() => setHasSent(false), 4000); // 4 seconds para mabasa yung success msg
    } catch (error) {
        console.error(error);
      alert("May problema sa pagpapadala. Subukan muli.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isNight) return null;

  return (
    <div className="min-h-50 flex items-center justify-center pointer-events-auto">
      <AnimatePresence mode="wait">
        {!hasSent ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full"
          >
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              disabled={isSubmitting}
              // TAGALOG PLACEHOLDER
              placeholder="Ano ang matagal mo nang kinikimkim?"
              maxLength={280}
              className="w-full p-6 bg-white/40 backdrop-blur-md border border-white/50 rounded-xl resize-none outline-none text-lg text-slate-800 placeholder:text-slate-500/70 focus:border-slate-400 focus:bg-white/60 transition-all duration-500 font-light shadow-lg"
              rows={4}
            />
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono uppercase tracking-wide">
              <span>{thought.length}/280</span>
              <button
                type="submit"
                disabled={!thought.trim() || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all duration-300 shadow-md"
              >
                {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    // TAGALOG BUTTON
                    <>Pakawalan <Send size={14} /></>
                )}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-slate-600 font-mono text-sm tracking-wide"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-sky-500" />
            {/* TAGALOG SUCCESS MESSAGE */}
            <p>Malaya na ang iyong lihim.</p>
            <p className="text-xs opacity-60 mt-1">Wala na ang bigat.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}