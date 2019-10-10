import { Component, h, Prop, State } from '@stencil/core';
import { Store } from "@stencil/redux";
import dayjs from 'dayjs';


@Component({
  tag: 'app-history',
  styleUrl: 'app-history.css'
})
export class AppHistory {

  @State() recordings: Array<any>

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        history: { recordings }
      } = state;
      return {
        recordings
      };
    });

    this.store.mapDispatchToProps(this, {
    });
  }

  computeTimeRecording(dateStart, dateEnd) {
    var diff = Math.abs(new Date(dateStart).getTime() - new Date(dateEnd).getTime());
    var seconds = Math.floor(diff/1000) % 60;
    var minutes = Math.floor((diff/1000)/60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>History</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <ion-list>
          {this.recordings.map((recording, index) =>
            <ion-item key={index}> 
              <ion-label>
                <h3>{dayjs(recording.dateStart).format('MMM DD, YYYY')}</h3>
                <p>{dayjs(recording.dateStart).format('hh:mm a')} - {dayjs(recording.dateEnd).format('hh:mm a')}</p>
                <div class="flex">
                  <div class="flex items-center">
                    <ion-icon name="time"></ion-icon>
                    <div class="ml-1">{this.computeTimeRecording(recording.dateStart, recording.dateEnd)}</div>
                  </div>
                  <div class="flex items-center ml-2">
                    <ion-icon name="map"></ion-icon>
                    <div class="ml-1">{recording.area} ha</div>
                  </div>
                </div>
              </ion-label>
              <ion-button 
                slot="end"
                onClick={() => console.log('todo')}
              >
                <ion-icon name="play" slot="end"></ion-icon>
                Continue
              </ion-button>
            </ion-item>
          )}
          {/* <ion-item-divider>
            <ion-label>
              Finished fields
            </ion-label>
          </ion-item-divider>
          {finishedTracks.map((item, index) =>
            <ion-item key={index}> 
              <ion-thumbnail slot="start">
                <img src="/assets/field-vignette.png" />
              </ion-thumbnail>
              <ion-label>
                <h3>{item.name}</h3>
                <p>{item.date} | {item.length}km</p>
              </ion-label>
              <ion-button 
                slot="end" 
                color="medium"
                onClick={() => console.log('todo')}
              >
                  <ion-icon name="refresh" slot="end"></ion-icon>
                Reload
              </ion-button>
            </ion-item>
          )} */}
        </ion-list>
      </ion-content>
    ];
  }
}
