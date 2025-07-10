import TooltipConfig from "./tooltipConfig"

type TooltipLocalConfig = {
    /**
     * Tooltip text. Text is rendered as HTML, thus it's possible to give simple HTML structure, e.g., `<h1>Tooltip text</h1>`
     */
    content: string,

    /**
     * Define whether tooltip should be shown on hover (enabled/disabled). Default value is `false` if `alwaysOn` is set, otherwise it's `true`.
     */
    show?: boolean,

    /**
     * Define whether to show tooltip (on mount) without needing hover trigger
     * If `alwaysOn` is set, `show` will be set to `false` by default.
     */
    alwaysOn?: boolean,
} & TooltipConfig

export default TooltipLocalConfig
