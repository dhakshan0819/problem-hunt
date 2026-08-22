import React, { useState, useEffect } from 'react';
import { Heart, Lightbulb, Trophy, Volume2, VolumeX, LogOut } from 'lucide-react';
import { Team } from '../../types';
import { soundEngine } from '../../services/audio';
import { PixelAvatar } from './PixelAvatar';

interface GameHUDProps {
  team: Team;
  currentLocationName: string;
  onOpenLeaderboard?: () => void;
  onLogout?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ team, currentLocationName, onOpenLeaderboard, onLogout }) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [elapsedTime, setElapsedTime] = useState('00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() / 1000) - team.started_at);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setElapsedTime(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [team.started_at]);

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080B10]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Team */}
        <div className="flex items-center gap-3">
          <PixelAvatar avatarId={team.name} size={36} className="border-amber-400/60 shadow-amber-500/20" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-sm sm:text-base">CODE HUNT</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                {team.name}
              </span>
            </div>
            <p className="text-xs text-hunt-textMuted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{currentLocationName}</span>
            </p>
          </div>
        </div>

        {/* Stats (Lives, Hints, Score, Timer, Audio, Logout) */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Lives */}
          <div className="flex items-center gap-1" title="Expedition Lives">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                  idx < team.lives
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                    : 'text-gray-700 opacity-40'
                }`}
              />
            ))}
          </div>

          {/* Hints */}
          <div className="flex items-center gap-1.5 bg-hunt-surface px-2.5 py-1 rounded-md border border-white/10" title="Hints Remaining">
            <Lightbulb className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="text-xs sm:text-sm font-mono font-semibold text-amber-300">{team.hints_remaining}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 bg-hunt-surface px-3 py-1 rounded-md border border-amber-500/30 shadow-sm" title="Team Score">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-400">{team.score}</span>
          </div>

          {/* Timer */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-hunt-textMuted bg-hunt-surface px-2.5 py-1 rounded-md border border-white/5">
            <span>⏱️</span>
            <span>{elapsedTime}</span>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-md bg-hunt-surface hover:bg-hunt-elevated border border-white/10 text-hunt-textMuted hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={() => {
                soundEngine.playClick();
                if (window.confirm(`Log out team "${team.name}" session?`)) {
                  onLogout();
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-mono transition-all"
              title="Log Out Team Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
