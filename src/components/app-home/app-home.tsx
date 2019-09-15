import { Component, h, State, Prop } from '@stencil/core';
import { Plugins } from '@capacitor/core';
import { Store, Action } from "@stencil/redux";
import { getPosition } from '../../statemanagement/app/GeolocationStateManagement';
const { SplashScreen } = Plugins;

//import { styleMapboxOffline } from '../../helpers/utils';

/*

Todo include styles via module import instead of copy paste in app-home.css , when upgrading mapboxgl or mapboxgl-draw it might break

*/

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() position: Geolocation;
  getPosition: Action;

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        geolocation: { position }
      } = state;
      return {
        position
      };
    });

    this.store.mapDispatchToProps(this, {
      getPosition
    });
  }

  componentDidLoad() {
    SplashScreen.hide();
    this.getPosition();
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
