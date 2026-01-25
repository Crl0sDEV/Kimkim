"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, SkipForward, SkipBack, Square } from "lucide-react";

const PLAYLIST = [
  { title: "Tadhana - UDD", src: "/tadhana.mp3" },
  { title: "Pagsamo - Arthur Nery", src: "/pagsamo.mp3" },
  { title: "Glimpse of Us - Joji", src: "/glimpse.mp3" },
  { title: "Burnout - Johnoy Danao", src: "/burnout.mp3" },
  { title: "Those Eyes - New West", src: "/those-eyes.mp3" },
  { title: "Palagi - TJ Monterde", src: "/palagi.mp3" },
];

interface BackgroundMusicProps {
  startPlaying: boolean;
}

export default function BackgroundMusic({ startPlaying }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // --- FIX IS HERE ---
  // LISTEN FOR START SIGNAL (Autoplay logic)
  useEffect(() => {
    // Check if startPlaying is TRUE and we are NOT currently playing
    if (startPlaying && audioRef.current && !isPlaying) {
        audioRef.current.volume = 0.5;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise
            .then(() => setIsPlaying(true))
            .catch((error) => console.log("Autoplay prevented:", error));
        }
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPlaying]); 

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

  // STOP FUNCTION
  const stopMusic = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset sa simula
    }
    setIsPlaying(false); // Ito ay safe na ngayon, hindi na siya mag-a-autoplay ulit.
  };

  const playNext = () => {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= PLAYLIST.length) nextIndex = 0;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const playPrev = () => {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = PLAYLIST.length - 1; 
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  // Effect para mag-play agad pag lumipat ng kanta
  useEffect(() => {
    // Idagdag natin ang check na 'isPlaying' para sure na tutugtog lang pag naka-Play mode
    if (isPlaying && audioRef.current) {
        audioRef.current.src = currentTrack.src;
        audioRef.current.play();
    }
  }, [currentTrack.src, currentTrackIndex, isPlaying]);

  return (
    <div 
      className="absolute top-6 left-6 z-50 flex flex-col gap-2 pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onEnded={playNext} 
      />

      {/* PLAYER CONTAINER */}
      <div className={`flex items-center gap-2 p-2 rounded-full border transition-all duration-500 backdrop-blur-md overflow-hidden ${
         isPlaying || isHovered ? "w-[320px] bg-white/10 border-white/10" : "w-12 bg-transparent border-transparent"
      }`}>
        
        {/* MAIN TOGGLE (Play/Mute Icon) */}
        <button
          onClick={togglePlay}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
        >
          {isPlaying ? (
             <Volume2 size={14} className="text-sky-400 animate-pulse" />
          ) : (
             <VolumeX size={14} className="text-white/50" />
          )}
        </button>

        {/* CONTROLS & TEXT GROUP */}
        <div className={`flex items-center justify-between flex-1 gap-3 transition-opacity duration-500 ${
            isPlaying || isHovered ? "opacity-100 visible" : "opacity-0 invisible"
        }`}>
            
            <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest leading-none">
                    Now Playing
                </span>
                <span className="text-xs text-white font-medium truncate w-28" title={currentTrack.title}>
                    {currentTrack.title}
                </span>
            </div>

            {/* BUTTONS GROUP */}
            <div className="flex items-center gap-1">
                <button onClick={playPrev} className="p-1.5 hover:bg-white/10 rounded-full text-white/70 transition-colors" title="Previous">
                    <SkipBack size={12} fill="currentColor" />
                </button>

                <button onClick={stopMusic} className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/70 transition-colors" title="Stop">
                    <Square size={10} fill="currentColor" />
                </button>

                <button onClick={playNext} className="p-1.5 hover:bg-white/10 rounded-full text-white/70 transition-colors" title="Next">
                    <SkipForward size={12} fill="currentColor" />
                </button>
            </div>
        </div>

        {!isPlaying && !isHovered && (
             <span className="absolute left-14 text-[10px] font-mono uppercase text-white/30 tracking-widest whitespace-nowrap">
                Music Off
             </span>
        )}
      </div>
    </div>
  );
}