import {
  Business,
  DealershipCar,
  FootballClub,
  StockAsset,
  CryptoAsset,
  RealEstateProperty,
  LuxuryCollectionItem,
  PrivateClubPerk,
  TaxSystemState,
  CandleDataPoint,
  LooksmaxingState,
  BanyaState
} from '../types/game';
import { EXPANDED_50_CARS } from './expandedCars';
import { EXPANDED_300_REAL_ESTATE } from './expandedRealEstate';

function generateInitialCandles(basePrice: number, count = 24): CandleDataPoint[] {
  const points: CandleDataPoint[] = [];
  let current = basePrice * 0.85;

  for (let i = 0; i < count; i++) {
    const change = (Math.random() * 0.06 - 0.028);
    const open = current;
    const close = Number((open * (1 + change)).toFixed(2));
    const high = Number((Math.max(open, close) * (1 + Math.random() * 0.018)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.random() * 0.018)).toFixed(2));
    const volume = Math.round(15000 + Math.random() * 85000);
    const time = `${(i + 1).toString().padStart(2, '0')}:00`;

    points.push({ time, open, high, low, close, volume });
    current = close;
  }
  return points;
}

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz_dealership',
    name: 'Apex Motors — Автодилер & Реставрация',
    category: 'AUTOMOTIVE',
    categoryName: 'Автодилерский Центр',
    description: 'Покупка битых и подержанных спорткаров с аукционов, диагностика, ремонт и перепродажа с высокой маржой.',
    level: 0,
    unlocked: false,
    unlockCost: 40000,
    valuation: 95000,
    monthlyRevenue: 12500,
    monthlyExpenses: 4200,
    employees: 8,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Car',
    specialMetricName: 'Боксов в сервисе',
    specialMetricValue: '4 подъемника',
    subActions: [
      { id: 'act_auto_1', title: 'Гидравлические подъемники Hunter', desc: 'Ускоряет диагностику ходовой части на 50%', cost: 12000, revenueBonus: 2800, isUnlocked: false, type: 'EQUIPMENT' },
      { id: 'act_auto_2', title: 'Покрасочная камера Nova Verta', desc: 'Заводское качество покраски кузова, +20% к продажной цене авто', cost: 24000, revenueBonus: 5400, isUnlocked: false, type: 'WORKSHOP' },
      { id: 'act_auto_3', title: 'Чип-тюнинг стенд Dyno Dynamics', desc: 'Стейдж 1 и 2 прошивки для форсирования двигателей', cost: 45000, revenueBonus: 9800, isUnlocked: false, type: 'TUNING' },
      { id: 'act_auto_4', title: 'Эксклюзивный VIP-шоурум в Дубае', desc: 'Выход на шейхов и коллекционеров редких суперкаров', cost: 120000, revenueBonus: 28000, isUnlocked: false, type: 'SHOWROOM' }
    ]
  },
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
    monthlyRevenue: 8200,
    monthlyExpenses: 3400,
    employees: 14,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'ShoppingBag',
    specialMetricName: 'Торговая площадь',
    specialMetricValue: '850 м²',
    subActions: [
      { id: 'act_ret_1', title: 'Линия Haute Couture Осень-Зима', desc: 'Запуск эксклюзивной коллекции из кашемира и шелка', cost: 15000, revenueBonus: 3500, isUnlocked: false, type: 'COLLECTION' },
      { id: 'act_ret_2', title: 'Ювелирный отдел редких бриллиантов', desc: 'Прямые поставки ограненных камней из Антверпена', cost: 45000, revenueBonus: 9500, isUnlocked: false, type: 'JEWELRY' },
      { id: 'act_ret_3', title: 'Флагманский бутик на Via Montenapoleone', desc: 'Премиальное присутствие в сердце мировой моды', cost: 110000, revenueBonus: 24000, isUnlocked: false, type: 'EXPANSION' }
    ]
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
    monthlyRevenue: 34000,
    monthlyExpenses: 15000,
    employees: 52,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Utensils',
    specialMetricName: 'Звезд Michelin',
    specialMetricValue: '3 Звезды ★★★',
    subActions: [
      { id: 'act_hosp_1', title: 'Приглашение Шеф-повара из Лиона', desc: 'Авторское дегустационное меню с трюфелями и фуа-гра', cost: 35000, revenueBonus: 7800, isUnlocked: false, type: 'CHEF' },
      { id: 'act_hosp_2', title: 'Винный погреб с коллекционными винтажами', desc: 'Романе-Конти и Шато Петрюс 1982 года в винной карте', cost: 75000, revenueBonus: 16000, isUnlocked: false, type: 'WINE' },
      { id: 'act_hosp_3', title: 'Частный инфинити-пляж в Сен-Тропе', desc: 'Закрытый клуб для гостей президентских люксов', cost: 220000, revenueBonus: 48000, isUnlocked: false, type: 'BEACH' }
    ]
  },
  {
    id: 'biz_banking',
    name: 'Zurich Private Merchant Bank & Quants',
    category: 'BANKING',
    categoryName: 'Банкинг & Хедж-фонды',
    description: 'Швейцарский приватный банк и квантовый хедж-фонд для ультрабогатых клиентов.',
    level: 0,
    unlocked: false,
    unlockCost: 750000,
    valuation: 2800000,
    monthlyRevenue: 155000,
    monthlyExpenses: 58000,
    employees: 92,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Building2',
    specialMetricName: 'Активы под управлением (AUM)',
    specialMetricValue: '$1.4 Миллиарда',
    subActions: [
      { id: 'act_bank_1', title: 'Квантовый торговый алгоритм Chronos', desc: 'Высокочастотный арбитраж на мировых биржах', cost: 140000, revenueBonus: 32000, isUnlocked: false, type: 'QUANT' },
      { id: 'act_bank_2', title: 'Синдицированное кредитование олигархов', desc: 'Выдача кредитов под залог суперяхт и пентхаусов', cost: 380000, revenueBonus: 75000, isUnlocked: false, type: 'LOAN' },
      { id: 'act_bank_3', title: 'Офшорный Prime Brokerage в Женеве', desc: 'Обслуживание закрытых суверенных фондов', cost: 950000, revenueBonus: 190000, isUnlocked: false, type: 'PRIME' }
    ]
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
    monthlyRevenue: 520000,
    monthlyExpenses: 210000,
    employees: 340,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Hammer',
    specialMetricName: 'Текущих проектов',
    specialMetricValue: '12 небоскребов',
    subActions: [
      { id: 'act_const_1', title: 'Парк тяжелых башенных кранов Liebherr', desc: 'Снижает сроки возведения монолитных каркасов на 30%', cost: 420000, revenueBonus: 95000, isUnlocked: false, type: 'CRANES' },
      { id: 'act_const_2', title: 'Тендер на 80-этажный небоскреб в Дубае', desc: 'Генеральный подряд на проект стоимостью $450M', cost: 1100000, revenueBonus: 220000, isUnlocked: false, type: 'TENDER' },
      { id: 'act_const_3', title: 'Искусственный насыпной остров в Катаре', desc: 'Строительство закрытой марины для суперяхт', cost: 2800000, revenueBonus: 580000, isUnlocked: false, type: 'ISLAND' }
    ]
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
    monthlyRevenue: 1850000,
    monthlyExpenses: 680000,
    employees: 480,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Cpu',
    specialMetricName: 'Вычислительный кластер',
    specialMetricValue: '64,000x Nvidia B200',
    subActions: [
      { id: 'act_tech_1', title: 'Суперкластер Nvidia Blackwell GPU', desc: 'Обучение новейшей мультимодальной нейросети Synapse-4', cost: 1400000, revenueBonus: 310000, isUnlocked: false, type: 'GPU' },
      { id: 'act_tech_2', title: 'Корпоративный контракт с Пентагоном и NASA', desc: 'Автономный анализ спутниковых данных в реальном времени', cost: 3200000, revenueBonus: 690000, isUnlocked: false, type: 'DEFENSE' },
      { id: 'act_tech_3', title: 'Квантовый криптопроцессор Q-Shield', desc: 'Абсолютная невзламываемая квантовая шифрация', cost: 7500000, revenueBonus: 1550000, isUnlocked: false, type: 'QUANTUM' }
    ]
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
    monthlyRevenue: 5800000,
    monthlyExpenses: 2250000,
    employees: 890,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Rocket',
    specialMetricName: 'Успешных орбитальных миссий',
    specialMetricValue: '28 запусков',
    subActions: [
      { id: 'act_aero_1', title: 'Метановые двигатели многоразового пуска', desc: 'Снижает себестоимость вывода полезной нагрузки в 4 раза', cost: 4500000, revenueBonus: 980000, isUnlocked: false, type: 'ENGINE' },
      { id: 'act_aero_2', title: 'Коммерческий орбитальный отель Aether-1', desc: 'Туристические билеты на 7 дней на орбите по $55M каждый', cost: 12000000, revenueBonus: 2600000, isUnlocked: false, type: 'HOTEL' },
      { id: 'act_aero_3', title: 'Миссия к астероиду Психея 16 (Добыча платины)', desc: 'Дроны для бурения редкоземельных металлов в космосе', cost: 28000000, revenueBonus: 6200000, isUnlocked: false, type: 'MINING' }
    ]
  },
  {
    id: 'biz_energy',
    name: 'Titan Global Energy & Offshore Oil Megacorp',
    category: 'ENERGY',
    categoryName: 'Нефтегазовый холдинг & Зеленая энергия',
    description: 'Глубоководные буровые платформы в Северном море, СПГ-флот и солнечные мегапарки.',
    level: 0,
    unlocked: false,
    unlockCost: 55000000,
    valuation: 280000000,
    monthlyRevenue: 12500000,
    monthlyExpenses: 4600000,
    employees: 1450,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Flame',
    specialMetricName: 'Добыча в сутки',
    specialMetricValue: '450,000 баррелей/день',
    subActions: [
      { id: 'act_energy_1', title: 'Шельфовая платформа Titan Deepwater Alpha', desc: 'Автоматизированная добыча нефти на глубине 3,000 метров', cost: 9500000, revenueBonus: 2100000, isUnlocked: false, type: 'DRILLING' },
      { id: 'act_energy_2', title: 'Флот криогенных СПГ-танкеров Q-Max', desc: 'Поставки сжиженного газа в Азию и Европу по долгосрочным контрактам', cost: 22000000, revenueBonus: 4800000, isUnlocked: false, type: 'LNG' },
      { id: 'act_energy_3', title: 'Гигаваттный водородный хаб в Дубае', desc: 'Зеленый водород и солнечные фермы мощностью 5 ГВт', cost: 48000000, revenueBonus: 10500000, isUnlocked: false, type: 'HYDROGEN' }
    ]
  },
  {
    id: 'biz_media',
    name: 'Paramount Syndicate Media & Cinema Empire',
    category: 'MEDIA',
    categoryName: 'Медиахолдинг & Киностудия',
    description: 'Голливудская киностудия, глобальная сеть IMAX, стриминг Syndicate+ и музыкальные лейблы.',
    level: 0,
    unlocked: false,
    unlockCost: 95000000,
    valuation: 420000000,
    monthlyRevenue: 19500000,
    monthlyExpenses: 7200000,
    employees: 1800,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Film',
    specialMetricName: 'Подписчиков стриминга',
    specialMetricValue: '185M активных юзеров',
    subActions: [
      { id: 'act_media_1', title: 'Франшиза блокбастера с бюджетом $300M', desc: 'Мировой кинопрокат в 4,500 кинотеатрах с рекордным сбором', cost: 18000000, revenueBonus: 4100000, isUnlocked: false, type: 'CINEMA' },
      { id: 'act_media_2', title: 'Эксклюзивные права на Лигу Чемпионов и F1', desc: 'Прямые трансляции главных спортивных событий планеты', cost: 38000000, revenueBonus: 8500000, isUnlocked: false, type: 'SPORTS' },
      { id: 'act_media_3', title: 'Виртуальная метаверс-киностудия HoloCinema', desc: 'Иммерсивные фильмы с ИИ-персонажами в реальном времени', cost: 80000000, revenueBonus: 17500000, isUnlocked: false, type: 'METAVERSE' }
    ]
  },
  {
    id: 'biz_biotech',
    name: 'Genomix BioTech & Longevity Therapeutics',
    category: 'BIOTECH',
    categoryName: 'Биотех & Продление жизни',
    description: 'Институт генетической инженерии, омоложение теломер, биочипы и элитные криоцентры в Альпах.',
    level: 0,
    unlocked: false,
    unlockCost: 180000000,
    valuation: 850000000,
    monthlyRevenue: 38000000,
    monthlyExpenses: 13500000,
    employees: 2200,
    marketingLevel: 1,
    techLevel: 1,
    hrLevel: 1,
    iconName: 'Dna',
    specialMetricName: 'Патентов на омоложение',
    specialMetricValue: '412 глобальных патентов',
    subActions: [
      { id: 'act_bio_1', title: 'CRISPR генная терапия регенерации органов', desc: 'Клинические испытания препарата клеточного омоложения', cost: 32000000, revenueBonus: 7200000, isUnlocked: false, type: 'GENE' },
      { id: 'act_bio_2', title: 'Частный криогенный комплекс в Санкт-Морице', desc: 'Премиальное сохранение биоматериалов для миллиардеров списка Forbes', cost: 65000000, revenueBonus: 14500000, isUnlocked: false, type: 'CRYO' },
      { id: 'act_bio_3', title: 'Нейроинтерфейс Synapse BioLink', desc: 'Слияние человеческого мозга с квантовым искусственным интеллектом', cost: 140000000, revenueBonus: 32000000, isUnlocked: false, type: 'NEURAL' }
    ]
  }
];

export const INITIAL_DEALERSHIP_CARS: DealershipCar[] = EXPANDED_50_CARS;

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
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Технологии', price: 232.50, prevPrice: 228.10, sharesOwned: 0, history: [215, 220, 224, 228, 232.5], candles: generateInitialCandles(232.5), dividendYield: 0.5, marketCap: '$3.55T', high52w: 237.2, low52w: 164.0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'AI & Полупроводники', price: 141.20, prevPrice: 136.80, sharesOwned: 0, history: [120, 128, 133, 136.8, 141.2], candles: generateInitialCandles(141.2), dividendYield: 0.2, marketCap: '$3.46T', high52w: 149.7, low52w: 45.4 },
  { symbol: 'TSLA', name: 'Tesla Motors', sector: 'Электромобили & Роботы', price: 245.80, prevPrice: 240.00, sharesOwned: 0, history: [220, 230, 235, 240, 245.8], candles: generateInitialCandles(245.8), dividendYield: 0.0, marketCap: '$785B', high52w: 271.0, low52w: 138.8 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Облачные технологии', price: 430.10, prevPrice: 426.50, sharesOwned: 0, history: [410, 418, 422, 426.5, 430.1], candles: generateInitialCandles(430.1), dividendYield: 0.7, marketCap: '$3.19T', high52w: 468.3, low52w: 326.9 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Электронная коммерция', price: 188.40, prevPrice: 185.00, sharesOwned: 0, history: [175, 179, 182, 185, 188.4], candles: generateInitialCandles(188.4), dividendYield: 0.0, marketCap: '$1.97T', high52w: 201.2, low52w: 118.3 },
  { symbol: 'RACE', name: 'Ferrari N.V.', sector: 'Люксовые суперкары', price: 448.60, prevPrice: 440.20, sharesOwned: 0, history: [420, 428, 435, 440.2, 448.6], candles: generateInitialCandles(448.6), dividendYield: 0.6, marketCap: '$81.4B', high52w: 472.0, low52w: 295.4 },
  { symbol: 'MC', name: 'LVMH Moët Hennessy', sector: 'Люксовая империя', price: 685.00, prevPrice: 672.00, sharesOwned: 0, history: [650, 660, 668, 672, 685], candles: generateInitialCandles(685.0), dividendYield: 1.8, marketCap: '$342B', high52w: 886.0, low52w: 590.2 },
  { symbol: 'RKLB', name: 'Rocket Lab Aerospace', sector: 'Космос', price: 22.40, prevPrice: 20.80, sharesOwned: 0, history: [16, 18, 19.5, 20.8, 22.4], candles: generateInitialCandles(22.4), dividendYield: 0.0, marketCap: '$11.2B', high52w: 24.8, low52w: 3.5 }
];

export const INITIAL_CRYPTOS: CryptoAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 96400, prevPrice: 94200, amountOwned: 0, history: [88000, 91500, 93000, 94200, 96400], candles: generateInitialCandles(96400), volatility: 0.06, marketCap: '$1.91T', high24h: 98200, low24h: 93800 },
  { symbol: 'ETH', name: 'Ethereum', price: 3450, prevPrice: 3380, amountOwned: 0, history: [3100, 3250, 3320, 3380, 3450], candles: generateInitialCandles(3450), volatility: 0.08, marketCap: '$415B', high24h: 3520, low24h: 3320 },
  { symbol: 'SOL', name: 'Solana', price: 215, prevPrice: 202, amountOwned: 0, history: [180, 192, 198, 202, 215], candles: generateInitialCandles(215), volatility: 0.11, marketCap: '$102B', high24h: 224, low24h: 198 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.38, prevPrice: 0.35, amountOwned: 0, history: [0.28, 0.31, 0.33, 0.35, 0.38], candles: generateInitialCandles(0.38), volatility: 0.16, marketCap: '$55B', high24h: 0.42, low24h: 0.33 },
  { symbol: 'LOOX', name: 'LooxCoin (Mogger Token)', price: 4.85, prevPrice: 4.20, amountOwned: 0, history: [2.5, 3.1, 3.8, 4.2, 4.85], candles: generateInitialCandles(4.85), volatility: 0.22, marketCap: '$485M', high24h: 5.60, low24h: 3.90 }
];

export const INITIAL_REAL_ESTATE: RealEstateProperty[] = EXPANDED_300_REAL_ESTATE;

export const INITIAL_LUXURY_ITEMS: LuxuryCollectionItem[] = [
  // Supercars & Hypercars
  { id: 'lux_car_gt3rs', type: 'CAR', name: 'Porsche 911 GT3 RS Weissach (992)', specs: '525 л.с. · Атмосферный 4.0L Boxer · 0-100: 3.2с', price: 360000, prestigePoints: 4200, monthlyUpkeep: 2500, isOwned: false, topSpeedOrFeature: '296 км/ч', tagline: 'Трековый шедевр из Штутгарта с активным антикрылом DRS.' },
  { id: 'lux_car_g63', type: 'CAR', name: 'Mercedes-AMG G63 Mansory Gronos', specs: '850 л.с. · V8 4.0L BiTurbo · Кованый карбон', price: 490000, prestigePoints: 5800, monthlyUpkeep: 3200, isOwned: false, topSpeedOrFeature: '250 км/ч', tagline: 'Абсолютный дорожный авторитет в эксклюзивном обвесе.' },
  { id: 'lux_car_sf90', type: 'CAR', name: 'Ferrari SF90 Stradale Assetto Fiorano', specs: '1,000 л.с. · V8 Hybrid AWD · 0-100: 2.5с', price: 680000, prestigePoints: 8500, monthlyUpkeep: 4200, isOwned: false, topSpeedOrFeature: '340 км/ч', tagline: 'Флагманский гибридный гиперкар из Маранелло.' },
  { id: 'lux_car_revuelto', type: 'CAR', name: 'Lamborghini Revuelto V12 HPEV', specs: '1,015 л.с. · 6.5L V12 + 3 Электромотора · 0-100: 2.5с', price: 720000, prestigePoints: 9200, monthlyUpkeep: 4500, isOwned: false, topSpeedOrFeature: '350 км/ч', tagline: 'Ревущий V12 новой эпохи Sant’Agata Bolognese.' },
  { id: 'lux_car_phantom', type: 'CAR', name: 'Rolls-Royce Phantom VIII Extended', specs: '571 л.с. · 6.75L V12 Twin-Turbo · Звездное небо', price: 620000, prestigePoints: 8900, monthlyUpkeep: 3800, isOwned: false, topSpeedOrFeature: 'Бесшумный полет', tagline: 'Вершина мирового представительского статуса и тишины.' },
  { id: 'lux_car_chiron', type: 'CAR', name: 'Bugatti Chiron Super Sport 300+', specs: '1,600 л.с. · 8.0L W16 Quad-Turbo · Кузов из карбона', price: 4200000, prestigePoints: 55000, monthlyUpkeep: 18000, isOwned: false, topSpeedOrFeature: '490 км/ч', tagline: 'Легендарный рекордсмен скорости и символ запредельного богатства.' },
  { id: 'lux_car_jesko', type: 'CAR', name: 'Koenigsegg Jesko Absolut 500+ Edition', specs: '1,625 л.с. на E85 · 5.0L Twin-Turbo V8 · LST 9-ступка', price: 3800000, prestigePoints: 48000, monthlyUpkeep: 16000, isOwned: false, topSpeedOrFeature: '531 км/ч', tagline: 'Шведская аэродинамическая ракета максимальной скорости.' },
  { id: 'lux_car_tourbillon', type: 'CAR', name: 'Bugatti Tourbillon V16 Hybrid', specs: '1,800 л.с. · Cosworth V16 Атмосферник · Титановые часы в руле', price: 4600000, prestigePoints: 62000, monthlyUpkeep: 22000, isOwned: false, topSpeedOrFeature: '445 км/ч', tagline: 'Новейший шедевр часового и автомобильного искусства.' },

  // Private Aviation
  { id: 'lux_jet_pilatus', type: 'JET', name: 'Pilatus PC-24 Super Versatile Jet', specs: 'Дальность 3,700 км · Вместимость 8 чел · Посадка на грунт', price: 11500000, prestigePoints: 32000, monthlyUpkeep: 35000, isOwned: false, topSpeedOrFeature: '815 км/ч', tagline: 'Швейцарский бизнес-джет с возможностью посадки на любые полосы.' },
  { id: 'lux_jet_g650', type: 'JET', name: 'Gulfstream G650ER Intercontinental', specs: 'Дальность 13,890 км · 4 жилые зоны · Спутниковый Ka-band', price: 68000000, prestigePoints: 125000, monthlyUpkeep: 95000, isOwned: false, topSpeedOrFeature: 'Mach 0.925', tagline: 'Беспосадочный полет из Лондона в Сингапур в абсолютной роскоши.' },
  { id: 'lux_jet_global7500', type: 'JET', name: 'Bombardier Global 7500 Master Suite', specs: 'Дальность 14,260 км · Полноценная кровать Master Suite · Душ', price: 76000000, prestigePoints: 140000, monthlyUpkeep: 110000, isOwned: false, topSpeedOrFeature: 'Mach 0.925', tagline: 'Крупнейший и самый роскошный ультрадальний флагман бизнес-авиации.' },

  // Yachts
  { id: 'lux_yacht_riva', type: 'YACHT', name: 'Riva 110 Dolcevita Flybridge', specs: 'Длина 33.5м · 5 кают · Корпус из красного дерева и карбона', price: 14800000, prestigePoints: 42000, monthlyUpkeep: 42000, isOwned: false, topSpeedOrFeature: '26 узлов', tagline: 'Итальянская икона стиля на Лазурном берегу.' },
  { id: 'lux_yacht_lurssen', type: 'YACHT', name: 'Lürssen 110m Megayacht Sovereign', specs: 'Длина 110м · Вертолетный ангар · Спа-салон · Бассейн 12м', price: 185000000, prestigePoints: 350000, monthlyUpkeep: 380000, isOwned: false, topSpeedOrFeature: 'Автономность 6,000 миль', tagline: 'Плавучий дворец, заставляющий замирать гавани Монако и Сен-Тропе.' },

  // Horology
  { id: 'lux_watch_daytona', type: 'WATCH', name: 'Rolex Cosmograph Daytona Platinum Ice Blue', specs: 'Платина 950 · Калибр 4131 · Керамический безель Cerachrom', price: 98000, prestigePoints: 1600, monthlyUpkeep: 200, isOwned: false, topSpeedOrFeature: 'Хронограф', tagline: 'Культовый ледяно-голубой циферблат платиновой Daytona.' },
  { id: 'lux_watch_nautilus', type: 'WATCH', name: 'Patek Philippe Nautilus 5711/1R Rose Gold', specs: 'Розовое золото 18K · Калибр 26-330 S C · Водозащита 120м', price: 175000, prestigePoints: 2900, monthlyUpkeep: 250, isOwned: false, topSpeedOrFeature: 'Ультратонкий корпус', tagline: 'Вершина часового аристократизма от женевской мануфактуры.' },
  { id: 'lux_watch_rm', type: 'WATCH', name: 'Richard Mille RM 11-03 Jean Todt Carbon TPT', specs: 'Синий карбон TPT · Flyback-хронограф · Скелетонизированный титан', price: 420000, prestigePoints: 6800, monthlyUpkeep: 500, isOwned: false, topSpeedOrFeature: 'Титановый сплит', tagline: 'Гоночная машина на запястье самых влиятельных людей мира.' }
];

export const INITIAL_PRIVATE_CLUB_PERKS: PrivateClubPerk[] = [
  { id: 'club_insider', title: 'Инсайдерский канал Уолл-стрит & Цюриха', description: 'Доступ к закрытым инсайдам: доходность акций и крипты возрастает на +25%, а риск падений снижается.', cost: 500000, isPurchased: false, passiveBonusType: 'INSIDER_TRADING', multiplier: 1.25 },
  { id: 'club_tax', title: 'Офшорная оптимизация & Монакский траст', description: 'Налоговые юристы сокращают все корпоративные расходы ваших компаний на 20%.', cost: 1200000, isPurchased: false, passiveBonusType: 'TAX_CUT', multiplier: 0.80 },
  { id: 'club_syndicate', title: 'Венчурный синдикат ультрабогатых', description: 'Синдикат направляет эксклюзивные сделки: выручка всех 7 категорий бизнеса увеличивается на +35%.', cost: 3000000, isPurchased: false, passiveBonusType: 'REVENUE_BOOST', multiplier: 1.35 },
  { id: 'club_gala', title: 'Ежегодный закрытый бал в Монако & Престиж', description: 'Членство в мировом совете миллиардеров умножает рост престижа и Mogger-статуса в 2 раза!', cost: 7500000, isPurchased: false, passiveBonusType: 'PRESTIGE_MULTIPLIER', multiplier: 2.0 }
];

export const INITIAL_TAX_SYSTEM: TaxSystemState = {
  corporateTaxRate: 0.20,
  wealthTaxRate: 0.015,
  effectiveTaxRate: 0.20,
  accumulatedTaxDue: 0,
  totalTaxPaid: 0,
  totalTaxSaved: 0,
  offshoreAccountantsHired: false,
  monacoTrustRegistered: false,
  swissZugHoldingSetup: false,
  auditRiskPercent: 5,
  underAudit: false,
  autoPayTaxes: false
};

export const INITIAL_LOOKSMAXING: LooksmaxingState = {
  overallScore: 24,
  tier: 'Нормис 🧢',
  jawline: 25,
  hunterEyes: 20,
  skinGlow: 30,
  physique: 22,
  hairStyle: 25,
  mewingStreakDays: 3,
  isMewingActive: false,
  banyaVisitsCount: 1,
  auraPowerBonus: 5,
  revenueMultiplier: 1.05,
  upgrades: [
    // JAWLINE
    {
      id: 'lm_jaw_mastic',
      category: 'JAWLINE',
      name: 'Mastic Gum Hard (Жевательный тренажер)',
      description: 'Греческая мастика повышенной жесткости. Прокачивает жевательные мышцы и четкость линии челюсти.',
      cost: 150,
      scoreBonus: 6,
      categoryBoost: '+14 Челюсть',
      isUnlocked: false,
      icon: 'Square'
    },
    {
      id: 'lm_jaw_guasha',
      category: 'JAWLINE',
      name: 'Скребок Гуаша из нефрита',
      description: 'Утренний лимфодренажный массаж скул. Убирает отечность лица и подчеркивает угол челюсти.',
      cost: 450,
      scoreBonus: 8,
      categoryBoost: '+16 Челюсть',
      isUnlocked: false,
      icon: 'Sparkles'
    },
    {
      id: 'lm_jaw_ortho',
      category: 'JAWLINE',
      name: 'Курс Ортотропии & Мьюинг-коучинг',
      description: 'Профессиональная коррекция осанки языка и положения нижней челюсти. Формирует hollow cheeks.',
      cost: 2500,
      scoreBonus: 12,
      categoryBoost: '+22 Челюсть',
      isUnlocked: false,
      icon: 'Shield'
    },
    {
      id: 'lm_jaw_implant',
      category: 'JAWLINE',
      name: 'Кастомные титановые импланты углов челюсти',
      description: 'Хирургическая точность в Швейцарии. Идеальный гониальный угол 110 градусов как у топ-моделей.',
      cost: 18000,
      scoreBonus: 20,
      categoryBoost: '+35 Челюсть',
      isUnlocked: false,
      icon: 'Crown'
    },

    // EYES
    {
      id: 'lm_eye_cold',
      category: 'EYES',
      name: 'Крио-массаж & Кофеиновые патчи',
      description: 'Устраняет темные круги под глазами и припухлость после тяжелых бизнес-переговоров.',
      cost: 220,
      scoreBonus: 6,
      categoryBoost: '+12 Взгляд',
      isUnlocked: false,
      icon: 'Eye'
    },
    {
      id: 'lm_eye_squinch',
      category: 'EYES',
      name: 'Техника Squinching & Тренировки взгляда',
      description: 'Развитие круговой мышцы глаза. Фирменный пронзительный Hunter Eyes взгляд хищника.',
      cost: 850,
      scoreBonus: 10,
      categoryBoost: '+20 Взгляд',
      isUnlocked: false,
      icon: 'Target'
    },
    {
      id: 'lm_eye_cantho',
      category: 'EYES',
      name: 'Кантопластика (Положительный Canthal Tilt)',
      description: 'Подтяжка внешних уголков глаз. Миндалевидная форма глаз топ-моделей и миллиардеров.',
      cost: 12500,
      scoreBonus: 18,
      categoryBoost: '+32 Взгляд',
      isUnlocked: false,
      icon: 'Flame'
    },

    // SKIN
    {
      id: 'lm_skin_serum',
      category: 'SKIN',
      name: 'Сыворотка с чистым ретинолом & Пептидами',
      description: 'Золотой стандарт дерматологии. Разглаживает текстуру кожи и придаёт сияние Glass Skin.',
      cost: 650,
      scoreBonus: 8,
      categoryBoost: '+15 Кожа',
      isUnlocked: false,
      icon: 'Droplet'
    },
    {
      id: 'lm_skin_laser',
      category: 'SKIN',
      name: 'Фракционная лазерная шлифовка Fraxel',
      description: 'Полное обновление верхнего слоя дермы. Абсолютно чистая, ровная кожа без единого изъяна.',
      cost: 3800,
      scoreBonus: 14,
      categoryBoost: '+26 Кожа',
      isUnlocked: false,
      icon: 'Zap'
    },
    {
      id: 'lm_skin_exosomes',
      category: 'SKIN',
      name: 'VIP Терапия биоактивными экзосомами',
      description: 'Передовая биотехнология омоложения клеток. Сияние кожи и тотальная защита от старения.',
      cost: 8500,
      scoreBonus: 18,
      categoryBoost: '+30 Кожа',
      isUnlocked: false,
      icon: 'Gem'
    },

    // PHYSIQUE
    {
      id: 'lm_phys_gym',
      category: 'PHYSIQUE',
      name: 'Gold Gym Elite + Тренер по V-Taper',
      description: 'Фокус на среднюю дельту, широчайшие и верх груди. Классический силуэт перевернутого треугольника.',
      cost: 2400,
      scoreBonus: 10,
      categoryBoost: '+18 Торс',
      isUnlocked: false,
      icon: 'Activity'
    },
    {
      id: 'lm_phys_cut',
      category: 'PHYSIQUE',
      name: 'Спортивная диета и сушка до 9% подкожного жира',
      description: 'Полосатые дельты, рельефный пресс и венозность предплечий.',
      cost: 1900,
      scoreBonus: 12,
      categoryBoost: '+22 Венозность',
      isUnlocked: false,
      icon: 'Flame'
    },
    {
      id: 'lm_phys_anatomy',
      category: 'PHYSIQUE',
      name: 'Анатомическая лепка и скульптурирование тела',
      description: 'Спортивный рельеф греческого бога. Впечатляет партнеров на деловых встречах и закрытых пляжах.',
      cost: 7200,
      scoreBonus: 16,
      categoryBoost: '+32 Телосложение',
      isUnlocked: false,
      icon: 'Award'
    },

    // HAIR
    {
      id: 'lm_hair_fade',
      category: 'HAIR',
      name: 'Еженедельный Taper Fade в Royal Barbershop',
      description: 'Дымчатый переход с филигранной четкостью линий висков и бороды.',
      cost: 350,
      scoreBonus: 8,
      categoryBoost: '+16 Прическа',
      isUnlocked: false,
      icon: 'Scissors'
    },
    {
      id: 'lm_hair_istanbul',
      category: 'HAIR',
      name: 'VIP Пересадка волос Сапфир FUE в Стамбуле',
      description: '5,000 графтов максимальной плотности. Безупречная линия роста волос до конца жизни.',
      cost: 11000,
      scoreBonus: 18,
      categoryBoost: '+34 Густота волос',
      isUnlocked: false,
      icon: 'Crown'
    },

    // STYLE
    {
      id: 'lm_style_scent',
      category: 'STYLE',
      name: 'Аромат Creed Aventus 1760 & Tom Ford',
      description: 'Шлейф натурального ананаса, березы и мускуса. Оставляет неизгладимый след в переговорах.',
      cost: 850,
      scoreBonus: 8,
      categoryBoost: '+16 Аура',
      isUnlocked: false,
      icon: 'Wind'
    },
    {
      id: 'lm_style_loropiana',
      category: 'STYLE',
      name: 'Индивидуальный пошив Loro Piana & Savile Row',
      description: 'Кашемир высшей пробы, викунья и шелк. Непревзойденный статус тихой роскоши.',
      cost: 24000,
      scoreBonus: 20,
      categoryBoost: '+38 Престиж',
      isUnlocked: false,
      icon: 'Briefcase'
    }
  ]
};

export const INITIAL_BANYA: BanyaState = {
  temperatureC: 85,
  steamHumidity: 55,
  stoneHeat: 90,
  activeVenik: 'Берёзовый веник',
  venikCondition: 92,
  plungePoolTempC: 5,
  samovarTeaServings: 6,
  banshikHired: false,
  steamMasteryLevel: 1,
  currentRelaxation: 70,
  buffDurationSeconds: 180
};

