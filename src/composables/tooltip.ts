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
const defaultTooltipOffset = 10
const defaultArrowSize = 10
const defaultTooltipClasses = 'absolute opacity-0 inline-block max-w-[15rem] w-fit py-1.5 px-2.5 rounded-md bg-[#495057] shadow-[0_2px_12px_0_rgba(0,0,0,0.1)] box-border'
const defaultTextClasses = 'text-sm text-white whitespace-pre-wrap break-words'
const defaultArrowClasses = ''


const Tooltip = (config?: TooltipConfig): Directive => {
    const tooltipPositions: TooltipPositions =  {
        'left': config?.positions?.left ?? defaultTooltipPositions.left,
        'top': config?.positions?.top ?? defaultTooltipPositions.top,
        'right': config?.positions?.right ?? defaultTooltipPositions.right,
        'bottom': config?.positions?.bottom ?? defaultTooltipPositions.bottom,
    }
    const tooltipOffset = config?.offset ?? defaultTooltipOffset
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
            arrowElement.style.width = `${arrowSize}px`
            arrowElement.style.height = `${arrowSize}px`

            // Create tooltip element
            const tooltipElement = document.createElement('div')
            tooltipElement.id = 'simple-tooltip'
            tooltipElement.classList.add(...tooltipClasses.split(' '))
            tooltipElement.appendChild(arrowElement)
            tooltipElement.appendChild(textElement)
            
            // Show Tooltip element
            anchorElement.addEventListener('mouseenter', () => {
                const anchorElementRect = anchorElement.getBoundingClientRect()

                // Find suitable Tooltip position
                let hasNeededDisplaySpace = false
                for (let i = 0; i < 4; i++) {
                    let currentTooltipPosition = tooltipPositions[tooltipPosition][i]

                    if (currentTooltipPosition === 'left') {
                        hasNeededDisplaySpace = canPositionTooltipOnLeft(anchorElementRect, tooltipElement)
                    }
                }






            
                // Mount Tooltip element to body
                const body = document.querySelector('body')
                body?.appendChild(tooltipElement)
            })

            // Hide Tooltip element
            anchorElement.addEventListener('mouseleave', () => hideTooltip())
        },
    }
}

function canPositionTooltipOnLeft(anchorElementRect: DOMRect, tooltipElement: HTMLElement) {
    const anchorElementLeft = anchorElementRect.left;

    

    return false;
}

function hideTooltip() {
    const tooltipElement = document.querySelector('#simple-tooltip')
    tooltipElement?.remove()
}

export default Tooltip
export type { TooltipConfig, TooltipPosition, TooltipPositions }