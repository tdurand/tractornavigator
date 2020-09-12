import { Component, h, State } from '@stencil/core';
import { store } from "@stencil/redux";
import { AccuracyStatus } from '../../statemanagement/app/GeolocationStateManagement';
import { getString } from '../../global/lang';

@Component({
  tag: 'accuracy-helper'
})
// @ts-ignore
export class AccuracyHelper {

  // @ts-ignore
  @State() accuracyStatus: AccuracyStatus;
  // @ts-ignore
  @State() position: any;

  @State() lang: any;

  componentWillLoad() {
    store.mapStateToProps(this, state => {
      const {
        geolocation: { accuracyStatus, position },
        device: { lang }
      } = state;
      return {
        accuracyStatus,
        position,
        lang
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
              <p>{getString('POOR_ACCURACY', this.lang)}</p>
            }
            {this.accuracyStatus === AccuracyStatus.Medium &&
              <p>{getString('MEDIUM_ACCURACY', this.lang)}</p>
            }
            {this.accuracyStatus === AccuracyStatus.Good &&
              <p>{getString('GOOD_ACCURACY', this.lang)}</p>
            }
        </div>
      </ion-router-link>
    );
  }
}