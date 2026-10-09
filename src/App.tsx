import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Trophy,
  TrendingUp,
  Gem,
  Crown,
  Scale,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  INITIAL_BUSINESSES,
  INITIAL_DEALERSHIP_CARS,
  INITIAL_FOOTBALL_CLUB,
  INITIAL_STOCKS,
  INITIAL_CRYPTOS,
  INITIAL_REAL_ESTATE,
  INITIAL_LUXURY_ITEMS,
  INITIAL_PRIVATE_CLUB_PERKS,
  INITIAL_TAX_SYSTEM
} from './data/initialData';
import {
  Business,
  BusinessSubAction,
  DealershipCar,
  FootballClub,
  StockAsset,
  CryptoAsset,
  RealEstateProperty,
  LuxuryCollectionItem,
  PrivateClubPerk,
  TaxSystemState,
  MatchSimulation
} from './types/game';
import { formatMoney, formatExactMoney, formatPercent, getPrestigeRank, MONTH_NAMES_RU } from './utils/formatters';
import { sounds } from './utils/audio';

import { UnifiedBusinessView } from './components/business/UnifiedBusinessView';
import { InvestmentsView } from './components/investments/InvestmentsView';
import { TaxOfficeView } from './components/tax/TaxOfficeView';

const HERO_BANNER = '/src/assets/images/loox_hero_luxury_banner_1791553574137.jpg';
const STADIUM_IMG = '/src/assets/images/football_stadium_arena_1791553596250.jpg';
const PRIVATE_CLUB_IMG = '/src/assets/images/private_club_lounge_1791553605970.jpg';

export default function App() {
  // Player Core State
  const [cash, setCash] = useState<number>(45000);
  const [prestigePoints, setPrestigePoints] = useState<number>(1500);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(2026);
  const [gameSpeed, setGameSpeed] = useState<number>(1); // 0 = pause, 1 = normal, 2 = fast
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Navigation Tab (APK HUB REMOVED AS REQUESTED)
  const [activeTab, setActiveTab] = useState<'business' | 'football' | 'invest' | 'luxury' | 'tax' | 'club'>('business');

  // 7 Businesses (including Auto Dealership)
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [dealershipInventory, setDealershipInventory] = useState<DealershipCar[]>([]);
  const [marketCars, setMarketCars] = useState<DealershipCar[]>(INITIAL_DEALERSHIP_CARS);
  const [selectedGarageCar, setSelectedGarageCar] = useState<DealershipCar | null>(null);

  // Football Club State
  const [footballClub, setFootballClub] = useState<FootballClub>(INITIAL_FOOTBALL_CLUB);
  const [activeMatch, setActiveMatch] = useState<MatchSimulation | null>(null);

  // Investments (Stocks, Crypto, 300 Real Estate)
  const [stocks, setStocks] = useState<StockAsset[]>(INITIAL_STOCKS);
  const [cryptos, setCryptos] = useState<CryptoAsset[]>(INITIAL_CRYPTOS);
  const [realEstate, setRealEstate] = useState<RealEstateProperty[]>(INITIAL_REAL_ESTATE);

  // Luxury Garage & Collections (50+ Cars & Items)
  const [luxuryItems, setLuxuryItems] = useState<LuxuryCollectionItem[]>(INITIAL_LUXURY_ITEMS);
  const [luxuryFilter, setLuxuryFilter] = useState<'ALL' | 'CAR' | 'JET' | 'YACHT' | 'WATCH'>('ALL');

  // Tax & Offshores System
  const [taxSystem, setTaxSystem] = useState<TaxSystemState>(INITIAL_TAX_SYSTEM);

  // Private Club Syndicate
  const [clubPerks, setClubPerks] = useState<PrivateClubPerk[]>(INITIAL_PRIVATE_CLUB_PERKS);

  // Calculate highest business level to unlock Private Club
  const maxBizLevel = Math.max(...businesses.map(b => b.level));
  const isPrivateClubUnlocked = maxBizLevel >= 4;

  // Sound sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Net worth calculation
  const netWorth = React.useMemo(() => {
    let sum = cash;
    sum += businesses.filter(b => b.unlocked).reduce((acc, b) => acc + b.valuation, 0);
    sum += dealershipInventory.reduce((acc, c) => acc + c.currentValue, 0);
    sum += realEstate.filter(p => p.isOwned).reduce((acc, p) => acc + p.price, 0);
    sum += luxuryItems.filter(l => l.isOwned).reduce((acc, l) => acc + l.price, 0);
    sum += stocks.reduce((acc, s) => acc + s.sharesOwned * s.price, 0);
    sum += cryptos.reduce((acc, c) => acc + c.amountOwned * c.price, 0);
    return sum;
  }, [cash, businesses, dealershipInventory, realEstate, luxuryItems, stocks, cryptos]);

  // Monthly passive cashflow
  const monthlyRevenueTotal = React.useMemo(() => {
    let rev = 0;
    businesses.filter(b => b.unlocked).forEach(b => {
      rev += b.monthlyRevenue;
    });
    realEstate.filter(p => p.isOwned).forEach(p => {
      rev += p.monthlyRentalYield;
    });
    return rev;
  }, [businesses, realEstate]);

  const monthlyExpensesTotal = React.useMemo(() => {
    let exp = 0;
    businesses.filter(b => b.unlocked).forEach(b => {
      exp += b.monthlyExpenses;
    });
    luxuryItems.filter(l => l.isOwned).forEach(l => {
      exp += l.monthlyUpkeep;
    });
    return exp;
  }, [businesses, luxuryItems]);

  const netMonthlyProfit = monthlyRevenueTotal - monthlyExpensesTotal;

  // Monthly tax due
  const monthlyTaxDue = Math.max(0, Math.round(netMonthlyProfit * taxSystem.effectiveTaxRate));

  // Advance Month (Tick)
  const advanceMonth = () => {
    setMonth(prevM => {
      if (prevM === 12) {
        setYear(prevY => prevY + 1);
        return 1;
      }
      return prevM + 1;
    });

    // Handle taxes
    let monthTaxPaid = 0;
    if (taxSystem.autoPayTaxes) {
      monthTaxPaid = monthlyTaxDue;
      setCash(c => Math.max(0, c + netMonthlyProfit - monthlyTaxDue));
      setTaxSystem(t => ({
        ...t,
        accumulatedTaxDue: 0,
        totalTaxPaid: t.totalTaxPaid + monthlyTaxDue,
        totalTaxSaved: t.totalTaxSaved + Math.max(0, Math.round(netMonthlyProfit * (0.215 - t.effectiveTaxRate)))
      }));
    } else {
      setCash(c => Math.max(0, c + netMonthlyProfit));
      setTaxSystem(t => ({
        ...t,
        accumulatedTaxDue: t.accumulatedTaxDue + monthlyTaxDue,
        totalTaxSaved: t.totalTaxSaved + Math.max(0, Math.round(netMonthlyProfit * (0.215 - t.effectiveTaxRate)))
      }));
    }

    // Stocks price simulation
    setStocks(prevStocks =>
      prevStocks.map(stock => {
        const delta = (Math.random() * 0.08 - 0.035);
        const newPrice = Math.max(1, Number((stock.price * (1 + delta)).toFixed(2)));
        const newHist = [...stock.history.slice(-8), newPrice];
        return {
          ...stock,
          prevPrice: stock.price,
          price: newPrice,
          history: newHist
        };
      })
    );

    // Crypto price simulation
    setCryptos(prevCryptos =>
      prevCryptos.map(crypto => {
        const delta = (Math.random() * (crypto.volatility * 2.2) - crypto.volatility);
        const newPrice = Math.max(0.01, Number((crypto.price * (1 + delta)).toFixed(2)));
        const newHist = [...crypto.history.slice(-8), newPrice];
        return {
          ...crypto,
          prevPrice: crypto.price,
          price: newPrice,
          history: newHist
        };
      })
    );
  };

  // Timer loop
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (gameSpeed === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const intervalMs = Math.max(600, 3200 / gameSpeed);
    timerRef.current = window.setInterval(() => {
      advanceMonth();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameSpeed, netMonthlyProfit, taxSystem.autoPayTaxes]);

  // Dealership / Auction Car Operations
  const handleBuyAuctionCar = (car: DealershipCar) => {
    if (cash >= car.boughtPrice) {
      setCash(c => c - car.boughtPrice);
      setMarketCars(prev => prev.filter(c => c.id !== car.id));
      const owned = { ...car, isOwned: true };
      setDealershipInventory(prev => [...prev, owned]);
      setSelectedGarageCar(owned);
      sounds.playCash();
      sounds.playEngineRev();
    }
  };

  const handleRepairCarComponent = (
    component: 'engine' | 'transmission' | 'suspension' | 'bodywork' | 'interior',
    cost: number
  ) => {
    if (!selectedGarageCar || cash < cost) return;
    setCash(c => c - cost);

    const updated: DealershipCar = {
      ...selectedGarageCar,
      repairCostTotal: selectedGarageCar.repairCostTotal + cost,
      conditions: {
        ...selectedGarageCar.conditions,
        [component]: 100
      }
    };

    const overallCond = (
      updated.conditions.engine +
      updated.conditions.transmission +
      updated.conditions.suspension +
      updated.conditions.bodywork +
      updated.conditions.interior
    ) / 5;

    const restoredValue = Math.round(updated.boughtPrice * (1.1 + (overallCond / 100) * 0.75));
    updated.currentValue = restoredValue;

    setSelectedGarageCar(updated);
    setDealershipInventory(prev => prev.map(c => c.id === updated.id ? updated : c));
    sounds.playClick();
  };

  const handleSellCar = (car: DealershipCar) => {
    setCash(c => c + car.currentValue);
    setDealershipInventory(prev => prev.filter(c => c.id !== car.id));
    const profit = car.currentValue - car.boughtPrice - car.repairCostTotal;
    if (profit > 0) {
      setPrestigePoints(p => p + Math.round(profit / 70));
    }
    if (selectedGarageCar?.id === car.id) {
      setSelectedGarageCar(null);
    }
    sounds.playCash();
  };

  // Business Operations
  const handleUnlockBusiness = (biz: Business) => {
    if (cash >= biz.unlockCost && !biz.unlocked) {
      setCash(c => c - biz.unlockCost);
      setBusinesses(prev =>
        prev.map(b => b.id === biz.id ? { ...b, unlocked: true, level: 1 } : b)
      );
      setPrestigePoints(p => p + 3000);
      sounds.playCash();
      sounds.playLevelUp();
    }
  };

  const handleUpgradeBusiness = (biz: Business) => {
    const cost = Math.round(biz.valuation * 0.3);
    if (cash >= cost) {
      setCash(c => c - cost);
      setBusinesses(prev =>
        prev.map(b => {
          if (b.id === biz.id) {
            const nextLvl = b.level + 1;
            return {
              ...b,
              level: nextLvl,
              valuation: Math.round(b.valuation * 1.55),
              monthlyRevenue: Math.round(b.monthlyRevenue * 1.5),
              monthlyExpenses: Math.round(b.monthlyExpenses * 1.3),
              employees: Math.round(b.employees * 1.35)
            };
          }
          return b;
        })
      );
      setPrestigePoints(p => p + 1200);
      sounds.playLevelUp();
    }
  };

  const handleUnlockSubAction = (bizId: string, subAction: BusinessSubAction) => {
    if (cash >= subAction.cost && !subAction.isUnlocked) {
      setCash(c => c - subAction.cost);
      setBusinesses(prev =>
        prev.map(b => {
          if (b.id === bizId) {
            return {
              ...b,
              monthlyRevenue: b.monthlyRevenue + subAction.revenueBonus,
              subActions: b.subActions.map(act => act.id === subAction.id ? { ...act, isUnlocked: true } : act)
            };
          }
          return b;
        })
      );
      setPrestigePoints(p => p + 1800);
      sounds.playCash();
      sounds.playLevelUp();
    }
  };

  // Football Simulation
  const handleStartMatch = () => {
    sounds.playClick();
    const opponentNames = ['Real Madrid CF', 'Manchester City', 'Bayern München', 'Paris Saint-Germain', 'FC Barcelona'];
    const opponent = opponentNames[Math.floor(Math.random() * opponentNames.length)];
    const oppRating = Math.floor(Math.random() * 8) + 86;

    const initialMatch: MatchSimulation = {
      opponent,
      opponentRating: oppRating,
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      isCompleted: false,
      events: [
        { minute: 1, text: `Стартовый свисток арбитра! Матч против ${opponent} начался.`, type: 'foul' }
      ]
    };
    setActiveMatch(initialMatch);

    let currMin = 0;
    let homeS = 0;
    let awayS = 0;

    const matchInterval = setInterval(() => {
      currMin += 15;
      if (currMin <= 90) {
        const homeChance = Math.random();
        const awayChance = Math.random();
        const eventsToAdd: MatchSimulation['events'] = [];

        if (homeChance > 0.52) {
          homeS += 1;
          const scorers = footballClub.squad.filter(p => p.position === 'FWD' || p.position === 'MID');
          const scorer = scorers[Math.floor(Math.random() * scorers.length)]?.name || 'Нападающий';
          eventsToAdd.push({
            minute: currMin,
            text: `ГОООЛ! ${scorer} забивает великолепный мяч! (${homeS}:${awayS})`,
            type: 'goal'
          });
          sounds.playGoalCheer();
        } else if (awayChance > 0.65) {
          awayS += 1;
          eventsToAdd.push({
            minute: currMin,
            text: `Опасная атака! ${opponent} сравнивает/увеличивает счет. (${homeS}:${awayS})`,
            type: 'goal'
          });
        } else {
          eventsToAdd.push({
            minute: currMin,
            text: `Минута ${currMin}: Острый момент у ворот, великолепный сейв голкипера!`,
            type: 'save'
          });
        }

        setActiveMatch(prev => prev ? {
          ...prev,
          minute: currMin,
          homeScore: homeS,
          awayScore: awayS,
          events: [...prev.events, ...eventsToAdd]
        } : null);
      } else {
        clearInterval(matchInterval);
        const won = homeS > awayS;
        const drew = homeS === awayS;
        const prize = won ? 1800000 : (drew ? 500000 : 150000);

        setCash(c => c + prize);
        if (won) {
          setPrestigePoints(p => p + 4500);
          sounds.playGoalCheer();
        }

        setFootballClub(fc => ({
          ...fc,
          matchesPlayed: fc.matchesPlayed + 1,
          wins: won ? fc.wins + 1 : fc.wins,
          draws: drew ? fc.draws + 1 : fc.draws,
          losses: (!won && !drew) ? fc.losses + 1 : fc.losses,
          leaguePoints: fc.leaguePoints + (won ? 3 : (drew ? 1 : 0)),
          goalsFor: fc.goalsFor + homeS,
          goalsAgainst: fc.goalsAgainst + awayS,
          trophiesWon: won && fc.matchesPlayed % 5 === 0 ? fc.trophiesWon + 1 : fc.trophiesWon
        }));

        setActiveMatch(prev => prev ? {
          ...prev,
          minute: 90,
          isCompleted: true,
          resultBonus: prize
        } : null);
      }
    }, 450);
  };

  // Stock & Crypto Trading
  const handleTradeStock = (stock: StockAsset, action: 'BUY' | 'SELL', shares: number) => {
    const totalCost = Number((stock.price * shares).toFixed(2));
    if (action === 'BUY' && cash >= totalCost) {
      setCash(c => c - totalCost);
      setStocks(prev =>
        prev.map(s => s.symbol === stock.symbol ? { ...s, sharesOwned: s.sharesOwned + shares } : s)
      );
      sounds.playCash();
    } else if (action === 'SELL' && stock.sharesOwned >= shares) {
      setCash(c => c + totalCost);
      setStocks(prev =>
        prev.map(s => s.symbol === stock.symbol ? { ...s, sharesOwned: s.sharesOwned - shares } : s)
      );
      sounds.playCash();
    }
  };

  const handleTradeCrypto = (crypto: CryptoAsset, action: 'BUY' | 'SELL', amount: number) => {
    const totalCost = Number((crypto.price * amount).toFixed(2));
    if (action === 'BUY' && cash >= totalCost) {
      setCash(c => c - totalCost);
      setCryptos(prev =>
        prev.map(cItem => cItem.symbol === crypto.symbol ? { ...cItem, amountOwned: cItem.amountOwned + amount } : cItem)
      );
      sounds.playCash();
    } else if (action === 'SELL' && crypto.amountOwned >= amount) {
      setCash(c => c + totalCost);
      setCryptos(prev =>
        prev.map(cItem => cItem.symbol === crypto.symbol ? { ...cItem, amountOwned: cItem.amountOwned - amount } : cItem)
      );
      sounds.playCash();
    }
  };

  // Real Estate Purchase (300 Properties)
  const handleBuyProperty = (property: RealEstateProperty) => {
    if (cash >= property.price && !property.isOwned) {
      setCash(c => c - property.price);
      setRealEstate(prev =>
        prev.map(p => p.id === property.id ? { ...p, isOwned: true } : p)
      );
      setPrestigePoints(p => p + 15000);
      sounds.playCash();
      sounds.playLevelUp();
    }
  };

  // Luxury Item Purchase (50+ Cars, Jets, Yachts, Watches)
  const handleBuyLuxury = (item: LuxuryCollectionItem) => {
    if (cash >= item.price && !item.isOwned) {
      setCash(c => c - item.price);
      setLuxuryItems(prev =>
        prev.map(l => l.id === item.id ? { ...l, isOwned: true } : l)
      );
      setPrestigePoints(p => p + item.prestigePoints);
      sounds.playCash();
      if (item.type === 'CAR') sounds.playEngineRev();
      else sounds.playLevelUp();
    }
  };

  // Tax Office Actions
  const handlePayTaxes = () => {
    const due = taxSystem.accumulatedTaxDue || monthlyTaxDue;
    if (cash >= due) {
      setCash(c => c - due);
      setTaxSystem(t => ({
        ...t,
        accumulatedTaxDue: 0,
        totalTaxPaid: t.totalTaxPaid + due
      }));
    }
  };

  const handleToggleAutoPay = () => {
    setTaxSystem(t => ({ ...t, autoPayTaxes: !t.autoPayTaxes }));
  };

  const handleUnlockOptimization = (type: 'lawyers' | 'monaco' | 'swiss') => {
    if (type === 'lawyers' && cash >= 35000 && !taxSystem.offshoreAccountantsHired) {
      setCash(c => c - 35000);
      setTaxSystem(t => ({
        ...t,
        offshoreAccountantsHired: true,
        effectiveTaxRate: Math.max(0.02, t.effectiveTaxRate - 0.06),
        auditRiskPercent: Math.max(1, t.auditRiskPercent - 2)
      }));
      sounds.playCash();
    } else if (type === 'monaco' && cash >= 120000 && !taxSystem.monacoTrustRegistered) {
      setCash(c => c - 120000);
      setTaxSystem(t => ({
        ...t,
        monacoTrustRegistered: true,
        effectiveTaxRate: Math.max(0.02, t.effectiveTaxRate - 0.08),
        auditRiskPercent: t.auditRiskPercent + 6
      }));
      sounds.playCash();
    } else if (type === 'swiss' && cash >= 350000 && !taxSystem.swissZugHoldingSetup) {
      setCash(c => c - 350000);
      setTaxSystem(t => ({
        ...t,
        swissZugHoldingSetup: true,
        effectiveTaxRate: Math.max(0.02, t.effectiveTaxRate - 0.05),
        auditRiskPercent: t.auditRiskPercent + 4
      }));
      sounds.playCash();
    }
  };

  // Private Club Perks
  const handleBuyClubPerk = (perk: PrivateClubPerk) => {
    if (cash >= perk.cost && !perk.isPurchased) {
      setCash(c => c - perk.cost);
      setClubPerks(prev =>
        prev.map(p => p.id === perk.id ? { ...p, isPurchased: true } : p)
      );
      setPrestigePoints(p => p + 30000);
      sounds.playCash();
      sounds.playLevelUp();
    }
  };

  const currentRank = getPrestigeRank(prestigePoints);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Bar (Single Row, 3 Zones) */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between gap-6">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-extrabold text-neutral-950 shadow-md">
            L2
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white uppercase whitespace-nowrap">
              Looxmaksing Simulator 2
            </h1>
            <p className="text-[11px] text-neutral-400 -mt-0.5">
              Элитный симулятор бизнеса, инвестиций & роскоши
            </p>
          </div>
        </div>

        {/* Zone 2: Global Financial HUD */}
        <div className="hidden lg:flex items-center gap-8 text-xs tabular-nums">
          <div>
            <span className="text-neutral-400 block text-[10px]">Баланс наличных</span>
            <span className="text-emerald-400 font-bold text-sm">{formatExactMoney(cash)}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px]">Общий капитал (Net Worth)</span>
            <span className="text-amber-400 font-bold text-sm">{formatMoney(netWorth)}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px]">Денежный поток / месяц</span>
            <span className={`font-semibold ${netMonthlyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netMonthlyProfit >= 0 ? `+${formatMoney(netMonthlyProfit)}` : formatMoney(netMonthlyProfit)}/мес
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px]">Mogger Статус</span>
            <span className={`font-semibold ${currentRank.color}`}>{currentRank.title}</span>
          </div>
        </div>

        {/* Zone 3: Time Controls & Sound */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/60 text-xs">
            <span className="px-2 text-neutral-300 font-medium">
              {MONTH_NAMES_RU[month - 1]} {year}
            </span>
            <button
              onClick={() => setGameSpeed(s => s === 0 ? 1 : 0)}
              title={gameSpeed === 0 ? 'Возобновить' : 'Пауза'}
              className="p-1.5 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white transition-colors"
            >
              {gameSpeed === 0 ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={advanceMonth}
              title="Следующий месяц"
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-[11px] transition-colors"
            >
              След. месяц
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(v => !v)}
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>
        </div>
      </header>

      {/* Mobile Financial Strip */}
      <div className="lg:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs tabular-nums">
        <div>
          <span className="text-neutral-400 text-[10px]">Наличные: </span>
          <span className="text-emerald-400 font-bold">{formatMoney(cash)}</span>
        </div>
        <div>
          <span className="text-neutral-400 text-[10px]">Капитал: </span>
          <span className="text-amber-400 font-bold">{formatMoney(netWorth)}</span>
        </div>
        <div>
          <span className={`font-semibold ${currentRank.color}`}>{currentRank.title}</span>
        </div>
      </div>

      {/* Main Tab Navigation (APK HUB TAB REMOVED AS REQUESTED) */}
      <nav className="border-b border-neutral-800 bg-neutral-950 px-4 md:px-8 py-2 overflow-x-auto flex items-center gap-2">
        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'business' ? 'bg-amber-500 text-neutral-950 shadow-md font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Бизнес & Автодилер (7 Империй)</span>
        </button>

        <button
          onClick={() => setActiveTab('invest')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'invest' ? 'bg-amber-500 text-neutral-950 shadow-md font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Биржи & 300 Недвижимости</span>
        </button>

        <button
          onClick={() => setActiveTab('luxury')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'luxury' ? 'bg-amber-500 text-neutral-950 shadow-md font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Gem className="w-3.5 h-3.5" />
          <span>50+ Суперкаров & Роскошь</span>
        </button>

        <button
          onClick={() => setActiveTab('football')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'football' ? 'bg-amber-500 text-neutral-950 shadow-md font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Футбольный клуб</span>
        </button>

        <button
          onClick={() => setActiveTab('tax')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'tax' ? 'bg-amber-500 text-neutral-950 shadow-md font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Налоги & Офшоры</span>
          {taxSystem.accumulatedTaxDue > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('club')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'club' ? 'bg-amber-500 text-neutral-950 shadow-md font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Приватный VIP клуб</span>
          {!isPrivateClubUnlocked && (
            <span className="text-[10px] text-neutral-500 ml-1">Lvl 4</span>
          )}
        </button>
      </nav>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">

        {/* TAB 1: UNIFIED BUSINESSES (INCLUDES APEX MOTORS AUTO DEALERSHIP + 6 OTHERS) */}
        {activeTab === 'business' && (
          <UnifiedBusinessView
            businesses={businesses}
            cash={cash}
            dealershipInventory={dealershipInventory}
            marketCars={marketCars}
            selectedGarageCar={selectedGarageCar}
            onSelectGarageCar={setSelectedGarageCar}
            onBuyAuctionCar={handleBuyAuctionCar}
            onRepairCarComponent={handleRepairCarComponent}
            onSellCar={handleSellCar}
            onUnlockBusiness={handleUnlockBusiness}
            onUpgradeBusiness={handleUpgradeBusiness}
            onUnlockSubAction={handleUnlockSubAction}
          />
        )}

        {/* TAB 2: INVESTMENTS (STOCKS & CRYPTO WITH INTERACTIVE DIAGRAM + 300 REAL ESTATE) */}
        {activeTab === 'invest' && (
          <InvestmentsView
            stocks={stocks}
            cryptos={cryptos}
            realEstate={realEstate}
            cash={cash}
            onTradeStock={handleTradeStock}
            onTradeCrypto={handleTradeCrypto}
            onBuyProperty={handleBuyProperty}
          />
        )}

        {/* TAB 3: LUXURY & 50+ CARS GARAGE */}
        {activeTab === 'luxury' && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
              <img
                src={HERO_BANNER}
                alt="Luxury Penthouse Garage"
                className="w-full h-64 object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent flex flex-col justify-end p-6 md:p-8">
                <span className="text-amber-400 text-xs uppercase tracking-wider font-semibold">
                  Личная Коллекция & Статус
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  50+ Суперкаров, Бизнес-Джеты & Мегаяхты
                </h2>
                <p className="text-neutral-300 text-xs max-w-xl mt-1">
                  Приобретайте Bugatti, Koenigsegg, Ferrari, межконтинентальные джеты Gulfstream и коллекционные часы Richard Mille для взрывного роста Mogger-статуса!
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {(['ALL', 'CAR', 'JET', 'YACHT', 'WATCH'] as const).map(tabKey => (
                    <button
                      key={tabKey}
                      onClick={() => setLuxuryFilter(tabKey)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        luxuryFilter === tabKey ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {tabKey === 'ALL' && 'Все'}
                      {tabKey === 'CAR' && 'Суперкары & Гиперкары'}
                      {tabKey === 'JET' && 'Авиация'}
                      {tabKey === 'YACHT' && 'Яхты'}
                      {tabKey === 'WATCH' && 'Часы'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {luxuryItems
                .filter(item => luxuryFilter === 'ALL' || item.type === luxuryFilter)
                .map(item => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                      item.isOwned
                        ? 'bg-neutral-900 border-amber-500/60 shadow-md'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-neutral-400 uppercase tracking-wider text-[10px]">
                          {item.type} · {item.topSpeedOrFeature}
                        </span>
                        {item.isOwned ? (
                          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> В коллекции
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold">{formatMoney(item.price)}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-base">{item.name}</h4>
                      <p className="text-xs text-neutral-300 mt-1">{item.specs}</p>
                      <p className="text-xs text-neutral-500 mt-1 italic">{item.tagline}</p>

                      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-purple-400 font-semibold">
                          +{item.prestigePoints.toLocaleString()} очков Престижа
                        </span>
                        <span className="text-neutral-500 text-[11px]">
                          Обслуживание: ${item.monthlyUpkeep}/мес
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-neutral-800">
                      {item.isOwned ? (
                        <div className="text-center text-xs text-emerald-400 font-bold py-2">
                          Активировано в коллекции
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuyLuxury(item)}
                          disabled={cash < item.price}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold rounded-xl transition-colors shadow disabled:opacity-40"
                        >
                          Купить ({formatMoney(item.price)})
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: FOOTBALL CLUB */}
        {activeTab === 'football' && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
              <img
                src={STADIUM_IMG}
                alt="Football Arena"
                className="w-full h-64 object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent flex flex-col justify-end p-6 md:p-8">
                <span className="text-amber-400 text-xs uppercase tracking-wider font-semibold">
                  {footballClub.division}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  {footballClub.name}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-6 text-xs tabular-nums text-neutral-300">
                  <span>Матчи: <strong>{footballClub.matchesPlayed}</strong></span>
                  <span>Очки: <strong className="text-amber-400">{footballClub.leaguePoints}</strong></span>
                  <span>Победы: <strong className="text-emerald-400">{footballClub.wins}</strong></span>
                  <span>Трофеи: <strong className="text-yellow-400">🏆 {footballClub.trophiesWon}</strong></span>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={handleStartMatch}
                    disabled={activeMatch !== null && !activeMatch.isCompleted}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50"
                  >
                    Начать матч чемпионата
                  </button>
                </div>
              </div>
            </div>

            {/* Match Scoreboard */}
            {activeMatch && (
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <span className="text-xs text-neutral-400">Интерактивный симулятор матча</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {footballClub.name} vs {activeMatch.opponent}
                    </h3>
                  </div>
                  <div className="text-2xl font-black text-amber-400 tabular-nums">
                    {activeMatch.homeScore} : {activeMatch.awayScore}
                  </div>
                  <div className="text-xs font-semibold px-3 py-1 bg-neutral-800 text-neutral-300 rounded-lg">
                    {activeMatch.isCompleted ? 'Матч завершен' : `${activeMatch.minute}' мин`}
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {activeMatch.events.map((ev, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2.5 rounded-xl flex items-center gap-2 ${
                        ev.type === 'goal'
                          ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                          : 'bg-neutral-950 text-neutral-300'
                      }`}
                    >
                      <span className="text-neutral-500 font-mono">{ev.minute}'</span>
                      <span>{ev.text}</span>
                    </div>
                  ))}
                </div>

                {activeMatch.isCompleted && (
                  <div className="p-4 bg-neutral-950 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-neutral-300">
                      Итог встречи: {activeMatch.homeScore > activeMatch.awayScore ? 'Победа!' : (activeMatch.homeScore === activeMatch.awayScore ? 'Ничья' : 'Поражение')}
                    </span>
                    <span className="text-emerald-400 font-bold text-sm">
                      +{formatExactMoney(activeMatch.resultBonus || 0)} призовых
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Squad List */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Звездный состав клуба
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {footballClub.squad.map(player => (
                  <div key={player.id} className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{player.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        {player.position} · {player.age} лет
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400">★ {player.rating}</span>
                      <span className="block text-[10px] text-neutral-500">{formatMoney(player.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TAX & OFFSHORE SYSTEM */}
        {activeTab === 'tax' && (
          <TaxOfficeView
            taxSystem={taxSystem}
            cash={cash}
            monthlyRevenue={monthlyRevenueTotal}
            netWorth={netWorth}
            onPayTaxes={handlePayTaxes}
            onToggleAutoPay={handleToggleAutoPay}
            onUnlockOptimization={handleUnlockOptimization}
          />
        )}

        {/* TAB 6: PRIVATE CLUB SYNDICATE */}
        {activeTab === 'club' && (
          <div className="space-y-6">
            {!isPrivateClubUnlocked ? (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
                <img
                  src={PRIVATE_CLUB_IMG}
                  alt="Private Club"
                  className="w-full h-80 object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent flex flex-col justify-end p-8 text-center max-w-xl mx-auto">
                  <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-extrabold text-white">
                    Private Club Syndicate (VIP Клуб)
                  </h2>
                  <p className="text-xs text-neutral-400 mt-2">
                    Вход в закрытый мировой клуб миллионеров и синдикатов открывается только при достижении <strong>4-го уровня</strong> в любой из ваших компаний!
                  </p>
                  <div className="mt-6 p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                    Текущий наивысший уровень бизнеса: <strong className="text-amber-400">{maxBizLevel}</strong> из 4
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-neutral-900">
                  <img
                    src={PRIVATE_CLUB_IMG}
                    alt="Private Club Lounge"
                    className="w-full h-64 object-cover opacity-45"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent flex flex-col justify-end p-6 md:p-8">
                    <span className="text-amber-400 text-xs uppercase tracking-wider font-semibold">
                      Эксклюзивное Членство · Syndicate
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                      VIP Private Club & Мировой Синдикат
                    </h2>
                    <p className="text-xs text-neutral-300 max-w-xl mt-1">
                      Закрытые инсайдерские каналы, синдикатные сделки, офшорная оптимизация и влияние на мировые рынки.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clubPerks.map(perk => (
                    <div
                      key={perk.id}
                      className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-amber-400 font-bold">Синдикатная привилегия</span>
                          {perk.isPurchased && (
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Активировано
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-base">{perk.title}</h4>
                        <p className="text-xs text-neutral-400 mt-2">{perk.description}</p>
                      </div>

                      <div className="mt-6 pt-3 border-t border-neutral-800">
                        {perk.isPurchased ? (
                          <div className="text-center text-xs text-emerald-400 font-bold py-2">
                            Привилегия активна бессрочно
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuyClubPerk(perk)}
                            disabled={cash < perk.cost}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-colors disabled:opacity-40"
                          >
                            Купить привилегию ({formatMoney(perk.cost)})
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 px-4 md:px-8 py-4 text-xs text-neutral-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span>Looxmaksing Simulator 2 · Kotlin Android & Web Edition</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/kochvalds/kochbratangame2"
            target="_blank"
            rel="noreferrer"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            GitHub Repository
          </a>
          <a
            href="https://github.com/kochvalds/kochbratangame2/releases"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Releases & APK
          </a>
        </div>
      </footer>
    </div>
  );
}
