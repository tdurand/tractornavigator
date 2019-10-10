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
        <p>It is an Opensource project (license MIT)</p>
        <p><a href="https://github.com/tdurand/tractornavigator">https://github.com/tdurand/tractornavigator</a></p>
        <h3>Team</h3>
        <ul>
          <li>Vincent Duret</li>
          <li>Thibault Durand</li>
        </ul>
        <h3>About MyGalileoApp Challenge</h3>
        <p>The European GNSS Agency’s (GSA) MyGalileoApp prize competition challenges developers to design, develop, test and launch a mobile application that takes advantage of the increased accuracy and availability provided by Galileo. </p>
        <p>The winners take home up to EUR 100,000. Whether it be in the area of augmented reality, geo- marketing, smart navigation, social networking or otherwise – the GSA wants to help you take your idea from concept to reality.</p>
        <p>The MyGalileoApp prize Competition challenges to launch a mobile application that provides a position and/or time fix using a Galileo-enabled smartphone equipped with Android /iOS operating system. It must also demonstrate how the increased accuracy/availability provided by Galileo within a multi-constellation/multi- frequency solution adds value to the application.</p>
        <h3>About Galileo</h3>
        <p>Galileo is the European Global Navigation Satellite System (GNSS) under civilian control, providing a range of positioning, navigation and timing services to users worldwide. Galileo offers benefits for many European services, businesses and users. For example, users can know their exact position with greater precision thanks to the multi- constellation of receivers that Galileo add to. Galileo’s dual frequency capability offers significant advantages in terms of achievable accuracy, but also in terms of improved resistance to jamming. </p>
        <p>Last but not least, due to the ever-growing importance and dependence of satellite navigation applications a potential disruption of a satellite navigation service is unacceptable. Galileo ensures independence that is important to the EU economy, securing the availability of those applications and services. In short, Galileo boosts European innovation, contributing to the creation of many new products and services, creating jobs and allowing Europe to own a greater share of the global market for added value services.</p>
        <p>How does satellite navigation work? Global Navigation Satellite Systems send signals to receivers, giving time and positioning information to users. To get an accurate measurement of your time and position, a minimum of four satellites in view are needed. The number of satellites in view of the user’s receiver is what determines how accurately time and location can be worked out. The more satellites in view, the more precise the information received will be.</p>
      </ion-content>
    ];
  }
}
