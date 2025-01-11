
import type { ScrollContainers, ScrollContainer } from '@/types/scrollContainer'

export default function useHideOnScroll() {
    let scrollContainers: ScrollContainers = []

    const handleHideOnScroll = (anchorElement: HTMLElement, hideOverlay: () => void) => {
        getScrollContainers(anchorElement)

        for (const scrollContainer of scrollContainers) {
            scrollContainer.element.addEventListener(
                'scroll', 
                () => {
                    hideOverlay()
                    removeHideOnScrollListeners()
                }, 
                { signal: scrollContainer.eventController.signal }
            )
        }
    }

    const getScrollContainers = (anchorElement: HTMLElement) => {
        let currentElement: HTMLElement | null = anchorElement

        while (currentElement !== null && currentElement.tagName !== 'HTML') {
            if (currentElement.scrollHeight !== currentElement.clientHeight) {
                const computedStyle = window.getComputedStyle(currentElement)

                if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll') {
                    const scrollContainer: ScrollContainer = {
                        element: currentElement,
                        eventController: new AbortController()
                    }

                    scrollContainers.push(scrollContainer)
                }
            }

            currentElement = currentElement.parentElement
        }

        // Add window as a scroll container
        const scrollContainer: ScrollContainer = {
            element: window,
            eventController: new AbortController()
        }

        scrollContainers.push(scrollContainer)
    }

    const removeHideOnScrollListeners = () => {
        for (const scrollContainer of scrollContainers) {
            scrollContainer.eventController.abort()
        }

        scrollContainers = []
    }
    
    return { handleHideOnScroll, removeHideOnScrollListeners }
}
