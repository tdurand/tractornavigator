import geolocation from "./app/GeolocationStateManagement";
import guiding from "./app/GuidingStateManagement";
import recording from "./app/RecordingStateManagement";
import history from "./app/HistoryStateManagement";
import map from "./app/MapStateManagement";
import device from "./app/DeviceStateManagement";

import { combineReducers } from "redux";

export const rootReducer = combineReducers({
  geolocation,
  guiding,
  recording,
  history,
  map,
  device
});

export default rootReducer;