
export default function useHideOnScroll() {
    let scrollContainers: Array<HTMLElement> = []

    const handleHideOnScroll = (anchorElement: HTMLElement, hideOverlay: () => void) => {
        getScrollContainers(anchorElement)

        if (scrollContainers.length > 0) {
            for (const scrollContainer of scrollContainers) {
                scrollContainer.addEventListener('scroll', hideOverlay)
            }
        } 
        
        window.addEventListener('scroll', () => {
            hideOverlay()
            removeHideOnScrollListeners(hideOverlay)
        })
    }

    const getScrollContainers = (anchorElement: HTMLElement) => {
        let currentElement: HTMLElement | null = anchorElement

        while (currentElement !== null && currentElement.tagName !== 'HTML') {
            if (currentElement.scrollHeight !== currentElement.clientHeight) {
                const computedStyle = window.getComputedStyle(currentElement)

                if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll') {
                    scrollContainers.push(currentElement)
                }
            }

            currentElement = currentElement.parentElement
        } 
    }

    const removeHideOnScrollListeners = (hideOverlay: () => void) => {
        if (scrollContainers.length > 0) {
            for (const scrollContainer of scrollContainers) {
                scrollContainer.removeEventListener('scroll', hideOverlay)
            }

            scrollContainers = []
        } 
        
        window.removeEventListener('scroll', hideOverlay)
    }
    
    return { handleHideOnScroll }
}
