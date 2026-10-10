package com.kochvalds.looxmaksing2

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.view.MotionEvent
import android.view.View
import kotlin.math.*

class HudView(ctx: Context, private val g: Game, private val onMenu: () -> Unit) : View(ctx) {

    private val p = Paint(Paint.ANTI_ALIAS_FLAG)
    private val tp = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
    }
    private val rect = RectF()

    private var rad = 60f
    private var fireX = 0f; private var fireY = 0f; private var fireR = 0f
    private var actX = 0f; private var actY = 0f
    private var jumpX = 0f; private var jumpY = 0f
    private var wpnX = 0f; private var wpnY = 0f
    private var menuX = 0f; private var menuY = 0f

    private var stickId = -1
    private var sx0 = 0f; private var sy0 = 0f; private var kx = 0f; private var ky = 0f
    private var lookId = -1; private var lastLx = 0f
    private var fireId = -1; private var handId = -1

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        rad = h * 0.085f
        fireR = rad * 1.25f
        fireX = w - rad * 2.0f; fireY = h - rad * 2.2f
        actX = w - rad * 4.7f; actY = h - rad * 1.3f
        jumpX = w - rad * 1.4f; jumpY = h - rad * 5.0f
        wpnX = w - rad * 4.6f; wpnY = h - rad * 3.6f
        menuX = rad * 1.0f; menuY = rad * 1.0f
    }

    private fun hit(x: Float, y: Float, cx: Float, cy: Float, r: Float) = hypot(x - cx, y - cy) <= r * 1.2f

    private fun down(id: Int, x: Float, y: Float) {
        if (hit(x, y, menuX, menuY, rad * 0.7f)) { if (g.dialogCount == 0) onMenu(); return }
        if (hit(x, y, actX, actY, rad)) { g.interact(); return }
        if (g.inCar == null && hit(x, y, wpnX, wpnY, rad * 0.65f)) { g.nextWeapon(); return }
        if (g.inCar == null && hit(x, y, jumpX, jumpY, rad * 0.9f)) { g.jumpReq = true; return }
        if (g.inCar == null && hit(x, y, fireX, fireY, fireR)) { fireId = id; g.fire = true; return }
        if (g.inCar != null && hit(x, y, jumpX, jumpY, rad * 0.9f)) { handId = id; g.hand = true; return }
        if (g.inCar != null && hit(x, y, fireX, fireY, fireR)) { handId = id; g.hand = true; return }
        if (x < width * 0.45f) {
            if (stickId == -1) { stickId = id; sx0 = x; sy0 = y; kx = x; ky = y; g.stickX = 0f; g.stickY = 0f }
        } else if (lookId == -1) {
            lookId = id; lastLx = x
        }
    }

    private fun move(id: Int, x: Float, y: Float) {
        if (id == stickId) {
            val R = rad * 1.6f
            var dx = x - sx0
            var dy = y - sy0
            val d = hypot(dx, dy)
            if (d > R) { dx = dx / d * R; dy = dy / d * R }
            kx = sx0 + dx; ky = sy0 + dy
            g.stickX = dx / R
            g.stickY = -dy / R
        } else if (id == lookId) {
            g.addLook((x - lastLx) * 0.006f)
            lastLx = x
        }
    }

    private fun up(id: Int) {
        if (id == stickId) { stickId = -1; g.stickX = 0f; g.stickY = 0f }
        if (id == lookId) lookId = -1
        if (id == fireId) { fireId = -1; g.fire = false }
        if (id == handId) { handId = -1; g.hand = false }
    }

    override fun onTouchEvent(e: MotionEvent): Boolean {
        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                val i = e.actionIndex
                down(e.getPointerId(i), e.getX(i), e.getY(i))
            }
            MotionEvent.ACTION_MOVE -> {
                for (i in 0 until e.pointerCount) move(e.getPointerId(i), e.getX(i), e.getY(i))
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> up(e.getPointerId(e.actionIndex))
            MotionEvent.ACTION_CANCEL -> {
                stickId = -1; lookId = -1; fireId = -1; handId = -1
                g.stickX = 0f; g.stickY = 0f; g.fire = false; g.hand = false
            }
        }
        return true
    }

    // -------------------------------------------------------------- draw
    private fun bar(c: Canvas, x: Float, y: Float, w: Float, h: Float, frac: Float, col: Int, label: String) {
        p.style = Paint.Style.FILL
        p.color = 0x88000000.toInt()
        rect.set(x, y, x + w, y + h)
        c.drawRoundRect(rect, h / 2f, h / 2f, p)
        p.color = col
        rect.set(x, y, x + w * frac.coerceIn(0f, 1f), y + h)
        c.drawRoundRect(rect, h / 2f, h / 2f, p)
        tp.textSize = h * 0.78f
        c.drawText(label, x + w / 2f, y + h * 0.8f, tp)
    }

    private fun circleBtn(c: Canvas, x: Float, y: Float, r: Float, label: String, col: Int) {
        p.style = Paint.Style.FILL
        p.color = col
        c.drawCircle(x, y, r, p)
        p.style = Paint.Style.STROKE
        p.strokeWidth = 4f
        p.color = 0xAAFFFFFF.toInt()
        c.drawCircle(x, y, r, p)
        p.style = Paint.Style.FILL
        tp.textSize = r * 0.42f
        c.drawText(label, x, y + r * 0.15f, tp)
    }

    override fun onDraw(c: Canvas) {
        val w = width.toFloat()
        val h = height.toFloat()
        val inCar = g.inCar != null

        // полосы состояния
        val bx = rad * 2.0f
        val bh = rad * 0.34f
        val bw = rad * 3.4f
        bar(c, bx, rad * 0.3f, bw, bh, g.health / g.maxHealth(), 0xFFD03030.toInt(), "HP ${g.health.toInt()}")
        bar(c, bx, rad * 0.3f + bh * 1.25f, bw, bh, g.energy / g.maxEnergy(), 0xFFE0B020.toInt(), "Энергия ${g.energy.toInt()}")
        bar(c, bx, rad * 0.3f + bh * 2.5f, bw, bh, g.xp.toFloat() / g.xpNeed(), 0xFF3070D0.toInt(), "Ур. ${g.level}  опыт")
        tp.textSize = rad * 0.4f
        tp.textAlign = Paint.Align.LEFT
        c.drawText("${g.money}₽   Лукс ${"%.1f".format(g.looks())}", bx, rad * 0.3f + bh * 3.9f + rad * 0.15f, tp)
        val hh = g.gameHour.toInt()
        val mm = ((g.gameHour - hh) * 60f).toInt()
        c.drawText("%02d:%02d".format(hh, mm) + if (g.skillPts > 0) "   ★ очков: ${g.skillPts}" else "",
            bx, rad * 0.3f + bh * 3.9f + rad * 0.7f, tp)
        tp.textAlign = Paint.Align.CENTER

        // кнопка меню
        circleBtn(c, menuX, menuY, rad * 0.7f, "МЕНЮ", 0x88222222.toInt())

        // миникарта
        if (g.interior < 0) drawMinimap(c, w)

        // стик
        if (stickId != -1) {
            p.style = Paint.Style.FILL
            p.color = 0x44FFFFFF
            c.drawCircle(sx0, sy0, rad * 1.6f, p)
            p.color = 0x99FFFFFF.toInt()
            c.drawCircle(kx, ky, rad * 0.7f, p)
        } else {
            p.style = Paint.Style.STROKE
            p.strokeWidth = 4f
            p.color = 0x55FFFFFF
            c.drawCircle(rad * 2.6f, h - rad * 2.4f, rad * 1.6f, p)
            p.style = Paint.Style.FILL
        }

        // кнопки
        circleBtn(c, actX, actY, rad, "ДЕЙСТВИЕ", 0x88206030.toInt())
        if (!inCar) {
            circleBtn(c, fireX, fireY, fireR, "ОГОНЬ", 0x88A02020.toInt())
            circleBtn(c, jumpX, jumpY, rad * 0.9f, "ПРЫЖОК", 0x88203060.toInt())
            circleBtn(c, wpnX, wpnY, rad * 0.65f, "ОРУЖ.", 0x88444444.toInt())
            val w0 = Data.weapon(g.curWeapon)
            val a = if (w0.id == "fist") "∞" else "${g.ammo[w0.id] ?: 0}"
            tp.textSize = rad * 0.34f
            c.drawText("${w0.name}: $a", wpnX - rad * 0.2f, wpnY - rad * 0.85f, tp)
        } else {
            circleBtn(c, fireX, fireY, fireR, "РУЧНИК", 0x88A06020.toInt())
            val c0 = g.inCar!!
            tp.textSize = rad * 0.8f
            c.drawText("${(abs(c0.speed) * 3.6f).toInt()} км/ч", w / 2f, h - rad * 0.5f, tp)
            bar(c, w / 2f - rad * 1.6f, h - rad * 1.5f, rad * 3.2f, rad * 0.3f, c0.hp / 100f, 0xFF50B050.toInt(), "Кузов ${c0.hp.toInt()}")
        }

        // подсказка взаимодействия
        if (g.prompt.isNotEmpty() && g.actionTimer <= 0f) {
            tp.textSize = rad * 0.45f
            val tw = tp.measureText(g.prompt) + rad
            rect.set(w / 2f - tw / 2f, h * 0.62f, w / 2f + tw / 2f, h * 0.62f + rad * 0.8f)
            p.color = 0xAA000000.toInt()
            p.style = Paint.Style.FILL
            c.drawRoundRect(rect, 16f, 16f, p)
            c.drawText("«ДЕЙСТВИЕ»: ${g.prompt}", w / 2f, h * 0.62f + rad * 0.55f, tp)
        }

        // прогресс действия (парилка, тренировка)
        if (g.actionTimer > 0f) {
            bar(c, w / 2f - rad * 2f, h * 0.8f, rad * 4f, rad * 0.4f, 1f - g.actionTimer / g.actionTotal, 0xFFE08030.toInt(),
                when (g.actionKind) { "steam" -> "Парение..."; "bench" -> "Жим лёжа..."; "run" -> "Бег..."; else -> "Мьюинг..." })
        }

        // уведомления
        if (g.noticeT > 0f && g.notice.isNotEmpty()) {
            tp.textSize = rad * 0.5f
            val tw = tp.measureText(g.notice) + rad
            rect.set(w / 2f - tw / 2f, rad * 0.2f, w / 2f + tw / 2f, rad * 1.1f)
            p.color = 0xCC1A1A1A.toInt()
            c.drawRoundRect(rect, 20f, 20f, p)
            tp.color = 0xFFFFD84A.toInt()
            c.drawText(g.notice, w / 2f, rad * 0.8f, tp)
            tp.color = Color.WHITE
        }

        postInvalidateOnAnimation()
    }

    private fun drawMinimap(c: Canvas, w: Float) {
        val size = rad * 3.2f
        val cx = w - size / 2f - rad * 0.3f
        val cy = size / 2f + rad * 0.3f
        val scale = size / 2f / 120f
        p.style = Paint.Style.FILL
        p.color = 0x99223322.toInt()
        c.drawCircle(cx, cy, size / 2f, p)
        val fx = sin(g.camYaw)
        val fz = cos(g.camYaw)
        fun plot(x: Float, z: Float, r: Float, col: Int) {
            val dx = x - g.px
            val dz = z - g.pz
            val u = dx * (-fz) + dz * fx
            val v = dx * fx + dz * fz
            val sx = cx + u * scale
            val sy = cy - v * scale
            if (hypot(sx - cx, sy - cy) < size / 2f - r) {
                p.color = col
                c.drawCircle(sx, sy, r, p)
            }
        }
        for (b in g.specials) {
            val col = when (b.kind) {
                1 -> 0xFFFFA040.toInt(); 2 -> 0xFFFF4040.toInt(); 3 -> 0xFFE060FF.toInt(); else -> 0xFF50FF50.toInt()
            }
            plot(b.x, b.z + b.hz + 3f, rad * 0.2f, col)
        }
        for (e in g.enemies) if (e.dead <= 0f) plot(e.x, e.z, rad * 0.09f, 0xFFFF2020.toInt())
        for (car in g.cars) if (car.occupied.not()) plot(car.x, car.z, rad * 0.07f, 0xFF9090FF.toInt())
        p.color = Color.WHITE
        c.drawCircle(cx, cy, rad * 0.12f, p)
        p.style = Paint.Style.STROKE
        p.strokeWidth = 3f
        p.color = 0xAAFFFFFF.toInt()
        c.drawCircle(cx, cy, size / 2f, p)
        p.style = Paint.Style.FILL
    }
}
