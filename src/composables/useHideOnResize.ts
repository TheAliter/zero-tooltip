export default function useHideOnResize() {
    const anchorElementResizeObservers: Record<string, ResizeObserver>  = {}
    const anchorElementRects: Record<string, DOMRect>  = {}

    const handleHideOnResize = (tooltipUuid: string, anchorElement: HTMLElement, hideOverlay: () => void) => {
        let anchorElementResizeObserver = new ResizeObserver((entries) => {
            const targetElement = entries[0].target

            if (!anchorElementRects[tooltipUuid]) {
                // On initial trigger set initial values
                anchorElementRects[tooltipUuid] = anchorElement.getBoundingClientRect()
            } else {
                const targetElementRect = targetElement.getBoundingClientRect()

                // Check if anchor element has moved or resized
                if (targetElementRect.left !== anchorElementRects[tooltipUuid].left
                    || targetElementRect.top !== anchorElementRects[tooltipUuid].top
                    || targetElementRect.width !== anchorElementRects[tooltipUuid].width
                    || targetElementRect.height !== anchorElementRects[tooltipUuid].height) {
                        hideOverlay()
                    }
            }
        })

        anchorElementResizeObservers[tooltipUuid] = anchorElementResizeObserver

        anchorElementResizeObserver.observe(anchorElement)
    }

    const resetResizeReferences = (tooltipUuid: string) => {
        if (anchorElementResizeObservers[tooltipUuid]) anchorElementResizeObservers[tooltipUuid].disconnect()

        delete anchorElementResizeObservers[tooltipUuid]
        delete anchorElementRects[tooltipUuid]
    }

    return { handleHideOnResize, resetResizeReferences }
}
