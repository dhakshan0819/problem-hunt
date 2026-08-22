import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, HelpCircle, ArrowRight, LogOut } from 'lucide-react';
import { soundEngine } from '../services/audio';
import { Team } from '../types';

interface LandingPageProps {
  onEnterHunt: () => void;
  onOpenAdmin: () => void;
  onOpenLeaderboard: () => void;
  activeTeam?: Team | null;
  onLogoutTeam?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterHunt,
  onOpenAdmin,
  onOpenLeaderboard,
  activeTeam,
  onLogoutTeam,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleStart = () => {
    soundEngine.playClick();
    onEnterHunt();
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between p-6 overflow-hidden">
      
      {/* Subtle Background Parallax Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Top Nav */}
      <nav className="w-full max-w-6xl flex items-center justify-between z-10 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-black text-base shadow-lg shadow-amber-500/20">
            CH
          </div>
          <span className="font-bold text-white tracking-widest text-sm sm:text-base font-mono">CODE HUNT</span>
          {activeTeam && (
            <span className="hidden sm:inline-block text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
              TEAM: {activeTeam.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {activeTeam && onLogoutTeam && (
            <button
              onClick={() => {
                soundEngine.playClick();
                if (window.confirm(`Log out team "${activeTeam.name}" session?`)) {
                  onLogoutTeam();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-mono text-rose-300 transition-all flex items-center gap-1"
              title="Log Out Team Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          )}

          <button
            onClick={onOpenLeaderboard}
            className="px-3.5 py-1.5 rounded-lg bg-hunt-surface hover:bg-hunt-elevated border border-white/10 text-xs font-mono text-hunt-textMuted hover:text-white transition-all"
          >
            LEADERBOARD
          </button>

          <button
            onClick={onOpenAdmin}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition-all"
          >
            MISSION CONTROL
          </button>
        </div>
      </nav>

      {/* Main Hero Content */}
      <main className="z-10 text-center max-w-3xl my-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-8">
            <Sparkles className="w-3.5 h-3.5" /> PROGRAMMING CLUB EVENT 2026
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 mb-6 drop-shadow-2xl">
            CODE HUNT
          </h1>

          <p className="text-lg sm:text-xl text-hunt-textMuted font-sans max-w-xl mx-auto leading-relaxed mb-10">
            "Every line hides a clue.<br />
            Every solution opens a path."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-lg rounded-2xl shadow-2xl shadow-amber-500/35 transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              <span>ENTER THE HUNT</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowHowToPlay(true)}
              className="w-full sm:w-auto px-8 py-5 bg-hunt-surface hover:bg-hunt-elevated border border-white/10 text-white font-mono font-semibold text-base rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>HOW TO PLAY</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer Info */}
      <footer className="z-10 text-xs text-hunt-textMuted font-mono py-4 text-center">
        SERVER AUTHORITATIVE ENGINE • ANCIENT RUINS & TERMINALS
      </footer>

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-hunt-surface border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-amber-400 font-mono flex items-center gap-2">
                <Compass className="w-5 h-5" /> HOW CODE HUNT WORKS
              </h3>
              <button onClick={() => setShowHowToPlay(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="space-y-4 text-sm text-hunt-textMuted font-sans leading-relaxed">
              <p>
                <strong className="text-white">1. Location Quests:</strong> Progress through 6 mysterious locations (The Ancient Gate, Logic Forest, Loop Chamber, Broken Lab, Cipher Vault, Final Temple).
              </p>
              <p>
                <strong className="text-white">2. Code Mechanics:</strong> Inspect programming snippets to solve logic puzzles, fix syntax bugs, and discover numeric or text keys.
              </p>
              <p>
                <strong className="text-white">3. Collect Fragments:</strong> Each solved level awards a secret letter fragment. You will need all 5 fragments for the Final Temple!
              </p>
              <p>
                <strong className="text-white">4. Lives & Hints:</strong> Each team starts with 3 lives and 2 hints. Incorrect attempts deduct lives (-50 pts). Using a hint costs 200 pts.
              </p>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowHowToPlay(false)}
                className="px-6 py-2.5 bg-amber-500 text-black font-mono font-bold rounded-xl text-sm"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
