package com.looxmaksing.simulator

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.looxmaksing.simulator.model.DealershipCar
import com.looxmaksing.simulator.viewmodel.GameViewModel
import java.text.NumberFormat
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF0F0F12),
                    surface = Color(0xFF18181D),
                    primary = Color(0xFFF59E0B),
                    secondary = Color(0xFF10B981)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainGameScreen()
                }
            }
        }
    }
}

@Composable
fun MainGameScreen(gameViewModel: GameViewModel = viewModel()) {
    val state by gameViewModel.uiState.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Top HUD Bar
        TopHudBar(
            cash = state.cash,
            netWorth = state.netWorth,
            prestige = state.prestigePoints,
            month = state.month,
            year = state.year,
            monthlyCashflow = state.monthlyPassiveIncome,
            onAdvanceMonth = { gameViewModel.advanceMonth() }
        )

        // Main Tab Content
        Box(modifier = Modifier.weight(1f)) {
            when (selectedTab) {
                0 -> BusinessTab(state = state, onUpgrade = { gameViewModel.upgradeBusiness(it) })
                1 -> DealershipTab(
                    state = state,
                    onUnlock = { gameViewModel.unlockDealership() },
                    onBuyCar = { gameViewModel.buyMarketCar(it) },
                    onRepair = { id, comp, cost -> gameViewModel.repairCarComponent(id, comp, cost) },
                    onSell = { gameViewModel.sellCar(it) }
                )
                2 -> LuxuryTab(state = state, onBuy = { gameViewModel.buyLuxuryItem(it) })
            }
        }

        // Bottom Navigation
        NavigationBar(containerColor = Color(0xFF141418)) {
            NavigationBarItem(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                icon = { Icon(Icons.Default.Business, contentDescription = "Бизнес") },
                label = { Text("Бизнес") }
            )
            NavigationBarItem(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                icon = { Icon(Icons.Default.DirectionsCar, contentDescription = "Автодилер") },
                label = { Text("Автодилер") }
            )
            NavigationBarItem(
                selected = selectedTab == 2,
                onClick = { selectedTab = 2 },
                icon = { Icon(Icons.Default.Diamond, contentDescription = "Роскошь") },
                label = { Text("Роскошь") }
            )
        }
    }
}

@Composable
fun TopHudBar(
    cash: Long,
    netWorth: Long,
    prestige: Long,
    month: Int,
    year: Int,
    monthlyCashflow: Long,
    onAdvanceMonth: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E24)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "LOOXMAKSING SIMULATOR 2",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color(0xFFF59E0B)
                    )
                    Text(
                        text = "Дата: Месяц $month, $year г.",
                        fontSize = 12.sp,
                        color = Color.LightGray
                    )
                }
                Button(
                    onClick = onAdvanceMonth,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Следующий месяц", fontSize = 12.sp)
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                StatItem(label = "Баланс наличных", value = formatUsd(cash), color = Color(0xFF10B981))
                StatItem(label = "Капитал (Net Worth)", value = formatUsd(netWorth), color = Color(0xFFFBBF24))
                StatItem(label = "Mogger Престиж", value = "$prestige pts", color = Color(0xFFA855F7))
            }
        }
    }
}

@Composable
fun StatItem(label: String, value: String, color: Color) {
    Column {
        Text(text = label, fontSize = 11.sp, color = Color.Gray)
        Text(text = value, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = color)
    }
}

@Composable
fun BusinessTab(
    state: com.looxmaksing.simulator.viewmodel.GameUiState,
    onUpgrade: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text(
                text = "6 Категорий Бизнес-Империи",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(vertical = 4.dp)
            )
        }
        items(state.businesses) { biz ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E24))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = biz.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color.White)
                        Text(text = "Ур. ${biz.level}", fontWeight = FontWeight.SemiBold, color = Color(0xFFF59E0B))
                    }
                    Text(text = biz.description, fontSize = 12.sp, color = Color.LightGray)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Доход/мес: +${formatUsd(biz.monthlyRevenue)}", fontSize = 12.sp, color = Color(0xFF10B981))
                        Text(text = "Оценка: ${formatUsd(biz.valuation)}", fontSize = 12.sp, color = Color.LightGray)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = { onUpgrade(biz.id) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
                    ) {
                        Text("Улучшить компанию (+Выручка)")
                    }
                }
            }
        }
    }
}

@Composable
fun DealershipTab(
    state: com.looxmaksing.simulator.viewmodel.GameUiState,
    onUnlock: () -> Unit,
    onBuyCar: (DealershipCar) -> Unit,
    onRepair: (String, String, Long) -> Unit,
    onSell: (DealershipCar) -> Unit
) {
    if (!state.dealershipUnlocked) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                Icons.Default.DirectionsCar,
                contentDescription = null,
                tint = Color(0xFFF59E0B),
                modifier = Modifier.size(64.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Автомобильный Дилерский Центр",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Покупка подержанных и битых суперкаров, диагностика, ремонт, тюнинг и перепродажа с высокой маржой.",
                color = Color.LightGray,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(20.dp))
            Button(
                onClick = onUnlock,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Text("Купить лицензию за $40,000")
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                Text(
                    text = "Гараж Дилерского Центра (${state.dealershipInventory.size} авто)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color.White
                )
            }
            items(state.dealershipInventory) { car ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E24))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(text = "${car.brand} ${car.model}", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color.White)
                        Text(text = "Мощность: ${car.horsePower} л.с. · 0-100: ${car.zeroToHundred}", fontSize = 12.sp, color = Color.LightGray)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "Состояние двигателя: ${car.conditions.engine}% · Кузов: ${car.conditions.bodywork}%", fontSize = 12.sp)
                        Text(text = "Текущая стоимость продажи: ${formatUsd(car.currentValue)}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF10B981))
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { onRepair(car.id, "engine", 2500L) },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
                            ) {
                                Text("Починить ($2,500)", fontSize = 11.sp)
                            }
                            Button(
                                onClick = { onSell(car) },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                            ) {
                                Text("Продать авто", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Автомобильные Аукционы (Доступно к покупке)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color.White
                )
            }
            items(state.marketCars) { car ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF22222A))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(text = "${car.brand} ${car.model} (${car.year})", fontWeight = FontWeight.Bold, color = Color.White)
                        Text(text = "Цена на аукционе: ${formatUsd(car.boughtPrice)}", color = Color(0xFFF59E0B), fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(6.dp))
                        Button(
                            onClick = { onBuyCar(car) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                        ) {
                            Text("Выкупить лот за ${formatUsd(car.boughtPrice)}")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LuxuryTab(
    state: com.looxmaksing.simulator.viewmodel.GameUiState,
    onBuy: (com.looxmaksing.simulator.model.LuxuryCollectionItem) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text(
                text = "Предметы Роскоши: Суперкары, Джеты и Яхты",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = Color.White
            )
        }
        items(state.luxuryItems) { item ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E24))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = item.name, fontWeight = FontWeight.Bold, color = Color.White)
                        if (item.isOwned) {
                            Text(text = "В ГАРАЖЕ / АНГАРЕ", color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                        } else {
                            Text(text = formatUsd(item.price), color = Color(0xFFF59E0B), fontWeight = FontWeight.Bold)
                        }
                    }
                    Text(text = item.specs, fontSize = 12.sp, color = Color.LightGray)
                    Text(text = "+${item.prestigePoints} очков Mogger Престижа", fontSize = 12.sp, color = Color(0xFFA855F7))
                    Spacer(modifier = Modifier.height(8.dp))
                    if (!item.isOwned) {
                        Button(
                            onClick = { onBuy(item) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                        ) {
                            Text("Купить в коллекцию")
                        }
                    }
                }
            }
        }
    }
}

fun formatUsd(amount: Long): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale.US)
    formatter.maximumFractionDigits = 0
    return formatter.format(amount)
}
