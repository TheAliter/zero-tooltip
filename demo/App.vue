
<template>
  <div class="zt-h-[2000px] zt-w-full zt-bg-gray-200">
    <button
      v-tooltip="tooltipConfig" 
      @click="action"
      :style="`position: absolute; top: 300px; left: 100px; color: white; background: green; padding: 4px 6px; width: 150px;`">
        Submit my button
    </button>

    <button
    :style="`position: absolute; top: 200px; left: 100px; color: white; background: green; padding: 4px 6px; width: 150px;`"

      @click="action">
        test
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onUpdated } from 'vue'
  import TooltipLocalConfig from '../src/types/tooltipLocalConfig'

  let text = ref('Tooltip testers form')

  const tooltipConfig: TooltipLocalConfig = reactive({ 
    content: 'Tooltip testers form',
    show: false
  })

  const action = () => {
    // text.value = 'test'
    tooltipConfig.content = 'test'
    tooltipConfig.show = true
  }

</script>



