import { Component, h, State, Prop, Watch } from '@stencil/core';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { Store, Action } from "@stencil/redux";
import mapboxgl from 'mapbox-gl';
import { getAndWatchPosition } from '../../statemanagement/app/GeolocationStateManagement';
// import { blankMapStyle } from '../../helpers/utils';
import { point, lineString } from '@turf/helpers';
import destination from '@turf/destination';
const { SplashScreen } = Plugins;
import LoadingIndicator from '../../helpers/loadingIndicator';
import GuidingLines from '../../helpers/guidinglines';
import config from '../../config.json';

import Geosimulation from '../../helpers/geolocationsimulator';

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

    if (!this.position) {
      this.isGettingPositionLoader.present();
    } else {
      this.isGettingPositionLoader.dismiss();

      // Compute derived data from position change
      // TODO compute this in the position change handler
      // const closestLineGeojson = guidingLines.getClosestLine(position).line;
      if (this.mapIsReady) {
        this.updatePosition(position);
      }
    }
  }

  getAndWatchPosition: Action;
  map: any;
  mapIsReady: boolean = false;
  mapFirstRender: boolean = false;
  isGettingPositionLoader: LoadingIndicator = new LoadingIndicator("Getting your position...");


  guidingLines: any = null;

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

    var coordinates = [
      { latitude: 46.30785436578275, longitude: 1.7742705345153809 },
      { latitude: 46.30727628127203, longitude: 1.7754185199737547 },
      { latitude: 46.30691312249563, longitude: 1.7756867408752441 },
      { latitude: 46.30700205956158, longitude: 1.776491403579712 },
      { latitude: 46.30722440159435, longitude: 1.7767703533172605 }
    ]
    var simulation = Geosimulation({ coords: coordinates, speed: 15 });
    simulation.start();

    this.isGettingPositionLoader.present()

    this.getAndWatchPosition();

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
      container: 'map',
      style: mapStyle,
      zoom: 17,
      minZoom: 16
    });

    this.map.on('render', () => {
      if (!this.mapFirstRender) {
        this.mapFirstRender = true;
        this.map.resize();
      }
    })

    this.map.on('style.load', () => {
      // Triggered when `setStyle` is called.
      this.refreshDataLayers();
    });

    this.map.on('load', () => {
      this.mapIsReady = true;
      this.map.resize();
      console.log('Map loaded');

      // Init source
      // Position
      this.updatePosition(this.position);

      // Create guiding lines
      // will do this after asking the reference line and the size on the thing behind the tractor
      let bbox = this.map.getBounds().toArray().flat()
      this.guidingLines = new GuidingLines(10,
        [
          [
            1.7742168903350828,
            46.30783954317925
          ],
          [
            1.7760729789733887,
            46.30626832444591
          ]
        ],
        bbox
      );
      this.guidingLines.generate();
      this.addOrUpdateGuidinglineToMap(this.guidingLines);
    });
  }

  addOrUpdatePositionToMap(position) {
    let source = this.map.getSource('position');
    let coords = [0, 0]
    if (position) {
      coords = [position.coords.longitude, position.coords.latitude]
    }
    if (source) {
      console.log('Update position source');
      source.setData(point(coords))
    } else {
      console.log('Create position source and layer');
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

  addOrUpdateGuidinglineToMap(guidingLines) {
    if (!guidingLines) {
      return;
    }
    let source = this.map.getSource('guiding-lines');
    if (source) {
      console.log('Update guiding lines source')
      source.setData(guidingLines.getGeojson())
    } else {
      console.log('Create guiding lines source and layer')
      this.map.addSource("guiding-lines", {
        "type": "geojson",
        "data": guidingLines.getGeojson()
      })

      this.map.addLayer({
        "id": "guiding-lines",
        "type": "line",
        "source": "guiding-lines",
        "paint": {
          "line-color": "white",
          "line-width": 2
        }
      });
    }
  }

  addOrUpdateClosestGuidingLineToMap(guidingLines, position) {
    if (guidingLines && position) {
      let sourceClosestLine = this.map.getSource('closest-guiding-line');
      // TODO compute this in the position change handler
      const closestLineGeojson = guidingLines.getClosestLine([position.coords.longitude, position.coords.latitude]).line;
      console.log('Closest guiding line');
      console.log(closestLineGeojson);
      if (sourceClosestLine) {
        console.log('Update closest guiding lines')
        sourceClosestLine.setData(closestLineGeojson)
      } else {
        console.log('Create closest guiding lines source and layer')
        this.map.addSource("closest-guiding-line", {
          "type": "geojson",
          "data": closestLineGeojson
        })

        this.map.addLayer({
          "id": "closest-guiding-line",
          "type": "line",
          "source": "closest-guiding-line",
          "paint": {
            "line-color": "green",
            "line-width": 10
          }
        });
      }
    }
  }


  addOrUpdateHeadingLine(position) {
    if (position && position.coords.heading) {
      let source = this.map.getSource('heading-line');
      // Create heading line from position 
      let pointA = point([position.coords.longitude, position.coords.latitude]);
      let heading = position.coords.heading;
      this.map.setBearing(heading);
      // Convert heading to -180 180
      if(heading > 180) {
        heading -= 360;
      }
      let pointB = destination(pointA, 1, heading);
      let headingLine = lineString([
        pointA.geometry.coordinates,
        pointB.geometry.coordinates
      ]);
      if (source) {
        console.log('Update position source');
        source.setData(headingLine)
      } else {
        console.log('Create position source and layer');
        this.map.addSource("heading-line", {
          "type": "geojson",
          "data": headingLine
        });
        this.map.addLayer({
          "id": "heading-line",
          "source": "heading-line",
          "type": "line",
          "paint": {
            "line-color": "red",
            "line-width": 3
          }
        })
      }
    }
  }

  updatePosition(position) {
    if (position) {
      this.map.setCenter([position.coords.longitude, position.coords.latitude]);
      this.addOrUpdateClosestGuidingLineToMap(this.guidingLines, position);
      this.addOrUpdateHeadingLine(position);
      this.addOrUpdatePositionToMap(position);
    }
  }

  refreshDataLayers() {
    console.log('refreshDataLayers');
    this.addOrUpdateGuidinglineToMap(this.guidingLines);
    this.addOrUpdateClosestGuidingLineToMap(this.guidingLines, this.position);
    this.addOrUpdateHeadingLine(this.position);
    this.addOrUpdatePositionToMap(this.position);
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
