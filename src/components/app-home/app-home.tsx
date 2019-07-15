import { Component, h, State } from '@stencil/core';
import mapboxgl from 'mapbox-gl';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { loadingController, toastController } from '@ionic/core';
import config from '../../config.json';
import pointGeojson from '../../assets/geojson/point.json';
import lineGeojson from '../../assets/geojson/line.json';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
const { SplashScreen } = Plugins;
import { PulsingDot } from '../../helpers/utils';
import turfBbox from '@turf/bbox';
import turfSquareGrid from '@turf/square-grid';
import turfTransformRotate from '@turf/transform-rotate';
const { Geolocation } = Plugins;

/*

Todo include styles via module import instead of copy paste in app-home.css , when upgrading mapboxgl or mapboxgl-draw it might break

*/

const MODE = {
  SELECTING_FIELD: "selecting_field",
  FREEMOVING: "freemoving",
  NAVIGATION: "navigation"
}

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() position: GeolocationPosition;
  @State() positionHistory: Array<GeolocationPosition> = [];
  @State() positionGeojson: any = pointGeojson;
  traceGeojson: any = lineGeojson;
  @State() mode: any = MODE.FREEMOVING;
  @State() mapRendered: boolean = false;
  @State() mapLoaded: boolean = false;
  @State() areaDrawn: boolean = false;
  @State() isDrawingArea: boolean = false;
  @State() readyToNavigate: boolean = false;
  @State() isNavigating: boolean = false;
  loadingScreen: any
  Draw: any;
  map: any;
  toastDrawingHelpShown: boolean = false;


  async presentToastErrorGPS() {
    const toast = await toastController.create({
      message: "Error while getting your location, it might be permission issue or something else, this will be handled better in M2, you can still explore the rest of the app",
      color: 'dark',
      position: 'top',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            if (this.loadingScreen) {
              this.loadingScreen.dismiss();
            }
          }
        }
      ]
    });

    return await toast.present();
  }

  async presentToastDrawingHelp() {
    const toast = await toastController.create({
      message: "Select on the map the area you want to cover, finish by linking to the first point",
      duration: 5000,
      color: 'dark',
      position: 'top',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.toastDrawingHelpShown = true;
          }
        }
      ]
    });

    return await toast.present();
  }

  async presentLoading() {
    this.loadingScreen = await loadingController.create({
      message: 'Getting your location...',
      duration: 15000
    });

    await this.loadingScreen.present();
  }

  createPositionLayerAndSource(map) {
    let pulsingDot = new PulsingDot(map);
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    map.addSource('position', { type: 'geojson', data: this.positionGeojson })
    map.addLayer({
      "id": "position",
      "type": "symbol",
      "source": "position",
      "layout": {
        "icon-image": "pulsing-dot"
      }
    });
  }

  createGridLayer(map, geojson) {
    map.addSource('grid', { type: 'geojson', data: geojson })
    map.addLayer({
      "id": "grid",
      "type": "line",
      "source": "grid",
      "paint": {
        "line-color": "blue",
        "line-opacity": 0.75,
        "line-width": 2
      }
    });
  }

  createTraceLayer(map, geojson) {
    map.addSource('trace', { type: 'geojson', data: geojson });
    map.addLayer({
      "id": "trace",
      "type": "line",
      "source": "trace",
      "paint": {
        "line-color": "yellow",
        "line-opacity": 0.75,
        "line-width": 5
      }
    });
  }

  updatePositionInSource(map) {
    map.getSource('position').setData(this.positionGeojson);
  }

  updateTraceDisplay(map, geojson) {
    console.log(geojson)
    map.getSource('trace').setData(geojson);
    map.panTo([this.position.coords.longitude, this.position.coords.latitude]);
  }

  removeGridLayer(map) {
    map.removeLayer('grid');
    map.removeSource('grid');
  }

  removeTraceLayer(map) {
    map.removeLayer('trace');
    map.removeSource('trace');
  }

  onLocationError() {
    this.presentToastErrorGPS();
    if (this.loadingScreen) {
      this.loadingScreen.dismiss();
    }
  }

  startWatchingGeoloc() {
    Geolocation.getCurrentPosition({
      timeout: 15000
    }).then((position) => {
      if (position) {
        if (this.loadingScreen) {
          this.loadingScreen.dismiss();
          console.log(this.loadingScreen);
        }
        this.position = position;
        this.map.panTo({ lon: position.coords.longitude, lat: position.coords.latitude })
      } else {
        this.onLocationError();
      }

      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.dismiss();
        }
      }, 1000)

      Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 15000
      }, (position) => {
        if (position) {
          console.log('got new position');
          if (this.loadingScreen) {
            this.loadingScreen.dismiss();
          }
          this.position = position;
          // Update layer
          this.positionGeojson.features[0].geometry.coordinates = [this.position.coords.longitude, this.position.coords.latitude];
          if (!this.map.getSource("position")) {
            this.createPositionLayerAndSource(this.map);
          }
          this.updatePositionInSource(this.map);
          if(this.mode === MODE.NAVIGATION && this.isNavigating) {
            console.log('add position to trace data');
            this.addPositionToTraceData(position);
            this.updateTraceDisplay(this.map, this.traceGeojson);
          }
        } else {
          this.onLocationError();
        }
      })
    }).catch((error) => {
      console.log(error);
      this.onLocationError();
    });
  }

  enableSelectFieldMode() {
    // TODO add Toast explaining what to do
    this.mode = MODE.SELECTING_FIELD;
    this.isDrawingArea = true;
    this.Draw.changeMode('draw_polygon');
    if (!this.toastDrawingHelpShown) {
      this.presentToastDrawingHelp();
    }
  }

  onFinishDraw(feature) {
    this.isDrawingArea = false;
    this.areaDrawn = true;
    var bbox = turfBbox(feature.features[0])
    // console.log(bbox);
    var bbox = bbox;
    var cellSide = 0.01; // cell size
    // 1km = 1000m , 0.1 = 100m, 0.01 = 10m
    //var options = {units: 'kilometers'};
    var squareGrid = turfSquareGrid(bbox, cellSide);
    var bearing = this.map.getBearing();
    var squareGridRotated = turfTransformRotate(squareGrid, bearing, {
      mutate: true
    });  
    this.createGridLayer(this.map, squareGridRotated);

    // TODO
    // add button to redraw
    // Show modal asking for cellSide ("pas")
    // On OK : this.createGridLayer(this.map, squareGrid);
    // Remove drawn polygon
    this.Draw.deleteAll();
  }

  removeFieldSelection() {
    // TODO
    // Draw remove polygon
    this.Draw.deleteAll();
    // Remove grid
    this.areaDrawn = false;
    this.readyToNavigate = false;
    this.mode = MODE.FREEMOVING;
    this.removeGridLayer(this.map);
  }

  confirmFieldSelection() {
    this.readyToNavigate = true;
    this.mode = MODE.NAVIGATION;
  }

  addPositionToTraceData(position) {
    this.positionHistory.push(position);
    this.traceGeojson.features[0].geometry.coordinates = this.positionHistory.map((position) => {
      return [position.coords.longitude, position.coords.latitude]
    });
  }

  startNavigation() {
    this.isNavigating = true;
    // todo
    this.addPositionToTraceData(this.position);
    this.createTraceLayer(this.map, this.traceGeojson)
    this.updateTraceDisplay(this.map, this.traceGeojson);
  }

  stopNavigation() {
    this.isNavigating = false;
    this.removeTraceLayer(this.map);
    // Reset position history
    this.positionGeojson = lineGeojson;
    this.positionHistory = [];

    // TODO , go to history
  }

  componentDidLoad() {

    this.presentLoading();

    SplashScreen.hide();

    mapboxgl.accessToken = config.mapboxToken;

    this.map = new mapboxgl.Map({
      container: 'map',
      center: [4.7677, 46.3139],
      style: 'mapbox://styles/mapbox/satellite-v9',
      //style: styleMapboxOffline,
      zoom: 17,
      minZoom: 16
    });

    const navControl = new mapboxgl.NavigationControl();
    this.map.addControl(navControl, 'top-right');

    // Add drawing tools
    this.Draw = new MapboxDraw({
      displayControlsDefault: false,
      boxSelect: false
    });

    this.map.on('draw.create', (feature) => {
      this.onFinishDraw(feature);
    });

    this.map.on('render', () => {

      if (this.mapRendered === false) {
        console.log('first render')
        this.mapRendered = true;
        this.map.resize();
      }
    });

    this.map.on('load', () => {
      console.log('map loaded')
      this.mapLoaded = true;
      // Add position
      this.positionGeojson.features[0].geometry.coordinates = [this.position.coords.longitude, this.position.coords.latitude];
      if (!this.map.getSource("position")) {
        this.createPositionLayerAndSource(this.map);
      }
      this.updatePositionInSource(this.map);

      this.map.addControl(this.Draw);
    });

    this.startWatchingGeoloc();
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
        {this.mapLoaded &&
          <div class="ctas-container">
            <div class="ctas-help">

            </div>
            <div class="ctas-buttons">
              {this.mode === MODE.FREEMOVING &&
                <ion-button
                  color="primary"
                  onClick={() => this.enableSelectFieldMode()}
                >
                  Select area
              </ion-button>
              }
              {this.mode === MODE.SELECTING_FIELD && (this.isDrawingArea || this.areaDrawn) &&
                <ion-button
                  color="secondary"
                  onClick={() => this.removeFieldSelection()}
                >
                  Cancel
                </ion-button>
              }
              {this.mode === MODE.SELECTING_FIELD && this.areaDrawn &&
                <ion-button
                  color="primary"
                  onClick={() => this.confirmFieldSelection()}
                >
                  Confirm
              </ion-button>
              }
              {this.mode === MODE.NAVIGATION && this.readyToNavigate && !this.isNavigating &&
                <div>
                  <ion-button
                    color="secondary"
                    onClick={() => this.removeFieldSelection()}
                  >
                    Cancel
                  </ion-button>
                  <ion-button
                    color="primary"
                    onClick={() => this.startNavigation()}
                  >
                    Start navigation
                  </ion-button>
                </div>
              }
              {this.mode === MODE.NAVIGATION && this.isNavigating &&
                <ion-router-link href="history">
                  <ion-button
                    color="danger"
                    onClick={() => this.stopNavigation()}
                  >
                    Stop navigation
                  </ion-button>
                </ion-router-link>
              }
            </div>
          </div>
        }
      </ion-content>
    ];
  }
}
