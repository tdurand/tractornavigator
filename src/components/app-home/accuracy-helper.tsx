import { Component, h, State, Prop, Watch } from '@stencil/core';
import { Store } from "@stencil/redux";
import { GeolocationPosition } from '@capacitor/core';

@Component({
  tag: 'accuracy-helper'
})
// @ts-ignore
export class AccuracyHelper {

  isGalileoSupported: any;
  dualFreqSupported: any;

  // @ts-ignore
  @State() accuracyType: string = "bad";

  // @ts-ignore
  @State() position: GeolocationPosition;
  @Watch('position')
  // @ts-ignore
  positionWatchHandler(position: GeolocationPosition) {
    if(position) {
        if(position.coords.accuracy <= 4 && this.dualFreqSupported) {
            this.accuracyType = "good"
        } else if(position.coords.accuracy <= 6 && this.isGalileoSupported) {
            this.accuracyType = "medium"
        } else {
            this.accuracyType = "bad"
        }
    } else {
        this.accuracyType = "bad"
    }
  }

  // @ts-ignore
  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        geolocation: { position },
        gnssmeasurements: { isGalileoSupported, dualFreqSupported }
      } = state;
      return {
        position,
        isGalileoSupported,
        dualFreqSupported
      };
    });
  }

  render() {
    return (
      <ion-router-link href="/gpsstatus">
        <div class={`accuracy-helper ${this.accuracyType}`}>
            {this.accuracyType === "bad" &&
              <p>Poor GPS Accuracy</p>
            }
            {this.accuracyType === "medium" &&
              <p>Medium GPS Accuracy</p>
            }
            {this.accuracyType === "good" &&
              <p>Good GPS Accuracy</p>
            }
        </div>
      </ion-router-link>
    );
  }
}