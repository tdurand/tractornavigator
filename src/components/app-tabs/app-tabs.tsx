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
        <ion-tab tab="tab-gpsstatus" component="app-gpsstatus" />
        <ion-tab tab="tab-history">
          <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab tab="tab-offline" component="app-offline" />
        <ion-tab tab="tab-about" component="app-about" />
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab-home">
            <ion-icon name="map"></ion-icon>
            <ion-label>Navigation</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-gpsstatus">
            <ion-icon name="locate"></ion-icon>
            <ion-label>GPS Status</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-history">
            <ion-icon name="list"></ion-icon>
            <ion-label>History</ion-label>
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