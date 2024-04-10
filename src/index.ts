import './style.css'
import { App } from 'vue'

import ZeroTooltip from "./tooltip"
import TooltipConfig from "./types/tooltipConfig"
import TooltipLocalConfig from "./types/tooltipLocalConfig"
import TooltipPosition from "./types/tooltipPosition"
import TooltipPositions from "./types/tooltipPositions"

export default {
    install: (app: App, options: TooltipConfig = {}) => {
        app.directive('tooltip', ZeroTooltip(options))
    }
}

export type { 
    TooltipConfig as ZeroTooltipConfig, 
    TooltipPosition as ZeroTooltipPosition, 
    TooltipPositions as ZeroTooltipPositions, 
    TooltipLocalConfig as ZeroTooltipLocalConfig 
}