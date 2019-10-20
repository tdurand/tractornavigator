import { Component, h, Prop, State } from '@stencil/core';
import { Store, Action } from "@stencil/redux";
import { setReferenceLine, setEquipmentWidth, resetGuidingState } from '../../statemanagement/app/GuidingStateManagement';
import { GeolocationPosition } from '@capacitor/core';
import distance from '@turf/distance';
import { point } from '@turf/helpers';
import { getString } from '../../global/lang';


@Component({
    tag: 'guiding-setup',
    styleUrl: 'guiding-setup.css'
})
export class GuidingSetup {

    position: GeolocationPosition;

    @State() referenceLine: Array<Array<number>>;
    @State() equipmentWidth: number;

    @State() lang: any;

    @Prop() onGuidingLinesDefined: Function;
    @Prop({ context: "store" }) store: Store;
    setReferenceLine: Action;
    setEquipmentWidth: Action;
    resetGuidingState: Action;

    componentWillLoad() {
        this.store.mapStateToProps(this, state => {
            const {
                guiding: { referenceLine, equipmentWidth },
                geolocation: { position },
                device: { lang }
            } = state;
            return {
                referenceLine,
                equipmentWidth,
                position,
                lang
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
                        <div class="message-box shadow">
                            {getString('DEFINING_GUIDING_LINE_START', this.lang)}
                        </div>
                        <div class="flex justify-center pb-2">
                            <ion-button
                                color="medium"
                                onClick={() =>
                                    this.resetGuidingState()
                                }
                            >
                                {getString('BACK', this.lang)}
                            </ion-button>
                            <ion-button
                                color="primary"
                                onClick={() =>
                                    this.setReferenceLine([[this.position.coords.longitude, this.position.coords.latitude]])
                                }
                            >
                                {getString('CONFIRM_POINT_A', this.lang)}
                            </ion-button>
                        </div>
                    </div>
                }
                {this.referenceLine.length === 1 &&
                    <div class="flex flex-col flex-auto justify-between">
                        <div class="message-box">
                            {getString('DEFINING_GUIDING_LINE_START_CONFIRMED', this.lang)}
                        </div>
                        <div class="flex justify-center pb-2">
                            <ion-button
                                color="medium"
                                onClick={() => this.setReferenceLine([]) }
                            >
                                {getString('BACK', this.lang)}
                            </ion-button>
                            <ion-button
                                color="primary"
                                onClick={() => {
                                    // only confirm is distance between two points is more than 1 meter
                                    if(
                                        distance(
                                            point(this.referenceLine[0]), 
                                            point([this.position.coords.longitude, this.position.coords.latitude])
                                        ) > 0.001
                                    ) {
                                        this.setReferenceLine([this.referenceLine[0], [this.position.coords.longitude, this.position.coords.latitude]])
                                    }
                                }}
                            >
                                {getString('CONFIRM_POINT_B', this.lang)}
                            </ion-button>
                        </div>
                    </div>
                }
                {this.referenceLine.length === 2 &&
                    <div class="flex flex-col flex-auto justify-between">
                        <div></div>
                        <div class="message-box flex flex-col justify-center pb-2">
                            <ion-item>
                                <ion-label position="stacked">{getString('SPECIFY_EQUIPMENT_WIDTH', this.lang)}</ion-label>
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
                                    {getString('BACK', this.lang)}
                                </ion-button>
                                <ion-button
                                    color="primary"
                                    onClick={() => this.onGuidingLinesDefined()}
                                >
                                    {getString('OK', this.lang)}
                                </ion-button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}