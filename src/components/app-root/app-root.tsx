import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot {

  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route url="/" component="app-home" />
          <ion-route url="/profile/:name" component="app-profile" />
        </ion-router>
        <ion-nav />
        <ion-tabs>
          <ion-tab-bar slot="bottom">
            <ion-tab-button tab="map">
              <ion-icon name="map"></ion-icon>
              <ion-label>Map</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="gps-status">
              <ion-icon name="locate"></ion-icon>
              <ion-label>GPS Status</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="history">
              <ion-icon name="list"></ion-icon>
              <ion-label>History</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="about">
              <ion-icon name="information-circle"></ion-icon>
              <ion-label>About</ion-label>
            </ion-tab-button>
          </ion-tab-bar>
        </ion-tabs>
      </ion-app>
    );
  }
}
