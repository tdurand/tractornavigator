package com.tractornavigator;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.GnssMeasurementsEvent;
import android.location.LocationManager;
import android.os.Build;
import android.annotation.SuppressLint;
import android.support.annotation.RequiresApi;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;

/**
 * GnssPlugin plugin to get insights from Raw measurements API
 *
 */
@NativePlugin(
        permissions={
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_FINE_LOCATION
        },
        permissionRequestCode = PluginRequestCodes.GEOLOCATION_REQUEST_PERMISSIONS
)
public class Gnss extends Plugin {
  private LocationManager locationManager;
  private GnssMeasurementsEvent.Callback mGnssMeasurementsListener;
  private static final String TAG = "GnssPlugin";

  public void load() {
    locationManager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);

    if (isGnssStatusListenerSupported()) {
      Log.d(TAG, "Init GnssEventListener");
      // This permits to know wether raw measurements are supported
      addGnssMeasurementsListener();

    }
  }

  // Exemple callback method
  @PluginMethod(returnType=PluginMethod.RETURN_CALLBACK)
  public void watchPosition(PluginCall call) {
    call.save();
    if (!hasRequiredPermissions()) {
      saveCall(call);
      pluginRequestAllPermissions();
    } else {
      //
      //startWatch(call);
    }
  }

  // Exemple non-callback method
  @PluginMethod()
  public void getStatus(PluginCall call) {
    if (!hasRequiredPermissions()) {
      saveCall(call);
      pluginRequestAllPermissions();
    } else {
      JSObject ret = new JSObject();
      ret.put("status", 1);
      call.resolve(ret);
      //sendLocation(call);
    }
  }

  public static boolean isGnssStatusListenerSupported() {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.N;
  }

  @SuppressLint("MissingPermission")
  @RequiresApi(api = Build.VERSION_CODES.N)
  private void addGnssMeasurementsListener() {
    mGnssMeasurementsListener = new GnssMeasurementsEvent.Callback() {
      @Override
      public void onGnssMeasurementsReceived(GnssMeasurementsEvent event) {
        Log.d(TAG,"GnssMeasurementsEvent.onGnssMeasurementsReceived() - ");
        // TODO
      }

      @Override
      public void onStatusChanged(int status) {
        /*
        switch (status) {
          case STATUS_LOCATION_DISABLED:
            statusMessage = getString(R.string.gnss_measurement_status_loc_disabled);
            PreferenceUtils.saveInt(Application.get().getString(R.string.capability_key_raw_measurements), PreferenceUtils.CAPABILITY_LOCATION_DISABLED);
            break;
          case STATUS_NOT_SUPPORTED:
            statusMessage = getString(R.string.gnss_measurement_status_not_supported);
            PreferenceUtils.saveInt(Application.get().getString(R.string.capability_key_raw_measurements), PreferenceUtils.CAPABILITY_NOT_SUPPORTED);
            break;
          case STATUS_READY:
            statusMessage = getString(R.string.gnss_measurement_status_ready);
            PreferenceUtils.saveInt(Application.get().getString(R.string.capability_key_raw_measurements), PreferenceUtils.CAPABILITY_SUPPORTED);
            break;
          default:
            statusMessage = getString(R.string.gnss_status_unknown);
            PreferenceUtils.saveInt(Application.get().getString(R.string.capability_key_raw_measurements), PreferenceUtils.CAPABILITY_UNKNOWN);
        }
        */
        Log.d(TAG,"GnssMeasurementsEvent.Callback.onStatusChanged() - " + status);
      }
    };
    locationManager.registerGnssMeasurementsCallback(mGnssMeasurementsListener);
  }


  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    PluginCall savedCall = getSavedCall();
    if (savedCall == null) {
      return;
    }

    for(int result : grantResults) {
      if (result == PackageManager.PERMISSION_DENIED) {
        savedCall.error("User denied location permission");
        return;
      }
    }

    // When permission are given, call the methods that what calling
    if (savedCall.getMethodName().equals("getCurrentPosition")) {
      //sendLocation(savedCall);
    } else if (savedCall.getMethodName().equals("watchPosition")) {
      //startWatch(savedCall);
    } else {
      savedCall.resolve();
      savedCall.release(bridge);
    }
  }

}
