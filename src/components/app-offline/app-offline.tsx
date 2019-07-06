import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-offline',
  styleUrl: 'app-offline.css'
})
export class AppOffline {

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>Offline use</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        TODO here, instructions for offline use
      </ion-content>
    ];
  }
}
