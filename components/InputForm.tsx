"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface InputFormProps {
  isNight: boolean;
  onSuccess: () => void;
}

type Phase =
  | "idle"
  | "submitting"
  | "spark"    // star appears / charge
  | "shoot"    // star flies away
  | "dot"      // tiny twinkle dot for a moment
  | "success";

function StarIcon({ className }: { className?: string }) {
  // 4-point twinkle star (matches your vibe)
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M60 6l10 34 34 10-34 10-10 34-10-34L16 50l34-10L60 6z"
        fill="currentColor"
      />
      {/* inner sparkle */}
      <path
        d="M60 26l6 18 18 6-18 6-6 18-6-18-18-6 18-6 6-18z"
        fill="rgba(186,230,253,0.75)"
        opacity="0.55"
      />
    </svg>
  );
}

export default function InputForm({ isNight, onSuccess }: InputFormProps) {
  const [thought, setThought] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [hasSent, setHasSent] = useState(false);
  const [lastText, setLastText] = useState("");

  const timersRef = useRef<number[]>([]);
  const trimmed = useMemo(() => thought.trim(), [thought]);

  const isSubmitting = phase === "submitting";
  const disabled = !trimmed || isSubmitting || phase !== "idle";

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };
  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const runCinematic = () => {
    clearTimers();

    // clean timeline
    setPhase("spark");                 // 0–550
    schedule(() => setPhase("shoot"), 550);  // 550–1400
    schedule(() => setPhase("dot"), 1400);   // 1400–1900
    schedule(() => {
      setPhase("success");
      setHasSent(true);
      schedule(() => {
        setHasSent(false);
        setPhase("idle");
      }, 3200);
    }, 1900);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || phase !== "idle") return;

    setPhase("submitting");

    try {
      const randomX = Math.floor(Math.random() * 80) + 10;
      const randomY = Math.floor(Math.random() * 80) + 10;

      const { error } = await supabase.from("stars").insert([
        { content: trimmed, pos_x: randomX, pos_y: randomY },
      ]);
      if (error) throw error;

      setLastText(trimmed);
      setThought("");
      onSuccess();

      runCinematic();
    } catch (err) {
      console.error(err);
      alert("May problema sa pagpapadala. Subukan muli.");
      setPhase("idle");
    }
  };

  if (isNight) return null;

  const showCinematic = phase !== "idle" && phase !== "submitting" && phase !== "success";
  const showSuccess = hasSent && phase === "success";

  return (
    <div className="min-h-50 flex items-center justify-center pointer-events-auto">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-slate-600 font-mono text-sm tracking-wide text-center"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-sky-500" />
            <p>Umaalingawngaw na sa kalawakan.</p>
            <p className="text-xs opacity-60 mt-1">Narinig ka na.</p>
          </motion.div>
        ) : (
          <motion.div
            key="wrap"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full relative"
          >
            {/* FORM (fully hidden during cinematic) */}
            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full"
              animate={{
                opacity: phase === "idle" || phase === "submitting" ? 1 : 0,
                scale: phase === "idle" || phase === "submitting" ? 1 : 0.98,
                filter: phase === "idle" || phase === "submitting" ? "blur(0px)" : "blur(10px)",
              }}
              transition={{ duration: 0.22 }}
            >
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                disabled={isSubmitting || phase !== "idle"}
                placeholder="Anong tinig ang nais mong pakawalan?"
                maxLength={280}
                className="w-full p-6 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl resize-none outline-none text-lg text-slate-800 placeholder:text-slate-500/70 focus:border-slate-400 focus:bg-white/60 transition-all duration-500 font-light shadow-lg"
                rows={4}
              />

              <div className="flex justify-between items-center text-xs text-slate-500 font-mono uppercase tracking-wide">
                <span>{thought.length}/280</span>

                <button
                  type="submit"
                  disabled={disabled}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all duration-300 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Pinapadala</span>
                    </>
                  ) : (
                    <>
                      Iparinig <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            {/* CINEMATIC OVERLAY */}
            <AnimatePresence>
              {showCinematic && (
                <motion.div
                  key="cin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
                >
                  {/* Scrim so clean (and helps contrast) */}
                  <div className="absolute inset-0 rounded-xl bg-white/15 backdrop-blur-[1px]" />

                  <div className="relative w-full max-w-[560px] h-[260px]">
                    {/* Star launch point near center */}
                    <motion.div
                      className="absolute left-1/2 top-[120px] -translate-x-1/2"
                      style={{
                        color: "rgba(255,255,255,0.95)",
                        filter:
                          "drop-shadow(0 0 18px rgba(255,255,255,0.65)) drop-shadow(0 0 38px rgba(56,189,248,0.35))",
                      }}
                      initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
                      animate={{
                        opacity: 1,
                        scale: phase === "spark" ? [0.7, 1.12, 1] : phase === "shoot" ? 1 : 0.22,
                        rotate: phase === "spark" ? [0, 12, -8, 0] : phase === "shoot" ? -18 : 0,
                        x: phase === "shoot" ? -520 : 0,
                        y: phase === "shoot" ? -150 : 0,
                      }}
                      transition={{
                        duration: phase === "spark" ? 0.55 : 0.9,
                        ease: "easeInOut",
                      }}
                    >
                      {/* visible even on sky-blue:
                          - white core
                          - subtle dark outline ring behind */}
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            boxShadow:
                              "0 0 0 2px rgba(15,23,42,0.18), 0 0 22px rgba(255,255,255,0.55)",
                          }}
                        />
                        <StarIcon className="w-[90px] h-[90px]" />
                      </div>

                      {/* tiny caption flash while charging (optional) */}
                      <AnimatePresence>
                        {phase === "spark" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.75, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="mt-2 text-[10px] font-mono tracking-widest text-slate-800/60 text-center"
                            style={{ filter: "none", color: "rgba(15,23,42,0.45)" }}
                          >
                            {lastText ? "…pinakawalan" : ""}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Trail during shoot */}
                    <AnimatePresence>
                      {phase === "shoot" && (
                        <motion.div
                          key="trail"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="absolute left-1/2 top-[132px] -translate-x-1/2"
                        >
                          <div className="w-[520px] h-[2px] bg-gradient-to-l from-transparent via-white/80 to-transparent blur-[1px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* DOT TWINKLE (end point, still visible on sky blue) */}
                    <AnimatePresence>
                      {phase === "dot" && (
                        <motion.div
                          key="dot"
                          className="absolute left-[60px] top-[18px]"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 1, 0.45, 1, 0.6],
                            scale: [1, 1.35, 1, 1.2, 1],
                          }}
                          transition={{ duration: 0.5, repeat: 2, ease: "easeInOut" }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: "rgba(255,255,255,0.95)",
                              boxShadow:
                                "0 0 0 2px rgba(15,23,42,0.18), 0 0 18px rgba(255,255,255,0.6), 0 0 28px rgba(56,189,248,0.35)",
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
