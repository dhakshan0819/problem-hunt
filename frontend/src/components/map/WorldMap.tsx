import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Shield } from 'lucide-react';
import { Checkpoint, CheckpointData } from './Checkpoint';
import { soundEngine } from '../../services/audio';
import { POKEMON_ARCADE_MAP_BG } from './mapAssets';

interface WorldMapProps {
  currentQuestIndex: number;
  teamName: string;
  onSelectCheckpoint?: (index: number) => void;
  isLevelJustCompleted?: boolean;
}

const MAP_CHECKPOINTS: CheckpointData[] = [
  { index: 0, title: 'The Ancient Gate | ST-01', category: 'start', iconName: '🚪', fragmentChar: 'C' },
  { index: 1, title: 'Logic Forest | ST-02', category: 'forest', iconName: '🌲', fragmentChar: 'Y' },
  { index: 2, title: 'Loop Chamber | ST-03', category: 'river', iconName: '🌀', fragmentChar: 'B' },
  { index: 3, title: 'Pictograph Sanctuary | ST-04', category: 'bridge', iconName: '🖼️', fragmentChar: 'E' },
  { index: 4, title: 'Cyber Crime Scene | ST-05', category: 'bridge', iconName: '🔍', fragmentChar: 'R' },
  { index: 5, title: 'Prism Core | ST-06', category: 'cave', iconName: '⚡', fragmentChar: 'D' },
  { index: 6, title: 'Broken Lab | ST-07', category: 'laboratory', iconName: '🔬', fragmentChar: 'E' },
  { index: 7, title: 'Shadow Alley | ST-08', category: 'cave', iconName: '🕵️', fragmentChar: 'T' },
  { index: 8, title: 'UI/UX Design Studio | ST-09', category: 'temple', iconName: '📱', fragmentChar: 'U' },
  { index: 9, title: 'Design Lab | ST-10', category: 'laboratory', iconName: '🎨', fragmentChar: 'H' },
  { index: 10, title: 'Stack Vault | ST-11', category: 'temple', iconName: '📦', fragmentChar: 'A' },
  { index: 11, title: 'Bitwise Labyrinth | ST-12', category: 'laboratory', iconName: '🔣', fragmentChar: 'C' },
  { index: 12, title: 'Cipher Vault | ST-13', category: 'laboratory', iconName: '🔐', fragmentChar: 'K' },
  { index: 13, title: 'Recursion Mirror | ST-14', category: 'temple', iconName: '🪞', fragmentChar: 'E' },
  { index: 14, title: 'Memory Citadel | ST-15', category: 'laboratory', iconName: '💾', fragmentChar: 'R' },
  { index: 15, title: 'Matrix Nexus | ST-16', category: 'temple', iconName: '🔢', fragmentChar: 'S' },
  { index: 16, title: 'Asynchronous Void | ST-17', category: 'temple', iconName: '⏳', fragmentChar: 'T' },
  { index: 17, title: 'Threshold of NuLL | ST-18', category: 'temple', iconName: '⚔️', fragmentChar: '★' },
  { index: 18, title: 'NuLL Master Fortress', category: 'boss', iconName: '👑' },
];

export const WorldMap: React.FC<WorldMapProps> = ({
  currentQuestIndex,
  teamName,
  onSelectCheckpoint,
  isLevelJustCompleted = false,
}) => {
  const [characterIndex, setCharacterIndex] = useState(currentQuestIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger celebration audio on completion
  useEffect(() => {
    if (isLevelJustCompleted) {
      soundEngine.playSuccess();
    }
    setCharacterIndex(currentQuestIndex);
  }, [currentQuestIndex, isLevelJustCompleted]);

  // Auto-scroll map container to center active flag checkpoint
  useEffect(() => {
    if (containerRef.current) {
      const stepWidth = 140;
      const scrollPos = Math.max(0, characterIndex * stepWidth - containerRef.current.clientWidth / 2 + stepWidth / 2);
      containerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, [characterIndex]);

  // Calculate position along track
  const totalNodes = MAP_CHECKPOINTS.length;
  const currentPosPercent = Math.min(100, Math.max(0, ((characterIndex + 0.5) / totalNodes) * 100));

  return (
    <div className="w-full bg-[#0b101d] border-4 border-amber-500/40 rounded-3xl p-4 shadow-[0_0_35px_rgba(245,158,11,0.25)] relative overflow-hidden select-none">

      {/* Header Info Banner */}
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-amber-500/30 pb-3 relative z-20 bg-[#111927]/90 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-amber-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl text-black shadow-md">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold font-mono text-white tracking-wider flex items-center gap-2">
              EXPEDITION WORLD REALM
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-[10px] font-mono text-amber-200/80">
              Quest Track
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-amber-500/20 border border-amber-500/50 text-amber-300 px-3.5 py-1.5 rounded-xl font-bold shadow-md flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            STAGE {Math.min(currentQuestIndex + 1, 16)} / 16
          </span>
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto pb-0 scrollbar-thin scrollbar-thumb-amber-500/40 scrollbar-track-transparent rounded-2xl border-2 border-amber-500/30 shadow-2xl bg-[#090e17]"
      >
        {/* PARALLAX LAYER: REALISTIC CITY SKYLINE BACKGROUND */}
        <div className="absolute top-0 inset-x-0 h-64 pointer-events-none overflow-hidden opacity-95">
          <div
            className="w-[3200px] h-full bg-repeat-x bg-cover bg-bottom shadow-inner"
            style={{ backgroundImage: `url(${POKEMON_ARCADE_MAP_BG})` }}
          />
          {/* Atmospheric Dusk Fog / Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090e17]/30 to-[#090e17]" />
        </div>

        {/* FLOATING ATMOSPHERIC PARTICLES */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 16 }).map((_, idx) => (
            <motion.div
              key={idx}
              className="absolute w-1.5 h-1.5 bg-amber-300/60 rounded-full blur-[0.5px]"
              animate={{
                x: [Math.random() * 800, Math.random() * 800 + 50, Math.random() * 800],
                y: [Math.random() * 220, Math.random() * 220 - 40, Math.random() * 220],
                opacity: [0.1, 0.8, 0.1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* TRACK & CHECKPOINT AREA */}
        <div className="relative min-w-[2200px] pt-32 pb-0 px-10 flex flex-col justify-end">

          {/* Active Progress Glowing Gold Trail Line */}
          <div className="absolute top-[164px] left-12 right-12 h-3.5 bg-amber-950/80 rounded-full overflow-hidden shadow-inner z-0 border border-amber-500/40 backdrop-blur-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 shadow-[0_0_15px_#f59e0b]"
              initial={{ width: '0%' }}
              animate={{ width: `${currentPosPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Checkpoint Flags */}
          <div className="relative z-10 flex items-center justify-between mb-2">
            {MAP_CHECKPOINTS.map((checkpoint) => {
              const status: 'completed' | 'current' | 'locked' =
                checkpoint.index < currentQuestIndex
                  ? 'completed'
                  : checkpoint.index === currentQuestIndex
                    ? 'current'
                    : 'locked';

              return (
                <div key={checkpoint.index} className="relative z-10">
                  <Checkpoint
                    data={checkpoint}
                    status={status}
                    onClick={() => onSelectCheckpoint && onSelectCheckpoint(checkpoint.index)}
                  />
                </div>
              );
            })}
          </div>

          {/* SLEEK METALLIC / OBSIDIAN SURFACE PLATFORM FLOOR */}
          <div className="w-full relative z-20 mt-1 shadow-2xl rounded-b-xl overflow-hidden border-t-2 border-amber-500/60 bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] h-12 flex items-center px-4">
            {/* Surface Grid Line Glow Texture */}
            <div className="w-full h-full bg-[linear-gradient(90deg,rgba(245,158,11,0.15)_1px,transparent_1px),linear-gradient(0deg,rgba(245,158,11,0.15)_1px,transparent_1px)] bg-[length:32px_12px]" />
          </div>

        </div>
      </div>
    </div>
  );
};
