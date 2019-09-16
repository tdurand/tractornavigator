import { loadingController } from '@ionic/core';

export default class LoadingIndicator {

  constructor() {
    this.isLoading = false;
  }

  async present() {
    this.isLoading = true;
    return await loadingController.create({
      message: 'Getting your location...'
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await loadingController.dismiss().then(() => console.log('dismissed'));
  }
}