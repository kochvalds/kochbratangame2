import React, { useState, useEffect } from 'react';
import { Dumbbell, Zap, Flame, Trophy, Award, ArrowLeft, Play, RotateCcw, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { GymState, LooksmaxingState, GymExercise } from '../../types/game';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

const GYM_IMG = '/src/assets/images/gym_golds_luxury_1791617999987.jpg';

interface GymWorkoutViewProps {
  gym: GymState;
  setGym: React.Dispatch<React.SetStateAction<GymState>>;
  looksmaxing: LooksmaxingState;
  setLooksmaxing: React.Dispatch<React.SetStateAction<LooksmaxingState>>;
  onClose: () => void;
  onOpenKochBratan: () => void;
}

export function GymWorkoutView({
  gym,
  setGym,
  looksmaxing,
  setLooksmaxing,
  onClose,
  onOpenKochBratan
}: GymWorkoutViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<GymExercise>(gym.exercises[0]);
  const [isLifting, setIsLifting] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [barProgress, setBarProgress] = useState(50);
  const [liftMessage, setLiftMessage] = useState<string>('Выбери упражнение и начинай подход!');
  const [pumpEffect, setPumpEffect] = useState(false);

  // Moving bar for timing mini-game
  useEffect(() => {
    if (!isLifting) return;
    const interval = setInterval(() => {
      setBarProgress((prev) => {
        const next = prev + (Math.random() * 20 - 10);
        return Math.max(10, Math.min(90, next));
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isLifting]);

  const handleStartSet = (exercise: GymExercise) => {
    if (gym.stamina < exercise.energyCost) {
      setLiftMessage('⚠️ Недостаточно выносливости! Отдохни или сходи в баню выпить травяного чая.');
      return;
    }
    sounds.playClick();
    setSelectedExercise(exercise);
    setIsLifting(true);
    setRepCount(0);
    setLiftMessage(`Подход начат: ${exercise.name} (${exercise.currentWeightKg} кг). Жми кнопку в зелёной зоне!`);
  };

  const handlePerformRep = () => {
    // Check if in sweet spot (40-60)
    const isGoodTiming = barProgress >= 35 && barProgress <= 65;
    sounds.playBarbellClank();
    setPumpEffect(true);
    setTimeout(() => setPumpEffect(false), 200);

    const newReps = repCount + 1;
    setRepCount(newReps);

    if (newReps >= 8) {
      // Finished set successfully
      setIsLifting(false);
      sounds.playLevelUp();
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Fallback
      }

      setLiftMessage(`🔥 Отличный подход! 8 повторений завершено. +${selectedExercise.physiqueGain} к V-Taper, +${selectedExercise.strengthGain} к силе!`);

      // Update gym state
      setGym(prev => {
        const updatedEx = prev.exercises.map(ex => {
          if (ex.id === selectedExercise.id) {
            const nextWeight = Math.min(ex.maxWeightKg, ex.currentWeightKg + 2.5);
            return {
              ...ex,
              currentWeightKg: nextWeight,
              repsCompleted: ex.repsCompleted + 8
            };
          }
          return ex;
        });

        return {
          ...prev,
          stamina: Math.max(0, prev.stamina - selectedExercise.energyCost),
          totalWorkoutsCount: prev.totalWorkoutsCount + 1,
          exercises: updatedEx
        };
      });

      // Boost looksmaxing physique
      setLooksmaxing(prev => {
        const newPhysique = Math.min(100, prev.physique + selectedExercise.physiqueGain);
        const newScore = Math.min(100, Math.round(
          (prev.jawline + prev.hunterEyes + prev.skinGlow + newPhysique + prev.hairStyle) / 5
        ));
        return {
          ...prev,
          physique: newPhysique,
          overallScore: newScore
        };
      });
    } else {
      setLiftMessage(
        isGoodTiming
          ? `💪 Идеальное повторение #${newReps}! Продолжай жать!`
          : `⚡ Повторение #${newReps} засчитано. Держи траекторию!`
      );
    }
  };

  const handleRestDrink = () => {
    sounds.playClick();
    setGym(prev => ({
      ...prev,
      stamina: Math.min(100, prev.stamina + 25)
    }));
    setLiftMessage('🥤 Выпит изотонический протеиновый коктейль! Выносливость +25%.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl h-64 sm:h-72">
        <img
          src={GYM_IMG}
          alt="Gold's Gym"
          className="w-full h-full object-cover filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

        <div className="absolute top-4 left-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/70 hover:bg-black text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад в меню
          </button>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={onOpenKochBratan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Совет от Коч Братана 🗿
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Dumbbell className="w-3.5 h-3.5" />
              Коч Зал & Gold’s Gym Mecca
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Кузница V-Taper & Силы
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Прокачивай мышечный корсет, увеличивай рабочий вес и поднимай тестостерон
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-neutral-900/90 border border-neutral-800 px-4 py-2 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">Выносливость</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-extrabold text-sm">{gym.stamina}%</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 px-4 py-2 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">V-Taper Тело</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="text-white font-extrabold text-sm">{looksmaxing.physique}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main workout arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Exercise list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Силовая база
            </h3>
            <span className="text-xs text-neutral-400">
              {gym.exercises.length} упражнений
            </span>
          </div>

          <div className="space-y-2.5">
            {gym.exercises.map((ex) => {
              const isSelected = selectedExercise.id === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    if (!isLifting) setSelectedExercise(ex);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-neutral-900/80 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{ex.name}</h4>
                      <span className="text-xs text-amber-400/90 font-medium">{ex.targetMuscle}</span>
                    </div>
                    <span className="text-sm font-black text-white bg-neutral-950 px-2.5 py-1 rounded-xl border border-neutral-800">
                      {ex.currentWeightKg} кг
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 mt-3 pt-2.5 border-t border-neutral-800/60">
                    <span>Расход: -{ex.energyCost}% вын.</span>
                    <span>Бонус: +{ex.physiqueGain} V-Taper</span>
                  </div>

                  <button
                    disabled={isLifting && !isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartSet(ex);
                    }}
                    className={`w-full mt-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected && isLifting
                        ? 'bg-amber-500 text-black'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isSelected && isLifting ? 'Идет подход...' : 'Начать подход'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick rest / energy boost */}
          <button
            onClick={handleRestDrink}
            className="w-full py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Выпить шейкер с BCAA & Протеином (+25% энергии)
          </button>
        </div>

        {/* Right column: Interactive Barbell bench press animation & mini-game */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          {/* Status message */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-medium block">Инструктор Коч:</span>
                <p className="text-sm font-semibold text-white">{liftMessage}</p>
              </div>
            </div>
            {isLifting && (
              <div className="text-right">
                <span className="text-xs text-neutral-400">Повторения</span>
                <p className="text-xl font-black text-amber-400">{repCount} / 8</p>
              </div>
            )}
          </div>

          {/* Lifting Stage Visual */}
          <div className="relative bg-neutral-950/80 rounded-2xl border border-neutral-800/80 p-8 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
            {/* Background Gym Aura */}
            <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60" />

            {/* Barbell visual */}
            <div className={`relative transition-transform duration-150 flex items-center justify-center ${pumpEffect ? 'scale-110 -translate-y-4' : 'scale-100'}`}>
              {/* Weight Plates Left */}
              <div className="flex items-center gap-1">
                <div className="w-4 h-24 bg-neutral-800 border-2 border-neutral-700 rounded-lg shadow-md" />
                <div className="w-5 h-28 bg-amber-500/80 border-2 border-amber-400 rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-[9px] font-black text-black -rotate-90">25KG</span>
                </div>
                <div className="w-4 h-20 bg-neutral-800 border border-neutral-700 rounded-lg" />
              </div>

              {/* Steel Bar */}
              <div className="w-48 sm:w-64 h-3 bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-400 rounded-full shadow-inner relative">
                {/* Center Grip knurling */}
                <div className="absolute inset-y-0 left-1/4 right-1/4 bg-neutral-500/60 rounded" />
              </div>

              {/* Weight Plates Right */}
              <div className="flex items-center gap-1">
                <div className="w-4 h-20 bg-neutral-800 border border-neutral-700 rounded-lg" />
                <div className="w-5 h-28 bg-amber-500/80 border-2 border-amber-400 rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-[9px] font-black text-black 90">25KG</span>
                </div>
                <div className="w-4 h-24 bg-neutral-800 border-2 border-neutral-700 rounded-lg shadow-md" />
              </div>
            </div>

            <div className="mt-8 text-center">
              <span className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {selectedExercise.name}
              </span>
              <p className="text-xs text-neutral-400 mt-1">
                Текущий рабочий вес: <span className="text-amber-400 font-bold">{selectedExercise.currentWeightKg} кг</span>
              </p>
            </div>

            {/* Timing meter bar (when lifting) */}
            {isLifting && (
              <div className="w-full max-w-md mt-6 space-y-2">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Низшая точка</span>
                  <span className="text-emerald-400 font-bold">ЗЕЛЕНАЯ ЗОНА (ЖМИ)</span>
                  <span>Пиковое сокращение</span>
                </div>

                <div className="relative h-5 bg-neutral-900 border border-neutral-700 rounded-full overflow-hidden">
                  {/* Sweet spot indicator */}
                  <div className="absolute top-0 bottom-0 left-[35%] right-[35%] bg-emerald-500/30 border-x border-emerald-500/60" />
                  
                  {/* Moving pointer */}
                  <div
                    className="absolute top-0 bottom-0 w-3 bg-amber-400 rounded-full transition-all duration-75 shadow-lg shadow-amber-400"
                    style={{ left: `calc(${barProgress}% - 6px)` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {isLifting ? (
              <button
                onClick={handlePerformRep}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Dumbbell className="w-5 h-5" />
                ПОЖАТЬ ВЕС (ПОВТОРЕНИЕ #{repCount + 1})
              </button>
            ) : (
              <button
                onClick={() => handleStartSet(selectedExercise)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5" />
                НАЧАТЬ ПОДХОД НА 8 ПОВТОРЕНИЙ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
