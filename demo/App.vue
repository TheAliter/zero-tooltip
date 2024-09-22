
<template>
  <div>
    <h1>Playground</h1>

    <button v-tooltip="'test'" style="position: relative; left: 300px;">Change setting</button>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import TooltipLocalConfig from '../src/types/tooltipLocalConfig'

  const tooltipConfig: TooltipLocalConfig = reactive({ 
    appendTo: '#mountain',
    content: 'Tooltip testers form',
    defaultPosition: 'right',
    show: true
  })
</script>

<style>
p {
  margin: 0;
}
</style>



