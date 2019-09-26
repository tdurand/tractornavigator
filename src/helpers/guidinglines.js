import lineIntersect from '@turf/line-intersect';
import lineOffset from '@turf/line-offset';
import { lineString, featureCollection, point } from '@turf/helpers';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';
import bearing from '@turf/bearing';
import destination from '@turf/destination';
import distance from '@turf/distance';
import square from '@turf/square';
import transformScale from '@turf/transform-scale';

export default class GuidingLines {

    // Interval in meters
    // Reference line, strait [pointA, pointB] or curve [pointA, pointB, pointC, pointD]
    constructor(interval = 5, referenceLine) {
        this.interval = interval;
        this.referenceLine = referenceLine;
        this.lines = [];
        
        this.referenceLineGeojson = lineString(this.referenceLine);
        // bbox from reference line, scale by 10x
        this.bbox = bbox(transformScale(bboxPolygon(square(bbox(this.referenceLineGeojson))), 100))

        this.bboxGeojson = bboxPolygon(this.bbox);
        
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
    // TODO implement getClosestLine(position, bbox) ?
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
        let closest = null;
        let bearingToIntersection = null;

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
                    boundA = boundB;
                } else {
                    boundA = boundA + Math.floor((boundB - boundA) / 2);
                }
                //console.log(`closest to boundB, move boundA to ${boundA}`)
                if(boundA === boundB){
                    closestDistance = distanceToBoundB;
                    bearingToIntersection = bearing(position, intersectionWithBoundB.features[0].geometry.coordinates)
                    found = true;
                }
            } else {
                // If 1 between A and B , floor will keep giving same number
                if(boundB - boundA === 1) {
                    boundB = boundA;
                } else {
                    boundB = boundB - Math.floor((boundB - boundA) / 2);
                }
                //console.log(`closest to boundA, move boundB to ${boundB}`)
                if(boundA === boundB){
                    closestDistance = distanceToBoundA;
                    bearingToIntersection = bearing(position, intersectionWithBoundA.features[0].geometry.coordinates)
                    found = true;
                }
            }
        }

        closest = {
            index: boundA,
            distance: closestDistance,
            line: this.lines[boundA],
            bearingToLine: bearingToIntersection
        }

        return closest;
    }

    // Get guiding lines in geojson to display on a map
    getGeojson() {
        return featureCollection(this.lines);
    }
}
