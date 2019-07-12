import { Component, h, State } from '@stencil/core';
import mapboxgl from 'mapbox-gl';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import config from '../../config.json';
import pointGeojson from '../../assets/geojson/point.json';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
const { SplashScreen } = Plugins;
import { PulsingDot } from '../../helpers/utils';

/*

Todo include styles via module import instead of copy paste in app-home.css , when upgrading mapboxgl or mapboxgl-draw it might break

*/

const { Geolocation } = Plugins;

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() position: GeolocationPosition;
  @State() positionGeojson: any = pointGeojson;

  createPositionLayerAndSource(map) {
    let pulsingDot = new PulsingDot(map);
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    map.addSource('position' , { type: 'geojson', data: this.positionGeojson})
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

  componentDidLoad() {

    SplashScreen.hide();

    mapboxgl.accessToken = config.mapboxToken;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-v9',
      zoom: 17
    });

    var Draw = new MapboxDraw();

    map.addControl(Draw, 'bottom-left');

    map.on('draw.create', () => {
      console.log('blabla')
    });

    Geolocation.getCurrentPosition().then((position) => {
      if (position) {
        this.position = position;
        map.panTo({ lon: position.coords.longitude, lat: position.coords.latitude })
      }

      Geolocation.watchPosition({
        enableHighAccuracy: true
      }, (position) => {
        if (position) {
          this.position = position;
          // Update layer
          this.positionGeojson.features[0].geometry.coordinates = [this.position.coords.longitude, this.position.coords.latitude];
          if (!map.getSource("position")) {
            this.createPositionLayerAndSource(map);
          }
          this.updatePositionInSource(map);
        }
      })
    });


    map.on('load', () => {
      map.resize();
      this.positionGeojson.features[0].geometry.coordinates = [this.position.coords.longitude, this.position.coords.latitude];

      if (!map.getSource("position")) {
        this.createPositionLayerAndSource(map);
      }
      this.updatePositionInSource(map);
    });
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
        <ion-fab vertical="bottom" horizontal="center" slot="fixed" style={{transform: 'scale(1.5)', bottom: '40px'}}>
          <ion-fab-button>
            <ion-icon name="navigate"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    ];
  }
}
