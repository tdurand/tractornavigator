// TODO create an object <Recording>, and probably store as a Map for O(1) read
import { loadState, persistState } from '../../statemanagement/localStorage';


interface HistoryState {
    recordings: Array<any>
}

const getInitialState = (): HistoryState => {
    return {
        recordings: []
    };
};


const SAVE_RECORDING = 'History/SAVE_RECORDING';
const RESTORE_ALL_RECORDINGS = 'History/RESTORE_ALL_RECORDINGS';

export function saveRecording(recording) {
    return (dispatch) => {

        dispatch({
            type: SAVE_RECORDING,
            payload: recording
        })

        dispatch(persistHistory());
    }
}

export function restoreHistory() {
    return (dispatch) => {
        const savedState = loadState('history');
        if(savedState) {
            dispatch({
                type: RESTORE_ALL_RECORDINGS,
                payload: savedState.recordings
            })
        }
    }
}

export function persistHistory() {
    // @ts-ignore
    return (dispatch, getState) => {
        persistState(getState().history, 'history');
    }
}

const historyStateReducer = (
    state = getInitialState(),
    action: any
): HistoryState => {
    switch (action.type) {
        case SAVE_RECORDING: {
            const MAX_ITEMS = 20;
            if(state.recordings.length > MAX_ITEMS) {
                // Remove oldest item before concat (index 0)
                // .filter((_value, index) => index > 0)
                return {
                    ...state,
                    recordings: state.recordings.concat([action.payload]).filter((_value, index) => index > 0)
                };
            } else {
                return {
                    ...state,
                    recordings: state.recordings.concat([action.payload])
                };
            }
        }
        case RESTORE_ALL_RECORDINGS: {
            return {
                ...state,
                recordings: action.payload
            }
        }
    }
    return state;
};

export default historyStateReducer;