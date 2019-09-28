import distance from '@turf/distance';
import { point } from '@turf/helpers';
import computeBearing from '@turf/bearing';

const MIN_DISTANCE_TO_MOVE_VIEW = 5;
const ZOOM_OUT = 18;
const ZOOM_IN = 19;

interface MapState {
    mapView: any
}

const getInitialState = (): MapState => {
    return {
        mapView: null
    };
};

const SET_MAP_VIEW = 'Map/SET_MAP_VIEW';

export function setMapView(mapView) {
    return {
        type: SET_MAP_VIEW,
        payload: mapView
    }
}

export function handleNewPosition(newPosition, forceRefresh = false) {
    return (dispatch, getState) => {
        let currentMapView = getState().map.mapView;
        let guidingLines = getState().guiding.guidingLines;

        // Init mapview
        if(currentMapView === null) {
            dispatch(setMapView({
                center: [newPosition.coords.longitude, newPosition.coords.latitude],
                bearing: 0,
                pitch: 0,
                zoom: ZOOM_OUT
            }))
        } else {
            // Check if newPosition distance to lastPosition
            let lastViewPosition = point(currentMapView.center)
            let distanceFromLastView = distance(lastViewPosition, [newPosition.coords.longitude, newPosition.coords.latitude]) * 1000;
            // In case of guidingLines status defined / undefined, need to forceRefresh
            if(distanceFromLastView > MIN_DISTANCE_TO_MOVE_VIEW || forceRefresh) {
                // Define bearing (maybe reason on average 2-3 last positions...)
                let currentBearing = currentMapView.bearing;
                let newBearing = newPosition.coords.heading;
                let pitch = currentMapView.pitch;
                let zoom = currentMapView.zoom;
                let center = [newPosition.coords.longitude, newPosition.coords.latitude];
                if(newBearing) {
                    if(guidingLines) {
                        let bearingGuidingLines = computeBearing(point(guidingLines.referenceLine[0]), point(guidingLines.referenceLine[1]))
                        // Convert bearingGuidingLines to [ 0º - 360º ]
                        if(bearingGuidingLines < 0) {
                            bearingGuidingLines += 360;
                        }
                        // Change currentBearing to the closest guidingLine bearing (one side of the other)
                        if(Math.abs(newBearing - bearingGuidingLines) < 90) {
                            newBearing = bearingGuidingLines;
                        } else {
                            // Reverse bearingGuidingLines
                            if(bearingGuidingLines > 180) {
                                newBearing = bearingGuidingLines - 180;
                            } else {
                                newBearing = bearingGuidingLines + 180;
                            }
                        }

                        // Zoom and pitch
                        pitch = 60;
                        zoom = ZOOM_IN;

                    } else {
                        // Update bearing in view only if bearing changed 
                        // more than -90º / +90º from current bearing
                        if(Math.abs(newBearing - currentBearing) < 90) {
                            newBearing = currentBearing;
                        } else {
                            newBearing = newBearing;
                        }

                        pitch = 0;
                        zoom = ZOOM_OUT;
                    }
                } else {
                    newBearing = currentBearing;
                }

                dispatch(setMapView({
                    center: center,
                    bearing: newBearing,
                    pitch: pitch,
                    zoom: zoom,
                    offset: [0, 50] // TODO set offset depending on map size on screen
                }))
            }
        }
    }
}

const mapStateReducer = (
    state = getInitialState(),
    action: any
): MapState => {
    switch (action.type) {
        case SET_MAP_VIEW: {
            return {
                ...state,
                mapView: action.payload
            };
        }
    }
    return state;
};

export default mapStateReducer;