
<template>
  <div class="zt-h-[2000px] zt-w-full zt-bg-gray-200">

    <div typeof="button" @click="counter" style="cursor: pointer;">independetn</div>

    <a
      v-tooltip:bottom="`count is ${count}`" 
    :style="`position: absolute; top: 200px; left: 100px; color: white; background: green; padding: 4px 6px; width: ${awidth}px;`"

      @click="counter">
        test
    </a>

    <button
      v-tooltip="tooltipConfig" 
      @click="action"
      :style="`position: absolute; top: 300px; left: 100px; color: white; background: green; padding: 4px 6px; width: 150px;`">
        Submit my button
    </button>

    
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onUpdated } from 'vue'
  import TooltipLocalConfig from '../src/types/tooltipLocalConfig'

  let count = ref(0)
  let awidth = ref(150)
  let text = ref('Tooltip testers form')

  const tooltipConfig: TooltipLocalConfig = reactive({ 
    content: 'Tooltip testers form',
    show: true
  })

  const action = () => {
    // text.value = 'test'
    tooltipConfig.content = 'test'
    // tooltipConfig.show = true
  }

  const counter = () => {
    count.value++
    awidth.value = 250

    tooltipConfig.show = !tooltipConfig.show
  }

</script>



