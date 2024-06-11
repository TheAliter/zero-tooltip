import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import ZeroTooltip from '../src/tooltip'

const app = createApp(App)

app.directive('tooltip', ZeroTooltip({
    defaultPosition: 'right'
}))

app.mount('#app')

