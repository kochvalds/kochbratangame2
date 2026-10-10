package com.kochvalds.looxmaksing2

class Look(
    val skin: Int, val hair: Int, val top: Int, val bottom: Int,
    val hat: Int = 0, val acc: Int = 0, val glasses: Boolean = false, val muscle: Float = 0f
)

data class Item(val id: String, val slot: String, val name: String, val price: Int, val color: Int, val looks: Float)
data class Weapon(
    val id: String, val name: String, val price: Int, val damage: Float, val rate: Float,
    val spread: Float, val pellets: Int, val range: Float, val ammoPack: Int
)
data class CarType(
    val name: String, val maxSpeed: Float, val accel: Float, val grip: Float,
    val len: Float, val wid: Float, val hgt: Float, val cabin: Float
)
data class Ach(val id: String, val name: String, val desc: String)

object Data {
    val skins = intArrayOf(
        0xFFF3D2B5.toInt(), 0xFFE0AC83.toInt(), 0xFFC68642.toInt(), 0xFF8D5524.toInt(), 0xFF5B3A1E.toInt()
    )
    val hairs = intArrayOf(
        0xFF111111.toInt(), 0xFF4B2E1A.toInt(), 0xFF8A5A2B.toInt(),
        0xFFD8B25A.toInt(), 0xFFB5381F.toInt(), 0xFFC8C8C8.toInt()
    )
    val carColors = intArrayOf(
        0xFFC62828.toInt(), 0xFF1565C0.toInt(), 0xFFECECEC.toInt(), 0xFF212121.toInt(),
        0xFFF9A825.toInt(), 0xFF2E7D32.toInt(), 0xFF6A1B9A.toInt(), 0xFF90A4AE.toInt()
    )

    val items = listOf(
        Item("top_tee", "top", "Белая футболка", 0, 0xFFEEEEEE.toInt(), 0f),
        Item("top_hood", "top", "Чёрное худи", 800, 0xFF222222.toInt(), 1f),
        Item("top_leather", "top", "Кожаная куртка", 2500, 0xFF3B2A20.toInt(), 3f),
        Item("top_suit", "top", "Пиджак", 6000, 0xFF1B2A4A.toInt(), 7f),
        Item("bot_jeans", "bottom", "Джинсы", 0, 0xFF2F4F7F.toInt(), 0f),
        Item("bot_track", "bottom", "Спортивки", 500, 0xFF111111.toInt(), 0.5f),
        Item("bot_pants", "bottom", "Классические брюки", 2000, 0xFF1B1B2A.toInt(), 2f),
        Item("hat_none", "hat", "Без головного убора", 0, 0, 0f),
        Item("hat_cap", "hat", "Кепка", 400, 0xFFCC2222.toInt(), 0.5f),
        Item("hat_beanie", "hat", "Шапка", 300, 0xFF444444.toInt(), 0.5f),
        Item("acc_none", "acc", "Без аксессуара", 0, 0, 0f),
        Item("acc_chain", "acc", "Золотая цепь", 3000, 0xFFFFD700.toInt(), 4f),
        Item("acc_glasses", "acc", "Тёмные очки", 1500, 0xFF000000.toInt(), 2f)
    )

    fun item(id: String): Item = items.firstOrNull { it.id == id } ?: items[0]

    val weapons = listOf(
        Weapon("fist", "Кулаки", 0, 12f, 2.5f, 0f, 1, 2.2f, 0),
        Weapon("pistol", "Пистолет ПМ", 500, 22f, 3f, 0.03f, 1, 60f, 30),
        Weapon("shotgun", "Дробовик", 2000, 12f, 1.1f, 0.12f, 8, 25f, 12),
        Weapon("smg", "Пистолет-пулемёт", 3500, 14f, 9f, 0.05f, 1, 50f, 60),
        Weapon("rifle", "Автомат АК", 6000, 30f, 7f, 0.035f, 1, 110f, 60)
    )

    fun weapon(id: String): Weapon = weapons.firstOrNull { it.id == id } ?: weapons[0]

    // name, maxSpeed(m/s), accel(m/s2), grip, length, width, body height, cabin height
    val cars = listOf(
        CarType("Жигули", 38f, 6.5f, 6.5f, 4.1f, 1.65f, 0.7f, 0.55f),
        CarType("Седан", 52f, 9f, 7.5f, 4.8f, 1.85f, 0.7f, 0.6f),
        CarType("Внедорожник", 46f, 8.5f, 7f, 4.7f, 2.0f, 1.0f, 0.7f),
        CarType("Спорткар", 72f, 15f, 9f, 4.4f, 1.9f, 0.55f, 0.45f),
        CarType("Суперкар", 88f, 19f, 10f, 4.5f, 2.0f, 0.5f, 0.4f)
    )

    val achs = listOf(
        Ach("walk", "Первые шаги", "Пройти 300 м пешком"),
        Ach("drive", "Водила", "Проехать 2 км"),
        Ach("fast", "Скорость", "Разогнаться до 100 км/ч"),
        Ach("rocket", "Ракета", "Разогнаться до 200 км/ч"),
        Ach("rich", "Богач", "Накопить 20 000 ₽"),
        Ach("lvl5", "Пятый уровень", "Достичь 5 уровня"),
        Ach("lvl10", "Десятый уровень", "Достичь 10 уровня"),
        Ach("kills5", "Гопник-хантер", "Победить 5 гопников"),
        Ach("kills30", "Гроза района", "Победить 30 гопников"),
        Ach("looks20", "Луксмаксер", "Лукс 20+"),
        Ach("looks50", "Гигачад", "Лукс 50+"),
        Ach("cars3", "Автолюбитель", "Покататься на 3 разных машинах"),
        Ach("coins50", "Сборщик", "Собрать 50 пачек денег"),
        Ach("armed", "Вооружён", "Купить оружие"),
        Ach("strong", "Качок", "Сила 25+"),
        Ach("banya", "Банный день", "Попариться в бане"),
        Ach("gym", "Качалка", "Потренироваться в спортзале"),
        Ach("shop", "Модник", "Купить одежду"),
        Ach("ach10", "Коллекционер", "Получить 10 достижений")
    )

    val skillNames = listOf("Сила", "Выносливость", "Харизма", "Вождение", "Стрельба")
    val skillDesc = listOf(
        "+урон кулаками, +здоровье", "+энергия, быстрее бег",
        "скидки в магазинах", "выше скорость и управляемость", "точность и урон оружия"
    )
}
