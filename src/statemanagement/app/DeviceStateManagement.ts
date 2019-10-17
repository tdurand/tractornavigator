import { Plugins } from '@capacitor/core';
import { simulateGeolocation } from './GeolocationStateManagement';
const { Device } = Plugins;

interface DeviceState {
    deviceInfo: any
}

const getInitialState = (): DeviceState => {
    return {
        deviceInfo: null
    };
};


const SET_DEVICE_INFO = 'DEVICE/SET_DEVICE_INFO';

export function getDeviceInfo() {
    return (dispatch) => {
        Device.getInfo().then((deviceInfo) => {
            dispatch({
                type: SET_DEVICE_INFO,
                payload: deviceInfo
            })

            //console.log(deviceInfo);

            if(deviceInfo.platform === "web") {
                //Simulate geolocation
                console.log('simulateGeolocation')
                simulateGeolocation();
            } else {
                // enable do not sleep 
                // @ts-ignore
                window.plugins.insomnia.keepAwake();
            }
        });
    }
}

const deviceStateReducer = (
    state = getInitialState(),
    action: any
): DeviceState => {
    switch (action.type) {
        case SET_DEVICE_INFO: {
            return {
                ...state,
                deviceInfo: action.payload
            };
        }
    }
    return state;
};

export default deviceStateReducer;