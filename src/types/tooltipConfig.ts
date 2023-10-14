import TooltipPosition from "./tooltipPosition"
import TooltipPositions from "./tooltipPositions"

type TooltipConfig = {
    defaultPosition?: TooltipPosition,
    positions?: Partial<TooltipPositions>,
    offsetFromSource?: number,
    offsetFromViewport?: number,
    minWidth?: number,
    maxWidth?: number,
    tooltipBorderWidth?: number,
    tooltipClasses?: string,
    textClasses?: string,
    arrowSize?: number,
    arrowClasses?: string,
    arrowMinOffsetFromTooltipCorner?: number,
    zIndex?: number
}

export default TooltipConfig