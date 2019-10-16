import { Component, State, Element, Prop, h } from '@stencil/core';
import { Store } from "@stencil/redux";
import { AccuracyStatus } from '../../statemanagement/app/GeolocationStateManagement';

@Component({
  tag: 'galileo-modal'
})
export class GalileoModal {
  @Element() el: any;

  @State() rawMeasurements: any
  @State() satelliteData: any
  @State() isGalileoSupported: any
  @State() dualFreqSupported: any
  @State() accuracyStatus: AccuracyStatus

  @Prop({ context: "store" }) store: Store;

  dismiss() {
    // dismiss this modal and pass back data
    (this.el.closest('ion-modal') as any).dismiss();
  }

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
        {this.rawMeasurements === null &&
          <div class="flex items-center justify-center mt-2">
            <div>Fetching Galileo status...</div>
            <ion-spinner class="ml-2"></ion-spinner>
          </div>
        }
        {this.rawMeasurements !== null &&
          <div>
            <div class="text-center">
              {this.isGalileoSupported === true &&
                this.dualFreqSupported === true &&
                <p>Your phone supports Galileo and can receive dual frequency signals, you are able to get the best accuracy possible thanks to Galileo.</p>
              }
              {this.isGalileoSupported === true && this.dualFreqSupported !== true &&
                <div>
                  <p>Your phone supports Galileo but can't receive dual frequency signals.</p> 
                  <p><strong>You should consider <a target="_blank" href="https://www.usegalileo.eu/EN/inner.html#data=smartphone">upgrading to a phone that supports dual frequency signals offered by Galileo</a></strong></p>
                </div>
              }
              {this.isGalileoSupported !== true &&
                <div>
                  <p>Your phone does not support Galileo, your positioning accuracy will be limited.</p>
                  <p><strong>You will be able to get better accuracy by <a target="_blank" href="https://www.usegalileo.eu/EN/inner.html#data=smartphone">upgrading to a phone that supports Galileo</a></strong></p>
                </div>
              }
              <img class="img-use-galileo" src="/assets/usegalileo.png" alt="Use galileo" />
            </div>
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