import { Component, h, Prop, State } from '@stencil/core';
import { Store } from "@stencil/redux";

@Component({
  tag: 'app-gpsstatus',
  styleUrl: 'app-gpsstatus.css'
})
export class AppGPSStatus {

  @State() rawMeasurements: any
  @State() satelliteData: any
  @State() isGalileoSupported: any

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        gnssmeasurements: { isGalileoSupported, satelliteData, rawMeasurements }
      } = state;
      return {
        isGalileoSupported,
        satelliteData,
        rawMeasurements
      };
    });
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>GPS / Galileo Status</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        {this.rawMeasurements === null &&
          <p>Loading ...</p>
        }
        {this.rawMeasurements === false && this.isGalileoSupported === false &&
          <p>Limited positioning performance, consider upgrading to Galileo for an optimal experience</p>
        }
        {this.rawMeasurements === false && this.isGalileoSupported === true &&
          <p>Good positioning performance, consider upgrading to dual frequency offered by Galileo</p>
        }
        {this.rawMeasurements === true && this.satelliteData &&
          <div>
            {this.satelliteData.dualFreqSupported &&
              <p>You have the best positioning performance thanks to Galileo</p>
            }
            {this.satelliteData.dualFreqSupported === false &&
              <p>Good positioning performance, consider upgrading to dual frequency offered by Galileo</p>
            }
            <ul>
              <li>Number of Satellites in range: {this.satelliteData.nbSatellitesInRange}</li>
              <li>Number of <strong>Galileo</strong> satellites in range: {this.satelliteData.nbGalileoSatelliteInRange}</li>
              <li>Number of Satellites in fix: {this.satelliteData.nbSatelliteInFix}</li>
              <li>Number of <strong>Galileo</strong> satellites in fix: {this.satelliteData.nbGalileoSatelliteInFix}</li>
            </ul>
          </div>
        }
        
      </ion-content>
    ];
  }
}
