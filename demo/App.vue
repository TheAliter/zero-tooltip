
<template>
  <div class="zt-h-[2000px] zt-w-full zt-bg-gray-200">

    <button v-tooltip="tooltipConfig" 
    style="position: absolute; top: 750px; left: 400px; color: white; background: green; padding: 4px 6px;">Submit</button>
  </div>
</template>

<script setup lang="ts">
  import TooltipLocalConfig from '../src/types/tooltipLocalConfig'

  const tooltipConfig: TooltipLocalConfig = {
    content: '<h1>tester</h1>',
  }
</script>



