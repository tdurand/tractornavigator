import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-about',
  styleUrl: 'app-about.css'
})
export class AppAbout {

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>About</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        About this app blablablabla
      </ion-content>
    ];
  }
}
