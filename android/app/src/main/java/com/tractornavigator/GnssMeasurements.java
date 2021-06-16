package com.tractornavigator;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.GnssStatus;
import android.location.LocationManager;
import android.os.Build;
import android.annotation.SuppressLint;
import androidx.annotation.RequiresApi;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;

import java.util.HashMap;
import java.util.Map;

/**
 * GnssPlugin plugin to get insights from Raw measurements API
 *
 */
@NativePlugin(
        permissions={
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_BACKGROUND_LOCATION
        },
        permissionRequestCode = PluginRequestCodes.GEOLOCATION_REQUEST_PERMISSIONS
)
public class GnssMeasurements extends Plugin {
  private LocationManager locationManager;
  private GnssStatus mGnssStatus = null;
  private GnssStatus.Callback mGnssStatusListener;
  private boolean gnssMeasurementsSupported;
  private boolean gnssStatusListenerInitialized = false;
  private static final String TAG = "GnssMeasurements";
  private PluginCall watchSatelliteCall = null;
  final float TOLERANCE_MHZ = 1f;

  Map<String, PluginCall> watchingCalls = new HashMap<>();

  public void load() {
    // nothing to do here
    locationManager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
  }

  public static boolean areGnssMeasurementsSupported() {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.N;
  }

  public static boolean isGnssCarrierFrequenciesSupported() {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.O;
  }

  @PluginMethod(returnType=PluginMethod.RETURN_CALLBACK)
  public void init(PluginCall call) {
    Log.d(TAG, "GnssStatusListener init()");
    call.save();
    if (!hasRequiredPermissions()) {
      Log.d(TAG, "GnssStatusListener permission not required, require them");
      saveCall(call);
      pluginRequestAllPermissions();
    } else {
      if (areGnssMeasurementsSupported()) {
        Log.d(TAG, "GnssStatusListener permission OK + SDK version supported");
        if(!gnssStatusListenerInitialized) {
          // Save call until GnssStatus is calling onSatelliteStatusChanged
          saveCall(call);
          Log.d(TAG, "GnssStatusListener not init , init GnssStatusListener");
          addGnssStatusListener();
          gnssStatusListenerInitialized = true;
        } else {
          Log.d(TAG, "GnssStatusListener initialized returned satellite data");
          JSObject ret = new JSObject();
          gnssMeasurementsSupported = true;
          ret.put("gnssMeasurementsSupported", gnssMeasurementsSupported);
          call.resolve(ret);
        }
      } else {
        Log.d(TAG, "GnssStatusListener permission OK but SDK version not supported");
        gnssMeasurementsSupported = false;
        JSObject ret = new JSObject();
        ret.put("gnssMeasurementsSupported", gnssMeasurementsSupported);
        call.resolve(ret);
      }
    }
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  @PluginMethod(returnType=PluginMethod.RETURN_CALLBACK)
  public void watchSatellite(PluginCall call) {
    call.save();
    // If GnssMeasurements initialized
    Log.d(TAG, "watchSatellite() called");
    if (mGnssStatus != null) {
      Log.d(TAG, "watchSatellite() record call");
      watchSatelliteCall = call;
      Log.d(TAG,"call compileSatelliteData()");
      compileSatelliteData(mGnssStatus, call);
    } else {
      Log.d(TAG, "watchSatellite() failed You must call init() first");
      call.reject("You must call init() first");
    }
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  public void compileSatelliteData(GnssStatus status, PluginCall call) {
    Log.d(TAG,"compileSatelliteData() called");
    // Compile all data necessary for knowing
    // - total satellite count
    // - isGalileoInRange:: getConstellationType
    // - is DualFrequencyInRange , if supports Carrier frequency + infer label from frequency https://github.com/barbeau/gpstest/blob/d4e670d9aba4a19ee2571d077191317a0d0b5550/GPSTest/src/main/java/com/android/gpstest/util/CarrierFreqUtils.java
    // - Nb Galileo satellite in fix getConstellationType
    // - Nb of satellite in fix

    int nbSatellitesInRange = status.getSatelliteCount();
    boolean dualFreqSupported = false;
    int nbGalileoSatelliteInRange = 0;
    int nbGalileoE5SatelliteInRange = 0;
    int nbSatelliteInFix = 0;
    int nbGalileoSatelliteInFix = 0;
    int nbGalileoE5SatelliteInFix = 0;

    int currentSatelliteIndex = 0;
    // Iterate over all satellite in range
    while (currentSatelliteIndex < nbSatellitesInRange) {

      boolean usedInFix = status.usedInFix(currentSatelliteIndex);

      if(usedInFix) {
        nbSatelliteInFix++;
      }

      if(status.getConstellationType(currentSatelliteIndex) == GnssStatus.CONSTELLATION_GALILEO) {
        nbGalileoSatelliteInRange++;
        if(usedInFix) {
          nbGalileoSatelliteInFix++;
        }
      }

      // Check if dual frequency
      if (isGnssCarrierFrequenciesSupported()) {
        if (status.hasCarrierFrequencyHz(currentSatelliteIndex)) {
          float carrierMhz = MathUtils.toMhz(status.getCarrierFrequencyHz(currentSatelliteIndex));

          if (MathUtils.fuzzyEquals(carrierMhz, 1176.45f, TOLERANCE_MHZ)) {
            dualFreqSupported = true;

            if(status.getConstellationType(currentSatelliteIndex) == GnssStatus.CONSTELLATION_GALILEO) {
              // E5a
              nbGalileoE5SatelliteInRange++;
              if(usedInFix) {
                nbGalileoE5SatelliteInFix++;
              }
            }

          }
        }
      }

      currentSatelliteIndex++;
    }

    JSObject result = new JSObject();

    result.put("nbSatellitesInRange", nbSatellitesInRange);
    result.put("dualFreqSupported", dualFreqSupported);
    result.put("nbGalileoSatelliteInRange", nbGalileoSatelliteInRange);
    result.put("nbGalileoE5SatelliteInRange", nbGalileoE5SatelliteInRange);
    result.put("nbSatelliteInFix", nbSatelliteInFix);
    result.put("nbGalileoSatelliteInFix", nbGalileoSatelliteInFix);
    result.put("nbGalileoE5SatelliteInFix", nbGalileoE5SatelliteInFix);

    Log.d(TAG, "nbSatellitesInRange " + nbSatellitesInRange + " nbGalileoSatelliteInRange " + nbGalileoSatelliteInRange + " nbSatelliteInFix " + nbSatelliteInFix + " nbGalileoSatelliteInFix " +  nbGalileoSatelliteInFix + " nbGalileoE5SatelliteInRange " + nbGalileoE5SatelliteInRange + " nbGalileoE5SatelliteInFix " + nbGalileoE5SatelliteInFix);

    call.success(result);
  }

  @SuppressLint("MissingPermission")
  @RequiresApi(Build.VERSION_CODES.N)
  private void addGnssStatusListener() {
    mGnssStatusListener = new GnssStatus.Callback() {
      @Override
      public void onStarted() {
        // TODO use ?
      }

      @Override
      public void onStopped() {
        // TODO use ?
      }

      @Override
      public void onFirstFix(int ttffMillis) {
        // TODO use ?
      }

      @Override
      public void onSatelliteStatusChanged(GnssStatus status) {
        Log.d(TAG,"GnssStatus.Callback.onSatelliteStatusChanged() - " + status.getSatelliteCount());
        mGnssStatus = status;

        // Get the previously saved call
        PluginCall savedCall = getSavedCall();

        if (savedCall == null) {
          Log.d(TAG,"GnssMeasurementsEvent.Callback.onStatusChanged() savedCall null");
          return;
        }

        if (savedCall.getMethodName().equals("init")) {
          Log.d(TAG,"GnssMeasurementsEvent.Callback.onStatusChanged() call savedCall init");
          init(savedCall);
        }

        if(watchSatelliteCall != null) {
          Log.d(TAG,"call compileSatelliteData()");
          compileSatelliteData(status, watchSatelliteCall);
        }
      }
    };
    locationManager.registerGnssStatusCallback(mGnssStatusListener);
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
    if (savedCall.getMethodName().equals("init")) {
      init(savedCall);
    } else {
      savedCall.resolve();
      savedCall.release(bridge);
    }
  }

}
