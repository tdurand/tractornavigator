import { Plugins } from '@capacitor/core';
const { GnssMeasurements } = Plugins;

interface GnssMeasurementsState {
    rawMeasurements: any,
    satelliteData: any,
    isGalileoSupported: any
}

/*
{
    nbSatellitesInRange
    dualFreqSupported
    nbGalileoSatelliteInRange
    nbGalileoE5SatelliteInRange
    nbSatelliteInFix
    nbGalileoSatelliteInFix
    nbGalileoE5SatelliteInFix
}
*/

const getInitialState = (): GnssMeasurementsState => {
    return {
        rawMeasurements: null,
        satelliteData: null,
        isGalileoSupported: null
    };
};


const SET_GNSSMEASUREMENTS_SUPPORTED = 'GnssMeasurements/SET_GNSSMEASUREMENTS_SUPPORTED';
const UPDATE_SATELLITE_DATA = 'GnssMeasurements/UPDATE_SATELLITE_DATA';
const SET_GALILEO_SUPPORT = 'GnssMeasurements/SET_GALILEO_SUPPORT';

export function initGnssMeasurements(platform) {
    return (dispatch) => {
        if(platform === "android") {
            // dispatch(GnssMeasurements.areGnssMeasurementsSupported())
            GnssMeasurements.init((data) => {

                if(data.gnssMeasurementsSupported) {

                    dispatch(setGnssMeasurementsSupported(true))

                    GnssMeasurements.watchSatellite((satelliteData) => {

                        if(satelliteData.nbGalileoSatelliteInRange > 0) {
                            dispatch(setGalileoSupport(true));
                        }

                        // new satellite update
                        dispatch({
                            type: UPDATE_SATELLITE_DATA,
                            payload: satelliteData
                        })
                    });
                } else {
                    dispatch(setGnssMeasurementsSupported(false))
                }
            })
        } else if(platform === "web") {
            // simulate raw measurements to work on API
            dispatch(setGnssMeasurementsSupported(true))
            dispatch(setGalileoSupport(true))

        } else {
            dispatch(setGnssMeasurementsSupported(false))
            dispatch(setGalileoSupport(false))
            // TODO hardcode from deviceName for iOS
        }
    }
}

export function setGalileoSupport(isSupported) {
    return {
        type: SET_GALILEO_SUPPORT,
        payload: isSupported
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
                rawMeasurements: action.payload
            };
        }
        case UPDATE_SATELLITE_DATA: {
            return {
                ...state,
                satelliteData: action.payload
            };
        }
        case SET_GALILEO_SUPPORT: {
            return {
                ...state,
                isGalileoSupported: action.payload
            }
        }
    }
    return state;
};

export default GnssMeasurementsStateStateReducer;