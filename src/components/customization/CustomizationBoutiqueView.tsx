import React, { useState } from 'react';
import { Sparkles, Crown, ArrowLeft, Check, ShoppingBag, Scissors, Eye, Flame, Shield, User, Gem, Sliders } from 'lucide-react';
import { CustomizationState, CustomizationItem, LooksmaxingState } from '../../types/game';
import { formatMoney } from '../../utils/formatters';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

const BOUTIQUE_IMG = '/src/assets/images/luxury_clothing_boutique_1791618029424.jpg';

interface CustomizationBoutiqueViewProps {
  customization: CustomizationState;
  setCustomization: React.Dispatch<React.SetStateAction<CustomizationState>>;
  looksmaxing: LooksmaxingState;
  setLooksmaxing: React.Dispatch<React.SetStateAction<LooksmaxingState>>;
  cash: number;
  setCash: React.Dispatch<React.SetStateAction<number>>;
  prestigePoints: number;
  setPrestigePoints: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

export function CustomizationBoutiqueView({
  customization,
  setCustomization,
  looksmaxing,
  setLooksmaxing,
  cash,
  setCash,
  prestigePoints,
  setPrestigePoints,
  onClose
}: CustomizationBoutiqueViewProps) {
  const [activeCategory, setActiveCategory] = useState<'HAIRCUT' | 'OUTFIT' | 'ACCESSORY' | 'BEARD' | 'BODY'>('OUTFIT');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredItems = customization.items.filter(
    (item) => item.category === activeCategory
  );

  const handleBuyAndEquip = (item: CustomizationItem) => {
    if (item.isOwned) {
      // Just toggle equip
      sounds.playClick();
      setCustomization((prev) => {
        const updated = prev.items.map((i) => {
          if (i.category === item.category) {
            return { ...i, isEquipped: i.id === item.id };
          }
          return i;
        });

        const key =
          item.category === 'HAIRCUT'
            ? 'equippedHaircut'
            : item.category === 'OUTFIT'
            ? 'equippedOutfit'
            : item.category === 'ACCESSORY'
            ? 'equippedAccessory'
            : 'equippedBeard';

        return {
          ...prev,
          [key]: item.id,
          items: updated
        };
      });

      setNotification(`Одето: ${item.name}!`);
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    if (cash < item.price) {
      sounds.playClick();
      setNotification(`⚠️ Недостаточно средств! Требуется ${formatMoney(item.price)}`);
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    // Buy & Equip
    sounds.playCash();
    sounds.playLevelUp();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback
    }

    setCash((prev) => prev - item.price);
    setPrestigePoints((prev) => prev + item.prestigeBonus);

    setCustomization((prev) => {
      const updated = prev.items.map((i) => {
        if (i.id === item.id) {
          return { ...i, isOwned: true, isEquipped: true };
        }
        if (i.category === item.category) {
          return { ...i, isEquipped: false };
        }
        return i;
      });

      const key =
        item.category === 'HAIRCUT'
          ? 'equippedHaircut'
          : item.category === 'OUTFIT'
          ? 'equippedOutfit'
          : item.category === 'ACCESSORY'
          ? 'equippedAccessory'
          : 'equippedBeard';

      return {
        ...prev,
        [key]: item.id,
        items: updated
      };
    });

    // Update looksmaxing score
    setLooksmaxing((prev) => {
      const newScore = Math.min(100, prev.overallScore + Math.round(item.looksBonus / 4));
      return {
        ...prev,
        overallScore: newScore
      };
    });

    setNotification(`Куплено и надето: ${item.name}! +${item.prestigeBonus} престижа!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const currentOutfit = customization.items.find((i) => i.id === customization.equippedOutfit);
  const currentHaircut = customization.items.find((i) => i.id === customization.equippedHaircut);
  const currentAccessory = customization.items.find((i) => i.id === customization.equippedAccessory);
  const currentBeard = customization.items.find((i) => i.id === customization.equippedBeard);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl h-64 sm:h-72">
        <img
          src={BOUTIQUE_IMG}
          alt="Luxury Boutique"
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

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Atelier Aurelia Milan & Monaco
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Кастомизация & Бутик Роскоши
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Одежда Loro Piana, часы Patek Philippe, стрижки Royal Barbershop и анатомические пропорции
            </p>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 px-5 py-2.5 rounded-2xl flex items-center gap-4">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-medium">Баланс наличных</span>
              <p className="text-lg font-black text-emerald-400">{formatMoney(cash)}</p>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-medium">Очки престижа</span>
              <p className="text-lg font-black text-amber-400">{prestigePoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3.5 rounded-2xl text-center text-sm font-bold animate-fade-in">
          {notification}
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar Preview card */}
        <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                Текущий образ Chad
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                {looksmaxing.tier}
              </span>
            </div>

            {/* Avatar Visual card */}
            <div className="bg-neutral-950 rounded-2xl p-6 border border-neutral-800 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500/20 via-neutral-800 to-amber-500/40 p-1 mb-4 flex items-center justify-center shadow-inner">
                <div className="w-full h-full rounded-full bg-neutral-900 flex flex-col items-center justify-center">
                  <span className="text-3xl">🗿</span>
                  <span className="text-[10px] text-amber-400 font-bold mt-1">MOGGER</span>
                </div>
              </div>

              <div className="w-full space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Стрижка:</span>
                  <span className="text-white font-bold">{currentHaircut?.name || 'Taper Fade'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Наряд:</span>
                  <span className="text-amber-400 font-bold">{currentOutfit?.name || 'Loro Piana'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Аксессуар:</span>
                  <span className="text-white font-bold">{currentAccessory?.name || 'Cuban Link'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Борода:</span>
                  <span className="text-white font-bold">{currentBeard?.name || 'Chad Stubble'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Мышечная масса:</span>
                  <span className="text-emerald-400 font-bold">{customization.muscleMassIndex}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Процент жира:</span>
                  <span className="text-blue-400 font-bold">{customization.bodyFatPercent}% (Сухой рельеф)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <span className="text-xs text-neutral-400 block mb-1">Эффект внешнего вида:</span>
            <p className="text-xs text-amber-300 font-medium">
              Полный гардероб тихой роскоши увеличивает уважение в клубе и ускоряет доход империй на +15%!
            </p>
          </div>
        </div>

        {/* Right Column: Wardrobe items & body sliders */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-800">
            {[
              { id: 'OUTFIT', label: 'Одежда & Костюмы', icon: ShoppingBag },
              { id: 'HAIRCUT', label: 'Стрижки & Барбер', icon: Scissors },
              { id: 'ACCESSORY', label: 'Часы & Ювелирка', icon: Gem },
              { id: 'BEARD', label: 'Борода & Лицо', icon: Eye },
              { id: 'BODY', label: 'Пропорции тела', icon: Sliders }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveCategory(tab.id as typeof activeCategory);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Body proportions sliders */}
          {activeCategory === 'BODY' ? (
            <div className="space-y-6 py-2">
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-white">Мышечная масса (V-Taper)</h4>
                    <p className="text-xs text-neutral-400">Влияет на ширину плеч и форму грудных мышц</p>
                  </div>
                  <span className="text-lg font-black text-amber-400">{customization.muscleMassIndex}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={customization.muscleMassIndex}
                  onChange={(e) => {
                    setCustomization((prev) => ({
                      ...prev,
                      muscleMassIndex: Number(e.target.value)
                    }));
                  }}
                  className="w-full accent-amber-500 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-white">Процент подкожного жира</h4>
                    <p className="text-xs text-neutral-400">Прорисовка вен, пресса и резкость углов челюсти</p>
                  </div>
                  <span className="text-lg font-black text-blue-400">{customization.bodyFatPercent}%</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="22"
                  value={customization.bodyFatPercent}
                  onChange={(e) => {
                    setCustomization((prev) => ({
                      ...prev,
                      bodyFatPercent: Number(e.target.value)
                    }));
                  }}
                  className="w-full accent-blue-500 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      item.isEquipped
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : item.isOwned
                        ? 'bg-neutral-950 border-neutral-800'
                        : 'bg-neutral-950/70 border-neutral-800/80 opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                            {item.brand}
                          </span>
                          <h4 className="text-sm font-extrabold text-white mt-0.5">{item.name}</h4>
                        </div>
                        {item.isEquipped && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Надето
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] mb-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                          +{item.prestigeBonus} Престиж
                        </span>
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-medium">
                          +{item.looksBonus} Внешность
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyAndEquip(item)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                        item.isEquipped
                          ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          : item.isOwned
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {item.isEquipped ? (
                        'Снять'
                      ) : item.isOwned ? (
                        'Надеть'
                      ) : (
                        `Купить за ${formatMoney(item.price)}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
