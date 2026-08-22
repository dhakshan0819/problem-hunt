import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, ArrowLeft, Crown, Shield, Star, Users, ChevronUp, ChevronDown, X, Sparkles, MapPin } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { fetchLeaderboard } from '../services/api';
import { PixelAvatar } from '../components/common/PixelAvatar';
import { POKEMON_ARCADE_MAP_BG, MASTER_BOSS_AVATAR } from '../components/map/mapAssets';
import { soundEngine } from '../services/audio';

interface LeaderboardPageProps {
  onBack?: () => void;
}

const STAGES = [
  { id: 0, label: 'ST-01', name: 'Ancient Gate', icon: '⛩️' },
  { id: 1, label: 'ST-02', name: 'Logic Forest', icon: '🌲' },
  { id: 2, label: 'ST-03', name: 'Loop Chamber', icon: '🔄' },
  { id: 3, label: 'ST-04', name: 'Pictograph Sanctuary', icon: '🖼️' },
  { id: 4, label: 'ST-05', name: 'Cyber Crime Scene', icon: '🔍' },
  { id: 5, label: 'ST-06', name: 'Prism Core', icon: '💎' },
  { id: 6, label: 'ST-07', name: 'Broken Lab', icon: '🧪' },
  { id: 7, label: 'ST-08', name: 'Shadow Alley', icon: '🕵️' },
  { id: 8, label: 'ST-09', name: 'UI/UX Studio', icon: '🎨' },
  { id: 9, label: 'ST-10', name: 'Design Lab', icon: '🔬' },
  { id: 10, label: 'ST-11', name: 'Stack Vault', icon: '🥞' },
  { id: 11, label: 'ST-12', name: 'Bitwise Labyrinth', icon: '⚡' },
  { id: 12, label: 'ST-13', name: 'Cipher Vault', icon: '🔐' },
  { id: 13, label: 'ST-14', name: 'Recursion Mirror', icon: '🪞' },
  { id: 14, label: 'ST-15', name: 'Memory Citadel', icon: '🏰' },
  { id: 15, label: 'ST-16', name: 'Matrix Nexus', icon: '🌐' },
  { id: 16, label: 'ST-17', name: 'Asynchronous Void', icon: '🌌' },
  { id: 17, label: 'ST-18', name: 'Threshold of NuLL', icon: '🔮' },
  { id: 18, label: 'BOSS', name: 'NuLL Master Fortress', icon: '💀' },
];

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [activeModalStage, setActiveModalStage] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchLeaderboard();
      setEntries(data || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to update leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500); // Live auto-sync
    return () => clearInterval(interval);
  }, []);

  // Compute 2D snake grid coordinates for single screen viewport (4 columns per row, 5 rows)
  const getNodePos = (index: number) => {
    const colCount = 4;
    const r = Math.floor(index / colCount); // row index 0 (bottom) to 4 (top)
    const isEvenRow = r % 2 === 0;
    const col = isEvenRow ? index % colCount : colCount - 1 - (index % colCount);

    const x = 12 + col * 25.3; // % X coordinate
    const y = 83 - r * 16.5;   // % Y coordinate (bottom up)
    return { x, y };
  };

  const modalStageInfo = activeModalStage !== null ? STAGES.find(s => s.id === activeModalStage) : null;
  const modalTeams = activeModalStage !== null ? entries.filter(t => (t.current_quest_index || 0) === activeModalStage) : [];

  return (
    <div
      className="h-screen w-screen bg-cover bg-center bg-no-repeat relative select-none font-mono text-white flex flex-col overflow-hidden"
      style={{ backgroundImage: `url(${POKEMON_ARCADE_MAP_BG})` }}
    >
      {/* Keyframe animation for traveling laser pulses */}
      <style>{`
        @keyframes energyTrailFlow {
          0% { stroke-dashoffset: 56; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-energy-stream {
          animation: energyTrailFlow 1.2s linear infinite;
        }
      `}</style>

      {/* PROJECTOR-OPTIMIZED TOP HEADER BAR */}
      <header className="relative z-40 px-4 sm:px-8 py-3 bg-black/90 backdrop-blur-md border-b-2 border-amber-500/50 flex items-center justify-between shadow-2xl flex-shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onBack();
              }}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 rounded-xl text-amber-300 font-extrabold text-sm transition-all active:scale-95 flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">RETURN TO GAME</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400 animate-pulse" />
            <h1 className="text-base sm:text-2xl font-black tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
              EXPEDITION OVERWORLD MAP LEADERBOARD
            </h1>
          </div>
        </div>

        {/* Center Live Player Stats Counter */}
        <div className="hidden lg:flex items-center gap-2.5 bg-amber-950/90 border-2 border-amber-500/60 px-4 py-1.5 rounded-2xl text-sm sm:text-base font-extrabold text-amber-300 shadow-xl">
          <Users className="w-5 h-5 text-amber-400 animate-bounce" />
          <span>{entries.length} TEAMS IN FIELD</span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-3 text-sm font-bold">
          <div className="flex items-center bg-black/90 border-2 border-white/30 rounded-2xl p-1 shadow-xl">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                viewMode === 'map'
                  ? 'bg-amber-500 text-black shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🗺️ OVERWORLD MAP
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-black shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📊 RANK TABLE
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-black/80 border border-white/20 px-3 py-1.5 rounded-xl text-xs sm:text-sm text-amber-300 font-bold">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* Main Single Screen Viewport */}
      <div className="flex-1 relative w-full h-full overflow-hidden z-10">
        
        {viewMode === 'map' ? (
          /* PROJECTOR-OPTIMIZED SINGLE-SCREEN MAP TRAIL */
          <div className="absolute inset-0 w-full h-full">
            
            {/* SVG MULTI-LAYERED HIGH-VISIBILITY LASER TRAIL */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="neonTrailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>

                <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {STAGES.map((_, idx) => {
                if (idx === STAGES.length - 1) return null;
                const pos1 = getNodePos(idx);
                const pos2 = getNodePos(idx + 1);

                return (
                  <g key={idx}>
                    {/* Layer 1: Thick Outer Beam Aura */}
                    <line
                      x1={`${pos1.x}%`}
                      y1={`${pos1.y}%`}
                      x2={`${pos2.x}%`}
                      y2={`${pos2.y}%`}
                      stroke="url(#neonTrailGrad)"
                      strokeWidth="14"
                      opacity="0.4"
                      filter="url(#laserGlow)"
                      strokeLinecap="round"
                    />

                    {/* Layer 2: Core High-Contrast Neon Laser Line */}
                    <line
                      x1={`${pos1.x}%`}
                      y1={`${pos1.y}%`}
                      x2={`${pos2.x}%`}
                      y2={`${pos2.y}%`}
                      stroke="url(#neonTrailGrad)"
                      strokeWidth="5"
                      opacity="1"
                      strokeLinecap="round"
                    />

                    {/* Layer 3: Animated Traveling Laser Stream */}
                    <line
                      x1={`${pos1.x}%`}
                      y1={`${pos1.y}%`}
                      x2={`${pos2.x}%`}
                      y2={`${pos2.y}%`}
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeDasharray="8 24"
                      strokeLinecap="round"
                      className="animate-energy-stream"
                    />
                  </g>
                );
              })}

              {/* Waypoint Energy Orbs */}
              {STAGES.map((_, idx) => {
                if (idx === STAGES.length - 1) return null;
                const pos1 = getNodePos(idx);
                const pos2 = getNodePos(idx + 1);
                const midX = (pos1.x + pos2.x) / 2;
                const midY = (pos1.y + pos2.y) / 2;

                return (
                  <circle
                    key={`orb-${idx}`}
                    cx={`${midX}%`}
                    cy={`${midY}%`}
                    r="6"
                    fill="#38bdf8"
                    filter="url(#laserGlow)"
                    className="animate-pulse"
                  />
                );
              })}
            </svg>

            {/* STAGE NODES & CLUSTER-SAFE PROJECTOR PLACEMENT */}
            {STAGES.map((stage) => {
              const pos = getNodePos(stage.id);
              const teamsHere = entries.filter((t) => (t.current_quest_index || 0) === stage.id);
              const isBoss = stage.id === 18;
              const displayLimit = 2; // Show top 2 directly on node to prevent screen cluttering
              const visibleTeams = teamsHere.slice(0, displayLimit);
              const hiddenCount = teamsHere.length - visibleTeams.length;

              return (
                <div
                  key={stage.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {/* TOP PLAYERS AT THIS STAGE */}
                  {teamsHere.length > 0 && (
                    <div className="flex flex-col items-center gap-1.5 mb-2 z-30">
                      
                      {/* Stack of Top 2 Nametags */}
                      <div className="flex flex-col items-center gap-1.5">
                        {visibleTeams.map((team) => (
                          <motion.div
                            key={team.team_name}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-black/95 border-2 border-white/40 shadow-[0_4px_20px_rgba(0,0,0,1)] rounded-xl px-3 py-1 font-mono flex items-center gap-2 whitespace-nowrap"
                          >
                            {team.rank === 1 ? (
                              <Crown className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                            ) : team.rank === 2 ? (
                              <Shield className="w-4 h-4 text-slate-300 fill-slate-300 flex-shrink-0" />
                            ) : team.rank === 3 ? (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                            ) : (
                              <span className="text-amber-400 text-xs font-black flex-shrink-0">#{team.rank}</span>
                            )}

                            <PixelAvatar avatarId={team.avatar_id || 'cyber_warrior'} size={20} />

                            <span className="text-white font-extrabold text-xs sm:text-sm tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                              {team.team_name}
                            </span>

                            <span className="text-black bg-emerald-400 font-black text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 shadow-md">
                              {team.score} PTS
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Clickable Badge for Cluster (e.g. 43 MORE TEAMS HERE) */}
                      {hiddenCount > 0 && (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            setActiveModalStage(stage.id);
                          }}
                          className="mt-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs px-3 py-1 rounded-full border-2 border-black shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>+{hiddenCount} MORE TEAMS (VIEW ALL {teamsHere.length})</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* LARGE STAGE NODE BADGE (CLICKABLE TO OPEN ROSTER MODAL) */}
                  <div
                    onClick={() => {
                      if (teamsHere.length > 0) {
                        soundEngine.playClick();
                        setActiveModalStage(stage.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border-2 shadow-2xl transition-all hover:scale-110 cursor-pointer ${
                      isBoss
                        ? 'bg-rose-950/95 border-rose-500 text-rose-300 ring-4 ring-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.8)]'
                        : teamsHere.length > 0
                        ? 'bg-amber-950/95 border-amber-400 text-amber-200 ring-4 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.7)]'
                        : 'bg-black/90 border-amber-500/50 text-amber-300 font-black'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{stage.icon}</span>
                    <span className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">
                      {stage.label}
                    </span>
                    {teamsHere.length > 0 && (
                      <span className="text-xs bg-amber-400 text-black font-black px-1.5 py-0.2 rounded-full ml-1 shadow-md">
                        {teamsHere.length}
                      </span>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        ) : (
          /* STANDARD RANK TABLE MODE FOR PROJECTOR BROADCAST */
          <div className="w-full max-w-5xl bg-black/95 backdrop-blur-md border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 mx-auto my-6 overflow-y-auto max-h-[85vh] scrollbar-thin scrollbar-thumb-amber-500/50">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-amber-400 flex items-center gap-2 tracking-wider">
                <Trophy className="w-6 h-6 text-amber-400" />
                ALL EXPEDITION PARTICIPANTS ({entries.length} TEAMS)
              </h2>
              <span className="text-xs sm:text-sm text-amber-300 font-mono font-bold">Ranked by Score & Progress</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {entries.map((entry) => (
                <div
                  key={entry.team_name}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    entry.rank === 1
                      ? 'bg-amber-500/20 border-amber-400 shadow-xl'
                      : entry.rank === 2
                      ? 'bg-gray-400/10 border-gray-400/50'
                      : entry.rank === 3
                      ? 'bg-amber-700/10 border-amber-600/50'
                      : 'bg-black/70 border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center font-black text-amber-300 text-sm flex-shrink-0">
                      #{entry.rank}
                    </div>
                    <PixelAvatar avatarId={entry.avatar_id || 'cyber_warrior'} size={32} />
                    <div className="truncate">
                      <div className="text-sm font-black text-white truncate">{entry.team_name}</div>
                      <div className="text-xs text-amber-300/80 font-bold truncate">{entry.current_location}</div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black text-amber-400">{entry.score} PTS</div>
                    <div className="text-xs text-emerald-400 font-mono font-bold">Stage #{(entry.current_quest_index || 0) + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FULL STAGE ROSTER MODAL FOR CLUSTERED TEAMS (E.G. 45 TEAMS AT ST-01) */}
      <AnimatePresence>
        {activeModalStage !== null && modalStageInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveModalStage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#090D18] border-4 border-amber-500 rounded-3xl p-6 shadow-[0_0_80px_rgba(245,158,11,0.5)] space-y-6 max-h-[85vh] flex flex-col font-mono"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b-2 border-amber-500/40 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{modalStageInfo.icon}</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider flex items-center gap-2">
                      {modalStageInfo.label}: {modalStageInfo.name.toUpperCase()}
                      <span className="text-xs px-3 py-1 rounded-full bg-amber-500 text-black font-extrabold">
                        {modalTeams.length} TEAMS HERE
                      </span>
                    </h2>
                    <p className="text-xs text-gray-300 font-bold mt-0.5">
                      Full live participant roster standing at this stage location
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalStage(null)}
                  className="p-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded-xl border border-amber-500/50 transition-all font-bold"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Grid of All Teams at this Stage (Neat 3-Column Layout for Projector) */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-2 scrollbar-thin scrollbar-thumb-amber-500/50">
                {modalTeams.map((team) => (
                  <div
                    key={team.team_name}
                    className="bg-black/80 border-2 border-amber-500/40 rounded-2xl p-3 flex items-center justify-between shadow-lg hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center font-black text-amber-300 text-xs flex-shrink-0">
                        #{team.rank}
                      </div>
                      <PixelAvatar avatarId={team.avatar_id || 'cyber_warrior'} size={28} />
                      <div className="truncate">
                        <div className="text-sm font-black text-white truncate">{team.team_name}</div>
                        <div className="text-xs text-emerald-400 font-bold">{team.score} PTS</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-white/10 text-center text-xs text-amber-300/80 font-bold">
                Click anywhere outside or press ESC to return to full overworld map view.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
