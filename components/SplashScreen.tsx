"use client";

import React from "react";
import { motion } from "framer-motion";
import { Headphones, ArrowRight } from "lucide-react";

interface SplashScreenProps {
  onEnter: () => void; // Function na tatawagin pag nag-click
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-100 bg-black flex flex-col items-center justify-center text-center px-6"
    >
      <div className="max-w-md flex flex-col items-center gap-8">
        {/* LOGO / TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-[0.5em] text-white pl-[0.5em]">
            TINIG
          </h1>
          <p className="text-slate-400 font-mono text-xs md:text-sm tracking-widest uppercase">
            Mga bulong sa kalawakan
          </p>
        </motion.div>

        {/* INSTRUCTIONS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col items-center gap-2 text-slate-500 text-xs font-light"
        >
          <Headphones size={20} className="mb-2 animate-pulse" />
          <p>Para sa mas mainam na karanasan,</p>
          <p>gumamit ng headphones.</p>
        </motion.div>

        {/* ENTER BUTTON */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          onClick={onEnter}
          className="group relative px-8 py-3 mt-4 overflow-hidden rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500"
        >
          <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-250 ease-out group-hover:w-full opacity-0 group-hover:opacity-100" />
          <span className="relative flex items-center gap-3 text-sm font-mono tracking-widest text-white/80 group-hover:text-white uppercase">
            Pumasok <ArrowRight size={14} />
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}