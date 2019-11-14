import { Component, h, State, Prop } from '@stencil/core';
import { getString } from '../../global/lang';
import { Store } from "@stencil/redux";

@Component({
  tag: 'app-about',
  styleUrl: 'app-about.css'
})
export class AppAbout {

  @State() lang: any

  @Prop({ context: "store" }) store: Store;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        device: { lang }
      } = state;
      return {
        lang
      };
    });
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>{getString('TAB_HISTORY', this.lang)}</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <img src="/assets/logo_gsa.svg" />
        {this.lang.indexOf('fr') > -1 &&
          <div>
            <p>Cette application a été développée dans le cadre du <a href="https://www.gsa.europa.eu/mygalileoapp">MyGalileoApp Challenge 2019</a></p>
            <p>Le projet est OpenSource (license MIT)</p>
            <p><a href="https://github.com/tdurand/tractornavigator">https://github.com/tdurand/tractornavigator</a></p>
            <h3>Equipe</h3>
            <ul>
              <li>Vincent Duret</li>
              <li>Thibault Durand</li>
            </ul>
            <h3>A propos de MyGalileoApp Challenge</h3>
            <p>L’agence du GNSS européen (GSA) a organisé un concours dans lequel des développeurs conçoivent, développent, testent et rendent disponible une application fonctionnelle afin de mettre en avant les avantages liés à Galileo en terme de précision et de disponibilité de signaux de localisation.</p>
            <p>Les gagnants de ce challenge reçoivent un prix pouvant aller jusqu’à 100 000 euros. Quelque soit les domaines d’applications, la réalité augmentée, le geo-marketing,  la navigation adaptative, les réseaux sociaux, etc… GSA souhaite soutenir les développeurs afin que leurs idées prennent forme et deviennent réalité..</p>
            <p>Le concours “MyGalileoApp Challenge” a pour but de lancer une application mobile qui fournit une géolocalisation grâce aux smartphones recevant les signaux de Galileo que ce soit sur la plateforme Android ou iOS. Elle doit également mettre en avant l’importance de Galileo en terme de précision et de disponibilité de signal dans une solution multi constellation / multi fréquences dans le cadre de son utilisation.</p>
            <h3>A propos de Galileo</h3>
            <p>Galileo est le système de positionnement par satellites (GNSS) sous contrôle civile qui fournit des information de localisation, navigation et de temps pour les utilisateurs du monde entier.</p>
            <p>Galileo améliore le quotidien de nombreux services, entreprises et utilisateurs européens. Par exemple, des utilisateurs peuvent connaîtres leur position exacte avec une précision accrue grâce à la prise en compte de la constellation de satellites Galileo. Le fonctionnement double fréquence avec Galileo offre de nombreux avantages et améliorations en terme de précision et de stabilité de signal. </p>
            <p>Aussi, dans un monde où la navigation par satellite a une importance grandissante et dans lequel de nombreux services en sont dépendant, des perturbations ou erreurs ne sont plus acceptables. Galileo permet à l’Europe d’être indépendante sur ce secteur et ainsi d’assurer une stabilité économique en maintenant une disponibilité des ses applications et services. En résumé, Galileo est un catalyseur pour l’innovation Européenne en contribuant directement à la création de nombreux nouveaux produits, emplois tout en permettant à l’Europe d’avoir une part encore plus importante sur le marché mondial des ces services.</p>
            <p>Comment la navigation par satellites fonctionne ? GNSS (constellation de satellites) envoie des signaux aux antennes terrestres qui elles même renvoient à l’utilisateur des informations de positions et de temps. Afin d’avoir une mesure précise de cette position et temps, un minimum de 4 satellites est nécessaire. Le nombre de satellites visibles par l’antenne de l’utilisateur est ce qui détermine la précision. Plus il y aura de satellites disponibles ou visibles plus précise sera l’information renvoyée par l’antenne à l’utilisateur.</p>
          </div>
        }
        {this.lang.indexOf('fr') === -1 &&
          <div>
            <p>This app is developed as part of the <a href="https://www.gsa.europa.eu/mygalileoapp">MyGalileoApp Challenge 2019</a></p>
            <p>It is an Open Source project (license MIT)</p>
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
          </div>
        }
      </ion-content>
    ];
  }
}
