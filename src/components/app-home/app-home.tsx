import { Component, h } from '@stencil/core';
import mapboxgl from 'mapbox-gl';
import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;


@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  componentDidLoad() {
    
    mapboxgl.accessToken = 'pk.eyJ1IjoidGR1cmFuZCIsImEiOiJjampsN2p0ZjkwOG5sM3BwY2o5a3lhcHhlIn0.UUKhPTCWbivcEScbhWIXJg';

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      zoom: 17
    });

    // Watch position not working on android device
    // Geolocation.watchPosition({enableHighAccuracy: true}, (result) => {
    //   console.log('Blabalbal')
    //   if (result && result.coords) {
    //     console.log(result);
    //   }
    // })

    Geolocation.getCurrentPosition().then((position) => {
      // console.log('coords');
      if(position) {
        // console.log(position.coords);
        map.panTo({lon: position.coords.longitude, lat: position.coords.latitude})
      }
      
    });


    map.on('load',() => {
      map.resize();
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
      </ion-content>
    ];
  }
}
