import { Component, h, State, Prop } from '@stencil/core';
import { Store, Action } from "@stencil/redux";
import { startRecording, resumeRecording, stopRecordingAndSave, cancelRecording, pauseRecording, RecordingStatus } from '../../statemanagement/app/RecordingStateManagement';
import { startDefiningGuidingLines } from '../../statemanagement/app/GuidingStateManagement';
import { GeolocationPosition } from '@capacitor/core';

@Component({
  tag: 'guiding-interface',
  styleUrl: 'guiding-interface.css'
})
export class GuidingInterface {

  @State() status: RecordingStatus;

  @Prop({ context: "store" }) store: Store;
  startRecording: Action;
  resumeRecording: Action;
  pauseRecording: Action;
  stopRecordingAndSave: Action;
  startDefiningGuidingLines: Action;
  cancelRecording: Action;

  dateStart: string;
  area: number;
  equipmentWidth: number;


  @Prop() position: GeolocationPosition;


  @State() distanceToClosestGuidingLine: number;
  @State() isGuidingLineOnRightOrLeft: string;

  private router: HTMLIonRouterElement = document.querySelector('ion-router')

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        recording: { status, dateStart, area },
        guiding: { distanceToClosestGuidingLine, isGuidingLineOnRightOrLeft, equipmentWidth }
      } = state;
      return {
        status,
        distanceToClosestGuidingLine,
        isGuidingLineOnRightOrLeft,
        dateStart,
        area,
        equipmentWidth
      };
    });

    this.store.mapDispatchToProps(this, {
      startRecording, 
      resumeRecording,
      pauseRecording,
      stopRecordingAndSave,
      startDefiningGuidingLines,
      cancelRecording
    });
  }

  goToHistory() {
    this.router.push('history', 'forward');
  }

  render() {

    const isRecordingOrPaused = (this.status === RecordingStatus.Recording || this.status === RecordingStatus.Paused)

    if(isRecordingOrPaused) {
      var diff = Math.abs(new Date(this.dateStart).getTime() - new Date().getTime());
      var seconds = Math.floor(diff/1000) % 60;
      var minutes = Math.floor((diff/1000)/60);
    }

    return (
      <div class="content flex flex-col flex-auto justify-between">
        <div class="shadow">
          {isRecordingOrPaused &&
            <div class="flex message-box justify-around" style={{"margin-bottom": "-1px"}}>
              <div class="flex items-center">
                <ion-icon name="time"></ion-icon>
                <div class="ml-1">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>
              </div>
              <div class="flex items-center">
                <ion-icon name="map"></ion-icon>
                <div class="ml-1">{this.area} ha</div>
              </div>
              <div class="flex items-center">
                <ion-icon name="resize"></ion-icon>
                <div class="ml-1">{this.equipmentWidth} m</div>
              </div>
            </div>
          }
          <div class="flex message-box justify-center items-center">
            <guiding-helper 
              distanceToClosestGuidingLine={this.distanceToClosestGuidingLine}
              isGuidingLineOnRightOrLeft={this.isGuidingLineOnRightOrLeft}
            />
          </div>
        </div>
        <div class="flex flex-col items-center pb-2">
          {this.status === RecordingStatus.Idle &&
            <div>
              <ion-button
                color="medium"
                onClick={() => this.startDefiningGuidingLines() }
              >
                <ion-icon slot="icon-only" name="settings"></ion-icon>
              </ion-button>
              <ion-button
                color="primary"
                onClick={() => {
                  this.startRecording()
                }}
              >
                Start recording
              </ion-button>
            </div>
          }
          {isRecordingOrPaused &&
            <div>
              <ion-button
                color="medium"
                onClick={() => this.cancelRecording() }
              >
                Cancel
              </ion-button>
              <ion-button
                color="primary"
                onClick={() => {
                  this.stopRecordingAndSave()
                  this.goToHistory()
                }}
              >
                Stop and save
              </ion-button>
              <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                {this.status === RecordingStatus.Recording &&
                  <ion-fab-button color="primary" onClick={() => this.pauseRecording()}>
                    <ion-icon name="pause"></ion-icon>
                  </ion-fab-button>
                }
                {this.status === RecordingStatus.Paused &&
                  <ion-fab-button color="primary" onClick={() => this.resumeRecording()}>
                    <ion-icon name="play"></ion-icon>
                  </ion-fab-button>
                }
              </ion-fab>
            </div>
          }
          
        </div>
      </div>
    );
  }
}