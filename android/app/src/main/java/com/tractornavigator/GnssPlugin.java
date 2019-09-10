package com.tractornavigator;

import android.location.GnssMeasurement;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;

@NativePlugin()
public class GnssPlugin extends Plugin {

  @PluginMethod()
  public void customCall(PluginCall call) {
    String message = call.getString("value");
    JSObject ret = new JSObject();
    //GnssMeasurement()
    ret.put("value", message);
    call.success(ret);
  }
}
