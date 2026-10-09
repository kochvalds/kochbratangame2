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
    val prestigePoints: Long = 1500L,
    val month: Int = 1,
    val year: Int = 2026,
    val gameSpeed: Int = 1,
    val businesses: List<Business> = emptyList(),
    val dealershipInventory: List<DealershipCar> = emptyList(),
    val marketCars: List<DealershipCar> = emptyList(),
    val footballClub: FootballClub? = null,
    val stocks: List<StockAsset> = emptyList(),
    val cryptos: List<CryptoAsset> = emptyList(),
    val realEstate: List<RealEstateProperty> = emptyList(),
    val luxuryItems: List<LuxuryCollectionItem> = emptyList(),
    val taxSystem: TaxSystemState = TaxSystemState(),
    val privateClubUnlocked: Boolean = false,
    val privateClubPerks: List<PrivateClubPerk> = emptyList()
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
                id = "biz_dealership",
                name = "Apex Motors — Автодилер & Реставрация",
                category = BusinessCategory.AUTOMOTIVE,
                categoryName = "Автодилерский Центр",
                description = "Покупка битых спорткаров с аукционов, диагностика, ремонт и продажа с маржой.",
                level = 0,
                unlocked = false,
                unlockCost = 40000L,
                valuation = 95000L,
                monthlyRevenue = 12500L,
                monthlyExpenses = 4200L,
                employees = 8,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1,
                specialMetricName = "Боксов в сервисе",
                specialMetricValue = "4 подъемника",
                subActions = listOf(
                    BusinessSubAction("act_1", "Гидравлические подъемники Hunter", "Ускоряет диагностику ходовой на 50%", 12000L, 2800L, false, "EQUIPMENT"),
                    BusinessSubAction("act_2", "Покрасочная камера Nova Verta", "+20% к продажной стоимости кузова", 24000L, 5400L, false, "PAINT"),
                    BusinessSubAction("act_3", "Чип-тюнинг стенд Dyno Dynamics", "Стейдж 1 и 2 форсирование моторов", 45000L, 9800L, false, "TUNING")
                )
            ),
            Business(
                id = "biz_retail",
                name = "Atelier Aurelia & Luxury Retail",
                category = BusinessCategory.RETAIL,
                categoryName = "Розничная торговля & Бутики",
                description = "Сеть элитных бутиков и ювелирных домов в Милане, Париже и Дубае.",
                level = 1,
                unlocked = true,
                unlockCost = 0L,
                valuation = 85000L,
                monthlyRevenue = 8200L,
                monthlyExpenses = 3400L,
                employees = 14,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1,
                specialMetricName = "Торговая площадь",
                specialMetricValue = "850 м²",
                subActions = listOf(
                    BusinessSubAction("act_r1", "Линия Haute Couture Осень-Зима", "Коллекция из кашемира и шелка", 15000L, 3500L, false, "COLLECTION")
                )
            ),
            Business(
                id = "biz_hospitality",
                name = "Grand Elysium Hotels & Resorts",
                category = BusinessCategory.HOSPITALITY,
                categoryName = "Рестораны & Отели Michelin",
                description = "5-звездочные отели и рестораны высокой кухни с 3 звездами Michelin.",
                level = 0,
                unlocked = false,
                unlockCost = 150000L,
                valuation = 450000L,
                monthlyRevenue = 34000L,
                monthlyExpenses = 15000L,
                employees = 52,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1,
                specialMetricName = "Звезд Michelin",
                specialMetricValue = "3 Звезды ★★★",
                subActions = emptyList()
            ),
            Business(
                id = "biz_banking",
                name = "Zurich Private Merchant Bank & Quants",
                category = BusinessCategory.BANKING,
                categoryName = "Банкинг & Хедж-фонды",
                description = "Швейцарский приватный банк и квантовый хедж-фонд.",
                level = 0,
                unlocked = false,
                unlockCost = 750000L,
                valuation = 2800000L,
                monthlyRevenue = 155000L,
                monthlyExpenses = 58000L,
                employees = 92,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1,
                specialMetricName = "AUM (Активы)",
                specialMetricValue = "$1.4B",
                subActions = emptyList()
            ),
            Business(
                id = "biz_construction",
                name = "Apex Megastructure & Skyscraper Dev",
                category = BusinessCategory.CONSTRUCTION,
                categoryName = "Строительный холдинг",
                description = "Строительство небоскребов и искусственных островов.",
                level = 0,
                unlocked = false,
                unlockCost = 2500000L,
                valuation = 9500000L,
                monthlyRevenue = 520000L,
                monthlyExpenses = 210000L,
                employees = 340,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1,
                specialMetricName = "Небоскребов в работе",
                specialMetricValue = "12 башен",
                subActions = emptyList()
            ),
            Business(
                id = "biz_tech",
                name = "Synapse Core AI & Quantum Cloud",
                category = BusinessCategory.TECH,
                categoryName = "IT & Высокие технологии",
                description = "Разработка передовых нейросетей и квантовых суперкластеров.",
                level = 0,
                unlocked = false,
                unlockCost = 8000000L,
                valuation = 35000000L,
                monthlyRevenue = 1850000L,
                monthlyExpenses = 680000L,
                employees = 480,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1,
                specialMetricName = "Вычислительный кластер",
                specialMetricValue = "64,000x B200",
                subActions = emptyList()
            ),
            Business(
                id = "biz_aerospace",
                name = "Aether Orbital & Space Agency",
                category = BusinessCategory.AEROSPACE,
                categoryName = "Космическое агентство",
                description = "Частные запуски тяжелых ракет и добыча на астероидах.",
                level = 0,
                unlocked = false,
                unlockCost = 25000000L,
                valuation = 120000000L,
                monthlyRevenue = 5800000L,
                monthlyExpenses = 2250000L,
                employees = 890,
                marketingLevel = 1,
                techLevel = 1,
                hrLevel = 1,
                specialMetricName = "Запусков на орбиту",
                specialMetricValue = "28 миссий",
                subActions = emptyList()
            )
        )

        val defaultCars = listOf(
            DealershipCar("c1", "BMW", "M3 Competition G80", 2023, 510, "3.5s", 290, 38000L, 38000L, false, CarConditions(45, 60, 40, 50, 45)),
            DealershipCar("c2", "Audi", "RS6 Avant Quattro", 2022, 600, "3.6s", 305, 52000L, 52000L, false, CarConditions(40, 45, 55, 40, 60)),
            DealershipCar("c3", "Mercedes-AMG", "C63 S V8 BiTurbo", 2021, 503, "3.9s", 290, 42000L, 42000L, false, CarConditions(50, 65, 45, 60, 50)),
            DealershipCar("c4", "Porsche", "911 Carrera S 992", 2022, 450, "3.5s", 308, 65000L, 65000L, false, CarConditions(60, 55, 50, 45, 50)),
            DealershipCar("c5", "Ferrari", "458 Italia V8", 2015, 570, "3.4s", 325, 115000L, 115000L, false, CarConditions(55, 45, 40, 35, 45)),
            DealershipCar("c6", "Lamborghini", "Huracán EVO V10", 2022, 640, "2.9s", 325, 145000L, 145000L, false, CarConditions(60, 50, 50, 40, 60)),
            DealershipCar("c7", "Porsche", "911 GT3 RS Weissach", 2023, 525, "3.2s", 296, 240000L, 240000L, false, CarConditions(70, 65, 60, 50, 65)),
            DealershipCar("c8", "Bugatti", "Chiron Super Sport 300+", 2022, 1600, "2.4s", 490, 3900000L, 3900000L, false, CarConditions(90, 85, 80, 75, 85))
        )

        val defaultStocks = listOf(
            StockAsset("AAPL", "Apple Inc.", "Tech", 232.5, 228.0, 0, listOf(220.0, 225.0, 228.0, 232.5), 0.5, "$3.55T"),
            StockAsset("NVDA", "NVIDIA Corp.", "AI & Chips", 141.2, 136.0, 0, listOf(125.0, 130.0, 136.0, 141.2), 0.2, "$3.46T"),
            StockAsset("TSLA", "Tesla Motors", "EV & Robots", 245.8, 240.0, 0, listOf(225.0, 232.0, 240.0, 245.8), 0.0, "$785B"),
            StockAsset("RACE", "Ferrari N.V.", "Luxury Supercars", 448.6, 440.0, 0, listOf(425.0, 435.0, 440.0, 448.6), 0.6, "$81.4B")
        )

        val defaultCryptos = listOf(
            CryptoAsset("BTC", "Bitcoin", 96400.0, 94200.0, 0.0, listOf(90000.0, 92500.0, 94200.0, 96400.0), 0.06, "$1.91T"),
            CryptoAsset("ETH", "Ethereum", 3450.0, 3380.0, 0.0, listOf(3200.0, 3300.0, 3380.0, 3450.0), 0.08, "$415B"),
            CryptoAsset("SOL", "Solana", 215.0, 202.0, 0.0, listOf(185.0, 195.0, 202.0, 215.0), 0.11, "$102B"),
            CryptoAsset("LOOX", "LooxCoin", 4.85, 4.20, 0.0, listOf(3.2, 3.8, 4.2, 4.85), 0.25, "$485M")
        )

        _uiState.update {
            it.copy(
                businesses = defaultBusinesses,
                marketCars = defaultCars,
                stocks = defaultStocks,
                cryptos = defaultCryptos
            )
        }
    }

    private fun startGameLoop() {
        viewModelScope.launch {
            while (true) {
                delay(3500L)
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
            val taxDue = (netIncome * current.taxSystem.effectiveTaxRate).toLong().coerceAtLeast(0L)

            val updatedCash = (current.cash + netIncome - (if (current.taxSystem.autoPayTaxes) taxDue else 0L)).coerceAtLeast(0L)

            val canUnlockClub = current.businesses.any { it.level >= 4 }

            current.copy(
                month = newMonth,
                year = newYear,
                cash = updatedCash,
                privateClubUnlocked = current.privateClubUnlocked || canUnlockClub
            )
        }
    }

    fun unlockBusiness(bizId: String) {
        val biz = _uiState.value.businesses.find { it.id == bizId } ?: return
        if (_uiState.value.cash >= biz.unlockCost) {
            _uiState.update { current ->
                val updatedList = current.businesses.map {
                    if (it.id == bizId) it.copy(unlocked = true, level = 1) else it
                }
                current.copy(
                    cash = current.cash - biz.unlockCost,
                    businesses = updatedList,
                    prestigePoints = current.prestigePoints + 3000L
                )
            }
        }
    }

    fun payTaxes() {
        val due = _uiState.value.taxSystem.accumulatedTaxDue
        if (_uiState.value.cash >= due) {
            _uiState.update { current ->
                current.copy(
                    cash = current.cash - due,
                    taxSystem = current.taxSystem.copy(
                        accumulatedTaxDue = 0L,
                        totalTaxPaid = current.taxSystem.totalTaxPaid + due
                    )
                )
            }
        }
    }
}
