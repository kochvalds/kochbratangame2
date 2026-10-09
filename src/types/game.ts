export type BusinessCategory = 
  | 'RETAIL' 
  | 'HOSPITALITY' 
  | 'BANKING' 
  | 'CONSTRUCTION' 
  | 'TECH' 
  | 'AEROSPACE';

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
  tunedStage: number; // 0, 1, 2
  detailLevel: number; // 0, 1
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

export interface StockAsset {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  prevPrice: number;
  sharesOwned: number;
  history: number[];
  dividendYield: number; // annual %
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  prevPrice: number;
  amountOwned: number;
  history: number[];
  volatility: number;
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

export interface GameEventNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'deal';
  timestamp: string;
}

export interface GameState {
  cash: number;
  bankSavings: number;
  prestigePoints: number;
  month: number;
  year: number;
  gameSpeed: number; // 0: paused, 1: 1x, 2: 2x, 5: 5x
  soundEnabled: boolean;
  
  // Dealership
  dealershipUnlocked: boolean;
  dealershipLevel: number;
  dealershipInventory: DealershipCar[];
  marketCars: DealershipCar[];
  carsSoldHistoryCount: number;
  totalDealershipProfit: number;

  // Businesses
  businesses: Business[];

  // Football Club
  footballClub: FootballClub;
  currentMatch: MatchSimulation | null;

  // Investments
  stocks: StockAsset[];
  cryptos: CryptoAsset[];
  realEstate: RealEstateProperty[];

  // Luxury
  luxuryItems: LuxuryCollectionItem[];

  // Private Club
  privateClubUnlocked: boolean;
  privateClubPerks: PrivateClubPerk[];
  syndicateDealsUsed: number;

  // History & Notifications
  notifications: GameEventNotification[];
}
