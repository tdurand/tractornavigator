import { GeolocationPosition, Plugins } from "@capacitor/core";
import { geopositionToObject, computeHeading } from "../../helpers/utils";
const { Geolocation } = Plugins;
import Geosimulation from '../../helpers/geolocationsimulator';
import { recordingOnNewPosition } from './RecordingStateManagement';
import { handleNewPosition } from "./MapStateManagement";

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

    var rawData = [
        [
          1.7735248804092407,
          46.308006297237185
        ],
        [
          1.7736053466796873,
          46.30798035775042
        ],
        [
          1.7736482620239258,
          46.30794330131944
        ],
        [
          1.7737555503845215,
          46.30792847874004
        ],
        [
          1.7738038301467896,
          46.30788771662593
        ],
        [
          1.773895025253296,
          46.307869188382234
        ],
        [
          1.7739540338516235,
          46.30782472057173
        ],
        [
          1.7740345001220703,
          46.30781730926646
        ],
        [
          1.7740988731384275,
          46.30778395838037
        ],
        [
          1.7741954326629639,
          46.30778395838037
        ],
        [
          1.7742490768432617,
          46.307732079183836
        ],
        [
          1.7743724584579468,
          46.307706139567124
        ],
        [
          1.7744046449661255,
          46.30766167162418
        ],
        [
          1.7744958400726318,
          46.30766167162418
        ],
        [
          1.7745280265808105,
          46.30769872824583
        ],
        [
          1.774469017982483,
          46.307732079183836
        ],
        [
          1.774415373802185,
          46.30778025272512
        ],
        [
          1.774367094039917,
          46.30778395838037
        ],
        [
          1.7742544412612915,
          46.307832131876
        ],
        [
          1.7741042375564575,
          46.30788030532921
        ],
        [
          1.774066686630249,
          46.307924773094555
        ],
        [
          1.7739325761795044,
          46.30793589003024
        ],
        [
          1.7738467454910276,
          46.3079988859565
        ],
        [
          1.7737770080566406,
          46.30803594234984
        ],
        [
          1.7737233638763426,
          46.30803594234984
        ],
        [
          1.7736214399337769,
          46.30809523252704
        ],
        [
          1.773519515991211,
          46.30812117195936
        ],
        [
          1.7733746767044067,
          46.30818046204421
        ],
        [
          1.773170828819275,
          46.30824345768902
        ],
        [
          1.7730849981307983,
          46.30827680829515
        ]
      ]

    var coordinates = rawData.map((point) => {
        return {
            latitude: point[1],
            longitude: point[0]
        }
    })
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
        console.log('newPosition');

        dispatch(setPosition(position));
        dispatch(handleNewPosition(position));
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