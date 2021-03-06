import { Component, h, State, Watch } from '@stencil/core';
import { modalController } from '@ionic/core';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { store, Action } from "@stencil/redux";
import mapboxgl from 'mapbox-gl';
import { 
  getAndWatchPosition
} from '../../statemanagement/app/GeolocationStateManagement';
import { 
  setDistanceToClosestGuidingLine, 
  setBearingToClosestGuidingLine, 
  startDefiningGuidingLines,
  onBboxChanged,
  createOrUpdateGuidingLines,
  restoreEquipmentWidth
} from '../../statemanagement/app/GuidingStateManagement';
import { handleNewPosition, zoomIn, zoomOut, set2D, set3D } from '../../statemanagement/app/MapStateManagement';
import { getDeviceInfo, initNetworkListener } from '../../statemanagement/app/DeviceStateManagement';
import { restoreHistory } from '../../statemanagement/app/HistoryStateManagement';
import { restoreAppState, registerAppOpening } from '../../statemanagement/app/AppStateManagement';
import { point, lineString, multiPolygon } from '@turf/helpers';
import generateCircle from '@turf/circle';
import generateSector from '@turf/sector';
const { SplashScreen } = Plugins;
import LoadingIndicator from '../../helpers/loadingIndicator';
import config from '../../config.json';
import { getString } from '../../global/lang';

import { lineToPolygon } from '../../helpers/utils';
import { RecordingStatus } from '../../statemanagement/app/RecordingStateManagement';

// import { styleMapboxOffline } from '../../helpers/utils';
import { blankMapStyle } from '../../helpers/utils';

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
      this.loadingModal.present();
      this.loadingModal.setMessage(getString('GETTING_POSITION', this.lang));
    } else {
      if (this.mapIsReady) {
        this.loadingModal.dismiss();

        if(this.isFirstStart || this.nbOpeningBeforeDisplayingGalileoNotificationAgain === 0) {
          // Present galileo modal if not already presented
          if(!this.galileoModalPresentedThisSession) {
            this.galileoModalPresentedThisSession = true;
            this.presentGalileoModal();
          }
        }
      } else {
        this.loadingModal.setMessage(getString('LOADING_MAP', this.lang))
      }
      
    }

    // Update on position change when guidingLines aren't defined
    // otherwise update map on closest line change 
    // as position and closestLine could get out of sync
    // (closestLine is computed a few ms after position)
    // if(!this.guidingLines) {
    this.updateMapDisplay();
    // }
    
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

  @State() lang: any = 'en';

  closestLine: any
  @State() guidingLines: any;
  @Watch('guidingLines')
  guidingLinesChangeHandler() {
    // Force mapViewRefresh, todo handle this better
    // we need to trigger it when guidingLines change from null > something or something > null
    console.log('GUIDING LINE CHANGE')
    if(this.position) {
      this.handleNewPosition(this.position, true);
    }
  }

  @State() offline: any
  @Watch('offline')
  offlineWatchHandler(isOffline) {
    if(this.map) {
      if(isOffline) {
        let mapStyle = blankMapStyle;
        // Change map
        this.map.setStyle(mapStyle)
      } else {
        let mapStyle = 'mapbox://styles/mapbox/satellite-v9';
        this.map.setStyle(mapStyle)
      }
      
    }
  }

  @State() status: RecordingStatus;
  @State() rawMeasurements: any
  recordedPositions: Array<Array<number>>;

  isFirstStart: boolean;
  nbOpeningBeforeDisplayingGalileoNotificationAgain: number;
  galileoModalPresentedThisSession: boolean = false;

  getAndWatchPosition: Action;
  setDistanceToClosestGuidingLine: Action;
  setBearingToClosestGuidingLine: Action;
  startDefiningGuidingLines: Action;
  onBboxChanged: Action;
  createOrUpdateGuidingLines: Action;
  handleNewPosition: Action;
  getDeviceInfo: Action;
  restoreHistory: Action;
  restoreAppState: Action;
  registerAppOpening: Action;
  zoomIn: Action;
  zoomOut: Action;
  set2D: Action;
  set3D: Action;
  initNetworkListener: Action;
  restoreEquipmentWidth: Action;

  map: any;
  mapIsReady: boolean = false;
  mapFirstRender: boolean = false;

  @State() mapView: any;
  @Watch('mapView')
  mapViewHandler(mapView) {
    this.changeMapView(mapView);
  }

  loadingModal: LoadingIndicator = new LoadingIndicator(getString('GETTING_POSITION', this.lang));
  galileoModal: HTMLIonModalElement;

  componentWillLoad() {

    store.mapStateToProps(this, state => {
      const {
        recording: { status, recordedPositions },
        geolocation: { position },
        guiding: { referenceLine, equipmentWidth, isDefiningGuidingLines, guidingLines, bboxContainer, closestLine },
        map: { mapView },
        app: { isFirstStart, nbOpeningBeforeDisplayingGalileoNotificationAgain },
        gnssmeasurements: { rawMeasurements },
        device: { offline, lang }
      } = state;
      return {
        position,
        referenceLine,
        equipmentWidth,
        isDefiningGuidingLines,
        guidingLines,
        closestLine,
        bboxContainer,
        status,
        recordedPositions,
        mapView,
        isFirstStart,
        nbOpeningBeforeDisplayingGalileoNotificationAgain,
        rawMeasurements,
        offline,
        lang
      };
    });

    store.mapDispatchToProps(this, {
      getAndWatchPosition,
      setDistanceToClosestGuidingLine,
      setBearingToClosestGuidingLine,
      startDefiningGuidingLines, 
      onBboxChanged,
      createOrUpdateGuidingLines,
      handleNewPosition,
      getDeviceInfo,
      restoreHistory,
      restoreAppState,
      restoreEquipmentWidth,
      registerAppOpening,
      zoomIn,
      zoomOut,
      set2D, 
      set3D,
      initNetworkListener
    });


  }

  componentDidLoad() {
    SplashScreen.hide();

    this.getDeviceInfo();
    this.initNetworkListener();

    this.loadingModal.present()

    this.getAndWatchPosition();

    this.restoreHistory();
    this.restoreAppState();
    this.restoreEquipmentWidth();
    this.registerAppOpening();


    let mapStyle = 'mapbox://styles/mapbox/satellite-v9';
    if(this.offline) {
      // @ts-ignore
      mapStyle = blankMapStyle;
    }

    mapboxgl.accessToken = config.mapboxToken;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: mapStyle,
      zoom: 18
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
      if(this.guidingLines) {
        // Bbox container updated, refresh guidinglines display
        this.addOrUpdateGuidinglineToMap(this.guidingLines)
      }
      this.updateMapDisplay();
      // console.log('blabla')
      // this.map.setPaintProperty('guiding-lines', 'line-color', this.offline ? 'black' : 'white')
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

    let accuracyCircle = generateCircle(coords, position.coords.accuracy / 1000);

    let data = {
      "type": "FeatureCollection",
      "features": [
        point(coords),
        accuracyCircle
      ]
    }

    if (source) {
      source.setData(data)
    } else {
      console.log('Create position source and layer');
      this.map.addSource(layerAndSourceId, {
        "type": "geojson",
        "data": data
      });
      this.map.addLayer({
        "id": layerAndSourceId,
        "source": layerAndSourceId,
        "type": "circle",
        "paint": {
          "circle-radius": 5,
          "circle-color": "#B42222",
          "circle-stroke-width": 1,
          "circle-stroke-color": "white",
          "circle-pitch-alignment": "map",
          "circle-pitch-scale": "map"
        },
        "filter": ["==", "$type", "Point"]
      })

      this.map.addLayer({
        "id": `${layerAndSourceId}-accuracy`,
        "source": layerAndSourceId,
        "type": "fill",
        "paint": {
          "fill-color": "rgba(255, 100, 100, 1)",
          "fill-opacity": 0.3,
          "fill-outline-color": "white"
        },
        "filter": ["==", "$type", "Polygon"]
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
          "line-color": this.offline ? "black" : "white",
          "line-width": 2
        }
      });
    }
    return layerAndSourceId;
  }

  addOrUpdateClosestGuidingLineToMap(guidingLines, position) {
    const layerAndSourceId = 'closest-guiding-line';
    if (guidingLines && position && this.closestLine) {
      let sourceClosestLine = this.map.getSource(layerAndSourceId);  
      const closestLineGeojson = this.closestLine.line;
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
            "line-color": "blue",
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
      //let pointB = destination(pointA, (this.equipmentWidth * 3) / 1000, heading);
      // let headingLine = lineString([
      //   pointA.geometry.coordinates,
      //   pointB.geometry.coordinates
      // ]);

      let sectorHeadingA = position.coords.heading - 30 
      if(sectorHeadingA < 0) {
        sectorHeadingA += 360;
      }
      let sectorHeadingB = position.coords.heading + 30 
      if(sectorHeadingB < 0) {
        sectorHeadingB -= 360;
      }

      let headingSector = generateSector(pointA, Math.max((position.coords.accuracy / 1.2) / 1000, 3 / 1000), sectorHeadingA, sectorHeadingB)

      if (source) {
        source.setData(headingSector)
      } else {
        console.log('Create position source and layer');
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": headingSector
        });
        this.map.addLayer({
          "id": layerAndSourceId,
          "source": layerAndSourceId,
          "type": "fill",
          "paint": {
            "fill-color": "#B42222",
            "fill-opacity": 0.8
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
    if (positionsHistory[0].length > 1) {
      let source = this.map.getSource(layerAndSourceId);
      // TODO replace 10 by tool width
      // Could improve perfs of this by avoiding recomputing everything each new position, but just push the new ones...    
      const traceAsPolygons = positionsHistory.map((positions) => {
        if(positions.length > 1) {
          let linePositionHistory = lineString(positions);
          // This doesn't work if line history contains duplicates
          // Using this because turf buffer funciton isn't working properly for some reason
          let traceAsPolygon = lineToPolygon(linePositionHistory, this.equipmentWidth)
          return traceAsPolygon;
        }
      }).filter((polygon) => polygon !== undefined);

      const traceAsMultiPolygon = multiPolygon(traceAsPolygons);
      
      if (source) {
        source.setData(traceAsMultiPolygon)
      } else {
        console.log('Create position source and layer');
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": traceAsMultiPolygon
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

  async presentGalileoModal() {
    this.galileoModal = await modalController.create({
      component: 'galileo-modal',
      cssClass: 'inset-modal',
      backdropDismiss: false,
      keyboardClose: false
    });
    await this.galileoModal.present();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Tractor navigator</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="flex" style={{ "position": "relative"}}>
        {this.rawMeasurements !== null &&
          <accuracy-helper />
        }
        <div id="map"></div>
        <div class="container">
          <div class="ctas-container">
            <div class="ctas-help">
            </div>
            <div class="ctas-buttons">
              {!this.isDefiningGuidingLines && !this.guidingLines &&
                <ion-button
                  color="primary"
                  size="large"
                  onClick={() => this.startDefiningGuidingLines()}
                >
                  {getString('START_GUIDING_CTA', this.lang)}
                </ion-button>
              }
            </div>
          </div>
          {this.isDefiningGuidingLines &&
            <guiding-setup handleGuidingLinesDefined={() => {
              this.createOrUpdateGuidingLines(this.getBbox());
              this.map.resize();
            }} />
          }
          {!this.isDefiningGuidingLines && this.guidingLines &&
            <guiding-interface />
          }
          {this.mapView &&
            <div class={`mapbox-control mapboxgl-ctrl mapboxgl-ctrl-group 
              ${!this.isDefiningGuidingLines && !this.guidingLines ? 'pt-s' : ''} 
              ${!this.isDefiningGuidingLines && this.guidingLines && this.status !== RecordingStatus.Idle ? 'pt-l' : ''}`
            }>
              <button onClick={() => this.zoomIn()} class="mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-in" type="button" title="Zoom in" aria-label="Zoom in"></button>
              <button onClick={() => this.zoomOut()} class="mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-out" type="button" title="Zoom out" aria-label="Zoom out"></button>
              {this.mapView.pitch === 0 &&
                <button onClick={() => this.set3D()} class="mapboxgl-ctrl-icon" type="button" title="3D" aria-label="3D">
                  3D
                </button>
              }
              {this.mapView.pitch > 0 &&
                <button onClick={() => this.set2D()} class="mapboxgl-ctrl-icon" type="button" title="3D" aria-label="3D">
                  2D
                </button>
              }
            </div>
          }
        </div>
      </ion-content>
    ];
  }
}
