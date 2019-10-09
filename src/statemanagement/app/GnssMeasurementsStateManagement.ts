import { Plugins } from '@capacitor/core';
const { GnssMeasurements } = Plugins;

interface GnssMeasurementsState {
    areSupported: boolean
}

const getInitialState = (): GnssMeasurementsState => {
    return {
        areSupported: null
    };
};


const SET_GNSSMEASUREMENTS_SUPPORTED = 'GnssMeasurements/SET_GNSSMEASUREMENTS_SUPPORTED';

export function initGnssMeasurements(platform) {
    return (dispatch) => {
        if(platform === "android") {
            // dispatch(GnssMeasurements.areGnssMeasurementsSupported())
            GnssMeasurements.init(() => {
                GnssMeasurements.watchSatellite((data) => {
                    // new satellite update
                    console.log(data);
                });
            })
        } else {
            dispatch(setGnssMeasurementsSupported(false))
        }
    }
}

export function setGnssMeasurementsSupported(areSupported) {
    return {
        type: SET_GNSSMEASUREMENTS_SUPPORTED,
        payload: areSupported
    }
}

const GnssMeasurementsStateStateReducer = (
    state = getInitialState(),
    action: any
): GnssMeasurementsState => {
    switch (action.type) {
        case SET_GNSSMEASUREMENTS_SUPPORTED: {
            return {
                ...state,
                areSupported: action.payload
            };
        }
    }
    return state;
};

export default GnssMeasurementsStateStateReducer;