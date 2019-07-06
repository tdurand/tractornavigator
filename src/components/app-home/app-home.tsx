import { Component, h, State } from '@stencil/core';
import mapboxgl from 'mapbox-gl';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import config from '../../config.json';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

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

  componentDidLoad() {

    mapboxgl.accessToken = config.mapboxToken;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-v9',
      zoom: 17
    });

    var Draw = new MapboxDraw();

    map.addControl(Draw, 'bottom-left');

    var size = 100;

    var pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      onAdd: function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },

      render: function () {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = size / 2 * 0.3;
        var outerRadius = size / 2 * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // keep the map repainting
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
      }
    };

    // Watch position not working on android device
    // Geolocation.watchPosition({enableHighAccuracy: true}, (result) => {
    //   console.log('Blabalbal')
    //   if (result && result.coords) {
    //     console.log(result);
    //   }
    // })

    Geolocation.getCurrentPosition().then((position) => {
      // console.log('coords');
      if (position) {
        this.position = position;
        map.panTo({ lon: position.coords.longitude, lat: position.coords.latitude })
      }

    });


    map.on('load', () => {
      map.resize();


      map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

      map.addLayer({
        "id": "points",
        "type": "symbol",
        "source": {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": [{
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [this.position.coords.longitude, this.position.coords.latitude]
              }
            }]
          }
        },
        "layout": {
          "icon-image": "pulsing-dot"
        }
      });
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
        <ion-fab vertical="bottom" horizontal="center" slot="fixed">
          <ion-fab-button>
            <ion-icon name="create"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    ];
  }
}
