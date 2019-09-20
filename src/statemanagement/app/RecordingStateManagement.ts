enum RecordingStatus { Idle, Recording, Paused}

interface RecordingState {
    status: RecordingStatus
    recordedPositions: Array<Array<number>>
    dateStartRecording: Date
}

const getInitialState = (): RecordingState => {
    return {
        status: RecordingStatus.Idle,
        recordedPositions: [],
        dateStartRecording: null
    };
};


const SET_STATUS = 'Recording/SET_STATUS';
const ADD_RECORDED_POSITION = 'Recording/ADD_RECORDED_POSITION';
const SET_DATE_START_RECORDING = 'Recording/SET_DATE_START_RECORDING';

export function setStatus(status: RecordingStatus) {
    return {
        type: SET_STATUS,
        payload: status
    }
}

export function addRecordedPosition(position) {
    return {
        type: ADD_RECORDED_POSITION,
        payload: position
    }
}

export function setDateStartRecording(dateStartRecording: Date) {
    return {
        type: SET_DATE_START_RECORDING,
        payload: dateStartRecording
    }
}

const recordingStateReducer = (
    state = getInitialState(),
    action: any
): RecordingState => {
    switch (action.type) {
        case SET_DATE_START_RECORDING: {
            return {
                ...state,
                dateStartRecording: action.payload
            };
        }
        case ADD_RECORDED_POSITION: {
            return {
                ...state,
                recordedPositions: state.recordedPositions.concat([action.payload])
            };
        }
        case SET_STATUS: {
            return {
                ...state,
                status: action.payload
            };
        }
    }
    return state;
};

export default recordingStateReducer;