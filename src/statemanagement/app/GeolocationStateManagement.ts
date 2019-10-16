import { GeolocationPosition, Plugins } from "@capacitor/core";
import { geopositionToObject, computeHeading } from "../../helpers/utils";
const { Geolocation } = Plugins;
import Geosimulation from '../../helpers/geolocationsimulator';
import { recordingOnNewPosition } from './RecordingStateManagement';
import { handleNewPosition } from "./MapStateManagement";
import { initGnssMeasurements } from "./GnssMeasurementsStateManagement";
import { updateGuidingLinesOnNewPosition } from "./GuidingStateManagement";

export enum AccuracyStatus { Poor, Medium, Good}

interface GeolocationState {
    position: GeolocationPosition;
    positionsHistory: Array<Array<Number>>;
    accuracyStatus: AccuracyStatus
}

const getInitialState = (): GeolocationState => {
    return {
        position: null,
        positionsHistory: [],
        accuracyStatus: AccuracyStatus.Poor
    };
};


const SET_POSITION = 'Geolocation/SET_POSITION';
const ADD_POSITION_TO_HISTORY = 'Geolocation/ADD_POSITION_TO_HISTORY';
const CLEAR_POSITION_HISTORY = 'Geolocation/CLEAR_POSITION_HISTORY';
const SET_ACCURACY_STATUS = 'Geolocation/SET_ACCURACY_STATUS';

export function simulateGeolocation() {

    var rawData = [[
      2.2327351570129395,
      46.13804529042091
    ],
    [
      2.2323301434516907,
      46.13784270647383
    ],
    [
      2.232322096824646,
      46.13782969647013
    ],
    [
      2.232327461242676,
      46.13781668646334
    ],
    [
      2.2323355078697205,
      46.13779995930723
    ],
    [
      2.2323569655418396,
      46.13778509071975
    ],
    [
      2.2323891520500183,
      46.13777579785055
    ],
    [
      2.2324106097221375,
      46.13776836355405
    ],
    [
      2.2324562072753906,
      46.13776836355405
    ],
    [
      2.232493758201599,
      46.137792525013985
    ],
    [
      2.232576906681061,
      46.13783155504229
    ],
    [
      2.232652008533478,
      46.13787430218437
    ],
    [
      2.232694923877716,
      46.13789660502794
    ],
    [
      2.2327351570129395,
      46.13791333215469
    ],
    [
      2.232772707939148,
      46.137928200707535
    ],
    [
      2.232794165611267,
      46.137944927824684
    ],
    [
      2.232820987701416,
      46.137937493551036
    ],
    [
      2.232847809791565,
      46.137918907862485
    ],
    [
      2.2328585386276245,
      46.13789846359784
    ],
    [
      2.2328531742095947,
      46.13788173646657
    ],
    [
      2.2328531742095947,
      46.13785943361697
    ],
    [
      2.2328397631645203,
      46.13783898933024
    ],
    [
      2.232788801193237,
      46.137814827890686
    ],
    [
      2.2327271103858943,
      46.137786949293414
    ],
    [
      2.2326895594596863,
      46.13776650497977
    ],
    [
      2.2326385974884033,
      46.13774977780842
    ],
    [
      2.23259836435318,
      46.13772933348096
    ],
    [
      2.2325420379638667,
      46.137694020533864
    ],
    [
      2.232520580291748,
      46.137681010495015
    ],
    [
      2.232523262500763,
      46.13766614187542
    ],
    [
      2.2325366735458374,
      46.137647556095295
    ],
    [
      2.232550084590912,
      46.13762897030888
    ],
    [
      2.232566177845001,
      46.137617818834
    ],
    [
      2.2326037287712093,
      46.13760480877716
    ],
    [
      2.2326332330703735,
      46.13761038451618
    ],
    [
      2.2326841950416565,
      46.13763082888779
    ],
    [
      2.2327271103858943,
      46.13764941467357
    ],
    [
      2.2327780723571777,
      46.137682869072194
    ],
    [
      2.2328397631645203,
      46.13769587911058
    ],
    [
      2.2328531742095947,
      46.13771446487443
    ],
    [
      2.232896089553833,
      46.13772561632971
    ],
    [
      2.2329148650169373,
      46.13773862635802
    ],
    [
      2.2329336404800415,
      46.13774606065852
    ],
    [
      2.232968509197235,
      46.13776092925653
    ],
    [
      2.232992649078369,
      46.13774606065852
    ],
    [
      2.2330033779144287,
      46.137742343508386
    ],
    [
      2.233024835586548,
      46.13772933348096
    ],
    [
      2.233043611049652,
      46.13770145484041
    ],
    [
      2.2330275177955627,
      46.137681010495015
    ],
    [
      2.2330087423324585,
      46.137658707564114
    ],
    [
      2.2329604625701904,
      46.13763268746667
    ],
    [
      2.232896089553833,
      46.137608525936585
    ],
    [
      2.2328343987464905,
      46.1375825058154
    ],
    [
      2.232767343521118,
      46.13754347561059
    ],
    [
      2.232716381549835,
      46.13751745545867
    ]]
    var coordinates = rawData.map((point) => {
        return {
            latitude: point[1],
            longitude: point[0]
        }
    })
    var simulation = Geosimulation({ coords: coordinates, speed: 15 });
    console.log('start simulation');
    setTimeout(() => {
      simulation.start();
    }, 3000);
    //simulation.start();
}

export function setPosition(position: GeolocationPosition) {
    return {
        type: SET_POSITION,
        payload: position
    }
}

export function addPositionToHistory(positionCoordinates) {
    return {
        type: ADD_POSITION_TO_HISTORY,
        payload: positionCoordinates
    }
}

export function clearPositionHistory() {
    return {
        type: CLEAR_POSITION_HISTORY
    }
}

export function setAccuracyStatus(accuracyStatus: AccuracyStatus) {
  return {
      type: SET_ACCURACY_STATUS,
      payload: accuracyStatus
  }
}

export function onNewPosition(position) {
    return (dispatch, getState) => {

        const positionsHistory = getState().geolocation.positionsHistory;
        if(positionsHistory.length > 0) {
            const previousPosition = positionsHistory[positionsHistory.length - 1];
            // On new position
            if (
                position.coords.longitude !== previousPosition[0] ||
                position.coords.latitude !== previousPosition[1]
            ) {
                // If no heading defined
                if(position.coords.heading === undefined) {
                    position.coords.heading = computeHeading(previousPosition, [position.coords.longitude, position.coords.latitude])
                }
                dispatch(addPositionToHistory([position.coords.longitude, position.coords.latitude]));
                // notify RecordingStateManagement of a new position
                dispatch(recordingOnNewPosition([position.coords.longitude, position.coords.latitude]))
            } else {
                //console.log('same position');
            }
        } else {
            dispatch(addPositionToHistory([position.coords.longitude, position.coords.latitude]));
            // notify RecordingStateManagement of a new position
            dispatch(recordingOnNewPosition([position.coords.longitude, position.coords.latitude]))
        }

        dispatch(updateGuidingLinesOnNewPosition(position))
        dispatch(handleNewPosition(position));
        dispatch(setPosition(position));

        // Compute accuracy status
        let accuracyStatus = AccuracyStatus.Poor;
        if(position) {
          if(position.coords.accuracy <= 4 && getState().gnssmeasurements.dualFreqSupported) {
            accuracyStatus = AccuracyStatus.Good;
          } else if(position.coords.accuracy <= 6 && getState().gnssmeasurements.isGalileoSupported) {
            accuracyStatus = AccuracyStatus.Medium;
          } else {
            accuracyStatus = AccuracyStatus.Poor;
          }
        }

        dispatch(setAccuracyStatus(accuracyStatus));
    }
}

export function getAndWatchPosition() {
    return (dispatch, getState) => {
        Geolocation.getCurrentPosition({
            timeout: 15000
        }).then((position) => {
            // TODO handle error ?
            // Need to transform geoposition DOM element to normal object otherwise redux can't parse it reducer:
            dispatch(onNewPosition(geopositionToObject(position)));
        }, (error) => {
          console.log(error);
        })

        setTimeout(() => {
          Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 15000
          }, (position, err) => {
              if(err) {
                console.log(err);
              }
              // TODO dispatch watcher enabled
              if (position) {
                  // If GNSS measurements not initialized
                  if(!getState().gnssmeasurements.isInitializing && 
                    getState().gnssmeasurements.rawMeasurements === null) {
                    if(getState().device.deviceInfo.platform) {
                      dispatch(initGnssMeasurements(getState().device.deviceInfo.platform))
                    }
                  }
                  //console.log('Dispatch watch position')
                  dispatch(onNewPosition(geopositionToObject(position)));
              } else {
                  console.log('position null when watchPosition, todo need to dispatch onLocationError');
                  // TODO do something
              }
          })

        }, 200)   
    }
}


const geolocationReducer = (
    state = getInitialState(),
    action: any
): GeolocationState => {
    switch (action.type) {
        case SET_POSITION: {
            return {
                ...state,
                position: action.payload
            };
        }
        case ADD_POSITION_TO_HISTORY: {
            return {
                ...state,
                positionsHistory: state.positionsHistory.concat([action.payload])
            }
        }
        case CLEAR_POSITION_HISTORY: {
            return {
                ...state,
                positionsHistory: []
            }
        }
        case SET_ACCURACY_STATUS: {
          return {
            ...state,
            accuracyStatus: action.payload
          }
        }
    }
    return state;
};

export default geolocationReducer;