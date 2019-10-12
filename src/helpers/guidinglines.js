import lineIntersect from '@turf/line-intersect';
import lineOffset from '@turf/line-offset';
import { lineString, featureCollection, point } from '@turf/helpers';
import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';
import bearing from '@turf/bearing';
import destination from '@turf/destination';
import distance from '@turf/distance';
import center from '@turf/center';


export default class GuidingLines {

    // Interval in meters
    // Bbox : containing bbox of the grid
    // Reference line, strait [pointA, pointB] or curve [pointA, pointB, pointC, pointD]
    constructor(interval = 5, referenceLine, bbox) {
        this.interval = interval;
        this.bbox = bbox;
        this.referenceLine = referenceLine;
        this.lines = [];
        this.computeDerivedParams();
    }

    computeDerivedParams() {
        this.bboxGeojson = bboxPolygon(this.bbox);
        this.referenceLineGeojson = lineString(this.referenceLine);
        // Bearing of reference line first and last point
        this.referenceLineBearing = bearing(point(this.referenceLine[0]), point(this.referenceLine[this.referenceLine.length - 1]));
        this.referenceLineBearingInverse = bearing(point(this.referenceLine[this.referenceLine.length - 1]), point(this.referenceLine[0]));
        //console.log(`Reference line bearing: ${this.referenceLineBearing}`);
        //console.log(`Reference line bearing inverse: ${this.referenceLineBearingInverse}`);
        // Bbox diagonal length in meters
        this.bboxDiagonalLength = distance(point([this.bbox[0], this.bbox[1]]), point([this.bbox[2], this.bbox[3]]), {units: 'kilometers'}) * 1000;
        //console.log(`bboxDiagonalLength in meters: ${this.bboxDiagonalLength}m`);
        this.generate();
    }

    isContainedByCurrentBbox(newBbox) {
        if(booleanContains(this.bboxGeojson, bboxPolygon(newBbox))) {
            return true;
        } else {
            // Need to be resized
            return false;
        }
    }

    isLineInBbox(line) {
        // Check if Inside, and if it is not, if intersects
        if(booleanContains(this.bboxGeojson, line)) {
            return true;
        } else {
            if(lineIntersect(this.bboxGeojson, line).features.length > 0) {
                return true;
            } else {
                return false;
            }
        }
    }

    // Get line passing threw position and perpendicular to bearing
    computePerpendicularLine(position, bearing, halfLength) {
        let pointPosition = point(position);
        let pointA = destination(pointPosition, halfLength, bearing + 90, { units: "meters" });
        let pointB = destination(pointPosition, halfLength, bearing - 90, { units: "meters" });
        return lineString([pointA.geometry.coordinates, pointB.geometry.coordinates]);
    }

    expandLine(line) {
        // if it's not already bigger than bbox (intersecting in 2 points)
        if(lineIntersect(line, this.bboxGeojson).features.length < 2) {
            let currentLineCoordinates = line.geometry.coordinates;
            let newLineCoordinates = [
                destination(currentLineCoordinates[0], this.bboxDiagonalLength, this.referenceLineBearingInverse, { units: "meters" }).geometry.coordinates,
                ...currentLineCoordinates,
                destination(currentLineCoordinates[currentLineCoordinates.length - 1], this.bboxDiagonalLength,  this.referenceLineBearing, { units: "meters" }).geometry.coordinates,
            ]
            return lineString(newLineCoordinates);
        } else {
            return line;
        }  
        
    }

    generate() {
        // If reference line isn't inside bbox, return error
        if(!this.isLineInBbox(this.referenceLineGeojson)) {
            console.log(`Error: reference line isn't inside bbox container`)
            return;
        }

        // Reset lines
        this.lines = [];

        // Expand reference line to meet the bbox size
        // TODO, this cause pb if not a straith line
        // TODO, see if we want to cut
        let referenceLineExpanded =  this.expandLine(this.referenceLineGeojson);
        
        // Create all parallels lines and store them
        let linesRight = []
        let linesLeft = []
        let previousLine = referenceLineExpanded;
        let lineOffsetted = lineOffset(previousLine, this.interval, { units: "meters" });

        // while inside BBOX 
        while (this.isLineInBbox(lineOffsetted)) {
            // Add to line list
            linesRight.push(lineOffsetted);
            // Create new parralel line
            previousLine = lineOffsetted;
            lineOffsetted = lineOffset(previousLine, this.interval, { units: "meters" });
            lineOffsetted = this.expandLine(lineOffsetted);
        }

        //console.log(`Created ${linesRight.length} to the right`);

        lineOffsetted = lineOffset(referenceLineExpanded, -this.interval, { units: "meters" });

        // while inside BBOX 
        while (this.isLineInBbox(lineOffsetted)) {
            // Add to line list
            linesLeft.push(lineOffsetted);
            // create new parralel line
            previousLine = lineOffsetted;
            lineOffsetted = lineOffset(previousLine, -this.interval, { units: "meters" });
            lineOffsetted = this.expandLine(lineOffsetted);
        }

        //console.log(`Created ${linesLeft.length} to the left`);

        this.lines = this.lines.concat(linesLeft.reverse());
        this.lines = this.lines.concat(referenceLineExpanded);
        this.lines = this.lines.concat(linesRight);

        // For each assign an index in the property field (this will be used when using getClosestLine for styling)
        // lines.map((line, index) => {
        //   line.property.id = index;
        //})

        return featureCollection(this.lines);
    }

    // IDEA: if not fast enough, could build also a memory of last position computation
    // and restrict even more the number of lines to loop trough because we would know 
    // distance between last position and new position and could know how many lines could potentialy be in between
    getClosestLine(position) {
        // Draw perpendicular line to bearing of reference line
        let perpendicularLine = this.computePerpendicularLine(position, this.referenceLineBearing, this.bboxDiagonalLength);

        // As the list of guiding lines is ordered (parallel lines)
        // We can perform a binary search to avoid looping through all the list
        // We could implemnt this with a recursive function also
        let found = false;
        let boundA = 0;
        let boundB = this.lines.length - 1;
        let distanceToBoundA = this.bboxDiagonalLength;
        let distanceToBoundB = this.bboxDiagonalLength;
        let intersectionWithBoundA = null;
        let intersectionWithBoundB = null;
        let closestDistance = this.bboxDiagonalLength;
        let secondClosestDistance = this.bboxDiagonalLength;
        let closestIndex = null;
        let secondClosestIndex = null;
        let closest = null;
        let secondClosest = null;
        let bearingToIntersection = null
        let secondClosestBearingToIntersection = null;

        while (!found) {
            //console.log(`boundA: ${boundA}, boundB: ${boundB}`)
            // Pick closest bound
            intersectionWithBoundA = lineIntersect(perpendicularLine, this.lines[boundA]);
            intersectionWithBoundB = lineIntersect(perpendicularLine, this.lines[boundB]);
            if(intersectionWithBoundA.features.length > 0) {
                //console.log(`NB Intersection with boundA: ${intersectionWithBoundA.features.length}`)
                distanceToBoundA = distance(intersectionWithBoundA.features[0], point(position), {units: 'kilometers'}) * 1000;
                //console.log(`Distance to boundA: ${distanceToBoundA} m`)
            }
            if(intersectionWithBoundB.features.length > 0) {
                //console.log(`NB Intersection with boundB: ${intersectionWithBoundB.features.length}`)
                distanceToBoundB = distance(intersectionWithBoundB.features[0], point(position), {units: 'kilometers'}) * 1000;
                //console.log(`Distance to boundB: ${distanceToBoundB} m`)
            }

            // Set new bounds
            if(distanceToBoundA > distanceToBoundB) {
                // If 1 between A and B , floor will keep giving same number
                if(boundB - boundA === 1) {
                    closestIndex = boundB;
                    closestDistance = distanceToBoundB;
                    secondClosestIndex = boundA;
                    secondClosestDistance = distanceToBoundA;
                    bearingToIntersection = bearing(position, intersectionWithBoundB.features[0].geometry.coordinates)
                    secondClosestBearingToIntersection = bearing(position, intersectionWithBoundA.features[0].geometry.coordinates)
                    found = true;
                } else {
                    boundA = boundA + Math.floor((boundB - boundA) / 2);
                }
            } else {
                // If 1 between A and B , floor will keep giving same number
                if(boundB - boundA === 1) {
                    closestIndex = boundA;
                    closestDistance = distanceToBoundA;
                    secondClosestIndex = boundB;
                    secondClosestDistance = distanceToBoundB;
                    bearingToIntersection = bearing(position, intersectionWithBoundA.features[0].geometry.coordinates)
                    secondClosestBearingToIntersection = bearing(position, intersectionWithBoundB.features[0].geometry.coordinates)
                    found = true;
                } else {
                    boundB = boundB - Math.floor((boundB - boundA) / 2);
                }
            }
        }

        closest = {
            index: closestIndex,
            distance: closestDistance,
            line: this.lines[closestIndex],
            bearingToLine: bearingToIntersection,
            // perpendicularLine: perpendicularLine
        }

        secondClosest = {
            index: secondClosestIndex,
            distance: secondClosestDistance,
            line: this.lines[secondClosestIndex],
            bearingToLine: secondClosestBearingToIntersection,
        }

        

        return [closest, secondClosest];
    }

    // Get guiding lines in geojson to display on a map
    getGeojson() {
        return featureCollection(this.lines);
    }

    // Change Guiding parameters
    update(bbox, interval) {
        this.bbox = bbox;
        this.interval = interval;
        this.generate();
        // NB: when changing interval / bbox size, the index will change for the lines, so user needs to call getClosestLineAgain
    }

    needBboxUpdate(newBbox) {
        // Only update bbox if newBbox is not contained than previous one
        let needResizing = !this.isContainedByCurrentBbox(newBbox);
        if(!needResizing) {
            return false;
        } else {
            return true;
        }
    }

    updateBbox(newBbox) {
        // NB: when changing interval / bbox size, the index will change for the lines, so user needs to call getClosestLineAgain
        // Set closest line to center of bbox as new reference line
        let bboxCenter = center(bboxPolygon(newBbox));
        let newReferenceLine = this.getClosestLine(bboxCenter.geometry.coordinates);
        if(!newReferenceLine) {
            console.log(`Can't update bbox, you moved too far away from previous bbox location, need to have some overlap to be able to compute it`)
            return false;
        } else {
            console.log('Update Bbox and recompute everything')
            this.referenceLine = newReferenceLine[0].line.geometry.coordinates;
            this.bbox = newBbox;
            this.computeDerivedParams();
            return true;
        }
    }
}