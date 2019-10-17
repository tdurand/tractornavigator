import { Plugins } from '@capacitor/core';
const { GnssMeasurements } = Plugins;

interface GnssMeasurementsState {
    isInitializing: boolean
    rawMeasurements: any,
    satelliteData: any,
    isGalileoSupported: any,
    dualFreqSupported: any
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
        isInitializing: false,
        rawMeasurements: null,
        satelliteData: null,
        isGalileoSupported: null,
        dualFreqSupported: null
    };
};


const SET_GNSSMEASUREMENTS_SUPPORTED = 'GnssMeasurements/SET_GNSSMEASUREMENTS_SUPPORTED';
const UPDATE_SATELLITE_DATA = 'GnssMeasurements/UPDATE_SATELLITE_DATA';
const SET_GALILEO_SUPPORT = 'GnssMeasurements/SET_GALILEO_SUPPORT';
const SET_DUALFREQ_SUPPORT = 'GnssMeasurements/SET_DUALFREQ_SUPPORT';
const SET_INITIALIZING = 'GnssMeasurements/SET_INITIALIZING';

export function initGnssMeasurements(platform) {
    return (dispatch) => {
        if(platform === "android") {
            // dispatch(GnssMeasurements.areGnssMeasurementsSupported())
            GnssMeasurements.init((data) => {

                dispatch({
                    type: SET_INITIALIZING,
                    payload: true
                })

                if(data.gnssMeasurementsSupported) {

                    dispatch(setGnssMeasurementsSupported(true))

                    GnssMeasurements.watchSatellite((satelliteData) => {

                        if(satelliteData.nbGalileoSatelliteInRange > 0) {
                            dispatch(setGalileoSupport(true));
                        }

                        if(satelliteData.dualFreqSupported) {
                            dispatch(setDualFreqSupport(satelliteData.dualFreqSupported));
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

                dispatch({
                    type: SET_INITIALIZING,
                    payload: false
                })
            })
        } else if(platform === "web") {
            // simulate raw measurements to work on API
            dispatch(setGnssMeasurementsSupported(true))
            dispatch(setGalileoSupport(true))
            dispatch(setDualFreqSupport(true))
        } else {
            dispatch(setGnssMeasurementsSupported(false))
            dispatch(setGalileoSupport(true))
            dispatch(setDualFreqSupport(false))
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

export function setDualFreqSupport(isSupported) {
    return {
        type: SET_DUALFREQ_SUPPORT,
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
        case SET_DUALFREQ_SUPPORT: {
            return {
                ...state,
                dualFreqSupported: action.payload
            }
        }
        case SET_INITIALIZING: {
            return {
                ...state,
                isInitializing: action.payload
            }
        }
    }
    return state;
};

export default GnssMeasurementsStateStateReducer;