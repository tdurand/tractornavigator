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
        <div class="guiding-icons">
          <IconArrow 
            direction="left" 
            fillColor={this.isGuidingLineOnRightOrLeft === "left" ? "blue" : "#DADADA"}
          />
        </div>
        <div>{Math.round(this.distanceToClosestGuidingLine * 100) / 100}m</div>
        <div class="guiding-icons">
          <IconArrow 
            direction="right" 
            fillColor={this.isGuidingLineOnRightOrLeft === "right" ? "blue" : "#DADADA"}
          />
        </div>
      </div>
    );
  }
}