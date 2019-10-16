import { Component, h, Prop, State } from '@stencil/core';
import { Store } from "@stencil/redux";
import { AccuracyStatus } from '../../statemanagement/app/GeolocationStateManagement';

@Component({
  tag: 'app-gpsstatus',
  styleUrl: 'app-gpsstatus.css'
})
export class AppGPSStatus {

  @State() rawMeasurements: any
  @State() satelliteData: any
  @State() isGalileoSupported: any
  @State() dualFreqSupported: any
  @State() accuracyStatus: AccuracyStatus

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        gnssmeasurements: { isGalileoSupported, satelliteData, rawMeasurements, dualFreqSupported },
        geolocation: { accuracyStatus }
      } = state;
      return {
        isGalileoSupported,
        dualFreqSupported,
        satelliteData,
        rawMeasurements,
        accuracyStatus
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
          <ion-title>GPS Status</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        {this.rawMeasurements === null &&
          <div class="flex items-center justify-center mt-2">
            <div>Fetching Galileo status...</div>
            <ion-spinner class="ml-2"></ion-spinner>
          </div>
        }
        {this.rawMeasurements &&
          <div>
            <accuracy-helper></accuracy-helper>
            {this.accuracyStatus === AccuracyStatus.Poor &&
              <div>
                {this.isGalileoSupported === true && this.dualFreqSupported === true &&
                  <p>Your phone supports Galileo and can receive dual frequency signals, you should be able to get a much better accuracy... Try to move in an open sky environment</p>
                }
                {this.isGalileoSupported === true && this.dualFreqSupported !== true &&
                  <p>Your phone supports Galileo but can't receive dual frequency signals, you should be able to get medium accuracy ... Try to move in an open sky environment</p>
                }
                {this.isGalileoSupported !== true && this.dualFreqSupported !== true &&
                  <p>Your phone does not support Galileo and can't receive dual frequency signals, your positioning accuracy will be limited.</p>
                }
              </div>
            }
            {this.accuracyStatus === AccuracyStatus.Medium &&
              <div>
                {this.isGalileoSupported === true && this.dualFreqSupported === true &&
                  <p>Your phone supports Galileo and can receive dual frequency signals, you should be able to get a better accuracy. Try to move in an open sky environment</p>
                }
                {this.isGalileoSupported === true && this.dualFreqSupported !== true &&
                  <div>
                    <p>Your phone supports Galileo but can't receive dual frequency signals, you won't be able to get a better accuracy than this.</p>
                  </div>
                }
              </div>
            }
            {this.accuracyStatus === AccuracyStatus.Good &&
              <div>
                {this.isGalileoSupported === true &&
                this.dualFreqSupported === true &&
                  <p>Your phone supports Galileo and can receive dual frequency signals, you have the best accuracy possible thanks to Galileo.</p>
                }
              </div>
            }
            <div class="text-center">
              {this.isGalileoSupported === true && this.dualFreqSupported === false &&
                <p><strong>You will be able to get better accuracy by <a target="_blank" href="https://www.usegalileo.eu/EN/inner.html#data=smartphone">upgrading to a phone that supports dual frequency signals offered by Galileo</a></strong></p>
              }
              {this.isGalileoSupported === false &&
                <p><strong>You will be able to get better accuracy by <a target="_blank" href="https://www.usegalileo.eu/EN/inner.html#data=smartphone">upgrading to a phone that supports Galileo</a></strong></p>
              }
              <img class="img-use-galileo" src="/assets/usegalileo.png" alt="Use galileo" />
            </div>
          </div>
        }
        {this.rawMeasurements !== null && this.satelliteData &&
          <div>
            <h4>Satellite data</h4>
            <ul>
              <li>Number of Satellites in range: {this.satelliteData.nbSatellitesInRange}</li>
              <li>Number of <strong>Galileo</strong> satellites in range: {this.satelliteData.nbGalileoSatelliteInRange}</li>
              <li>Number of Satellites in fix: {this.satelliteData.nbSatelliteInFix}</li>
              <li>Number of <strong>Galileo</strong> satellites in fix: {this.satelliteData.nbGalileoSatelliteInFix}</li>
            </ul>
          </div>
        }
        <h4>About positioning accuracy</h4>
        <p>Your phone positioning accuracy depends on multiple factors:</p>
        <ul>
          <li>Is it compatible with the Galileo constellation ?</li>
          <li>Does it support receiving multiple frequency signals ?</li>
          <li>How many satellites does it has currently in sight ?</li>
          <li>Are you in an open sky or urban area environment ?</li>
        </ul>
      </ion-content>
    ];
  }
}
