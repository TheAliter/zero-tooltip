import { Directive } from "vue"
import { twMerge } from 'tailwind-merge'
import TooltipConfig from "../types/config"
import TooltipPosition from "../types/tooltipPosition"
import TooltipPositions from "../types/tooltipPositions"

// For each TooltipPosition define sequence of positions that will be checked when determining where to render Tooltip
// Meant as fallback positions in case Tooltip do not have enough space in originally set position
const defaultTooltipPositions: TooltipPositions = {
    'left': ['left', 'right', 'top', 'bottom'],
    'top': ['top', 'bottom', 'right', 'left'],
    'right': ['right', 'left', 'top', 'bottom'],
    'bottom': ['bottom', 'top', 'right', 'left'],
}

const defaultTooltipPosition: TooltipPosition = 'right'
const defaultTooltipOffsetFromSource = 10
const defaultTooltipOffsetFromViewport = 20
const defaultTooltipMinWidth = 100
const defaultTooltipMaxWidth = 250
const defaultArrowSize = 10
const defaultTooltipClasses = 'absolute opacity-0 inline-block w-fit py-1.5 px-2.5 rounded-md bg-[#495057] shadow-[0_2px_12px_0_rgba(0,0,0,0.1)] box-border'
const defaultTextClasses = 'text-sm text-white whitespace-pre-wrap break-words'
const defaultArrowClasses = 'absolute border-transparent'


const Tooltip = (config?: TooltipConfig): Directive => {
    const tooltipPositions: TooltipPositions =  {
        'left': config?.positions?.left ?? defaultTooltipPositions.left,
        'top': config?.positions?.top ?? defaultTooltipPositions.top,
        'right': config?.positions?.right ?? defaultTooltipPositions.right,
        'bottom': config?.positions?.bottom ?? defaultTooltipPositions.bottom,
    }
    const tooltipOffsetFromSource = config?.offsetFromSource ?? defaultTooltipOffsetFromSource
    const tooltipOffsetFromViewport = config?.offsetFromViewport ?? defaultTooltipOffsetFromViewport
    const tooltipMinWidth = config?.minWidth ?? defaultTooltipMinWidth
    const tooltipMaxWidth = config?.maxWidth ?? defaultTooltipMaxWidth
    const tooltipClasses = twMerge(defaultTooltipClasses, config?.tooltipClasses ?? '')
    const textClasses = twMerge(defaultTextClasses, config?.textClasses ?? '')
    const arrowSize = config?.arrowSize ?? defaultArrowSize
    const arrowClasses = twMerge(defaultArrowClasses, config?.arrowClasses ?? '') 

    return {
        mounted: (anchorElement: HTMLElement, binding) => {
            const tooltipPosition: TooltipPosition = (binding.arg ?? defaultTooltipPosition) as TooltipPosition
            const text: string = binding.value
    
            // Create text element
            const textElement = document.createElement('p')
            textElement.classList.add(...textClasses.split(' '))
            textElement.innerText = text

            // Create arrow element
            const arrowElement = document.createElement('div')
            arrowElement.classList.add(...arrowClasses.split(' '))
            arrowElement.style.borderWidth = `${arrowSize/2}px`

            // Create tooltip element
            const tooltipElement = document.createElement('div')
            tooltipElement.id = 'simple-tooltip'
            tooltipElement.classList.add(...tooltipClasses.split(' '))
            tooltipElement.appendChild(arrowElement)
            tooltipElement.appendChild(textElement)

            function canPositionTooltipOnRight(anchorElementRect: DOMRect) {
                // Handle horizontal position
                const anchorElementRight = anchorElementRect.right;
                tooltipElement.style.left = `${anchorElementRight + tooltipOffsetFromSource}px`

                // Handle width
                const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (anchorElementRight + tooltipOffsetFromSource) - tooltipOffsetFromViewport, tooltipMaxWidth)

                if (tooltipAvailableMaxWidth < tooltipMinWidth) return false

                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

                // Handle vertical position
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                let tooltipTop = anchorElementRect.top + (anchorElementRect.height / 2) - (tooltipElementRect.height / 2)

                if (tooltipTop < tooltipOffsetFromViewport) {
                    tooltipTop = 4
                }

                tooltipElement.style.top = `${tooltipTop}px`

                return true
            }
            
            // Show Tooltip element
            anchorElement.addEventListener('mouseenter', () => {
                const anchorElementRect = anchorElement.getBoundingClientRect()

                // Mount Tooltip element to body
                const body = document.querySelector('body')
                body?.appendChild(tooltipElement)

                // Find suitable Tooltip position
                let hasNeededDisplaySpace = false
                for (let i = 0; i < 4; i++) {
                    let currentTooltipPosition = tooltipPositions[tooltipPosition][i]

                    if (currentTooltipPosition === 'left') {
                        hasNeededDisplaySpace = canPositionTooltipOnRight(anchorElementRect)
                        if (hasNeededDisplaySpace) break
                    }

                    
                }

                tooltipElement.style.opacity = '1'
            })

            // Hide Tooltip element
            anchorElement.addEventListener('mouseleave', () => hideTooltip())
        },
    }
}

function hideTooltip() {
    const tooltipElement = document.querySelector('#simple-tooltip')
    tooltipElement?.remove()
}

export default Tooltip
export type { TooltipConfig, TooltipPosition, TooltipPositions }