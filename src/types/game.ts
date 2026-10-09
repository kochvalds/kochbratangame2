export type BusinessCategory = 
  | 'AUTOMOTIVE'
  | 'RETAIL' 
  | 'HOSPITALITY' 
  | 'BANKING' 
  | 'CONSTRUCTION' 
  | 'TECH' 
  | 'AEROSPACE';

export interface BusinessSubAction {
  id: string;
  title: string;
  desc: string;
  cost: number;
  revenueBonus: number;
  isUnlocked: boolean;
  type: string;
}

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  categoryName: string;
  description: string;
  level: number;
  unlocked: boolean;
  unlockCost: number;
  valuation: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  employees: number;
  marketingLevel: number;
  techLevel: number;
  hrLevel: number;
  iconName: string;
  specialMetricName: string;
  specialMetricValue: string;
  subActions: BusinessSubAction[];
}

export type CarConditionCategory = 'engine' | 'transmission' | 'suspension' | 'bodywork' | 'interior';

export interface DealershipCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  horsePower: number;
  zeroToHundred: string;
  topSpeed: number;
  boughtPrice: number;
  currentValue: number;
  repairCostTotal: number;
  isOwned: boolean;
  isSold?: boolean;
  conditions: {
    engine: number;        // 0-100%
    transmission: number;  // 0-100%
    suspension: number;    // 0-100%
    bodywork: number;      // 0-100%
    interior: number;      // 0-100%
  };
  tunedStage: number;
  detailLevel: number;
}

export interface PlayerFootballer {
  id: string;
  name: string;
  position: 'FWD' | 'MID' | 'DEF' | 'GK';
  rating: number;
  age: number;
  value: number;
  wage: number;
}

export interface FootballClub {
  name: string;
  reputation: number;
  stadiumCapacity: number;
  stadiumLevel: number;
  tactic: '4-3-3 Attacking' | '4-2-3-1 Balanced' | '3-5-2 Counter' | '4-4-2 High Press';
  division: string;
  leaguePoints: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  squad: PlayerFootballer[];
  trophiesWon: number;
  managerRating: number;
}

export interface MatchSimulation {
  opponent: string;
  opponentRating: number;
  homeScore: number;
  awayScore: number;
  minute: number;
  isCompleted: boolean;
  events: Array<{
    minute: number;
    text: string;
    type: 'goal' | 'save' | 'yellow' | 'foul' | 'sub';
  }>;
  resultBonus?: number;
}

export interface CandleDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockAsset {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  prevPrice: number;
  sharesOwned: number;
  history: number[];
  candles: CandleDataPoint[];
  dividendYield: number;
  marketCap: string;
  high52w: number;
  low52w: number;
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  prevPrice: number;
  amountOwned: number;
  history: number[];
  candles: CandleDataPoint[];
  volatility: number;
  marketCap: string;
  high24h: number;
  low24h: number;
}

export interface RealEstateProperty {
  id: string;
  name: string;
  location: string;
  city: string;
  price: number;
  monthlyRentalYield: number;
  appreciationRate: number;
  isOwned: boolean;
  imageTag: string;
  description: string;
}

export interface LuxuryCollectionItem {
  id: string;
  type: 'CAR' | 'JET' | 'YACHT' | 'WATCH';
  name: string;
  specs: string;
  price: number;
  prestigePoints: number;
  monthlyUpkeep: number;
  isOwned: boolean;
  topSpeedOrFeature?: string;
  tagline: string;
}

export interface PrivateClubPerk {
  id: string;
  title: string;
  description: string;
  cost: number;
  isPurchased: boolean;
  passiveBonusType: 'REVENUE_BOOST' | 'TAX_CUT' | 'INSIDER_TRADING' | 'PRESTIGE_MULTIPLIER';
  multiplier: number;
}

export interface TaxSystemState {
  corporateTaxRate: number;     // e.g. 0.20 (20%)
  wealthTaxRate: number;        // e.g. 0.015 (1.5%)
  effectiveTaxRate: number;     // calculated after deductions (e.g. 0.04)
  accumulatedTaxDue: number;    // pending payment this month
  totalTaxPaid: number;         // lifetime
  totalTaxSaved: number;        // lifetime
  offshoreAccountantsHired: boolean; // cuts 6%
  monacoTrustRegistered: boolean;    // cuts 8%
  swissZugHoldingSetup: boolean;     // cuts 4%
  auditRiskPercent: number;          // 0-100%
  underAudit: boolean;
  autoPayTaxes: boolean;
}

export interface GameState {
  cash: number;
  bankSavings: number;
  prestigePoints: number;
  month: number;
  year: number;
  gameSpeed: number;
  soundEnabled: boolean;
  
  // 7 Businesses (including Auto Dealership)
  businesses: Business[];
  dealershipInventory: DealershipCar[];
  marketCars: DealershipCar[];

  // Football Club
  footballClub: FootballClub;
  currentMatch: MatchSimulation | null;

  // Investments
  stocks: StockAsset[];
  cryptos: CryptoAsset[];
  realEstate: RealEstateProperty[];

  // Luxury
  luxuryItems: LuxuryCollectionItem[];

  // Taxes
  taxSystem: TaxSystemState;

  // Private Club
  privateClubUnlocked: boolean;
  privateClubPerks: PrivateClubPerk[];
}
