
<template>
  <div>
    <h1>Playground</h1>

    <button 
        v-tooltip="tooltipConfig" 
        style="position: relative; padding: 10px;">

        Change setting
    </button>

    <br>
    <br>

    <button type="button" @click="toggle" >open</button>   

    <OverlayPanel ref="op">
            <button style="padding: 50px; background: greenyellow;" v-tooltip="tooltipConfig">Test button</button>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import TooltipLocalConfig from '../src/types/tooltipLocalConfig'
  import OverlayPanel from 'primevue/overlaypanel';


  const tooltipConfig: TooltipLocalConfig = reactive({ 
    content: 'Tooltip testers form',
    showDelay: 200,
    hideDelay: 10,
    defaultPosition: 'bottom',
  })

  import { ref } from "vue";

  const members = ref([
    { name: 'Amy Elsner', image: 'amyelsner.png', email: 'amy@email.com', role: 'Owner' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png', email: 'bernardo@email.com', role: 'Editor' },
    { name: 'Ioni Bowcher', image: 'ionibowcher.png', email: 'ioni@email.com', role: 'Viewer' }
]);
const op = ref();

const toggle = (event) => {
    op.value.toggle(event);
}
</script>

<style>
p {
  margin: 0;
}

.p-overlaypanel-enter-active {
    transition: transform 1s cubic-bezier(0, 0, 0.2, 1), opacity 1s cubic-bezier(0, 0, 0.2, 1);
  }

  .p-overlaypanel-leave-active {
    transition: opacity 1 linear;
  }
</style>



