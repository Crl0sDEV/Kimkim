"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface BackgroundLayerProps {
  currentHour: number;
}

type ShootingStar = {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
};

type Bird = {
  id: number;
  startX: number;
  endX: number;
  y: number;
  scale: number;
  duration: number;
  direction: "ltr" | "rtl";
  flapSpeed: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

/**
 * Silhouette bird (side view) with REAL flapping (2-frame):
 * - Frame A: wings UP
 * - Frame B: wings DOWN (tucked near body)
 * Crossfade between frames for a strong flap illusion.
 */
function BirdSilhouette({
  className,
  flapSpeed = 0.75,
}: {
  className?: string;
  flapSpeed?: number;
}) {
  return (
    <svg
      viewBox="0 0 240 160"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* WINGS: 2 FRAMES */}
      {/* UP frame */}
      <motion.g
        initial={false}
        animate={{ opacity: [1, 0, 1], y: [0, 2, 0] }}
        transition={{ duration: flapSpeed, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M70 118c10-44 44-68 88-72-18 24-20 44-12 68-28-6-48-4-76 4z"
          fill="currentColor"
          opacity="0.95"
        />
        <path
          d="M108 120c10-44 56-78 118-86-26 30-34 58-28 92-34-12-58-12-90-6z"
          fill="currentColor"
          opacity="1"
        />
      </motion.g>

      {/* DOWN frame */}
      <motion.g
        initial={false}
        animate={{ opacity: [0, 1, 0], y: [10, 0, 10] }}
        transition={{ duration: flapSpeed, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M78 128c18-14 44-18 66-12-18 10-24 18-28 32-14-10-24-14-38-20z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M118 130c26-18 66-22 98-12-22 12-32 22-34 40-20-12-36-18-64-28z"
          fill="currentColor"
          opacity="0.95"
        />
      </motion.g>

      {/* BODY (always on top) */}
      <path
        d="M54 124c24-30 86-36 126-18 16 7 30 22 36 38-36 6-76 8-116 8-28 0-44-2-46-4z"
        fill="currentColor"
      />
      <path d="M48 122l-28 14 28 16c2-10 2-20 0-30z" fill="currentColor" />
      <circle cx="186" cy="116" r="15" fill="currentColor" />
      <path d="M200 116l24 9-24 9c3-6 3-12 0-18z" fill="currentColor" />
    </svg>
  );
}

export default function BackgroundLayer({ currentHour }: BackgroundLayerProps) {
  const rotation = useMemo(() => (currentHour - 12) * 15, [currentHour]);
  const isNight = currentHour >= 18 || currentHour < 6;

  const skyColor = isNight ? "#020617" : "#bae6fd";

  const [shootingStar, setShootingStar] = useState<ShootingStar | null>(null);
  const [birds, setBirds] = useState<Bird[]>([]);

  const starTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const birdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- NIGHT: SHOOTING STARS ---
  useEffect(() => {
    if (!isNight) return;

    const triggerStar = () => {
      const id = Date.now();
      const isLeftToRight = Math.random() > 0.5;

      const y = rand(10, 55);
      const startX = isLeftToRight ? -10 : 110;
      const endX = isLeftToRight ? 110 : -10;

      const dx = endX - startX;
      const dy = 0;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      setShootingStar({ id, startX, startY: y, endX, endY: y, angle });
      setTimeout(() => setShootingStar(null), 2000);
    };

    const scheduleNext = () => {
      const next = randInt(30000, 120000);
      starTimerRef.current = setTimeout(() => {
        triggerStar();
        scheduleNext();
      }, next);
    };

    scheduleNext();

    return () => {
      if (starTimerRef.current) clearTimeout(starTimerRef.current);
      starTimerRef.current = null;
      setShootingStar(null);
    };
  }, [isNight]);

  // --- DAY: BIRDS ---
  useEffect(() => {
    if (isNight) return;

    const spawnBird = () => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const direction: Bird["direction"] = Math.random() > 0.5 ? "ltr" : "rtl";

      const y = rand(8, 45);
      const scale = rand(0.35, 0.8);
      const duration = rand(12, 22);

      // slower flap so it’s visible
      const flapSpeed = rand(0.6, 0.9);

      const startX = direction === "ltr" ? -20 : 120;
      const endX = direction === "ltr" ? 120 : -20;

      const newBird: Bird = { id, startX, endX, y, scale, duration, direction, flapSpeed };

      setBirds((prev) => {
        const capped = prev.length > 6 ? prev.slice(prev.length - 6) : prev;
        return [...capped, newBird];
      });

      setTimeout(() => {
        setBirds((prev) => prev.filter((b) => b.id !== id));
      }, (duration + 0.8) * 1000);
    };

    const scheduleNext = () => {
      const next = randInt(7000, 20000);
      birdTimerRef.current = setTimeout(() => {
        spawnBird();
        if (Math.random() < 0.35) setTimeout(spawnBird, randInt(800, 1800));
        scheduleNext();
      }, next);
    };

    scheduleNext();

    return () => {
      if (birdTimerRef.current) clearTimeout(birdTimerRef.current);
      birdTimerRef.current = null;
      setBirds([]);
    };
  }, [isNight]);

  return (
    <motion.div
      className="absolute inset-0 z-0 overflow-hidden"
      animate={{ backgroundColor: skyColor }}
      transition={{ duration: 2 }}
    >
      {/* --- NIGHT: SHOOTING STAR --- */}
      <AnimatePresence>
        {isNight && shootingStar && (
          <motion.div
            key={shootingStar.id}
            initial={{
              left: `${shootingStar.startX}%`,
              top: `${shootingStar.startY}%`,
              rotate: shootingStar.angle,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              left: `${shootingStar.endX}%`,
              top: `${shootingStar.endY}%`,
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 0.8],
            }}
            transition={{ duration: 2, ease: "linear", times: [0, 0.1, 0.9, 1] }}
            className="absolute z-10 h-0.5 w-36 origin-left blur-[0.5px]"
            style={{
              background:
                "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-[2px] shadow-[0_0_10px_rgba(255,255,255,1)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DAY: SILHOUETTE BIRDS --- */}
      <AnimatePresence>
        {!isNight &&
          birds.map((b) => (
            <motion.div
              key={b.id}
              initial={{
                left: `${b.startX}%`,
                top: `${b.y}%`,
                opacity: 0,
                scale: b.scale,
              }}
              animate={{
                left: `${b.endX}%`,
                opacity: [0, 1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: b.duration,
                ease: "linear",
                times: [0, 0.08, 0.92, 1],
              }}
              className="absolute z-10"
              style={{
                // darker + no blur to make flapping visible
                color: "rgba(15, 23, 42, 0.55)",
              }}
            >
              <motion.div
                initial={false}
                animate={{
                  y: [0, 2.5, 0],
                  scaleX: b.direction === "rtl" ? -1 : 1, // head always leads
                }}
                transition={{
                  y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                  scaleX: { duration: 0 },
                }}
              >
                <BirdSilhouette className="w-12 h-12 md:w-16 md:h-16" flapSpeed={b.flapSpeed} />
              </motion.div>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* --- CELESTIAL WHEEL --- */}
      <motion.div
        className="absolute left-1/2 bottom-[-80vh] w-[180vh] h-[180vh] -translate-x-1/2 flex justify-center items-center rounded-full border border-white/5"
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 20, damping: 15 }}
        style={{ transformOrigin: "center center" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <motion.div animate={{ rotate: -rotation }} transition={{ type: "spring" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-[80px] opacity-60 rounded-full scale-150" />
              <Sun size={100} className="text-yellow-300 fill-yellow-400 drop-shadow-2xl" />
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
          <motion.div animate={{ rotate: -rotation }} transition={{ type: "spring" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 blur-[60px] opacity-30 rounded-full scale-150" />
              <Moon
                size={80}
                className="text-slate-200 fill-slate-100 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
