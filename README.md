## zero-tooltip &nbsp; [![npm](https://img.shields.io/npm/v/zero-tooltip.svg)](https://www.npmjs.com/package/zero-tooltip)

**zero-tooltip** is a Vue 3 simple tooltip component for displaying information text when hovering over element.

## About
The component is designed to enhance user interactions by providing informative tooltips when hovering over specific element by rendering overlay with given text next to it. Components settings are fully customizable.

## Install

```bash
# npm
npm install zero-tooltip

# yarn
yarn add zero-tooltip

# pnpm
pnpm install zero-tooltip
```

Register plugin and import styles in `main.ts`:
```ts
import ZeroTooltip from 'zero-tooltip'
import 'zero-tooltip/style.css'

const app = createApp(App)

app.use(ZeroTooltip)
```

## Usage

Tooltip can be used with directive `v-tooltip` added on elements.
The given value is displayed as tooltip's text:

```html
<button v-tooltip="'Submits this form'">Submit</button>
```

## Zero dependencies
This component does not depend on any other package, except Vue 3

## Customization
Default position for tooltip is above/on top of the element that is being hovered. You can change position by passing argument to directive:

```html
<button v-tooltip:right="'Submits this form'">Submit</button>
```

Acceptable arguments are: `left` | `top` | `right` | `bottom`. This will override tooltip default position that was set during plugin registering process.

You can also define default position globally when registering plugin:

```ts
app.use(ZeroTooltip, {
    defaultPosition: 'right'
})
```

Tooltip component is fully customizable by giving config object as options when registering tooltip plugin:
```ts
import ZeroTooltipConfig from 'zero-tooltip'

const tooltipConfig: ZeroTooltipConfig = {
    appendTo: ... ,
    defaultPosition: ... ,
    positions: ... ,
    offsetFromSource: ... ,
    offsetFromViewport: ... ,
    minWidth: ... ,
    maxWidth: ... ,
    tooltipBorderWidth: ... ,
    tooltipClasses: ... ,
    textClasses: ... ,
    arrowSize: ... ,
    arrowClasses: ... ,
    arrowMinOffsetFromTooltipCorner: ... ,
    zIndex: ... ,
    showDelay: ... ,
    hideDelay: ... ,
    showWarnings: ... ,
}

app.use(ZeroTooltip, tooltipConfig)
```

All above settings are optional.

Tooltip can be customizable also for each usage (locally) using same config as follows:
```html
<template>
    <button v-tooltip:right="tooltipConfig">Submit</button>
</template>

<script setup lang="ts">
import ZeroTooltipLocalConfig from 'zero-tooltip'

const tooltipConfig: ZeroTooltipLocalConfig = reactive({
    content: 'This is tooltip',
    appendTo: ... ,
    defaultPosition: ... ,
    positions: ... ,
    offsetFromSource: ... ,
    offsetFromViewport: ... ,
    minWidth: ... ,
    maxWidth: ... ,
    tooltipBorderWidth: ... ,
    tooltipClasses: ... ,
    textClasses: ... ,
    arrowSize: ... ,
    arrowClasses: ... ,
    arrowMinOffsetFromTooltipCorner: ... ,
    zIndex: ... ,
    show: ... ,
    showDelay: ... ,
    hideDelay: ... ,
    alwaysOn: ... ,
})
</script>
```

## ZeroTooltipConfig
| Property | <div style="width:260px">Default value</div> | Type | Details |
|---|---|---|---|
| appendTo | *body* | string | A valid CSS query selector to specify where Tooltip gets appended. |
| defaultPosition | *top* | TooltipPosition | Position of tooltip component relative to element that is being hovered. |
| positions | *{ <br> &emsp; left: ['left', 'right', 'top', 'bottom'], <br> &emsp; top: ['top', 'bottom', 'right', 'left'], <br> &emsp; right: ['right', 'left', 'top', 'bottom'], <br> &emsp; bottom: ['bottom', 'top', 'right', 'left'], <br> }* | TooltipPositions | Ordered list of fallback positions in case tooltip does not have enough space in default position. If none of given positions will have enough space for tooltip, then it will not be rendered. |
| offsetFromSource | *10* | number | Tooltip offset in `px` from element that's being hovered *(arrow size is not added to this value)* |
| offsetFromViewport | *20* | number | Minimal allowed tooltip offset in `px` from viewport sides |
| minWidth | *100* | number | Minimal tooltip width in `px` that will be allowed to render |
| maxWidth | *250* | number | Maximal tooltip width in `px` that will be allowed to render |
| tooltipBorderWidth | *0* | number | Tooltip container border width in `px` |
| tooltipClasses | *undefined* | string | List of classes that will be added to tooltip element |  
| textClasses | *undefined* | string | List of classes that will be added to text element |
| arrowSize | *5* | number | Length of arrow hypotenuse in `px` (arrow is generated using border width property, creating square which gets divided in four triangles, thus `arrowSize` is length of square side) |
| arrowClasses | *undefined* | string | List of classes that will be added to arrow element |
| arrowMinOffsetFromTooltipCorner | *6* | number | Minimal allowed arrow offset in `px` from tooltip corner. Used in situations when tooltip does not have enough space to be centered relative to element that is being hover, thus arrow is rendered closer to one of the tooltip corners |
| zIndex | *1* | number &#124; string | `z-index` css property value of tooltip |
| showDelay | *0* | number | Delay in milliseconds after which to show tooltip while hovering over element |
| hideDelay | *0* | number | Delay in milliseconds after which to hide tooltip when leaving element boundaries |
| showWarnings | *true* | boolean | Whether to show warning about empty tooltip text value in cases when tooltip was expected to be shown |

## ZeroTooltipLocalConfig
Same as [ZeroTooltipConfig](#ZeroTooltipConfig) with following additions:
| Property | <div style="width:260px">Default value</div> | Type | Details |
|---|---|---|---|
| content | *undefined* | string | ***REQUIRED***. Tooltip text. Text is rendered as HTML, thus it's possible to give simple HTML structure, e.g., `<h1>Tooltip text</h1>` |
| show | *true* | boolean | Define whether tooltip should be shown on hover (enabled/disabled)|
| alwaysOn | *false* | boolean | Define whether to show tooltip (on mount) without needing hover trigger |

## License
The license is MIT, so any extension, forking is welcome. `zero-tooltip` is designed as fully customizable, zero dependency, simple tooltip for Vue.js.
