package com.kochvalds.looxmaksing2

import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.opengl.Matrix
import android.util.Log
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.ShortBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import kotlin.math.*

class GameRenderer(private val g: Game) : GLSurfaceView.Renderer {

    private val vsrc = """
        uniform mat4 uMvp;
        uniform mat4 uModel;
        uniform mat4 uRot;
        attribute vec3 aPos;
        attribute vec3 aNor;
        varying vec3 vN;
        varying vec3 vW;
        void main() {
            vec4 w = uModel * vec4(aPos, 1.0);
            vW = w.xyz;
            vN = (uRot * vec4(aNor, 0.0)).xyz;
            gl_Position = uMvp * vec4(aPos, 1.0);
        }
    """.trimIndent()

    private val fsrc = """
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform vec4 uColor;
        uniform vec3 uLight;
        uniform float uWin;
        uniform float uDay;
        uniform float uNight;
        uniform vec3 uCam;
        uniform vec3 uFog;
        varying vec3 vN;
        varying vec3 vW;
        void main() {
            vec3 n = normalize(vN);
            float d = max(dot(n, normalize(uLight)), 0.0);
            float light = (0.32 + 0.68 * d) * (0.3 + 0.7 * uDay);
            vec3 c = uColor.rgb;
            float glow = 0.0;
            if (uWin > 1.5) {
                if (n.y > 0.5) {
                    vec2 p = vW.xz;
                    vec2 m = abs(mod(p + 40.0, 80.0) - 40.0);
                    if (m.x < 7.0 || m.y < 7.0) {
                        c = vec3(0.17, 0.17, 0.19);
                        if (m.x < 0.18 && m.y > 7.5 && fract(p.y * 0.1) < 0.5) c = vec3(0.9, 0.85, 0.4);
                        if (m.y < 0.18 && m.x > 7.5 && fract(p.x * 0.1) < 0.5) c = vec3(0.9, 0.85, 0.4);
                        if (m.x > 6.6 && m.x < 7.0 && m.y > 7.0) c = vec3(0.6);
                        if (m.y > 6.6 && m.y < 7.0 && m.x > 7.0) c = vec3(0.6);
                    } else if (m.x < 9.0 || m.y < 9.0) {
                        c = vec3(0.52, 0.52, 0.5);
                    } else {
                        c = vec3(0.28, 0.4, 0.26);
                    }
                }
            } else if (uWin > 0.5 && abs(n.y) < 0.5) {
                float u = vW.x;
                if (abs(n.x) > 0.5) u = vW.z;
                float fu = fract(u * 0.25);
                float fy = fract(vW.y * 0.3333);
                float mask = step(0.2, fu) * step(fu, 0.8) * step(0.25, fy) * step(fy, 0.75) * step(2.5, vW.y);
                vec2 cell = vec2(floor(u * 0.25), floor(vW.y * 0.3333));
                float lit = step(0.45, fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453));
                c = mix(c, vec3(0.2, 0.3, 0.4), mask * 0.85);
                glow = mask * lit * uNight;
            }
            vec3 col = c * light;
            col = mix(col, vec3(1.0, 0.85, 0.55), glow * 0.9);
            float dist = length(vW - uCam);
            float f = clamp((dist - 120.0) / 380.0, 0.0, 1.0);
            col = mix(col, uFog, f);
            gl_FragColor = vec4(col, uColor.a);
        }
    """.trimIndent()

    private var prog = 0
    private var aPos = 0; private var aNor = 0
    private var uMvp = 0; private var uModel = 0; private var uRot = 0; private var uColor = 0
    private var uLight = 0; private var uWin = 0; private var uDay = 0; private var uNight = 0
    private var uCam = 0; private var uFog = 0

    private val proj = FloatArray(16)
    private val view = FloatArray(16)
    private val vp = FloatArray(16)
    private val bm = FloatArray(16)
    private val br = FloatArray(16)
    private val m = FloatArray(16)
    private val r = FloatArray(16)
    private val mvp = FloatArray(16)
    private lateinit var vb: FloatBuffer
    private lateinit var ib: ShortBuffer
    private var aspect = 1.7f
    private var last = 0L
    private var time = 0f

    private val deg = 57.29578f

    // ------------------------------------------------------------ GL setup
    private fun compile(type: Int, src: String): Int {
        val s = GLES20.glCreateShader(type)
        GLES20.glShaderSource(s, src)
        GLES20.glCompileShader(s)
        val ok = IntArray(1)
        GLES20.glGetShaderiv(s, GLES20.GL_COMPILE_STATUS, ok, 0)
        if (ok[0] == 0) Log.e("Loox2", "shader error: " + GLES20.glGetShaderInfoLog(s))
        return s
    }

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        val vs = compile(GLES20.GL_VERTEX_SHADER, vsrc)
        val fs = compile(GLES20.GL_FRAGMENT_SHADER, fsrc)
        prog = GLES20.glCreateProgram()
        GLES20.glAttachShader(prog, vs)
        GLES20.glAttachShader(prog, fs)
        GLES20.glLinkProgram(prog)
        aPos = GLES20.glGetAttribLocation(prog, "aPos")
        aNor = GLES20.glGetAttribLocation(prog, "aNor")
        uMvp = GLES20.glGetUniformLocation(prog, "uMvp")
        uModel = GLES20.glGetUniformLocation(prog, "uModel")
        uRot = GLES20.glGetUniformLocation(prog, "uRot")
        uColor = GLES20.glGetUniformLocation(prog, "uColor")
        uLight = GLES20.glGetUniformLocation(prog, "uLight")
        uWin = GLES20.glGetUniformLocation(prog, "uWin")
        uDay = GLES20.glGetUniformLocation(prog, "uDay")
        uNight = GLES20.glGetUniformLocation(prog, "uNight")
        uCam = GLES20.glGetUniformLocation(prog, "uCam")
        uFog = GLES20.glGetUniformLocation(prog, "uFog")

        val h = 0.5f
        val v = floatArrayOf(
            h, -h, -h, 1f, 0f, 0f, h, h, -h, 1f, 0f, 0f, h, h, h, 1f, 0f, 0f, h, -h, h, 1f, 0f, 0f,
            -h, -h, h, -1f, 0f, 0f, -h, h, h, -1f, 0f, 0f, -h, h, -h, -1f, 0f, 0f, -h, -h, -h, -1f, 0f, 0f,
            -h, h, -h, 0f, 1f, 0f, -h, h, h, 0f, 1f, 0f, h, h, h, 0f, 1f, 0f, h, h, -h, 0f, 1f, 0f,
            -h, -h, h, 0f, -1f, 0f, -h, -h, -h, 0f, -1f, 0f, h, -h, -h, 0f, -1f, 0f, h, -h, h, 0f, -1f, 0f,
            -h, -h, h, 0f, 0f, 1f, h, -h, h, 0f, 0f, 1f, h, h, h, 0f, 0f, 1f, -h, h, h, 0f, 0f, 1f,
            h, -h, -h, 0f, 0f, -1f, -h, -h, -h, 0f, 0f, -1f, -h, h, -h, 0f, 0f, -1f, h, h, -h, 0f, 0f, -1f
        )
        val idx = ShortArray(36)
        for (f in 0 until 6) {
            val o = (f * 4).toShort()
            val k = f * 6
            idx[k] = o; idx[k + 1] = (o + 1).toShort(); idx[k + 2] = (o + 2).toShort()
            idx[k + 3] = o; idx[k + 4] = (o + 2).toShort(); idx[k + 5] = (o + 3).toShort()
        }
        vb = ByteBuffer.allocateDirect(v.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
        vb.put(v); vb.position(0)
        ib = ByteBuffer.allocateDirect(idx.size * 2).order(ByteOrder.nativeOrder()).asShortBuffer()
        ib.put(idx); ib.position(0)

        GLES20.glEnable(GLES20.GL_DEPTH_TEST)
        GLES20.glEnable(GLES20.GL_BLEND)
        GLES20.glBlendFunc(GLES20.GL_SRC_ALPHA, GLES20.GL_ONE_MINUS_SRC_ALPHA)
        last = System.nanoTime()
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        GLES20.glViewport(0, 0, width, height)
        aspect = width.toFloat() / max(1, height).toFloat()
    }

    // ------------------------------------------------------------ frame
    override fun onDrawFrame(gl: GL10?) {
        val now = System.nanoTime()
        val dt = (now - last) / 1e9f
        last = now
        time += dt
        g.update(dt)
        synchronized(g) { drawScene() }
    }

    private fun smooth(x: Float): Float {
        val t = x.coerceIn(0f, 1f)
        return t * t * (3f - 2f * t)
    }

    private fun drawScene() {
        val inside = g.interior >= 0
        val ang = (g.gameHour - 6f) / 24f * TWO_PI
        val elev = sin(ang)
        val day = if (inside) 0.95f else smooth((elev + 0.15f) / 0.4f)
        val night = if (inside) 0f else 1f - day
        val sr: Float; val sg: Float; val sb: Float
        if (inside) { sr = 0.05f; sg = 0.04f; sb = 0.04f }
        else {
            sr = 0.02f + (0.55f - 0.02f) * day
            sg = 0.03f + (0.75f - 0.03f) * day
            sb = 0.09f + (0.95f - 0.09f) * day
        }
        GLES20.glClearColor(sr, sg, sb, 1f)
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)
        GLES20.glUseProgram(prog)
        GLES20.glDepthMask(true)

        vb.position(0)
        GLES20.glVertexAttribPointer(aPos, 3, GLES20.GL_FLOAT, false, 24, vb)
        GLES20.glEnableVertexAttribArray(aPos)
        vb.position(3)
        GLES20.glVertexAttribPointer(aNor, 3, GLES20.GL_FLOAT, false, 24, vb)
        GLES20.glEnableVertexAttribArray(aNor)
        ib.position(0)

        GLES20.glUniform3f(uLight, cos(ang) * 0.6f, 0.5f + 0.5f * max(0f, elev), 0.4f)
        GLES20.glUniform1f(uDay, day)
        GLES20.glUniform1f(uNight, night)
        GLES20.glUniform3f(uCam, g.eyeX, g.eyeY, g.eyeZ)
        GLES20.glUniform3f(uFog, sr, sg, sb)

        Matrix.setLookAtM(view, 0, g.eyeX, g.eyeY, g.eyeZ, g.tgtX, g.tgtY, g.tgtZ, 0f, 1f, 0f)
        Matrix.perspectiveM(proj, 0, 62f, aspect, 0.3f, 700f)
        Matrix.multiplyMM(vp, 0, proj, 0, view, 0)

        if (inside) drawInterior() else drawWorld()

        // игрок
        if (g.inCar == null) {
            drawChar(g.px, g.py, g.pz, g.yaw, g.playerLook(), g.walkPhase, g.moving, g.pose)
        }

        // прозрачный проход: маяки и частицы
        GLES20.glDepthMask(false)
        if (!inside) drawBeacons()
        drawParticles()
        GLES20.glDepthMask(true)
    }

    // ------------------------------------------------------------ primitives
    private fun setColor(c: Int, a: Float) {
        GLES20.glUniform4f(uColor, ((c shr 16) and 255) / 255f, ((c shr 8) and 255) / 255f, (c and 255) / 255f, a)
    }

    private fun draw(color: Int, alpha: Float, win: Float) {
        Matrix.multiplyMM(mvp, 0, vp, 0, m, 0)
        GLES20.glUniformMatrix4fv(uMvp, 1, false, mvp, 0)
        GLES20.glUniformMatrix4fv(uModel, 1, false, m, 0)
        GLES20.glUniformMatrix4fv(uRot, 1, false, r, 0)
        setColor(color, alpha)
        GLES20.glUniform1f(uWin, win)
        GLES20.glDrawElements(GLES20.GL_TRIANGLES, 36, GLES20.GL_UNSIGNED_SHORT, ib)
    }

    /** Простая коробка: центр по XZ, нижняя точка по Y. */
    private fun box(x: Float, yb: Float, z: Float, sx: Float, sy: Float, sz: Float, color: Int, win: Float = 0f, alpha: Float = 1f) {
        Matrix.setIdentityM(m, 0)
        Matrix.translateM(m, 0, x, yb + sy / 2f, z)
        Matrix.scaleM(m, 0, sx, sy, sz)
        Matrix.setIdentityM(r, 0)
        draw(color, alpha, win)
    }

    private fun setBase(x: Float, y: Float, z: Float, yawDeg: Float, pitchDeg: Float, rollDeg: Float) {
        Matrix.setIdentityM(bm, 0)
        Matrix.translateM(bm, 0, x, y, z)
        Matrix.setIdentityM(br, 0)
        Matrix.rotateM(bm, 0, yawDeg, 0f, 1f, 0f)
        Matrix.rotateM(br, 0, yawDeg, 0f, 1f, 0f)
        if (pitchDeg != 0f) { Matrix.rotateM(bm, 0, pitchDeg, 1f, 0f, 0f); Matrix.rotateM(br, 0, pitchDeg, 1f, 0f, 0f) }
        if (rollDeg != 0f) { Matrix.rotateM(bm, 0, rollDeg, 0f, 0f, 1f); Matrix.rotateM(br, 0, rollDeg, 0f, 0f, 1f) }
    }

    /** Деталь в локальных координатах базы. swing вращает вокруг X (шарнир в точке lx,ly,lz), offY сдвигает центр после вращения. */
    private fun part(
        lx: Float, ly: Float, lz: Float, sx: Float, sy: Float, sz: Float, color: Int,
        swing: Float = 0f, offY: Float = 0f, ry: Float = 0f, alpha: Float = 1f
    ) {
        System.arraycopy(bm, 0, m, 0, 16)
        System.arraycopy(br, 0, r, 0, 16)
        Matrix.translateM(m, 0, lx, ly, lz)
        if (ry != 0f) { Matrix.rotateM(m, 0, ry, 0f, 1f, 0f); Matrix.rotateM(r, 0, ry, 0f, 1f, 0f) }
        if (swing != 0f) { Matrix.rotateM(m, 0, swing, 1f, 0f, 0f); Matrix.rotateM(r, 0, swing, 1f, 0f, 0f) }
        if (offY != 0f) Matrix.translateM(m, 0, 0f, offY, 0f)
        Matrix.scaleM(m, 0, sx, sy, sz)
        draw(color, alpha, 0f)
    }

    // ------------------------------------------------------------ персонаж
    private fun drawChar(x: Float, y: Float, z: Float, yawRad: Float, look: Look, phase: Float, moving: Boolean, pose: Int) {
        val mu = look.muscle
        var by = y
        var pitch = 0f
        val sw = if (moving) sin(phase) * 40f else 0f
        var legL = sw; var legR = -sw; var armL = -sw; var armR = sw
        when (pose) {
            1 -> { by = y - 0.8f; legL = -88f; legR = -88f; armL = -20f; armR = -20f }
            2 -> {
                by = y + 0.15f + 0.12f * (0.5f + 0.5f * sin(time * 5f)); pitch = 82f
                legL = 0f; legR = 0f; armL = 0f; armR = 0f
            }
            3 -> { by = y + 0.25f; pitch = 88f; legL = 0f; legR = 0f; armL = 0f; armR = 0f }
            4 -> { armL = -110f; armR = -110f }
        }
        setBase(x, by, z, yawRad * deg, pitch, 0f)
        val dark = 0xFF151515.toInt()
        part(0.13f + 0.02f * mu, 0.9f, 0f, 0.2f + 0.05f * mu, 0.85f, 0.22f + 0.05f * mu, look.bottom, legL, -0.425f)
        part(-0.13f - 0.02f * mu, 0.9f, 0f, 0.2f + 0.05f * mu, 0.85f, 0.22f + 0.05f * mu, look.bottom, legR, -0.425f)
        part(0f, 1.225f, 0f, 0.5f + 0.22f * mu, 0.65f, 0.28f + 0.08f * mu, look.top)
        val ax = 0.34f + 0.12f * mu
        part(ax, 1.5f, 0f, 0.14f + 0.07f * mu, 0.6f, 0.14f + 0.07f * mu, look.top, armL, -0.3f)
        part(-ax, 1.5f, 0f, 0.14f + 0.07f * mu, 0.6f, 0.14f + 0.07f * mu, look.top, armR, -0.3f)
        part(ax, 1.5f, 0f, 0.12f, 0.12f, 0.12f, look.skin, armL, -0.64f)
        part(-ax, 1.5f, 0f, 0.12f, 0.12f, 0.12f, look.skin, armR, -0.64f)
        part(0f, 1.72f, 0f, 0.28f, 0.28f, 0.28f, look.skin)
        part(0f, 1.88f, -0.02f, 0.3f, 0.1f, 0.3f, look.hair)
        if (look.hat != 0) {
            part(0f, 1.92f, 0f, 0.32f, 0.1f, 0.32f, look.hat)
            part(0f, 1.9f, 0.2f, 0.28f, 0.04f, 0.15f, look.hat)
        }
        if (look.glasses) part(0f, 1.74f, 0.15f, 0.3f, 0.06f, 0.03f, dark)
        if (look.acc != 0) part(0f, 1.42f, 0.15f + 0.04f * mu, 0.3f + 0.2f * mu, 0.05f, 0.03f, look.acc)
    }

    // ------------------------------------------------------------ машина
    private fun drawCar(c: Car) {
        val t = c.type
        setBase(c.x, 0f, c.z, c.heading * deg, c.pitch * deg, c.roll * deg)
        val wr = 0.33f
        val glass = 0xFF1A2A3A.toInt()
        part(0f, 0.3f + t.hgt / 2f, 0f, t.wid, t.hgt, t.len, c.color)
        part(0f, 0.3f + t.hgt + t.cabin / 2f, -t.len * 0.05f, t.wid * 0.9f, t.cabin, t.len * 0.5f, glass)
        part(0f, 0.3f + t.hgt + t.cabin, -t.len * 0.05f, t.wid * 0.92f, 0.08f, t.len * 0.46f, c.color)
        part(t.wid * 0.33f, 0.3f + t.hgt * 0.6f, t.len / 2f, 0.3f, 0.15f, 0.05f, 0xFFFFF2B0.toInt())
        part(-t.wid * 0.33f, 0.3f + t.hgt * 0.6f, t.len / 2f, 0.3f, 0.15f, 0.05f, 0xFFFFF2B0.toInt())
        part(t.wid * 0.33f, 0.3f + t.hgt * 0.6f, -t.len / 2f, 0.3f, 0.15f, 0.05f, 0xFFD02020.toInt())
        part(-t.wid * 0.33f, 0.3f + t.hgt * 0.6f, -t.len / 2f, 0.3f, 0.15f, 0.05f, 0xFFD02020.toInt())
        val steerDeg = c.steer * deg
        val spin = c.wheel * deg
        for (sx in intArrayOf(-1, 1)) {
            for (sz in intArrayOf(-1, 1)) {
                val lx = sx * t.wid / 2f
                val lz = sz * t.len * 0.32f
                val ry = if (sz > 0) steerDeg else 0f
                part(lx, wr, lz, 0.28f, wr * 2f, wr * 2f, 0xFF101010.toInt(), spin, 0f, ry)
                part(lx + sx * 0.13f, wr, lz, 0.05f, wr * 1.2f, wr * 1.2f, 0xFFBBBBBB.toInt(), spin, 0f, ry)
            }
        }
    }

    // ------------------------------------------------------------ мир
    private fun drawWorld() {
        box(Game.W / 2f, -1f, Game.W / 2f, Game.W + 500f, 1f, Game.W + 500f, 0xFF444444.toInt(), 2f)

        val pcx = (g.px / Game.CELL).toInt()
        val pcz = (g.pz / Game.CELL).toInt()
        for (i in pcx - 3..pcx + 3) for (j in pcz - 3..pcz + 3) {
            if (i < 0 || j < 0 || i >= Game.N || j >= Game.N) continue
            for (b in g.cells[i * Game.N + j]) {
                box(b.x, 0f, b.z, b.hx * 2f, b.h, b.hz * 2f, b.color, 1f)
                box(b.x, b.h, b.z, b.hx * 2f + 0.6f, 0.4f, b.hz * 2f + 0.6f, 0xFF3A3A3A.toInt())
                if (b.kind > 0) {
                    val sign = when (b.kind) {
                        1 -> 0xFFD2A05A.toInt()
                        2 -> 0xFFCC3333.toInt()
                        3 -> 0xFFC060E0.toInt()
                        else -> 0xFF3F8F3F.toInt()
                    }
                    box(b.x, 5.5f, b.z + b.hz + 0.25f, 14f, 3.5f, 0.5f, sign)
                }
            }
            val cx = i * Game.CELL
            val cz = j * Game.CELL
            drawTree(cx + 8f, cz + 40f)
            drawTree(cx + Game.CELL - 8f, cz + 40f)
        }
        for (c in g.cars) {
            if (abs(c.x - g.px) < 230f && abs(c.z - g.pz) < 230f) drawCar(c)
        }
        for (e in g.enemies) {
            if (abs(e.x - g.px) < 200f && abs(e.z - g.pz) < 200f)
                drawChar(e.x, 0f, e.z, e.yaw, e.look, e.phase, e.hp > 0f && e.aggro && e.dead <= 0f, if (e.dead > 0f) 3 else 0)
        }
        for (p in g.pickups) {
            if (p.taken || abs(p.x - g.px) > 120f || abs(p.z - g.pz) > 120f) continue
            setBase(p.x, 1f + 0.2f * sin(time * 3f + p.x), p.z, time * 90f, 0f, 0f)
            part(0f, 0f, 0f, 0.55f, 0.32f, 0.35f, 0xFF3FBF5F.toInt())
            part(0f, 0f, 0f, 0.2f, 0.34f, 0.37f, 0xFFE8D25A.toInt())
        }
    }

    private fun drawTree(x: Float, z: Float) {
        if (abs(x - g.px) > 200f || abs(z - g.pz) > 200f) return
        box(x, 0f, z, 0.4f, 2.5f, 0.4f, 0xFF5A3E22.toInt())
        box(x, 2.2f, z, 2.4f, 2.4f, 2.4f, 0xFF2E7D32.toInt())
    }

    private fun drawBeacons() {
        for (b in g.specials) {
            if (abs(b.x - g.px) > 250f || abs(b.z - g.pz) > 250f) continue
            val col = when (b.kind) {
                1 -> 0xFFFFA040.toInt()
                2 -> 0xFFFF4040.toInt()
                3 -> 0xFFE060FF.toInt()
                else -> 0xFF50FF50.toInt()
            }
            box(b.x, 0f, b.z + b.hz + 3f, 1.4f, 16f, 1.4f, col, 0f, 0.35f)
        }
    }

    private fun drawParticles() {
        for (p in g.particles) {
            val age = p.max - p.life
            val s = p.size + p.grow * age
            val a = p.alpha * (p.life / p.max)
            box(p.x, p.y - s / 2f, p.z, s, s, s, p.color, 0f, a)
        }
    }

    // ------------------------------------------------------------ интерьеры
    private fun drawInterior() {
        val I = g.interiors[g.interior]
        box(I.cx, -0.1f, I.cz, I.hx * 2f + 1f, 0.1f, I.hz * 2f + 1f, I.floor)
        for (p in g.propsIn[g.interior] ?: emptyList()) box(p.x, p.y, p.z, p.sx, p.sy, p.sz, p.color)

        val steaming = g.actionKind == "steam" && g.actionTimer > 0f
        for (n in g.npcsIn[g.interior] ?: emptyList()) {
            if (steaming && n.name == "Дядя Миша") continue
            drawChar(n.x, n.y, n.z, n.yaw, n.look, 0f, false, n.pose)
        }
        if (steaming) {
            // банщик с веником над игроком
            val miha = g.npcsIn[0]!![0]
            val ax = g.px + 1.1f
            val az = g.pz + 1.4f
            val swingA = sin(time * 7f)
            drawChar(ax, 0f, az, PIF * 1.25f, miha.look, 0f, false, 0)
            setBase(ax - 0.4f, 1.9f + 0.25f * swingA, az - 0.5f, 0f, 0f, 20f * swingA)
            part(0f, 0f, 0f, 0.3f, 0.1f, 0.5f, 0xFF3B7A2E.toInt())
            setBase(g.px, 1.2f + 0.3f * swingA, g.pz + 0.5f, 0f, 0f, 0f)
            part(0f, 0f, 0f, 0.6f, 0.08f, 0.5f, 0xFF3B7A2E.toInt())
        }
        for (s in g.spotsIn[g.interior] ?: emptyList()) {
            val col = if (s.action == "exit") 0xFF40FF70.toInt() else 0xFFFFD040.toInt()
            box(s.x, 0f, s.z, 0.5f, 0.05f, 0.5f, col)
        }
    }
}
