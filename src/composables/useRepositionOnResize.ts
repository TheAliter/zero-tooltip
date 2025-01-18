export default function useRepositionOnResize() {
    const anchorElementsRepositionControllers: Record<string, AbortController>  = {}

    const handleRepositionOnResize = (tooltipUuid: string, onWindowResize: () => void) => {
        anchorElementsRepositionControllers[tooltipUuid] = new AbortController()
        window.addEventListener('resize', onWindowResize)
    }

    const removeRepositionOnResizeHandler = (tooltipUuid: string) => {
        if (anchorElementsRepositionControllers[tooltipUuid]) {
            anchorElementsRepositionControllers[tooltipUuid].abort()
        }
    }

    return { handleRepositionOnResize, removeRepositionOnResizeHandler }
}
