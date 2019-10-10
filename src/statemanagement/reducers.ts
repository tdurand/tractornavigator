import geolocation from "./app/GeolocationStateManagement";
import guiding from "./app/GuidingStateManagement";
import recording from "./app/RecordingStateManagement";
import history from "./app/HistoryStateManagement";
import map from "./app/MapStateManagement";
import device from "./app/DeviceStateManagement";
import gnssmeasurements from "./app/GnssMeasurementsStateManagement";
import app from "./app/AppStateManagement";

import { combineReducers } from "redux";

export const rootReducer = combineReducers({
  geolocation,
  guiding,
  recording,
  history,
  map,
  device,
  gnssmeasurements,
  app
});

export default rootReducer;