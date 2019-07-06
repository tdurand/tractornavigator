import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-gpssettings',
  styleUrl: 'app-gpssettings.css'
})
export class AppGPSSettings {

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>GPS Settings</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        TODO Here display info about Galileo Status, dual frequency usage , signal strenght etc etc 

        Toggle to enable DGPS etc etc.
      </ion-content>
    ];
  }
}
