# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Matrix SDK
-keep class org.matrix.** { *; }
-keep class com.matrix.** { *; }

# Crypto libraries
-keep class javax.crypto.** { *; }
-keep class java.security.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# React Native Keychain
-keep class com.oblador.keychain.** { *; }

# Push notifications
-keep class com.dieam.reactnativepushnotification.** { *; }

# Biometric
-keep class androidx.biometric.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Image picker
-keep class com.reactnativecommunity.imagepicker.** { *; }

# Document picker
-keep class com.reactnativecommunity.rnpermissions.** { *; }

# Gesture handler
-keep class com.swmansion.gesturehandler.** { *; }

# Safe area context
-keep class com.th3rdwave.safeareacontext.** { *; }

# Linear gradient
-keep class com.BV.LinearGradient.** { *; }

# Splash screen
-keep class org.devio.rn.splashscreen.** { *; }
