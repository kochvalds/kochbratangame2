import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Car,
  Trophy,
  TrendingUp,
  Gem,
  Crown,
  Play,
  Pause,
  FastForward,
  Volume2,
  VolumeX,
  ExternalLink,
  Wrench,
  CheckCircle2,
  ShoppingBag,
  Utensils,
  Hammer,
  Cpu,
  Rocket,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Smartphone,
  Github
} from 'lucide-react';
import {
  INITIAL_BUSINESSES,
  INITIAL_DEALERSHIP_CARS,
  INITIAL_FOOTBALL_CLUB,
  INITIAL_STOCKS,
  INITIAL_CRYPTOS,
  INITIAL_REAL_ESTATE,
  INITIAL_LUXURY_ITEMS,
  INITIAL_PRIVATE_CLUB_PERKS
} from './data/initialData';
import {
  Business,
  DealershipCar,
  FootballClub,
  StockAsset,
  CryptoAsset,
  RealEstateProperty,
  LuxuryCollectionItem,
  PrivateClubPerk,
  MatchSimulation
} from './types/game';
import { formatMoney, formatExactMoney, formatPercent, getPrestigeRank, MONTH_NAMES_RU } from './utils/formatters';
import { sounds } from './utils/audio';

const HERO_BANNER = '/src/assets/images/loox_hero_luxury_banner_1791553574137.jpg';
const SHOWROOM_IMG = '/src/assets/images/car_dealership_showroom_1791553586392.jpg';
const STADIUM_IMG = '/src/assets/images/football_stadium_arena_1791553596250.jpg';
const PRIVATE_CLUB_IMG = '/src/assets/images/private_club_lounge_1791553605970.jpg';

export default function App() {
  // Player state
  const [cash, setCash] = useState<number>(45000);
  const [prestigePoints, setPrestigePoints] = useState<number>(1500);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(2026);
  const [gameSpeed, setGameSpeed] = useState<number>(1); // 0 = pause, 1 = normal, 2 = fast, 5 = ultra
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'business' | 'dealership' | 'football' | 'invest' | 'luxury' | 'club' | 'android'>('dealership');

  // Business State
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);

  // Dealership State
  const [dealershipUnlocked, setDealershipUnlocked] = useState<boolean>(false);
  const [dealershipInventory, setDealershipInventory] = useState<DealershipCar[]>([]);
  const [marketCars, setMarketCars] = useState<DealershipCar[]>(INITIAL_DEALERSHIP_CARS);
  const [selectedGarageCar, setSelectedGarageCar] = useState<DealershipCar | null>(null);

  // Football State
  const [footballClub, setFootballClub] = useState<FootballClub>(INITIAL_FOOTBALL_CLUB);
  const [activeMatch, setActiveMatch] = useState<MatchSimulation | null>(null);

  // Investments State
  const [stocks, setStocks] = useState<StockAsset[]>(INITIAL_STOCKS);
  const [cryptos, setCryptos] = useState<CryptoAsset[]>(INITIAL_CRYPTOS);
  const [realEstate, setRealEstate] = useState<RealEstateProperty[]>(INITIAL_REAL_ESTATE);
  const [selectedStock, setSelectedStock] = useState<StockAsset>(INITIAL_STOCKS[0]);
  const [stockTradeAmount, setStockTradeAmount] = useState<number>(10);

  // Luxury State
  const [luxuryItems, setLuxuryItems] = useState<LuxuryCollectionItem[]>(INITIAL_LUXURY_ITEMS);
  const [luxuryFilter, setLuxuryFilter] = useState<'ALL' | 'CAR' | 'JET' | 'YACHT' | 'WATCH'>('ALL');

  // Private Club
  const [clubPerks, setClubPerks] = useState<PrivateClubPerk[]>(INITIAL_PRIVATE_CLUB_PERKS);

  // Check if private club is unlocked (business level >= 4)
  const maxBizLevel = Math.max(...businesses.map(b => b.level));
  const isPrivateClubUnlocked = maxBizLevel >= 4;

  // Sound sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Net worth calculation
  const netWorth = React.useMemo(() => {
    let sum = cash;
    // Businesses valuation
    sum += businesses.filter(b => b.unlocked).reduce((acc, b) => acc + b.valuation, 0);
    // Dealership inventory
    sum += dealershipInventory.reduce((acc, c) => acc + c.currentValue, 0);
    // Real estate
    sum += realEstate.filter(p => p.isOwned).reduce((acc, p) => acc + p.price, 0);
    // Luxury items
    sum += luxuryItems.filter(l => l.isOwned).reduce((acc, l) => acc + l.price, 0);
    // Stocks
    sum += stocks.reduce((acc, s) => acc + s.sharesOwned * s.price, 0);
    // Cryptos
    sum += cryptos.reduce((acc, c) => acc + c.amountOwned * c.price, 0);
    return sum;
  }, [cash, businesses, dealershipInventory, realEstate, luxuryItems, stocks, cryptos]);

  // Monthly passive income
  const monthlyCashflow = React.useMemo(() => {
    let income = 0;
    // Business profits
    businesses.filter(b => b.unlocked).forEach(b => {
      income += (b.monthlyRevenue - b.monthlyExpenses);
    });
    // Real estate rents
    realEstate.filter(p => p.isOwned).forEach(p => {
      income += p.monthlyRentalYield;
    });
    // Upkeep of luxury items
    luxuryItems.filter(l => l.isOwned).forEach(l => {
      income -= l.monthlyUpkeep;
    });
    return income;
  }, [businesses, realEstate, luxuryItems]);

  // Turn / Next Month Tick
  const advanceMonth = () => {
    setMonth(prevM => {
      if (prevM === 12) {
        setYear(prevY => prevY + 1);
        return 1;
      }
      return prevM + 1;
    });

    // Apply cashflow
    setCash(prevCash => Math.max(0, prevCash + monthlyCashflow));

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

  // Automated game loop timer
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
  }, [gameSpeed, monthlyCashflow]);

  // Unlock Dealership
  const handleUnlockDealership = () => {
    if (cash >= 40000 && !dealershipUnlocked) {
      setCash(c => c - 40000);
      setDealershipUnlocked(true);
      setPrestigePoints(p => p + 650);
      sounds.playCash();
      sounds.playEngineRev();
    }
  };

  // Buy car from market/auction
  const handleBuyCar = (car: DealershipCar) => {
    if (cash >= car.boughtPrice) {
      setCash(c => c - car.boughtPrice);
      setMarketCars(prev => prev.filter(item => item.id !== car.id));
      const newOwnedCar = { ...car, isOwned: true };
      setDealershipInventory(prev => [...prev, newOwnedCar]);
      setSelectedGarageCar(newOwnedCar);
      sounds.playCash();
      sounds.playEngineRev();
    }
  };

  // Repair car component
  const handleRepairComponent = (
    component: 'engine' | 'transmission' | 'suspension' | 'bodywork' | 'interior',
    cost: number
  ) => {
    if (!selectedGarageCar || cash < cost) return;
    setCash(c => c - cost);

    const updatedCar: DealershipCar = {
      ...selectedGarageCar,
      repairCostTotal: selectedGarageCar.repairCostTotal + cost,
      conditions: {
        ...selectedGarageCar.conditions,
        [component]: 100
      }
    };

    // Calculate boosted market value based on repairs
    const overallCond = (
      updatedCar.conditions.engine +
      updatedCar.conditions.transmission +
      updatedCar.conditions.suspension +
      updatedCar.conditions.bodywork +
      updatedCar.conditions.interior
    ) / 5;

    const restoredValue = Math.round(updatedCar.boughtPrice * (1.1 + (overallCond / 100) * 0.75));
    updatedCar.currentValue = restoredValue;

    setSelectedGarageCar(updatedCar);
    setDealershipInventory(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
    sounds.playClick();
  };

  // Flip / Sell Car
  const handleSellCar = (car: DealershipCar) => {
    setCash(c => c + car.currentValue);
    setDealershipInventory(prev => prev.filter(item => item.id !== car.id));
    const profit = car.currentValue - car.boughtPrice - car.repairCostTotal;
    if (profit > 0) {
      setPrestigePoints(p => p + Math.round(profit / 80));
    }
    if (selectedGarageCar?.id === car.id) {
      setSelectedGarageCar(null);
    }
    sounds.playCash();
  };

  // Upgrade Business
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
              employees: Math.round(b.employees * 1.4)
            };
          }
          return b;
        })
      );
      setPrestigePoints(p => p + 950);
      sounds.playLevelUp();
    }
  };

  // Unlock New Business
  const handleUnlockBusiness = (biz: Business) => {
    if (cash >= biz.unlockCost && !biz.unlocked) {
      setCash(c => c - biz.unlockCost);
      setBusinesses(prev =>
        prev.map(b => (b.id === biz.id ? { ...b, unlocked: true, level: 1 } : b))
      );
      setPrestigePoints(p => p + 2500);
      sounds.playLevelUp();
    }
  };

  // Simulate Football Match
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
        // Goal chance
        const homeChance = Math.random();
        const awayChance = Math.random();
        const eventsToAdd: MatchSimulation['events'] = [];

        if (homeChance > 0.55) {
          homeS += 1;
          const scorers = footballClub.squad.filter(p => p.position === 'FWD' || p.position === 'MID');
          const scorer = scorers[Math.floor(Math.random() * scorers.length)]?.name || 'Нападающий';
          eventsToAdd.push({
            minute: currMin,
            text: `ГОООЛ! ${scorer} забивает великолепный мяч в девятку! (${homeS}:${awayS})`,
            type: 'goal'
          });
          sounds.playGoalCheer();
        } else if (awayChance > 0.65) {
          awayS += 1;
          eventsToAdd.push({
            minute: currMin,
            text: `Опасная контратака! ${opponent} сравнивает/увеличивает счет. (${homeS}:${awayS})`,
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
        const prize = won ? 1500000 : (drew ? 400000 : 100000);

        setCash(c => c + prize);
        if (won) {
          setPrestigePoints(p => p + 3500);
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

  // Stock Trade (Buy/Sell)
  const handleBuyStock = (stock: StockAsset, shares: number) => {
    const totalCost = stock.price * shares;
    if (cash >= totalCost) {
      setCash(c => c - totalCost);
      setStocks(prev =>
        prev.map(s => s.symbol === stock.symbol ? { ...s, sharesOwned: s.sharesOwned + shares } : s)
      );
      sounds.playCash();
    }
  };

  const handleSellStock = (stock: StockAsset, shares: number) => {
    if (stock.sharesOwned >= shares) {
      const payout = stock.price * shares;
      setCash(c => c + payout);
      setStocks(prev =>
        prev.map(s => s.symbol === stock.symbol ? { ...s, sharesOwned: s.sharesOwned - shares } : s)
      );
      sounds.playCash();
    }
  };

  // Real Estate Purchase
  const handleBuyProperty = (property: RealEstateProperty) => {
    if (cash >= property.price && !property.isOwned) {
      setCash(c => c - property.price);
      setRealEstate(prev =>
        prev.map(p => p.id === property.id ? { ...p, isOwned: true } : p)
      );
      setPrestigePoints(p => p + 18000);
      sounds.playCash();
      sounds.playLevelUp();
    }
  };

  // Luxury Item Purchase
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

  // Private Club Perk Purchase
  const handleBuyClubPerk = (perk: PrivateClubPerk) => {
    if (cash >= perk.cost && !perk.isPurchased) {
      setCash(c => c - perk.cost);
      setClubPerks(prev =>
        prev.map(p => p.id === perk.id ? { ...p, isPurchased: true } : p)
      );
      setPrestigePoints(p => p + 25000);
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
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-neutral-950 shadow-md">
            L2
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white uppercase whitespace-nowrap">
              Looxmaksing Simulator 2
            </h1>
            <p className="text-[11px] text-neutral-400 -mt-0.5">
              Kotlin Android & Web Edition
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
            <span className={`font-semibold ${monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {monthlyCashflow >= 0 ? `+${formatMoney(monthlyCashflow)}` : formatMoney(monthlyCashflow)}/мес
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px]">Mogger Статус</span>
            <span className={`font-semibold ${currentRank.color}`}>{currentRank.title}</span>
          </div>
        </div>

        {/* Zone 3: Time Controls & Sound */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-lg border border-neutral-700/60 text-xs">
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
              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded text-[11px] transition-colors"
            >
              След. месяц
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(v => !v)}
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition-colors"
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

      {/* Main Tab Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-950 px-4 md:px-8 py-2 overflow-x-auto flex items-center gap-2">
        <button
          onClick={() => setActiveTab('dealership')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'dealership' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Автодилер ($40k)</span>
          {!dealershipUnlocked && (
            <span className="text-[10px] bg-neutral-800 text-amber-400 px-1 rounded ml-1">Купить</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'business' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>6 Бизнесов</span>
        </button>

        <button
          onClick={() => setActiveTab('football')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'football' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Футбольный клуб</span>
        </button>

        <button
          onClick={() => setActiveTab('invest')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'invest' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Акции & Недвижимость</span>
        </button>

        <button
          onClick={() => setActiveTab('luxury')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'luxury' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Gem className="w-3.5 h-3.5" />
          <span>Роскошь & Гараж</span>
        </button>

        <button
          onClick={() => setActiveTab('club')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'club' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Приватный клуб</span>
          {!isPrivateClubUnlocked && (
            <span className="text-[10px] text-neutral-500 ml-1">Lvl 4</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('android')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'android' ? 'bg-emerald-500 text-neutral-950 shadow-md' : 'text-emerald-400 hover:bg-neutral-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Kotlin / APK Hub</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">

        {/* TAB 1: DEALERSHIP & WORKSHOP */}
        {activeTab === 'dealership' && (
          <div className="space-y-8">
            {!dealershipUnlocked ? (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
                <img
                  src={SHOWROOM_IMG}
                  alt="Dealership Showroom"
                  className="w-full h-80 object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent flex flex-col justify-end p-8">
                  <span className="text-amber-400 text-xs uppercase tracking-wider font-semibold">
                    Автомобильный бизнес · Инвестиции
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                    Откройте Автомобильный Дилерский Центр
                  </h2>
                  <p className="text-neutral-300 text-sm max-w-2xl mt-2">
                    Покупайте битые и подержанные премиальные суперкары с аукционов, проводите диагностику узлов (двигатель, трансмиссия, подвеска, кузов), заказывайте запчасти, полируйте и продавайте с чистой маржой от $15,000 до $80,000 за автомобиль!
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={handleUnlockDealership}
                      disabled={cash < 40000}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Car className="w-4 h-4" />
                      <span>Купить лицензию за $40,000</span>
                    </button>
                    <span className="text-xs text-neutral-400">
                      Ваш баланс: <strong className="text-white">{formatExactMoney(cash)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Strip */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Car className="w-5 h-5 text-amber-400" />
                      <span>Apex Motors — Автосалон & Реставрация</span>
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      В вашем гараже: {dealershipInventory.length} авто · Доступно на аукционе: {marketCars.length} лотов
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800 text-xs">
                      <span className="text-neutral-400 block text-[10px]">Автомобилей в работе</span>
                      <span className="text-amber-400 font-bold">{dealershipInventory.length} шт.</span>
                    </div>
                  </div>
                </div>

                {/* Split View: Inventory on Left, Inspection/Repair Center on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Owned Garage Inventory */}
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                      Автомобили в вашем сервисе
                    </h3>

                    {dealershipInventory.length === 0 ? (
                      <div className="bg-neutral-900/60 border border-dashed border-neutral-800 p-8 rounded-xl text-center">
                        <Car className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                        <p className="text-sm text-neutral-400 font-medium">Ваш бокс пуст</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Купите подержанный суперкар на аукционе справа, чтобы начать ремонт и перепродажу!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dealershipInventory.map(car => (
                          <div
                            key={car.id}
                            onClick={() => setSelectedGarageCar(car)}
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
                                Куплен за {formatExactMoney(car.boughtPrice)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSellCar(car);
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
                              >
                                Продать авто
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Active Workshop & Diagnostics */}
                  <div className="lg:col-span-7 space-y-4">
                    {selectedGarageCar ? (
                      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-amber-400 text-xs font-semibold uppercase">
                              Цех Диагностики & Тюнинга
                            </span>
                            <h3 className="text-xl font-bold text-white mt-1">
                              {selectedGarageCar.brand} {selectedGarageCar.model} ({selectedGarageCar.year})
                            </h3>
                            <p className="text-xs text-neutral-400">
                              Макс. скорость: {selectedGarageCar.topSpeed} км/ч · Вложено в ремонт: {formatExactMoney(selectedGarageCar.repairCostTotal)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-neutral-400 block">Оценочная стоимость</span>
                            <span className="text-lg font-bold text-emerald-400">
                              {formatExactMoney(selectedGarageCar.currentValue)}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Component Repairs */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                            Узлы и Реставрация
                          </h4>

                          {/* Engine */}
                          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                            <div>
                              <div className="text-xs font-semibold text-white">Двигатель (ДВС)</div>
                              <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.engine}%</div>
                            </div>
                            {selectedGarageCar.conditions.engine < 100 ? (
                              <button
                                onClick={() => handleRepairComponent('engine', 3500)}
                                disabled={cash < 3500}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-medium rounded transition-colors disabled:opacity-40"
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
                          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                            <div>
                              <div className="text-xs font-semibold text-white">Трансмиссия & Сцепление</div>
                              <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.transmission}%</div>
                            </div>
                            {selectedGarageCar.conditions.transmission < 100 ? (
                              <button
                                onClick={() => handleRepairComponent('transmission', 2200)}
                                disabled={cash < 2200}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-medium rounded transition-colors disabled:opacity-40"
                              >
                                Замена фрикционов ($2,200)
                              </button>
                            ) : (
                              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Идеал
                              </span>
                            )}
                          </div>

                          {/* Suspension */}
                          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                            <div>
                              <div className="text-xs font-semibold text-white">Спортивная подвеска & Тормоза</div>
                              <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.suspension}%</div>
                            </div>
                            {selectedGarageCar.conditions.suspension < 100 ? (
                              <button
                                onClick={() => handleRepairComponent('suspension', 1800)}
                                disabled={cash < 1800}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-medium rounded transition-colors disabled:opacity-40"
                              >
                                Новые амортизаторы ($1,800)
                              </button>
                            ) : (
                              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Идеал
                              </span>
                            )}
                          </div>

                          {/* Bodywork & Paint */}
                          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                            <div>
                              <div className="text-xs font-semibold text-white">Кузов, Карбон & Покраска</div>
                              <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.bodywork}%</div>
                            </div>
                            {selectedGarageCar.conditions.bodywork < 100 ? (
                              <button
                                onClick={() => handleRepairComponent('bodywork', 2600)}
                                disabled={cash < 2600}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-medium rounded transition-colors disabled:opacity-40"
                              >
                                Покраска & Полировка ($2,600)
                              </button>
                            ) : (
                              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Идеал
                              </span>
                            )}
                          </div>

                          {/* Interior */}
                          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                            <div>
                              <div className="text-xs font-semibold text-white">Кожаный салон & Детейлинг</div>
                              <div className="text-[11px] text-neutral-400">Состояние: {selectedGarageCar.conditions.interior}%</div>
                            </div>
                            {selectedGarageCar.conditions.interior < 100 ? (
                              <button
                                onClick={() => handleRepairComponent('interior', 1400)}
                                disabled={cash < 1400}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-medium rounded transition-colors disabled:opacity-40"
                              >
                                Химчистка & Алькантара ($1,400)
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
                            <span className="text-xs text-neutral-400 block">Ожидаемая чистая прибыль</span>
                            <span className="text-base font-bold text-emerald-400">
                              +{formatExactMoney(selectedGarageCar.currentValue - selectedGarageCar.boughtPrice - selectedGarageCar.repairCostTotal)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSellCar(selectedGarageCar)}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg transition-colors shadow"
                          >
                            Продать покупателю за {formatExactMoney(selectedGarageCar.currentValue)}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-900/60 border border-neutral-800 p-8 rounded-xl text-center space-y-4">
                        <Wrench className="w-10 h-10 text-neutral-600 mx-auto" />
                        <h4 className="font-bold text-white text-base">Интерактивный пост техобслуживания</h4>
                        <p className="text-xs text-neutral-400 max-w-md mx-auto">
                          Выберите автомобиль из левого списка или купите новый лот на аукционе внизу, чтобы диагностировать и устранить неисправности!
                        </p>
                      </div>
                    )}

                    {/* Auction Listings */}
                    <div className="space-y-3 pt-4">
                      <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                        Автомобильный аукцион (Новые поступления)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {marketCars.map(car => (
                          <div
                            key={car.id}
                            className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <h4 className="font-bold text-white text-sm">{car.brand} {car.model}</h4>
                                <span className="text-xs font-bold text-amber-400">{formatExactMoney(car.boughtPrice)}</span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-1">
                                {car.year} г. · {car.horsePower} л.с.
                              </p>
                              <div className="text-[10px] text-neutral-500 mt-2">
                                Требует ремонта: ДВС {car.conditions.engine}%, Кузов {car.conditions.bodywork}%
                              </div>
                            </div>
                            <button
                              onClick={() => handleBuyCar(car)}
                              disabled={cash < car.boughtPrice}
                              className="mt-4 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                            >
                              Выкупить с аукциона ({formatExactMoney(car.boughtPrice)})
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 6 BUSINESS CATEGORIES */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>Управление Корпоративной Империей (6 Категорий)</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Развивайте розничные сети, отели Michelin, частные банки, строительные холдинги, IT-гиганты и космические агентства.
                </p>
              </div>
              <div className="text-xs text-neutral-400 bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800">
                Максимальный уровень компании: <strong className="text-amber-400">{maxBizLevel}</strong> / 10
                {maxBizLevel >= 4 && (
                  <span className="block text-emerald-400 font-semibold mt-0.5">Приватный клуб разблокирован!</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map(biz => (
                <div
                  key={biz.id}
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                    biz.unlocked
                      ? 'bg-neutral-900 border-neutral-800'
                      : 'bg-neutral-900/40 border-neutral-800/60 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                        {biz.categoryName}
                      </span>
                      {biz.unlocked ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Уровень {biz.level}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500 font-medium">Закрыто</span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{biz.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{biz.description}</p>

                    {biz.unlocked && (
                      <div className="mt-4 space-y-2 pt-3 border-t border-neutral-800 text-xs tabular-nums">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Оценка стоимости:</span>
                          <span className="font-semibold text-white">{formatMoney(biz.valuation)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Чистая прибыль:</span>
                          <span className="font-semibold text-emerald-400">
                            +{formatMoney(biz.monthlyRevenue - biz.monthlyExpenses)}/мес
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Сотрудников:</span>
                          <span className="text-neutral-300">{biz.employees} чел.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-3 border-t border-neutral-800">
                    {biz.unlocked ? (
                      <button
                        onClick={() => handleUpgradeBusiness(biz)}
                        disabled={cash < Math.round(biz.valuation * 0.3)}
                        className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                      >
                        Улучшить компанию ({formatMoney(Math.round(biz.valuation * 0.3))})
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockBusiness(biz)}
                        disabled={cash < biz.unlockCost}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                      >
                        Открыть бизнес за {formatMoney(biz.unlockCost)}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FOOTBALL CLUB */}
        {activeTab === 'football' && (
          <div className="space-y-6">
            {/* Arena Hero */}
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

            {/* Match Screen / Live Scoreboard */}
            {activeMatch && (
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
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
                  <div className="text-xs font-semibold px-3 py-1 bg-neutral-800 text-neutral-300 rounded">
                    {activeMatch.isCompleted ? 'Матч завершен' : `${activeMatch.minute}' мин`}
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {activeMatch.events.map((ev, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded flex items-center gap-2 ${
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
                  <div className="p-4 bg-neutral-950 rounded-lg flex items-center justify-between text-xs">
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
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Звездный состав клуба (Ключевые игроки)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {footballClub.squad.map(player => (
                  <div key={player.id} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{player.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        Позиция: {player.position} · Возраст: {player.age}
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

        {/* TAB 4: INVESTMENTS (STOCKS, CRYPTO, REAL ESTATE) */}
        {activeTab === 'invest' && (
          <div className="space-y-8">
            {/* Real Estate Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Премиальная Недвижимость Мира</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Пентхаусы, виллы и шале в элитных локациях мира приносят стабильный пассивный доход от аренды каждый месяц.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realEstate.map(prop => (
                  <div
                    key={prop.id}
                    className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-amber-400 font-semibold">{prop.city}</span>
                        {prop.isOwned && (
                          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded">
                            В собственности
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm">{prop.name}</h4>
                      <p className="text-xs text-neutral-400 mt-1">{prop.description}</p>
                      <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1.5 text-xs tabular-nums">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Стоимость покупки:</span>
                          <span className="font-semibold text-white">{formatMoney(prop.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Арендный доход:</span>
                          <span className="font-semibold text-emerald-400">+{formatMoney(prop.monthlyRentalYield)}/мес</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-neutral-800">
                      {prop.isOwned ? (
                        <div className="text-center text-xs text-emerald-400 font-semibold py-2">
                          Сдается в аренду (+{formatMoney(prop.monthlyRentalYield)}/мес)
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuyProperty(prop)}
                          disabled={cash < prop.price}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                        >
                          Купить недвижимость ({formatMoney(prop.price)})
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stocks & Crypto Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-neutral-800">
              {/* Stock Market */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Биржа Акций (Wall Street)</span>
                </h3>
                <div className="space-y-3">
                  {stocks.map(stock => {
                    const change = ((stock.price - stock.prevPrice) / stock.prevPrice) * 100;
                    return (
                      <div
                        key={stock.symbol}
                        className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{stock.symbol}</span>
                            <span className="text-neutral-400 text-xs">{stock.name}</span>
                          </div>
                          <span className="text-[11px] text-neutral-500">
                            В портфеле: {stock.sharesOwned} акций ({formatMoney(stock.sharesOwned * stock.price)})
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-white text-xs tabular-nums block">${stock.price.toFixed(2)}</span>
                          <span className={`text-[11px] font-semibold tabular-nums ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatPercent(change)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 ml-3">
                          <button
                            onClick={() => handleBuyStock(stock, 5)}
                            disabled={cash < stock.price * 5}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded disabled:opacity-40"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleSellStock(stock, 5)}
                            disabled={stock.sharesOwned < 5}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-semibold rounded disabled:opacity-40"
                          >
                            -5
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Crypto Assets */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Криптовалютный Рынок</span>
                </h3>
                <div className="space-y-3">
                  {cryptos.map(crypto => {
                    const change = ((crypto.price - crypto.prevPrice) / crypto.prevPrice) * 100;
                    return (
                      <div
                        key={crypto.symbol}
                        className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-400 text-xs">{crypto.symbol}</span>
                            <span className="text-neutral-300 text-xs">{crypto.name}</span>
                          </div>
                          <span className="text-[11px] text-neutral-500">
                            В кошельке: {crypto.amountOwned.toFixed(2)} ({formatMoney(crypto.amountOwned * crypto.price)})
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-white text-xs tabular-nums block">${crypto.price.toFixed(2)}</span>
                          <span className={`text-[11px] font-semibold tabular-nums ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatPercent(change)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 ml-3">
                          <button
                            onClick={() => {
                              const cost = crypto.price * 1;
                              if (cash >= cost) {
                                setCash(c => c - cost);
                                setCryptos(prev =>
                                  prev.map(item => item.symbol === crypto.symbol ? { ...item, amountOwned: item.amountOwned + 1 } : item)
                                );
                                sounds.playCash();
                              }
                            }}
                            disabled={cash < crypto.price}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded disabled:opacity-40"
                          >
                            Купить
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LUXURY GARAGE & PRESTIGE ITEMS */}
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
                  Элитный Автопарк, Джеты и Яхты
                </h2>
                <p className="text-neutral-300 text-xs max-w-xl mt-1">
                  Покупка суперкаров Bugatti, Rolls-Royce, Ferrari, межконтинентальных джетов Gulfstream и часов Richard Mille возносит ваш Mogger-престиж на мировой уровень.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {(['ALL', 'CAR', 'JET', 'YACHT', 'WATCH'] as const).map(tabKey => (
                    <button
                      key={tabKey}
                      onClick={() => setLuxuryFilter(tabKey)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        luxuryFilter === tabKey ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {tabKey === 'ALL' && 'Все'}
                      {tabKey === 'CAR' && 'Суперкары'}
                      {tabKey === 'JET' && 'Джеты'}
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
                    className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                      item.isOwned
                        ? 'bg-neutral-900 border-amber-500/60 shadow-md'
                        : 'bg-neutral-900 border-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-neutral-400 uppercase tracking-wider text-[10px]">
                          {item.type} · {item.topSpeedOrFeature}
                        </span>
                        {item.isOwned ? (
                          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded">
                            В ангаре / гараже
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">{formatMoney(item.price)}</span>
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
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
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

        {/* TAB 6: PRIVATE CLUB (SYNDICATE) */}
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
                      className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-amber-400 font-bold">Синдикатная привилегия</span>
                          {perk.isPurchased && (
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded">
                              Активировано
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
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
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

        {/* TAB 7: KOTLIN / APK HUB */}
        {activeTab === 'android' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Kotlin & Android Репозиторий + Релиз APK
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Исходный код на языке Kotlin, сборка Android App Bundle / APK и GitHub Actions
                    </p>
                  </div>
                </div>

                <a
                  href="https://github.com/kochvalds/kochbratangame2"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>Открыть репозиторий</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-800">
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">GitHub Репозиторий</span>
                  <p className="text-sm font-bold text-white mt-1">kochvalds/kochbratangame2</p>
                  <span className="text-xs text-emerald-400 mt-1 block">Ветка: main (Pushed)</span>
                </div>
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Релиз Версии</span>
                  <p className="text-sm font-bold text-amber-400 mt-1">v2.0.0 (Release Tag)</p>
                  <span className="text-xs text-neutral-400 mt-1 block">Опубликовано на GitHub Releases</span>
                </div>
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Автосборка APK</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">GitHub Actions CI/CD</p>
                  <span className="text-xs text-neutral-400 mt-1 block">Workflow: build-apk.yml</span>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-neutral-950 to-neutral-950 rounded-xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Прямой доступ к разделу Релизов и скачиванию APK</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    GitHub Actions автоматически компилирует Kotlin код проекта в .apk и прикрепляет файл к релизу.
                  </p>
                </div>
                <a
                  href="https://github.com/kochvalds/kochbratangame2/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors shadow flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Скачать APK на GitHub Releases</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Структура Kotlin проекта:
                </h4>
                <div className="p-3 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-400 space-y-1">
                  <div>android/app/src/main/kotlin/com/looxmaksing/simulator/MainActivity.kt</div>
                  <div>android/app/src/main/kotlin/com/looxmaksing/simulator/viewmodel/GameViewModel.kt</div>
                  <div>android/app/src/main/kotlin/com/looxmaksing/simulator/model/GameModels.kt</div>
                  <div>android/app/build.gradle.kts (Compose & Kotlin 2.0.20)</div>
                  <div>.github/workflows/build-apk.yml (Автоматическая сборка APK в Релизы)</div>
                </div>
              </div>
            </div>
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
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
          <a
            href="https://github.com/kochvalds/kochbratangame2/releases"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
          >
            <span>APK Releases</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
