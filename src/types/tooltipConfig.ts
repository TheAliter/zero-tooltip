import TooltipPosition from "./tooltipPosition"
import TooltipPositions from "./tooltipPositions"

type TooltipConfig = {
    /**
     * A valid CSS query selector to specify where Tooltip gets appended.
     */
    appendTo?: string,

    /**
     * Position of tooltip component relative to element that is being hovered.
     */
    defaultPosition?: TooltipPosition,

    /**
     * Ordered list of fallback positions in case tooltip does not have enough space in default position. If none of given positions will have enough space for tooltip, then it will not be rendered.
     */
    positions?: Partial<TooltipPositions>,

    /**
     * Tooltip offset in px from element that's being hovered *(arrow size is not added to this value)*
     */
    offsetFromSource?: number,

    /**
     * Minimal allowed tooltip offset in `px` from viewport sides
     */
    offsetFromViewport?: number,

    /**
     * Minimal tooltip width in `px` that will be allowed to render
     */
    minWidth?: number,

    /**
     * Maximal tooltip width in `px` that will be allowed to render
     */
    maxWidth?: number,

    /**
     * Tooltip container border width in `px`
     */
    tooltipBorderWidth?: number,

    /**
     * List of classes that will be added to tooltip element
     */
    tooltipClasses?: string,

    /**
     * List of classes that will be added to text element
     */
    textClasses?: string,

    /**
     * Length of arrow hypotenuse in `px` (arrow is generated using border width property, creating square which gets divided in four triangles, thus `arrowSize` is length of square side)
     */
    arrowSize?: number,

    /**
     * List of classes that will be added to arrow element
     */
    arrowClasses?: string,

    /**
     * Minimal allowed arrow offset in `px` from tooltip corner. Used in situations when tooltip does not have enough space to be centered relative to element that is being hover, thus arrow is rendered closer to one of the tooltip corners
     */
    arrowMinOffsetFromTooltipCorner?: number,

    /**
     * `z-index` css property value of tooltip
     */
    zIndex?: number | string,

    /**
     * Delay in milliseconds after which to show tooltip while hovering over element
     */
    showDelay?: number,

    /**
     * Delay in milliseconds after which to hide tooltip when leaving element boundaries
     */
    hideDelay?: number,

    /**
     * Whether to show warning about empty tooltip text value in cases when tooltip was expected to be shown
     */
    showWarnings?: boolean,
}

export default TooltipConfig
