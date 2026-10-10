package com.looxmaksing.simulator.model

enum class BusinessCategory {
    AUTOMOTIVE, RETAIL, HOSPITALITY, BANKING, CONSTRUCTION, TECH, AEROSPACE, ENERGY, MEDIA, BIOTECH
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

data class LooksmaxingUpgrade(
    val id: String,
    val category: String,
    val name: String,
    val description: String,
    val cost: Long,
    val scoreBonus: Int,
    val categoryBoost: String,
    val isUnlocked: Boolean
)

data class LooksmaxingProfile(
    val overallScore: Int = 24,
    val tier: String = "Нормис 🧢",
    val jawline: Int = 25,
    val hunterEyes: Int = 20,
    val skinGlow: Int = 30,
    val physique: Int = 22,
    val hairStyle: Int = 25,
    val mewingStreakDays: Int = 3,
    val banyaVisitsCount: Int = 1,
    val auraPowerBonus: Int = 5,
    val revenueMultiplier: Double = 1.05,
    val upgrades: List<LooksmaxingUpgrade> = emptyList()
)

data class BanyaFacility(
    val temperatureC: Int = 85,
    val steamHumidity: Int = 55,
    val stoneHeat: Int = 90,
    val activeVenik: String = "Берёзовый веник",
    val venikCondition: Int = 92,
    val plungePoolTempC: Int = 4,
    val samovarTeaServings: Int = 6,
    val banshikHired: Boolean = false,
    val currentRelaxation: Int = 70
)

data class GTA3DWorldState(
    val inVehicle: Boolean = false,
    val currentVehicleName: String = "",
    val speedKmh: Int = 0,
    val radioStation: String = "Luxury Phonk FM",
    val playerPosX: Float = 0f,
    val playerPosZ: Float = 15f
)

data class GymExercise(
    val id: String,
    val name: String,
    val targetMuscle: String,
    val currentWeightKg: Int,
    val maxWeightKg: Int,
    val repsCompleted: Int,
    val energyCost: Int,
    val physiqueGain: Int,
    val strengthGain: Int
)

data class GymState(
    val benchPressWeightKg: Int = 80,
    val deadliftWeightKg: Int = 120,
    val squatsWeightKg: Int = 100,
    val bicepWeightKg: Int = 18,
    val stamina: Int = 85,
    val totalWorkoutsCount: Int = 4,
    val currentStreakDays: Int = 3,
    val membershipType: String = "GOLDS_VIP",
    val personalTrainerHired: Boolean = true,
    val exercises: List<GymExercise> = emptyList()
)

data class CustomizationItem(
    val id: String,
    val category: String, // HAIRCUT, OUTFIT, ACCESSORY, BEARD
    val name: String,
    val brand: String,
    val price: Long,
    val prestigeBonus: Long,
    val looksBonus: Int,
    val isOwned: Boolean,
    val isEquipped: Boolean,
    val description: String
)

data class CustomizationState(
    val equippedHaircut: String = "taper_fade",
    val equippedOutfit: String = "loro_piana_knit",
    val equippedAccessory: String = "gold_cuban_chain",
    val equippedBeard: String = "chad_stubble",
    val muscleMassIndex: Int = 78,
    val bodyFatPercent: Int = 11,
    val items: List<CustomizationItem> = emptyList()
)

data class WeaponItem(
    val id: String,
    val name: String,
    val category: String,
    val price: Long,
    val damage: Int,
    val fireRate: Double,
    val ammo: Int,
    val maxAmmo: Int,
    val isOwned: Boolean,
    val isEquipped: Boolean,
    val tagline: String
)

data class AchievementItem(
    val id: String,
    val title: String,
    val description: String,
    val category: String,
    val tier: String,
    val rewardCash: Long,
    val rewardPrestige: Long,
    val isUnlocked: Boolean,
    val progress: Long,
    val maxProgress: Long
)

data class KochBratanDialog(
    val id: String,
    val speaker: String,
    val text: String,
    val audioTone: String = "hype"
)


