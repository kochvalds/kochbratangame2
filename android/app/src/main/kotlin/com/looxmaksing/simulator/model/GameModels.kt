package com.looxmaksing.simulator.model

enum class BusinessCategory {
    AUTOMOTIVE, RETAIL, HOSPITALITY, BANKING, CONSTRUCTION, TECH, AEROSPACE
}

data class BusinessSubAction(
    val id: String,
    val title: String,
    val desc: String,
    val cost: Long,
    val revenueBonus: Long,
    val isUnlocked: Boolean,
    val type: String
)

data class Business(
    val id: String,
    val name: String,
    val category: BusinessCategory,
    val categoryName: String,
    val description: String,
    val level: Int,
    val unlocked: Boolean,
    val unlockCost: Long,
    val valuation: Long,
    val monthlyRevenue: Long,
    val monthlyExpenses: Long,
    val employees: Int,
    val marketingLevel: Int,
    val techLevel: Int,
    val hrLevel: Int,
    val specialMetricName: String,
    val specialMetricValue: String,
    val subActions: List<BusinessSubAction>
)

data class CarConditions(
    val engine: Int,
    val transmission: Int,
    val suspension: Int,
    val bodywork: Int,
    val interior: Int
) {
    val overall: Int get() = (engine + transmission + suspension + bodywork + interior) / 5
}

data class DealershipCar(
    val id: String,
    val brand: String,
    val model: String,
    val year: Int,
    val horsePower: Int,
    val zeroToHundred: String,
    val topSpeed: Int,
    val boughtPrice: Long,
    val currentValue: Long,
    val isOwned: Boolean,
    val conditions: CarConditions,
    val tunedStage: Int = 0,
    val detailLevel: Int = 0
)

data class PlayerFootballer(
    val id: String,
    val name: String,
    val position: String,
    val rating: Int,
    val age: Int,
    val value: Long,
    val wage: Long
)

data class FootballClub(
    val name: String,
    val reputation: Int,
    val stadiumCapacity: Int,
    val stadiumLevel: Int,
    val tactic: String,
    val division: String,
    val leaguePoints: Int,
    val matchesPlayed: Int,
    val wins: Int,
    val draws: Int,
    val losses: Int,
    val goalsFor: Int,
    val goalsAgainst: Int,
    val trophiesWon: Int,
    val squad: List<PlayerFootballer>
)

data class StockAsset(
    val symbol: String,
    val name: String,
    val sector: String,
    val price: Double,
    val prevPrice: Double,
    val sharesOwned: Long,
    val history: List<Double>,
    val dividendYield: Double,
    val marketCap: String
)

data class CryptoAsset(
    val symbol: String,
    val name: String,
    val price: Double,
    val prevPrice: Double,
    val amountOwned: Double,
    val history: List<Double>,
    val volatility: Double,
    val marketCap: String
)

data class RealEstateProperty(
    val id: String,
    val name: String,
    val location: String,
    val city: String,
    val price: Long,
    val monthlyRentalYield: Long,
    val isOwned: Boolean,
    val description: String
)

enum class LuxuryType {
    CAR, JET, YACHT, WATCH
}

data class LuxuryCollectionItem(
    val id: String,
    val type: LuxuryType,
    val name: String,
    val specs: String,
    val price: Long,
    val prestigePoints: Long,
    val monthlyUpkeep: Long,
    val isOwned: Boolean,
    val topSpeedOrFeature: String,
    val tagline: String
)

data class TaxSystemState(
    val corporateTaxRate: Double = 0.20,
    val effectiveTaxRate: Double = 0.20,
    val accumulatedTaxDue: Long = 0L,
    val totalTaxPaid: Long = 0L,
    val totalTaxSaved: Long = 0L,
    val offshoreAccountantsHired: Boolean = false,
    val monacoTrustRegistered: Boolean = false,
    val swissZugHoldingSetup: Boolean = false,
    val auditRiskPercent: Int = 5,
    val autoPayTaxes: Boolean = false
)

data class PrivateClubPerk(
    val id: String,
    val title: String,
    val description: String,
    val cost: Long,
    val isPurchased: Boolean,
    val multiplier: Double
)
