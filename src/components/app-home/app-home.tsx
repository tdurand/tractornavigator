import { Component, h, State, Prop, Watch } from '@stencil/core';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { Store, Action } from "@stencil/redux";
import mapboxgl from 'mapbox-gl';
import { getAndWatchPosition } from '../../statemanagement/app/GeolocationStateManagement';
import { blankMapStyle } from '../../helpers/utils';
import { point } from '@turf/helpers';
const { SplashScreen } = Plugins;
import LoadingIndicator from './loadingIndicator';

//import { styleMapboxOffline } from '../../helpers/utils';

/*

Todo include styles via module import instead of copy paste in app-home.css , when upgrading mapboxgl or mapboxgl-draw it might break

*/

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() position: GeolocationPosition;
  @Watch('position')
  watchHandler(position: GeolocationPosition) {
    console.log('Got a new position');
    this.position = position;

    if(!this.position) {
      this.isGettingPositionLoader.present();
    } else {
      this.isGettingPositionLoader.dismiss();
    }
    
    if(this.mapIsReady) {
      this.updatePosition(position);
    }
  }

  getAndWatchPosition: Action;
  map: any;
  mapIsReady: boolean = false;
  isGettingPositionLoader: any = new LoadingIndicator();

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
      getAndWatchPosition
    });
  }

  componentDidLoad() {
    SplashScreen.hide();
    
    this.isGettingPositionLoader.present()

    this.getAndWatchPosition();

    this.map = new mapboxgl.Map({
      container: 'map',
      style: blankMapStyle,
      zoom: 17,
      minZoom: 16
    });

    this.map.on('load', () => {
      this.mapIsReady = true;
      this.map.resize();
      console.log('Map loaded');
      // Init source
      // Position
      this.updatePosition(this.position);
    });
  }

  updatePosition(position) {
    if(position) {
      this.map.setCenter([position.coords.longitude, position.coords.latitude]);
      this.addOrUpdatePositionToMap(position);
    }
  }

  addOrUpdatePositionToMap(position) {
    let source = this.map.getSource('position');
    let coords = [0,0]
    if(position) {
      coords = [position.coords.longitude, position.coords.latitude]
    }
    if(source) {
      console.log('Update position source');
      source.setData(point(coords))
    } else {
      console.log('Add position source');
      this.map.addSource("position", {
        "type": "geojson",
        "data": point(coords)
      });
      this.map.addLayer({
        "id": "position",
        "source": "position",
        "type": "circle",
        "paint": {
          "circle-radius": 10,
          "circle-color": "#B42222"
        }
      })
    }
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
