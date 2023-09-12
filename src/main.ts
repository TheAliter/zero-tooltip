import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import SimpleTooltip from './composables/tooltip'

const app = createApp(App)

app.directive('tooltip', SimpleTooltip())

app.mount('#app');
