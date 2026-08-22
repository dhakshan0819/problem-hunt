import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { PixelAvatar } from '../common/PixelAvatar';
import { MASTER_BOSS_AVATAR } from '../map/mapAssets';
import { Team } from '../../types';

interface FloatingDamage {
  id: number;
  text: string;
  isCrit: boolean;
  isPlayerHit: boolean;
}

interface ThreeDBattleStageProps {
  team: Team;
  bossHp: number;
  maxBossHp: number;
  playerHp: number;
  maxPlayerHp: number;
  isBossAttacking: boolean;
  isHeroAttacking?: boolean;
  isUltimateAttacking?: boolean;
  isBossHit: boolean;
  isBossDefeated: boolean;
  isHeroDefeated?: boolean;
  bossAttackName?: string;
  floatingDamages: FloatingDamage[];
}

export const ThreeDBattleStage: React.FC<ThreeDBattleStageProps> = ({
  team,
  bossHp,
  maxBossHp,
  playerHp,
  maxPlayerHp,
  isBossAttacking,
  isHeroAttacking,
  isUltimateAttacking,
  isBossHit,
  isBossDefeated,
  isHeroDefeated,
  bossAttackName,
  floatingDamages,
}) => {
  return (
    <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-[#060912] via-[#0D1222] to-[#04060C] rounded-3xl border-2 border-purple-500/40 overflow-hidden shadow-[0_0_60px_rgba(147,51,234,0.25)] flex flex-col justify-between">
      
      {/* Anime Speed Lines Overlay for Attack Phases */}
      <AnimatePresence>
        {(isHeroAttacking || isBossAttacking || isUltimateAttacking) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-25 pointer-events-none overflow-hidden"
            style={{
              backgroundImage: `radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 90%), repeating-conic-gradient(from 0deg, rgba(255,255,255,0.15) 0deg 2deg, transparent 2deg 15deg)`,
              backgroundPosition: 'center center',
            }}
          />
        )}
      </AnimatePresence>

      {/* Dynamic 3D Camera Focus for Ultimate Attack */}
      <AnimatePresence>
        {isUltimateAttacking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Floating Damage Numbers overlay */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        <AnimatePresence>
          {floatingDamages.map((d) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: d.isPlayerHit ? 180 : 80, scale: 0.5 }}
              animate={{ opacity: 1, y: d.isPlayerHit ? 120 : 30, scale: d.isCrit ? 1.6 : 1.2 }}
              exit={{ opacity: 0, y: d.isPlayerHit ? 80 : 0 }}
              transition={{ duration: 0.8 }}
              className={`absolute font-mono font-black text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(0,0,0,1)] ${
                d.isPlayerHit
                  ? 'left-1/4 text-rose-400'
                  : 'right-1/4 text-yellow-300'
              }`}
            >
              {d.text} {d.isCrit ? '💥 CRITICAL!' : ''}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ambient Anime Plasma Energy Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400/70 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
            style={{
              left: `${(i * 7.5) % 100}%`,
              top: `${(i * 12) % 100}%`,
            }}
            animate={{
              y: [0, -140],
              opacity: [0, 0.9, 0],
              scale: [0.6, 1.6, 0.4],
            }}
            transition={{
              duration: 2.5 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* 3D Tilted Floor Arena Plane */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ perspective: '1000px' }}
      >
        <div
          className="w-[140%] h-[120%] bg-[#080E1C] border-2 border-purple-500/40 shadow-[0_0_90px_rgba(168,85,247,0.4)] relative overflow-hidden"
          style={{
            transform: 'rotateX(55deg) translateY(40px)',
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3), transparent 70%),
              linear-gradient(to right, rgba(168, 85, 247, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          }}
        >
          {/* Glowing Center Arena Ring */}
          <div className="absolute inset-0 m-auto w-80 h-80 rounded-full border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.5)] animate-pulse" />
        </div>
      </div>

      {/* 3D Character Models & Animations Layer */}
      <div className="relative z-30 w-full h-full flex items-center justify-between px-8 sm:px-16 pt-6">
        
        {/* Left Side: 3D Hero Model (Moved Significantly Up) */}
        <div className="flex flex-col items-center relative -mt-16 sm:-mt-24">
          
          {/* Shadow Drop Under Hero */}
          <div className="w-24 h-6 rounded-full bg-black/60 blur-md border border-cyan-500/20 mb-[-12px] shadow-[0_0_20px_rgba(6,182,212,0.5)]" />

          {/* Hero Character Frame */}
          <motion.div
            animate={
              isHeroDefeated
                ? { rotate: 90, y: 30, opacity: 0.5 }
                : isHeroAttacking
                ? { x: [0, 160, 0], scale: [1, 1.25, 1] }
                : isUltimateAttacking
                ? { scale: [1, 1.4, 1.2], filter: 'drop-shadow(0 0 30px rgba(6,182,212,1))' }
                : { y: [0, -8, 0] }
            }
            transition={
              isHeroAttacking
                ? { duration: 0.6 }
                : isHeroDefeated
                ? { duration: 0.8 }
                : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            }
            className="relative flex flex-col items-center z-40"
          >
            {/* Hero Nametag (Above Avatar Image) */}
            <div className="mb-2 bg-[#0A101D]/90 border border-cyan-500/70 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.7)] flex items-center gap-1">
              <span>🛡️ {team.name} (HERO)</span>
            </div>

            {/* Pure Background-Free Hero Anime Sprite with Ethereal Cyber Aura */}
            <div className="relative flex items-center justify-center">
              {/* High Energy Cyan Plasma Backdrop */}
              <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-2xl animate-pulse pointer-events-none" />
              
              <img
                src="/assets/hero_avatar.png"
                alt={team.name}
                className="w-26 h-26 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain filter drop-shadow-[0_0_20px_rgba(34,211,238,1)] drop-shadow-[0_0_35px_rgba(59,130,246,0.9)] contrast-110"
              />

              {/* Boss Corrupted Crimson Sword Strike Slash Arc & Matrix Binary Code Attack (OVERLAYED DIRECTLY ON HERO) */}
              <AnimatePresence>
                {isBossAttacking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                    animate={{ opacity: [0, 1, 1, 0.9, 0], scale: [0.6, 1.3, 1.4, 1], rotate: [-15, 0, 5] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center -m-16 sm:-m-28 w-[320px] sm:w-[500px] h-72 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    {/* 1. Matrix Binary & Corrupted Code Rain Stream */}
                    <div className="absolute inset-0 flex items-center justify-around overflow-hidden pointer-events-none">
                      {['01001100', '0xNULL', '11010100', '404_VOID', 'CORRUPTED', '01010011', '0xDEADBEEF'].map((code, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ y: -80, opacity: 0 }}
                          animate={{
                            y: [-50, 160, 260],
                            opacity: [0, 1, 0.85, 0],
                            scale: [0.8, 1.3, 0.9]
                          }}
                          transition={{
                            duration: 0.55,
                            delay: idx * 0.05,
                            repeat: Infinity,
                            repeatDelay: 0.08
                          }}
                          className={`font-mono text-xs sm:text-sm font-extrabold tracking-widest ${
                            idx % 2 === 0
                              ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(34,197,94,1)]'
                              : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,1)]'
                          }`}
                        >
                          {code}
                        </motion.div>
                      ))}
                    </div>

                    {/* 2. SVG High-Energy Corrupted Sword Strike X-Slash Arc Directly Over Hero */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 260" fill="none">
                      <defs>
                        <filter id="matrixSwordGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="8" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Primary Slash Blade Stroke (Top-Right to Bottom-Left) Across Hero */}
                      <motion.path
                        d="M 460 20 Q 250 130 20 240"
                        stroke="#F43F5E"
                        strokeWidth="20"
                        strokeLinecap="round"
                        className="opacity-50 blur-md"
                      />
                      <motion.path
                        d="M 460 20 Q 250 130 20 240"
                        stroke="#FFFBEB"
                        strokeWidth="9"
                        strokeLinecap="round"
                        filter="url(#matrixSwordGlow)"
                        animate={{
                          d: [
                            "M 460 20 Q 250 130 20 240",
                            "M 460 30 Q 260 140 20 230",
                            "M 460 20 Q 250 130 20 240"
                          ]
                        }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                      />

                      {/* Secondary Intersecting Counter Slash Blade (Bottom-Right to Top-Left) Across Hero */}
                      <motion.path
                        d="M 460 240 Q 250 70 20 30"
                        stroke="#C084FC"
                        strokeWidth="18"
                        strokeLinecap="round"
                        className="opacity-50 blur-md"
                      />
                      <motion.path
                        d="M 460 240 Q 250 70 20 30"
                        stroke="#FFE4E6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        filter="url(#matrixSwordGlow)"
                      />

                      {/* Matrix Glitch Slash Sparks */}
                      <path
                        d="M 250 130 L 180 80 M 250 130 L 300 180 M 250 130 L 190 190"
                        stroke="#22C55E"
                        strokeWidth="5"
                        strokeLinecap="round"
                        filter="url(#matrixSwordGlow)"
                      />
                    </svg>

                    {/* 3. Hero Target Impact Detonation & Corrupted Energy Burst Ring */}
                    <motion.div
                      animate={{ scale: [0.4, 2.8, 0.5], opacity: [1, 0.9, 0] }}
                      transition={{ duration: 0.45 }}
                      className="absolute inset-0 m-auto w-36 h-36 rounded-full bg-rose-600/80 shadow-[0_0_130px_rgba(244,63,94,1),0_0_180px_rgba(168,85,247,0.95)] border-4 border-amber-300 blur-[1px] flex items-center justify-center"
                    >
                      <Zap className="w-16 h-16 text-amber-300 animate-spin" />
                    </motion.div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Hero Iron Man Unibeam / Repulsor Plasma Cannon Attack Effect */}
          <AnimatePresence>
            {(isHeroAttacking || isUltimateAttacking) && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.1, x: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0.9, 0],
                  scaleX: [0.1, 1.1, 1.3, 1],
                  x: [0, 140, 280, 360]
                }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute top-1/2 left-16 z-50 pointer-events-none transform -translate-y-1/2 origin-left flex items-center ${
                  isUltimateAttacking ? 'h-24 sm:h-32 w-[380px] sm:w-[580px]' : 'h-14 sm:h-20 w-[320px] sm:w-[480px]'
                }`}
              >
                {/* 1. Initial Repulsor Charge Node (Chest / Arm Arc Core) */}
                <div className={`absolute -left-6 top-1/2 -translate-y-1/2 rounded-full bg-white border-4 ${
                  isUltimateAttacking
                    ? 'w-20 h-20 sm:w-28 sm:h-28 border-amber-300 shadow-[0_0_100px_rgba(250,204,21,1),0_0_160px_rgba(34,211,238,1)]'
                    : 'w-14 h-14 sm:w-20 sm:h-20 border-cyan-300 shadow-[0_0_70px_rgba(34,211,238,1),0_0_110px_rgba(56,189,248,0.9)]'
                } flex items-center justify-center`}>
                  <Sparkles className={`w-8 h-8 sm:w-12 sm:h-12 ${isUltimateAttacking ? 'text-amber-400' : 'text-cyan-400'} animate-spin`} />
                  <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
                </div>

                {/* 2. Multi-Layer Concentric Plasma Unibeam Core */}
                <div className="relative w-full h-full flex items-center">
                  
                  {/* Outer Hyper-Glow Aura Field */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                    isUltimateAttacking
                      ? 'from-amber-500 via-rose-500 to-cyan-300 blur-xl opacity-90 shadow-[0_0_120px_rgba(245,158,11,1)]'
                      : 'from-cyan-500 via-sky-400 to-indigo-300 blur-lg opacity-85 shadow-[0_0_90px_rgba(34,211,238,1)]'
                  }`} />

                  {/* Secondary Energy Stream Buffer */}
                  <div className={`absolute inset-y-1.5 inset-x-2 rounded-full bg-gradient-to-r ${
                    isUltimateAttacking
                      ? 'from-amber-300 via-yellow-200 to-white border-y-4 border-amber-400'
                      : 'from-cyan-400 via-sky-200 to-white border-y-3 border-cyan-300'
                  } shadow-[0_0_50px_rgba(255,255,255,1)]`} />

                  {/* Blinding White High-Intensity Core Plasma Beam */}
                  <div className="absolute inset-y-3 inset-x-6 rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,1)] flex items-center justify-around overflow-hidden">
                    {/* Wavy Core Plasma Strands inside Beam */}
                    <motion.div
                      animate={{ x: [-100, 100], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 0.2, repeat: Infinity, ease: 'linear' }}
                      className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-80"
                    />
                  </div>

                  {/* 3. Concentric 3D Repulsor Shockwave Rings Traveling Down Beam */}
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-1/4 inset-y-0 w-12 border-4 border-dashed border-white rounded-full shadow-[0_0_30px_rgba(255,255,255,1)]"
                  />
                  <motion.div
                    animate={{ rotate: -360, scale: [1.2, 0.9, 1.2] }}
                    transition={{ duration: 0.25, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-2/4 inset-y-0 w-14 border-4 border-dotted border-amber-200 rounded-full shadow-[0_0_35px_rgba(251,191,36,0.9)]"
                  />
                  <motion.div
                    animate={{ rotate: 360, scale: [0.9, 1.5, 0.9] }}
                    transition={{ duration: 0.35, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-3/4 inset-y-0 w-16 border-4 border-dashed border-cyan-200 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.9)]"
                  />

                  {/* 4. Iron Man Sparkles & Floating Energy Embers */}
                  <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce -mt-8" />
                    <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse mt-10" />
                    <Sparkles className="w-7 h-7 text-white animate-spin -mt-12" />
                    <Sparkles className="w-6 h-6 text-amber-300 animate-ping mt-8" />
                  </div>

                  {/* 5. Leading Blast Cone Shockwave Head at Target */}
                  <div className={`absolute -right-6 top-1/2 -translate-y-1/2 rounded-[100%] ${
                    isUltimateAttacking
                      ? 'w-20 h-40 sm:w-28 sm:h-52 bg-amber-200 border-4 border-white shadow-[0_0_100px_rgba(255,255,255,1),0_0_150px_rgba(245,158,11,1)]'
                      : 'w-14 h-28 sm:w-20 sm:h-36 bg-cyan-200 border-4 border-white shadow-[0_0_80px_rgba(255,255,255,1),0_0_120px_rgba(34,211,238,1)]'
                  } blur-[1px] animate-pulse`} />

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Side: 3D Master Boss Model (Moved Significantly Down) */}
        <div className="flex flex-col items-center relative mt-16 sm:mt-24">
                  {/* 3D Anime Ground Summoning Circle (No Background Box!) */}
          <div className="absolute -bottom-8 w-56 h-16 sm:w-72 sm:h-20 lg:w-80 lg:h-24 rounded-[100%] bg-gradient-to-r from-purple-950/90 via-rose-950/90 to-indigo-950/90 border-2 border-purple-400 shadow-[0_0_60px_rgba(168,85,247,0.95)] flex items-center justify-center pointer-events-none">
            {/* Outer Rotating Anime Rune Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="w-48 h-12 sm:w-60 sm:h-14 lg:w-68 lg:h-16 rounded-[100%] border border-dashed border-cyan-400/90"
            />
            {/* Inner Counter-Rotating Rune Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
              className="w-36 h-9 sm:w-44 sm:h-10 lg:w-52 lg:h-12 rounded-[100%] border border-purple-400/80"
            />
            {/* Vertical Anime Plasma Beams */}
            <div className="absolute -top-44 w-48 h-48 bg-gradient-to-t from-purple-600/50 via-rose-500/25 to-transparent blur-md animate-pulse pointer-events-none" />
          </div>

          {/* Boss Character Frame - Floating 3D Anime Summoning */}
          <motion.div
            animate={
              isBossDefeated
                ? { rotate: 360, scale: 0, opacity: 0, y: 100 }
                : isBossHit
                ? { x: [0, -25, 20, -10, 0], filter: 'brightness(2) drop-shadow(0 0 45px rgba(244,63,94,1))' }
                : isBossAttacking
                ? { x: [0, -80, 0], scale: [1, 1.35, 1] }
                : { y: [0, -14, 0], scale: [1, 1.05, 1] }
            }
            transition={
              isBossDefeated
                ? { duration: 1.5 }
                : isBossHit
                ? { duration: 0.4 }
                : isBossAttacking
                ? { duration: 0.6 }
                : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
            }
            className="relative flex flex-col items-center z-40"
          >
            {/* Pure Background-Free Anime Sprite with Ethereal Plasma Aura */}
            <div className="relative flex items-center justify-center">
              {/* Anime High Energy Plasma Backdrop */}
              <div className="absolute inset-0 bg-purple-600/35 rounded-full blur-3xl animate-pulse pointer-events-none" />
              
              <img
                src={MASTER_BOSS_AVATAR}
                alt="NuLL King Boss"
                className="w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain filter drop-shadow-[0_0_30px_rgba(225,29,72,1)] drop-shadow-[0_0_55px_rgba(168,85,247,0.9)] contrast-110"
              />
            </div>

            {/* Boss Nametag */}
            <div className="mt-1 bg-rose-950/90 border border-rose-500/70 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.7)] flex items-center gap-1">
              <span>👑 NULL KING (ANIME BOSS)</span>
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
};
