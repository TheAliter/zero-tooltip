import '../src/style.css'
import { createApp } from 'vue'
import MyApp from './App.vue'
import ZeroTooltip from '../src/index'

const app = createApp(MyApp)

app.use(ZeroTooltip, {
})

app.mount('#app')

