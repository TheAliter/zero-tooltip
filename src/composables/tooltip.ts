import { Directive } from "vue"
import { twMerge } from 'tailwind-merge'
import TooltipConfig from "../types/config"
import TooltipPosition from "../types/tooltipPosition"
import TooltipPositions from "../types/tooltipPositions"

const tooltipElementId = 'simple-tooltip'
const arrowElementId = 'simple-tooltip__arrow'

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
const defaultTooltipClasses = 'absolute opacity-0 inline-block w-fit py-1.5 px-2.5 rounded-md bg-[#495057] shadow-[0_2px_12px_0_rgba(0,0,0,0.1)] box-border'
const defaultTextClasses = 'text-sm text-white whitespace-pre-wrap break-words'
const defaultArrowSize = 5
const defaultArrowClasses = 'absolute border-solid border-[#495057]'

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

    return {
        mounted: (anchorElement: HTMLElement, binding) => {
            const tooltipPosition: TooltipPosition = (binding.arg ?? defaultTooltipPosition) as TooltipPosition
            const text: string = binding.value
    
            // Create text element
            const textElement = document.createElement('p')
            textElement.classList.add(...textClasses.split(' '))
            textElement.innerText = text

            // Create tooltip element
            const tooltipElement = document.createElement('div')
            tooltipElement.id = tooltipElementId
            tooltipElement.classList.add(...tooltipClasses.split(' '))
            tooltipElement.appendChild(textElement)

            function canPositionTooltipOnRight(anchorElementRect: DOMRect) {
                const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (anchorElementRect.right + tooltipOffsetFromSource) - tooltipOffsetFromViewport, tooltipMaxWidth)
                const hasAnchorElementEnoughVerticalOffset = anchorElementRect.top >= tooltipOffsetFromViewport && window.innerHeight - anchorElementRect.bottom >= tooltipOffsetFromViewport

                if (tooltipAvailableMaxWidth < tooltipMinWidth || !hasAnchorElementEnoughVerticalOffset) return false
                
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                let tooltipTop = anchorElementRect.top + (anchorElementRect.height / 2) - (tooltipElementRect.height / 2)
                
                if (tooltipTop < tooltipOffsetFromViewport) {
                    tooltipTop = 4
                }

                const tooltipLeft = anchorElementRect.right + tooltipOffsetFromSource

                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`
                tooltipElement.style.top = `${tooltipTop}px`
                tooltipElement.style.left = `${tooltipLeft}px`

                return true
            }


            function drawArrow(anchorElementRect: DOMRect) {
                const arrowElement = document.createElement('div')
                const arrowClasses = twMerge(defaultArrowClasses, config?.arrowClasses ?? '', 'border-y-transparent border-l-transparent') 
                arrowElement.id = arrowElementId
                arrowElement.classList.add(...arrowClasses.split(' '))
                
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                const arrowOffsetFromAnchorMiddleAxis = Math.sin(45 * (180 / Math.PI)) * arrowSize
                const arrowTop = anchorElementRect.top - tooltipElementRect.top + (anchorElementRect.height / 2) - arrowOffsetFromAnchorMiddleAxis
                const arrowLeft = (-arrowSize * 2)

                arrowElement.style.top = `${arrowTop}px`
                arrowElement.style.left = `${arrowLeft}px`
                arrowElement.style.borderWidth = `${arrowSize}px`

                document.querySelector(`#${tooltipElementId}`)?.appendChild(arrowElement)
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
                        console.log(hasNeededDisplaySpace);
                        
                        if (hasNeededDisplaySpace) break
                    }
                }

                drawArrow(anchorElementRect)

                tooltipElement.style.opacity = '1'
            })

            // Hide Tooltip element
            anchorElement.addEventListener('mouseleave', () => hideTooltip())
        },
    }
}

function hideTooltip() {
    const tooltipElement = document.querySelector(`#${tooltipElementId}`)
    tooltipElement?.querySelector(`#${arrowElementId}`)?.remove()
    tooltipElement?.remove()
}

export default Tooltip
export type { TooltipConfig, TooltipPosition, TooltipPositions }