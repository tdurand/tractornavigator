import lineOffset from '@turf/line-offset';
import { polygon } from '@turf/helpers';

export function sayHello() {
  return Math.random() < 0.5 ? 'Hello' : 'Hola';
}

export function geopositionToObject(geoposition) {
  return {
    timestamp: geoposition.timestamp,
    coords: {
      accuracy: geoposition.coords.accuracy,
      altitude: geoposition.coords.altitude,
      altitudeAccuracy: geoposition.coords.altitudeAccuracy,
      heading: geoposition.coords.heading,
      latitude: geoposition.coords.latitude,
      longitude: geoposition.coords.longitude,
      speed: geoposition.coords.speed
    }
  }
}

export class PulsingDot {

  size = 100;
  width = 100;
  height = 100;
  data = new Uint8Array(100 * 100 * 4);
  map =  null;
  context = null;

  constructor(map) {
    this.map = map;
  }

  onAdd() {
    var canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d');
  }

  render() {
    var duration = 1000;
    var t = (performance.now() % duration) / duration;

    var radius = this.size / 2 * 0.3;
    var outerRadius = this.size / 2 * 0.7 * t + radius;
    var context = this.context;

    // draw outer circle
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
    context.fill();

    // draw inner circle
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255, 100, 100, 1)';
    context.strokeStyle = 'white';
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // update this image's data with data from the canvas
    this.data = context.getImageData(0, 0, this.width, this.height).data;

    // keep the map repainting
    this.map.triggerRepaint();

    // return `true` to let the map know that the image was updated
    return true;
  }
};


export const styleMapboxOffline = {
  "version": 8,
  "sources": {
    "countries": {
      "type": "vector",
      // "url": "mapbox://map-id"
      // "url": "http://tileserver.com/layer.json", 
      "tiles": [location.origin+location.pathname+"assets/countries/{z}/{x}/{y}.pbf"],
      "maxzoom": 6
    }
  },
  "glyphs": location.origin+location.pathname+"assets/font/{fontstack}/{range}.pbf",
  "layers": [{
    "id": "background",
    "type": "background",
    "paint": {
      "background-color": "#ddeeff"
    }
  },{
    "id": "country-glow-outer",
    "type": "line",
    "source": "countries",
    "source-layer": "country",
    "layout": {
      "line-join":"round"
    },
    "paint": {
      "line-color": "#226688",
      "line-width": 5,
      "line-opacity": {
        "stops": [[0,0],[1,0.1]]
      }
    }
  },{
    "id": "country-glow-inner",
    "type": "line",
    "source": "countries",
    "source-layer": "country",
    "layout": {
      "line-join":"round"
    },
    "paint": {
      "line-color": "#226688",
      "line-width": {
        "stops": [[0,1.2],[1,1.6],[2,2],[3,2.4]]
      },
      "line-opacity":0.8,
    }
  // rainbow start
  },{
    "id": "area-white",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'ATA','FRA','FRO'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#F0F8FF"
    }
  },{
    "id": "area-red",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'AFG','ALD','BEN','BLR','BWA','COK','COL','DNK','DOM','ERI','FIN','GIB','GNB','GNQ','GRC','GTM','JPN','KIR','LKA','MHL','MMR','MWI','NCL','OMN','RWA','SMR','SVK','SYR','TCD','TON','URY','WLF'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#fdaf6b"
    }
  },{
    "id": "area-orange",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'AZE','BGD','CHL','CMR','CSI','DEU','DJI','GUY','HUN','IOA','JAM','LBN','LBY','LSO','MDG','MKD','MNG','MRT','NIU','NZL','PCN','PYF','SAU','SHN','STP','TTO','UGA','UZB','ZMB'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#fdc663"
    }
  },{
    "id": "area-yellow",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'AGO','ASM','ATF','BDI','BFA','BGR','BLZ','BRA','CHN','CRI','ESP','HKG','HRV','IDN','IRN','ISR','KNA','LBR','LCA','MAC','MUS','NOR','PLW','POL','PRI','SDN','TUN','UMI','USA','USG','VIR','VUT'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#fae364"
    }
  },{
    "id": "area-green",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'ARE','ARG','BHS','CIV','CLP','DMA','ETH','GAB','GRD','GRL','HMD','IND','IOT','IRL','IRQ','ITA','KOS','LUX','MEX','NAM','NER','PHL','PRT','RUS','SEN','SUR','TZA','VAT'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#d3e46f"
    }
  },{
    "id": "area-turquoise",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'AUT','BEL','BHR','BMU','BRB','CYN','DZA','EST','FLK','GMB','GUM','HND','JEY','KGZ','LIE','MAF','MDA','NGA','NRU','SLB','SOL','SRB','SWZ','THA','TUR','VEN','VGB'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#aadb78"
    }
  },{
    "id": "area-blue",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'AIA','BIH','BLM','BRN','CAF','CHE','COM','CPV','CUB','ECU','ESB','FSM','GAZ','GBR','GEO','KEN','LTU','MAR','MCO','MDV','NFK','NPL','PNG','PRY','QAT','SLE','SPM','SYC','TCA','TKM','TLS','VNM','WEB','WSB','YEM','ZWE'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#a3cec5"
    }
  },{
    "id": "area-purple",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'ABW','ALB','AND','ATC','BOL','COD','CUW','CYM','CYP','EGY','FJI','GGY','IMN','KAB','KAZ','KWT','LAO','MLI','MNP','MSR','MYS','NIC','NLD','PAK','PAN','PRK','ROU','SGS','SVN','SWE','TGO','TWN','VCT','ZAF'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#ceb5cf"
    }
  },{
    "id": "area-pink",
    "type": "fill",
    "source": "countries",
    "filter":["in","ADM0_A3",'ARM','ATG','AUS','BTN','CAN','COG','CZE','GHA','GIN','HTI','ISL','JOR','KHM','KOR','LVA','MLT','MNE','MOZ','PER','SAH','SGP','SLV','SOM','TJK','TUV','UKR','WSM'],
    "source-layer": "country",
    "paint": {
      "fill-color": "#f3c1d3"
    }
  // rainbow end
  },{
    "id": "geo-lines",
    "type": "line",
    "source": "countries",
    "source-layer": "geo-lines",
    "paint": {
      "line-color": "#226688",
      "line-width": {
        "stops": [[0,0.2],[4,1]]
      },
      "line-dasharray":[6,2]
    }
  },{
    "id": "land-border-country",
    "type": "line",
    "source": "countries",
    "source-layer": "land-border-country",
    "paint": {
      "line-color": "#fff",
      "line-width": {
        "base":1.5,
        "stops": [[0,0],[1,0.8],[2,1]]
      }
    }
  },{
    "id": "state",
    "type": "line",
    "source": "countries",
    "source-layer": "state",
    "minzoom": 3,
    "filter": ["in","ADM0_A3",'USA','CAN','AUS'],
    "paint": {
      "line-color": "#226688",
      "line-opacity": 0.25,
      "line-dasharray":[6,2,2,2],
      "line-width": 1.2
    }
  // LABELS
  },{
    "id": "country-abbrev",
    "type": "symbol",
    "source": "countries",
    "source-layer": "country-name",
    "minzoom":1.8,
    "maxzoom":3,
    "layout": {
      "text-field": "{ABBREV}",
      "text-font": ["Open Sans Semibold"],
      "text-transform": "uppercase",
      "text-max-width": 20,
      "text-size": {
        "stops": [[3,10],[4,11],[5,12],[6,16]]
      },
      "text-letter-spacing": {
        "stops": [[4,0],[5,1],[6,2]]
      },
      "text-line-height": {
        "stops": [[5,1.2],[6,2]]
      }
    },
    "paint": {
      "text-halo-color": "#fff",
      "text-halo-width": 1.5
    }
  },{
    "id": "country-name",
    "type": "symbol",
    "source": "countries",
    "source-layer": "country-name",
    "minzoom":3,
    "layout": {
      "text-field": "{NAME}",
      "text-font": ["Open Sans Semibold"],
      "text-transform": "uppercase",
      "text-max-width": 20,
      "text-size": {
        "stops": [[3,10],[4,11],[5,12],[6,16]]
      }
    },
    "paint": {
      "text-halo-color": "#fff",
      "text-halo-width": 1.5
    }
  },{
    "id": "geo-lines-lables",
    "type": "symbol",
    "source": "countries",
    "source-layer": "geo-lines",
    "minzoom":1,
    "layout": {
      "text-field": "{DISPLAY}",
      "text-font": ["Open Sans Semibold"],
      "text-offset": [0,1],
      "symbol-placement": "line",
      "symbol-spacing": 600,
      "text-size": 9
    },
    "paint": {
      "text-color": "#226688",
      "text-halo-width": 1.5
    }
  }]
};


export const blankMapStyle = {
  "version": 8,
  "sources": {
    "point": {
      "type": "geojson",
      "data": {
        "type": "Point",
        "coordinates": [0,0]
      }
    }
  },
  "layers": [{
    "id": "point",
    "source": "point",
    "type": "circle",
    "paint": {
      "circle-radius": 0.1,
      "circle-color": "transparent"
    }
  }]
}

// Using this because turf buffer funciton isn't working properly for some reason
// Width in meters
export function lineToPolygon(line, width) {
  let offsetLineRight = lineOffset(line, width / 2, {units: 'meters'});
  let offsetLineLeft = lineOffset(line, -width / 2, {units: 'meters'});
  let linePolygonCoordinates = [];
  linePolygonCoordinates.push(offsetLineLeft.geometry.coordinates[0]);
  offsetLineRight.geometry.coordinates.map((coordinate) => {
    linePolygonCoordinates.push(coordinate);
  })
  offsetLineLeft.geometry.coordinates.reverse().map((coordinate) => {
    linePolygonCoordinates.push(coordinate);
  })
  return polygon([linePolygonCoordinates])
}

// TODO, this probably should go inside the guiding line library
// Bearing of point is -180 - 180
export function isPointOnLeftOfRight(currentHeading, bearingOfPoint) {
  // Convert bearing to 0 - 360
  var bearing = bearingOfPoint;
  if(bearing < 0) {
    bearing += 360;
  }
  if((currentHeading - bearing) > 180 ||
     (currentHeading - bearing) < 0) {
    return "right";
  } else {
    return "left";
  }
  
}