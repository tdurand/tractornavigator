import { Component, h, State, Prop } from '@stencil/core';
import { Store, Action } from "@stencil/redux";
import { startRecording, resumeRecording, stopRecordingAndSave, cancelRecording, pauseRecording, RecordingStatus } from '../../statemanagement/app/RecordingStateManagement';
import { startDefiningGuidingLines } from '../../statemanagement/app/GuidingStateManagement';

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


  @State() distanceToClosestGuidingLine: number;
  @State() isGuidingLineOnRightOrLeft: string;

  private router: HTMLIonRouterElement = document.querySelector('ion-router')

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        recording: { status },
        guiding: { distanceToClosestGuidingLine, isGuidingLineOnRightOrLeft }
      } = state;
      return {
        status,
        distanceToClosestGuidingLine,
        isGuidingLineOnRightOrLeft
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
    return (
      <div class="content flex flex-col flex-auto justify-between">
        <div class="flex message-box justify-center items-center">
          <guiding-helper 
            distanceToClosestGuidingLine={this.distanceToClosestGuidingLine}
            isGuidingLineOnRightOrLeft={this.isGuidingLineOnRightOrLeft}
          />
        </div>
        <div class="flex flex-col items-center pb-2">
          {this.status === RecordingStatus.Idle &&
            <div>
              <ion-button
                color="medium"
                onClick={() => this.startDefiningGuidingLines() }
              >
                Settings
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
          {this.status === RecordingStatus.Recording &&
            <div>
              {/* <ion-button
                color="medium"
                onClick={() => this.pauseRecording() }
              >
                Pause
              </ion-button> */}
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
            </div>
          }
          {this.status === RecordingStatus.Paused &&
            <div>
              <ion-button
                color="secondary"
                onClick={() => this.resumeRecording()}
              >
                Resume
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
            </div>
          }
        </div>
      </div>
    );
  }
}