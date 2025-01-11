<template>
    <div>
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
        <h2 style="margin-top: 0;">Test position for tooltip with target in overlay (which enters with transition)</h2>
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
        </OverlayPanel>

        <div style="margin-top: 60px;">
            <h2 style="margin-block: 0;">Test hide/show delay </h2>
            <h2 style="margin-block: 0;">Test show multiple tooltip at the same time</h2>
            <h2 style="margin-top: 0;">Test select tooltip text for hide delay</h2>

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
            <h2>Test always show (UNDER CONSTRUCTION)</h2>

            <button 
                v-tooltip="{
                    content: 'I am always visible',
                }" 
                style="">

                Always show
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
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue";
    import OverlayPanel from 'primevue/overlaypanel';

    const overlayPanelElement = ref();

    const toggle = (event) => {
        overlayPanelElement.value.toggle(event);
    }
</script>

<style>
    p {
        margin: 0;
        padding: 0;
    }
</style>
