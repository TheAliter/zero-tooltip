import TooltipPositions from "./tooltipPositions"

type TooltipConfig = {
    'positions'?: Partial<TooltipPositions>,
    'offsetFromSource'?: number,
    'offsetFromViewport'?: number,
    'minWidth'?: number,
    'maxWidth'?: number,
    'tooltipClasses'?: string,
    'textClasses'?: string,
    'arrowSize'?: number,
    'arrowClasses'?: string,
}

export default TooltipConfig