import { Component, h, Prop } from '@stencil/core';
import IconArrow from './icon-arrow';

@Component({
  tag: 'guiding-helper'
})
export class GuidingHelper {

  @Prop() distanceToClosestGuidingLine: number;
  @Prop() isGuidingLineOnRightOrLeft: string;

  render() {
    return (
      <div class="guiding-helper">
        <div class="guiding-helper_icons">
          <IconArrow 
            direction="left" 
            fillColor={this.isGuidingLineOnRightOrLeft === "left" && this.distanceToClosestGuidingLine > 1 ? "blue" : "#DADADA"}
          />
        </div>
        <div class="guiding-helper_label">
          {this.distanceToClosestGuidingLine <= 1 &&
            <div>OK</div>
          } 
          {this.distanceToClosestGuidingLine > 1 &&
            <div>{Math.round(this.distanceToClosestGuidingLine)} m</div>
          }
        </div>
        <div class="guiding-helper_icons">
          <IconArrow 
            direction="right" 
            fillColor={this.isGuidingLineOnRightOrLeft === "right" && this.distanceToClosestGuidingLine > 1 ? "blue" : "#DADADA"}
          />
        </div>
      </div>
    );
  }
}