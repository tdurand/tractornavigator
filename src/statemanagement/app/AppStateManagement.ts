import { loadState, persistState } from '../../statemanagement/localStorage';


interface AppState {
    isFirstStart: boolean,
    nbOpeningBeforeDisplayingGalileoNotificationAgain: number
}

const getInitialState = (): AppState => {
    return {
        isFirstStart: true,
        nbOpeningBeforeDisplayingGalileoNotificationAgain: 14
    };
};


const REGISTER_APP_OPENING = 'App/REGISTER_APP_OPENING';
const RESTORE_APPSTATE = 'App/RESTORE_APPSTATE';
const RESET_NB_OPENING = 'App/RESET_NB_OPENING';

export function registerAppOpening() {
    return (dispatch, getState) => {
        dispatch({
            type: REGISTER_APP_OPENING,
        })

        if(getState().app.nbOpeningBeforeDisplayingGalileoNotificationAgain < 0) {
            dispatch({
                type: RESET_NB_OPENING
            })
        }

        persistState(getState().app, 'app');
    }
}

export function restoreAppState() {
    return (dispatch) => {
        const savedState = loadState('app');
        if(savedState) {
            dispatch({
                type: RESTORE_APPSTATE,
                payload: savedState
            })
        }
    }
}




const appStateReducer = (
    state = getInitialState(),
    action: any
): AppState => {
    switch (action.type) {
        case REGISTER_APP_OPENING: {
            return {
                ...state,
                isFirstStart: false,
                nbOpeningBeforeDisplayingGalileoNotificationAgain: state.nbOpeningBeforeDisplayingGalileoNotificationAgain--
            };
        }
        case RESET_NB_OPENING: {
            return {
                ...state,
                nbOpeningBeforeDisplayingGalileoNotificationAgain: getInitialState().nbOpeningBeforeDisplayingGalileoNotificationAgain 
            }
        }
        case RESTORE_APPSTATE: {
            return {
                ...state,
                ...action.payload
            }
        }
    }
    return state;
};

export default appStateReducer;