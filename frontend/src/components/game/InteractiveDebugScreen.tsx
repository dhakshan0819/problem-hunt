import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, CheckCircle2, AlertTriangle, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { soundEngine } from '../../services/audio';

interface InteractiveDebugScreenProps {
  initialCode?: string;
  onSubmit: (answer: string) => void;
  isLoading?: boolean;
}

interface CodeLine {
  lineNum: number;
  content: string;
  isBuggy: boolean;
  bugReason?: string;
  fixOptions?: string[];
}

export const InteractiveDebugScreen: React.FC<InteractiveDebugScreenProps> = ({
  initialCode,
  onSubmit,
  isLoading = false,
}) => {
  const codeLines: CodeLine[] = [
    { lineNum: 1, content: 'int secret = 20;', isBuggy: false },
    {
      lineNum: 2,
      content: 'if (secret = 20)',
      isBuggy: true,
      bugReason: 'Assignment operator (=) used inside comparison condition instead of equality (==)!',
      fixOptions: ['if (secret == 20)', 'if (secret === 20)', 'if (secret != 20)'],
    },
    { lineNum: 3, content: '{', isBuggy: false },
    { lineNum: 4, content: '    printf("UNLOCK SYSTEM\\n");', isBuggy: false },
    { lineNum: 5, content: '}', isBuggy: false },
  ];

  const [selectedLine, setSelectedLine] = useState<CodeLine | null>(null);
  const [selectedFix, setSelectedFix] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleLineClick = (line: CodeLine) => {
    soundEngine.playClick();
    setSelectedLine(line);
    setSelectedFix(null);
    setFeedback(null);
  };

  const handleFixSubmit = () => {
    if (!selectedLine) return;

    if (!selectedLine.isBuggy) {
      soundEngine.playError();
      setFeedback('❌ That line contains valid C syntax! Inspect Line 2 where the condition is evaluated.');
      return;
    }

    if (selectedFix === 'if (secret == 20)' || selectedFix === '==') {
      soundEngine.playSuccess();
      setFeedback('✨ BUG SPOTTED & FIXED! C equality operator == comparison verified.');
      setTimeout(() => {
        onSubmit('==');
      }, 1200);
    } else {
      soundEngine.playError();
      setFeedback('❌ Incorrect fix option! Use standard C double equals == operator.');
    }
  };

  return (
    <div className="w-full bg-[#070A14] border-2 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] font-mono text-white space-y-6">
      
      {/* Interactive Debugger Title Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Bug className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-cyan-300">INTERACTIVE CODE DEBUGGING CONSOLE</h3>
            <p className="text-xs text-hunt-textMuted font-sans">Click on the line containing the syntax bug to inspect & apply the patch!</p>
          </div>
        </div>
        <span className="text-xs font-mono bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-full uppercase animate-pulse">
          1 BUG DETECTED
        </span>
      </div>

      {/* Code Editor Window with Clickable Lines */}
      <div className="bg-[#04060C] border border-white/10 rounded-2xl p-4 space-y-1 overflow-hidden shadow-inner">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-[10px] text-hunt-textMuted uppercase mb-2">
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>broken_laboratory.c — Line-by-Line Inspection</span>
        </div>

        {codeLines.map((line) => {
          const isSelected = selectedLine?.lineNum === line.lineNum;
          return (
            <motion.div
              key={line.lineNum}
              whileHover={{ x: 4 }}
              onClick={() => handleLineClick(line)}
              className={`flex items-center gap-4 px-3 py-2 rounded-xl cursor-pointer text-xs transition-all ${
                isSelected
                  ? line.isBuggy
                    ? 'bg-rose-950/80 border border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-cyan-950/80 border border-cyan-500 text-cyan-200'
                  : 'hover:bg-white/5 text-gray-300'
              }`}
            >
              <span className="text-gray-600 font-bold select-none text-[11px] w-6">{line.lineNum}</span>
              <code className="flex-1 font-mono">{line.content}</code>
              {line.isBuggy && (
                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/40">
                  ⚠️ SYNTAX BUG
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Line Inspection Details & Patch Selector */}
      {selectedLine && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#090E1A] border border-cyan-500/40 space-y-3"
        >
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
            <span>INSPECTING LINE {selectedLine.lineNum}: `{selectedLine.content}`</span>
          </div>

          {selectedLine.isBuggy ? (
            <div className="space-y-3">
              <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30">
                ⚠️ <strong>BUG CONFIRMED:</strong> {selectedLine.bugReason}
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-cyan-300 uppercase">
                  SELECT CORRECT FIXED LINE:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedLine.fixOptions?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFix(opt)}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                        selectedFix === opt
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                          : 'bg-[#04060C] border-white/10 text-gray-300 hover:border-cyan-500/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleFixSubmit}
                disabled={!selectedFix || isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-mono font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-40"
              >
                {isLoading ? 'APPLYING PATCH...' : 'APPLY CODE PATCH & VERIFY'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-emerald-400 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30">
              ✅ Line {selectedLine.lineNum} syntax is correct. Click Line 2 `if (secret = 20)` to locate the assignment vs equality bug!
            </p>
          )}
        </motion.div>
      )}

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl text-xs font-mono bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
