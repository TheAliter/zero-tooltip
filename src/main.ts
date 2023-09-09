import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import Tooltip from './composables/tooltip'

const app = createApp(App)

app.directive('tooltip', Tooltip())

app.mount('#app');
