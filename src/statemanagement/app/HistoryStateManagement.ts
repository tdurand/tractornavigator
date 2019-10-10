// TODO create an object <Recording>, and probably store as a Map for O(1) read
import { loadHistoryState, persistHistoryState } from '../../statemanagement/localStorage';


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
        const savedState = loadHistoryState();
        if(savedState) {
            dispatch({
                type: RESTORE_ALL_RECORDINGS,
                payload: savedState.recordings
            })
        }
    }
}

export function persistHistory() {
    return (dispatch, getState) => {
        persistHistoryState(getState().history);
    }
}

const historyStateReducer = (
    state = getInitialState(),
    action: any
): HistoryState => {
    switch (action.type) {
        case SAVE_RECORDING: {
            return {
                ...state,
                recordings: state.recordings.concat([action.payload])
            };
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