package com.kochvalds.looxmaksing2

import android.content.Context
import java.util.Random
import kotlin.math.*

const val PIF = 3.1415927f
const val TWO_PI = 6.2831855f

interface Ui {
    fun choice(title: String, msg: String, options: List<Pair<String, () -> Unit>>)
}

class Building(val x: Float, val z: Float, val hx: Float, val hz: Float, val h: Float, val color: Int, val kind: Int)

class Car(var x: Float, var z: Float, var heading: Float, val type: CarType, val color: Int) {
    var vx = 0f; var vz = 0f; var steer = 0f; var pitch = 0f; var roll = 0f; var wheel = 0f
    var hp = 100f; var throttle = 0f; var hand = false; var speed = 0f; var occupied = false
}

class Npc(val name: String, val x: Float, val z: Float, val yaw: Float, val look: Look, val pose: Int = 0, val y: Float = 0f)

class Enemy(var x: Float, var z: Float, val look: Look) {
    val homeX = x
    val homeZ = z
    var hp = 60f; var yaw = 0f; var phase = 0f; var dead = 0f; var hitCd = 0f; var aggro = false
}

class Pickup(val x: Float, val z: Float) { var taken = false; var t = 0f }

class Particle(
    var x: Float, var y: Float, var z: Float, var vx: Float, var vy: Float, var vz: Float,
    var life: Float, val max: Float, val size: Float, val color: Int, val grow: Float, val alpha: Float
)

class Spot(val x: Float, val z: Float, val label: String, val action: String)
class Interior(val id: Int, val cx: Float, val cz: Float, val hx: Float, val hz: Float, val floor: Int, val wall: Int)
class Prop(val x: Float, val y: Float, val z: Float, val sx: Float, val sy: Float, val sz: Float, val color: Int)
class Hit(val label: String, val act: () -> Unit)

class Game(private val ctx: Context, private val ui: Ui) {
    companion object {
        const val CELL = 80f
        const val N = 15
        const val W = 1200f
    }

    private val rnd = Random(1337)
    private val prefs = ctx.getSharedPreferences("loox2", Context.MODE_PRIVATE)

    val cells = Array(N * N) { ArrayList<Building>() }
    val specials = ArrayList<Building>()
    val cars = ArrayList<Car>()
    val enemies = ArrayList<Enemy>()
    val pickups = ArrayList<Pickup>()
    val particles = ArrayList<Particle>()
    val interiors = ArrayList<Interior>()
    val propsIn = HashMap<Int, List<Prop>>()
    val npcsIn = HashMap<Int, List<Npc>>()
    val spotsIn = HashMap<Int, List<Spot>>()

    // ---- игрок ----
    var px = 560f; var py = 0f; var pz = 548f; var pvy = 0f; var yaw = 0f
    var walkPhase = 0f; var moving = false; var pose = 0
    var inCar: Car? = null
    var interior = -1
    var lastDoorX = 600f; var lastDoorZ = 625f
    var health = 100f; var energy = 100f
    var money = 1000; var level = 1; var xp = 0; var skillPts = 0
    val skills = IntArray(5)
    var strength = 0f; var endurance = 0f; var looksBase = 1f
    var skin = 1; var hair = 0
    val owned = HashSet<String>()
    val equipped = HashMap<String, String>()
    val weaponsOwned = HashSet<String>()
    val ammo = HashMap<String, Int>()
    var curWeapon = "fist"
    val ach = HashSet<String>()
    var kills = 0; var coins = 0; var distFoot = 0f; var distCar = 0f; var topSpeed = 0f
    val carsDriven = HashSet<String>()
    var playTime = 0f; var gameHour = 9f
    var notice = ""; var noticeT = 0f
    private val noticeQ = ArrayList<String>()
    var prompt = ""
    var actionKind = ""; var actionTimer = 0f; var actionTotal = 1f

    // ---- камера ----
    var camYaw = 0f; var camPitch = 0.3f; var camDist = 5.2f; var lastLookT = -10f
    var eyeX = 0f; var eyeY = 3f; var eyeZ = 0f; var tgtX = 0f; var tgtY = 1.5f; var tgtZ = 0f

    // ---- ввод (пишется из UI-потока) ----
    @Volatile var stickX = 0f
    @Volatile var stickY = 0f
    @Volatile var fire = false
    @Volatile var hand = false
    @Volatile var jumpReq = false
    @Volatile var dialogCount = 0

    private val tmp = FloatArray(2)
    private var cd = 0f
    private var achT = 0f
    private var saveT = 0f

    init {
        genWorld()
        genInteriors()
        load()
    }

    // =====================================================================
    //  Генерация мира
    // =====================================================================
    private fun addB(b: Building) {
        val bx = (b.x / CELL).toInt().coerceIn(0, N - 1)
        val bz = (b.z / CELL).toInt().coerceIn(0, N - 1)
        cells[bx * N + bz].add(b)
        if (b.kind > 0) specials.add(b)
    }

    private fun randLook(): Look {
        val tops = intArrayOf(0xFF8A2A2A.toInt(), 0xFF2A4A8A.toInt(), 0xFF3A3A3A.toInt(), 0xFF5A6A2A.toInt())
        return Look(
            Data.skins[rnd.nextInt(Data.skins.size)], Data.hairs[rnd.nextInt(Data.hairs.size)],
            tops[rnd.nextInt(tops.size)], 0xFF202020.toInt(),
            if (rnd.nextBoolean()) 0xFF222222.toInt() else 0, 0, false, 0.3f
        )
    }

    private fun genWorld() {
        val pal = intArrayOf(
            0xFF9A9A9A.toInt(), 0xFFB5A58A.toInt(), 0xFF8C98A6.toInt(), 0xFFA66B5B.toInt(),
            0xFF7E8F7A.toInt(), 0xFFC9C2B2.toInt(), 0xFF6F7C91.toInt()
        )
        for (bx in 0 until N) for (bz in 0 until N) {
            val cx = bx * CELL
            val cz = bz * CELL
            val sp = when {
                bx == 7 && bz == 7 -> 1
                bx == 6 && bz == 6 -> 2
                bx == 8 && bz == 6 -> 3
                bx == 6 && bz == 7 -> 4
                else -> 0
            }
            if (sp > 0) {
                val col = when (sp) {
                    1 -> 0xFF8B5A2B.toInt()
                    2 -> 0xFF3A3A3F.toInt()
                    3 -> 0xFF7B2D8E.toInt()
                    else -> 0xFF2F4F2F.toInt()
                }
                addB(Building(cx + 40f, cz + 40f, 22f, 22f, 12f, col, sp))
                continue
            }
            if (rnd.nextFloat() < 0.08f) continue
            val dc = hypot(bx - 7f, bz - 7f)
            for (i in 0..1) for (j in 0..1) {
                if (rnd.nextFloat() < 0.12f) continue
                val hx = 10f + rnd.nextFloat() * 4f
                val hz = 10f + rnd.nextFloat() * 4f
                val h = 9f + rnd.nextFloat() * (12f + max(0f, 7f - dc) * 9f)
                addB(Building(cx + 23f + i * 34f, cz + 23f + j * 34f, hx, hz, h, pal[rnd.nextInt(pal.size)], 0))
            }
        }

        // стартовая машина рядом со спавном
        cars.add(Car(556.5f, 585f, 0f, Data.cars[1], Data.carColors[0]))
        repeat(70) {
            val alongZ = rnd.nextBoolean()
            val line = (1 + rnd.nextInt(N - 1)) * CELL
            val s = 20f + rnd.nextFloat() * (W - 40f)
            val md = abs(((s + 40f) % 80f) - 40f)
            if (md < 12f) return@repeat
            val lane = if (rnd.nextBoolean()) 3.5f else -3.5f
            val r = rnd.nextFloat()
            val ti = if (r < 0.35f) 0 else if (r < 0.65f) 1 else if (r < 0.8f) 2 else if (r < 0.93f) 3 else 4
            val col = Data.carColors[rnd.nextInt(Data.carColors.size)]
            if (alongZ) cars.add(Car(line + lane, s, if (lane > 0f) PIF else 0f, Data.cars[ti], col))
            else cars.add(Car(s, line + lane, if (lane > 0f) PIF / 2f else -PIF / 2f, Data.cars[ti], col))
        }

        repeat(40) {
            val x = Math.round((40f + rnd.nextFloat() * (W - 80f)) / CELL) * CELL + 8f
            val z = 40f + rnd.nextFloat() * (W - 80f)
            if (hypot(x - 560f, z - 560f) < 90f) return@repeat
            enemies.add(Enemy(x, z, randLook()))
        }
        repeat(160) {
            val alongZ = rnd.nextBoolean()
            val line = (1 + rnd.nextInt(N - 1)) * CELL + (rnd.nextFloat() - 0.5f) * 8f
            val s = 20f + rnd.nextFloat() * (W - 40f)
            pickups.add(if (alongZ) Pickup(line, s) else Pickup(s, line))
        }
    }

    private fun walls(cx: Float, cz: Float, hx: Float, hz: Float, wall: Int, out: ArrayList<Prop>) {
        out.add(Prop(cx, 0f, cz - hz - 0.25f, hx * 2f + 1f, 3.5f, 0.5f, wall))
        out.add(Prop(cx - hx - 0.25f, 0f, cz, 0.5f, 3.5f, hz * 2f, wall))
        out.add(Prop(cx + hx + 0.25f, 0f, cz, 0.5f, 3.5f, hz * 2f, wall))
        out.add(Prop(cx - hx / 2f - 0.75f, 0f, cz + hz + 0.25f, hx - 1.5f, 3.5f, 0.5f, wall))
        out.add(Prop(cx + hx / 2f + 0.75f, 0f, cz + hz + 0.25f, hx - 1.5f, 3.5f, 0.5f, wall))
    }

    private fun genInteriors() {
        // ---- БАНЯ ----
        val b = Interior(0, 3000f, 3000f, 11f, 8f, 0xFF8A5E34.toInt(), 0xFF6B4423.toInt())
        interiors.add(b)
        val bp = ArrayList<Prop>()
        walls(b.cx, b.cz, b.hx, b.hz, b.wall, bp)
        bp.add(Prop(b.cx, 0f, b.cz - b.hz + 1.3f, b.hx * 2f - 6f, 1.0f, 2.6f, 0xFFA9744A.toInt()))
        bp.add(Prop(b.cx, 0f, b.cz - b.hz + 3.3f, b.hx * 2f - 6f, 0.5f, 1.4f, 0xFF96663E.toInt()))
        bp.add(Prop(b.cx + b.hx - 2f, 0f, b.cz - b.hz + 2f, 2.4f, 1.3f, 2.4f, 0xFF4A4A4F.toInt()))
        bp.add(Prop(b.cx + b.hx - 2f, 1.3f, b.cz - b.hz + 2f, 1.6f, 0.4f, 1.6f, 0xFFFF6A1F.toInt()))
        bp.add(Prop(b.cx - b.hx + 1.5f, 0f, b.cz + 3f, 1f, 0.7f, 1f, 0xFF3A6EA5.toInt()))
        bp.add(Prop(b.cx - b.hx + 1.5f, 0f, b.cz + 5f, 1f, 0.7f, 1f, 0xFF3A6EA5.toInt()))
        propsIn[0] = bp
        val towel = 0xFFEFEFEF.toInt()
        npcsIn[0] = listOf(
            Npc("Дядя Миша", b.cx + 5f, b.cz + 2f, -PIF / 2f,
                Look(Data.skins[0], Data.hairs[5], 0xFFEFEFEF.toInt(), 0xFFB59A6A.toInt(), 0xFFD0C0A0.toInt()), 0),
            Npc("Колян", b.cx - 5f, b.cz - b.hz + 3.3f, 0f,
                Look(Data.skins[1], Data.hairs[0], Data.skins[1], towel), 1, 0.5f),
            Npc("Кочбратан", b.cx - 2f, b.cz + 1.5f, 0f,
                Look(Data.skins[2], Data.hairs[0], Data.skins[2], towel, 0, 0xFFFFD700.toInt(), true, 0.9f), 0)
        )
        spotsIn[0] = listOf(
            Spot(b.cx, b.cz - b.hz + 5.2f, "Парилка: лечь на полок", "steam"),
            Spot(b.cx, b.cz + b.hz - 0.8f, "Выйти на улицу", "exit")
        )

        // ---- СПОРТЗАЛ ----
        val g = Interior(1, 3000f, 3100f, 12f, 9f, 0xFF2E2E33.toInt(), 0xFF4A4F5C.toInt())
        interiors.add(g)
        val gp = ArrayList<Prop>()
        walls(g.cx, g.cz, g.hx, g.hz, g.wall, gp)
        gp.add(Prop(g.cx, 0.4f, g.cz - g.hz + 0.15f, 12f, 2.6f, 0.1f, 0xFFA8D4E6.toInt()))
        gp.add(Prop(g.cx - 6f, 0f, g.cz - 2f, 1.2f, 0.5f, 2.6f, 0xFF222222.toInt()))
        gp.add(Prop(g.cx - 6f, 1.3f, g.cz - 2f, 3.2f, 0.1f, 0.1f, 0xFFB0B0B0.toInt()))
        gp.add(Prop(g.cx - 7.4f, 1.0f, g.cz - 2f, 0.2f, 0.7f, 0.7f, 0xFF111111.toInt()))
        gp.add(Prop(g.cx - 4.6f, 1.0f, g.cz - 2f, 0.2f, 0.7f, 0.7f, 0xFF111111.toInt()))
        gp.add(Prop(g.cx + 6f, 0f, g.cz - 2f, 1.2f, 0.5f, 2.4f, 0xFF111118.toInt()))
        gp.add(Prop(g.cx + 6f, 0.5f, g.cz - 3.1f, 1.0f, 1.0f, 0.2f, 0xFF2255AA.toInt()))
        gp.add(Prop(g.cx + 9f, 0f, g.cz + 3f, 2.5f, 0.9f, 0.8f, 0xFF777777.toInt()))
        propsIn[1] = gp
        npcsIn[1] = listOf(
            Npc("Тренер Серёга", g.cx + 2f, g.cz + 3f, PIF,
                Look(Data.skins[1], Data.hairs[1], 0xFFCC2222.toInt(), 0xFF111111.toInt(), 0, 0, false, 1f), 0)
        )
        spotsIn[1] = listOf(
            Spot(g.cx - 6f, g.cz + 0.3f, "Жим лёжа", "bench"),
            Spot(g.cx + 6f, g.cz + 0.3f, "Беговая дорожка", "run"),
            Spot(g.cx, g.cz - g.hz + 2.2f, "Зеркало: позирование и мьюинг", "mirror"),
            Spot(g.cx, g.cz + g.hz - 0.8f, "Выйти на улицу", "exit")
        )
    }

    // =====================================================================
    //  Вспомогательное
    // =====================================================================
    private fun angDiff(a: Float, b: Float): Float {
        var d = (b - a) % TWO_PI
        if (d > PIF) d -= TWO_PI
        if (d < -PIF) d += TWO_PI
        return d
    }

    fun maxHealth() = 100f + skills[0] * 8f
    fun maxEnergy() = 100f + endurance * 1.5f + skills[1] * 8f
    fun muscle() = (strength / 60f).coerceIn(0f, 1f)
    fun xpNeed() = (70f * level * sqrt(level.toFloat())).toInt()
    fun looks(): Float {
        var l = looksBase
        for ((_, id) in equipped) l += Data.item(id).looks
        return l
    }

    fun price(p: Int): Int = (p * (1f - 0.02f * skills[2]).coerceAtLeast(0.7f)).toInt()

    private fun pay(p: Int): Boolean {
        val c = price(p)
        if (money >= c) { money -= c; return true }
        note("Не хватает денег")
        return false
    }

    fun note(s: String) { noticeQ.add(s) }

    private fun addXp(n: Int) {
        xp += n
        while (xp >= xpNeed()) {
            xp -= xpNeed()
            level++
            skillPts += 2
            health = maxHealth()
            note("Уровень $level! +2 очка прокачки")
        }
    }

    private fun give(id: String) {
        if (ach.add(id)) {
            val a = Data.achs.firstOrNull { it.id == id }
            note("Достижение: ${a?.name ?: id}")
            addXp(60)
        }
    }

    private fun checkAch() {
        if (distFoot >= 300f) give("walk")
        if (distCar >= 2000f) give("drive")
        if (topSpeed >= 27.8f) give("fast")
        if (topSpeed >= 55.5f) give("rocket")
        if (money >= 20000) give("rich")
        if (level >= 5) give("lvl5")
        if (level >= 10) give("lvl10")
        if (kills >= 5) give("kills5")
        if (kills >= 30) give("kills30")
        if (looks() >= 20f) give("looks20")
        if (looks() >= 50f) give("looks50")
        if (carsDriven.size >= 3) give("cars3")
        if (coins >= 50) give("coins50")
        if (weaponsOwned.size >= 2) give("armed")
        if (strength >= 25f) give("strong")
        if (ach.size >= 10) give("ach10")
    }

    fun playerLook(): Look {
        val top = Data.item(equipped["top"] ?: "top_tee")
        val bot = Data.item(equipped["bottom"] ?: "bot_jeans")
        val hat = Data.item(equipped["hat"] ?: "hat_none")
        val acc = Data.item(equipped["acc"] ?: "acc_none")
        return Look(
            Data.skins[skin], Data.hairs[hair], top.color, bot.color, hat.color,
            if (acc.id == "acc_chain") acc.color else 0, acc.id == "acc_glasses", muscle()
        )
    }

    // ---- столкновения ----
    private fun pushOut(r: Float): Boolean {
        var hit = false
        val bx = (tmp[0] / CELL).toInt()
        val bz = (tmp[1] / CELL).toInt()
        for (i in bx - 1..bx + 1) for (j in bz - 1..bz + 1) {
            if (i < 0 || j < 0 || i >= N || j >= N) continue
            for (b in cells[i * N + j]) {
                val qx = tmp[0].coerceIn(b.x - b.hx, b.x + b.hx)
                val qz = tmp[1].coerceIn(b.z - b.hz, b.z + b.hz)
                val dx = tmp[0] - qx
                val dz = tmp[1] - qz
                val d2 = dx * dx + dz * dz
                if (d2 < r * r) {
                    if (d2 > 1e-6f) {
                        val d = sqrt(d2)
                        tmp[0] = qx + dx / d * r
                        tmp[1] = qz + dz / d * r
                    } else {
                        val l = tmp[0] - (b.x - b.hx)
                        val rr = (b.x + b.hx) - tmp[0]
                        val t = tmp[1] - (b.z - b.hz)
                        val bt = (b.z + b.hz) - tmp[1]
                        val m = minOf(minOf(l, rr), minOf(t, bt))
                        if (m == l) tmp[0] = b.x - b.hx - r
                        else if (m == rr) tmp[0] = b.x + b.hx + r
                        else if (m == t) tmp[1] = b.z - b.hz - r
                        else tmp[1] = b.z + b.hz + r
                    }
                    hit = true
                }
            }
        }
        return hit
    }

    private fun inBuilding(x: Float, z: Float): Boolean {
        val bx = (x / CELL).toInt()
        val bz = (z / CELL).toInt()
        for (i in bx - 1..bx + 1) for (j in bz - 1..bz + 1) {
            if (i < 0 || j < 0 || i >= N || j >= N) continue
            for (b in cells[i * N + j]) {
                if (abs(x - b.x) < b.hx && abs(z - b.z) < b.hz) return true
            }
        }
        return false
    }

    private fun addP(
        x: Float, y: Float, z: Float, vx: Float, vy: Float, vz: Float,
        life: Float, size: Float, color: Int, grow: Float, alpha: Float
    ) {
        if (particles.size > 450) return
        particles.add(Particle(x, y, z, vx, vy, vz, life, life, size, color, grow, alpha))
    }

    private fun spawnSteam(dt: Float, rate: Float) {
        if (interior != 0) return
        val I = interiors[0]
        val n = (rate * dt + rnd.nextFloat()).toInt()
        for (i in 0 until n) {
            addP(
                I.cx + I.hx - 2f + (rnd.nextFloat() - 0.5f) * 1.2f, 1.8f,
                I.cz - I.hz + 2f + (rnd.nextFloat() - 0.5f) * 1.2f,
                -(0.3f + rnd.nextFloat() * 0.9f), 0.5f + rnd.nextFloat() * 0.8f, (rnd.nextFloat() - 0.3f) * 0.8f,
                3f + rnd.nextFloat() * 2.5f, 0.6f + rnd.nextFloat() * 0.5f, 0xFFFFFFFF.toInt(), 0.5f, 0.28f
            )
        }
    }

    // =====================================================================
    //  Главный апдейт
    // =====================================================================
    @Synchronized
    fun update(dtRaw: Float) {
        if (dialogCount > 0) return
        val dt = min(dtRaw, 0.05f)
        playTime += dt
        gameHour = (gameHour + dt / 50f) % 24f
        if (noticeT > 0f) noticeT -= dt
        else if (noticeQ.isNotEmpty()) { notice = noticeQ.removeAt(0); noticeT = 3.2f }

        if (actionTimer > 0f) updateAction(dt)
        else if (inCar != null) updateDriving(dt)
        else updateFoot(dt)

        for (c in cars) { if (!c.occupied) stepCar(c, 0f, dt) }
        updateEnemies(dt)
        updateCombat(dt)
        updatePickups(dt)
        updateParticles(dt)
        if (interior == 0) spawnSteam(dt, 9f)
        if (health < maxHealth()) health = min(maxHealth(), health + 0.4f * dt)

        achT += dt
        if (achT > 1f) { achT = 0f; checkAch() }
        saveT += dt
        if (saveT > 30f) { saveT = 0f; save() }

        prompt = findInteract()?.label ?: ""
        jumpReq = false
        updateCamera(dt)
    }

    private fun updateCamera(dt: Float) {
        val c = inCar
        if (c != null && playTime - lastLookT > 2f && abs(c.speed) > 2f) {
            val target = if (c.speed >= 0f) c.heading else c.heading + PIF
            camYaw += angDiff(camYaw, target) * min(1f, dt * 2.2f)
        }
        if (interior >= 0 && actionKind == "steam" && actionTimer > 0f) {
            camYaw += angDiff(camYaw, PIF) * min(1f, dt * 2f)
        }
        val td = if (interior >= 0) 9.5f else if (c != null) 8.5f + abs(c.speed) * 0.06f else 5.2f
        val tp = if (interior >= 0) 0.9f else if (c != null) 0.28f else 0.32f
        camDist += (td - camDist) * min(1f, dt * 3f)
        camPitch += (tp - camPitch) * min(1f, dt * 3f)
        val tx: Float; val ty: Float; val tz: Float
        if (c != null) { tx = c.x; ty = 1.3f; tz = c.z } else { tx = px; ty = py + 1.4f; tz = pz }
        var d = camDist
        var ex = 0f; var ez = 0f
        for (k in 0 until 8) {
            ex = tx - sin(camYaw) * cos(camPitch) * d
            ez = tz - cos(camYaw) * cos(camPitch) * d
            if (interior < 0 && inBuilding(ex, ez) && d > 1.6f) d -= 0.7f else break
        }
        eyeX = ex; eyeZ = ez
        eyeY = max(0.7f, ty + sin(camPitch) * d)
        tgtX = tx; tgtY = ty; tgtZ = tz
    }

    @Synchronized
    fun addLook(dx: Float) {
        camYaw -= dx
        lastLookT = playTime
    }

    // =====================================================================
    //  Пешком
    // =====================================================================
    private fun updateFoot(dt: Float) {
        val sx = stickX
        val sy = stickY
        val mag = min(1f, hypot(sx, sy))
        val fx = sin(camYaw)
        val fz = cos(camYaw)
        var dx = fx * sy + (-fz) * sx
        var dz = fz * sy + fx * sx
        val len = hypot(dx, dz)
        moving = mag > 0.12f && len > 0.001f
        val run = mag > 0.85f && energy > 4f
        if (moving) {
            dx /= len; dz /= len
            val spd = if (run) 6.2f * (1f + 0.02f * skills[1]) else 3.0f
            yaw += angDiff(yaw, atan2(dx, dz)) * min(1f, dt * 12f)
            tmp[0] = px + dx * spd * dt
            tmp[1] = pz + dz * spd * dt
            if (interior < 0) {
                pushOut(0.45f)
                tmp[0] = tmp[0].coerceIn(2f, W - 2f)
                tmp[1] = tmp[1].coerceIn(2f, W - 2f)
            } else {
                val I = interiors[interior]
                tmp[0] = tmp[0].coerceIn(I.cx - I.hx + 0.6f, I.cx + I.hx - 0.6f)
                tmp[1] = tmp[1].coerceIn(I.cz - I.hz + 0.6f, I.cz + I.hz - 0.6f)
            }
            distFoot += hypot(tmp[0] - px, tmp[1] - pz)
            px = tmp[0]; pz = tmp[1]
            walkPhase += spd * dt * 1.7f
            if (run) energy = max(0f, energy - 7f * dt) else energy = min(maxEnergy(), energy + 3f * dt)
        } else {
            energy = min(maxEnergy(), energy + 6f * dt)
        }
        if (jumpReq && py <= 0.001f) pvy = 5.5f
        if (py > 0f || pvy > 0f) {
            py += pvy * dt
            pvy -= 15f * dt
            if (py <= 0f) { py = 0f; pvy = 0f }
        }
        if (health <= 0f) die()
    }

    private fun die() {
        health = maxHealth()
        money = (money * 0.9f).toInt()
        inCar?.let { it.occupied = false }
        inCar = null
        interior = -1
        px = 560f; pz = 548f; py = 0f
        actionTimer = 0f; pose = 0
        note("Тебя вырубили. Очнулся в больнице (-10% денег)")
    }

    // =====================================================================
    //  Физика машины
    // =====================================================================
    private fun stepCar(c: Car, steerIn: Float, dt: Float) {
        val t = c.type
        if (!c.occupied && c.vx * c.vx + c.vz * c.vz < 0.0004f) {
            c.vx = 0f; c.vz = 0f; c.speed = 0f
            return
        }
        val drv = 1f + 0.02f * skills[3]
        var fx = sin(c.heading)
        var fz = cos(c.heading)
        var vF = c.vx * fx + c.vz * fz

        // руление (велосипедная модель)
        val maxSteer = 0.55f / (1f + abs(vF) * 0.06f)
        c.steer += (-steerIn * maxSteer - c.steer) * min(1f, dt * 7f)
        c.heading += vF / (t.len * 0.62f) * tan(c.steer) * dt

        fx = sin(c.heading)
        fz = cos(c.heading)
        val rx = -fz
        val rz = fx
        vF = c.vx * fx + c.vz * fz
        var vR = c.vx * rx + c.vz * rz
        val oldVF = vF
        val maxV = t.maxSpeed * drv
        val th = if (c.occupied && c.hp > 0f) c.throttle else 0f

        if (th > 0.05f) {
            vF += if (vF < -0.5f) 28f * dt
            else t.accel * drv * th * max(0f, 1f - (vF / maxV) * (vF / maxV)) * dt
        } else if (th < -0.05f) {
            vF += if (vF > 0.5f) -30f * (-th) * dt else t.accel * 0.5f * th * dt
            if (vF < -10f) vF = -10f
        }
        val rr = if (!c.occupied) 8f else if (abs(th) < 0.05f) 3.5f else 0.6f
        vF -= sign(vF) * min(abs(vF), rr * dt)
        vF -= vF * abs(vF) * 0.0012f * dt
        val hb = c.hand && c.occupied
        if (hb) vF -= sign(vF) * min(abs(vF), 18f * dt)
        // боковое сцепление: ручник уменьшает его -> дрифт
        vR *= exp(-t.grip * (if (hb) 0.15f else 1f) * dt)

        c.vx = fx * vF + rx * vR
        c.vz = fz * vF + rz * vR
        c.x += c.vx * dt
        c.z += c.vz * dt
        c.speed = vF

        // подвеска (крен и клевки)
        val acc = (vF - oldVF) / max(dt, 0.001f)
        c.pitch += ((-acc * 0.004f).coerceIn(-0.12f, 0.12f) - c.pitch) * min(1f, dt * 6f)
        c.roll += ((c.steer * vF * 0.006f).coerceIn(-0.14f, 0.14f) - c.roll) * min(1f, dt * 6f)
        c.wheel += vF * dt / 0.33f

        // столкновения со зданиями (3 круга вдоль кузова)
        val half = t.len * 0.32f
        val rad = t.wid * 0.5f + 0.2f
        var hit = false
        for (k in -1..1) {
            val ox = c.x + fx * half * k
            val oz = c.z + fz * half * k
            tmp[0] = ox; tmp[1] = oz
            if (pushOut(rad)) { c.x += tmp[0] - ox; c.z += tmp[1] - oz; hit = true }
        }
        if (hit) {
            val imp = abs(vF)
            if (imp > 3f) {
                c.hp = max(0f, c.hp - imp * 0.9f)
                if (c.occupied && imp > 14f) health -= (imp - 14f) * 1.2f
                for (i in 0 until 5) addP(c.x, 0.8f, c.z, (rnd.nextFloat() - 0.5f) * 4f, rnd.nextFloat() * 3f,
                    (rnd.nextFloat() - 0.5f) * 4f, 0.5f, 0.15f, 0xFFFFC040.toInt(), 0f, 1f)
            }
            c.vx *= 0.55f; c.vz *= 0.55f
        }
        c.x = c.x.coerceIn(3f, W - 3f)
        c.z = c.z.coerceIn(3f, W - 3f)

        if (c.hp < 35f && rnd.nextFloat() < dt * 8f)
            addP(c.x + fx * t.len * 0.4f, 1f, c.z + fz * t.len * 0.4f, 0f, 1.2f, 0f, 1.6f, 0.4f, 0xFF444444.toInt(), 0.6f, 0.5f)
        if (hb && abs(vF) > 8f && rnd.nextFloat() < dt * 25f)
            addP(c.x - fx * t.len * 0.35f, 0.2f, c.z - fz * t.len * 0.35f, 0f, 0.5f, 0f, 1f, 0.5f, 0xFFDDDDDD.toInt(), 0.8f, 0.4f)
    }

    private fun updateDriving(dt: Float) {
        val c = inCar ?: return
        c.throttle = stickY
        c.hand = hand
        stepCar(c, stickX, dt)
        px = c.x; pz = c.z; py = 0f
        distCar += abs(c.speed) * dt
        topSpeed = max(topSpeed, abs(c.speed))
        for (o in cars) {
            if (o === c) continue
            val dx = c.x - o.x
            val dz = c.z - o.z
            val d2 = dx * dx + dz * dz
            if (d2 < 4.4f * 4.4f && d2 > 1e-4f) {
                val d = sqrt(d2)
                val nx = dx / d; val nz = dz / d
                val ov = 4.4f - d
                c.x += nx * ov * 0.5f; c.z += nz * ov * 0.5f
                o.x -= nx * ov * 0.5f; o.z -= nz * ov * 0.5f
                val vrel = (c.vx - o.vx) * nx + (c.vz - o.vz) * nz
                if (vrel < 0f) {
                    c.vx -= nx * vrel * 0.6f; c.vz -= nz * vrel * 0.6f
                    o.vx += nx * vrel * 0.6f; o.vz += nz * vrel * 0.6f
                    c.hp = max(0f, c.hp + vrel * 0.8f)
                    o.hp = max(0f, o.hp + vrel * 0.8f)
                    if (-vrel > 12f) health -= (-vrel - 12f)
                }
            }
        }
        if (health <= 0f) die()
    }

    private fun enterCar(c: Car) {
        inCar = c
        c.occupied = true
        carsDriven.add(c.type.name)
        camYaw = c.heading
        pose = 0
        note("${c.type.name}: ${(c.type.maxSpeed * 3.6f).toInt()} км/ч макс.")
    }

    private fun exitCar() {
        val c = inCar ?: return
        c.occupied = false
        c.throttle = 0f
        c.hand = true
        val side = c.type.wid / 2f + 0.9f
        tmp[0] = c.x + cos(c.heading) * side
        tmp[1] = c.z - sin(c.heading) * side
        pushOut(0.5f)
        px = tmp[0]; pz = tmp[1]; py = 0f
        inCar = null
    }

    // =====================================================================
    //  Враги, бой, подбираемое, частицы
    // =====================================================================
    private fun damageEnemy(e: Enemy, dmg: Float) {
        if (e.dead > 0f) return
        e.hp -= dmg
        e.aggro = true
        for (i in 0 until 4) addP(e.x, 1.2f, e.z, (rnd.nextFloat() - 0.5f) * 3f, rnd.nextFloat() * 2f,
            (rnd.nextFloat() - 0.5f) * 3f, 0.5f, 0.14f, 0xFFB02020.toInt(), 0f, 1f)
        if (e.hp <= 0f) {
            e.dead = 10f
            kills++
            val m = 40 + rnd.nextInt(80)
            money += m
            addXp(40)
            note("Гопник повержен: +${m}₽")
        }
    }

    private fun updateEnemies(dt: Float) {
        for (e in enemies) {
            if (e.dead > 0f) {
                e.dead -= dt
                if (e.dead <= 0f) { e.hp = 60f; e.x = e.homeX; e.z = e.homeZ; e.aggro = false }
                continue
            }
            e.hitCd -= dt
            val dx = px - e.x
            val dz = pz - e.z
            val d = hypot(dx, dz)
            val chase = interior < 0 && inCar == null && (d < 28f || (e.aggro && d < 60f))
            if (chase) {
                if (d > 1.1f) {
                    tmp[0] = e.x + dx / d * 3.6f * dt
                    tmp[1] = e.z + dz / d * 3.6f * dt
                    pushOut(0.4f)
                    e.x = tmp[0]; e.z = tmp[1]
                    e.phase += dt * 6f
                } else if (e.hitCd <= 0f) {
                    e.hitCd = 1f
                    health -= 8f
                }
                e.yaw = atan2(dx, dz)
            }
            val c = inCar
            if (c != null && abs(c.speed) > 7f && hypot(c.x - e.x, c.z - e.z) < 2.4f) damageEnemy(e, abs(c.speed) * 5f)
        }
    }

    private fun blocked(dx: Float, dz: Float, dist: Float): Boolean {
        var s = 1f
        while (s < dist) {
            if (inBuilding(px + dx * s, pz + dz * s)) return true
            s += 1f
        }
        return false
    }

    private fun updateCombat(dt: Float) {
        cd -= dt
        if (!fire || cd > 0f || inCar != null || actionTimer > 0f) return
        val w = Data.weapon(curWeapon)
        if (w.id != "fist") {
            val a = ammo[w.id] ?: 0
            if (a <= 0) { note("Нет патронов!"); cd = 1f; return }
            ammo[w.id] = a - 1
        }
        cd = 1f / w.rate
        yaw = camYaw
        if (w.id != "fist") {
            addP(px + sin(yaw) * 0.8f, py + 1.3f, pz + cos(yaw) * 0.8f, 0f, 0f, 0f, 0.07f, 0.3f, 0xFFFFE070.toInt(), 0f, 1f)
        }
        val dmgMul = if (w.id == "fist") 1f + 0.05f * skills[0] + strength * 0.01f else 1f + 0.04f * skills[4]
        for (p in 0 until w.pellets) {
            val ang = camYaw + (rnd.nextFloat() - 0.5f) * 2f * w.spread * max(0.3f, 1f - 0.03f * skills[4])
            val dx = sin(ang)
            val dz = cos(ang)
            var best: Enemy? = null
            var bestT = w.range
            for (e in enemies) {
                if (e.dead > 0f) continue
                val ex = e.x - px
                val ez = e.z - pz
                val along = ex * dx + ez * dz
                if (along > 0f && along < bestT) {
                    val perp = abs(ex * dz - ez * dx)
                    if (perp < 0.6f) { bestT = along; best = e }
                }
            }
            val target = best
            if (target != null && !blocked(dx, dz, bestT)) damageEnemy(target, w.damage * dmgMul)
        }
    }

    private fun updatePickups(dt: Float) {
        for (p in pickups) {
            if (p.taken) {
                p.t -= dt
                if (p.t <= 0f) p.taken = false
            } else if (interior < 0 && abs(px - p.x) < 2.2f && abs(pz - p.z) < 2.2f) {
                p.taken = true
                p.t = 90f
                val m = 50 + rnd.nextInt(60)
                money += m
                coins++
                addXp(3)
            }
        }
    }

    private fun updateParticles(dt: Float) {
        var i = 0
        while (i < particles.size) {
            val p = particles[i]
            p.life -= dt
            if (p.life <= 0f) {
                particles.removeAt(i)
            } else {
                p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt
                i++
            }
        }
    }

    // =====================================================================
    //  Действия (парилка, тренировки)
    // =====================================================================
    private fun startAction(kind: String) {
        if (interior < 0) return
        val I = interiors[interior]
        when (kind) {
            "steam" -> {
                if (!pay(150)) return
                px = I.cx; pz = I.cz - I.hz + 1.3f; py = 1.0f; yaw = 0f
                pose = 1; actionTotal = 10f
            }
            "bench" -> {
                if (!gymOk()) return
                px = I.cx - 6f; pz = I.cz - 2f; yaw = 0f
                pose = 2; actionTotal = 7f
            }
            "run" -> {
                if (!gymOk()) return
                px = I.cx + 6f; pz = I.cz - 2f; yaw = 0f
                pose = 0; actionTotal = 7f
            }
            "mirror" -> {
                px = I.cx; pz = I.cz - I.hz + 2.2f; yaw = PIF
                pose = 4; actionTotal = 4f
            }
            else -> return
        }
        actionKind = kind
        actionTimer = actionTotal
        moving = false
    }

    private fun gymOk(): Boolean {
        if (energy < 25f) { note("Нет сил. Выпей пива у банщика или отдохни."); return false }
        if (!pay(50)) return false
        energy -= 25f
        return true
    }

    private fun updateAction(dt: Float) {
        actionTimer -= dt
        when (actionKind) {
            "steam" -> {
                spawnSteam(dt, 140f)
                health = min(maxHealth(), health + 6f * dt)
            }
            "run" -> { moving = true; walkPhase += dt * 16f }
        }
        if (actionTimer <= 0f) finishAction()
    }

    private fun finishAction() {
        val kind = actionKind
        actionKind = ""
        actionTimer = 0f
        moving = false
        pose = 0
        py = 0f
        pvy = 0f
        when (kind) {
            "steam" -> {
                looksBase += 0.6f
                health = maxHealth()
                energy = maxEnergy()
                addXp(60)
                give("banya")
                val I = interiors[0]
                pz = I.cz - I.hz + 5.2f
                note("Выпарился! Лукс +0.6, здоровье и энергия полные")
            }
            "bench" -> {
                strength += 0.6f * (1f + 0.05f * skills[0])
                looksBase += 0.2f
                addXp(25)
                give("gym")
                note("Жим лёжа: сила +0.6, лукс +0.2")
            }
            "run" -> {
                endurance += 0.6f
                looksBase += 0.1f
                addXp(25)
                give("gym")
                note("Бег: выносливость +0.6")
            }
            "mirror" -> {
                looksBase += 0.15f
                addXp(10)
                note("Мьюинг у зеркала: лукс +0.15")
            }
        }
    }

    // =====================================================================
    //  Взаимодействие
    // =====================================================================
    private fun findInteract(): Hit? {
        if (actionTimer > 0f) return null
        if (inCar != null) return Hit("Выйти из машины") { exitCar() }
        if (interior >= 0) {
            for (s in spotsIn[interior] ?: emptyList()) {
                if (hypot(px - s.x, pz - s.z) < 2.2f) return Hit(s.label) { doSpot(s) }
            }
            for (n in npcsIn[interior] ?: emptyList()) {
                if (hypot(px - n.x, pz - n.z) < 2.5f) return Hit("Поговорить: ${n.name}") { talk(n) }
            }
            return null
        }
        var best: Car? = null
        var bd = 3.8f
        for (c in cars) {
            val d = hypot(px - c.x, pz - c.z)
            if (d < bd) { bd = d; best = c }
        }
        val bc = best
        if (bc != null) return Hit("Сесть: ${bc.type.name}") { enterCar(bc) }
        for (b in specials) {
            if (hypot(px - b.x, pz - (b.z + b.hz + 3f)) < 4.5f) {
                val name = when (b.kind) {
                    1 -> "Войти в баню «Парок»"
                    2 -> "Войти в спортзал «Железо»"
                    3 -> "Магазин одежды «Лукс»"
                    else -> "Оружейный «Калибр»"
                }
                return Hit(name) { enterBuilding(b) }
            }
        }
        return null
    }

    @Synchronized
    fun interact() {
        findInteract()?.act?.invoke()
    }

    private fun enterBuilding(b: Building) {
        lastDoorX = px; lastDoorZ = pz
        when (b.kind) {
            1 -> enterInterior(0)
            2 -> enterInterior(1)
            3 -> shopMenu()
            else -> gunShop()
        }
    }

    private fun enterInterior(i: Int) {
        val I = interiors[i]
        interior = i
        px = I.cx; pz = I.cz + I.hz - 3.5f; py = 0f
        yaw = PIF; camYaw = PIF
        particles.clear()
    }

    private fun exitInterior() {
        interior = -1
        px = lastDoorX; pz = lastDoorZ + 1f; py = 0f
        yaw = 0f; camYaw = 0f
        particles.clear()
    }

    private fun doSpot(s: Spot) {
        when (s.action) {
            "exit" -> exitInterior()
            "steam" -> say(
                "Парилка", "Лечь на верхний полок? Веник, пар, лукс. Стоит ${price(150)}₽.",
                opt("Париться!") { startAction("steam") }, opt("Не сейчас") {}
            )
            else -> startAction(s.action)
        }
    }

    // =====================================================================
    //  Диалоги и меню
    // =====================================================================
    private fun opt(l: String, f: () -> Unit): Pair<String, () -> Unit> = Pair(l, f)

    private fun say(title: String, msg: String, vararg o: Pair<String, () -> Unit>) {
        ui.choice(title, msg, o.toList())
    }

    private fun talk(n: Npc) {
        when (n.name) {
            "Дядя Миша" -> {
                val l = listOf(
                    "Парок — это не просто пар, а философия, брат.",
                    "Веник дубовый, пар лёгкий — лукс растёт сам.",
                    "Не ныряй сразу в сугроб, сперва прогрейся."
                )
                say("Дядя Миша (банщик)", l[rnd.nextInt(l.size)],
                    opt("Попариться на полке (${price(150)}₽)") { startAction("steam") },
                    opt("Пиво (${price(50)}₽): энергия +40") { if (pay(50)) energy = min(maxEnergy(), energy + 40f) },
                    opt("Про лукс расскажи") {
                        say("Дядя Миша",
                            "Лукс — это сила, баня и осанка. Мьюинг у зеркала, качалка, чистая кожа после веника — вот формула. Прокачай всё, и город будет твой.",
                            opt("Спасибо") {})
                    },
                    opt("Уйти") {})
            }
            "Колян" -> {
                val l = listOf(
                    "Слышь, на районе гопники опять зашевелились. Без ствола не ходи.",
                    "Я тут третий час сижу. Пар — лучшее лекарство от всего.",
                    "Видел спорткар у магазина? Там такой движок, что асфальт плавится."
                )
                say("Колян", l[rnd.nextInt(l.size)],
                    opt("Анекдот давай") {
                        say("Колян", "Заходит мужик в баню, а там... ой, забыл. В общем, хорошо париться.", opt("Ха") {})
                    },
                    opt("Бывай") {})
            }
            "Кочбратан" -> {
                say("Кочбратан", "Салам, брат! Лукс — это образ жизни. Баня, качалка, тачки — всё по красоте.",
                    opt("Дай совет") {
                        say("Кочбратан",
                            "Качалка даёт силу и мышцы, баня — лукс и здоровье, в магазине одевайся, а на улице собирай бабки и мочи гопников. Очки прокачки раздавай в меню.",
                            opt("Понял, брат") {})
                    },
                    opt("Пожать руку") { addXp(5); note("Крепкое рукопожатие: +5 опыта") },
                    opt("Бывай") {})
            }
            "Тренер Серёга" -> {
                say("Тренер Серёга", "Не качаешь ноги — не качаешь жизнь. Что делаем?",
                    opt("Жим лёжа (50₽)") { startAction("bench") },
                    opt("Беговая дорожка (50₽)") { startAction("run") },
                    opt("Что качать?") {
                        say("Тренер Серёга",
                            "Жим даёт силу и мышцы — они видны на персонаже. Бег поднимает энергию. Зеркало — бесплатный мьюинг. Каждая тренировка отнимает 25 энергии.",
                            opt("Ясно") {})
                    },
                    opt("Пока") {})
            }
        }
    }

    @Synchronized
    fun openMenu() {
        say("Меню — Кочбратан",
            "Ур. $level  |  ${money}₽  |  Лукс ${"%.1f".format(looks())}",
            opt("Персонаж (внешность)") { charMenu() },
            opt("Прокачка (очков: $skillPts)") { skillMenu() },
            opt("Достижения (${ach.size}/${Data.achs.size})") { achMenu() },
            opt("Оружие") { weaponMenu() },
            opt("Статистика") { statsMenu() },
            opt("Сохранить игру") { save(); note("Игра сохранена") })
    }

    private fun charMenu() {
        say("Внешность",
            "Кожа ${skin + 1}/${Data.skins.size}, волосы ${hair + 1}/${Data.hairs.size}\nМышцы: ${(muscle() * 100).toInt()}% (растут в спортзале)\nЛукс: ${"%.1f".format(looks())}",
            opt("Сменить цвет кожи") { skin = (skin + 1) % Data.skins.size; charMenu() },
            opt("Сменить цвет волос") { hair = (hair + 1) % Data.hairs.size; charMenu() },
            opt("Назад") { openMenu() })
    }

    private fun skillMenu() {
        val opts = ArrayList<Pair<String, () -> Unit>>()
        for (i in 0 until 5) {
            opts.add(opt("${Data.skillNames[i]}: ${skills[i]}  (${Data.skillDesc[i]})") {
                if (skillPts > 0) { skills[i]++; skillPts-- }
                skillMenu()
            })
        }
        opts.add(opt("Назад") { openMenu() })
        ui.choice("Прокачка", "Свободных очков: $skillPts\nЗа каждый уровень +2 очка.", opts)
    }

    private fun achMenu() {
        val sb = StringBuilder()
        for (a in Data.achs) sb.append(if (ach.contains(a.id)) "✔ " else "✖ ").append(a.name).append(" — ").append(a.desc).append('\n')
        ui.choice("Достижения", sb.toString(), listOf(opt("Назад") { openMenu() }))
    }

    private fun weaponMenu() {
        val opts = ArrayList<Pair<String, () -> Unit>>()
        for (w in Data.weapons) {
            if (!weaponsOwned.contains(w.id)) continue
            val a = if (w.id == "fist") "∞" else "${ammo[w.id] ?: 0}"
            opts.add(opt("${w.name}${if (curWeapon == w.id) " ✔" else ""}  (патроны: $a)") { curWeapon = w.id; weaponMenu() })
        }
        opts.add(opt("Назад") { openMenu() })
        ui.choice("Оружие", "Купить стволы можно в «Калибре» рядом со спавном.", opts)
    }

    private fun statsMenu() {
        val t = playTime.toInt()
        val msg = "Деньги: ${money}₽\nУровень: $level (опыт $xp/${xpNeed()})\nЛукс: ${"%.1f".format(looks())}\n" +
            "Сила: ${"%.1f".format(strength)}  Выносливость: ${"%.1f".format(endurance)}\n" +
            "Пройдено: ${distFoot.toInt()} м  Проехано: ${(distCar / 1000f).let { "%.2f".format(it) }} км\n" +
            "Рекорд скорости: ${(topSpeed * 3.6f).toInt()} км/ч\nПобеждено гопников: $kills\nВремя в игре: ${t / 60} мин"
        ui.choice("Статистика", msg, listOf(opt("Назад") { openMenu() }))
    }

    private fun shopMenu() {
        say("Магазин одежды «Лукс»", "Деньги: ${money}₽. Шмот добавляет лукс.",
            opt("Верх") { shopSlot("top") },
            opt("Низ") { shopSlot("bottom") },
            opt("Головные уборы") { shopSlot("hat") },
            opt("Аксессуары") { shopSlot("acc") },
            opt("Выйти") {})
    }

    private fun shopSlot(slot: String) {
        val opts = ArrayList<Pair<String, () -> Unit>>()
        for (item in Data.items) {
            if (item.slot != slot) continue
            val state = if (owned.contains(item.id)) (if (equipped[slot] == item.id) "✔ надето" else "надеть") else "${price(item.price)}₽"
            opts.add(opt("${item.name} — $state  (лукс +${item.looks})") { buyOrEquip(item); shopSlot(slot) })
        }
        opts.add(opt("Назад") { shopMenu() })
        ui.choice("Магазин: ${slot}", "Деньги: ${money}₽", opts)
    }

    private fun buyOrEquip(item: Item) {
        if (!owned.contains(item.id)) {
            if (!pay(item.price)) return
            owned.add(item.id)
            give("shop")
        }
        equipped[item.slot] = item.id
    }

    private fun gunShop() {
        val opts = ArrayList<Pair<String, () -> Unit>>()
        for (w in Data.weapons) {
            if (w.id == "fist") continue
            if (!weaponsOwned.contains(w.id)) {
                opts.add(opt("${w.name} — ${price(w.price)}₽") {
                    if (pay(w.price)) {
                        weaponsOwned.add(w.id)
                        ammo[w.id] = w.ammoPack
                        curWeapon = w.id
                    }
                    gunShop()
                })
            } else {
                val pp = max(50, w.price / 10)
                opts.add(opt("Патроны ${w.name} +${w.ammoPack} — ${price(pp)}₽") {
                    if (pay(pp)) ammo[w.id] = (ammo[w.id] ?: 0) + w.ammoPack
                    gunShop()
                })
            }
        }
        opts.add(opt("Выйти") {})
        ui.choice("Оружейный «Калибр»", "Деньги: ${money}₽. Продавец: «Лицензия? Да не смеши. Выбирай.»", opts)
    }

    @Synchronized
    fun nextWeapon() {
        val list = Data.weapons.filter { weaponsOwned.contains(it.id) }
        if (list.isEmpty()) return
        val idx = list.indexOfFirst { it.id == curWeapon }
        curWeapon = list[(idx + 1) % list.size].id
    }

    // =====================================================================
    //  Сохранение
    // =====================================================================
    @Synchronized
    fun save() {
        val e = prefs.edit()
        e.putBoolean("has", true)
        e.putInt("money", money); e.putInt("level", level); e.putInt("xp", xp); e.putInt("skillPts", skillPts)
        e.putString("skills", skills.joinToString(","))
        e.putFloat("strength", strength); e.putFloat("endurance", endurance); e.putFloat("looksBase", looksBase)
        e.putInt("skin", skin); e.putInt("hair", hair)
        e.putString("owned", owned.joinToString(","))
        e.putString("equipped", equipped.entries.joinToString(",") { it.key + ":" + it.value })
        e.putString("weapons", weaponsOwned.joinToString(","))
        e.putString("ammo", ammo.entries.joinToString(",") { it.key + ":" + it.value })
        e.putString("curWeapon", curWeapon)
        e.putString("ach", ach.joinToString(","))
        e.putInt("kills", kills); e.putInt("coins", coins)
        e.putFloat("distFoot", distFoot); e.putFloat("distCar", distCar); e.putFloat("topSpeed", topSpeed)
        e.putString("carsDriven", carsDriven.joinToString(","))
        e.putFloat("playTime", playTime); e.putFloat("hour", gameHour)
        e.putFloat("health", health)
        val sx = if (interior >= 0) lastDoorX else px
        val sz = if (interior >= 0) lastDoorZ + 1f else pz
        e.putFloat("px", sx); e.putFloat("pz", sz)
        e.apply()
    }

    private fun splitList(s: String?): List<String> = (s ?: "").split(",").filter { it.isNotEmpty() }

    private fun load() {
        owned.addAll(listOf("top_tee", "bot_jeans", "hat_none", "acc_none"))
        equipped["top"] = "top_tee"; equipped["bottom"] = "bot_jeans"; equipped["hat"] = "hat_none"; equipped["acc"] = "acc_none"
        weaponsOwned.add("fist")
        if (!prefs.getBoolean("has", false)) return
        money = prefs.getInt("money", 1000); level = prefs.getInt("level", 1)
        xp = prefs.getInt("xp", 0); skillPts = prefs.getInt("skillPts", 0)
        val sk = splitList(prefs.getString("skills", ""))
        for (i in 0 until min(5, sk.size)) skills[i] = sk[i].toIntOrNull() ?: 0
        strength = prefs.getFloat("strength", 0f); endurance = prefs.getFloat("endurance", 0f)
        looksBase = prefs.getFloat("looksBase", 1f)
        skin = prefs.getInt("skin", 1).coerceIn(0, Data.skins.size - 1)
        hair = prefs.getInt("hair", 0).coerceIn(0, Data.hairs.size - 1)
        owned.addAll(splitList(prefs.getString("owned", "")))
        for (kv in splitList(prefs.getString("equipped", ""))) {
            val p = kv.split(":")
            if (p.size == 2) equipped[p[0]] = p[1]
        }
        weaponsOwned.addAll(splitList(prefs.getString("weapons", "")))
        for (kv in splitList(prefs.getString("ammo", ""))) {
            val p = kv.split(":")
            if (p.size == 2) ammo[p[0]] = p[1].toIntOrNull() ?: 0
        }
        curWeapon = prefs.getString("curWeapon", "fist") ?: "fist"
        ach.addAll(splitList(prefs.getString("ach", "")))
        kills = prefs.getInt("kills", 0); coins = prefs.getInt("coins", 0)
        distFoot = prefs.getFloat("distFoot", 0f); distCar = prefs.getFloat("distCar", 0f)
        topSpeed = prefs.getFloat("topSpeed", 0f)
        carsDriven.addAll(splitList(prefs.getString("carsDriven", "")))
        playTime = prefs.getFloat("playTime", 0f); gameHour = prefs.getFloat("hour", 9f)
        health = prefs.getFloat("health", 100f).coerceAtLeast(20f)
        px = prefs.getFloat("px", 560f); pz = prefs.getFloat("pz", 548f)
        tmp[0] = px; tmp[1] = pz
        if (pushOut(0.6f)) { px = tmp[0]; pz = tmp[1] }
    }
}
