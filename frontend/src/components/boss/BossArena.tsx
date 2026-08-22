import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Skull, Trophy, Sparkles, RefreshCw, Award, ArrowRight, ShieldAlert, HeartPulse } from 'lucide-react';
import { BattleUI } from './BattleUI';
import { ChallengeEngine } from './ChallengeEngine';
import { soundEngine } from '../../services/audio';
import { defeatBoss } from '../../services/api';
import { Team, FragmentItem } from '../../types';

interface BossArenaProps {
  team: Team;
  fragments: FragmentItem[];
  onViewLeaderboard: () => void;
}

interface FloatingDamage {
  id: number;
  text: string;
  isCrit: boolean;
  isPlayerHit: boolean;
}

type TurnPhase = 'IDLE' | 'DEFEND_PROMPT' | 'DEFEND_PUZZLE' | 'ATTACK_PUZZLE' | 'EMERGENCY_HEAL_PUZZLE';

export const BossArena: React.FC<BossArenaProps> = ({ team, fragments, onViewLeaderboard }) => {
  const isAlreadyVictorious = team.status === 'COMPLETED';

  const bossIntroKey = `code_hunt_boss_intro_seen_${team.id || 'default'}`;
  const hasSeenIntroInSession = (() => {
    try {
      return sessionStorage.getItem(bossIntroKey) === 'true';
    } catch {
      return false;
    }
  })();

  const [inIntro, setInIntro] = useState(!isAlreadyVictorious && !hasSeenIntroInSession);
  const [showVideo, setShowVideo] = useState(false);

  const markIntroCompleted = () => {
    try {
      sessionStorage.setItem(bossIntroKey, 'true');
    } catch {}
  };

  const handleFinishVideo = () => {
    markIntroCompleted();
    setShowVideo(false);
  };
  const [bossHp, setBossHp] = useState(isAlreadyVictorious ? 0 : 5000);
  const maxBossHp = 5000;
  const [playerHp, setPlayerHp] = useState(100);
  const maxPlayerHp = 100;
  const [mana, setMana] = useState(20);
  const maxMana = 100;
  const [combo, setCombo] = useState(1);
  const [turn, setTurn] = useState(1);

  const [isShieldActive, setIsShieldActive] = useState(false);
  const [isBossAttacking, setIsBossAttacking] = useState(false);
  const [isHeroAttacking, setIsHeroAttacking] = useState(false);
  const [isUltimateAttacking, setIsUltimateAttacking] = useState(false);
  const [isBossHit, setIsBossHit] = useState(false);
  const [bossAttackName, setBossAttackName] = useState<string | undefined>(undefined);

  const [turnPhase, setTurnPhase] = useState<TurnPhase>('IDLE');
  const [chosenAction, setChosenAction] = useState<'attack' | 'heavy' | 'shield' | 'heal' | 'ultimate' | null>(null);
  const [activeChallengeAction, setActiveChallengeAction] = useState<'attack' | 'heavy' | 'shield' | 'heal' | 'ultimate' | null>(null);

  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([
    '⚔️ ENTERED NULL KING ARENA! PREPARE FOR POKEMON-STYLE TURN COMBAT!',
  ]);
  const [isVictory, setIsVictory] = useState(isAlreadyVictorious);
  const [hasTriggeredEmergencyHeal, setHasTriggeredEmergencyHeal] = useState(false);
  const [gbaDialogueText, setGbaDialogueText] = useState<string>(
    'NULL KING is watching intently! Select a combat command!'
  );

  const isRageMode = bossHp < 1000;

  // Intro cinematic timer (only if not already completed)
  useEffect(() => {
    if (isAlreadyVictorious || hasSeenIntroInSession) return;

    soundEngine.playBossRoar();
    const timer = setTimeout(() => {
      setInIntro(false);
      setShowVideo(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, [isAlreadyVictorious, hasSeenIntroInSession]);

  // Trigger confetti on victory
  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [isVictory]);

  const addFloatingDamage = (text: string, isCrit: boolean, isPlayerHit: boolean) => {
    const id = Date.now() + Math.random();
    setFloatingDamages((prev) => [...prev, { id, text, isCrit, isPlayerHit }]);
    setTimeout(() => {
      setFloatingDamages((prev) => prev.filter((d) => d.id !== id));
    }, 1200);
  };

  // Helper to trigger victory and persist to backend
  const handleVictory = async () => {
    setIsVictory(true);
    try {
      await defeatBoss();
      team.status = 'COMPLETED';
    } catch (e) {
      console.error('Error recording boss defeat:', e);
    }
  };

  // Player clicks action button in UI -> Opens 1 single challenge question
  const handleSelectAction = (action: 'attack' | 'heavy' | 'shield' | 'heal' | 'ultimate') => {
    if (turnPhase !== 'IDLE' || isVictory) return;

    if (action === 'heavy' && mana < 30) return;
    if (action === 'ultimate' && mana < 100) return;

    setChosenAction(action);
    setActiveChallengeAction(action);
    setTurnPhase('ATTACK_PUZZLE');
    setGbaDialogueText(`⚡ ANSWER THE CODE CHALLENGE TO CAST ${action.toUpperCase()}!`);
  };

  // Resolves the SINGLE question modal when solved
  const handleSolveChallenge = (isCorrect: boolean, category: string) => {
    const action = chosenAction || 'attack';
    setActiveChallengeAction(null);
    setTurnPhase('IDLE');
    setChosenAction(null);

    if (isCorrect) {
      // Trigger hero attack animation & visuals immediately
      if (action === 'ultimate') {
        setIsUltimateAttacking(true);
        setTimeout(() => setIsUltimateAttacking(false), 1200);
      } else if (action === 'attack' || action === 'heavy') {
        setIsHeroAttacking(true);
        setTimeout(() => setIsHeroAttacking(false), 650);
      }

      // Exact Damage calculation requested: 250 DMG per correct attack (500 for Heavy, 1250 for Ultimate)
      let baseDmg = 250;
      if (action === 'heavy') baseDmg = 500;
      if (action === 'ultimate') baseDmg = 1250;

      const isCrit = Math.random() < 0.2;
      const critMult = isCrit ? 1.4 : 1.0;
      const finalDmg = action === 'heal' || action === 'shield' ? 0 : Math.round(baseDmg * critMult);

      if (finalDmg > 0) {
        setIsBossHit(true);
        setTimeout(() => setIsBossHit(false), 500);
      }

      const newBossHp = Math.max(0, bossHp - finalDmg);
      setBossHp(newBossHp);

      if (finalDmg > 0) {
        addFloatingDamage(`-${finalDmg}`, isCrit, false);
        if (isCrit) soundEngine.playCritHit();
        else soundEngine.playSlash();
      }

      // Mana & HP adjustments
      if (action === 'heavy') setMana((m) => Math.max(0, m - 30));
      if (action === 'ultimate') setMana(0);
      if (action === 'heal') {
        const healAmt = 40;
        setPlayerHp((hp) => Math.min(maxPlayerHp, hp + healAmt));
        setMana((m) => Math.min(maxMana, m + 25));
        soundEngine.playHeal();
        addFloatingDamage(`+${healAmt} HP`, false, true);
      } else {
        setMana((m) => Math.min(maxMana, m + 15));
      }

      if (action === 'shield') {
        setIsShieldActive(true);
        soundEngine.playShield();
        addFloatingDamage('SHIELDED!', false, true);
      }

      setCombo((c) => c + 1);
      setTurn((t) => t + 1);

      const actionText = action.toUpperCase();
      const logMsg = finalDmg > 0
        ? `Turn ${turn}: ⚔️ HERO solved challenge & used ${actionText}! Dealt ${finalDmg} damage to NuLL King!`
        : `Turn ${turn}: ✨ HERO solved challenge & used ${actionText}!`;
      
      setBattleLog((prev) => [...prev, logMsg]);
      setGbaDialogueText(`✨ SUCCESS! ${actionText} ${finalDmg > 0 ? `dealt ${finalDmg} damage!` : 'applied successfully!'}`);

      // Check Boss Defeat
      if (newBossHp <= 0) {
        setGbaDialogueText(`🎉 NuLL KING HAS BEEN DEFEATED! THE CORRUPTION IS SHATTERED!`);
        setTimeout(() => handleVictory(), 1000);
        return;
      }

      // Boss Counter-Attack Phase after 800ms (0 HP reduced to user on correct answer!)
      setTimeout(() => {
        const bossAttacks = [
          'SYNTAX STORM', 'COMPILER OVERFLOW', 'NULL POINTER STRIKE',
          'SEGMENTATION SLASH', 'STACK OVERFLOW', 'MEMORY CORRUPTION'
        ];
        const atk = bossAttacks[Math.floor(Math.random() * bossAttacks.length)];
        setBossAttackName(atk);
        setIsBossAttacking(true);

        const bossDmg = 0; // Correct answer = 0 HP damage to user!

        setTimeout(() => {
          setIsBossAttacking(false);
          addFloatingDamage('BLOCKED!', false, true);
          setGbaDialogueText(`🛡️ PERFECT DEFENSE! Correct answer blocked NuLL King's ${atk}! 0 HP lost!`);
          setBattleLog((prev) => [...prev, `Turn ${turn}: 🛡️ Perfect Answer! Blocked ${atk} (0 Damage)!`]);
          if (action === 'shield') setIsShieldActive(false);
        }, 700);

      }, 850);

    } else {
      // Missed/Failed question
      soundEngine.playError();
      setGbaDialogueText(`❌ CHALLENGE FAILED! ${action.toUpperCase()} missed! NuLL King counter-attacks!`);
      setBattleLog((prev) => [...prev, `Turn ${turn}: ❌ Failed question! ${action.toUpperCase()} missed!`]);

      // Boss counter hit on failed question
      setTimeout(() => {
        const bossAttacks = ['SYNTAX STORM', 'COMPILER OVERFLOW', 'NULL POINTER STRIKE'];
        const atk = bossAttacks[Math.floor(Math.random() * bossAttacks.length)];
        setBossAttackName(atk);
        setIsBossAttacking(true);
        const bossDmg = 25;

        setTimeout(() => {
          setIsBossAttacking(false);
          soundEngine.playBossAttack();
          const newPlayerHp = Math.max(0, playerHp - bossDmg);
          setPlayerHp(newPlayerHp);
          addFloatingDamage(`-${bossDmg}`, false, true);
          setBattleLog((prev) => [...prev, `Turn ${turn}: 💥 Took ${bossDmg} damage from ${atk}!`]);
        }, 700);
      }, 500);
    }
  };



  // Emergency Heal Manual Button trigger when HP < 50%
  const handleEmergencyHeal = () => {
    if (playerHp < 50) {
      setChosenAction('heal');
      setTurnPhase('ATTACK_PUZZLE');
      setActiveChallengeAction('heal');
    }
  };

  if (inIntro) {
    return (
      <div
        onClick={() => {
          soundEngine.playBossRoar();
          setInIntro(false);
          setShowVideo(true);
        }}
        className="fixed inset-0 z-50 bg-[#04060A] flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="space-y-4 pointer-events-none"
        >
          <div className="w-24 h-24 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-500 animate-pulse shadow-[0_0_50px_rgba(225,29,72,0.8)]">
            <Skull className="w-12 h-12" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-mono text-rose-500 tracking-wider">
            WARNING: NULL KING AWAKENED
          </h1>
          <p className="text-sm font-mono text-gray-300 max-w-md mx-auto">
            "WHO DARES DISTURB THE NULL POINTER? PREPARE TO BE DEALLOCATED!"
          </p>
          <div className="w-48 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-rose-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5 }}
            />
          </div>
          <div className="text-xs font-mono text-rose-400/80 animate-pulse mt-2">
            ( Click anywhere to enter battle )
          </div>
        </motion.div>
      </div>
    );
  }

  if (showVideo) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
        {/* Fullscreen Boss Entry Cutscene Video with Autoplay Resilience */}
        <video
          ref={(videoEl) => {
            if (videoEl) {
              const playPromise = videoEl.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
                  // If browser autoplay policy blocks unmuted video after page refresh,
                  // fallback to muted play so the video plays without freezing!
                  videoEl.muted = true;
                  videoEl.play().catch(() => {});
                });
              }
            }
          }}
          src="/assets/boss_entry.mp4"
          autoPlay
          playsInline
          onEnded={handleFinishVideo}
          onError={handleFinishVideo}
          className="w-full h-full object-cover sm:object-contain"
        />

        {/* Skip Cutscene Button */}
        <button
          onClick={handleFinishVideo}
          className="absolute top-6 right-6 z-50 px-5 py-2.5 bg-rose-950/90 hover:bg-rose-900 border-2 border-rose-500 rounded-full text-white text-xs font-mono font-bold shadow-[0_0_30px_rgba(225,29,72,0.9)] flex items-center gap-2 transition-all active:scale-95"
        >
          <span>SKIP CUTSCENE</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Cinematic Subtitle Banner */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 bg-black/80 border border-rose-500/60 px-6 py-2.5 rounded-full text-center pointer-events-none shadow-[0_0_30px_rgba(225,29,72,0.4)]">
          <div className="text-xs sm:text-sm font-mono text-rose-400 font-extrabold uppercase tracking-widest animate-pulse">
            👑 NULL KING SUMMONING SEQUENCE IN PROGRESS...
          </div>
        </div>
      </div>
    );
  }

  if (isVictory) {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-gradient-to-b from-amber-950/80 via-hunt-surface to-black border-2 border-amber-400 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_80px_rgba(245,158,11,0.4)]"
        >
          <div className="w-20 h-20 bg-amber-400/20 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto text-amber-400 shadow-2xl">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              MISSION COMPLETE — VICTORY!
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-2">
              NULL KING DEFEATED!
            </h1>
            <p className="text-xs sm:text-sm font-sans text-gray-300 mt-1">
              You vanquished the Supreme Corrupted Entity and completed the Code Hunt Expedition!
            </p>
          </div>

          {/* Achievement Badge Unlocks */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" /> CHAMPION BADGES UNLOCKED
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-white">
              <span className="bg-purple-950 border border-purple-500/40 px-3 py-1 rounded-full">🐛 Bug Hunter</span>
              <span className="bg-cyan-950 border border-cyan-500/40 px-3 py-1 rounded-full">🌀 Loop Master</span>
              <span className="bg-emerald-950 border border-emerald-500/40 px-3 py-1 rounded-full">🔮 Array Wizard</span>
              <span className="bg-amber-950 border border-amber-500/40 px-3 py-1 rounded-full">👑 Null Slayer</span>
            </div>
          </div>

          {/* Physical Clue Vault Code */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-400/40 rounded-2xl p-4">
            <div className="text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold">PHYSICAL CLUE SECRET CODE</div>
            <div className="text-xl font-mono font-black text-amber-400 mt-1 select-all">CHAMPION-PHYSICAL-TOKEN-2026</div>
            <div className="text-[10px] text-gray-400 font-mono mt-1">Present this token code to the event admin for physical reward!</div>
          </div>

          {/* Team Score */}
          <div className="text-2xl font-mono font-black text-amber-400">
            FINAL EXPEDITION SCORE: {team.score} PTS
          </div>

          <button
            onClick={onViewLeaderboard}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-base rounded-2xl shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>VIEW EVENT LEADERBOARD</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  // Blood Splash Game Over View when Player HP reaches 0
  if (playerHp <= 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0002] flex items-center justify-center p-4 overflow-hidden">
        {/* Blood Splatter Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.45)_0%,transparent_75%)] animate-pulse pointer-events-none" />
        
        {/* Animated Dripping Blood Drops */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-red-600/80 rounded-full blur-[1px]"
              style={{
                width: `${12 + (i % 4) * 8}px`,
                height: `${24 + (i % 3) * 16}px`,
                left: `${(i * 4.2) % 100}%`,
                top: `${(i * 6.5) % 100}%`,
              }}
              animate={{
                y: [0, 60, 120],
                opacity: [0.9, 0.5, 0],
                scaleY: [1, 1.4, 0.8],
              }}
              transition={{
                duration: 2.2 + (i % 3),
                repeat: Infinity,
                delay: i * 0.12,
              }}
            />
          ))}
        </div>

        {/* Game Over Card */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="max-w-md w-full bg-[#1A0406] border-4 border-red-600 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_100px_rgba(225,29,72,0.9)] relative z-10 font-mono"
        >
          <div className="w-24 h-24 bg-red-600/30 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.8)] animate-pulse">
            <Skull className="w-12 h-12" />
          </div>

          <div>
            <div className="text-xs font-black text-red-400 bg-red-950 border border-red-800 px-3 py-1 rounded-full inline-block uppercase tracking-widest">
              ☠️ SYSTEM MEMORY CRASH
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-red-500 tracking-wider mt-3 drop-shadow-[0_0_25px_rgba(239,68,68,1)]">
              GAME OVER
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 font-mono leading-relaxed">
              NuLL King's corrupted attack depleted your health to <span className="text-red-500 font-bold">0 HP</span>!
            </p>
          </div>

          <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3 text-red-300 text-xs font-bold font-mono">
            ⚠️ Retrying the Boss Battle incurs a penalty of <span className="text-amber-400 font-extrabold">-1000 Trophies</span>!
          </div>

          <button
            onClick={() => {
              team.score = Math.max(0, (team.score || 0) - 1000);
              setPlayerHp(100);
              setMana(20);
              setTurnPhase('IDLE');
              setGbaDialogueText('⚠️ RETRIED BATTLE (-1000 TROPHIES PENALTY)! Select a combat move to fight NuLL King!');
              setBattleLog((prev) => [...prev, '⚠️ RETRIED BOSS BATTLE: -1000 Trophies deducted!']);
            }}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-base rounded-2xl border border-red-400 shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>RETRY BOSS BATTLE (-1000 PTS)</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Pokemon GBA Style Dialogue / Event Banner Box */}
      <div className="bg-gradient-to-r from-amber-950/60 via-[#0B0F1A] to-purple-950/60 border-2 border-amber-400/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-xl flex-shrink-0 animate-pulse">
            🎮
          </div>
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              POKEMON GBA BATTLE SYSTEM — TURN {String(turn).padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">
              {gbaDialogueText}
            </div>
          </div>
        </div>

        {/* Low HP Emergency Health Button */}
        {playerHp < 50 && (
          <button
            onClick={handleEmergencyHeal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl border border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)] flex items-center gap-1.5 animate-bounce flex-shrink-0"
          >
            <HeartPulse className="w-4 h-4" />
            <span>EMERGENCY HEAL (20%)</span>
          </button>
        )}
      </div>

      {/* Main Battle UI */}
      <BattleUI
        team={team}
        bossHp={bossHp}
        maxBossHp={maxBossHp}
        playerHp={playerHp}
        maxPlayerHp={maxPlayerHp}
        mana={mana}
        maxMana={maxMana}
        combo={combo}
        turn={turn}
        isRageMode={isRageMode}
        isBossAttacking={isBossAttacking}
        isHeroAttacking={isHeroAttacking}
        isUltimateAttacking={isUltimateAttacking}
        isBossHit={isBossHit}
        isBossDefeated={bossHp <= 0 || isVictory}
        isHeroDefeated={playerHp <= 0}
        bossAttackName={bossAttackName}
        floatingDamages={floatingDamages}
        battleLog={battleLog}
        fragments={fragments}
        onSelectAction={handleSelectAction}
      />

      {/* Active Challenge Modal */}
      {activeChallengeAction && (
        <ChallengeEngine
          actionType={activeChallengeAction}
          onSolve={handleSolveChallenge}
          onCancel={() => {
            setActiveChallengeAction(null);
            setTurnPhase('IDLE');
            setChosenAction(null);
          }}
        />
      )}

    </div>
  );
};
