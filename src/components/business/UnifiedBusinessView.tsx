import React, { useState } from 'react';
import {
  Building2,
  Car,
  ShoppingBag,
  Utensils,
  Hammer,
  Cpu,
  Rocket,
  Flame,
  Film,
  Dna,
  CheckCircle2,
  Wrench,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Business, DealershipCar, BusinessSubAction } from '../../types/game';
import { formatMoney, formatExactMoney } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

const SHOWROOM_IMG = '/src/assets/images/car_dealership_showroom_1791553586392.jpg';

interface UnifiedBusinessViewProps {
  businesses: Business[];
  cash: number;
  dealershipInventory: DealershipCar[];
  marketCars: DealershipCar[];
  selectedGarageCar: DealershipCar | null;
  onSelectGarageCar: (car: DealershipCar | null) => void;
  onBuyAuctionCar: (car: DealershipCar) => void;
  onRepairCarComponent: (component: 'engine' | 'transmission' | 'suspension' | 'bodywork' | 'interior', cost: number) => void;
  onSellCar: (car: DealershipCar) => void;
  onUnlockBusiness: (biz: Business) => void;
  onUpgradeBusiness: (biz: Business) => void;
  onUnlockSubAction: (bizId: string, subAction: BusinessSubAction) => void;
}

export function UnifiedBusinessView({
  businesses,
  cash,
  dealershipInventory,
  marketCars,
  selectedGarageCar,
  onSelectGarageCar,
  onBuyAuctionCar,
  onRepairCarComponent,
  onSellCar,
  onUnlockBusiness,
  onUpgradeBusiness,
  onUnlockSubAction
}: UnifiedBusinessViewProps) {
  const [activeBizId, setActiveBizId] = useState<string>('biz_dealership');

  const currentBiz = businesses.find(b => b.id === activeBizId) || businesses[0];

  const getBizIcon = (cat: string) => {
    switch (cat) {
      case 'AUTOMOTIVE': return <Car className="w-4 h-4 text-amber-400" />;
      case 'RETAIL': return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'HOSPITALITY': return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'BANKING': return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'CONSTRUCTION': return <Hammer className="w-4 h-4 text-amber-400" />;
      case 'TECH': return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'AEROSPACE': return <Rocket className="w-4 h-4 text-amber-400" />;
      case 'ENERGY': return <Flame className="w-4 h-4 text-amber-400" />;
      case 'MEDIA': return <Film className="w-4 h-4 text-amber-400" />;
      case 'BIOTECH': return <Dna className="w-4 h-4 text-amber-400" />;
      default: return <Building2 className="w-4 h-4 text-amber-400" />;
    }
  };

  const isAutoDealership = currentBiz.category === 'AUTOMOTIVE';

  return (
    <div className="space-y-6">
      {/* 7 Business Horizontal Selector Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl overflow-x-auto flex items-center gap-2">
        {businesses.map(biz => {
          const isActive = biz.id === activeBizId;
          return (
            <button
              key={biz.id}
              onClick={() => {
                setActiveBizId(biz.id);
                sounds.playClick();
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                  : 'bg-neutral-950/80 text-neutral-300 hover:bg-neutral-800 border border-neutral-800/80'
              }`}
            >
              {getBizIcon(biz.category)}
              <span>{biz.categoryName}</span>
              {biz.unlocked ? (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  Ур. {biz.level}
                </span>
              ) : (
                <span className="text-[10px] text-neutral-500 bg-neutral-900 px-1 rounded">
                  ${formatMoney(biz.unlockCost)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Dashboard of Selected Business */}
      <div className="space-y-6">
        
        {/* Business Hero Strip */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                {currentBiz.categoryName}
              </span>
              {currentBiz.unlocked && (
                <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                  Уровень {currentBiz.level}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white mt-1">{currentBiz.name}</h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">{currentBiz.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentBiz.unlocked ? (
              <div className="flex items-center gap-3">
                <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 text-xs tabular-nums">
                  <span className="text-neutral-500 block text-[10px]">Чистая прибыль</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    +{formatMoney(currentBiz.monthlyRevenue - currentBiz.monthlyExpenses)}/мес
                  </span>
                </div>

                <button
                  onClick={() => onUpgradeBusiness(currentBiz)}
                  disabled={cash < Math.round(currentBiz.valuation * 0.3)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold rounded-xl text-xs transition-colors border border-neutral-700 disabled:opacity-40"
                >
                  Улучшить компанию ({formatMoney(Math.round(currentBiz.valuation * 0.3))})
                </button>
              </div>
            ) : (
              <button
                onClick={() => onUnlockBusiness(currentBiz)}
                disabled={cash < currentBiz.unlockCost}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black rounded-xl text-xs transition-colors shadow-lg disabled:opacity-40"
              >
                Открыть бизнес ({formatMoney(currentBiz.unlockCost)})
              </button>
            )}
          </div>
        </div>

        {/* If the Business is Locked */}
        {!currentBiz.unlocked ? (
          <div className="p-12 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              {getBizIcon(currentBiz.category)}
            </div>
            <h3 className="text-xl font-bold text-white">Бизнес ожидает инвестиций</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Начальная стоимость входа в индустрию «{currentBiz.categoryName}» составляет {formatMoney(currentBiz.unlockCost)}. После покупки вам откроется операционный цех и панель контрактов!
            </p>
            <button
              onClick={() => onUnlockBusiness(currentBiz)}
              disabled={cash < currentBiz.unlockCost}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow disabled:opacity-40"
            >
              Купить лицензию за {formatMoney(currentBiz.unlockCost)}
            </button>
          </div>
        ) : isAutoDealership ? (
          /* ======================================================== */
          /* 1. AUTOMOTIVE DEALERSHIP & RESTORATION WORKSHOP INTERFACE */
          /* ======================================================== */
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Owned Cars in Service */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Машины в вашем гараже ({dealershipInventory.length})
                  </h3>
                  <span className="text-[11px] text-neutral-500">Нажмите для диагностики</span>
                </div>

                {dealershipInventory.length === 0 ? (
                  <div className="bg-neutral-900 border border-dashed border-neutral-800 p-8 rounded-xl text-center space-y-2">
                    <Car className="w-8 h-8 text-neutral-600 mx-auto" />
                    <p className="text-xs text-neutral-400 font-medium">Боксы свободны</p>
                    <p className="text-[11px] text-neutral-500">
                      Купите лот с аукциона справа, чтобы запустить ремонт и перепродажу с маржой!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dealershipInventory.map(car => (
                      <div
                        key={car.id}
                        onClick={() => onSelectGarageCar(car)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedGarageCar?.id === car.id
                            ? 'bg-neutral-850 border-amber-500 shadow-md'
                            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {car.brand} {car.model}
                            </h4>
                            <span className="text-[11px] text-neutral-400">
                              {car.year} г. · {car.horsePower} л.с. · 0-100: {car.zeroToHundred}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">
                            {formatExactMoney(car.currentValue)}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-neutral-400">
                          <div>ДВС: {car.conditions.engine}%</div>
                          <div>КПП: {car.conditions.transmission}%</div>
                          <div>Подвеска: {car.conditions.suspension}%</div>
                          <div>Кузов: {car.conditions.bodywork}%</div>
                          <div>Салон: {car.conditions.interior}%</div>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-800/80">
                          <span className="text-[11px] text-neutral-400">
                            Куплен: {formatExactMoney(car.boughtPrice)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSellCar(car);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
                          >
                            Продать покупателю
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Diagnostic & Tuning Station */}
              <div className="lg:col-span-7 space-y-4">
                {selectedGarageCar ? (
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-amber-400 text-xs font-bold uppercase">
                          Бокс Диагностики & Восстановления
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {selectedGarageCar.brand} {selectedGarageCar.model} ({selectedGarageCar.year})
                        </h3>
                        <p className="text-xs text-neutral-400">
                          Макс. скорость: {selectedGarageCar.topSpeed} км/ч · Вложено в ремонт: {formatExactMoney(selectedGarageCar.repairCostTotal)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-neutral-400 block">Оценочная стоимость</span>
                        <span className="text-xl font-bold text-emerald-400">
                          {formatExactMoney(selectedGarageCar.currentValue)}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Component Repairs */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Узлы и Реставрация
                      </h4>

                      {/* Engine */}
                      <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                        <div>
                          <div className="text-xs font-semibold text-white">Двигатель (ДВС)</div>
                          <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.engine}%</div>
                        </div>
                        {selectedGarageCar.conditions.engine < 100 ? (
                          <button
                            onClick={() => onRepairCarComponent('engine', 3500)}
                            disabled={cash < 3500}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                          >
                            Перебрать ДВС ($3,500)
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Идеал
                          </span>
                        )}
                      </div>

                      {/* Transmission */}
                      <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                        <div>
                          <div className="text-xs font-semibold text-white">Трансмиссия & Сцепление</div>
                          <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.transmission}%</div>
                        </div>
                        {selectedGarageCar.conditions.transmission < 100 ? (
                          <button
                            onClick={() => onRepairCarComponent('transmission', 2200)}
                            disabled={cash < 2200}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                          >
                            Ремонт КПП ($2,200)
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Идеал
                          </span>
                        )}
                      </div>

                      {/* Suspension */}
                      <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                        <div>
                          <div className="text-xs font-semibold text-white">Спортивная подвеска & Тормоза</div>
                          <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.suspension}%</div>
                        </div>
                        {selectedGarageCar.conditions.suspension < 100 ? (
                          <button
                            onClick={() => onRepairCarComponent('suspension', 1800)}
                            disabled={cash < 1800}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                          >
                            Замена рычагов & стоек ($1,800)
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Идеал
                          </span>
                        )}
                      </div>

                      {/* Bodywork */}
                      <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                        <div>
                          <div className="text-xs font-semibold text-white">Кузов, Карбон & Покраска</div>
                          <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.bodywork}%</div>
                        </div>
                        {selectedGarageCar.conditions.bodywork < 100 ? (
                          <button
                            onClick={() => onRepairCarComponent('bodywork', 2600)}
                            disabled={cash < 2600}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                          >
                            Вытяжка & Окрас ($2,600)
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Идеал
                          </span>
                        )}
                      </div>

                      {/* Interior */}
                      <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                        <div>
                          <div className="text-xs font-semibold text-white">Кожаный салон & Детейлинг</div>
                          <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.interior}%</div>
                        </div>
                        {selectedGarageCar.conditions.interior < 100 ? (
                          <button
                            onClick={() => onRepairCarComponent('interior', 1400)}
                            disabled={cash < 1400}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                          >
                            Реставрация кожи ($1,400)
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Идеал
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 block">Ожидаемая чистая маржа</span>
                        <span className="text-base font-bold text-emerald-400">
                          +{formatExactMoney(selectedGarageCar.currentValue - selectedGarageCar.boughtPrice - selectedGarageCar.repairCostTotal)}
                        </span>
                      </div>
                      <button
                        onClick={() => onSellCar(selectedGarageCar)}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition-colors shadow"
                      >
                        Продать за {formatExactMoney(selectedGarageCar.currentValue)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl text-center space-y-3">
                    <Wrench className="w-10 h-10 text-neutral-600 mx-auto" />
                    <h4 className="font-bold text-white text-sm">Выберите автомобиль для реставрации</h4>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      Нажмите на любой автомобиль из левого гаража, чтобы увидеть детализацию поломок и запустить ремонт.
                    </p>
                  </div>
                )}

                {/* Auction Car Listings */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Свежие лоты на автоаукционе ({marketCars.length} доступно)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {marketCars.map(car => (
                      <div
                        key={car.id}
                        className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-white text-xs">{car.brand} {car.model}</h4>
                            <span className="text-xs font-bold text-amber-400">{formatExactMoney(car.boughtPrice)}</span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            {car.year} г. · {car.horsePower} л.с.
                          </p>
                          <div className="text-[10px] text-neutral-500 mt-2">
                            Состояние: ДВС {car.conditions.engine}%, КПП {car.conditions.transmission}%, Кузов {car.conditions.bodywork}%
                          </div>
                        </div>
                        <button
                          onClick={() => onBuyAuctionCar(car)}
                          disabled={cash < car.boughtPrice}
                          className="mt-3 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                        >
                          Выкупить лот ({formatExactMoney(car.boughtPrice)})
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 2. DEDICATED OPERATIONS WORKSPACE FOR THE OTHER 6 BIZES  */
          /* ======================================================== */
          <div className="space-y-6">
            {/* Operational Department Upgrades / Sub-actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
                    Операционные Контракты & Проекты
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Каждый контракт навсегда увеличивает ежемесячную выручку вашей компании.
                  </p>
                </div>
                <div className="text-xs bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-300">
                  {currentBiz.specialMetricName}: <strong className="text-amber-400">{currentBiz.specialMetricValue}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentBiz.subActions?.map(action => (
                  <div
                    key={action.id}
                    className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-amber-400 font-bold">{action.type}</span>
                        {action.isUnlocked && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Запущено
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm">{action.title}</h4>
                      <p className="text-xs text-neutral-400 mt-1">{action.desc}</p>
                      
                      <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1 text-xs tabular-nums">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Бонус к выручке:</span>
                          <span className="text-emerald-400 font-bold">+{formatMoney(action.revenueBonus)}/мес</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Стоимость внедрения:</span>
                          <span className="text-white font-semibold">{formatMoney(action.cost)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-neutral-800">
                      {action.isUnlocked ? (
                        <div className="text-center text-xs text-emerald-400 font-semibold py-2">
                          Проект генерирует прибыль
                        </div>
                      ) : (
                        <button
                          onClick={() => onUnlockSubAction(currentBiz.id, action)}
                          disabled={cash < action.cost}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                        >
                          Внедрить за {formatMoney(action.cost)}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department KPIs and Staff Overview */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Штат сотрудников</span>
                  <span className="text-base font-bold text-white">{currentBiz.employees} специалистов</span>
                  <span className="text-[10px] text-neutral-500 block">HR-уровень: {currentBiz.hrLevel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Текущая рыночная капитализация</span>
                  <span className="text-base font-bold text-white">{formatMoney(currentBiz.valuation)}</span>
                  <span className="text-[10px] text-emerald-400 block">Стабильный рост капитализации</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Маркетинг & Бренд</span>
                  <span className="text-base font-bold text-white">Уровень {currentBiz.marketingLevel}</span>
                  <span className="text-[10px] text-neutral-500 block">Мировой охват аудитории</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
