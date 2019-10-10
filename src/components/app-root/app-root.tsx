import { Component, h, Prop } from '@stencil/core';
/* Workaround because of : https://github.com/ionic-team/stencil-redux/issues/22 */ 
/* tslint:disable:no-import-side-effect */
import '@stencil/redux';
/* tslint:enable:no-import-side-effect */
import { Store } from "@stencil/redux";
import { configureStore } from "../../statemanagement/store";

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot {

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.setStore(configureStore({}));
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
