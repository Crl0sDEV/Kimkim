"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Share2, Loader2, X, Download, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toPng } from "html-to-image";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const handleGeneratePreview = async () => {
    if (shareCardRef.current === null) return;
    setIsGenerating(true);
    try {
        // Wait konti para sure na loaded ang styles
        await new Promise((resolve) => setTimeout(resolve, 300));
        const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 2 });
        setPreviewImage(dataUrl);
    } catch (err) {
        console.error("Generation failed", err);
        alert("Hindi mabuo ang larawan. Ulitin lang.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!previewImage) return;
    const link = document.createElement('a');
    link.download = `tinig-${Date.now()}.png`;
    link.href = previewImage;
    link.click();
  };

  const handleNativeShare = async () => {
    if (!previewImage) return;
    try {
        const blob = await (await fetch(previewImage)).blob();
        const file = new File([blob], "tinig-share.png", { type: "image/png" });
        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Tinig',
                text: 'Isang bulong mula sa kalawakan.',
            });
        } else {
            alert("Hindi suportado ng browser mo ang direct sharing. I-download na lang.");
        }
    } catch (error) {
        console.log("Share cancelled", error);
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
                <button
                  onClick={() => handleReact(hoveredStar.id, hoveredStar.likes)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono transition-all duration-300 ${
                    reactedStars.has(hoveredStar.id)
                      ? "bg-red-500/10 text-red-200 border border-red-500/30"
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  <Heart size={14} className={reactedStars.has(hoveredStar.id) ? "fill-red-400 text-red-400" : ""} />
                  <span>{hoveredStar.likes}</span>
                </button>

                <button
                    onClick={handleGeneratePreview}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono bg-white/5 text-white/40 hover:bg-white/10 hover:text-sky-300 border border-white/10 transition-all duration-300"
                >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                    <span>Share</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PREVIEW MODAL --- */}
      <AnimatePresence>
        {previewImage && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                onClick={() => setPreviewImage(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="relative max-w-sm w-full bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setPreviewImage(null)}
                        className="absolute -top-3 -right-3 p-2 bg-slate-800 text-white rounded-full border border-white/20 hover:bg-red-900/50 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <h3 className="text-white/80 font-mono text-xs uppercase tracking-widest mt-2">Ibahagi sa Kalawakan</h3>

                    {/* FIX: Nilagyan ko ng max-h-[60vh] para hindi sakupin ang buong screen */}
                    <div className="w-full rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={previewImage} 
                            alt="Share Preview" 
                            className="w-auto h-auto max-h-[60vh] object-contain" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                        <button 
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all text-xs font-mono uppercase"
                        >
                            <Download size={16} /> Save
                        </button>
                        <button 
                            onClick={handleNativeShare}
                            className="flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-900/20 transition-all text-xs font-mono uppercase"
                        >
                            <Send size={16} /> Share
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- HIDDEN CANVAS (FIXED) --- */}
      {isNight && hoveredStar && (
          <div 
            ref={shareCardRef}
            // FIX:
            // 1. Position: fixed top-0 left-0 (Pero z-index negative para nasa likod)
            // 2. Dimensions: Explicit 400px x 711px (9:16 Ratio)
            className="fixed top-0 left-0 -z-50 flex flex-col items-center justify-center p-12 text-center"
            style={{ 
                width: '400px',
                height: '500px',
                background: 'linear-gradient(to bottom, #0f172a, #020617)' 
            }}
          >
             <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-50"></div>
             <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full opacity-70"></div>
             <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-white rounded-full blur-[2px] opacity-80"></div>
             <div className="absolute top-1/2 left-10 w-0.5 h-0.5 bg-sky-200 rounded-full opacity-60"></div>

             <Sparkles className="w-12 h-12 text-yellow-200 mb-10 opacity-90" />
             
             <p className="text-white text-2xl font-light leading-relaxed font-mono tracking-wide mb-12 drop-shadow-lg wrap-break-word w-full px-4">
               &quot;{hoveredStar.content}&quot;
             </p>

             <div className="mt-auto flex flex-col items-center gap-3 opacity-60">
                <div className="w-16 h-px bg-white/50 mb-2"></div>
                <h2 className="text-white text-xl font-bold tracking-[0.6em] pl-[0.6em]">TINIG</h2>
                <p className="text-sky-200/50 text-xs font-mono tracking-widest uppercase">tinig.vercel.app</p>
             </div>
          </div>
      )}
    </>
  );
}