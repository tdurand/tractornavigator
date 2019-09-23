import { Component, h, State, Prop } from '@stencil/core';
import { Store, Action } from "@stencil/redux";
import { setStatus, RecordingStatus } from '../../statemanagement/app/RecordingStateManagement';

@Component({
  tag: 'guiding-interface',
  styleUrl: 'guiding-interface.css'
})
export class GuidingInterface {

  @State() status: RecordingStatus;

  @Prop({ context: "store" }) store: Store;
  setStatus: Action;


  @State() distanceToClosestGuidingLine: number;
  @State() isGuidingLineOnRightOrLeft: string;

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
      setStatus
    });
  }

  render() {
    return (
      <div class="content flex flex-col flex-auto justify-between">
        <div>
          <div>{this.isGuidingLineOnRightOrLeft} {Math.round(this.distanceToClosestGuidingLine * 100) / 100}m</div>
        </div>
        <div class="flex flex-col items-center pb-2">
          {this.status === RecordingStatus.Idle &&
            <ion-button
              color="primary"
              onClick={() => {
                // 
                this.setStatus(RecordingStatus.Recording)
              }}
            >
              Start recording
            </ion-button>
          }
          {this.status === RecordingStatus.Recording &&
            <div>
              <ion-button
                color="primary"
                onClick={() => {
                  console.log('Pause');
                  // 
                  this.setStatus(RecordingStatus.Paused)
                }}
              >
                Pause
            </ion-button>
              <ion-button
                color="primary"
                onClick={() => {
                  console.log('Stop and save');
                  // Todo save and set status, probably add action in record state management
                  this.setStatus(RecordingStatus.Idle)
                }}
              >
                Stop and save
            </ion-button>
            </div>
          }
          {this.status === RecordingStatus.Paused &&
            <div>
              <ion-button
                color="primary"
                onClick={() => {
                  console.log('Resume');
                  // 
                  this.setStatus(RecordingStatus.Recording)
                }}
              >
                Resume
            </ion-button>
              <ion-button
                color="primary"
                onClick={() => {
                  console.log('Stop and save');
                  // Todo save and set status, probably add action in record state management
                  this.setStatus(RecordingStatus.Idle)
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