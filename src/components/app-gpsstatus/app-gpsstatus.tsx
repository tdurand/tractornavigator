import { Component, h, State } from '@stencil/core';
import { store } from "@stencil/redux";
import { AccuracyStatus } from '../../statemanagement/app/GeolocationStateManagement';
import { getString } from '../../global/lang';

@Component({
  tag: 'app-gpsstatus',
  styleUrl: 'app-gpsstatus.css'
})
export class AppGPSStatus {

  @State() rawMeasurements: any
  @State() satelliteData: any
  @State() isGalileoSupported: any
  @State() dualFreqSupported: any
  @State() accuracyStatus: AccuracyStatus

  @State() lang: any

  componentWillLoad() {
    store.mapStateToProps(this, state => {
      const {
        gnssmeasurements: { isGalileoSupported, satelliteData, rawMeasurements, dualFreqSupported },
        geolocation: { accuracyStatus },
        device: { lang }
      } = state;
      return {
        isGalileoSupported,
        dualFreqSupported,
        satelliteData,
        rawMeasurements,
        accuracyStatus,
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
          <ion-title>{getString('TAB_GPSSTATUS', this.lang)}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        {this.rawMeasurements === null &&
          <div class="flex items-center justify-center mt-2">
            <div>{getString('FETCHING_GALILEO_STATUS', this.lang)}</div>
            <ion-spinner class="ml-2"></ion-spinner>
          </div>
        }
        {this.rawMeasurements !== null &&
          <div>
            <accuracy-helper></accuracy-helper>
            {this.accuracyStatus === AccuracyStatus.Poor &&
              <div>
                {this.isGalileoSupported === true && this.dualFreqSupported === true &&
                  <p>{getString('POOR_GALILEO_DUAL_FREQ', this.lang)}</p>
                }
                {this.isGalileoSupported === true && this.dualFreqSupported !== true &&
                  <p>{getString('POOR_GALILEO_NO_DUAL_FREQ', this.lang)}</p>
                }
                {this.isGalileoSupported !== true && this.dualFreqSupported !== true &&
                  <p>{getString('POOR_NO_GALILEO_NO_DUAL_FREQ', this.lang)}</p>
                }
              </div>
            }
            {this.accuracyStatus === AccuracyStatus.Medium &&
              <div>
                {this.isGalileoSupported === true && this.dualFreqSupported === true &&
                  <p>{getString('MEDIUM_GALILEO_DUAL_FREQ', this.lang)}</p>
                }
                {this.isGalileoSupported === true && this.dualFreqSupported !== true &&
                  <div>
                    <p>{getString('MEDIUM_GALILEO_NO_DUAL_FREQ', this.lang)}</p>
                  </div>
                }
              </div>
            }
            {this.accuracyStatus === AccuracyStatus.Good &&
              <div>
                {this.isGalileoSupported === true &&
                this.dualFreqSupported === true &&
                  <p>{getString('GOOD_GALILEO_DUAL_FREQ', this.lang)}</p>
                }
              </div>
            }
            <div class="text-center">
              {this.isGalileoSupported === true && this.dualFreqSupported === false &&
                <p><strong>You will be able to get better accuracy by <a target="_blank" href="https://www.usegalileo.eu/EN/inner.html#data=smartphone">upgrading to a phone that supports dual frequency signals offered by Galileo</a></strong></p>
              }
              {this.isGalileoSupported === false &&
                <p><strong>You will be able to get better accuracy by <a target="_blank" href="https://www.usegalileo.eu/EN/inner.html#data=smartphone">upgrading to a phone that supports Galileo</a></strong></p>
              }
              <img class="img-use-galileo" src="/assets/usegalileo.png" alt="Use galileo" />
            </div>
          </div>
        }
        {this.rawMeasurements !== null && this.satelliteData &&
          <div>
            <h4>{getString('SATELLITE_STATUS', this.lang)}</h4>
            <ul>
              <li>{getString('NB_SATELLITE_IN_RANGE', this.lang)}: {this.satelliteData.nbSatellitesInRange}</li>
              <li>{getString('NB_GALILEO_SATELLITE_IN_RANGE', this.lang)}: {this.satelliteData.nbGalileoSatelliteInRange}</li>
              <li>{getString('NB_SATELLITE_USED', this.lang)}: {this.satelliteData.nbSatelliteInFix}</li>
              <li>{getString('NB_GALILEO_SATELLITE_USED', this.lang)}: {this.satelliteData.nbGalileoSatelliteInFix}</li>
            </ul>
          </div>
        }
        {this.lang.indexOf('fr') > -1 && 
          <div>
            <h4>A propos de la précision de positionnement</h4>
            <p>La précision de positionnement renvoyée par votre téléphone dépend de plusieurs facteurs:</p>
            <ul>
              <li>Est-ce que votre téléphone est compatibles avec la constellation de satellites Galileo ?</li>
              <li>Est ce qu’il supporte les signaux doubles fréquences ?</li>
              <li>Combien de satellites sont dans le champs de vision de l’antenne ?</li>
              <li>Êtes-vous dans une environnement ouvert, en ville, ou proche d’obstacles ?</li>
            </ul>
          </div>
        } 
        {this.lang.indexOf('fr') <= -1 && 
          <div>
            <h4>About positioning accuracy</h4>
            <p>Your phone positioning accuracy depends on multiple factors:</p>
            <ul>
              <li>Is it compatible with the Galileo constellation ?</li>
              <li>Does it support receiving multiple frequency signals ?</li>
              <li>How many satellites does it has currently in sight ?</li>
              <li>Are you in an open sky or urban area environment ?</li>
            </ul>
          </div>
        } 
      </ion-content>
    ];
  }
}
