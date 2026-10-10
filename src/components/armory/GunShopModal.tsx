import React, { useState } from 'react';
import { Shield, Zap, Target, ArrowLeft, Crosshair, X, Check, Volume2, ShoppingCart } from 'lucide-react';
import { WeaponItem } from '../../types/game';
import { formatMoney } from '../../utils/formatters';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

const GUN_SHOP_IMG = '/src/assets/images/gun_shop_armory_1791618059747.jpg';

interface GunShopModalProps {
  weapons: WeaponItem[];
  setWeapons: React.Dispatch<React.SetStateAction<WeaponItem[]>>;
  cash: number;
  setCash: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onOpenGTA: () => void;
}

export function GunShopModal({
  weapons,
  setWeapons,
  cash,
  setCash,
  onClose,
  onOpenGTA
}: GunShopModalProps) {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponItem>(weapons[0]);
  const [notification, setNotification] = useState<string | null>(null);

  const handleBuyWeapon = (w: WeaponItem) => {
    if (w.isOwned) {
      // Toggle equip
      sounds.playClick();
      setWeapons((prev) =>
        prev.map((item) => ({
          ...item,
          isEquipped: item.id === w.id
        }))
      );
      setSelectedWeapon({ ...w, isEquipped: true });
      setNotification(`Экипировано: ${w.name}!`);
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    if (cash < w.price) {
      sounds.playClick();
      setNotification(`⚠️ Недостаточно средств! Требуется ${formatMoney(w.price)}`);
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    sounds.playCash();
    sounds.playGunshot();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback
    }

    setCash((prev) => prev - w.price);
    setWeapons((prev) =>
      prev.map((item) => {
        if (item.id === w.id) {
          return { ...item, isOwned: true, isEquipped: true };
        }
        return { ...item, isEquipped: false };
      })
    );
    setSelectedWeapon({ ...w, isOwned: true, isEquipped: true });
    setNotification(`Оружие приобретено: ${w.name}! Готово к стрельбе в 3D GTA!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuyAmmo = (w: WeaponItem) => {
    const ammoCost = 500;
    if (cash < ammoCost) {
      setNotification(`⚠️ Недостаточно средств для покупки патронов (${formatMoney(ammoCost)})`);
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    sounds.playCash();
    setCash((prev) => prev - ammoCost);
    setWeapons((prev) =>
      prev.map((item) => {
        if (item.id === w.id) {
          return {
            ...item,
            ammo: Math.min(item.maxAmmo, item.ammo + 30)
          };
        }
        return item;
      })
    );
    setNotification(`Боекомплект пополнен (+30 патронов)!`);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Image Banner */}
        <div className="relative h-60 sm:h-64 w-full overflow-hidden flex-shrink-0">
          <img
            src={GUN_SHOP_IMG}
            alt="Ammu-Nation Armory"
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-neutral-300 hover:text-white transition-all border border-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Target className="w-3.5 h-3.5" />
                Loox Armory & Tactical Vault
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Оружейный Арсенал 🔫
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300">
                Золотой АК-47, Desert Eagle .50, снайперские винтовки и дробовики для открытого мира
              </p>
            </div>

            <div className="bg-black/70 px-4 py-2 rounded-2xl border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">Наличные</span>
              <p className="text-emerald-400 font-black text-sm">{formatMoney(cash)}</p>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-amber-500/10 border-y border-amber-500/30 text-amber-300 py-2.5 px-4 text-center text-xs font-bold">
            {notification}
          </div>
        )}

        {/* Weapons List & Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6 overflow-y-auto flex-1">
          {/* Left: Weapons List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Доступное вооружение
            </h3>

            <div className="space-y-2.5">
              {weapons.map((w) => {
                const isSelected = selectedWeapon.id === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedWeapon(w);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-neutral-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{w.name}</h4>
                        {w.isEquipped && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            В руках
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400">{w.tagline}</span>
                    </div>

                    <div className="text-right">
                      {w.isOwned ? (
                        <span className="text-xs font-bold text-emerald-400">Куплено</span>
                      ) : (
                        <span className="text-xs font-black text-amber-400">{formatMoney(w.price)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Weapon Specs & Actions */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    {selectedWeapon.category}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">{selectedWeapon.name}</h3>
                </div>
                <button
                  onClick={() => sounds.playGunshot()}
                  className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-all"
                  title="Тест звука выстрела"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              <p className="text-xs text-neutral-300 mb-6">{selectedWeapon.tagline}</p>

              {/* Specs bars */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Урон за выстрел</span>
                    <span className="text-white font-bold">{selectedWeapon.damage} HP</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${Math.min(100, (selectedWeapon.damage / 250) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Скорострельность</span>
                    <span className="text-white font-bold">{selectedWeapon.fireRate} выстр./сек</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (selectedWeapon.fireRate / 10) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Боезапас (Патроны)</span>
                    <span className="text-white font-bold">{selectedWeapon.ammo} / {selectedWeapon.maxAmmo}</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (selectedWeapon.ammo / selectedWeapon.maxAmmo) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <button
                onClick={() => handleBuyWeapon(selectedWeapon)}
                className={`w-full py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  selectedWeapon.isEquipped
                    ? 'bg-neutral-800 text-neutral-300'
                    : selectedWeapon.isOwned
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-600/30'
                }`}
              >
                <Crosshair className="w-4 h-4" />
                {selectedWeapon.isEquipped
                  ? 'Уже экипировано в 3D мире'
                  : selectedWeapon.isOwned
                  ? 'Взять в руки'
                  : `Купить ствол за ${formatMoney(selectedWeapon.price)}`}
              </button>

              {selectedWeapon.isOwned && selectedWeapon.id !== 'fist_strike' && (
                <button
                  onClick={() => handleBuyAmmo(selectedWeapon)}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                  Купить цинк патронов (+30 шт) за $500
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenGTA();
            }}
            className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
          >
            <Crosshair className="w-4 h-4" />
            Выйти на улицы 3D GTA с оружием
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
