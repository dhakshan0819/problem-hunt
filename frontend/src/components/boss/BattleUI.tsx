import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Zap, Shield, Heart, Sparkles, Backpack, Flame, Scroll, ArrowLeft } from 'lucide-react';
import { ThreeDBattleStage } from './ThreeDBattleStage';
import { PixelAvatar } from '../common/PixelAvatar';
import { Team, FragmentItem } from '../../types';

interface FloatingDamage {
  id: number;
  text: string;
  isCrit: boolean;
  isPlayerHit: boolean;
}

interface BattleUIProps {
  team: Team;
  bossHp: number;
  maxBossHp: number;
  playerHp: number;
  maxPlayerHp: number;
  mana: number;
  maxMana: number;
  combo: number;
  turn: number;
  isRageMode: boolean;
  isBossAttacking: boolean;
  isHeroAttacking?: boolean;
  isUltimateAttacking?: boolean;
  isBossHit: boolean;
  isBossDefeated?: boolean;
  isHeroDefeated?: boolean;
  bossAttackName?: string;
  floatingDamages: FloatingDamage[];
  battleLog: string[];
  fragments: FragmentItem[];
  onSelectAction: (actionType: 'attack' | 'heavy' | 'shield' | 'heal' | 'ultimate') => void;
  onUseHint?: () => void;
}

export const BattleUI: React.FC<BattleUIProps> = ({
  team,
  bossHp,
  maxBossHp,
  playerHp,
  maxPlayerHp,
  mana,
  maxMana,
  combo,
  turn,
  isRageMode,
  isBossAttacking,
  isHeroAttacking,
  isUltimateAttacking,
  isBossHit,
  isBossDefeated = false,
  isHeroDefeated = false,
  bossAttackName,
  floatingDamages,
  battleLog,
  fragments,
  onSelectAction,
  onUseHint,
}) => {
  const [showInventory, setShowInventory] = useState(false);
  const [menuMode, setMenuMode] = useState<'MAIN' | 'FIGHT'>('MAIN');

  const bossHpPercent = Math.max(0, (bossHp / maxBossHp) * 100);
  const playerHpPercent = Math.max(0, (playerHp / maxPlayerHp) * 100);
  const manaPercent = Math.max(0, (mana / maxMana) * 100);

  const badges = [
    { title: 'Bug Hunter', icon: '🐛', desc: 'Resolved complex code errors' },
    { title: 'Loop Master', icon: '🌀', desc: 'Mastered iteration logic' },
    { title: 'Array Wizard', icon: '🔮', desc: 'Decoded ASCII memory arrays' },
    { title: 'Cipher King', icon: '🔐', desc: 'Broke all vault locks' },
  ];

  // Latest dialogue string to show in retro GBA speech box
  const latestLog = battleLog[battleLog.length - 1] || `What will ${team.name} do?`;

  return (
    <div className="w-full bg-[#050914] border-4 border-[#283848] rounded-3xl p-3 sm:p-5 shadow-[0_0_80px_rgba(147,51,234,0.3)] space-y-4 relative overflow-hidden font-mono">
      
      {/* 3D Battle Arena Stage with GBA Overlay Status Cards */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30">
        
        {/* Top-Right: Opponent (NuLL KING) GBA Status Card (Behind Boss Image) */}
        <div className="absolute top-3 right-3 z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#E4ECE0] border-4 border-[#1B2B1B] rounded-2xl p-2.5 sm:p-3 text-black shadow-[4px_4px_0px_#0A120A] w-56 sm:w-72"
          >
            <div className="flex items-center justify-between font-extrabold text-xs sm:text-sm tracking-wider">
              <span className="flex items-center gap-1 text-[#1B2B1B] uppercase">👑 NuLL KING</span>
              <span className="text-[10px] sm:text-xs font-black text-rose-800 bg-rose-200 border border-rose-400 px-1.5 py-0.5 rounded">Lv.99</span>
            </div>
            <div className="mt-1.5 bg-[#1B2B1B] rounded-full p-1 border border-[#2B3B2B] flex items-center gap-2">
              <span className="text-[8px] sm:text-[9px] font-black text-[#F8F8D8] bg-[#D84030] px-1.5 rounded">HP</span>
              <div className="flex-1 h-2 sm:h-2.5 bg-[#405040] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full transition-all duration-500 ${
                    bossHpPercent > 50 ? 'bg-emerald-500' : bossHpPercent > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
                  }`}
                  animate={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right text-[10px] font-bold text-[#2B3B2B] mt-0.5">{bossHp} / {maxBossHp} HP</div>
          </motion.div>
        </div>

        {/* Bottom-Left: Hero GBA Status Card (Under Hero on Left) */}
        <div className="absolute bottom-3 left-3 z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#E4ECE0] border-4 border-[#1B2B1B] rounded-2xl p-2.5 sm:p-3 text-black shadow-[4px_4px_0px_#0A120A] w-56 sm:w-72"
          >
            <div className="flex items-center justify-between font-extrabold text-xs sm:text-sm tracking-wider">
              <span className="flex items-center gap-1.5 text-[#1B2B1B] uppercase">
                <img src="/assets/hero_avatar.png" alt="Hero" className="w-5 h-5 rounded-full object-cover border border-[#1B2B1B] shadow-sm" />
                {team.name}
              </span>
              <span className="text-[10px] sm:text-xs font-black text-emerald-800 bg-emerald-200 border border-emerald-400 px-1.5 py-0.5 rounded">Lv.50</span>
            </div>
            <div className="mt-1.5 bg-[#1B2B1B] rounded-full p-1 border border-[#2B3B2B] flex items-center gap-2">
              <span className="text-[8px] sm:text-[9px] font-black text-[#F8F8D8] bg-[#D84030] px-1.5 rounded">HP</span>
              <div className="flex-1 h-2 sm:h-2.5 bg-[#405040] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full transition-all duration-500 ${
                    playerHpPercent > 50 ? 'bg-emerald-500' : playerHpPercent > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
                  }`}
                  animate={{ width: `${playerHpPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right text-[10px] font-bold text-[#2B3B2B] mt-0.5">{playerHp} / {maxPlayerHp} HP</div>
            
            {/* MANA / EXP Energy Line */}
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[8px] font-black text-cyan-800">MP</span>
              <div className="flex-1 h-1.5 bg-gray-300 rounded-full overflow-hidden border border-gray-400">
                <motion.div className="h-full bg-cyan-500 transition-all duration-300" animate={{ width: `${manaPercent}%` }} />
              </div>
              <span className="text-[9px] font-bold text-cyan-900">{mana} MP</span>
            </div>
          </motion.div>
        </div>

        {/* 3D Battle Stage Canvas */}
        <ThreeDBattleStage
          team={team}
          bossHp={bossHp}
          maxBossHp={maxBossHp}
          playerHp={playerHp}
          maxPlayerHp={maxPlayerHp}
          isBossAttacking={isBossAttacking}
          isHeroAttacking={isHeroAttacking}
          isUltimateAttacking={isUltimateAttacking}
          isBossHit={isBossHit}
          isBossDefeated={isBossDefeated}
          isHeroDefeated={isHeroDefeated}
          bossAttackName={bossAttackName}
          floatingDamages={floatingDamages}
        />
      </div>

      {/* GBA Dual Control Panel (Speech Box Left + Command Grid Right) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
        
        {/* Left 3/5: GBA Retro Speech / Dialogue Window */}
        <div className="md:col-span-3 bg-[#0C182B] border-4 border-[#3B4D68] rounded-2xl p-4 flex flex-col justify-between shadow-[4px_4px_0px_#040810] min-h-[120px]">
          <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold tracking-widest border-b border-white/10 pb-1 mb-2 uppercase">
            <span>BATTLE NARRATIVE • TURN {String(turn).padStart(2, '0')}</span>
            {combo > 1 && (
              <span className="text-amber-300 font-black bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> COMBO x{combo}
              </span>
            )}
          </div>
          
          <div className="text-sm sm:text-base text-white font-extrabold leading-relaxed flex-1 flex items-center">
            {latestLog}
          </div>

          <div className="text-[10px] text-gray-400 font-mono mt-1 text-right italic">
            Select a battle command from the menu ▶
          </div>
        </div>

        {/* Right 2/5: GBA Classic Command Menu Box */}
        <div className="md:col-span-2 bg-[#F8F8F0] border-4 border-[#283820] rounded-2xl p-3 text-[#1B2B1B] shadow-[4px_4px_0px_#0A120A] flex flex-col justify-between">
          
          {menuMode === 'MAIN' ? (
            <div className="grid grid-cols-2 gap-2 h-full">
              
              {/* FIGHT */}
              <button
                onClick={() => setMenuMode('FIGHT')}
                className="p-3 bg-[#E8F0E0] hover:bg-[#D0E4C8] border-2 border-[#283820] rounded-xl flex items-center gap-2 text-left font-black text-sm text-[#1B2B1B] transition-all active:scale-95 shadow-sm"
              >
                <span className="text-rose-600 font-black text-base">▶</span>
                <div className="flex items-center gap-1">
                  <Sword className="w-4 h-4 text-rose-600" />
                  <span>FIGHT</span>
                </div>
              </button>

              {/* SHIELD */}
              <button
                onClick={() => onSelectAction('shield')}
                className="p-3 bg-[#E8F0E0] hover:bg-[#D0E4C8] border-2 border-[#283820] rounded-xl flex items-center gap-2 text-left font-black text-sm text-[#1B2B1B] transition-all active:scale-95 shadow-sm"
              >
                <span className="text-blue-600 font-black text-base">▶</span>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>SHIELD</span>
                </div>
              </button>

              {/* HEAL */}
              <button
                onClick={() => onSelectAction('heal')}
                className="p-3 bg-[#E8F0E0] hover:bg-[#D0E4C8] border-2 border-[#283820] rounded-xl flex items-center gap-2 text-left font-black text-sm text-[#1B2B1B] transition-all active:scale-95 shadow-sm"
              >
                <span className="text-emerald-600 font-black text-base">▶</span>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>HEAL</span>
                </div>
              </button>

              {/* BAG */}
              <button
                onClick={() => setShowInventory(true)}
                className="p-3 bg-[#E8F0E0] hover:bg-[#D0E4C8] border-2 border-[#283820] rounded-xl flex items-center gap-2 text-left font-black text-sm text-[#1B2B1B] transition-all active:scale-95 shadow-sm"
              >
                <span className="text-amber-600 font-black text-base">▶</span>
                <div className="flex items-center gap-1">
                  <Backpack className="w-4 h-4 text-amber-600" />
                  <span>BAG</span>
                </div>
              </button>

            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black text-[#1B2B1B] border-b border-[#283820]/20 pb-1">
                <span>SELECT COMBAT MOVE</span>
                <button
                  onClick={() => setMenuMode('MAIN')}
                  className="flex items-center gap-1 text-[10px] font-bold text-gray-700 hover:text-black bg-gray-200 px-2 py-0.5 rounded border border-gray-400"
                >
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {/* ATTACK */}
                <button
                  onClick={() => {
                    onSelectAction('attack');
                    setMenuMode('MAIN');
                  }}
                  className="p-2 bg-[#E8F0E0] hover:bg-[#D0E4C8] border border-[#283820] rounded-lg flex items-center justify-between text-left font-bold text-xs text-[#1B2B1B] transition-all active:scale-95"
                >
                  <span className="flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-rose-600" /> STRIKE (1x DMG)
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">0 MP</span>
                </button>

                {/* HEAVY ATTACK */}
                <button
                  onClick={() => {
                    onSelectAction('heavy');
                    setMenuMode('MAIN');
                  }}
                  disabled={mana < 30}
                  className="p-2 bg-[#E8F0E0] hover:bg-[#D0E4C8] border border-[#283820] rounded-lg flex items-center justify-between text-left font-bold text-xs text-[#1B2B1B] transition-all disabled:opacity-40 active:scale-95"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" /> HEAVY STRIKE
                  </span>
                  <span className="text-[10px] text-amber-700 font-mono font-bold">30 MP</span>
                </button>

                {/* ULTIMATE */}
                <button
                  onClick={() => {
                    onSelectAction('ultimate');
                    setMenuMode('MAIN');
                  }}
                  disabled={mana < 100}
                  className="p-2 bg-gradient-to-r from-purple-100 to-amber-100 hover:from-purple-200 hover:to-amber-200 border border-purple-600 rounded-lg flex items-center justify-between text-left font-black text-xs text-purple-950 transition-all disabled:opacity-40 active:scale-95"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" /> NuLL SHATTER
                  </span>
                  <span className="text-[10px] text-purple-800 font-mono font-bold">100 MP</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Inventory & Badges Modal */}
      {showInventory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0C182B] border-4 border-[#3B4D68] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-mono font-bold text-amber-400 text-sm">
                <Backpack className="w-5 h-5" /> INVENTORY & BAG
              </div>
              <button onClick={() => setShowInventory(false)} className="text-gray-400 hover:text-white text-xs font-mono font-bold">
                ✕ CLOSE
              </button>
            </div>

            {/* Collected Fragments */}
            <div>
              <h4 className="text-xs font-mono text-gray-400 uppercase mb-2">Collected Clue Fragments</h4>
              <div className="flex flex-wrap gap-2">
                {fragments.length > 0 ? (
                  fragments.map((frag, idx) => (
                    <div key={idx} className="w-10 h-10 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 font-mono font-extrabold text-base shadow-md">
                      {frag.char}
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-mono text-gray-500">No fragments collected yet.</div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-xs font-mono text-gray-400 uppercase mb-2">Achievement Badges</h4>
              <div className="grid grid-cols-2 gap-2">
                {badges.map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-black/40 border border-white/10 rounded-xl flex items-center gap-2">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <div className="text-xs font-mono font-bold text-white">{b.title}</div>
                      <div className="text-[9px] text-gray-400 font-sans">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
