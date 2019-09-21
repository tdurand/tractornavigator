import { Component, h, Host, Prop, State } from '@stencil/core';
import { Store, Action } from "@stencil/redux";
import { setReferenceLine, setEquipmentWidth } from '../../statemanagement/app/GuidingStateManagement';
import { GeolocationPosition } from '@capacitor/core';

@Component({
    tag: 'guiding-setup',
    styleUrl: 'guiding-setup.css'
})
export class GuidingSetup {

    position: GeolocationPosition;

    @State() referenceLine:  Array<Array<number>>;
    @State() equipmentWidth: number;

    @Prop() onGuidingLinesDefined: Function;
    @Prop({ context: "store" }) store: Store;
    setReferenceLine: Action;
    setEquipmentWidth: Action;

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
            setEquipmentWidth
        });
    }

    render() {
        return (
            <div class="content">
                {this.referenceLine.length === 0 &&
                    <div>
                        <div>Instructions to add reference A</div>
                        <ion-button
                            color="primary"
                            onClick={() => 
                                this.setReferenceLine([[this.position.coords.longitude, this.position.coords.latitude]])
                            }
                        >
                            Confirm start point
                        </ion-button>
                    </div>
                }
                {this.referenceLine.length === 1 &&
                    <div>
                        <div>Instructions to add reference B</div>
                        <ion-button
                            color="primary"
                            onClick={() => 
                                this.setReferenceLine([this.referenceLine[0], [this.position.coords.longitude, this.position.coords.latitude]])
                            }
                        >
                            Confirm end point
                        </ion-button>
                    </div>
                }
                {this.referenceLine.length === 2 &&
                    <div>
                        <div>Define equipement width</div>
                        <ion-button
                            color="primary"
                            onClick={() => {
                                console.log('setequipement width')
                                //this.setEquipmentWidth([this.referenceLine[0], this.position])
                                this.onGuidingLinesDefined();
                            }}
                        >
                            Set equipement width
                        </ion-button>
                    </div>
                }
            </div>
        );
    }
}