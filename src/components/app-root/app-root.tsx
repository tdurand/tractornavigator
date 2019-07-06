import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot {

  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route component="app-tabs">
            <ion-route url="/" component="tab-home" />
            <ion-route url="/gpssettings" component="tab-gpssettings" />
            <ion-route url="/history" component="tab-history" />
            <ion-route url="/offline" component="tab-offline" />
            <ion-route url="/about" component="tab-about" />
          </ion-route>
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }
}
