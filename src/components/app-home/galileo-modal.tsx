import { Component, State, Element, Prop , h } from '@stencil/core';
import { Store } from "@stencil/redux";

@Component({
  tag: 'galileo-modal'
})
export class GalileoModal {
  @Element() el: any;

  @State() rawMeasurements: any
  @State() satelliteData: any
  @State() isGalileoSupported: any
  @State() dualFreqSupported: any

  @Prop({ context: "store" }) store: Store;

  dismiss() {
    // dismiss this modal and pass back data
    (this.el.closest('ion-modal') as any).dismiss();
  }

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        gnssmeasurements: { isGalileoSupported, satelliteData, rawMeasurements, dualFreqSupported }
      } = state;
      return {
        isGalileoSupported,
        dualFreqSupported,
        satelliteData,
        rawMeasurements
      };
    });
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          {this.rawMeasurements !== null &&
            <ion-buttons slot="primary">
              <ion-button onClick={() => this.dismiss()}>
                  <ion-icon slot="icon-only" name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          }
          <ion-title>
            Galileo Status
          </ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <div class="text-center">
          <img class="img-use-galileo" src="/assets/usegalileo.png" alt="Use galileo" />
        </div>
        {this.rawMeasurements === null &&
          <div class="flex items-center justify-center mt-2">
            <div>Fetching Galileo status...</div>
            <ion-spinner class="ml-2"></ion-spinner>
          </div>
        }
        {this.rawMeasurements === false && this.isGalileoSupported === false &&
          <p>Limited positioning performance, consider upgrading to Galileo for an optimal experience</p>
        }
        {this.rawMeasurements === false && this.isGalileoSupported === true &&
          <p>Good positioning performance, consider upgrading to dual frequency offered by Galileo</p>
        }
        {this.rawMeasurements === false && this.isGalileoSupported === false &&
          <p>Limited positioning performance, consider upgrading to Galileo for an optimal experience</p>
        }
        {this.rawMeasurements === false && this.isGalileoSupported === true &&
          <p>Good positioning performance, consider upgrading to dual frequency offered by Galileo</p>
        }
        {this.rawMeasurements === true &&
          <div>
            {this.dualFreqSupported === true &&
              <p>You have the best positioning performance thanks to Galileo</p>
            }
            {this.dualFreqSupported === false &&
              <p>Good positioning performance, consider upgrading to dual frequency offered by Galileo</p>
            }
            {this.satelliteData &&
              <ul>
                <li>Number of Satellites in range: {this.satelliteData.nbSatellitesInRange}</li>
                <li>Number of <strong>Galileo</strong> satellites in range: {this.satelliteData.nbGalileoSatelliteInRange}</li>
                <li>Number of Satellites in fix: {this.satelliteData.nbSatelliteInFix}</li>
                <li>Number of <strong>Galileo</strong> satellites in fix: {this.satelliteData.nbGalileoSatelliteInFix}</li>
              </ul>
            }
          </div>
        }
      </ion-content>,

      <ion-footer>
        <ion-toolbar>
            {this.rawMeasurements !== null &&
              <ion-button color="primary" expand="block" onClick={() => this.dismiss()}>Ok</ion-button>
            }
        </ion-toolbar>
      </ion-footer>
    ];
  }
}