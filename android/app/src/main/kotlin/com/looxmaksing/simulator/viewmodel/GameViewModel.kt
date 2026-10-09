package com.looxmaksing.simulator.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.looxmaksing.simulator.model.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.random.Random

data class GameUiState(
    val cash: Long = 45000L,
    val bankSavings: Long = 10000L,
    val prestigePoints: Long = 1200L,
    val month: Int = 1,
    val year: Int = 2026,
    val gameSpeed: Int = 1, // 0 = paused, 1 = normal
    val dealershipUnlocked: Boolean = false,
    val dealershipInventory: List<DealershipCar> = emptyList(),
    val marketCars: List<DealershipCar> = emptyList(),
    val businesses: List<Business> = emptyList(),
    val footballClub: FootballClub? = null,
    val stocks: List<StockAsset> = emptyList(),
    val cryptos: List<CryptoAsset> = emptyList(),
    val realEstate: List<RealEstateProperty> = emptyList(),
    val luxuryItems: List<LuxuryCollectionItem> = emptyList(),
    val privateClubUnlocked: Boolean = false,
    val privateClubPerks: List<PrivateClubPerk> = emptyList(),
    val notifications: List<GameNotification> = emptyList()
) {
    val netWorth: Long
        get() {
            var total = cash + bankSavings
            total += businesses.filter { it.unlocked }.sumOf { it.valuation }
            total += dealershipInventory.sumOf { it.currentValue }
            total += realEstate.filter { it.isOwned }.sumOf { it.price }
            total += luxuryItems.filter { it.isOwned }.sumOf { it.price }
            total += stocks.sumOf { (it.sharesOwned * it.price).toLong() }
            total += cryptos.sumOf { (it.amountOwned * it.price).toLong() }
            return total
        }

    val monthlyPassiveIncome: Long
        get() {
            var sum = 0L
            sum += businesses.filter { it.unlocked }.sumOf { it.monthlyRevenue - it.monthlyExpenses }
            sum += realEstate.filter { it.isOwned }.sumOf { it.monthlyRentalYield }
            sum -= luxuryItems.filter { it.isOwned }.sumOf { it.monthlyUpkeep }
            return sum
        }
}

class GameViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(GameUiState())
    val uiState: StateFlow<GameUiState> = _uiState.asStateFlow()

    init {
        initInitialData()
        startGameLoop()
    }

    private fun initInitialData() {
        val defaultBusinesses = listOf(
            Business(
                id = "b1",
                name = "Atelier Aurelia & Luxury Retail",
                category = BusinessCategory.RETAIL,
                categoryName = "Розничные бутики",
                description = "Элитные бутики и ювелирные дома в Милане, Париже и Дубае.",
                level = 1,
                unlocked = true,
                unlockCost = 0L,
                valuation = 95000L,
                monthlyRevenue = 6500L,
                monthlyExpenses = 2800L,
                employees = 12,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1
            ),
            Business(
                id = "b2",
                name = "Grand Elysium Michelin Hotels",
                category = BusinessCategory.HOSPITALITY,
                categoryName = "Рестораны & Отели",
                description = "5-звездочные отели и рестораны высокой кухни с 3 звездами Michelin.",
                level = 0,
                unlocked = false,
                unlockCost = 150000L,
                valuation = 480000L,
                monthlyRevenue = 29000L,
                monthlyExpenses = 13500L,
                employees = 45,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1
            ),
            Business(
                id = "b3",
                name = "Zurich Private Merchant Bank",
                category = BusinessCategory.BANKING,
                categoryName = "Банкинг & Хедж-фонды",
                description = "Швейцарский приватный банк и квантовый хедж-фонд.",
                level = 0,
                unlocked = false,
                unlockCost = 750000L,
                valuation = 2900000L,
                monthlyRevenue = 145000L,
                monthlyExpenses = 54000L,
                employees = 90,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1
            ),
            Business(
                id = "b4",
                name = "Apex Megastructure & Skyscraper Dev",
                category = BusinessCategory.CONSTRUCTION,
                categoryName = "Строительный холдинг",
                description = "Строительство небоскребов и искусственных островов.",
                level = 0,
                unlocked = false,
                unlockCost = 2500000L,
                valuation = 9800000L,
                monthlyRevenue = 490000L,
                monthlyExpenses = 195000L,
                employees = 340,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1
            ),
            Business(
                id = "b5",
                name = "Synapse Core AI & Cloud",
                category = BusinessCategory.TECH,
                categoryName = "IT & Высокие технологии",
                description = "Разработка передовых нейросетей и квантовых облаков.",
                level = 0,
                unlocked = false,
                unlockCost = 8000000L,
                valuation = 36000000L,
                monthlyRevenue = 1750000L,
                monthlyExpenses = 650000L,
                employees = 480,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1
            ),
            Business(
                id = "b6",
                name = "Aether Orbital Space Agency",
                category = BusinessCategory.AEROSPACE,
                categoryName = "Космическое агентство",
                description = "Частные запуски тяжелых ракет и добыча на астероидах.",
                level = 0,
                unlocked = false,
                unlockCost = 25000000L,
                valuation = 125000000L,
                monthlyRevenue = 5600000L,
                monthlyExpenses = 2200000L,
                employees = 890,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1
            )
        )

        val defaultMarketCars = listOf(
            DealershipCar(
                id = "c1",
                brand = "BMW",
                model = "M3 Competition G80",
                year = 2022,
                horsePower = 510,
                zeroToHundred = "3.5s",
                topSpeed = 290,
                boughtPrice = 38000L,
                currentValue = 38000L,
                isOwned = false,
                conditions = CarConditions(45, 60, 40, 50, 40)
            ),
            DealershipCar(
                id = "c2",
                brand = "Audi",
                model = "RS6 Avant Quattro",
                year = 2021,
                horsePower = 600,
                zeroToHundred = "3.6s",
                topSpeed = 305,
                boughtPrice = 52000L,
                currentValue = 52000L,
                isOwned = false,
                conditions = CarConditions(40, 45, 50, 45, 55)
            ),
            DealershipCar(
                id = "c3",
                brand = "Mercedes-AMG",
                model = "C63 S V8 BiTurbo",
                year = 2020,
                horsePower = 503,
                zeroToHundred = "3.9s",
                topSpeed = 290,
                boughtPrice = 42000L,
                currentValue = 42000L,
                isOwned = false,
                conditions = CarConditions(55, 60, 45, 60, 50)
            ),
            DealershipCar(
                id = "c4",
                brand = "Porsche",
                model = "911 Carrera S (992)",
                year = 2022,
                horsePower = 450,
                zeroToHundred = "3.5s",
                topSpeed = 308,
                boughtPrice = 68000L,
                currentValue = 68000L,
                isOwned = false,
                conditions = CarConditions(60, 55, 50, 40, 50)
            ),
            DealershipCar(
                id = "c5",
                brand = "Ferrari",
                model = "458 Italia",
                year = 2015,
                horsePower = 570,
                zeroToHundred = "3.4s",
                topSpeed = 325,
                boughtPrice = 115000L,
                currentValue = 115000L,
                isOwned = false,
                conditions = CarConditions(50, 45, 40, 35, 45)
            )
        )

        val defaultStocks = listOf(
            StockAsset("AAPL", "Apple Inc.", "Tech", 232.5, 228.0, 0, listOf(220.0, 225.0, 228.0, 232.5), 0.5),
            StockAsset("NVDA", "NVIDIA Corp.", "AI & Chips", 141.2, 136.0, 0, listOf(125.0, 130.0, 136.0, 141.2), 0.2),
            StockAsset("TSLA", "Tesla Motors", "EV & Robots", 245.8, 240.0, 0, listOf(225.0, 232.0, 240.0, 245.8), 0.0),
            StockAsset("RACE", "Ferrari N.V.", "Luxury Supercars", 448.6, 440.0, 0, listOf(425.0, 435.0, 440.0, 448.6), 0.6)
        )

        val defaultCryptos = listOf(
            CryptoAsset("BTC", "Bitcoin", 96400.0, 94200.0, 0.0, listOf(90000.0, 92500.0, 94200.0, 96400.0), 0.06),
            CryptoAsset("ETH", "Ethereum", 3450.0, 3380.0, 0.0, listOf(3200.0, 3300.0, 3380.0, 3450.0), 0.08),
            CryptoAsset("SOL", "Solana", 215.0, 202.0, 0.0, listOf(185.0, 195.0, 202.0, 215.0), 0.11),
            CryptoAsset("LOOX", "LooxCoin", 4.85, 4.20, 0.0, listOf(3.2, 3.8, 4.2, 4.85), 0.25)
        )

        val defaultRealEstate = listOf(
            RealEstateProperty(
                id = "p1",
                name = "Palm Jumeirah Signature Villa",
                location = "Palm Jumeirah, Dubai",
                city = "Дубай",
                price = 8500000L,
                monthlyRentalYield = 52000L,
                isOwned = false,
                description = "Частный пляж, вертолетная площадка, бассейн инфинити."
            ),
            RealEstateProperty(
                id = "p2",
                name = "432 Park Ave Penthouse",
                location = "Manhattan, New York",
                city = "Нью-Йорк",
                price = 18500000L,
                monthlyRentalYield = 98000L,
                isOwned = false,
                description = "Панорама Центрального парка на 360 градусов."
            ),
            RealEstateProperty(
                id = "p3",
                name = "Tour Odéon Duplex Monaco",
                location = "Monte Carlo, Monaco",
                city = "Монте-Карло",
                price = 26000000L,
                monthlyRentalYield = 135000L,
                isOwned = false,
                description = "Вид на гавань суперяхт и трассу Формулы-1."
            )
        )

        val defaultLuxury = listOf(
            LuxuryCollectionItem(
                id = "l1",
                type = LuxuryType.CAR,
                name = "Porsche 911 GT3 RS",
                specs = "525 л.с. · 0-100: 3.2с",
                price = 360000L,
                prestigePoints = 4200L,
                monthlyUpkeep = 2500L,
                isOwned = false,
                topSpeedOrFeature = "296 км/ч",
                tagline = "Штутгартский трековый эталон."
            ),
            LuxuryCollectionItem(
                id = "l2",
                type = LuxuryType.CAR,
                name = "Rolls-Royce Phantom VIII",
                specs = "571 л.с. V12 · Звездное небо",
                price = 620000L,
                prestigePoints = 8900L,
                monthlyUpkeep = 3800L,
                isOwned = false,
                topSpeedOrFeature = "Бесшумный комфорт",
                tagline = "Абсолютная мировая представительская роскошь."
            ),
            LuxuryCollectionItem(
                id = "l3",
                type = LuxuryType.CAR,
                name = "Bugatti Chiron Super Sport",
                specs = "1,600 л.с. W16 Quad-Turbo",
                price = 4200000L,
                prestigePoints = 55000L,
                monthlyUpkeep = 18000L,
                isOwned = false,
                topSpeedOrFeature = "440 км/ч",
                tagline = "Легендарный рекордсмен скорости."
            ),
            LuxuryCollectionItem(
                id = "l4",
                type = LuxuryType.JET,
                name = "Gulfstream G650ER",
                specs = "Дальность 13,890 км · 4 каюты",
                price = 68000000L,
                prestigePoints = 125000L,
                monthlyUpkeep = 95000L,
                isOwned = false,
                topSpeedOrFeature = "Mach 0.925",
                tagline = "Беспосадочный трансконтинентальный полет."
            )
        )

        val defaultPerks = listOf(
            PrivateClubPerk("cp1", "Инсайдерский канал Уолл-стрит", "Повышает доходность трейдинга на +25%", 500000L, false, 1.25),
            PrivateClubPerk("cp2", "Офшорный траст Монако", "Снижает корпоративные расходы на 20%", 1200000L, false, 0.80),
            PrivateClubPerk("cp3", "Венчурный синдикат", "Увеличивает выручку компаний на +35%", 3000000L, false, 1.35)
        )

        _uiState.update {
            it.copy(
                businesses = defaultBusinesses,
                marketCars = defaultMarketCars,
                stocks = defaultStocks,
                cryptos = defaultCryptos,
                realEstate = defaultRealEstate,
                luxuryItems = defaultLuxury,
                privateClubPerks = defaultPerks
            )
        }
    }

    private fun startGameLoop() {
        viewModelScope.launch {
            while (true) {
                delay(4000L)
                if (_uiState.value.gameSpeed > 0) {
                    advanceMonth()
                }
            }
        }
    }

    fun advanceMonth() {
        _uiState.update { current ->
            val newMonth = if (current.month == 12) 1 else current.month + 1
            val newYear = if (current.month == 12) current.year + 1 else current.year

            val netIncome = current.monthlyPassiveIncome
            val updatedCash = (current.cash + netIncome).coerceAtLeast(0L)

            // Stock price simulation
            val updatedStocks = current.stocks.map { stock ->
                val change = (Random.nextDouble(-0.04, 0.05))
                val newPrice = (stock.price * (1 + change)).coerceAtLeast(1.0)
                val newHistory = (stock.history.takeLast(9) + newPrice)
                stock.copy(price = newPrice, prevPrice = stock.price, history = newHistory)
            }

            // Crypto price simulation
            val updatedCryptos = current.cryptos.map { crypto ->
                val change = (Random.nextDouble(-crypto.volatility, crypto.volatility * 1.2))
                val newPrice = (crypto.price * (1 + change)).coerceAtLeast(0.01)
                val newHistory = (crypto.history.takeLast(9) + newPrice)
                crypto.copy(price = newPrice, prevPrice = crypto.price, history = newHistory)
            }

            // Check if any business level >= 4 unlocks private club
            val canUnlockClub = current.businesses.any { it.level >= 4 }

            current.copy(
                month = newMonth,
                year = newYear,
                cash = updatedCash,
                stocks = updatedStocks,
                cryptos = updatedCryptos,
                privateClubUnlocked = current.privateClubUnlocked || canUnlockClub
            )
        }
    }

    fun unlockDealership() {
        val cost = 40000L
        if (_uiState.value.cash >= cost && !_uiState.value.dealershipUnlocked) {
            _uiState.update {
                it.copy(
                    cash = it.cash - cost,
                    dealershipUnlocked = true,
                    prestigePoints = it.prestigePoints + 500L
                )
            }
        }
    }

    fun buyMarketCar(car: DealershipCar) {
        if (_uiState.value.cash >= car.boughtPrice) {
            _uiState.update { current ->
                val updatedMarket = current.marketCars.filter { it.id != car.id }
                val ownedCar = car.copy(isOwned = true)
                current.copy(
                    cash = current.cash - car.boughtPrice,
                    marketCars = updatedMarket,
                    dealershipInventory = current.dealershipInventory + ownedCar
                )
            }
        }
    }

    fun repairCarComponent(carId: String, component: String, cost: Long) {
        if (_uiState.value.cash >= cost) {
            _uiState.update { current ->
                val updatedInventory = current.dealershipInventory.map { car ->
                    if (car.id == carId) {
                        val cond = car.conditions
                        val updatedCond = when (component) {
                            "engine" -> cond.copy(engine = 100)
                            "transmission" -> cond.copy(transmission = 100)
                            "suspension" -> cond.copy(suspension = 100)
                            "bodywork" -> cond.copy(bodywork = 100)
                            "interior" -> cond.copy(interior = 100)
                            else -> cond
                        }
                        val boostedValue = (car.boughtPrice * (1.0 + (updatedCond.overall / 100.0) * 0.75)).toLong()
                        car.copy(conditions = updatedCond, currentValue = boostedValue)
                    } else car
                }
                current.copy(
                    cash = current.cash - cost,
                    dealershipInventory = updatedInventory
                )
            }
        }
    }

    fun sellCar(car: DealershipCar) {
        _uiState.update { current ->
            val updatedInventory = current.dealershipInventory.filter { it.id != car.id }
            val profit = car.currentValue - car.boughtPrice
            current.copy(
                cash = current.cash + car.currentValue,
                dealershipInventory = updatedInventory,
                prestigePoints = current.prestigePoints + (profit.coerceAtLeast(0L) / 100L)
            )
        }
    }

    fun upgradeBusiness(bizId: String) {
        val biz = _uiState.value.businesses.find { it.id == bizId } ?: return
        val cost = (biz.valuation * 0.25).toLong()
        if (_uiState.value.cash >= cost) {
            _uiState.update { current ->
                val updatedList = current.businesses.map { b ->
                    if (b.id == bizId) {
                        val newLevel = b.level + 1
                        b.copy(
                            level = newLevel,
                            valuation = (b.valuation * 1.5).toLong(),
                            monthlyRevenue = (b.monthlyRevenue * 1.45).toLong(),
                            monthlyExpenses = (b.monthlyExpenses * 1.3).toLong()
                        )
                    } else b
                }
                val canUnlockClub = updatedList.any { it.level >= 4 }
                current.copy(
                    cash = current.cash - cost,
                    businesses = updatedList,
                    privateClubUnlocked = current.privateClubUnlocked || canUnlockClub,
                    prestigePoints = current.prestigePoints + 800L
                )
            }
        }
    }

    fun buyLuxuryItem(item: LuxuryCollectionItem) {
        if (_uiState.value.cash >= item.price && !item.isOwned) {
            _uiState.update { current ->
                val updatedItems = current.luxuryItems.map {
                    if (it.id == item.id) it.copy(isOwned = true) else it
                }
                current.copy(
                    cash = current.cash - item.price,
                    luxuryItems = updatedItems,
                    prestigePoints = current.prestigePoints + item.prestigePoints
                )
            }
        }
    }
}
