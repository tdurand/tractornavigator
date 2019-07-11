import { Component, h } from '@stencil/core';
import { alertController } from '@ionic/core';

@Component({
  tag: 'app-gpssettings',
  styleUrl: 'app-gpssettings.css'
})
export class AppGPSSettings {

  async presentAlertM2DGPS() {  
    const alert = await alertController.create({
      header: 'DGPS',
      subHeader: 'To be implemented in M2',
      message: 'Follow the following steps to use DGPS',
      buttons: ['Cancel', 'OK']
    });
    return await alert.present();
  }

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
        <p class="text-bold">GPS Status</p>
        <ul>
          <li>Latitude: 46,3139º</li>
          <li>Longitude: 4,7677º</li>
          <li>Number of Satellites in range: 15</li>
          <li>Number of <strong>Galileo</strong> satellites in range: 3</li>
          <li>Signal strength: <img src="/assets/accuracy-range.png" /></li>
        </ul>

        
        <p class="text-bold">L5 Galileo band use</p>
        <p>Your phone supports dual frequency and Galileo satellites are in range to get extra accuracy boost thanks to L5 band</p>
        <p class="text-small"><i>This will be implemented in M2</i></p>
        <p></p>
        <p class="text-bold">Use DGPS (need extra device)</p>
        <p>With DGPS you can get an accuracy boost.</p>
        <ion-item>
          <ion-label>Enable DGPS</ion-label>
          <ion-toggle 
            slot="end" 
            value="dgps" 
            checked={false}
            onIonChange={(event) => {
              if(event.detail.checked) {
                this.presentAlertM2DGPS()
              }
            }}
          >
          </ion-toggle>
        </ion-item>
        <p class="text-small"><i>Note: this will be implemented in M2</i></p>
      </ion-content>
    ];
  }
}
