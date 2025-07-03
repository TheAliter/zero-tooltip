import TooltipConfig from "./tooltipConfig"

type TooltipLocalConfig = {
    /**
     * REQUIRED. Tooltip text.
     * Text is rendered as HTML, thus it's possible to give simple HTML structure, e.g., <h1>Tooltip text</h1>
     */
    content: string,

    /**
     * Define whether tooltip should be shown on hover (enabled/disabled).
     */
    show?: boolean,

    /**
     * Define whether to show tooltip (on mount) without needing hover trigger.
     */
    alwaysOn?: boolean,
} & TooltipConfig

export default TooltipLocalConfig
