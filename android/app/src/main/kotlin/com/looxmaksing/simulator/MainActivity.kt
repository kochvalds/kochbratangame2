package com.looxmaksing.simulator

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {

    private var gameWebView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Handle Android hardware back button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (gameWebView?.canGoBack() == true) {
                    gameWebView?.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

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
                    LooxmaksingGameView(
                        onWebViewReady = { webView ->
                            gameWebView = webView
                        },
                        activity = this
                    )
                }
            }
        }
    }
}

class AndroidBridge(private val activity: ComponentActivity) {
    @JavascriptInterface
    fun showToast(message: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun onBanyaSessionComplete(scoreBonus: Int) {
        activity.runOnUiThread {
            Toast.makeText(activity, "🧖‍♂️ Русская баня: +$scoreBonus к ауре и здоровью!", Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun onLooksmaxTierUp(newTier: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, "🗿 Новый Луксмакс-уровень: $newTier!", Toast.LENGTH_LONG).show()
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun LooxmaksingGameView(
    onWebViewReady: (WebView) -> Unit,
    activity: ComponentActivity
) {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )

                setBackgroundColor(0xFF0F0F12.toInt())
                setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    cacheMode = WebSettings.LOAD_DEFAULT
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    mediaPlaybackRequiresUserGesture = false
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }

                addJavascriptInterface(AndroidBridge(activity), "AndroidApp")

                webChromeClient = WebChromeClient()
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                    }
                }

                // Load the bundled offline game
                loadUrl("file:///android_asset/index.html")
                onWebViewReady(this)
            }
        }
    )
}

