import '../src/style.css'
import { createApp } from 'vue'
import MyApp from './App.vue'
import ZeroTooltip from '../src/index'
import PrimeVue from 'primevue/config';
import "primevue/resources/themes/aura-light-green/theme.css";

const app = createApp(MyApp)

app.use(ZeroTooltip, {
})

app.use(PrimeVue, { /* options */ });

app.mount('#app')

