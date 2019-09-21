import { Component, h, State, Prop, Watch } from '@stencil/core';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { Store, Action } from "@stencil/redux";
import mapboxgl from 'mapbox-gl';
import { getAndWatchPosition, simulateGeolocation } from '../../statemanagement/app/GeolocationStateManagement';
import { setDistanceToClosestGuidingLine } from '../../statemanagement/app/GuidingStateManagement';
import { point, lineString } from '@turf/helpers';
import destination from '@turf/destination';
const { SplashScreen } = Plugins;
import LoadingIndicator from '../../helpers/loadingIndicator';
import GuidingLines from '../../helpers/guidinglines';
import config from '../../config.json';

import { lineToPolygon } from '../../helpers/utils';

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

  @State() positionsHistory: Array<Array<Number>>;
  @State() position: GeolocationPosition;
  @Watch('position')
  watchHandler(position: GeolocationPosition) {
    console.log('Got a new position');
    this.position = position;

    if (!this.position) {
      this.isGettingPositionLoader.present();
    } else {
      this.isGettingPositionLoader.dismiss();
      // Compute derived data from position change
      // TODO compute this in the position change handler
      // const closestLineGeojson = guidingLines.getClosestLine(position).line;
      if (this.mapIsReady) {
        this.updatePosition(position);
      }
    }
  }

  getAndWatchPosition: Action;
  setDistanceToClosestGuidingLine: Action;

  map: any;
  mapIsReady: boolean = false;
  mapFirstRender: boolean = false;
  isGettingPositionLoader: LoadingIndicator = new LoadingIndicator("Getting your position...");

  @State() isDefiningGuidingLines: boolean = false;
  @State() referenceLine: Array<Array<number>>;
  guidingLines: any = null;

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        geolocation: { position, positionsHistory },
        guiding: { referenceLine }
      } = state;
      return {
        position,
        positionsHistory,
        referenceLine
      };
    });

    this.store.mapDispatchToProps(this, {
      getAndWatchPosition,
      setDistanceToClosestGuidingLine
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

    this.map.on('render', () => {
      if (!this.mapFirstRender) {
        this.mapFirstRender = true;
        this.map.resize();
      }
    })

    this.map.on('style.load', () => {
      // Triggered when `setStyle` is called.
      this.updatePosition(this.position);
    });

    this.map.on('load', () => {
      this.mapIsReady = true;
      this.map.resize();
      console.log('Map loaded');

      // Init source
      // Position
      this.updatePosition(this.position);
    });
  }

  addOrUpdatePositionToMap(position) {
    let coords = [0, 0]
    if (position) {
      coords = [position.coords.longitude, position.coords.latitude]
    }
    const layerAndSourceId = 'position'
    let source = this.map.getSource(layerAndSourceId);
    if (source) {
      console.log('Update position source');
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
          "circle-radius": 10,
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
      console.log('Closest guiding line');
      console.log(closestLineGeojson);
      if (sourceClosestLine) {
        console.log('Update closest guiding lines')
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
      this.map.setBearing(heading);
      // Convert heading to -180 180
      if (heading > 180) {
        heading -= 360;
      }
      let pointB = destination(pointA, 1, heading);
      let headingLine = lineString([
        pointA.geometry.coordinates,
        pointB.geometry.coordinates
      ]);

      if (source) {
        console.log('Update position source');
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
      const traceAsPolygon = lineToPolygon(linePositionHistory, 10);
      if (source) {
        console.log('Update position source');
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
    if (referenceLine.length  === 1) {
      let source = this.map.getSource(layerAndSourceId);
      const referenceLineGeojson = lineString([
        [referenceLine[0][0],referenceLine[0][1]],
        [position.coords.longitude, position.coords.latitude]
      ]);
      if (source) {
        console.log('Update position source');
        source.setData(referenceLineGeojson);
      } else {
        console.log('Create position source and layer');
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": referenceLineGeojson
        });
        this.map.addLayer({
          "id": layerAndSourceId,
          "source": layerAndSourceId,
          "type": "line",
          "paint": {
            "line-color": "yellow",
            "line-width": 3,
            "line-dasharray": [2, 1]
          }
        })
      }
      return layerAndSourceId;
    }
  }

  removeSourceAndLayerIfExists(id) {
    if(this.map.getSource(id)) {
      this.map.removeSource(id);
      this.map.removeLayer(id);
    }
  }

  updatePosition(position) {
    if (position) {
      this.map.setCenter([position.coords.longitude, position.coords.latitude]);
      // See moveLayer method to change z-index: https://docs.mapbox.com/mapbox-gl-js/api/#map#movelayer
      // Guiding lines defined 
      if(!this.isDefiningGuidingLines && !this.guidingLines) {
        let layerPositionID = this.addOrUpdatePositionToMap(position);
        let layerHeadingLineID = this.addOrUpdateHeadingLine(position);
        this.removeSourceAndLayerIfExists("reference-line");
        this.map.moveLayer(layerHeadingLineID);
        this.map.moveLayer(layerPositionID);
      }
      // Is defining guiding lines
      if(this.isDefiningGuidingLines) {
        let layerPositionID = this.addOrUpdatePositionToMap(position);
        let layerHeadingLineID = this.addOrUpdateHeadingLine(position);
        let layerReferenceLineID = this.addOrUpdateReferenceLine(this.referenceLine, position); 
        this.map.moveLayer(layerReferenceLineID);
        this.map.moveLayer(layerHeadingLineID);
        this.map.moveLayer(layerPositionID);
      }
      // Guiding lines defined
      if(!this.isDefiningGuidingLines && this.guidingLines) {
        this.removeSourceAndLayerIfExists("reference-line");
        let layerPositionID = this.addOrUpdatePositionToMap(position);
        let layerHeadingLineID = this.addOrUpdateHeadingLine(position);
        let layerClosestGuidingLineID = this.addOrUpdateClosestGuidingLineToMap(this.guidingLines, position);
        let layerTraceHistoryID = this.addOrUpdateTraceHistory(this.positionsHistory);
        
        this.map.moveLayer(layerClosestGuidingLineID);
        this.map.moveLayer(layerTraceHistoryID);
        this.map.moveLayer(layerHeadingLineID);
        this.map.moveLayer(layerPositionID);
      }
      
    }
  }

  createGuidingLines() {
    // Create guiding lines
    // will do this after asking the reference line and the size on the thing behind the tractor
    let bbox = this.map.getBounds().toArray().flat()
    this.guidingLines = new GuidingLines(10,
      this.referenceLine,
      bbox
    );
    this.guidingLines.generate();
    this.addOrUpdateGuidinglineToMap(this.guidingLines);
    

    this.isDefiningGuidingLines = false;
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
                onClick={() => this.isDefiningGuidingLines = true}
              >
                Start guiding
              </ion-button>
            }
          </div>
        </div>
        {this.isDefiningGuidingLines &&
          <guiding-setup onGuidingLinesDefined={() => this.createGuidingLines() } />
        }
        {!this.isDefiningGuidingLines && this.guidingLines &&
          <guiding-interface />
        }
      </ion-content>
    ];
  }
}
