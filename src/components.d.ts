/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { GeolocationPosition } from "@capacitor/core";
export namespace Components {
    interface AccuracyHelper {
    }
    interface AppAbout {
    }
    interface AppGpsstatus {
    }
    interface AppHistory {
    }
    interface AppHistoryDetails {
        "indexOfRecording": number;
    }
    interface AppHome {
    }
    interface AppOffline {
    }
    interface AppRoot {
    }
    interface AppTabs {
    }
    interface GalileoModal {
    }
    interface GuidingHelper {
        "distanceToClosestGuidingLine": number;
        "isGuidingLineOnRightOrLeft": string;
    }
    interface GuidingInterface {
        "position": GeolocationPosition;
    }
    interface GuidingSetup {
        "handleGuidingLinesDefined": Function;
    }
}
declare global {
    interface HTMLAccuracyHelperElement extends Components.AccuracyHelper, HTMLStencilElement {
    }
    var HTMLAccuracyHelperElement: {
        prototype: HTMLAccuracyHelperElement;
        new (): HTMLAccuracyHelperElement;
    };
    interface HTMLAppAboutElement extends Components.AppAbout, HTMLStencilElement {
    }
    var HTMLAppAboutElement: {
        prototype: HTMLAppAboutElement;
        new (): HTMLAppAboutElement;
    };
    interface HTMLAppGpsstatusElement extends Components.AppGpsstatus, HTMLStencilElement {
    }
    var HTMLAppGpsstatusElement: {
        prototype: HTMLAppGpsstatusElement;
        new (): HTMLAppGpsstatusElement;
    };
    interface HTMLAppHistoryElement extends Components.AppHistory, HTMLStencilElement {
    }
    var HTMLAppHistoryElement: {
        prototype: HTMLAppHistoryElement;
        new (): HTMLAppHistoryElement;
    };
    interface HTMLAppHistoryDetailsElement extends Components.AppHistoryDetails, HTMLStencilElement {
    }
    var HTMLAppHistoryDetailsElement: {
        prototype: HTMLAppHistoryDetailsElement;
        new (): HTMLAppHistoryDetailsElement;
    };
    interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {
    }
    var HTMLAppHomeElement: {
        prototype: HTMLAppHomeElement;
        new (): HTMLAppHomeElement;
    };
    interface HTMLAppOfflineElement extends Components.AppOffline, HTMLStencilElement {
    }
    var HTMLAppOfflineElement: {
        prototype: HTMLAppOfflineElement;
        new (): HTMLAppOfflineElement;
    };
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLAppTabsElement extends Components.AppTabs, HTMLStencilElement {
    }
    var HTMLAppTabsElement: {
        prototype: HTMLAppTabsElement;
        new (): HTMLAppTabsElement;
    };
    interface HTMLGalileoModalElement extends Components.GalileoModal, HTMLStencilElement {
    }
    var HTMLGalileoModalElement: {
        prototype: HTMLGalileoModalElement;
        new (): HTMLGalileoModalElement;
    };
    interface HTMLGuidingHelperElement extends Components.GuidingHelper, HTMLStencilElement {
    }
    var HTMLGuidingHelperElement: {
        prototype: HTMLGuidingHelperElement;
        new (): HTMLGuidingHelperElement;
    };
    interface HTMLGuidingInterfaceElement extends Components.GuidingInterface, HTMLStencilElement {
    }
    var HTMLGuidingInterfaceElement: {
        prototype: HTMLGuidingInterfaceElement;
        new (): HTMLGuidingInterfaceElement;
    };
    interface HTMLGuidingSetupElement extends Components.GuidingSetup, HTMLStencilElement {
    }
    var HTMLGuidingSetupElement: {
        prototype: HTMLGuidingSetupElement;
        new (): HTMLGuidingSetupElement;
    };
    interface HTMLElementTagNameMap {
        "accuracy-helper": HTMLAccuracyHelperElement;
        "app-about": HTMLAppAboutElement;
        "app-gpsstatus": HTMLAppGpsstatusElement;
        "app-history": HTMLAppHistoryElement;
        "app-history-details": HTMLAppHistoryDetailsElement;
        "app-home": HTMLAppHomeElement;
        "app-offline": HTMLAppOfflineElement;
        "app-root": HTMLAppRootElement;
        "app-tabs": HTMLAppTabsElement;
        "galileo-modal": HTMLGalileoModalElement;
        "guiding-helper": HTMLGuidingHelperElement;
        "guiding-interface": HTMLGuidingInterfaceElement;
        "guiding-setup": HTMLGuidingSetupElement;
    }
}
declare namespace LocalJSX {
    interface AccuracyHelper {
    }
    interface AppAbout {
    }
    interface AppGpsstatus {
    }
    interface AppHistory {
    }
    interface AppHistoryDetails {
        "indexOfRecording"?: number;
    }
    interface AppHome {
    }
    interface AppOffline {
    }
    interface AppRoot {
    }
    interface AppTabs {
    }
    interface GalileoModal {
    }
    interface GuidingHelper {
        "distanceToClosestGuidingLine"?: number;
        "isGuidingLineOnRightOrLeft"?: string;
    }
    interface GuidingInterface {
        "position"?: GeolocationPosition;
    }
    interface GuidingSetup {
        "handleGuidingLinesDefined"?: Function;
    }
    interface IntrinsicElements {
        "accuracy-helper": AccuracyHelper;
        "app-about": AppAbout;
        "app-gpsstatus": AppGpsstatus;
        "app-history": AppHistory;
        "app-history-details": AppHistoryDetails;
        "app-home": AppHome;
        "app-offline": AppOffline;
        "app-root": AppRoot;
        "app-tabs": AppTabs;
        "galileo-modal": GalileoModal;
        "guiding-helper": GuidingHelper;
        "guiding-interface": GuidingInterface;
        "guiding-setup": GuidingSetup;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "accuracy-helper": LocalJSX.AccuracyHelper & JSXBase.HTMLAttributes<HTMLAccuracyHelperElement>;
            "app-about": LocalJSX.AppAbout & JSXBase.HTMLAttributes<HTMLAppAboutElement>;
            "app-gpsstatus": LocalJSX.AppGpsstatus & JSXBase.HTMLAttributes<HTMLAppGpsstatusElement>;
            "app-history": LocalJSX.AppHistory & JSXBase.HTMLAttributes<HTMLAppHistoryElement>;
            "app-history-details": LocalJSX.AppHistoryDetails & JSXBase.HTMLAttributes<HTMLAppHistoryDetailsElement>;
            "app-home": LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
            "app-offline": LocalJSX.AppOffline & JSXBase.HTMLAttributes<HTMLAppOfflineElement>;
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "app-tabs": LocalJSX.AppTabs & JSXBase.HTMLAttributes<HTMLAppTabsElement>;
            "galileo-modal": LocalJSX.GalileoModal & JSXBase.HTMLAttributes<HTMLGalileoModalElement>;
            "guiding-helper": LocalJSX.GuidingHelper & JSXBase.HTMLAttributes<HTMLGuidingHelperElement>;
            "guiding-interface": LocalJSX.GuidingInterface & JSXBase.HTMLAttributes<HTMLGuidingInterfaceElement>;
            "guiding-setup": LocalJSX.GuidingSetup & JSXBase.HTMLAttributes<HTMLGuidingSetupElement>;
        }
    }
}
