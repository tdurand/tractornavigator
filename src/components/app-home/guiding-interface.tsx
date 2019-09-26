import { Component, h, State, Prop } from '@stencil/core';
import { Store, Action } from "@stencil/redux";
import { startRecording, resumeRecording, stopRecording, pauseRecording, RecordingStatus } from '../../statemanagement/app/RecordingStateManagement';

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
  stopRecording: Action;


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
      stopRecording
    });
  }

  goToHistory() {
    this.router.push('history', 'forward');
  }

  render() {
    return (
      <div class="content flex flex-col flex-auto justify-between">
        <div class="flex message-box justify-center">
          <div>{this.isGuidingLineOnRightOrLeft} {Math.round(this.distanceToClosestGuidingLine * 100) / 100}m</div>
        </div>
        <div class="flex flex-col items-center pb-2">
          {this.status === RecordingStatus.Idle &&
            <ion-button
              color="primary"
              onClick={() => {
                this.startRecording()
              }}
            >
              Start recording
            </ion-button>
          }
          {this.status === RecordingStatus.Recording &&
            <div>
              <ion-button
                color="secondary"
                onClick={() => this.pauseRecording() }
              >
                Pause
            </ion-button>
              <ion-button
                color="primary"
                onClick={() => {
                  this.stopRecording()
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
                  this.stopRecording()
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