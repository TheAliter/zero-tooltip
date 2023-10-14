export default function useHideOnResize() {
    let anchorElementResizeObserver: ResizeObserver | null = null
    let anchorElementRect: DOMRect | null = null

    const handleHideOnResize = (anchorElement: HTMLElement, hideOverlay: () => void) => {
        anchorElementResizeObserver = new ResizeObserver((entries) => {
            const targetElement = entries[0].target

            if (anchorElementRect === null) {
                // On initial trigger set initial values
                anchorElementRect = anchorElement.getBoundingClientRect()
            } else {
                const targetElementRect = targetElement.getBoundingClientRect()

                // Check if anchor element has moved or resized
                if (targetElementRect.left !== anchorElementRect.left
                    || targetElementRect.top !== anchorElementRect.top
                    || targetElementRect.width !== anchorElementRect.width
                    || targetElementRect.height !== anchorElementRect.height) {
                        hideOverlay()
                    }
            }
        })

        anchorElementResizeObserver.observe(anchorElement)
    }

    const resetResizeReferences = () => {
        if (anchorElementResizeObserver !== null) anchorElementResizeObserver.disconnect()

        anchorElementResizeObserver = null
        anchorElementRect = null
    }

    return { handleHideOnResize, resetResizeReferences }
}
