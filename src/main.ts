import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import SimpleTooltip from './composables/tooltip'

const app = createApp(App)

app.directive('tooltip', SimpleTooltip({
    defaultPosition: 'right',
    positions: {
        'left': ['left', 'right', 'top', 'bottom'],
        'top': ['top', 'bottom', 'right', 'left'],
        'right': ['right', 'left', 'top', 'bottom'],
        'bottom': ['bottom', 'top', 'right', 'left'],
    },
    'offsetFromSource': 20,
    'offsetFromViewport': 0,
    'minWidth': 100,
    'maxWidth': 500,
    'tooltipBorderWidth': 10,
    'tooltipClasses': 'border-yellow-600',
    'textClasses': 'text-blue-400',
    'arrowSize': 10,
    'arrowClasses': 'border-red-300',
    'arrowMinOffsetFromTooltipCorner': 20
}))

app.mount('#app');
