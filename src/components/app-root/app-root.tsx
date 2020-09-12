import { Component, h } from '@stencil/core';
import { store } from "@stencil/redux";
import { configureStore } from "../../statemanagement/store";

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot {

  componentWillLoad() {
    store.setStore(configureStore({}));
  }

  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route component="app-tabs">
            <ion-route url="/" component="tab-home" />
            <ion-route url="/gpsstatus" component="tab-gpsstatus" />
            <ion-route url="/history" component="tab-history">
              <ion-route component="app-history" />
              <ion-route url="/:indexOfRecording" component="app-history-details" />
            </ion-route>
            <ion-route url="/offline" component="tab-offline" />
            <ion-route url="/about" component="tab-about" />
          </ion-route>
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }
}
