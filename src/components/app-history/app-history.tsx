import { Component, h } from '@stencil/core';

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

      <ion-content class="ion-padding">
        TODO list of recorded tracks, with button to pick from it
      </ion-content>
    ];
  }
}
