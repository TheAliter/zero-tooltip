
<template>
  <div class="zt-h-[2000px] zt-w-full zt-bg-gray-200">

    <button v-tooltip="tooltipConfig" 
    @click="resize"
    :style="`position: absolute; top: 300px; left: ${leftPosition}px; color: white; background: green; padding: 4px 6px; width: ${width}px;`">Submit my button</button>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import TooltipLocalConfig from '../src/types/tooltipLocalConfig'

  const tooltipConfig: TooltipLocalConfig = {
    content: 'Tooltip testers form',
  }

  let leftPosition = ref(200);
  let width = ref(100)

  function moveButton() {
    leftPosition.value += 200
  }

  function resize() {
    width.value += 50
  }
</script>



