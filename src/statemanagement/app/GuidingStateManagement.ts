interface GuidingState {
    referenceLine: Array<Array<number>>;
    equipmentWidth: number;
    distanceToClosestGuidingLine: number;
}

const getInitialState = (): GuidingState => {
    return {
        referenceLine: [],
        equipmentWidth: 5,
        distanceToClosestGuidingLine: null
    };
};


const SET_REFERENCE_LINE = 'Guiding/SET_REFERENCE_LINE';
const SET_EQUIPMENT_WIDTH = 'Guiding/SET_EQUIPMENT_WIDTH';
const SET_DISTANCE_TO_CLOSEST_GUIDINGLINE = 'Guiding/SET_DISTANCE_TO_CLOSEST_GUIDINGLINE';

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
    }
    return state;
};

export default guidingStateReducer;