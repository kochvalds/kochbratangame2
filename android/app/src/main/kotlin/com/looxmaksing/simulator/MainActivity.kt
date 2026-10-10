package com.looxmaksing.simulator

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebResourceError
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
import androidx.webkit.WebViewAssetLoader

import android.content.Context
import android.webkit.ConsoleMessage
import java.io.InputStream

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

    @JavascriptInterface
    fun onGymWorkoutComplete(exerciseName: String, weightKg: Int) {
        activity.runOnUiThread {
            Toast.makeText(activity, "🏋️ $exerciseName ($weightKg кг) успешно выполнен! V-Taper растет!", Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun onAchievementUnlocked(title: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, "🏆 Достижение разблокировано: $title!", Toast.LENGTH_LONG).show()
        }
    }

    @JavascriptInterface
    fun onKochBratanDialog(topic: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, "🤝 Коч Братан: $topic", Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun onWeaponFired(weaponName: String) {
        // Native vibration/haptic feedback trigger on real Android hardware
    }
}

private fun getMimeType(filename: String): String {
    return when {
        filename.endsWith(".html", ignoreCase = true) -> "text/html"
        filename.endsWith(".js", ignoreCase = true) || filename.endsWith(".mjs", ignoreCase = true) -> "text/javascript"
        filename.endsWith(".css", ignoreCase = true) -> "text/css"
        filename.endsWith(".json", ignoreCase = true) -> "application/json"
        filename.endsWith(".png", ignoreCase = true) -> "image/png"
        filename.endsWith(".jpg", ignoreCase = true) || filename.endsWith(".jpeg", ignoreCase = true) -> "image/jpeg"
        filename.endsWith(".webp", ignoreCase = true) -> "image/webp"
        filename.endsWith(".svg", ignoreCase = true) -> "image/svg+xml"
        filename.endsWith(".mp3", ignoreCase = true) -> "audio/mpeg"
        filename.endsWith(".wav", ignoreCase = true) -> "audio/wav"
        filename.endsWith(".woff2", ignoreCase = true) -> "font/woff2"
        filename.endsWith(".woff", ignoreCase = true) -> "font/woff"
        filename.endsWith(".ttf", ignoreCase = true) -> "font/ttf"
        else -> "application/octet-stream"
    }
}

private fun openAssetStream(context: Context, rawPath: String): Pair<InputStream, String>? {
    val clean = rawPath.trimStart('/')
    val candidates = listOf(
        clean,
        clean.removePrefix("assets/"),
        if (clean.startsWith("assets/")) clean else "assets/$clean",
        clean.removePrefix("assets/assets/").let { "assets/$it" }
    ).distinct()

    for (candidate in candidates) {
        val target = if (candidate.isEmpty() || candidate == "assets" || candidate == "assets/") "index.html" else candidate
        try {
            val stream = context.assets.open(target)
            return Pair(stream, target)
        } catch (_: Exception) {
            // try next
        }
    }
    return null
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
            val assetLoader = WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
                .addPathHandler("/res/", WebViewAssetLoader.ResourcesPathHandler(context))
                .build()

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
                    allowFileAccessFromFileURLs = true
                    allowUniversalAccessFromFileURLs = true
                    cacheMode = WebSettings.LOAD_DEFAULT
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    mediaPlaybackRequiresUserGesture = false
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    displayZoomControls = false
                    builtInZoomControls = false
                    setSupportZoom(false)
                }

                addJavascriptInterface(AndroidBridge(activity), "AndroidApp")

                webChromeClient = object : WebChromeClient() {
                    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                        android.util.Log.d(
                            "LooxmaksingGameJS",
                            "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}"
                        )
                        return true
                    }
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): WebResourceResponse? {
                        val url = request?.url ?: return null
                        val host = url.host ?: ""

                        // Handle virtual app domain or local calls
                        if (host.contains("androidplatform.net") || host.contains("localhost") || url.scheme == "https" || url.scheme == "http") {
                            val path = url.path ?: "/"
                            val result = openAssetStream(context, path)
                            if (result != null) {
                                val (stream, targetName) = result
                                val mimeType = getMimeType(targetName)
                                val encoding = if (mimeType.startsWith("text/") || mimeType.contains("javascript")) "utf-8" else null
                                val headers = mapOf(
                                    "Access-Control-Allow-Origin" to "*",
                                    "Access-Control-Allow-Methods" to "GET, POST, OPTIONS",
                                    "Access-Control-Allow-Headers" to "*"
                                )
                                return WebResourceResponse(mimeType, encoding, 200, "OK", headers, stream)
                            }
                        }

                        // Fallback to official WebViewAssetLoader
                        return assetLoader.shouldInterceptRequest(url)
                    }

                    override fun onReceivedError(
                        view: WebView?,
                        request: WebResourceRequest?,
                        error: WebResourceError?
                    ) {
                        super.onReceivedError(view, request, error)
                        android.util.Log.e("LooxmaksingGame", "WebView error: ${error?.description} on ${request?.url}")
                    }

                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        android.util.Log.i("LooxmaksingGame", "Page loaded: $url")
                    }
                }

                // Load via secure HTTPS app domain supported by WebViewAssetLoader
                loadUrl("https://appassets.androidplatform.net/assets/index.html")
                onWebViewReady(this)
            }
        }
    )
}

