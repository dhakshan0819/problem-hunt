import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Radio, Sparkles, Volume2, ArrowRight, Shield, Award, Compass } from 'lucide-react';
import { Team, EventConfig } from '../types';
import { PixelAvatar } from '../components/common/PixelAvatar';
import { soundEngine } from '../services/audio';
import { fetchEventConfig } from '../services/api';
import { PausePage } from './PausePage';

interface LobbyPageProps {
  team: Team;
  onStartQuest: () => void;
  onLogout: () => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({ team, onStartQuest, onLogout }) => {
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Poll event config to detect when Game Master starts the hunt
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const conf = await fetchEventConfig();
        setEventConfig(conf);
        if (conf && conf.event_status === 'ACTIVE') {
          soundEngine.playSuccess();
          onStartQuest();
        }
      } catch (err) {
        console.error('Error fetching event status in lobby:', err);
      }
    };

    checkConfig();
    const interval = setInterval(checkConfig, 2500);
    return () => clearInterval(interval);
  }, [onStartQuest]);

  const toggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsAudioMuted(muted);
  };

  if (eventConfig?.event_status === 'PAUSED') {
    return <PausePage onResume={onStartQuest} />;
  }

  return (
    <div className="min-h-screen bg-[#080B10] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Background Animated Arcade Grid & Glow Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#080B10] to-[#04060A] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b0d_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b0d_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, idx) => (
          <motion.div
            key={idx}
            className="absolute w-2 h-2 bg-amber-400/40 rounded-full blur-xs"
            animate={{
              x: [Math.random() * 1000, Math.random() * 1000 - 50, Math.random() * 1000],
              y: [Math.random() * 800, Math.random() * 800 - 100, Math.random() * 800],
              opacity: [0.2, 0.9, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Header Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase">
            LIVE STAGING LOBBY
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2.5 bg-hunt-surface hover:bg-hunt-elevated border border-white/10 rounded-xl text-amber-400 transition-all flex items-center gap-2 text-xs font-mono"
          >
            <Volume2 className="w-4 h-4" />
            {isAudioMuted ? 'UNMUTE AUDIO' : 'AUDIO ON'}
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-mono transition-all"
          >
            CHANGE REGISTRATION
          </button>
        </div>
      </div>

      {/* MAIN LOBBY CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-hunt-surface/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-xl relative z-10 text-center my-12"
      >
        {/* Animated Arcade Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wider mb-6 shadow-md">
          <Radio className="w-4 h-4 animate-pulse text-amber-400" />
          PLAYER STAGING ARENA
        </div>

        {/* TEAM DOSSIER */}
        <div className="bg-[#060911] border border-amber-500/30 rounded-2xl p-6 mb-6 relative overflow-hidden flex flex-col items-center">
          
          {/* Glowing Aura */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-cyan-500/20 rounded-full blur-2xl opacity-60 animate-pulse" />

          {/* 8-Bit Retro Avatar */}
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-amber-400/40 rounded-3xl blur-md animate-pulse" />
            <PixelAvatar avatarId={team.name} size={88} className="relative border-4 border-amber-400 rounded-2xl shadow-2xl" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-wider uppercase mb-1">
            {team.name}
          </h2>

          <div className="flex items-center gap-2 font-mono text-xs text-amber-300/90 mb-4 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/30">
            <span>REG CODE / ID:</span>
            <span className="font-bold text-amber-400">{team.registration_code}</span>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 w-full font-mono text-xs pt-3 border-t border-amber-500/20">
            <div className="bg-hunt-surface/80 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-hunt-textMuted block">STARTING SCORE</span>
              <span className="font-bold text-amber-400 text-sm">1,000 PTS</span>
            </div>
            <div className="bg-hunt-surface/80 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-hunt-textMuted block">LIVES REMAINING</span>
              <span className="font-bold text-emerald-400 text-sm">3 / 3</span>
            </div>
            <div className="bg-hunt-surface/80 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-hunt-textMuted block">STAGING STATUS</span>
              <span className="font-bold text-cyan-400 text-sm">READY</span>
            </div>
          </div>

        </div>

        {/* WAITING FOR GAME MASTER BANNER */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="font-bold text-white tracking-wide">WAITING FOR GAME MASTER TO START...</p>
                <p className="text-[11px] text-amber-200/80">
                  You are registered & staged. The game page will auto-launch the moment Mission Control starts the event!
                </p>
              </div>
            </div>
          </div>

          <div className="w-full py-4 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="tracking-wider uppercase">STAGING ACTIVE • AWAITING GAME MASTER LAUNCH SIGNAL</span>
          </div>
        </div>

      </motion.div>

      {/* Footer Game Vibe Tag */}
      <div className="relative z-10 text-center font-mono text-xs text-hunt-textMuted flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
        <span>CODE HUNT 2026 • PROGRAMMING CLUB ARCADE EDITION</span>
      </div>

    </div>
  );
};
