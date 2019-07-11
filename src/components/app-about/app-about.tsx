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
        <img src="/assets/logo_gsa.svg" />
        <p>This app is developed as part of the <a href="https://www.gsa.europa.eu/mygalileoapp">MyGalileoApp Challenge 2019</a></p>

        <p>It is developed as an Opensource project (license MIT)</p>
        <p><a href="https://github.com/tdurand/tractornavigator">https://github.com/tdurand/tractornavigator</a></p>

        <p class="text-bold">Team</p>
        <ul>
          <li>Vincent Duret</li>
          <li>Thibault Durand</li>
        </ul>
        <p class="text-bold">Mentoring</p>
        <ul>
          <li>Lukasz Bonenberg</li>
          <li>Miquel Garcia-Fernandez</li>
        </ul>
      </ion-content>
    ];
  }
}
