
<template>
  <div>
    <h1>Playground</h1>

    <button 
        v-tooltip="tooltipConfig" 
        style="position: relative; padding: 10px;">

        Change setting
    </button>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import TooltipLocalConfig from '../src/types/tooltipLocalConfig'

  const tooltipConfig: TooltipLocalConfig = reactive({ 
    content: 'Tooltip testers form',
    offsetFromSource: 0,
    hideDelay: 1000,
  })
</script>

<style>
p {
  margin: 0;
}
</style>



