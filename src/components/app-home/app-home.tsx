import { Component, h } from '@stencil/core';
import mapboxgl from 'mapbox-gl';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  componentDidLoad() {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGR1cmFuZCIsImEiOiJjampsN2p0ZjkwOG5sM3BwY2o5a3lhcHhlIn0.UUKhPTCWbivcEScbhWIXJg';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9'
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
