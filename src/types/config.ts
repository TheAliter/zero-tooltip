import TooltipPositions from "./tooltipPositions"

type TooltipConfig = {
    'positions'?: Partial<TooltipPositions>,
    'offset'?: number,
    'tooltipClasses'?: string,
    'textClasses'?: string,
    'arrowSize'?: number,
    'arrowClasses'?: string,
}

export default TooltipConfig