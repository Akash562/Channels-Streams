package com.tvchannel

import android.content.Intent
import android.content.res.Configuration
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.orientationdirector.implementation.ConfigurationChangedBroadcastReceiver

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "TvChannel"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Forwards rotation changes to react-native-orientation-director so the
   * player can lock to landscape and the channel list back to portrait.
   */
  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)

    val orientationDirectorCustomAction =
        "${packageName}.${ConfigurationChangedBroadcastReceiver.CUSTOM_INTENT_ACTION}"

    val intent =
        Intent(orientationDirectorCustomAction).apply {
          putExtra("newConfig", newConfig)
          setPackage(packageName)
        }

    this.sendBroadcast(intent)
  }
}
