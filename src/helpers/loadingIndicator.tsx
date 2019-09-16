import { loadingController } from '@ionic/core';

export default class LoadingIndicator {

  isLoading: boolean
  message: string

  constructor(message) {
    this.isLoading = false;
    this.message = message;
  }

  async present() {
    this.isLoading = true;
    return await loadingController.create({
      message: this.message
    }).then(a => {
      a.present().then(() => {
        //console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => {
          //console.log('abort presenting')
          });
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await loadingController.dismiss().then(() => {
      //console.log('dismissed')
    });
  }
}