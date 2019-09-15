import geolocation from "./app/GeolocationStateManagement";

import { combineReducers } from "redux";

export const rootReducer = combineReducers({
  geolocation
});

export default rootReducer;