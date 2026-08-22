import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GameHUD } from '../components/common/GameHUD';
import { WorldMap } from '../components/map/WorldMap';
import { BossArena } from '../components/boss/BossArena';
import { Terminal } from '../components/game/Terminal';
import { NumericKeypad } from '../components/game/NumericKeypad';
import { PathSelector } from '../components/game/PathSelector';
import { CodeEditor } from '../components/game/CodeEditor';
import { InteractiveDebugScreen } from '../components/game/InteractiveDebugScreen';
import { FragmentCollection } from '../components/game/FragmentCollection';
import { CountdownPenalty } from '../components/game/CountdownPenalty';
import { VictoryScreen } from '../components/game/VictoryScreen';
import { NetherPortalTransition } from '../components/game/NetherPortalTransition';
import { PictorialChallenge } from '../components/game/PictorialChallenge';
import { PausePage } from './PausePage';
import { Team, Quest, FragmentItem, AnswerResult } from '../types';
import { fetchCurrentQuest, submitAnswer, useHint, fetchCollectedFragments, fetchCurrentTeam, fetchEventConfig } from '../services/api';
import { soundEngine } from '../services/audio';

interface QuestPageProps {
  team: Team;
  onUpdateTeam: (team: Team) => void;
  onOpenLeaderboard: () => void;
  onLogout?: () => void;
}

export const QuestPage: React.FC<QuestPageProps> = ({ team, onUpdateTeam, onOpenLeaderboard, onLogout }) => {
  const bossPortalKey = `code_hunt_boss_portal_seen_${team.id || 'default'}`;
  const [hasSeenPortal, setHasSeenPortal] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(bossPortalKey) === 'true';
    } catch {
      return false;
    }
  });
  const [quest, setQuest] = useState<Quest | null>(null);
  const [fragments, setFragments] = useState<FragmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [unlockedStep, setUnlockedStep] = useState(false);
  const [multiKeyPrimaryVal, setMultiKeyPrimaryVal] = useState('');
  const [multiKeySecondaryVal, setMultiKeySecondaryVal] = useState('');
  const [textInputVal, setTextInputVal] = useState('');

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setTextInputVal('');
    setMultiKeyPrimaryVal('');
    setMultiKeySecondaryVal('');
  }, [quest?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const conf = await fetchEventConfig();
      if (conf && conf.event_status === 'PAUSED') {
        setIsPaused(true);
        return;
      } else {
        setIsPaused(false);
      }

      const updatedTeam = await fetchCurrentTeam();
      onUpdateTeam(updatedTeam);

      if (updatedTeam.status !== 'COMPLETED' && updatedTeam.current_quest_index < 18) {
        const q = await fetchCurrentQuest();
        setQuest(q);
        setHintText(q.hint_text || '');
      }

      const frags = await fetchCollectedFragments();
      setFragments(frags);
    } catch (err: any) {
      if (err.message && err.message.includes('PAUSED')) {
        setIsPaused(true);
      }
      if (err.message && err.message.includes('completed')) {
        // Quest 18 completed - team is ready for boss arena
        return;
      }
      console.error('Error loading quest data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      try {
        const conf = await fetchEventConfig();
        if (conf && conf.event_status === 'PAUSED') {
          setIsPaused(true);
        } else if (conf && conf.event_status === 'ACTIVE' && isPaused) {
          setIsPaused(false);
          loadData();
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleAnswerSubmit = async (val: string, secondaryVal?: string) => {
    if (!quest) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res: AnswerResult = await submitAnswer(quest.id, val, secondaryVal);

      if (res.is_correct) {
        soundEngine.playSuccess();
        soundEngine.playUnlockDoor();
        setFeedback({ message: res.message, isCorrect: true });
        setUnlockedStep(true);

        const refreshedTeam = await fetchCurrentTeam();
        onUpdateTeam(refreshedTeam);
        const frags = await fetchCollectedFragments();
        setFragments(frags);
      } else {
        soundEngine.playError();
        setFeedback({ message: res.message, isCorrect: false });
        const refreshedTeam = await fetchCurrentTeam();
        onUpdateTeam(refreshedTeam);
      }
    } catch (err: any) {
      soundEngine.playError();
      setFeedback({ message: err.message || 'Submission failed', isCorrect: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestHint = async () => {
    try {
      soundEngine.playClick();
      const res = await useHint();
      setHintText(res.hint_text);
      setShowHintModal(true);
      const refreshedTeam = await fetchCurrentTeam();
      onUpdateTeam(refreshedTeam);
    } catch (err: any) {
      alert(err.message || 'Failed to use hint');
    }
  };

  const handleContinueJourney = () => {
    soundEngine.playClick();
    setUnlockedStep(false);
    setFeedback(null);
    loadData();
  };

  if (isPaused) {
    return <PausePage onResume={() => { setIsPaused(false); loadData(); }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080B10]">
        <div className="text-center font-mono text-cyan-400">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <span>INITIALIZING EXPEDITION LEVEL...</span>
        </div>
      </div>
    );
  }

  const handlePortalComplete = () => {
    try {
      sessionStorage.setItem(bossPortalKey, 'true');
    } catch {}
    setHasSeenPortal(true);
  };

  // Final Boss Battle Stage unlocked when team completes all 18 precursor stages or is COMPLETED!
  if (team.status === 'COMPLETED' || team.current_quest_index >= 18) {
    if (team.status !== 'COMPLETED' && !hasSeenPortal) {
      return <NetherPortalTransition onComplete={handlePortalComplete} />;
    }

    return (
      <div className="min-h-screen bg-[#060910]">
        <GameHUD team={team} currentLocationName="NULL KING ARENA" onOpenLeaderboard={onOpenLeaderboard} onLogout={onLogout} />
        <main className="py-6">
          <BossArena team={team} fragments={fragments} onViewLeaderboard={onOpenLeaderboard} />
        </main>
      </div>
    );
  }

  if (team.status === 'RECOVERY') {
    return (
      <div className="min-h-screen bg-[#080B10]">
        <GameHUD team={team} currentLocationName={quest?.location_name || 'Recovery'} onOpenLeaderboard={onOpenLeaderboard} onLogout={onLogout} />
        <CountdownPenalty lockoutUntil={team.lockout_until} onLockoutEnd={loadData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      {/* Compact HUD Header */}
      <GameHUD team={team} currentLocationName={quest?.location_name || 'Ancient Ruins'} onOpenLeaderboard={onOpenLeaderboard} onLogout={onLogout} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Interactive World Map Pathway with Animated Character */}
        <WorldMap
          currentQuestIndex={team.current_quest_index}
          teamName={team.name}
          isLevelJustCompleted={unlockedStep}
        />

        {quest && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Terminal & Challenge */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quest Header Title */}
              <div className="bg-hunt-surface/90 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                    QUEST 0{quest.order_index + 1}
                  </span>
                  <button
                    onClick={handleRequestHint}
                    disabled={!hintText && (team.hints_remaining <= 0 || team.score < 200)}
                    className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{hintText ? 'VIEW HINT' : 'USE HINT (-200 pts)'}</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white mb-2">
                  {quest.title}
                </h1>
                <p className="text-sm text-hunt-textMuted font-sans">
                  {quest.description}
                </p>
              </div>

              {/* Pictorial Image / Visual Challenge View */}
              {(quest.image_url || quest.challenge_type === 'PICTOGRAM' || quest.challenge_type === 'GRAPHICAL_QUEST') && (
                <PictorialChallenge quest={quest} />
              )}

              {/* Code Terminal */}
              <Terminal
                title={`${quest.slug.toUpperCase()}.EXE`}
                narrative={quest.narrative}
                codeLanguage={quest.code_language}
                codeContent={quest.code_content}
              />

              {/* Feedback Banner */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl font-mono text-sm flex items-center gap-3 border ${
                    feedback.isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {feedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{feedback.message}</span>
                </motion.div>
              )}

              {/* Unlocked Success Sequence Overlay */}
              {unlockedStep ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-emerald-950/60 via-hunt-surface to-emerald-950/60 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4 shadow-2xl"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-emerald-400">THE PATH HAS OPENED</h3>
                  <p className="text-sm font-sans text-hunt-textMuted">
                    You have unlocked the mystery of {quest.location_name}. Discovered fragment:{' '}
                    <strong className="text-amber-400 font-mono text-lg">{quest.fragment_char}</strong>
                  </p>
                  <button
                    onClick={handleContinueJourney}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-mono font-bold text-base rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>CONTINUE EXPEDITION</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                /* Interactive Mechanics Component by Quest Challenge Type */
                <div className="mt-6">
                  {quest.challenge_type === 'NUMBER_KEYPAD' || quest.challenge_type === 'OUTPUT' ? (
                    <NumericKeypad onSubmit={(val) => handleAnswerSubmit(val)} isLoading={isSubmitting} />
                  ) : quest.challenge_type === 'PATH_SELECTION' ? (
                    <PathSelector
                      mode={
                        quest.slug === 'async-void' || quest.code_content?.includes('PATH A') || quest.title?.includes('PROMISE')
                          ? 'path_a_b'
                          : quest.code_content?.includes('NORTH')
                          ? 'directional'
                          : 'binary'
                      }
                      onSelectPath={(path) => handleAnswerSubmit(path)}
                      isLoading={isSubmitting}
                    />
                  ) : quest.challenge_type === 'DEBUG_FIX' ? (
                    <InteractiveDebugScreen initialCode={quest.code_content || ''} onSubmit={(editedCode) => handleAnswerSubmit(editedCode)} isLoading={isSubmitting} />
                  ) : quest.challenge_type === 'PASSWORD' || quest.challenge_type === 'PICTOGRAM' || quest.challenge_type === 'DETECTIVE_CASE' || quest.challenge_type === 'GRAPHICAL_QUEST' ? (
                    <div className={`bg-hunt-surface/90 rounded-2xl p-6 space-y-4 shadow-xl border ${
                      quest.slug === 'threshold-null'
                        ? 'border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.3)]'
                        : 'border-cyan-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2 ${
                          quest.slug === 'threshold-null' ? 'text-amber-400 font-black text-base' : 'text-cyan-400'
                        }`}>
                          {quest.slug === 'threshold-null'
                            ? '💥 THRESHOLD OF NuLL: BREAK THE FINAL SEAL'
                            : quest.challenge_type === 'DETECTIVE_CASE'
                            ? '🔍 DETECTIVE CASE DECRYPTION'
                            : quest.challenge_type === 'PICTOGRAM'
                            ? '🖼️ PICTOGRAM REBUS SOLUTION'
                            : quest.challenge_type === 'GRAPHICAL_QUEST'
                            ? '⚡ GRAPHICAL MATRIX SOLUTION'
                            : '🔐 TRANSMIT ACCESS CODE'}
                        </h3>
                        <span className="text-[10px] font-mono text-hunt-textMuted bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          CASE-INSENSITIVE
                        </span>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (textInputVal.trim()) {
                            handleAnswerSubmit(textInputVal.trim());
                          }
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-mono text-hunt-textMuted uppercase mb-1">
                            {quest.slug === 'threshold-null' ? 'Enter Master Secret Passphrase (cyberdetective)' : 'Enter Answer / Key Phrase'}
                          </label>
                          <input
                            type="text"
                            value={textInputVal}
                            onChange={(e) => setTextInputVal(e.target.value)}
                            placeholder={quest.slug === 'threshold-null' ? 'ENTER PASSPHRASE (e.g. CYBERDETECTIVE)...' : 'ENTER SOLUTION...'}
                            className={`w-full bg-[#070A10] border rounded-xl p-3.5 font-mono text-white text-base outline-none transition-all uppercase tracking-wider ${
                              quest.slug === 'threshold-null'
                                ? 'border-amber-500/60 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-amber-300 font-bold'
                                : 'border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                            }`}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting || !textInputVal.trim()}
                          className={`w-full py-4 font-mono font-bold text-base rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 ${
                            quest.slug === 'threshold-null'
                              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/40 text-lg uppercase font-black tracking-wider animate-pulse'
                              : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                          }`}
                        >
                          {isSubmitting
                            ? (quest.slug === 'threshold-null' ? 'SHATTERING SEAL...' : 'TRANSMITTING SOLUTION...')
                            : (quest.slug === 'threshold-null' ? '💥 BREAK FINAL SEAL & ENTER BOSS ARENA' : 'SUBMIT SOLUTION')}
                        </button>
                      </form>
                    </div>
                  ) : quest.challenge_type === 'MULTI_KEY' ? (
                    <div className="bg-hunt-surface/90 border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
                      <h3 className="text-base font-bold font-mono text-amber-400">MATRIX NEXUS REQUIRES TWO KEYS</h3>
                      <div>
                        <label className="block text-xs font-mono text-hunt-textMuted uppercase mb-1">KEY I: Main Diagonal Sum (1 + 4)</label>
                        <input
                          type="text"
                          value={multiKeyPrimaryVal}
                          onChange={(e) => setMultiKeyPrimaryVal(e.target.value)}
                          placeholder="ENTER KEY I..."
                          className="w-full bg-[#070A10] border border-white/10 rounded-xl p-3 font-mono text-white text-sm outline-none focus:border-amber-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-hunt-textMuted uppercase mb-1">KEY II: Matrix Determinant (ad - bc)</label>
                        <input
                          type="text"
                          value={multiKeySecondaryVal}
                          onChange={(e) => setMultiKeySecondaryVal(e.target.value)}
                          placeholder="ENTER KEY II..."
                          className="w-full bg-[#070A10] border border-white/10 rounded-xl p-3 font-mono text-amber-400 text-sm tracking-widest outline-none focus:border-amber-500 transition-all"
                        />
                      </div>
                      <button
                        onClick={() => handleAnswerSubmit(multiKeyPrimaryVal, multiKeySecondaryVal)}
                        disabled={isSubmitting || !multiKeyPrimaryVal || !multiKeySecondaryVal}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-base rounded-xl shadow-lg shadow-amber-500/25 transition-all disabled:opacity-40"
                      >
                        {isSubmitting ? 'VERIFYING MATRIX KEYS...' : 'SUBMIT KEYS & ADVANCE TO ST-17'}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

            </div>

            {/* Right Column: Discovered Fragments sidebar */}
            <div className="space-y-6">
              <FragmentCollection fragments={fragments} />
            </div>

          </div>
        )}

      </main>

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-hunt-surface border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4 text-amber-400 font-bold font-mono">
              <Lightbulb className="w-5 h-5" /> EXPEDITION HINT
            </div>
            <p className="text-sm font-sans text-hunt-textMuted leading-relaxed mb-6">
              "{hintText}"
            </p>
            <div className="text-right">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-6 py-2.5 bg-amber-500 text-black font-mono font-bold rounded-xl text-sm"
              >
                CLOSE HINT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
