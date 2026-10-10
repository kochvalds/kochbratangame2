import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Thermometer,
  Sparkles,
  UserCheck,
  Coffee,
  RotateCcw,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { BanyaState, LooksmaxingState } from '../../types/game';
import { formatMoney } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface BanyaInteractiveViewProps {
  banya: BanyaState;
  setBanya: React.Dispatch<React.SetStateAction<BanyaState>>;
  looksmaxing: LooksmaxingState;
  setLooksmaxing: React.Dispatch<React.SetStateAction<LooksmaxingState>>;
  cash: number;
  setCash: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

export function BanyaInteractiveView({
  banya,
  setBanya,
  looksmaxing,
  setLooksmaxing,
  cash,
  setCash,
  onClose
}: BanyaInteractiveViewProps) {
  const [steamParticlesActive, setSteamParticlesActive] = useState<boolean>(false);
  const [broomSlapping, setBroomSlapping] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string>('Добро пожаловать в элитный банный комплекс сруба "Кедровый Бор"!');

  // Broom whipping session
  const handleVenikSlap = () => {
    sounds.playVenikSlap();
    setBroomSlapping(true);
    setTimeout(() => setBroomSlapping(false), 250);

    setBanya(prev => {
      const newRelaxation = Math.min(100, prev.currentRelaxation + 8);
      const newCond = Math.max(0, prev.venikCondition - 1);
      return {
        ...prev,
        currentRelaxation: newRelaxation,
        venikCondition: newCond
      };
    });

    setLooksmaxing(prev => {
      const newSkin = Math.min(100, prev.skinGlow + 1);
      const newJaw = Math.min(100, prev.jawline + 0.5);
      const newScore = Math.min(100, Math.round((newSkin + newJaw + prev.hunterEyes + prev.physique + prev.hairStyle) / 5));
      return {
        ...prev,
        skinGlow: newSkin,
        jawline: newJaw,
        overallScore: newScore,
        banyaVisitsCount: prev.banyaVisitsCount + 1
      };
    });

    setLastActionMessage('🌿 Горячий веник разогнал кровь и лимфу! Поры очищены, кожа приобрела свежее сияние (+1 Кожа).');
  };

  // Add water to hot stones (подкинуть пару)
  const handleAddSteam = () => {
    sounds.playSteamHiss();
    setSteamParticlesActive(true);
    setTimeout(() => setSteamParticlesActive(false), 1200);

    setBanya(prev => ({
      ...prev,
      temperatureC: Math.min(115, prev.temperatureC + 4),
      steamHumidity: Math.min(90, prev.steamHumidity + 8),
      stoneHeat: Math.max(30, prev.stoneHeat - 5),
      currentRelaxation: Math.min(100, prev.currentRelaxation + 10)
    }));

    setLooksmaxing(prev => ({
      ...prev,
      auraPowerBonus: prev.auraPowerBonus + 1,
      skinGlow: Math.min(100, prev.skinGlow + 1)
    }));

    setLastActionMessage('🔥 Эвкалиптовый пар с шипением наполнил парную! Температура поднялась, тело наполняется первобытной энергией.');
  };

  // Cold plunge pool jump
  const handleIcePlunge = () => {
    sounds.playPlungeSplash();

    setBanya(prev => ({
      ...prev,
      currentRelaxation: 100,
      buffDurationSeconds: 300
    }));

    setLooksmaxing(prev => {
      const newHunter = Math.min(100, prev.hunterEyes + 3);
      const newScore = Math.min(100, Math.round((prev.skinGlow + prev.jawline + newHunter + prev.physique + prev.hairStyle) / 5));
      return {
        ...prev,
        hunterEyes: newHunter,
        overallScore: newScore,
        auraPowerBonus: prev.auraPowerBonus + 3
      };
    });

    setLastActionMessage('❄️ Прыжок в ледяную купель (+4°C)! Мощнейший выброс норадреналина и тестостерона. Взгляд хищника стал острее (+3 Hunter Eyes)!');
  };

  // Samovar Tea
  const handleDrinkTea = () => {
    if (banya.samovarTeaServings <= 0) {
      setLastActionMessage('⚠️ Самовар пуст! Попросите банщика заварить свежий сбор алтайских трав.');
      return;
    }
    sounds.playClick();
    setBanya(prev => ({
      ...prev,
      samovarTeaServings: prev.samovarTeaServings - 1,
      currentRelaxation: Math.min(100, prev.currentRelaxation + 5)
    }));
    setLooksmaxing(prev => ({
      ...prev,
      skinGlow: Math.min(100, prev.skinGlow + 1),
      revenueMultiplier: Number((prev.revenueMultiplier + 0.01).toFixed(2))
    }));
    setLastActionMessage('🫖 Горячий чай с чабрецом и горным мёдом восстановил баланс микроэлементов (+1% к доходу бизнеса).');
  };

  // Hire Master Banshik
  const handleHireBanshik = () => {
    const cost = 15000;
    if (cash < cost) {
      setLastActionMessage('⚠️ Недостаточно средств для найма легендарного банщика ($15,000)!');
      return;
    }
    sounds.playLevelUp();
    setCash(prev => prev - cost);
    setBanya(prev => ({
      ...prev,
      banshikHired: true,
      steamMasteryLevel: 3,
      currentRelaxation: 100
    }));
    setLooksmaxing(prev => ({
      ...prev,
      auraPowerBonus: prev.auraPowerBonus + 15,
      revenueMultiplier: Number((prev.revenueMultiplier + 0.20).toFixed(2)),
      overallScore: Math.min(100, prev.overallScore + 5)
    }));
    setLastActionMessage('👨‍🍳 Банщик Силыч нанят на постоянную службу! Профессиональное парение двумя вениками дает постоянный буст +20% к доходу бизнеса!');
  };

  return (
    <div className="relative min-h-[600px] bg-gradient-to-b from-[#1c120c] via-[#2a1b12] to-[#120a06] text-white rounded-2xl border border-amber-900/50 p-4 md:p-6 shadow-2xl overflow-hidden">
      {/* Background steam mist visual overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          steamParticlesActive ? 'opacity-70' : 'opacity-20'
        } bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-100/30 via-amber-900/10 to-transparent blur-2xl`}
      />

      {/* Top Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-800/40">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 rounded-lg text-sm text-amber-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Назад в Город
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-amber-200 font-display">
              <span>🧖‍♂️</span> VIP Комплекс "Русская Баня & Сибирский Кедр"
            </h2>
            <p className="text-xs text-amber-300/70">
              Натуральный сруб · Чугунная каменка · Ледяная купель · Луксмаксинг и омоложение кожи
            </p>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-2 md:gap-4 bg-black/40 border border-amber-700/30 px-3 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1 text-amber-400">
            <Thermometer className="w-4 h-4 text-red-400" />
            <span className="font-bold text-sm">{banya.temperatureC}°C</span>
          </div>
          <div className="flex items-center gap-1 text-sky-300">
            <Droplets className="w-4 h-4 text-sky-400" />
            <span>{banya.steamHumidity}% влажн.</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{banya.currentRelaxation}% релакс</span>
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      <div className="relative z-10 my-4 bg-amber-950/60 border border-amber-700/40 rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-xs md:text-sm text-amber-100">{lastActionMessage}</p>
      </div>

      {/* Main Interactive Bathhouse Deck */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Steam Room Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black/30 border border-amber-800/40 rounded-xl p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Главная Парилка (Каменка & Веники)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Action 1: Venik Slapping */}
              <button
                onClick={handleVenikSlap}
                className={`relative overflow-hidden p-4 rounded-xl border text-left transition transform active:scale-95 ${
                  broomSlapping 
                    ? 'bg-amber-600/30 border-amber-400 scale-[1.02]' 
                    : 'bg-gradient-to-br from-amber-950/80 to-amber-900/40 border-amber-700/50 hover:border-amber-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl">🌿</span>
                    <h4 className="font-bold text-white text-sm mt-2">Парение {banya.activeVenik}</h4>
                    <p className="text-xs text-amber-300/80 mt-1">
                      Разгоняет кровь, открывает поры, тонизирует скулы и очищает кожу лица.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    +Кожа & Овал
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-amber-200/60 pt-2 border-t border-amber-800/30">
                  <span>Состояние веника: {banya.venikCondition}%</span>
                  <span className="text-amber-400 font-bold">Нажать для удара</span>
                </div>
              </button>

              {/* Action 2: Scoop water on hot stones */}
              <button
                onClick={handleAddSteam}
                className="relative overflow-hidden p-4 rounded-xl border border-amber-700/50 bg-gradient-to-br from-amber-950/80 to-red-950/40 hover:border-red-500 text-left transition transform active:scale-95"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl">💧</span>
                    <h4 className="font-bold text-white text-sm mt-2">Подкинуть на каменку</h4>
                    <p className="text-xs text-amber-300/80 mt-1">
                      Плеснуть ковш эвкалиптового отвара на раскаленный чугун. Взрыв целебного пара.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full">
                    +Температура
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-amber-200/60 pt-2 border-t border-amber-800/30">
                  <span>Жар камней: {banya.stoneHeat}%</span>
                  <span className="text-red-400 font-bold">Выплеснуть ковш</span>
                </div>
              </button>

              {/* Action 3: Ice Plunge */}
              <button
                onClick={handleIcePlunge}
                className="relative overflow-hidden p-4 rounded-xl border border-sky-700/50 bg-gradient-to-br from-slate-950/80 to-sky-950/40 hover:border-sky-400 text-left transition transform active:scale-95"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl">❄️</span>
                    <h4 className="font-bold text-white text-sm mt-2">Окунуться в ледяную купель</h4>
                    <p className="text-xs text-sky-200/80 mt-1">
                      Контрастное погружение в ледяную воду (+4°C). Закалка сосудов, заточка Hunter Eyes.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                    +Hunter Eyes
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-sky-200/60 pt-2 border-t border-sky-800/30">
                  <span>Вода: +4°C (ледяная)</span>
                  <span className="text-sky-300 font-bold">Нырнуть с головой</span>
                </div>
              </button>

              {/* Action 4: Samovar Tea */}
              <button
                onClick={handleDrinkTea}
                className="relative overflow-hidden p-4 rounded-xl border border-amber-700/50 bg-gradient-to-br from-amber-950/80 to-stone-900/60 hover:border-amber-400 text-left transition transform active:scale-95"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl">🫖</span>
                    <h4 className="font-bold text-white text-sm mt-2">Чай из Самовара с Мёдом</h4>
                    <p className="text-xs text-amber-200/80 mt-1">
                      Алтайский чабрец, иван-чай и кедровые орешки. Восстанавливает силы для сделок.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    +Энергия бизнеса
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-amber-200/60 pt-2 border-t border-amber-800/30">
                  <span>Осталось в самоваре: {banya.samovarTeaServings} кружек</span>
                  <span className="text-amber-300 font-bold">Налить пиалу</span>
                </div>
              </button>
            </div>
          </div>

          {/* Master Banshik Service */}
          <div className="bg-gradient-to-r from-amber-950/90 to-yellow-950/50 border border-yellow-600/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-2xl shrink-0">
                👨‍🍳
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  Пармастер Силыч (Мастер Банного Ремесла)
                  {banya.banshikHired && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 rounded-full">
                      Нанят
                    </span>
                  )}
                </h4>
                <p className="text-xs text-amber-200/80">
                  Профессиональное парение в четыре руки с опахиванием простынями. Дает постоянный буст +20% к доходам всех 10 империй и +15% к Ауре!
                </p>
              </div>
            </div>

            {banya.banshikHired ? (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> На службе
              </div>
            ) : (
              <button
                onClick={handleHireBanshik}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg transition shrink-0"
              >
                Нанять за $15,000
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Looksmaxing & Banya Stats Integration */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-amber-800/40 rounded-xl p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Влияние Бани на Луксмаксинг
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-200">Сияние Кожи (Skin Glow)</span>
                  <span className="font-bold text-white">{looksmaxing.skinGlow}/100</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-amber-900/50">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                    style={{ width: `${looksmaxing.skinGlow}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-200">Hunter Eyes (Взгляд хищника)</span>
                  <span className="font-bold text-white">{looksmaxing.hunterEyes}/100</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-sky-900/50">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${looksmaxing.hunterEyes}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-200">Овал лица & Челюсть (Jawline)</span>
                  <span className="font-bold text-white">{looksmaxing.jawline}/100</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-amber-900/50">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all"
                    style={{ width: `${looksmaxing.jawline}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-200">Аура Лидера & Доминирование</span>
                  <span className="font-bold text-emerald-400">+{looksmaxing.auraPowerBonus}%</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-emerald-900/50">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, looksmaxing.auraPowerBonus * 2)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/40 text-xs text-amber-300/80 space-y-1">
              <p>🧖‍♂️ Всего банных сессий: <span className="font-bold text-white">{looksmaxing.banyaVisitsCount}</span></p>
              <p>⚡ Текущий множитель бизнеса: <span className="font-bold text-emerald-400">{(looksmaxing.revenueMultiplier).toFixed(2)}x</span></p>
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-3 text-xs text-amber-200/70">
            <span className="font-bold text-amber-300">💡 Совет Луксмаксера:</span> Регулярное парение с последующим погружением в ледяную купель сужает капилляры лица, стимулирует выработку коллагена и придает челюсти четкие контуры.
          </div>
        </div>

      </div>
    </div>
  );
}
