import { Component, h, State, Prop, Watch } from '@stencil/core';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { Store, Action } from "@stencil/redux";
import mapboxgl from 'mapbox-gl';
import { getAndWatchPosition, simulateGeolocation } from '../../statemanagement/app/GeolocationStateManagement';
import { 
  setDistanceToClosestGuidingLine, 
  setBearingToClosestGuidingLine, 
  startDefiningGuidingLines,
  onBboxChanged,
  createOrUpdateGuidingLines
} from '../../statemanagement/app/GuidingStateManagement';
import { point, lineString } from '@turf/helpers';
import destination from '@turf/destination';
const { SplashScreen } = Plugins;
import LoadingIndicator from '../../helpers/loadingIndicator';
import config from '../../config.json';

import { lineToPolygon } from '../../helpers/utils';
import { RecordingStatus } from '../../statemanagement/app/RecordingStateManagement';

//import { styleMapboxOffline } from '../../helpers/utils';
// import { blankMapStyle } from '../../helpers/utils';

/*

Todo include styles via module import instead of copy paste in app-home.css , when upgrading mapboxgl or mapboxgl-draw it might break

*/

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() position: GeolocationPosition;
  @Watch('position')
  positionWatchHandler(position: GeolocationPosition) {
    this.position = position;

    if (!this.position) {
      this.isGettingPositionLoader.present();
    } else {
      this.isGettingPositionLoader.dismiss();
    }

    this.updateMapDisplay();
  }
  @State() referenceLine: Array<Array<number>>;
  @State() isDefiningGuidingLines: boolean;
  @State() bboxContainer: any
  @Watch('bboxContainer')
  bboxContainerWatchHandler() {
    if(this.guidingLines) {
      // Bbox container updated, refresh guidinglines display
      this.addOrUpdateGuidinglineToMap(this.guidingLines)
    }
  }
  @State() equipmentWidth: number;
  guidingLines: any;

  @State() status: RecordingStatus;
  recordedPositions: Array<Array<number>>;

  getAndWatchPosition: Action;
  setDistanceToClosestGuidingLine: Action;
  setBearingToClosestGuidingLine: Action;
  startDefiningGuidingLines: Action;
  onBboxChanged: Action;
  createOrUpdateGuidingLines: Action;

  map: any;
  mapIsReady: boolean = false;
  mapFirstRender: boolean = false;

  @State() mapView: any;
  @Watch('mapView')
  mapViewHandler(mapView) {
    this.changeMapView(mapView);
  }

  isGettingPositionLoader: LoadingIndicator = new LoadingIndicator("Getting your position...");

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        recording: { status, recordedPositions },
        geolocation: { position },
        guiding: { referenceLine, equipmentWidth, isDefiningGuidingLines, guidingLines, bboxContainer },
        map: { mapView }
      } = state;
      return {
        position,
        referenceLine,
        equipmentWidth,
        isDefiningGuidingLines,
        guidingLines,
        bboxContainer,
        status,
        recordedPositions,
        mapView
      };
    });

    this.store.mapDispatchToProps(this, {
      getAndWatchPosition,
      setDistanceToClosestGuidingLine,
      setBearingToClosestGuidingLine,
      startDefiningGuidingLines, 
      onBboxChanged,
      createOrUpdateGuidingLines
    });
  }

  componentDidLoad() {
    SplashScreen.hide();

    simulateGeolocation();

    this.isGettingPositionLoader.present()

    this.getAndWatchPosition();

    // if online
    let mapStyle = 'mapbox://styles/mapbox/satellite-v9';
    // else
    // mapStyle = blankMapStyle;
    // TODO implement a reducer that watch network status and change 
    // blankMap -> satellite map
    // // If online, set satellite
    //this.map.setStyle('mapbox://styles/mapbox/satellite-v9');

    mapboxgl.accessToken = config.mapboxToken;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: mapStyle,
      zoom: 17,
      minZoom: 16
    });

    //const navControl = new mapboxgl.NavigationControl();
    //this.map.addControl(navControl, 'top-right');

    this.map.on('render', () => {
      if (!this.mapFirstRender) {
        this.mapFirstRender = true;
        this.map.resize();
      }
    })

    this.map.on('style.load', () => {
      // Triggered when `setStyle` is called.
      this.updateMapDisplay();
    });

    this.map.on('load', () => {
      this.mapIsReady = true;
      this.map.resize();
      console.log('Map loaded');
      this.changeMapView(this.mapView);

      // Init source
      // Position
      this.updateMapDisplay();
    });

    this.map.on('moveend', () => {
      // Could debounce this
      this.onBboxChanged(this.getBbox())
    })
  }

  getBbox() {
    return this.map.getBounds().toArray().flat();
  }

  changeMapView(mapView) {
    if(this.mapIsReady && mapView) {
      console.log('changeMapView')
      this.map.easeTo(mapView);
    }
  }

  addOrUpdatePositionToMap(position) {
    let coords = [0, 0]
    if (position) {
      coords = [position.coords.longitude, position.coords.latitude]
    }
    const layerAndSourceId = 'position'
    let source = this.map.getSource(layerAndSourceId);
    if (source) {
      source.setData(point(coords))
    } else {
      console.log('Create position source and layer');
      this.map.addSource(layerAndSourceId, {
        "type": "geojson",
        "data": point(coords)
      });
      this.map.addLayer({
        "id": layerAndSourceId,
        "source": layerAndSourceId,
        "type": "circle",
        "paint": {
          "circle-radius": 5,
          "circle-color": "#B42222"
        }
      })
    }
    return layerAndSourceId;
  }

  addOrUpdateGuidinglineToMap(guidingLines) {
    if (!guidingLines) {
      return;
    }
    const layerAndSourceId = 'guiding-lines'
    let source = this.map.getSource(layerAndSourceId);
    if (source) {
      console.log('Update guiding lines source')
      source.setData(guidingLines.getGeojson())
    } else {
      console.log('Create guiding lines source and layer')
      this.map.addSource(layerAndSourceId, {
        "type": "geojson",
        "data": guidingLines.getGeojson()
      })

      this.map.addLayer({
        "id": layerAndSourceId,
        "type": "line",
        "source": layerAndSourceId,
        "paint": {
          "line-color": "white",
          "line-width": 2
        }
      });
    }
    return layerAndSourceId;
  }

  addOrUpdateClosestGuidingLineToMap(guidingLines, position) {
    const layerAndSourceId = 'closest-guiding-line';
    if (guidingLines && position) {
      let sourceClosestLine = this.map.getSource(layerAndSourceId);
      // TODO compute this in the position change handler In state management
      // And store closest line in guidinglinestatemanagement
      const closestLine = guidingLines.getClosestLine([position.coords.longitude, position.coords.latitude]);
      const closestLineGeojson = closestLine.line;
      this.setDistanceToClosestGuidingLine(closestLine.distance);
      this.setBearingToClosestGuidingLine(closestLine.bearingToLine);
      if (sourceClosestLine) {
        //console.log('Update closest guiding lines')
        sourceClosestLine.setData(closestLineGeojson)
      } else {
        console.log('Create closest guiding lines source and layer')
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": closestLineGeojson
        })

        this.map.addLayer({
          "id": layerAndSourceId,
          "type": "line",
          "source": layerAndSourceId,
          "paint": {
            "line-color": "green",
            "line-width": 10
          }
        });
      }
      return layerAndSourceId;
    }
  }

  addOrUpdateHeadingLine(position) {
    const layerAndSourceId = 'heading-line';
    if (position && position.coords.heading) {
      let source = this.map.getSource(layerAndSourceId);
      // Create heading line from position 
      let pointA = point([position.coords.longitude, position.coords.latitude]);
      let heading = position.coords.heading;
      //this.map.setBearing(heading);
      // Convert heading to -180 180
      if (heading > 180) {
        heading -= 360;
      }
      let pointB = destination(pointA, (this.equipmentWidth * 3) / 1000, heading);
      let headingLine = lineString([
        pointA.geometry.coordinates,
        pointB.geometry.coordinates
      ]);

      if (source) {
        source.setData(headingLine)
      } else {
        console.log('Create position source and layer');
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": headingLine
        });
        this.map.addLayer({
          "id": layerAndSourceId,
          "source": layerAndSourceId,
          "type": "line",
          "paint": {
            "line-color": "#B42222",
            "line-width": 3
          }
        })
      }
      return layerAndSourceId;
    } else {
      this.removeSourceAndLayerIfExists('heading-line')
    }
  }

  addOrUpdateTraceHistory(positionsHistory) {
    const layerAndSourceId = 'trace-history';
    if (positionsHistory.length > 1) {
      let source = this.map.getSource(layerAndSourceId);
      // TODO replace 10 by tool width
      // Could improve perfs of this by avoiding recomputing everything each new position, but just push the new ones...
      const linePositionHistory = lineString(positionsHistory);
      // This doesn't work if line history contains duplicates
      // Using this because turf buffer funciton isn't working properly for some reason
      // Width in meters
      const traceAsPolygon = lineToPolygon(linePositionHistory, this.equipmentWidth);
      if (source) {
        source.setData(traceAsPolygon)
      } else {
        console.log('Create position source and layer');
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": traceAsPolygon
        });
        this.map.addLayer({
          "id": layerAndSourceId,
          "source": layerAndSourceId,
          "type": "fill",
          "paint": {
            "fill-color": "blue",
            "fill-opacity": 0.4
          }
        })
      }
      return layerAndSourceId;
    }
  }

  addOrUpdateReferenceLine(referenceLine, position) {
    const layerAndSourceId = 'reference-line';
    if (referenceLine.length  >= 1) {
      let source = this.map.getSource(layerAndSourceId);
      let referenceLineGeojson = lineString([
        [referenceLine[0][0],referenceLine[0][1]],
        [position.coords.longitude, position.coords.latitude]
      ]);

      let data = {
        "type": "FeatureCollection",
        "features": [
          referenceLineGeojson,
          point([referenceLine[0][0],referenceLine[0][1]])
        ]
      }

      if(referenceLine.length === 2) {
        referenceLineGeojson = lineString(referenceLine);
        data = {
          "type": "FeatureCollection",
          "features": [
            referenceLineGeojson,
            point([referenceLine[0][0],referenceLine[0][1]]),
            point([referenceLine[1][0],referenceLine[1][1]])
          ]
        }
      }
      
      if (source) {
        source.setData(data);
      } else {
        console.log('Create position source and layer');
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": data
        });
        this.map.addLayer({
          "id": layerAndSourceId,
          "source": layerAndSourceId,
          "type": "line",
          "paint": {
            "line-color": "yellow",
            "line-width": 3,
            "line-dasharray": [2, 1]
          },
          "filter": ["==", "$type", "LineString"]
        })

        this.map.addLayer({
          "id": `${layerAndSourceId}-point`,
          "source": layerAndSourceId,
          "type": "circle",
          "paint": {
            "circle-radius": 7,
            "circle-color": "yellow"
          },
          "filter": ["==", "$type", "Point"]
        })
      }

      return layerAndSourceId;
    }
  }

  removeSourceAndLayerIfExists(id) {
    if(this.map.getSource(id)) {
      this.map.removeLayer(id);
      // Special case for reference line, would need to build in
      // support for multiple layer for unique source
      if(id === "reference-line") {
        this.map.removeLayer(`${id}-point`);
      }
      this.map.removeSource(id);
    }
  }

  moveLayerIfExists(id) {
    if(this.map.getLayer(id)) {
      this.map.moveLayer(id);
      // Special case for reference line, would need to build in
      // support for multiple layer for unique source
      if(id === "reference-line") {
        this.map.moveLayer(`${id}-point`);
      }
    }
  }

  updateMapDisplay() {
    if(!this.mapIsReady) {
      return;
    }
    if (this.position) {
      // this.map.setCenter([this.position.coords.longitude, this.position.coords.latitude]);
      // See moveLayer method to change z-index: https://docs.mapbox.com/mapbox-gl-js/api/#map#movelayer
      // Initial UI
      if(!this.isDefiningGuidingLines && !this.guidingLines) {
        let layerPositionID = this.addOrUpdatePositionToMap(this.position);
        let layerHeadingLineID = this.addOrUpdateHeadingLine(this.position);
        this.removeSourceAndLayerIfExists("guiding-lines");
        this.removeSourceAndLayerIfExists("reference-line");
        this.removeSourceAndLayerIfExists("closest-guiding-line");
        this.removeSourceAndLayerIfExists("trace-history");
        this.moveLayerIfExists(layerHeadingLineID);
        this.moveLayerIfExists(layerPositionID);
      }
      // When defining guiding lines
      if(this.isDefiningGuidingLines) {
        this.removeSourceAndLayerIfExists("guiding-lines");
        this.removeSourceAndLayerIfExists("closest-guiding-line");
        let layerPositionID = this.addOrUpdatePositionToMap(this.position);
        let layerHeadingLineID = this.addOrUpdateHeadingLine(this.position);
        let layerReferenceLineID = this.addOrUpdateReferenceLine(this.referenceLine, this.position); 
        if(this.referenceLine.length === 0) {
          this.removeSourceAndLayerIfExists("reference-line");
        }
        this.moveLayerIfExists(layerHeadingLineID);
        this.moveLayerIfExists(layerPositionID);
        this.moveLayerIfExists(layerReferenceLineID);
      }
      // When guiding lines defined but not recording
      if(!this.isDefiningGuidingLines &&
          this.guidingLines &&
          this.status === RecordingStatus.Idle
        ) {
        this.removeSourceAndLayerIfExists("reference-line");
        this.removeSourceAndLayerIfExists("trace-history");
        let layerPositionID = this.addOrUpdatePositionToMap(this.position);
        let layerHeadingLineID = this.addOrUpdateHeadingLine(this.position);
        let layerClosestGuidingLineID = this.addOrUpdateClosestGuidingLineToMap(this.guidingLines, this.position);
        
        this.moveLayerIfExists(layerClosestGuidingLineID);
        this.moveLayerIfExists(layerHeadingLineID);
        this.moveLayerIfExists(layerPositionID);
      }
      // When guiding lines defined and recording
      if(!this.isDefiningGuidingLines && 
          this.guidingLines &&
          this.status !== RecordingStatus.Idle
        ) {
        this.removeSourceAndLayerIfExists("reference-line");
        let layerPositionID = this.addOrUpdatePositionToMap(this.position);
        let layerHeadingLineID = this.addOrUpdateHeadingLine(this.position);
        let layerClosestGuidingLineID = this.addOrUpdateClosestGuidingLineToMap(this.guidingLines, this.position);
        let layerTraceHistoryID = this.addOrUpdateTraceHistory(this.recordedPositions);
        this.moveLayerIfExists(layerClosestGuidingLineID);
        this.moveLayerIfExists(layerTraceHistoryID);
        this.moveLayerIfExists(layerHeadingLineID);
        this.moveLayerIfExists(layerPositionID);
      }
    }
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Tractor navigator</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <div id="map"></div>
        <div class="ctas-container">
          <div class="ctas-help">
          </div>
          <div class="ctas-buttons">
            {!this.isDefiningGuidingLines && !this.guidingLines &&
              <ion-button
                color="primary"
                onClick={() => this.startDefiningGuidingLines()}
              >
                Start guiding
              </ion-button>
            }
          </div>
        </div>
        {this.isDefiningGuidingLines &&
          <guiding-setup onGuidingLinesDefined={() => {
            this.createOrUpdateGuidingLines(this.getBbox());
            this.map.resize();
          }} />
        }
        {!this.isDefiningGuidingLines && this.guidingLines &&
          <guiding-interface />
        }
      </ion-content>
    ];
  }
}
