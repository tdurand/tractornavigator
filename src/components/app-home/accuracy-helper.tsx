import { Component, h, State, Prop } from '@stencil/core';
import { Store } from "@stencil/redux";
import { AccuracyStatus } from '../../statemanagement/app/GeolocationStateManagement';

@Component({
  tag: 'accuracy-helper'
})
// @ts-ignore
export class AccuracyHelper {

  // @ts-ignore
  @State() accuracyStatus: AccuracyStatus;
  // @ts-ignore
  @State() position: any;
  
  // @ts-ignore
  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        geolocation: { accuracyStatus, position }
      } = state;
      return {
        accuracyStatus,
        position
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
              <p>Poor positioning accuracy ({this.position.coords.accuracy}m)</p>
            }
            {this.accuracyStatus === AccuracyStatus.Medium &&
              <p>Medium positioning accuracy ({this.position.coords.accuracy}m)</p>
            }
            {this.accuracyStatus === AccuracyStatus.Good &&
              <p>Good positioning accuracy ({this.position.coords.accuracy}m)</p>
            }
        </div>
      </ion-router-link>
    );
  }
}