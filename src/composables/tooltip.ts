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

const SimpleTooltip = (config?: TooltipConfig): Directive => {
    // Get Tooltip config
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
            // Get Tooltip position and text
            const tooltipPosition: TooltipPosition = (binding.arg ?? defaultTooltipPosition) as TooltipPosition
            const text: string = binding.value
    
            // Create Text element
            const textElement = document.createElement('p')
            textElement.classList.add(...textClasses.split(' '))
            textElement.innerText = text

            // Create Tooltip element
            const tooltipElement = document.createElement('div')
            tooltipElement.id = tooltipElementId
            tooltipElement.classList.add(...tooltipClasses.split(' '))
            tooltipElement.appendChild(textElement)

            function tryMountTooltipOnLeft(anchorElementRect: DOMRect) {
                // Check if Tooltip has enough available horizontal space, top and bottom offset from viewport
                const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (anchorElementRect.left + tooltipOffsetFromSource) - tooltipOffsetFromViewport, tooltipMaxWidth)
                const isAnchorElementTopLowerThanOffsetFromViewport = anchorElementRect.top >= tooltipOffsetFromViewport
                const isAnchorElementBottomHigherThanOffsetFromViewport = (window.innerHeight - anchorElementRect.bottom) >= tooltipOffsetFromViewport

                if (tooltipAvailableMaxWidth < tooltipMinWidth || !isAnchorElementTopLowerThanOffsetFromViewport || !isAnchorElementBottomHigherThanOffsetFromViewport) return false
                
                // Calculate Tooltip position and width
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                let tooltipTop = anchorElementRect.top + (anchorElementRect.height / 2) - (tooltipElementRect.height / 2)
                
                if (tooltipTop < tooltipOffsetFromViewport) {
                    tooltipTop = tooltipOffsetFromViewport
                } else if (tooltipTop + tooltipElementRect.height > window.innerHeight - tooltipOffsetFromViewport) {
                    tooltipTop = window.innerHeight - tooltipOffsetFromViewport - tooltipElementRect.height
                }

                const tooltipRight = anchorElementRect.left - tooltipOffsetFromSource

                // Set Tooltip maxWidth and position
                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`
                tooltipElement.style.top = `${tooltipTop}px`
                tooltipElement.style.right = `${tooltipRight}px`

                return true
            }

            function tryMountTooltipOnRight(anchorElementRect: DOMRect) {
                // Check if Tooltip has enough available horizontal space, top and bottom offset from viewport
                const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (anchorElementRect.right + tooltipOffsetFromSource) - tooltipOffsetFromViewport, tooltipMaxWidth)
                const isAnchorElementTopLowerThanOffsetFromViewport = anchorElementRect.top >= tooltipOffsetFromViewport
                const isAnchorElementBottomHigherThanOffsetFromViewport = (window.innerHeight - anchorElementRect.bottom) >= tooltipOffsetFromViewport

                if (tooltipAvailableMaxWidth < tooltipMinWidth || !isAnchorElementTopLowerThanOffsetFromViewport || !isAnchorElementBottomHigherThanOffsetFromViewport) return false
                
                // Calculate Tooltip position and width
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                let tooltipTop = anchorElementRect.top + (anchorElementRect.height / 2) - (tooltipElementRect.height / 2)
                
                if (tooltipTop < tooltipOffsetFromViewport) {
                    tooltipTop = tooltipOffsetFromViewport
                } else if (tooltipTop + tooltipElementRect.height > window.innerHeight - tooltipOffsetFromViewport) {
                    tooltipTop = window.innerHeight - tooltipOffsetFromViewport - tooltipElementRect.height
                }
                    
                const tooltipLeft = anchorElementRect.right + tooltipOffsetFromSource

                // Set Tooltip maxWidth and position
                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`
                tooltipElement.style.top = `${tooltipTop}px`
                tooltipElement.style.left = `${tooltipLeft}px`

                return true
            }

            function tryMountTooltipOnTop(anchorElementRect: DOMRect) {
                // Check if Tooltip has enough available left and right offset from viewport 
                const isAnchorElementLeftMoreThanOffsetFromViewport = anchorElementRect.left >= tooltipOffsetFromViewport
                const isAnchorElementRightMoreThanOffsetFromViewport = (window.innerHeight - anchorElementRect.right) >= tooltipOffsetFromViewport
                
                if (isAnchorElementLeftMoreThanOffsetFromViewport || isAnchorElementRightMoreThanOffsetFromViewport) return false
                
                // Calculate and set Tooltip width
                const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (tooltipOffsetFromViewport * 2), tooltipMaxWidth)
                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

                // Calculate Tooltip top position
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                let tooltipTop = anchorElementRect.top - tooltipOffsetFromSource - tooltipElementRect.height

                // Check if Tooltip has enough available on top 
                if (tooltipTop < tooltipOffsetFromViewport) return false
                
                // Calculate Tooltip left position
                let tooltipLeft = anchorElementRect.left + (anchorElementRect.width / 2) - (tooltipElementRect.width / 2)

                if (tooltipLeft < tooltipOffsetFromViewport) {
                    tooltipLeft = tooltipOffsetFromViewport
                } else if (tooltipLeft + tooltipElementRect.width > window.innerWidth - tooltipOffsetFromViewport) {
                    tooltipLeft = window.innerWidth - tooltipOffsetFromViewport - tooltipElementRect.width
                }

                // Set Tooltip position
                tooltipElement.style.top = `${tooltipTop}px`
                tooltipElement.style.left = `${tooltipLeft}px`

                return true
            }

            function tryMountTooltipOnBottom(anchorElementRect: DOMRect) {
                // Check if Tooltip has enough available left and right offset from viewport 
                const isAnchorElementLeftMoreThanOffsetFromViewport = anchorElementRect.left >= tooltipOffsetFromViewport
                const isAnchorElementRightMoreThanOffsetFromViewport = (window.innerHeight - anchorElementRect.right) >= tooltipOffsetFromViewport
                
                if (isAnchorElementLeftMoreThanOffsetFromViewport || isAnchorElementRightMoreThanOffsetFromViewport) return false
                
                // Calculate and set Tooltip width
                const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (tooltipOffsetFromViewport * 2), tooltipMaxWidth)
                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

                // Calculate Tooltip top position
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                let tooltipTop = anchorElementRect.bottom + tooltipOffsetFromSource + tooltipElementRect.height 

                // Check if Tooltip has enough available on bottom 
                if (tooltipTop + tooltipElementRect.height > window.innerHeight - tooltipOffsetFromViewport) return false
                
                // Calculate Tooltip left position
                let tooltipLeft = anchorElementRect.left + (anchorElementRect.width / 2) - (tooltipElementRect.width / 2)

                if (tooltipLeft < tooltipOffsetFromViewport) {
                    tooltipLeft = tooltipOffsetFromViewport
                } else if (tooltipLeft + tooltipElementRect.width > window.innerWidth - tooltipOffsetFromViewport) {
                    tooltipLeft = window.innerWidth - tooltipOffsetFromViewport - tooltipElementRect.width
                }

                // Set Tooltip position
                tooltipElement.style.top = `${tooltipTop}px`
                tooltipElement.style.left = `${tooltipLeft}px`

                return true
            }

            function drawArrow(anchorElementRect: DOMRect) {
                // Create Arrow element
                const arrowElement = document.createElement('div')
                const arrowClasses = twMerge(defaultArrowClasses, config?.arrowClasses ?? '', 'border-y-transparent border-l-transparent') 
                arrowElement.id = arrowElementId
                arrowElement.classList.add(...arrowClasses.split(' '))
                
                // Calculate Arrow element size and position
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                const arrowOffsetFromAnchorMiddleAxis = Math.sin(45 * (180 / Math.PI)) * arrowSize
                const arrowTop = anchorElementRect.top - tooltipElementRect.top + (anchorElementRect.height / 2) - arrowOffsetFromAnchorMiddleAxis
                const arrowLeft = (-arrowSize * 2)

                // Set Arrow element size and position
                arrowElement.style.top = `${arrowTop}px`
                arrowElement.style.left = `${arrowLeft}px`
                arrowElement.style.borderWidth = `${arrowSize}px`

                // Mount Arrow element
                document.querySelector(`#${tooltipElementId}`)?.appendChild(arrowElement)
            }
            
            // Add listener for showing Tooltip element
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
                        hasNeededDisplaySpace = tryMountTooltipOnLeft(anchorElementRect)
                    } else if (currentTooltipPosition === 'top') {
                        hasNeededDisplaySpace = tryMountTooltipOnTop(anchorElementRect)
                    } else if (currentTooltipPosition === 'right') {
                        hasNeededDisplaySpace = tryMountTooltipOnRight(anchorElementRect)
                    } else if (currentTooltipPosition === 'bottom') {
                        hasNeededDisplaySpace = tryMountTooltipOnBottom(anchorElementRect)
                    }

                    if (hasNeededDisplaySpace) break
                }

                console.log(hasNeededDisplaySpace)

                if (hasNeededDisplaySpace) {
                    drawArrow(anchorElementRect)
    
                    tooltipElement.style.opacity = '1'
                }
            })

            // Add listener for hiding Tooltip element
            anchorElement.addEventListener('mouseleave', () => hideTooltip())
        },
    }
}

function hideTooltip() {
    const tooltipElement = document.querySelector(`#${tooltipElementId}`)

    // Remove Arrow element from Tooltip, because it needs to be rebuilt every time Tooltip is showed again
    tooltipElement?.querySelector(`#${arrowElementId}`)?.remove()

    tooltipElement?.remove()
}

export default SimpleTooltip
export type { TooltipConfig, TooltipPosition, TooltipPositions }