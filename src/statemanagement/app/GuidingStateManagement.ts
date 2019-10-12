import { isPointOnLeftOfRight, computeLargerBbox } from "../../helpers/utils";
import GuidingLines from '../../helpers/guidinglines';

interface GuidingState {
    referenceLine: Array<Array<number>>;
    equipmentWidth: number;
    distanceToClosestGuidingLine: number;
    bearingToClosestGuidingLine: number;
    isGuidingLineOnRightOrLeft: string;
    guidingLines: any;
    closestLine: any;
    isDefiningGuidingLines: boolean;
    bboxContainer: any
}

const getInitialState = (): GuidingState => {
    return {
        referenceLine: [],
        equipmentWidth: 8,
        distanceToClosestGuidingLine: null,
        bearingToClosestGuidingLine: null,
        isGuidingLineOnRightOrLeft: null,
        guidingLines: null,
        closestLine: null,
        isDefiningGuidingLines: false,
        bboxContainer: null
    };
};


const SET_REFERENCE_LINE = 'Guiding/SET_REFERENCE_LINE';
const SET_EQUIPMENT_WIDTH = 'Guiding/SET_EQUIPMENT_WIDTH';
const SET_DISTANCE_TO_CLOSEST_GUIDINGLINE = 'Guiding/SET_DISTANCE_TO_CLOSEST_GUIDINGLINE';
const SET_BEARING_TO_CLOSEST_GUIDINGLINE = 'Guiding/SET_BEARING_TO_CLOSEST_GUIDINGLINE';
const SET_GUIDING_LINE_LEFT_OR_RIGHT = 'Guiding/SET_GUIDING_LINE_LEFT_OR_RIGHT';
const CREATE_OR_UPDATE_GUIDING_LINES = 'Guiding/CREATE_OR_UPDATE_GUIDING_LINES';
const START_DEFINING_GUIDINGLINES = 'Guiding/START_DEFINING_GUIDINGLINES';
const SET_BBOX_CONTAINER = 'Guiding/SET_BBOX_CONTAINER';
const SET_CLOSESTLINE = 'Guiding/SET_CLOSESTLINE';
const RESET = 'Guiding/RESET';


export function setReferenceLine(referenceLine) {
    return {
        type: SET_REFERENCE_LINE,
        payload: referenceLine
    }
}

export function setEquipmentWidth(equipmentWidth) {
    return {
        type: SET_EQUIPMENT_WIDTH,
        payload: equipmentWidth
    }
}

export function setDistanceToClosestGuidingLine(distanceToClosestGuidingLine) {
    return {
        type: SET_DISTANCE_TO_CLOSEST_GUIDINGLINE,
        payload: distanceToClosestGuidingLine
    }
}

export function startDefiningGuidingLines() {
    return {
        type: START_DEFINING_GUIDINGLINES
    }
}

export function setClosestLine(closestLine) {
    return {
        type: SET_CLOSESTLINE,
        payload: closestLine
    }
}

export function setBearingToClosestGuidingLine(bearingToClosestGuidingLine) {
    return (dispatch, getState) => {

        var heading = getState().geolocation.position.coords.heading;
        var isLeftOrRight = isPointOnLeftOfRight(heading, bearingToClosestGuidingLine);

        dispatch({
            type: SET_GUIDING_LINE_LEFT_OR_RIGHT,
            payload: isLeftOrRight
        })

        dispatch({
            type: SET_BEARING_TO_CLOSEST_GUIDINGLINE,
            payload: bearingToClosestGuidingLine
        })
    }
}

export function resetGuidingState() {
    return {
        type: RESET
    }
}

export function createOrUpdateGuidingLines(initialBbox) {
    return (dispatch, getState) => {

        // Enlarge bbox twice as big so we don't update on every frame
        let largerNewBbox = computeLargerBbox(initialBbox, 2);

        const equipmentWidth = getState().guiding.equipmentWidth;
        const referenceLine = getState().guiding.referenceLine;

        const guidingLines = new GuidingLines(
            equipmentWidth,
            referenceLine,
            largerNewBbox
        );

        dispatch({
            type: CREATE_OR_UPDATE_GUIDING_LINES, 
            payload: guidingLines
        })

        dispatch(setBboxContainer(largerNewBbox));
    }
}

export function updateGuidingLinesOnNewPosition(position) {
    return (dispatch, getState) => {
        const guidingLines = getState().guiding.guidingLines;
        if(position && guidingLines) {
            const newClosests = guidingLines.getClosestLine([position.coords.longitude, position.coords.latitude]);
            let newClosest = newClosests[0];
            let newSecondClosest = newClosests[1];

            const previousClosest = getState().guiding.closestLine;

            // Add tolerance, only change closestLine when closestLine < 0.5m
            if(previousClosest && previousClosest.index !== newClosest.index) {
                if(newClosest.distance > 0.5 && 
                   previousClosest.index === newSecondClosest.index) {
                    // Keep second closest
                    newClosest = newSecondClosest;
                }
            }

            dispatch(setClosestLine(newClosest));
            dispatch(setDistanceToClosestGuidingLine(newClosest.distance))
            dispatch(setBearingToClosestGuidingLine(newClosest.bearingToLine))
            
            
        }
    }
}

export function onBboxChanged(newBbox) {
    return (dispatch, getState) => {
        const guidingLines = getState().guiding.guidingLines;
        if(!guidingLines) {
            return;
        }
        // Only update bbox if new bbox isn't contained on the previous one
        if(guidingLines.needBboxUpdate(newBbox)) {
            // Enlarge bbox twice as big so we don't update on every frame
            let largerNewBbox = computeLargerBbox(newBbox, 2);
            guidingLines.updateBbox(largerNewBbox);
            dispatch(setBboxContainer(largerNewBbox));
            // The watcher of bboxContainer on the frond-end will update the guidingLines
            // Maybe update reference guiding line also...
        }
    }
}

export function setBboxContainer(bbox) {
    return {
        type: SET_BBOX_CONTAINER,
        payload: bbox
    }
}


const guidingStateReducer = (
    state = getInitialState(),
    action: any
): GuidingState => {
    switch (action.type) {
        case SET_REFERENCE_LINE: {
            return {
                ...state,
                referenceLine: action.payload
            };
        }
        case SET_EQUIPMENT_WIDTH: {
            return {
                ...state,
                equipmentWidth: action.payload
            };
        }
        case SET_DISTANCE_TO_CLOSEST_GUIDINGLINE: {
            return {
                ...state,
                distanceToClosestGuidingLine: action.payload
            };
        }
        case SET_BEARING_TO_CLOSEST_GUIDINGLINE: {
            return {
                ...state,
                bearingToClosestGuidingLine: action.payload
            };
        }
        case SET_GUIDING_LINE_LEFT_OR_RIGHT: {
            return {
                ...state,
                isGuidingLineOnRightOrLeft: action.payload
            };
        }
        case START_DEFINING_GUIDINGLINES: {
            return {
                ...state,
                isDefiningGuidingLines: true,
                guidingLines: null
            };
        }
        case CREATE_OR_UPDATE_GUIDING_LINES: {
            return {
                ...state,
                guidingLines: action.payload,
                isDefiningGuidingLines: false
            };
        }
        case SET_BBOX_CONTAINER: {
            return {
                ...state,
                bboxContainer: action.payload
            }
        }
        case SET_CLOSESTLINE: {
            return {
                ...state,
                closestLine: action.payload
            }
        }
        case RESET: {
            return getInitialState();
        }

    }
    return state;
};

export default guidingStateReducer;