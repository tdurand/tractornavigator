import { Component, h, State } from '@stencil/core';
import mapboxgl from 'mapbox-gl';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { loadingController, toastController } from '@ionic/core';
import config from '../../config.json';
import pointGeojson from '../../assets/geojson/point.json';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
const { SplashScreen } = Plugins;
import { PulsingDot } from '../../helpers/utils';
import turfBbox from '@turf/bbox'
const { Geolocation } = Plugins;

/*

Todo include styles via module import instead of copy paste in app-home.css , when upgrading mapboxgl or mapboxgl-draw it might break

*/

const MODE = {
  SELECTING_FIELD: "selecting_field",
  FREEMOVING: "freemoving"
}

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() position: GeolocationPosition;
  @State() positionGeojson: any = pointGeojson;
  @State() mode: any = MODE.FREEMOVING;
  @State() mapRendered: boolean = false;
  @State() mapLoaded: boolean = false;
  loadingScreen: any;
  Draw: any;
  map: any;

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

  updatePositionInSource(map) {
    map.getSource('position').setData(this.positionGeojson);
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
    this.mode = MODE.SELECTING_FIELD;
    this.Draw.changeMode('draw_polygon');
  }

  componentDidLoad() {

    this.presentLoading();

    SplashScreen.hide();

    mapboxgl.accessToken = config.mapboxToken;

    this.map = new mapboxgl.Map({
      container: 'map',
      center: [4.7677,46.3139],
      // style: 'mapbox://styles/mapbox/satellite-v9',
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 10
    });

    // Add drawing tools
    this.Draw = new MapboxDraw({
      displayControlsDefault: false,
      boxSelect: false
    });

    this.map.on('draw.create', (feature) => {
      var bbox = turfBbox(feature.features[0])
      console.log(bbox);


      // var bbox = [-95, 30 ,-85, 40];
      // var cellSide = 50; // cell size
      // var options = {units: 'kilometers'};

      // var squareGrid = turf.squareGrid(bbox, cellSide, options);
    });

    this.map.on('render', () => {

      if(this.mapRendered === false) {
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
        {/* {this.mapLoaded &&
          <ion-fab vertical="bottom" horizontal="center" slot="fixed">
            {this.mode === MODE.FREEMOVING &&
              <ion-button
                color="primary"
                onClick={() => this.enableSelectFieldMode()}
              >
                Select area
              </ion-button>
            }
            {this.mode === MODE.SELECTING_FIELD &&
              <ion-fab-button>
                <ion-icon name="checkmark"></ion-icon>
              </ion-fab-button>
            }
          </ion-fab>
        } */}
      </ion-content>
    ];
  }
}
