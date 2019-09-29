import { Component, h, Prop, State } from '@stencil/core';
import { Store, Action } from "@stencil/redux";
import { setReferenceLine, setEquipmentWidth, resetGuidingState } from '../../statemanagement/app/GuidingStateManagement';
import { GeolocationPosition } from '@capacitor/core';

@Component({
    tag: 'guiding-setup',
    styleUrl: 'guiding-setup.css'
})
export class GuidingSetup {

    position: GeolocationPosition;

    @State() referenceLine: Array<Array<number>>;
    @State() equipmentWidth: number;

    @Prop() onGuidingLinesDefined: Function;
    @Prop({ context: "store" }) store: Store;
    setReferenceLine: Action;
    setEquipmentWidth: Action;
    resetGuidingState: Action;

    componentWillLoad() {
        this.store.mapStateToProps(this, state => {
            const {
                guiding: { referenceLine, equipmentWidth },
                geolocation: { position }
            } = state;
            return {
                referenceLine,
                equipmentWidth,
                position
            };
        });

        this.store.mapDispatchToProps(this, {
            setReferenceLine,
            setEquipmentWidth,
            resetGuidingState
        });
    }

    render() {
        return (
            <div class="content flex">
                {this.referenceLine.length === 0 &&
                    <div class="flex flex-col flex-auto justify-between">
                        <div class="message-box">
                            Defining guiding reference line, go to starting point and confirm
                        </div>
                        <div class="flex justify-center pb-2">
                            <ion-button
                                color="medium"
                                onClick={() =>
                                    this.resetGuidingState()
                                }
                            >
                                Cancel
                            </ion-button>
                            <ion-button
                                color="primary"
                                onClick={() =>
                                    this.setReferenceLine([[this.position.coords.longitude, this.position.coords.latitude]])
                                }
                            >
                                Set Reference start
                            </ion-button>
                        </div>
                    </div>
                }
                {this.referenceLine.length === 1 &&
                    <div class="flex flex-col flex-auto justify-between">
                        <div class="message-box">
                            Starting point defined, go to end point (Point B) and confirm
                        </div>
                        <div class="flex justify-center pb-2">
                            <ion-button
                                color="medium"
                                onClick={() => this.setReferenceLine([]) }
                            >
                                Cancel
                            </ion-button>
                            <ion-button
                                color="primary"
                                onClick={() =>
                                    this.setReferenceLine([this.referenceLine[0], [this.position.coords.longitude, this.position.coords.latitude]])
                                }
                            >
                                Confirm
                            </ion-button>
                        </div>
                    </div>
                }
                {this.referenceLine.length === 2 &&
                    <div class="flex flex-col flex-auto justify-between">
                        <div></div>
                        <div class="message-box flex flex-col justify-center pb-2">
                            <ion-item>
                                <ion-label position="stacked">Specify equipment width (meters)</ion-label>
                                <ion-input 
                                    type="number" 
                                    value={this.equipmentWidth.toString()}
                                    onIonChange={(event: any) => {
                                        this.setEquipmentWidth(parseInt(event.target.value, 10))
                                    }}
                                ></ion-input>
                            </ion-item>
                            <div>
                                <ion-button
                                    color="medium"
                                    onClick={() => this.setReferenceLine([this.referenceLine[0]]) }
                                >
                                    Cancel
                                </ion-button>
                                <ion-button
                                    color="primary"
                                    onClick={() => this.onGuidingLinesDefined()}
                                >
                                    Confirm
                                </ion-button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}