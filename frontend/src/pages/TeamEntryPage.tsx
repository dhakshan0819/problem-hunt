import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { registerOrLoginTeam } from '../services/api';
import { Team } from '../types';
import { soundEngine } from '../services/audio';

interface TeamEntryPageProps {
  onTeamRegistered: (team: Team) => void;
  onBack: () => void;
}

export const TeamEntryPage: React.FC<TeamEntryPageProps> = ({ onTeamRegistered, onBack }) => {
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamCode.trim()) return;

    soundEngine.playClick();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const team = await registerOrLoginTeam(teamName.trim(), teamCode.trim().toUpperCase());
      setIsVerifying(true);
      soundEngine.playSuccess();

      setTimeout(() => {
        onTeamRegistered(team);
      }, 1500);
    } catch (err: any) {
      soundEngine.playError();
      setErrorMsg(err.message || 'Registration failed. Try a different team code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-hunt-textMuted hover:text-white bg-hunt-surface px-4 py-2 rounded-xl border border-white/10 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> BACK TO MAIN MENU
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-hunt-surface/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl shadow-amber-950/20 text-center"
      >

        {isVerifying ? (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold font-mono text-emerald-400 tracking-wider">IDENTITY VERIFIED</h2>
            <p className="text-xs text-hunt-textMuted font-mono">
              Expedition registered.<br />Preparing the hunt...
            </p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-2xl font-bold font-mono text-white tracking-wide mb-1">
              ENTER THE EXPEDITION
            </h2>
            <p className="text-xs text-hunt-textMuted mb-6 font-sans">
              Register your team or input your register number to resume progress.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono text-hunt-textMuted uppercase mb-1.5">STUDENT NAME</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Byte Raiders"
                  required
                  className="w-full bg-[#070A10] border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-hunt-textMuted uppercase mb-1.5">REGISTER NUMBER</label>
                <input
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 19909"
                  required
                  className="w-full bg-[#070A10] border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-mono text-amber-400 uppercase tracking-widest outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-base rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <span>CONNECTING...</span>
                ) : (
                  <>
                    <span>BEGIN JOURNEY</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

      </motion.div>
    </div>
  );
};
