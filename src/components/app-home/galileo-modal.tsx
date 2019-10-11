import { Component, Element, Prop , h } from '@stencil/core';


@Component({
  tag: 'galileo-modal'
})
export class GalileoModal {
  @Element() el: any;

  @Prop() test;

  dismiss() {
    // dismiss this modal and pass back data
    (this.el.closest('ion-modal') as any).dismiss();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="primary">
            <ion-button onClick={() => this.dismiss()}>
                <ion-icon slot="icon-only" name="close"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>
            Galileo Status
          </ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <img src="/assets/usegalileo.png" alt="Use galileo" />
      </ion-content>,

      <ion-footer>
        <ion-toolbar>
            <ion-button color="primary" expand="block" onClick={() => this.dismiss()}>Ok</ion-button>
        </ion-toolbar>
      </ion-footer>
    ];
  }
}