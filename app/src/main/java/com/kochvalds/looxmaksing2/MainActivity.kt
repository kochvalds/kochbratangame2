package com.kochvalds.looxmaksing2

import android.app.Activity
import android.app.AlertDialog
import android.graphics.Color
import android.opengl.GLSurfaceView
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

class MainActivity : Activity(), Ui {

    private lateinit var game: Game
    private lateinit var glView: GLSurfaceView
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        game = Game(this, this)

        glView = GLSurfaceView(this)
        glView.setEGLContextClientVersion(2)
        glView.setEGLConfigChooser(8, 8, 8, 8, 16, 0)
        glView.setRenderer(GameRenderer(game))
        glView.renderMode = GLSurfaceView.RENDERMODE_CONTINUOUSLY

        val hud = HudView(this, game) { game.openMenu() }

        val root = FrameLayout(this)
        root.addView(glView, FrameLayout.LayoutParams(-1, -1))
        root.addView(hud, FrameLayout.LayoutParams(-1, -1))
        setContentView(root)
        hideSystemUi()
    }

    @Suppress("DEPRECATION")
    private fun hideSystemUi() {
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)
    }

    override fun onResume() {
        super.onResume()
        glView.onResume()
        hideSystemUi()
    }

    override fun onPause() {
        super.onPause()
        glView.onPause()
        game.save()
    }

    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        if (game.dialogCount == 0) game.openMenu()
    }

    override fun choice(title: String, msg: String, options: List<Pair<String, () -> Unit>>) {
        handler.post {
            val box = LinearLayout(this)
            box.orientation = LinearLayout.VERTICAL
            box.setPadding(40, 20, 40, 20)

            val tv = TextView(this)
            tv.text = msg
            tv.textSize = 16f
            tv.setTextColor(Color.WHITE)
            tv.setPadding(0, 0, 0, 20)
            box.addView(tv)

            val scroll = ScrollView(this)
            scroll.addView(box)
            val dlg = AlertDialog.Builder(this, android.R.style.Theme_Material_Dialog_Alert)
                .setTitle(title)
                .setView(scroll)
                .create()

            for ((label, act) in options) {
                val b = Button(this)
                b.text = label
                b.isAllCaps = false
                b.setOnClickListener {
                    dlg.dismiss()
                    synchronized(game) { act() }
                }
                box.addView(b)
            }
            val close = Button(this)
            close.text = "Закрыть"
            close.setOnClickListener { dlg.dismiss() }
            box.addView(close)

            dlg.setOnDismissListener {
                game.dialogCount = maxOf(0, game.dialogCount - 1)
                hideSystemUi()
            }
            game.dialogCount = game.dialogCount + 1
            dlg.show()
        }
    }
}
