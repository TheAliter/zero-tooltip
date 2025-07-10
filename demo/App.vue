<template>
    <div style="padding: 20px;">
        <h1 style="text-align: center;">Playground</h1>

        <!-- TOP-LEFT button -->
        <button v-tooltip="{
            content: 'Bottom right',
            defaultPosition: 'top'
        }" style="position: fixed; left: 0; top: 0;">

            Trying top
        </button>

        <!-- TOP-RIGHT button -->
        <button v-tooltip="{
            content: 'Bottom left',
            defaultPosition: 'right'
        }" style="position: fixed; right: 0; top: 0;">

            Trying right
        </button>

        <!-- BOTTOM-LEFT button -->
        <button v-tooltip="{
            content: 'Top right',
            defaultPosition: 'left'
        }" style="position: fixed; left: 0; bottom: 0;">

            Trying left
        </button>

        <!-- BOTTOM-RIGHT button -->
        <button v-tooltip="{
            content: 'Top left',
            defaultPosition: 'bottom'
        }" style="position: fixed; right: 0; bottom: 0;">

            Trying bottom
        </button>

        <!-- Overlay Panel behavior test -->
        <h2 style="margin-bottom: 0;">Test z-index</h2>
        <ul>
            <li style="margin-block: 0;">Test position for tooltip with target in overlay (which enters with transition)</li>
            <li style="margin-top: 0;">Test always show in overlay</li>
        </ul>

        <button type="button" @click="toggle">
            Open Overlay panel
        </button>

        <OverlayPanel ref="overlayPanelElement">
            <button 
                style="padding: 10px; background: greenyellow;" 
                v-tooltip="{
                    content: 'Default tooltip config',
                    zIndex: 1002
                }">

                Test default tooltip behavior
            </button>

            <button 
                v-tooltip="{
                    content: 'I am always visible',
                    defaultPosition: 'right',
                    alwaysOn: true,
                    zIndex: 1002,
                }" 
                style=" margin-left: 20px;">

                Always show
            </button>
        </OverlayPanel>

        <div style="margin-top: 60px;">
            <h2 style="margin-block: 0;">Test hide/show delay </h2>
            <ul>
                <li style="margin-block: 0;">Test show multiple tooltip at the same time</li>
                <li style="margin-top: 0;">Test select tooltip text for hide delay</li>
            </ul>

            <button 
                v-tooltip="{
                    content: 'First tooltip',
                    hideDelay: 1000
                }" 
                style="">

                Hide delay
            </button>

            <button 
                v-tooltip="{
                    content: 'Second tooltip',
                    showDelay: 500,
                }" 
                style="margin-left: 8px;">

                Show delay
            </button>
        </div>

        <div style="margin-top: 60px;">
            <h2 style="margin-bottom: 0">Test always show/on</h2>

            <ul>
                <li style="margin-block: 0;">Test multiple always show/on</li>
                <li style="margin-block: 0;">Test reposition on window resize</li>
                <li style="margin-block: 0;">Test always show/on with initial scroll offset X and Y</li>
                <li style="margin-block: 0;">Test hover trigger when alwaysOn is used</li>
            </ul>

            <button 
                v-tooltip="{
                    content: 'I am always visible 1',
                    defaultPosition: 'left',
                    alwaysOn: true,
                }" 
                style="">

                Always show on right
            </button>

            <div style="margin-top: 20px; width: 2000px; overflow: auto; border: 1px solid blue;">
                <button 
                    v-tooltip="{
                        content: 'I am always visible 2',
                        defaultPosition: 'left',
                        alwaysOn: true,
                    }" 
                    style="margin-left: 400px;">
    
                    Always show
                </button>
            </div>

            <button 
                v-tooltip="{
                    content: 'I am sometimes visible',
                    alwaysOn: alwaysOnSometimesShow,
                }" 
                style="margin-top: 40px;">

                Sometimes show (when not visible, hover shouldn't work)
            </button>


            <button 
                v-tooltip="{
                    show: true,
                    content: 'I am sometimes visible',
                    alwaysOn: alwaysOnSometimesShow,
                }" 
                style="margin-top: 40px;">

                Sometimes show (when not visible, hover should work)
            </button>
        </div>

        <div style="margin-top: 60px; border: 1px solid red; height: 500px;">
            <h2>Test hide on scroll</h2>

            <button 
                v-tooltip="{
                    content: 'Hide on scroll',
                }" 
                style="">

                Hide on scroll
            </button>

            <button 
                v-tooltip="{
                    content: 'Hide on scroll',
                    showDelay: 500,
                }" 
                style="margin-left: 20px;">

                Hide on scroll (with show delay)
            </button>

            <button 
                v-tooltip="{
                    content: 'Hide on scroll',
                    hideDelay: 1000,
                }" 
                style="margin-left: 20px;">

                Hide on scroll (with hide delay)
            </button>
        </div>

        <div style="margin-top: 40px;">
            <div>
                <h2 style="margin-bottom: 0">Test empty tooltip text value</h2>

                <ul style="font-size: 12px;;">
                    <li>Test with empty string as tooltip text</li>
                    <li>Test with empty string as tooltip text and show option</li>
                    <li>Test with empty null/undefined as tooltip text and show option</li>
                    <li>Test with empty null/undefined as tooltip text and after timeout set some acceptable value</li>
                    <li>Same as before but with `show` and `alwaysOn` option</li>
                </ul>
            </div>
    
            <button 
                v-tooltip="config" 
                style="margin-top: 20px;">
    
                Empty tooltip (show now show and show now throw error)
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue";
    import OverlayPanel from 'primevue/overlaypanel';

    const overlayPanelElement = ref();


    const toggle = (event) => {
        overlayPanelElement.value.toggle(event);
    }

    const config = ref({
        content: undefined,
        show: true,
    });

    setTimeout(() => {
        config.value.content = 'New tooltip text';
    }, 2000);
    
    const alwaysOnSometimesShow = ref(false);
    setInterval(() => {
        alwaysOnSometimesShow.value = !alwaysOnSometimesShow.value;
    }, 3000);
</script>

<style>
    p {
        margin: 0;
        padding: 0;
    }
</style>
