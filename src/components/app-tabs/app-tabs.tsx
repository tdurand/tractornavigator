import { Component, h } from "@stencil/core";

@Component({
  tag: "app-tabs",
  styleUrl: "app-tabs.css"
})
export class AppTabs {
  render() {
    return [
      <ion-tabs>
        <ion-tab tab="tab-home" component="app-home" />
        <ion-tab tab="tab-gpssettings" component="app-gpssettings" />
        <ion-tab tab="tab-history" component="app-history" />
        <ion-tab tab="tab-offline" component="app-offline" />
        <ion-tab tab="tab-about" component="app-about" />
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab-home">
            <ion-icon name="map"></ion-icon>
            <ion-label>Navigation</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-gpssettings">
            <ion-icon name="locate"></ion-icon>
            <ion-label>GPS Settings</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-history">
            <ion-icon name="list"></ion-icon>
            <ion-label>History</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-offline">
            <ion-icon name="airplane"></ion-icon>
            <ion-label>Use offline</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-about">
            <ion-icon name="information-circle"></ion-icon>
            <ion-label>About</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    ];
  }
}