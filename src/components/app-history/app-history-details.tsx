import { Component, h, State, Prop, Watch } from '@stencil/core';
import { Store } from "@stencil/redux";
import mapboxgl from 'mapbox-gl';
import { lineString } from '@turf/helpers';
import bbox from '@turf/bbox';
import config from '../../config.json';

import { lineToPolygon } from '../../helpers/utils';

//import { styleMapboxOffline } from '../../helpers/utils';
// import { blankMapStyle } from '../../helpers/utils';

@Component({
  tag: 'app-history-details'
})
export class AppHistoryDetails {

  @Prop() indexOfRecording: number;

  @State() recording: any;
  @Watch('recording')
  recordingChangeHandler() {
    this.updateMapDisplay();
  }

  map: any;
  mapIsReady: boolean = false;
  mapFirstRender: boolean = false;

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {

    this.store.mapStateToProps(this, state => {
      return {
        recording: state.history.recordings[this.indexOfRecording] 
      }
    });

    // Here add action to restore a recording
    //this.store.mapDispatchToProps(this, {});
  }

  componentDidLoad() {

    // if online
    let mapStyle = 'mapbox://styles/mapbox/satellite-v9';
    // else
    // mapStyle = blankMapStyle;
    // TODO implement a reducer that watch network status and change 
    // blankMap -> satellite map
    // // If online, set satellite
    //this.map.setStyle('mapbox://styles/mapbox/satellite-v9');

    mapboxgl.accessToken = config.mapboxToken;
    this.map = new mapboxgl.Map({
      container: 'mapHistoryDetails',
      style: mapStyle,
      zoom: 18
    });

    //const navControl = new mapboxgl.NavigationControl();
    //this.map.addControl(navControl, 'top-right');

    this.map.on('render', () => {
      if (!this.mapFirstRender) {
        this.mapFirstRender = true;
        this.map.resize();
      }
    })

    this.map.on('style.load', () => {
      // Triggered when `setStyle` is called.
      this.updateMapDisplay();
    });

    this.map.on('load', () => {
      this.mapIsReady = true;
      this.map.resize();

      // Init source
      // Position
      this.updateMapDisplay();
    });
  }

  addOrUpdateTraceHistory(positionsHistory, equipmentWidth) {
    const layerAndSourceId = 'trace-history';
    if (positionsHistory.length > 1) {
      let source = this.map.getSource(layerAndSourceId);
      // TODO replace 10 by tool width
      // Could improve perfs of this by avoiding recomputing everything each new position, but just push the new ones...
      const linePositionHistory = lineString(positionsHistory);
      // This doesn't work if line history contains duplicates
      // Using this because turf buffer funciton isn't working properly for some reason
      // Width in meters
      const traceAsPolygon = lineToPolygon(linePositionHistory, equipmentWidth);
      const bboxOfTrace = bbox(traceAsPolygon);
      // Fit map to bbox
      this.map.fitBounds(bboxOfTrace, {
        padding: {top: 50, bottom:50, left: 50, right: 50},
        duration: 1,
        maxZoom: 18
      });
      if (source) {
        source.setData(traceAsPolygon)
      } else {
        console.log('Create position source and layer');
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": traceAsPolygon
        });
        this.map.addLayer({
          "id": layerAndSourceId,
          "source": layerAndSourceId,
          "type": "fill",
          "paint": {
            "fill-color": "blue",
            "fill-opacity": 0.4
          }
        })
      }
      return layerAndSourceId;
    }
  }
  
  removeSourceAndLayerIfExists(id) {
    if(this.map.getSource(id)) {
      this.map.removeLayer(id);
      this.map.removeSource(id);
    }
  }

  updateMapDisplay() {
    if(!this.mapIsReady) {
      return;
    }
    this.addOrUpdateTraceHistory(this.recording.trace, this.recording.equipmentWidth);

  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>Map</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <div id="mapHistoryDetails"></div>
        <div class="ctas-container">
          <div class="ctas-help">
          </div>
          <div class="ctas-buttons">
            {/* <ion-button
              color="primary"
              onClick={() => console.log('todo')}
            >
              Continue guiding
            </ion-button> */}
          </div>
        </div>
      </ion-content>
    ];
  }
}
