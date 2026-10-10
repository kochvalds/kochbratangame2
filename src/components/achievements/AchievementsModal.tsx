import React, { useState } from 'react';
import { Trophy, Award, Sparkles, X, CheckCircle2, ShieldCheck, Flame, ChevronRight, Gem } from 'lucide-react';
import { AchievementItem } from '../../types/game';
import { formatMoney } from '../../utils/formatters';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface AchievementsModalProps {
  achievements: AchievementItem[];
  setAchievements: React.Dispatch<React.SetStateAction<AchievementItem[]>>;
  cash: number;
  setCash: React.Dispatch<React.SetStateAction<number>>;
  prestigePoints: number;
  setPrestigePoints: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

export function AchievementsModal({
  achievements,
  setAchievements,
  cash,
  setCash,
  prestigePoints,
  setPrestigePoints,
  onClose
}: AchievementsModalProps) {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'ALL') return true;
    return a.category === filter;
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  const handleClaim = (ach: AchievementItem) => {
    sounds.playAchievement();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback
    }

    setCash((prev) => prev + ach.rewardCash);
    setPrestigePoints((prev) => prev + ach.rewardPrestige);

    setAchievements((prev) =>
      prev.map((a) =>
        a.id === ach.id
          ? {
              ...a,
              unlockedAt: 'Награда получена'
            }
          : a
      )
    );
  };

  const getTierColor = (tier: AchievementItem['tier']) => {
    switch (tier) {
      case 'DIAMOND':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'GOLD':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'SILVER':
        return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
      case 'BRONZE':
      default:
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Достижения & Трофеи Mogger
              </h2>
              <p className="text-xs text-neutral-400">
                Разблокировано: <span className="text-amber-400 font-bold">{unlockedCount}</span> из {achievements.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories bar */}
        <div className="flex flex-wrap gap-2 px-6 py-3 bg-neutral-950/60 border-b border-neutral-800/80">
          {[
            { id: 'ALL', label: 'Все' },
            { id: 'BANYA', label: '🧖‍♂️ Баня' },
            { id: 'GYM', label: '🏋️ Спортзал' },
            { id: 'LIFESTYLE', label: '🗿 Луксмаксинг' },
            { id: 'CARS', label: '🏎️ Суперкары' },
            { id: 'GTA', label: '🔫 3D GTA' },
            { id: 'WEALTH', label: '💰 Богатство' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playClick();
                setFilter(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === cat.id
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievements list */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {filteredAchievements.map((ach) => {
            const isCompleted = ach.progress >= ach.maxProgress;
            const isClaimed = ach.unlockedAt === 'Награда получена';

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  ach.isUnlocked
                    ? 'bg-neutral-950 border-amber-500/30'
                    : 'bg-neutral-950/60 border-neutral-800'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-white text-sm">{ach.title}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-black border uppercase ${getTierColor(
                        ach.tier
                      )}`}
                    >
                      {ach.tier}
                    </span>
                    {ach.isUnlocked && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Выполнено
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-400 mb-2">{ach.description}</p>

                  {/* Progress bar */}
                  <div className="w-full max-w-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-neutral-500">
                      <span>Прогресс</span>
                      <span>
                        {ach.progress.toLocaleString()} / {ach.maxProgress.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Rewards & Claim action */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-neutral-800/80 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-black text-emerald-400 block">
                      +{formatMoney(ach.rewardCash)}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">
                      +{ach.rewardPrestige} Престиж
                    </span>
                  </div>

                  {isClaimed ? (
                    <span className="py-2 px-3 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-bold">
                      Получено
                    </span>
                  ) : ach.isUnlocked ? (
                    <button
                      onClick={() => handleClaim(ach)}
                      className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Забрать
                    </button>
                  ) : (
                    <span className="py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs font-semibold">
                      В процессе
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
