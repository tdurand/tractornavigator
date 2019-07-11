import { Component, h } from '@stencil/core';
import { toastController, alertController } from '@ionic/core';


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
  
  async presentToastHistoryM2() {  
    const toast = await toastController.create({
      message: "Features show history details + be able to continue from a started tracking will be implemented in M2",
      color: 'dark',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
  
    return await toast.present();
  }

  async presentAlertM2Continue() {  
    const alert = await alertController.create({
      header: 'Continue guiding',
      subHeader: 'To be implemented in M2',
      message: 'Recorded track will load in the Navigation for you to finish from you left it',
      buttons: ['Cancel', 'OK']
    });
    return await alert.present();
  }

  async presentAlertM2Reload() {  
    const alert = await alertController.create({
      header: 'Re-load pattern',
      subHeader: 'To be implemented in M2',
      message: 'Re-Load in navigation with same guiding pattern',
      buttons: ['Cancel', 'OK']
    });
    return await alert.present();
  }
  

  componentDidLoad() {
    this.presentToastHistoryM2();
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
          <ion-item-divider>
            <ion-label>
              Unfinished fields
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
              <ion-button 
                slot="end"
                onClick={() => this.presentAlertM2Continue()}
              >
                  <ion-icon name="play" slot="end"></ion-icon>
                Continue
              </ion-button>
            </ion-item>
          )}
          <ion-item-divider>
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
                onClick={() => this.presentAlertM2Reload()}
              >
                  <ion-icon name="refresh" slot="end"></ion-icon>
                Reload
              </ion-button>
            </ion-item>
          )}
        </ion-list>
      </ion-content>
    ];
  }
}
