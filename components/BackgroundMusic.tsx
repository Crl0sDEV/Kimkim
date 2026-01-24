"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, SkipForward, SkipBack } from "lucide-react";

// Dito mo ilalagay ang listahan ng MP3s mo
const PLAYLIST = [
  { title: "Tadhana - UDD", src: "/tadhana.mp3" },
  { title: "Pagsamo - Arthur Nery", src: "/pagsamo.mp3" },
  { title: "Glimpse of Us - Joji", src: "/glimpse.mp3" },
  { title: "Burnout - UDD", src: "/burnout.mp3" },
  { title: "Those Eyes - New West", src: "/those-eyes.mp3" },
  { title: "Palagi - TJ Monterde", src: "/palagi.mp3" },
];

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const currentTrack = PLAYLIST[currentTrackIndex];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      audioRef.current.volume = 0.5;
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= PLAYLIST.length) nextIndex = 0;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  // Function para sa Previous Track
  const playPrev = () => {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = PLAYLIST.length - 1; // Loop balik sa dulo
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  // Auto-play effect kapag nagbago ang track index
  useEffect(() => {
    if (isPlaying && audioRef.current) {
        audioRef.current.src = currentTrack.src;
        audioRef.current.play();
    }
  }, [currentTrack.src, currentTrackIndex, isPlaying]); // Mag-trigger lang kapag nagbago ang kanta

  return (
    <div 
      className="absolute top-6 left-6 z-50 flex flex-col gap-2 pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* HIDDEN AUDIO ELEMENT */}
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onEnded={playNext} // Pag natapos, next song agad
      />

      {/* PLAYER CONTAINER */}
      <div className={`flex items-center gap-2 p-2 pr-4 rounded-full border transition-all duration-500 backdrop-blur-md ${
         isPlaying ? "bg-white/10 border-white/10" : "bg-transparent border-transparent"
      }`}>
        
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
        >
          {isPlaying ? (
             <Volume2 size={14} className="text-sky-400 animate-pulse" />
          ) : (
             <VolumeX size={14} className="text-white/50" />
          )}
        </button>

        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-500 ${
            isPlaying || isHovered ? "w-auto opacity-100 max-w-50" : "w-0 opacity-0 max-w-0"
        }`}>
            
            <div className="flex flex-col">
                <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest leading-none">
                    Now Playing
                </span>
                <span className="text-xs text-white font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-30">
                    {currentTrack.title}
                </span>
            </div>

            <div className="flex gap-1">
                <button onClick={playPrev} className="p-1 hover:text-sky-300 text-white/70 transition-colors">
                    <SkipBack size={12} fill="currentColor" />
                </button>
                <button onClick={playNext} className="p-1 hover:text-sky-300 text-white/70 transition-colors">
                    <SkipForward size={12} fill="currentColor" />
                </button>
            </div>
        </div>

        {!isPlaying && !isHovered && (
             <span className="text-[10px] font-mono uppercase text-white/30 tracking-widest ml-1">
                Music Off
             </span>
        )}
      </div>
    </div>
  );
}