plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.kochvalds.looxmaksing2"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.kochvalds.looxmaksing2"
        minSdk = 24
        targetSdk = 34
        versionCode = 300
        versionName = "3.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // подпись debug-ключом, чтобы APK из релиза сразу устанавливался
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
