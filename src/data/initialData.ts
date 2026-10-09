import {
  Business,
  DealershipCar,
  FootballClub,
  StockAsset,
  CryptoAsset,
  RealEstateProperty,
  LuxuryCollectionItem,
  PrivateClubPerk
} from '../types/game';

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz_retail',
    name: 'Atelier Aurelia & Luxury Retail',
    category: 'RETAIL',
    categoryName: 'Розничная торговля & Бутики',
    description: 'Сеть элитных бутиков и ювелирных домов в Милане, Париже и Дубае.',
    level: 1,
    unlocked: true,
    unlockCost: 0,
    valuation: 85000,
    monthlyRevenue: 6200,
    monthlyExpenses: 2800,
    employees: 12,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'ShoppingBag'
  },
  {
    id: 'biz_hospitality',
    name: 'Grand Elysium Hotels & Resorts',
    category: 'HOSPITALITY',
    categoryName: 'Рестораны & Отели Michelin',
    description: 'Сеть пятизвездочных отелей и ресторанов высокой кухни с 3 звездами Michelin.',
    level: 0,
    unlocked: false,
    unlockCost: 150000,
    valuation: 450000,
    monthlyRevenue: 28500,
    monthlyExpenses: 14200,
    employees: 48,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Utensils'
  },
  {
    id: 'biz_banking',
    name: 'Zurich Private Merchant Bank',
    category: 'BANKING',
    categoryName: 'Банкинг & Хедж-фонды',
    description: 'Швейцарский приватный банк и квантовый хедж-фонд для ультрабогатых клиентов.',
    level: 0,
    unlocked: false,
    unlockCost: 750000,
    valuation: 2800000,
    monthlyRevenue: 135000,
    monthlyExpenses: 52000,
    employees: 85,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Building2'
  },
  {
    id: 'biz_construction',
    name: 'Apex Megastructure & Skyscraper Dev',
    category: 'CONSTRUCTION',
    categoryName: 'Строительный холдинг',
    description: 'Строительство небоскребов, искусственных островов и роскошных пентхаусов.',
    level: 0,
    unlocked: false,
    unlockCost: 2500000,
    valuation: 9500000,
    monthlyRevenue: 480000,
    monthlyExpenses: 190000,
    employees: 320,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Hammer'
  },
  {
    id: 'biz_tech',
    name: 'Synapse Core AI & Quantum Cloud',
    category: 'TECH',
    categoryName: 'IT & Высокие технологии',
    description: 'Разработка передовых нейросетей, автономных систем и квантовых вычислений.',
    level: 0,
    unlocked: false,
    unlockCost: 8000000,
    valuation: 35000000,
    monthlyRevenue: 1650000,
    monthlyExpenses: 620000,
    employees: 450,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Cpu'
  },
  {
    id: 'biz_aerospace',
    name: 'Aether Orbital & Space Agency',
    category: 'AEROSPACE',
    categoryName: 'Космическое агентство',
    description: 'Частные запуски тяжелых ракет, космический туризм и добыча на астероидах.',
    level: 0,
    unlocked: false,
    unlockCost: 25000000,
    valuation: 120000000,
    monthlyRevenue: 5400000,
    monthlyExpenses: 2100000,
    employees: 850,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Rocket'
  }
];

export const INITIAL_DEALERSHIP_CARS: DealershipCar[] = [
  {
    id: 'car_bmw_m3',
    brand: 'BMW',
    model: 'M3 Competition (G80)',
    year: 2022,
    horsePower: 510,
    zeroToHundred: '3.5s',
    topSpeed: 290,
    boughtPrice: 38000,
    currentValue: 38000,
    repairCostTotal: 0,
    isOwned: false,
    conditions: {
      engine: 45,
      transmission: 60,
      suspension: 35,
      bodywork: 50,
      interior: 40
    },
    tunedStage: 0,
    detailLevel: 0
  },
  {
    id: 'car_audi_rs6',
    brand: 'Audi',
    model: 'RS6 Avant Quattro',
    year: 2021,
    horsePower: 600,
    zeroToHundred: '3.6s',
    topSpeed: 305,
    boughtPrice: 52000,
    currentValue: 52000,
    repairCostTotal: 0,
    isOwned: false,
    conditions: {
      engine: 35,
      transmission: 40,
      suspension: 55,
      bodywork: 45,
      interior: 60
    },
    tunedStage: 0,
    detailLevel: 0
  },
  {
    id: 'car_amg_c63',
    brand: 'Mercedes-AMG',
    model: 'C63 S V8 BiTurbo',
    year: 2020,
    horsePower: 503,
    zeroToHundred: '3.9s',
    topSpeed: 290,
    boughtPrice: 42000,
    currentValue: 42000,
    repairCostTotal: 0,
    isOwned: false,
    conditions: {
      engine: 50,
      transmission: 65,
      suspension: 40,
      bodywork: 60,
      interior: 50
    },
    tunedStage: 0,
    detailLevel: 0
  },
  {
    id: 'car_porsche_911',
    brand: 'Porsche',
    model: '911 Carrera S (992)',
    year: 2022,
    horsePower: 450,
    zeroToHundred: '3.5s',
    topSpeed: 308,
    boughtPrice: 65000,
    currentValue: 65000,
    repairCostTotal: 0,
    isOwned: false,
    conditions: {
      engine: 60,
      transmission: 55,
      suspension: 50,
      bodywork: 40,
      interior: 45
    },
    tunedStage: 0,
    detailLevel: 0
  },
  {
    id: 'car_nissan_gtr',
    brand: 'Nissan',
    model: 'GT-R Nismo (R35)',
    year: 2021,
    horsePower: 600,
    zeroToHundred: '2.8s',
    topSpeed: 330,
    boughtPrice: 78000,
    currentValue: 78000,
    repairCostTotal: 0,
    isOwned: false,
    conditions: {
      engine: 40,
      transmission: 50,
      suspension: 45,
      bodywork: 55,
      interior: 50
    },
    tunedStage: 0,
    detailLevel: 0
  },
  {
    id: 'car_ferrari_458',
    brand: 'Ferrari',
    model: '458 Italia',
    year: 2015,
    horsePower: 570,
    zeroToHundred: '3.4s',
    topSpeed: 325,
    boughtPrice: 115000,
    currentValue: 115000,
    repairCostTotal: 0,
    isOwned: false,
    conditions: {
      engine: 55,
      transmission: 45,
      suspension: 40,
      bodywork: 35,
      interior: 45
    },
    tunedStage: 0,
    detailLevel: 0
  },
  {
    id: 'car_huracan',
    brand: 'Lamborghini',
    model: 'Huracán EVO V10',
    year: 2022,
    horsePower: 640,
    zeroToHundred: '2.9s',
    topSpeed: 325,
    boughtPrice: 145000,
    currentValue: 145000,
    repairCostTotal: 0,
    isOwned: false,
    conditions: {
      engine: 60,
      transmission: 50,
      suspension: 50,
      bodywork: 40,
      interior: 60
    },
    tunedStage: 0,
    detailLevel: 0
  },
  {
    id: 'car_gt3rs',
    brand: 'Porsche',
    model: '911 GT3 RS Weissach',
    year: 2023,
    horsePower: 525,
    zeroToHundred: '3.2s',
    topSpeed: 296,
    boughtPrice: 220000,
    currentValue: 220000,
    repairCostTotal: 0,
    isOwned: false,
    conditions: {
      engine: 70,
      transmission: 60,
      suspension: 60,
      bodywork: 45,
      interior: 65
    },
    tunedStage: 0,
    detailLevel: 0
  }
];

export const INITIAL_FOOTBALL_CLUB: FootballClub = {
  name: 'FC Looxmaksing Royals',
  reputation: 68,
  stadiumCapacity: 35000,
  stadiumLevel: 1,
  tactic: '4-3-3 Attacking',
  division: 'Premier Elite Championship',
  leaguePoints: 18,
  matchesPlayed: 8,
  wins: 5,
  draws: 3,
  losses: 0,
  goalsFor: 19,
  goalsAgainst: 6,
  trophiesWon: 1,
  managerRating: 84,
  squad: [
    { id: 'f1', name: 'Kylian Mbappé', position: 'FWD', rating: 93, age: 26, value: 180000000, wage: 450000 },
    { id: 'f2', name: 'Erling Haaland', position: 'FWD', rating: 92, age: 25, value: 175000000, wage: 420000 },
    { id: 'f3', name: 'Vinícius Júnior', position: 'FWD', rating: 91, age: 25, value: 160000000, wage: 380000 },
    { id: 'm1', name: 'Jude Bellingham', position: 'MID', rating: 91, age: 22, value: 165000000, wage: 360000 },
    { id: 'm2', name: 'Kevin De Bruyne', position: 'MID', rating: 90, age: 34, value: 85000000, wage: 340000 },
    { id: 'm3', name: 'Rodri Cascante', position: 'MID', rating: 91, age: 29, value: 130000000, wage: 330000 },
    { id: 'd1', name: 'Virgil van Dijk', position: 'DEF', rating: 89, age: 34, value: 65000000, wage: 280000 },
    { id: 'd2', name: 'Rúben Dias', position: 'DEF', rating: 88, age: 28, value: 95000000, wage: 260000 },
    { id: 'd3', name: 'Alphonso Davies', position: 'DEF', rating: 86, age: 24, value: 75000000, wage: 210000 },
    { id: 'd4', name: 'Achraf Hakimi', position: 'DEF', rating: 86, age: 26, value: 70000000, wage: 200000 },
    { id: 'gk1', name: 'Thibaut Courtois', position: 'GK', rating: 90, age: 33, value: 55000000, wage: 240000 }
  ]
};

export const INITIAL_STOCKS: StockAsset[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Технологии', price: 232.50, prevPrice: 228.10, sharesOwned: 0, history: [215, 220, 224, 228, 232.5], dividendYield: 0.5 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'AI & Полупроводники', price: 141.20, prevPrice: 136.80, sharesOwned: 0, history: [120, 128, 133, 136.8, 141.2], dividendYield: 0.2 },
  { symbol: 'TSLA', name: 'Tesla Motors', sector: 'Электромобили & Роботы', price: 245.80, prevPrice: 240.00, sharesOwned: 0, history: [220, 230, 235, 240, 245.8], dividendYield: 0.0 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Облачные технологии', price: 430.10, prevPrice: 426.50, sharesOwned: 0, history: [410, 418, 422, 426.5, 430.1], dividendYield: 0.7 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Электронная коммерция', price: 188.40, prevPrice: 185.00, sharesOwned: 0, history: [175, 179, 182, 185, 188.4], dividendYield: 0.0 },
  { symbol: 'RACE', name: 'Ferrari N.V.', sector: 'Люксовые суперкары', price: 448.60, prevPrice: 440.20, sharesOwned: 0, history: [420, 428, 435, 440.2, 448.6], dividendYield: 0.6 },
  { symbol: 'MC', name: 'LVMH Moët Hennessy', sector: 'Люксовая империя', price: 685.00, prevPrice: 672.00, sharesOwned: 0, history: [650, 660, 668, 672, 685], dividendYield: 1.8 },
  { symbol: 'RKLB', name: 'Rocket Lab Aerospace', sector: 'Космос', price: 22.40, prevPrice: 20.80, sharesOwned: 0, history: [16, 18, 19.5, 20.8, 22.4], dividendYield: 0.0 }
];

export const INITIAL_CRYPTOS: CryptoAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 96400, prevPrice: 94200, amountOwned: 0, history: [88000, 91500, 93000, 94200, 96400], volatility: 0.06 },
  { symbol: 'ETH', name: 'Ethereum', price: 3450, prevPrice: 3380, amountOwned: 0, history: [3100, 3250, 3320, 3380, 3450], volatility: 0.08 },
  { symbol: 'SOL', name: 'Solana', price: 215, prevPrice: 202, amountOwned: 0, history: [180, 192, 198, 202, 215], volatility: 0.11 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.38, prevPrice: 0.35, amountOwned: 0, history: [0.28, 0.31, 0.33, 0.35, 0.38], volatility: 0.16 },
  { symbol: 'LOOX', name: 'LooxCoin (Mogger Token)', price: 4.85, prevPrice: 4.20, amountOwned: 0, history: [2.5, 3.1, 3.8, 4.2, 4.85], volatility: 0.22 }
];

export const INITIAL_REAL_ESTATE: RealEstateProperty[] = [
  {
    id: 'prop_dubai',
    name: 'Palm Jumeirah Signature Beachfront Villa',
    location: 'Palm Jumeirah, Frond N',
    city: 'Дубай, ОАЭ',
    price: 8500000,
    monthlyRentalYield: 52000,
    appreciationRate: 0.07,
    isOwned: false,
    imageTag: 'Villa',
    description: 'Частный пляж, вертолетная площадка, бассейн инфинити с видом на дубайский скайлайн.'
  },
  {
    id: 'prop_nyc',
    name: '432 Park Avenue Full-Floor Penthouse',
    location: 'Manhattan, Billionaires Row',
    city: 'Нью-Йорк, США',
    price: 18500000,
    monthlyRentalYield: 98000,
    appreciationRate: 0.05,
    isOwned: false,
    imageTag: 'Penthouse',
    description: 'Панорама Центрального парка на 360 градусов, потолки 4.5м, отделка каррарским мрамором.'
  },
  {
    id: 'prop_monaco',
    name: 'Tour Odéon Sky Duplex overlooking Port Hercule',
    location: 'Avenue Princesse Grace',
    city: 'Монте-Карло, Монако',
    price: 26000000,
    monthlyRentalYield: 135000,
    appreciationRate: 0.04,
    isOwned: false,
    imageTag: 'Sky Duplex',
    description: 'Вид на гавань суперяхт и трассу Формулы-1, доступ к спа-комплексу и консьерж-сервису 24/7.'
  },
  {
    id: 'prop_london',
    name: 'Mayfair Heritage Georgian Palace',
    location: 'Grosvenor Square, Mayfair',
    city: 'Лондон, Великобритания',
    price: 34000000,
    monthlyRentalYield: 180000,
    appreciationRate: 0.045,
    isOwned: false,
    imageTag: 'Mansion',
    description: 'Исторический особняк с бальным залом, винным погребом на 5,000 бутылок и подземным гаражом.'
  },
  {
    id: 'prop_alps',
    name: 'St. Moritz Suvretta Luxury Alpine Chalet',
    location: 'Suvretta Hill',
    city: 'Санкт-Мориц, Швейцария',
    price: 14500000,
    monthlyRentalYield: 82000,
    appreciationRate: 0.06,
    isOwned: false,
    imageTag: 'Chalet',
    description: 'Прямой выезд на лыжные трассы, частный кинотеатр, термальный спа и сосновый массив.'
  },
  {
    id: 'prop_tokyo',
    name: 'Roppongi Hills Sky Sanctuary',
    location: 'Minato City, Roppongi',
    city: 'Токио, Япония',
    price: 12000000,
    monthlyRentalYield: 65000,
    appreciationRate: 0.055,
    isOwned: false,
    imageTag: 'Sky Villa',
    description: 'Двухуровневый пентхаус с японским садом на крыше и видом на Токийскую башню и гору Фудзи.'
  }
];

export const INITIAL_LUXURY_ITEMS: LuxuryCollectionItem[] = [
  // Supercars
  {
    id: 'lux_car_gt3rs',
    type: 'CAR',
    name: 'Porsche 911 GT3 RS (992)',
    specs: '525 л.с. · Атмосферный 4.0L Boxer · 0-100: 3.2с',
    price: 360000,
    prestigePoints: 4200,
    monthlyUpkeep: 2500,
    isOwned: false,
    topSpeedOrFeature: '296 км/ч',
    tagline: 'Трековый шедевр из Штутгарта с активным аэрокрылом DRS.'
  },
  {
    id: 'lux_car_g63',
    type: 'CAR',
    name: 'Mercedes-AMG G63 Mansory Gronos',
    specs: '850 л.с. · V8 4.0L BiTurbo · Кованый карбон',
    price: 490000,
    prestigePoints: 5800,
    monthlyUpkeep: 3200,
    isOwned: false,
    topSpeedOrFeature: '250 км/ч',
    tagline: 'Абсолютный дорожный авторитет в эксклюзивном обвесе.'
  },
  {
    id: 'lux_car_sf90',
    type: 'CAR',
    name: 'Ferrari SF90 Stradale Assetto Fiorano',
    specs: '1,000 л.с. · V8 Hybrid AWD · 0-100: 2.5с',
    price: 680000,
    prestigePoints: 8500,
    monthlyUpkeep: 4200,
    isOwned: false,
    topSpeedOrFeature: '340 км/ч',
    tagline: 'Флагманский гибридный гиперкар из Маранелло.'
  },
  {
    id: 'lux_car_revuelto',
    type: 'CAR',
    name: 'Lamborghini Revuelto V12 HPEV',
    specs: '1,015 л.с. · 6.5L V12 + 3 Электромотора · 0-100: 2.5с',
    price: 720000,
    prestigePoints: 9200,
    monthlyUpkeep: 4500,
    isOwned: false,
    topSpeedOrFeature: '350 км/ч',
    tagline: 'Ревущий V12 новой эпохи Sant’Agata Bolognese.'
  },
  {
    id: 'lux_car_phantom',
    type: 'CAR',
    name: 'Rolls-Royce Phantom VIII Extended',
    specs: '571 л.с. · 6.75L V12 Twin-Turbo · Звездное небо',
    price: 620000,
    prestigePoints: 8900,
    monthlyUpkeep: 3800,
    isOwned: false,
    topSpeedOrFeature: 'Бесшумный полет',
    tagline: 'Вершина мирового представительского статуса и тишины.'
  },
  {
    id: 'lux_car_chiron',
    type: 'CAR',
    name: 'Bugatti Chiron Super Sport 300+',
    specs: '1,600 л.с. · 8.0L W16 Quad-Turbo · Кузов из карбона',
    price: 4200000,
    prestigePoints: 55000,
    monthlyUpkeep: 18000,
    isOwned: false,
    topSpeedOrFeature: '440 км/ч',
    tagline: 'Легендарный рекордсмен скорости и символ запредельного богатства.'
  },
  {
    id: 'lux_car_jesko',
    type: 'CAR',
    name: 'Koenigsegg Jesko Absolut',
    specs: '1,625 л.с. на E85 · 5.0L Twin-Turbo V8 · LST 9-ступка',
    price: 3800000,
    prestigePoints: 48000,
    monthlyUpkeep: 16000,
    isOwned: false,
    topSpeedOrFeature: '500+ км/ч',
    tagline: 'Шведская аэродинамическая ракета максимальной скорости.'
  },

  // Private Aviation
  {
    id: 'lux_jet_pilatus',
    type: 'JET',
    name: 'Pilatus PC-24 Super Versatile Jet',
    specs: 'Дальность 3,700 км · Вместимость 8 чел · Посадка на грунт',
    price: 11500000,
    prestigePoints: 32000,
    monthlyUpkeep: 35000,
    isOwned: false,
    topSpeedOrFeature: '815 км/ч',
    tagline: 'Швейцарский бизнес-джет с возможностью посадки на любые полосы.'
  },
  {
    id: 'lux_jet_g650',
    type: 'JET',
    name: 'Gulfstream G650ER Intercontinental',
    specs: 'Дальность 13,890 км · 4 жилые зоны · Спутниковый Ka-band',
    price: 68000000,
    prestigePoints: 125000,
    monthlyUpkeep: 95000,
    isOwned: false,
    topSpeedOrFeature: 'Mach 0.925',
    tagline: 'Беспосадочный полет из Лондона в Сингапур в абсолютной роскоши.'
  },
  {
    id: 'lux_jet_global7500',
    type: 'JET',
    name: 'Bombardier Global 7500 Master Suite',
    specs: 'Дальность 14,260 км · Полноценная кровать Master Suite · Душ',
    price: 76000000,
    prestigePoints: 140000,
    monthlyUpkeep: 110000,
    isOwned: false,
    topSpeedOrFeature: 'Mach 0.925',
    tagline: 'Крупнейший и самый роскошный ультрадальний флагман бизнес-авиации.'
  },

  // Yachts
  {
    id: 'lux_yacht_riva',
    type: 'YACHT',
    name: 'Riva 110 Dolcevita Flybridge',
    specs: 'Длина 33.5м · 5 кают · Корпус из красного дерева и карбона',
    price: 14800000,
    prestigePoints: 42000,
    monthlyUpkeep: 42000,
    isOwned: false,
    topSpeedOrFeature: '26 узлов',
    tagline: 'Итальянская икона стиля на Лазурном берегу.'
  },
  {
    id: 'lux_yacht_lurssen',
    type: 'YACHT',
    name: 'Lürssen 110m Megayacht Sovereign',
    specs: 'Длина 110м · Вертолетный ангар · Спа-салон · Бассейн 12м',
    price: 185000000,
    prestigePoints: 350000,
    monthlyUpkeep: 380000,
    isOwned: false,
    topSpeedOrFeature: 'Автономность 6,000 миль',
    tagline: 'Плавучий дворец, заставляющий замирать гавани Монако и Сен-Тропе.'
  },

  // Horology
  {
    id: 'lux_watch_daytona',
    type: 'WATCH',
    name: 'Rolex Cosmograph Daytona Platinum Ice Blue',
    specs: 'Платина 950 · Калибр 4131 · Керамический безель Cerachrom',
    price: 98000,
    prestigePoints: 1600,
    monthlyUpkeep: 200,
    isOwned: false,
    topSpeedOrFeature: 'Хронограф',
    tagline: 'Культовый ледяно-голубой циферблат платиновой Daytona.'
  },
  {
    id: 'lux_watch_nautilus',
    type: 'WATCH',
    name: 'Patek Philippe Nautilus 5711/1R Rose Gold',
    specs: 'Розовое золото 18K · Калибр 26-330 S C · Водозащита 120м',
    price: 175000,
    prestigePoints: 2900,
    monthlyUpkeep: 250,
    isOwned: false,
    topSpeedOrFeature: 'Ультратонкий корпус',
    tagline: 'Вершина часового аристократизма от женевской мануфактуры.'
  },
  {
    id: 'lux_watch_rm',
    type: 'WATCH',
    name: 'Richard Mille RM 11-03 Jean Todt Carbon TPT',
    specs: 'Синий карбон TPT · Flyback-хронограф · Скелетонизированный титан',
    price: 420000,
    prestigePoints: 6800,
    monthlyUpkeep: 500,
    isOwned: false,
    topSpeedOrFeature: 'Титановый сплит',
    tagline: 'Гоночная машина на запястье самых влиятельных людей мира.'
  }
];

export const INITIAL_PRIVATE_CLUB_PERKS: PrivateClubPerk[] = [
  {
    id: 'club_insider',
    title: 'Инсайдерский канал Уолл-стрит & Цюриха',
    description: 'Доступ к закрытым инсайдам: доходность акций и крипты возрастает на +25%, а риск падений снижается.',
    cost: 500000,
    isPurchased: false,
    passiveBonusType: 'INSIDER_TRADING',
    multiplier: 1.25
  },
  {
    id: 'club_tax',
    title: 'Офшорная оптимизация & Монакский траст',
    description: 'Налоговые юристы сокращают все корпоративные расходы ваших компаний на 20%.',
    cost: 1200000,
    isPurchased: false,
    passiveBonusType: 'TAX_CUT',
    multiplier: 0.80
  },
  {
    id: 'club_syndicate',
    title: 'Венчурный синдикат ультрабогатых',
    description: 'Синдикат направляет эксклюзивные сделки: выручка всех 6 категорий бизнеса увеличивается на +35%.',
    cost: 3000000,
    isPurchased: false,
    passiveBonusType: 'REVENUE_BOOST',
    multiplier: 1.35
  },
  {
    id: 'club_gala',
    title: 'Ежегодный закрытый бал в Монако & Престиж',
    description: 'Членство в мировом совете миллиардеров умножает рост престижа и Mogger-статуса в 2 раза!',
    cost: 7500000,
    isPurchased: false,
    passiveBonusType: 'PRESTIGE_MULTIPLIER',
    multiplier: 2.0
  }
];
