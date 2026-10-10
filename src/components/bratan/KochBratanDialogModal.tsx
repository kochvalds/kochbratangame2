import React, { useState } from 'react';
import { Sparkles, MessageSquare, Award, Flame, Dumbbell, ShieldCheck, ChevronRight, X, Volume2, Trophy } from 'lucide-react';
import { KochBratanDialog, AchievementItem } from '../../types/game';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

const KOCH_BRATAN_IMG = '/src/assets/images/koch_bratan_portrait_1791617977893.jpg';

interface KochBratanDialogModalProps {
  onClose: () => void;
  onOpenBanya: () => void;
  onOpenGym: () => void;
  onOpenGTA: () => void;
  looksmaxingScore: number;
  cash: number;
  onClaimReward: (rewardCash: number, rewardPrestige: number, msg: string) => void;
}

export function KochBratanDialogModal({
  onClose,
  onOpenBanya,
  onOpenGym,
  onOpenGTA,
  looksmaxingScore,
  cash,
  onClaimReward
}: KochBratanDialogModalProps) {
  const [activeTab, setActiveTab] = useState<'dialog' | 'quests' | 'wisdom'>('dialog');
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);

  const dialogs: { text: string; subtext: string; mood: string }[] = [
    {
      text: "Здорово, братуха! Вижу стержень в твоем взгляде. В этом городе либо ты моггишь всех своей аурой и челюстью, либо тебя списывают в нормисы.",
      subtext: "Коч Братан поправляет золотую цепь Miami Cuban Link и одобрительно кивает.",
      mood: "Наставник"
    },
    {
      text: "Запомни золотое правило братвы: Баня очищает сосуды и точит овал лица, спортзал кует V-Taper броню, а бизнес дает финансовый суверенитет.",
      subtext: "Суетиться не надо. Король никогда не торопится — он просто забирает своё.",
      mood: "База"
    },
    {
      text: "Мьюинг держи постоянно: язык на нёбе, дыхание носом, осанка натянута как тетива лука. Hunter Eyes включаются, когда в тебе есть внутренняя сила.",
      subtext: "Коч демонстрирует идеальную линию челюсти с углом 90 градусов.",
      mood: "Луксмаксинг"
    },
    {
      text: "Садись на Гелик или Бугатти, выезжай на проспект Loox City и прокатись с ветерком. Пусть нормисы видят, как выглядит настоящий Apex Mogger!",
      subtext: "Звук мотора V8 и запах сибирского кедра — вот настоящий вайб.",
      mood: "Драйв"
    }
  ];

  const quests = [
    {
      id: 'q_banya',
      title: 'Пар от Коч Братана',
      desc: 'Сходить в Русскую баню и поддать эвкалипта на каменку',
      reward: 15000,
      prestige: 50,
      completed: true,
      action: onOpenBanya,
      actionLabel: 'В баню'
    },
    {
      id: 'q_gym',
      title: 'Пожать сотку на скамье',
      desc: 'Выполнить подход жима штанги в зале Gold’s Gym',
      reward: 25000,
      prestige: 100,
      completed: false,
      action: onOpenGym,
      actionLabel: 'В спортзал'
    },
    {
      id: 'q_gta',
      title: 'Ночной рейд по Loox City',
      desc: 'Сесть за руль суперкара в 3D GTA мире и разогнаться',
      reward: 40000,
      prestige: 150,
      completed: false,
      action: onOpenGTA,
      actionLabel: 'В 3D GTA'
    }
  ];

  const wisdomQuotes = [
    "«Скулы не купишь в аптеке — их выковывают дисциплина, мьюинг и дубовый пар.»",
    "«Кто в бане не бывал — тот истинной легкости в теле и ясности в голове не познал.»",
    "«Штанга никогда не врёт. Вес либо твой, либо ты ещё не дожал базу.»",
    "«Истинный Mogger не хвастается — его аура заполняет комнату еще до того, как он зашел.»",
    "«Деньги — это инструмент. Стиль — это почерк. Характер — это основа.»"
  ];

  const handleNextDialog = () => {
    sounds.playClick();
    setCurrentDialogIndex((prev) => (prev + 1) % dialogs.length);
  };

  const handleClaim = (q: typeof quests[0]) => {
    sounds.playAchievement();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }
    onClaimReward(q.reward, q.prestige, `Награда от Коч Братана: +$${q.reward.toLocaleString()}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Banner Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden flex-shrink-0">
          <img
            src={KOCH_BRATAN_IMG}
            alt="Коч Братан"
            className="w-full h-full object-cover object-top filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-neutral-300 hover:text-white transition-all border border-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Легендарный Наставник & Mogger-Брат
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Коч Братан 🗿
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300">
                Мастер банного пара, силовой базы и луксмаксинга
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end bg-black/60 px-4 py-2 rounded-2xl border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">Статус уважения</span>
              <span className="text-emerald-400 font-bold text-sm">Братва уважает 100%</span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/80 px-6 gap-2">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('dialog'); }}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'dialog'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Диалог с Братаном
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('quests'); }}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'quests'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Задания Братана
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('wisdom'); }}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'wisdom'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            Мудрость Моггера
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'dialog' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Тема: {dialogs[currentDialogIndex].mood}
                  </span>
                  <span className="text-xs text-neutral-500">
                    Фраза {currentDialogIndex + 1} из {dialogs.length}
                  </span>
                </div>

                <p className="text-base sm:text-lg text-neutral-100 font-medium leading-relaxed">
                  «{dialogs[currentDialogIndex].text}»
                </p>

                <p className="text-xs text-amber-300/80 italic mt-3 border-t border-neutral-800/60 pt-2.5">
                  {dialogs[currentDialogIndex].subtext}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleNextDialog}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Следующая мысль Коча
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { sounds.playLevelUp(); }}
                  className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold flex items-center gap-2 border border-neutral-700"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  Голос Братана
                </button>
              </div>

              {/* Quick action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => { onClose(); onOpenBanya(); }}
                  className="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-left hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <Flame className="w-4 h-4" />
                    Кедровая Баня
                  </div>
                  <div className="text-xs text-neutral-400 group-hover:text-neutral-200">
                    Париться веником и остудиться в купели
                  </div>
                </button>

                <button
                  onClick={() => { onClose(); onOpenGym(); }}
                  className="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-left hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                    <Dumbbell className="w-4 h-4" />
                    Gold's Gym
                  </div>
                  <div className="text-xs text-neutral-400 group-hover:text-neutral-200">
                    Жим лежа, становая тяга, бицепс
                  </div>
                </button>

                <button
                  onClick={() => { onClose(); onOpenGTA(); }}
                  className="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-left hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                    <Sparkles className="w-4 h-4" />
                    3D GTA Loox City
                  </div>
                  <div className="text-xs text-neutral-400 group-hover:text-neutral-200">
                    Реальные суперкары и открытый город
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400 mb-2">
                Выполняйте персональные поручения Коч Братана, чтобы получать уважение братвы, наличные и престиж:
              </p>

              {quests.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{q.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                        +$ {q.reward.toLocaleString()}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">
                        +{q.prestige} Престиж
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{q.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {q.completed ? (
                      <button
                        onClick={() => handleClaim(q)}
                        className="w-full sm:w-auto py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Забрать награду
                      </button>
                    ) : (
                      <button
                        onClick={() => { onClose(); q.action(); }}
                        className="w-full sm:w-auto py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        {q.actionLabel}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'wisdom' && (
            <div className="space-y-3">
              {wisdomQuotes.map((w, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-amber-500/30 transition-all"
                >
                  <p className="text-sm sm:text-base text-amber-200/90 font-medium italic">
                    {w}
                  </p>
                  <span className="text-[10px] text-neutral-500 block mt-2">
                    — Коч Братан, кодекс чести Looxmaksing
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Коч Братан онлайн в Loox City</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold transition-all"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
