package com.looxmaksing.simulator

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
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
                            text = "Месяц ${state.month}, ${state.year} г.",
                            fontSize = 12.sp,
                            color = Color.LightGray
                        )
                    }
                    Button(
                        onClick = { gameViewModel.advanceMonth() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("След. месяц", fontSize = 12.sp)
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Наличные", fontSize = 11.sp, color = Color.Gray)
                        Text(formatUsd(state.cash), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                    }
                    Column {
                        Text("Капитал (Net Worth)", fontSize = 11.sp, color = Color.Gray)
                        Text(formatUsd(state.netWorth), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFBBF24))
                    }
                    Column {
                        Text("Престиж", fontSize = 11.sp, color = Color.Gray)
                        Text("${state.prestigePoints} pts", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA855F7))
                    }
                }
            }
        }

        // Content
        Box(modifier = Modifier.weight(1f)) {
            when (selectedTab) {
                0 -> LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text("7 Бизнес-Империй (включая Автодилера)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
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
                                    Text(biz.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color.White)
                                    Text("Ур. ${biz.level}", fontWeight = FontWeight.SemiBold, color = Color(0xFFF59E0B))
                                }
                                Text(biz.description, fontSize = 12.sp, color = Color.LightGray)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text("Прибыль: +${formatUsd(biz.monthlyRevenue - biz.monthlyExpenses)}/мес", fontSize = 12.sp, color = Color(0xFF10B981))
                                Spacer(modifier = Modifier.height(8.dp))
                                if (!biz.unlocked) {
                                    Button(
                                        onClick = { gameViewModel.unlockBusiness(biz.id) },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
                                    ) {
                                        Text("Купить бизнес за ${formatUsd(biz.unlockCost)}")
                                    }
                                }
                            }
                        }
                    }
                }
                1 -> LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text("Налоги & Офшоры", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E24))
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text("Налоговое управление", fontWeight = FontWeight.Bold, color = Color.White)
                                Text("Эффективная ставка: ${(state.taxSystem.effectiveTaxRate * 100).toInt()}%", color = Color(0xFF10B981))
                                Text("Налог к уплате: ${formatUsd(state.taxSystem.accumulatedTaxDue)}", color = Color(0xFFF59E0B))
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(
                                    onClick = { gameViewModel.payTaxes() },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                                ) {
                                    Text("Оплатить налоги")
                                }
                            }
                        }
                    }
                }
            }
        }

        // Bottom Navigation (Clean tabs, APK Hub removed)
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
                icon = { Icon(Icons.Default.AccountBalance, contentDescription = "Налоги") },
                label = { Text("Налоги") }
            )
        }
    }
}

fun formatUsd(amount: Long): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale.US)
    formatter.maximumFractionDigits = 0
    return formatter.format(amount)
}
