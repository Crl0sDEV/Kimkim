"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Share2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toPng } from "html-to-image"; // THE MAGIC TOOL

type Star = {
  id: string;
  content: string;
  likes: number;
};

interface ReadingBoxProps {
  isNight: boolean;
  hoveredStar: Star | null;
  onUpdateStar: (starId: string, newLikes: number) => void;
}

export default function ReadingBox({ isNight, hoveredStar, onUpdateStar }: ReadingBoxProps) {
  const [reactedStars, setReactedStars] = useState<Set<string>>(new Set());
  const [isSharing, setIsSharing] = useState(false);
  
  // REF para sa Hidden Card (Ito yung pipicturan natin)
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleReact = async (starId: string, currentLikes: number) => {
    if (reactedStars.has(starId)) return;

    const newLikes = currentLikes + 1;
    setReactedStars((prev) => new Set(prev).add(starId));
    
    onUpdateStar(starId, newLikes);

    try {
      await supabase.rpc('increment_likes', { row_id: starId });
    } catch (err) {
      console.error("Error reacting", err);
    }
  };

  // --- SHARE FUNCTION ---
  const handleShare = async () => {
    if (shareCardRef.current === null) return;
    setIsSharing(true);

    try {
        // 1. Convert div to PNG
        const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 3 });
        
        // 2. Create fake link to download
        const link = document.createElement('a');
        link.download = `tinig-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error("Oops, failed to generate image", err);
        alert("Hindi makuha ang larawan. Subukan muli.");
    } finally {
        setIsSharing(false);
    }
  };

  return (
    <>
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

              <div className="flex justify-center items-center gap-3">
                
                {/* LIKE BUTTON */}
                <button
                  onClick={() => handleReact(hoveredStar.id, hoveredStar.likes)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono transition-all duration-300 ${
                    reactedStars.has(hoveredStar.id)
                      ? "bg-red-500/10 text-red-200 border border-red-500/30"
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  <Heart
                    size={14}
                    className={`transition-colors duration-300 ${
                      reactedStars.has(hoveredStar.id) ? "fill-red-400 text-red-400" : "group-hover:text-red-300"
                    }`}
                  />
                  <span>
                    {hoveredStar.likes} {hoveredStar.likes <= 1 ? "Damdamin" : "Damdamin"}
                  </span>
                </button>

                {/* SHARE BUTTON (Bago) */}
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono bg-white/5 text-white/40 hover:bg-white/10 hover:text-sky-300 border border-white/10 transition-all duration-300"
                    title="I-save bilang litrato"
                >
                    {isSharing ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Share2 size={14} />
                    )}
                    <span>Share</span>
                </button>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HIDDEN CANVAS FOR IMAGE GENERATION --- 
          Ito yung hindi nakikita ng user pero ito yung pine-picture-an ng code.
          Naka-design ito pang IG Story (9:16 Aspect Ratio).
      */}
      {isNight && hoveredStar && (
          <div 
            ref={shareCardRef}
            className="fixed -left-2499.75 top-0 w-100 h-177.75 bg-slate-950 flex flex-col items-center justify-center p-12 text-center"
            style={{ 
                // Adding a nice gradient background for the image
                background: 'linear-gradient(to bottom, #0f172a, #020617)' 
            }}
          >
             {/* Background Stars (Fake stars for image) */}
             <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-50"></div>
             <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full opacity-70"></div>
             <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-white rounded-full blur-[2px] opacity-80"></div>

             {/* Content */}
             <Sparkles className="w-8 h-8 text-yellow-200 mb-8 opacity-90" />
             
             <p className="text-white text-2xl font-light leading-relaxed font-mono tracking-wide mb-12">
               &quot;{hoveredStar.content}&quot;
             </p>

             {/* Footer / Branding */}
             <div className="mt-auto flex flex-col items-center gap-2 opacity-60">
                <div className="w-10 h-px bg-white/50 mb-2"></div>
                <h2 className="text-white text-lg font-bold tracking-[0.5em] pl-[0.5em]">TINIG</h2>
                <p className="text-sky-200/50 text-xs font-mono tracking-widest uppercase">tinig.vercel.app</p>
             </div>
          </div>
      )}
    </>
  );
}