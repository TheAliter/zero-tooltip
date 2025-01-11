import TooltipConfig from "./tooltipConfig"

type TooltipLocalConfig = {
    content: string,
    show?: boolean,
    alwaysOn?: boolean,
} & TooltipConfig

export default TooltipLocalConfig