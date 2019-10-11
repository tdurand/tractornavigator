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
        } else if(position.coords.accuracy <= 4 && this.isGalileoSupported) {
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
      <div class={`accuracy-helper ${this.accuracyType}`}>
          {this.accuracyType === "bad" &&
            <p>GPS Accuracy bad</p>
          }
          {this.accuracyType === "medium" &&
            <p>GPS Accuracy medium</p>
          }
          {this.accuracyType === "medium" &&
            <p>GPS Accuracy good</p>
          }
      </div>
    );
  }
}