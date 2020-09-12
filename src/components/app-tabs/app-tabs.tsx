import { Component, h, State } from "@stencil/core";
import { store } from "@stencil/redux";
import { getString } from "../../global/lang";

@Component({
  tag: "app-tabs",
  styleUrl: "app-tabs.css"
})
export class AppTabs {

  @State() lang: any;

  componentWillLoad() {

    store.mapStateToProps(this, state => {
      return {
        lang: state.device.lang
      }
    });

    // Here add action to restore a recording
    //this.store.mapDispatchToProps(this, {});
  }

  render() {
    return this.lang ? [
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
            <ion-label>{getString("TAB_NAVIGATION", this.lang)}</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-gpsstatus">
            <ion-icon name="locate"></ion-icon>
            <ion-label>{getString("TAB_GPSSTATUS", this.lang)}</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-history">
            <ion-icon name="list"></ion-icon>
            <ion-label>{getString("TAB_HISTORY", this.lang)}</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-about">
            <ion-icon name="information-circle"></ion-icon>
            <ion-label>{getString("TAB_ABOUT", this.lang)}</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    ] : [];
  }
}