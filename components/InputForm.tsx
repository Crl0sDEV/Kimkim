"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import { useToast } from "@/context/ToastContext";

interface InputFormProps {
  isNight: boolean;
  onSuccess: () => void;
}

// 1. LISTAHAN NG BAWAL (Filter List)
const BAD_WORDS = [
  // Tagalog
  "gago", "tanga", "bobo", "putangina", "puta", "gaga", 
  "tangina", "ulol", "olop", "kantot", "iyot", "bayot", 
  "supot", "tarantado", "hindot", "puke", "pepe", "tite", 
  "etits", "burat", "kupal", "hayop", "demonyo", "punyeta",
  "kinginamo","tt", "bisakol",
  // English
  "fuck", "shit", "bitch", "asshole", "bullshit", "sex", "dick"
];

const PROMPTS = [
  "Anong tinig ang nais mong pakawalan?", 
  "Sino ang nami-miss mo ngayon?",
  "Ano ang mga salitang hindi mo masabi sa kanya?",
  "Anong pangarap ang kailangan mong bitawan?",
  "Kung maririnig ka niya, anong sasabihin mo?",
  "Ano ang pinakamabigat na dinadala mo?",
  "Saan ka huling naging totoong masaya?",
  "Ano ang mensahe mo para sa sarili mo?",
  "Kanino ka humihingi ng tawad?",
  "Ano ang kinatatakutan mong mangyari?",
];

export default function InputForm({ isNight, onSuccess }: InputFormProps) {
  const [thought, setThought] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setCurrentPromptIndex(Math.floor(Math.random() * PROMPTS.length));
  }, []);

  const handleShuffle = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % PROMPTS.length);
  };

  // --- UPDATED: MATALINONG CHECKER ---
  const containsBadWords = (text: string) => {
    const lowerText = text.toLowerCase();

    // Loop tayo sa bawat bad word
    return BAD_WORDS.some((word) => {
        // 1. I-convert ang word into REGEX Pattern
        // Halimbawa: "gago" -> nagiging "g+a+g+o+"
        // Ibig sabihin: "One or more G, followed by one or more A..."
        const regexPattern = word
            .split('') // Hiniwalay per letter ['g', 'a', 'g', 'o']
            .map(char => `${char}+`) // Dinagdagan ng '+' bawat isa
            .join(''); // Pinagsama ulit: "g+a+g+o+"

        // 2. Gumawa ng Regex Object
        const regex = new RegExp(regexPattern, 'i'); // 'i' means case-insensitive

        // 3. I-test kung nasa text
        return regex.test(lowerText);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim() || isSubmitting) return;

    // --- CHECKPOINT ---
    if (containsBadWords(thought)) {
        showToast("Paalala: Panatilihing dalisay ang ating kalawakan.", "error");
        return; 
    }

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
      setTimeout(() => setHasSent(false), 4000); 
    } catch (error) {
      console.error(error);
      alert("May problema sa pagpapadala. Subukan muli.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isNight) return null;
  if (!isClient) return null;

  return (
    <div className="min-h-50 flex items-center justify-center pointer-events-auto w-full max-w-lg mx-auto px-4">
      <AnimatePresence mode="wait">
        {!hasSent ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 w-full"
          >
            <div className="flex items-center justify-between px-2">
                <motion.label 
                    key={currentPromptIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-slate-600 font-mono text-xs md:text-sm tracking-wide font-medium"
                >
                    {PROMPTS[currentPromptIndex]}
                </motion.label>

                <button 
                    type="button"
                    onClick={handleShuffle}
                    className="p-1.5 rounded-full hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Iba pang tanong"
                >
                    <RefreshCw size={12} />
                </button>
            </div>

            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              disabled={isSubmitting}
              placeholder="Ikwento mo rito..."
              maxLength={280}
              className="w-full p-6 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl resize-none outline-none text-lg text-slate-800 placeholder:text-slate-500/50 focus:border-slate-400 focus:bg-white/80 transition-all duration-500 font-light shadow-lg"
              rows={4}
            />
            
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono uppercase tracking-wide px-2">
              <span>{thought.length}/280</span>
              <button
                type="submit"
                disabled={!thought.trim() || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all duration-300 shadow-md"
              >
                {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <>Iparinig <Send size={14} /></>
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
            className="text-slate-600 font-mono text-sm tracking-wide text-center"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-sky-500" />
            <p>Umaalingawngaw na sa kalawakan.</p>
            <p className="text-xs opacity-60 mt-1">Narinig ka na.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}