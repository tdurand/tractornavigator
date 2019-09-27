import { saveRecording } from "./HistoryStateManagement";
import { resetGuidingState } from "./GuidingStateManagement";

export enum RecordingStatus { Idle, Recording, Paused}

interface RecordingState {
    status: RecordingStatus
    recordedPositions: Array<Array<number>>
    equipmentWidth: number
    dateStart: string

}

const getInitialState = (): RecordingState => {
    return {
        status: RecordingStatus.Idle,
        recordedPositions: [],
        equipmentWidth: null,
        dateStart: null
    };
};


const SET_STATUS = 'Recording/SET_STATUS';
const ADD_RECORDED_POSITION = 'Recording/ADD_RECORDED_POSITION';
const INIT_RECORDING_METADATA = 'Recording/INIT_RECORDING_METADATA';
const RESET = 'Recording/RESET';

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

export function resetRecordingState() {
    return {
        type: RESET
    }
}

export function initRecordingMetadata(dateStart, equipmentWidth) {
    return {
        type: INIT_RECORDING_METADATA,
        payload: {
            dateStart: dateStart,
            equipmentWidth: equipmentWidth
        }
    }
}

export function recordingOnNewPosition(newPosition) {
    return (dispatch, getState) => {
        // If is recording, add to history
        if(getState().recording.status === RecordingStatus.Recording) {
            dispatch(addRecordedPosition(newPosition));
        }
    }
}

export function startRecording() {
    return (dispatch, getState) => {
        // get equipmentWidth
        const equipmentWidth = getState().guiding.equipmentWidth;
        // set metadata
        dispatch(initRecordingMetadata(new Date().toISOString(), equipmentWidth))
        dispatch(setStatus(RecordingStatus.Recording))
    }
}

export function pauseRecording() {
    return (dispatch) => {
        // set status
        dispatch(setStatus(RecordingStatus.Paused))
    }
}

export function resumeRecording() {
    return (dispatch) => {
        // set status
        dispatch(setStatus(RecordingStatus.Recording))
    }
}

export function cancelRecording() {
    return (dispatch, getState) => {
        dispatch(setStatus(RecordingStatus.Idle))
        // Reset state
        dispatch(resetRecordingState());
    }
}

export function stopRecordingAndSave() {
    return (dispatch, getState) => {
        dispatch(setStatus(RecordingStatus.Idle))
        // Save recording in history
        dispatch(saveRecording({
            dateStart: getState().recording.dateStart,
            dateEnd: new Date().toISOString(),
            trace: getState().recording.recordedPositions,
            equipmentWidth: getState().recording.equipmentWidth
        }))
        // Reset state
        dispatch(resetRecordingState());
        // Reset guiding
        dispatch(resetGuidingState());

    }
}



const recordingStateReducer = (
    state = getInitialState(),
    action: any
): RecordingState => {
    switch (action.type) {
        case INIT_RECORDING_METADATA: {
            return {
                ...state,
                dateStart: action.payload.dateStart,
                equipmentWidth: action.payload.equipmentWidth
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
        case RESET: {
            return getInitialState()
        }
    }
    return state;
};

export default recordingStateReducer;