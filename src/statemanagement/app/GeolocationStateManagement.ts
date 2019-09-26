import { GeolocationPosition, Plugins } from "@capacitor/core";
import { geopositionToObject } from "../../helpers/utils";
const { Geolocation } = Plugins;
import Geosimulation from '../../helpers/geolocationsimulator';
import { recordingOnNewPosition } from './RecordingStateManagement';

interface GeolocationState {
    position: GeolocationPosition;
    positionsHistory: Array<Array<Number>>
}

const getInitialState = (): GeolocationState => {
    return {
        position: null,
        positionsHistory: []
    };
};


const SET_POSITION = 'Geolocation/SET_POSITION';
const ADD_POSITION_TO_HISTORY = 'Geolocation/ADD_POSITION_TO_HISTORY';
const CLEAR_POSITION_HISTORY = 'Geolocation/CLEAR_POSITION_HISTORY';
//const GET_POSITION = 'Geolocation/GET_POSITION';

export function simulateGeolocation() {
    var coordinates = [
        { latitude: 46.30785436578275, longitude: 1.7742705345153809 },
        { latitude: 46.30727628127203, longitude: 1.7754185199737547 },
        { latitude: 46.30691312249563, longitude: 1.7756867408752441 },
        { latitude: 46.30700205956158, longitude: 1.776491403579712 },
        { latitude: 46.30722440159435, longitude: 1.7767703533172605 }
    ]
    var simulation = Geosimulation({ coords: coordinates, speed: 15 });
    simulation.start();
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

export function onNewPosition(position) {
    return (dispatch, getState) => {

        const positionsHistory = getState().geolocation.positionsHistory;
        if(positionsHistory.length > 0) {
            const previousPosition = positionsHistory[positionsHistory.length - 1];
            if (
                position.coords.longitude !== previousPosition[0] ||
                position.coords.latitude !== previousPosition[1]
            ) {
                dispatch(addPositionToHistory([position.coords.longitude, position.coords.latitude]));
                // notify RecordingStateManagement of a new position
                dispatch(recordingOnNewPosition([position.coords.longitude, position.coords.latitude]))
            }
        } else {
            dispatch(addPositionToHistory([position.coords.longitude, position.coords.latitude]));
            // notify RecordingStateManagement of a new position
            dispatch(recordingOnNewPosition([position.coords.longitude, position.coords.latitude]))
        }

        dispatch(setPosition(position));
    }
}

export function getAndWatchPosition() {
    return (dispatch) => {
        Geolocation.getCurrentPosition({
            timeout: 15000
        }).then((position) => {
            // TODO handle error ?
            // Need to transform geoposition DOM element to normal object otherwise redux can't parse it reducer:
            dispatch(onNewPosition(geopositionToObject(position)));
        })

        Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 15000
        }, (position) => {
            // TODO dispatch watcher enabled
            if (position) {
                //console.log('Dispatch watch position')
                dispatch(onNewPosition(geopositionToObject(position)));
            } else {
                console.log('position null when watchPosition, todo need to dispatch onLocationError');
                // TODO do something
            }
        })
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
    }
    return state;
};

export default geolocationReducer;