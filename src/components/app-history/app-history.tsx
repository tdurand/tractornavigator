import { Component, h } from '@stencil/core';


var unfinishedTracks = [{
  date: "26/06/2019",
  name: "Route des Peintres",
  length: 2
},{
  date: "10/07/2019",
  name: "Sagnat",
  length: 3
}]

var finishedTracks = [{
  date: "20/05/2019",
  name: "Fresselines",
  length: 6
},{
  date: "14/05/2019",
  name: "Crozant",
  length: 3
},{
  date: "14/05/2019",
  name: "Longsagne",
  length: 4
},{
  date: "13/05/2019",
  name: "Marsueil",
  length: 2
},{
  date: "12/05/2019",
  name: "L'age",
  length: 1
},{
  date: "13/05/2019",
  name: "Marsueil",
  length: 1.5
}]


@Component({
  tag: 'app-history',
  styleUrl: 'app-history.css'
})
export class AppHistory {

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
          <ion-item-divider>
            <ion-label>
              Unfinished
            </ion-label>
          </ion-item-divider>
          {unfinishedTracks.map((item, index) =>
            <ion-item key={index}> 
              <ion-thumbnail slot="start">
                <img src="/assets/field-vignette.png" />
              </ion-thumbnail>
              <ion-label>
                <h3>{item.name}</h3>
                <p>{item.date} | {item.length}km</p>
              </ion-label>
              <ion-button slot="end">
                  <ion-icon name="play" slot="end"></ion-icon>
                Continue
              </ion-button>
            </ion-item>
          )}
          <ion-item-divider>
            <ion-label>
              Finished
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
              <ion-button slot="end" color="medium">
                  <ion-icon name="refresh" slot="end"></ion-icon>
                Redo
              </ion-button>
            </ion-item>
          )}
        </ion-list>
      </ion-content>
    ];
  }
}
