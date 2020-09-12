import { Component, h, State, Prop, Watch } from '@stencil/core';
import { store } from "@stencil/redux";
import mapboxgl from 'mapbox-gl';
import { lineString, multiPolygon } from '@turf/helpers';
import bbox from '@turf/bbox';
import config from '../../config.json';
import dayjs from 'dayjs';

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

  componentWillLoad() {

    store.mapStateToProps(this, state => {
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

    var nav = new mapboxgl.NavigationControl({
      showCompass: false
    });
    this.map.addControl(nav, 'top-right');

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
    if (positionsHistory[0].length > 1) {
      let source = this.map.getSource(layerAndSourceId);
      // TODO replace 10 by tool width
      // Could improve perfs of this by avoiding recomputing everything each new position, but just push the new ones...
      const traceAsPolygons = positionsHistory.map((positions) => {
        if(positions.length > 1) {
          let linePositionHistory = lineString(positions);
          // This doesn't work if line history contains duplicates
          // Using this because turf buffer funciton isn't working properly for some reason
          let traceAsPolygon = lineToPolygon(linePositionHistory, equipmentWidth)
          return traceAsPolygon;
        }
      }).filter((polygon) => polygon !== undefined);

      const traceAsMultiPolygon = multiPolygon(traceAsPolygons);
      const bboxOfTrace = bbox(traceAsMultiPolygon);
      // Fit map to bbox
      this.map.fitBounds(bboxOfTrace, {
        padding: {top: 50, bottom:50, left: 50, right: 50},
        duration: 1,
        maxZoom: 18
      });
      if (source) {
        source.setData(traceAsMultiPolygon)
      } else {
        console.log('Create position source and layer');
        this.map.addSource(layerAndSourceId, {
          "type": "geojson",
          "data": traceAsMultiPolygon
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

  computeTimeRecording(dateStart, dateEnd) {
    var diff = Math.abs(new Date(dateStart).getTime() - new Date(dateEnd).getTime());
    var seconds = Math.floor(diff/1000) % 60;
    var minutes = Math.floor((diff/1000)/60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
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
        <div class="flex flex-col" style={{"height": "100%", "width": "100%"}}>
          {this.recording &&
            <div class="message-box app-history-metadata">
              <h5>{dayjs(this.recording.dateStart).format('MMM DD, YYYY')}</h5>
              <p>{dayjs(this.recording.dateStart).format('hh:mm a')} - {dayjs(this.recording.dateEnd).format('hh:mm a')}</p>
              <div class="flex justify-center">
                <div class="flex items-center">
                  <ion-icon name="time"></ion-icon>
                  <div class="ml-1">{this.computeTimeRecording(this.recording.dateStart, this.recording.dateEnd)}</div>
                </div>
                <div class="flex items-center ml-2">
                  <ion-icon name="map"></ion-icon>
                  <div class="ml-1">{this.recording.area} ha</div>
                </div>
              </div>
            </div>
          }
          <div id="mapHistoryDetails"></div>
        </div>
      </ion-content>
    ];
  }
}
