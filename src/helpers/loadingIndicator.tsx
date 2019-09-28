import { loadingController } from '@ionic/core';

export default class LoadingIndicator {

  isLoading: boolean
  isDismissed: boolean
  message: string

  constructor(message) {
    this.isLoading = false;
    this.isDismissed = true;
    this.message = message;
  }

  async present() {
    if(this.isLoading) {
      return;
    }
    this.isLoading = true;
    this.isDismissed = false;
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
    if(this.isDismissed) { return; }
    return await loadingController.dismiss().then(() => {
      this.isDismissed = true;
      //console.log('dismissed')
    });
  }
}