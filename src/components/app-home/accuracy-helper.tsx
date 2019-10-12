import { Component, h, State, Prop } from '@stencil/core';
import { Store } from "@stencil/redux";
import { AccuracyStatus } from '../../statemanagement/app/GeolocationStateManagement';

@Component({
  tag: 'accuracy-helper'
})
// @ts-ignore
export class AccuracyHelper {

  // @ts-ignore
  @State() accuracyStatus: AccuracyStatus
  
  // @ts-ignore
  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        geolocation: { accuracyStatus }
      } = state;
      return {
        accuracyStatus
      };
    });
  }

  getAccuracyStatusString(accuracyStatus: AccuracyStatus) {
    switch(accuracyStatus) {
      case AccuracyStatus.Good:
        return "good";
      case AccuracyStatus.Medium:
        return "medium";
      case AccuracyStatus.Poor:
        return "poor"
    }
  }

  render() {
    return (
      <ion-router-link href="/gpsstatus">
        <div class={`accuracy-helper ${this.getAccuracyStatusString(this.accuracyStatus)}`}>
            {this.accuracyStatus === AccuracyStatus.Poor &&
              <p>Poor positioning accuracy</p>
            }
            {this.accuracyStatus === AccuracyStatus.Medium &&
              <p>Medium positioning accuracy</p>
            }
            {this.accuracyStatus === AccuracyStatus.Good &&
              <p>Good positioning accuracy</p>
            }
        </div>
      </ion-router-link>
    );
  }
}