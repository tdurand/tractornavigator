import { Component, h } from '@stencil/core';
import { toastController, alertController } from '@ionic/core';

@Component({
  tag: 'app-offline',
  styleUrl: 'app-offline.css'
})
export class AppOffline {

  async presentToastHistoryM2() {  
    const toast = await toastController.create({
      message: "Feature Offline mode will be implemented in M2, it will consist in caching the satellite tiles for a selected area",
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

  async presentAlertM2Offline() {  
    const alert = await alertController.create({
      header: 'Download Offline',
      subHeader: 'To be implemented in M2',
      message: 'This will download satellite imagery of this for offline use, estimated 30 MB',
      buttons: ['Cancel', 'Confirm']
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
          <ion-title>Offline mode</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <img style={{marginBottom: '30px'}} src="/assets/offline-mock-map.jpg" />
        <ion-item>
          <ion-label>Make area available offline</ion-label>
          <ion-toggle 
            slot="end" 
            value="offline" 
            checked={false}
            onIonChange={(event) => {
              if(event.detail.checked) {
                this.presentAlertM2Offline()
              }
            }}
          >
          </ion-toggle>
        </ion-item>
      </ion-content>
    ];
  }
}
