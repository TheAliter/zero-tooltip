
<template>
  <div class="zt-h-[2000px] zt-w-full zt-bg-gray-200">

    <div typeof="button" @click="counter" style="cursor: pointer;">independetn</div>


    <div class="zt-fixed zt-right-0 zt-top-0 zt-w-[400px] zt-h-[500px] zt-bg-red-400 zt-z-[2]" id="mountain">
        <button
            v-if="shouldShow"
            v-tooltip="tooltipConfig" 
            @click="action"
            :style="`position: absolute; top: 300px; left: 100px; color: white; background: green; padding: 4px 6px; width: 150px;`">
            config
        </button>
    </div>


    <a
    v-tooltip="`count is ${count}`" 
    :style="`position: absolute; top: 200px; left: 100px; color: white; background: green; padding: 4px 6px; width: ${awidth}px;`"
    
    @click="counter">
    counter
  </a>
  
    <a
    v-tooltip:bottom="`count is ${count}`" 
  :style="`position: absolute; top: 400px; left: 100px; color: white; background: red; padding: 4px 6px; width: ${awidth}px;`"

    @click="counter">
      counter
  </a> 

   
    
    <p @click="data[1].count++" v-for="(entry, index) in data" :key="index" v-tooltip="{content: `entry ${entry.count}`, show: entry.count > 2}">
      {{ entry.count }}
    </p>

    <button @click="updateEntries">update entries</button> 

    
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onUpdated } from 'vue'
  import TooltipLocalConfig from '../src/types/tooltipLocalConfig'

  let count = ref(0)
  let awidth = ref(150)
  let text = ref('Tooltip testers form')
  let shouldShow = true

  let firstEntry = ref({count: 1})
  let data = ref([{count: 1}, { count: 5}])

  const tooltipConfig: TooltipLocalConfig = reactive({ 
    appendTo: '#mountain',
    content: 'Tooltip testers form',
    defaultPosition: 'right',
    show: true
  })

  const action = () => {
    // text.value = 'test'
    tooltipConfig.content = 'test'
    tooltipConfig.show = !tooltipConfig.show
  }

  const counter = () => {
    count.value++
    awidth.value = 250
  }

  const updateEntries = () => {
    data.value[0].count++
  }

</script>



