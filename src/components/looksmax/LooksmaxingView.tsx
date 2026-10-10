import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Crown,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Activity,
  Droplet,
  Eye,
  Scissors,
  Briefcase,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { LooksmaxingState, LooksmaxingUpgrade } from '../../types/game';
import { formatMoney } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface LooksmaxingViewProps {
  looksmaxing: LooksmaxingState;
  setLooksmaxing: React.Dispatch<React.SetStateAction<LooksmaxingState>>;
  cash: number;
  setCash: React.Dispatch<React.SetStateAction<number>>;
  onOpenBanya: () => void;
}

export function LooksmaxingView({
  looksmaxing,
  setLooksmaxing,
  cash,
  setCash,
  onOpenBanya
}: LooksmaxingViewProps) {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'JAWLINE' | 'EYES' | 'SKIN' | 'PHYSIQUE' | 'HAIR' | 'STYLE'>('ALL');
  const [mewingTimer, setMewingTimer] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Прокачивайте параметры внешности, чтобы закрывать многомиллионные контракты на переговорах!');

  // Trigger Mewing Action
  const handleMewing = () => {
    sounds.playClick();
    setLooksmaxing(prev => {
      const newStreak = prev.mewingStreakDays + 1;
      const newJaw = Math.min(100, prev.jawline + 2);
      const newScore = Math.min(100, Math.round((newJaw + prev.hunterEyes + prev.skinGlow + prev.physique + prev.hairStyle) / 5));
      
      let newTier = prev.tier;
      if (newScore >= 85) newTier = 'Apex Mogger 🗿';
      else if (newScore >= 65) newTier = 'Gigachad 🔱';
      else if (newScore >= 45) newTier = 'Chadlite ⚡';
      else newTier = 'Нормис 🧢';

      return {
        ...prev,
        mewingStreakDays: newStreak,
        jawline: newJaw,
        overallScore: newScore,
        tier: newTier,
        auraPowerBonus: prev.auraPowerBonus + 2,
        revenueMultiplier: Number((prev.revenueMultiplier + 0.02).toFixed(2))
      };
    });

    setFeedbackMsg('🗿 Техника Мьюинга выполнена! Язык прижат к нёбу, мышцы челюсти напряжены. Стрик: ' + (looksmaxing.mewingStreakDays + 1) + ' дней (+2 к Челюсти)!');
  };

  // Buy upgrade
  const handleBuyUpgrade = (upgrade: LooksmaxingUpgrade) => {
    if (cash < upgrade.cost) {
      setFeedbackMsg(`⚠️ Недостаточно денег для ${upgrade.name}! Требуется ${formatMoney(upgrade.cost)}`);
      return;
    }

    sounds.playLevelUp();
    setCash(prev => prev - upgrade.cost);

    setLooksmaxing(prev => {
      const updatedUpgrades = prev.upgrades.map(u => 
        u.id === upgrade.id ? { ...u, isUnlocked: true } : u
      );

      let newJaw = prev.jawline;
      let newEyes = prev.hunterEyes;
      let newSkin = prev.skinGlow;
      let newPhys = prev.physique;
      let newHair = prev.hairStyle;

      if (upgrade.category === 'JAWLINE') newJaw = Math.min(100, newJaw + 15);
      if (upgrade.category === 'EYES') newEyes = Math.min(100, newEyes + 15);
      if (upgrade.category === 'SKIN') newSkin = Math.min(100, newSkin + 15);
      if (upgrade.category === 'PHYSIQUE') newPhys = Math.min(100, newPhys + 15);
      if (upgrade.category === 'HAIR') newHair = Math.min(100, newHair + 15);
      if (upgrade.category === 'STYLE') {
        newJaw = Math.min(100, newJaw + 5);
        newEyes = Math.min(100, newEyes + 5);
      }

      const newScore = Math.min(100, Math.round((newJaw + newEyes + newSkin + newPhys + newHair) / 5));

      let newTier = prev.tier;
      if (newScore >= 85) newTier = 'Apex Mogger 🗿';
      else if (newScore >= 65) newTier = 'Gigachad 🔱';
      else if (newScore >= 45) newTier = 'Chadlite ⚡';
      else newTier = 'Нормис 🧢';

      return {
        ...prev,
        upgrades: updatedUpgrades,
        jawline: newJaw,
        hunterEyes: newEyes,
        skinGlow: newSkin,
        physique: newPhys,
        hairStyle: newHair,
        overallScore: newScore,
        tier: newTier,
        auraPowerBonus: prev.auraPowerBonus + 5,
        revenueMultiplier: Number((prev.revenueMultiplier + 0.05).toFixed(2))
      };
    });

    setFeedbackMsg(`✨ Приобретено: ${upgrade.name}! Ваша внешность преобразилась, доход бизнеса умножен!`);
  };

  const filteredUpgrades = looksmaxing.upgrades.filter(u => 
    activeCategory === 'ALL' || u.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Top Hero: Looksmaxing Avatar & Status Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-zinc-900 to-black border border-amber-500/30 p-5 md:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Avatar representation */}
          <div className="md:col-span-4 flex flex-col items-center text-center p-4 rounded-xl bg-black/50 border border-amber-500/20">
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center text-5xl md:text-6xl shadow-xl shadow-amber-500/20 border-2 border-amber-300">
                {looksmaxing.tier === 'Apex Mogger 🗿' ? '🗿' :
                 looksmaxing.tier === 'Gigachad 🔱' ? '🔱' :
                 looksmaxing.tier === 'Chadlite ⚡' ? '⚡' : '🧢'}
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-black/90 border border-amber-400 text-[11px] font-black text-amber-300 uppercase tracking-widest">
                {looksmaxing.overallScore}/100
              </div>
            </div>

            <h3 className="mt-3 text-lg font-black text-white font-display">
              {looksmaxing.tier}
            </h3>
            <p className="text-xs text-amber-300/80 mt-0.5">
              Аура Моггера: +{looksmaxing.auraPowerBonus}%
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleMewing}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-lg shadow transition active:scale-95 flex items-center gap-1.5"
              >
                <span>🗿</span> Мьюить (Стрик: {looksmaxing.mewingStreakDays} дн)
              </button>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Аттрибуты Привлекательности & Статуса
                </span>
                <h2 className="text-xl font-bold text-white">Индивидуальный Профиль Луксмаксинга</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenBanya}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-900 to-yellow-900 hover:from-amber-800 hover:to-yellow-800 border border-amber-600/50 rounded-xl text-xs font-bold text-amber-200 transition flex items-center gap-1.5 shadow"
                >
                  <span>🧖‍♂️</span> Русская Баня (+Кожа & Скулы)
                </button>
              </div>
            </div>

            {/* Parameter Bars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Jawline */}
              <div className="bg-black/40 border border-stone-800 rounded-xl p-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 font-medium">🗿 Челюсть & Овал лица</span>
                  <span className="text-amber-400 font-bold">{looksmaxing.jawline}/100</span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all" style={{ width: `${looksmaxing.jawline}%` }} />
                </div>
              </div>

              {/* Hunter Eyes */}
              <div className="bg-black/40 border border-stone-800 rounded-xl p-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 font-medium">👁️ Hunter Eyes (Взгляд)</span>
                  <span className="text-sky-400 font-bold">{looksmaxing.hunterEyes}/100</span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all" style={{ width: `${looksmaxing.hunterEyes}%` }} />
                </div>
              </div>

              {/* Skin */}
              <div className="bg-black/40 border border-stone-800 rounded-xl p-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 font-medium">✨ Стеклянная кожа</span>
                  <span className="text-emerald-400 font-bold">{looksmaxing.skinGlow}/100</span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all" style={{ width: `${looksmaxing.skinGlow}%` }} />
                </div>
              </div>

              {/* Physique */}
              <div className="bg-black/40 border border-stone-800 rounded-xl p-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 font-medium">🏋️ V-Taper (Телосложение)</span>
                  <span className="text-rose-400 font-bold">{looksmaxing.physique}/100</span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all" style={{ width: `${looksmaxing.physique}%` }} />
                </div>
              </div>

              {/* Hair */}
              <div className="bg-black/40 border border-stone-800 rounded-xl p-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 font-medium">💈 Прическа & Taper Fade</span>
                  <span className="text-purple-400 font-bold">{looksmaxing.hairStyle}/100</span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all" style={{ width: `${looksmaxing.hairStyle}%` }} />
                </div>
              </div>

              {/* Business Multiplier */}
              <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-300/80 block">Множитель 10 империй:</span>
                  <span className="text-sm font-bold text-emerald-400">+{(looksmaxing.revenueMultiplier * 100 - 100).toFixed(0)}% к выручке</span>
                </div>
                <span className="text-2xl">💰</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Action status message */}
      <div className="bg-zinc-900 border border-stone-800 rounded-xl p-3 text-xs md:text-sm text-stone-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{feedbackMsg}</span>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'Все Процедуры' },
          { id: 'JAWLINE', label: '🗿 Челюсть & Овал' },
          { id: 'EYES', label: '👁️ Hunter Eyes' },
          { id: 'SKIN', label: '✨ Кожа & Дерма' },
          { id: 'PHYSIQUE', label: '🏋️ Тело & V-Taper' },
          { id: 'HAIR', label: '💈 Барбер & Волосы' },
          { id: 'STYLE', label: '👔 Тихая Роскошь' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'bg-zinc-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upgrades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUpgrades.map(upgrade => {
          return (
            <div
              key={upgrade.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition ${
                upgrade.isUnlocked
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-zinc-900/90 border-stone-800 hover:border-amber-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-sm">{upgrade.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {upgrade.categoryBoost}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                  {upgrade.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 block">Стоимость:</span>
                  <span className="text-xs font-bold text-amber-300">{formatMoney(upgrade.cost)}</span>
                </div>

                {upgrade.isUnlocked ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Внедрено
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyUpgrade(upgrade)}
                    disabled={cash < upgrade.cost}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      cash >= upgrade.cost
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow active:scale-95'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Применить</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
