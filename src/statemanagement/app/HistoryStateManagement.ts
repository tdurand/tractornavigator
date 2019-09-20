// TODO create an object <Recording>, and probably store as a Map for O(1) read

interface HistoryState {
    recordings: Array<any>
}

const getInitialState = (): HistoryState => {
    return {
        recordings: []
    };
};


const SAVE_RECORDING = 'Recording/SAVE_RECORDING';

export function saveRecording(recording) {
    return {
        type: SAVE_RECORDING,
        payload: recording
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
    }
    return state;
};

export default historyStateReducer;