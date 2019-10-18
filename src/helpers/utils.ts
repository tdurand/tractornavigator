import lineOffset from '@turf/line-offset';
import { point } from '@turf/helpers';
import transformScale from '@turf/transform-scale';
import bboxFromGeojson from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import computeBearing from '@turf/bearing'

export function geopositionToObject(geoposition) {
  return {
    timestamp: geoposition.timestamp,
    coords: {
      accuracy: geoposition.coords.accuracy,
      altitude: geoposition.coords.altitude,
      altitudeAccuracy: geoposition.coords.altitudeAccuracy,
      heading: geoposition.coords.heading,
      latitude: geoposition.coords.latitude,
      longitude: geoposition.coords.longitude,
      speed: geoposition.coords.speed
    }
  }
}

export const blankMapStyle = {
  "version": 8,
  "sources": {
    "point": {
      "type": "geojson",
      "data": {
        "type": "Point",
        "coordinates": [0,0]
      }
    },
    // "mapbox-satellite": {
    //   "type": "raster",
    //   "tiles": [`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${config.mapboxToken}`],
    //   "tileSize": 512
    // }
  },
  "layers": [
    // {
    //   "id": "satellite",
    //   "source": "mapbox-satellite",
    //   "type": "raster"
    // }
    // ,
    {
      "id": "point",
      "source": "point",
      "type": "circle",
      "paint": {
        "circle-radius": 0.1,
        "circle-color": "transparent"
      }
  }]
}

// Using this because turf buffer funciton isn't working properly for some reason
// Width in meters
export function lineToPolygon(line, width) {
  let offsetLineRight = lineOffset(line, width / 2, {units: 'meters'});
  let offsetLineLeft = lineOffset(line, -width / 2, {units: 'meters'});
  let linePolygonCoordinates = [];
  linePolygonCoordinates.push(offsetLineLeft.geometry.coordinates[0]);
  offsetLineRight.geometry.coordinates.map((coordinate) => {
    linePolygonCoordinates.push(coordinate);
  })
  offsetLineLeft.geometry.coordinates.reverse().map((coordinate) => {
    linePolygonCoordinates.push(coordinate);
  })
  return [linePolygonCoordinates]
}

// TODO, this probably should go inside the guiding line library
// Bearing of point is -180 - 180
export function isPointOnLeftOfRight(currentHeading, bearingOfPoint) {
  // Convert bearing to 0 - 360
  var bearing = bearingOfPoint;
  if(bearing < 0) {
    bearing += 360;
  }
  if((currentHeading - bearing) > 180 ||
     (currentHeading - bearing) < 0) {
    return "right";
  } else {
    return "left";
  }
  
}

export function computeHeading(pointA, pointB) {
  // bearing in -180 <-> 180
  let heading = computeBearing(point(pointA), point(pointB));
  // Convert bearing to 0 - 360
  if(heading < 0) {
    heading += 360;
  }
  return heading;
}

export function computeLargerBbox(bbox, scaleFactor) {
  const bboxAsPolygon = bboxPolygon(bbox);
  const scaledBboxPolygon = transformScale(bboxAsPolygon, scaleFactor);
  return bboxFromGeojson(scaledBboxPolygon);
}