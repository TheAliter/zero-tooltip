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

let defaultTooltipPosition: TooltipPosition = 'bottom'
const defaultTooltipOffsetFromSource = 10
const defaultTooltipOffsetFromViewport = 20
const defaultTooltipMinWidth = 100
const defaultTooltipMaxWidth = 250
const defaultTooltipClasses = 'absolute opacity-0 inline-block w-fit py-1.5 px-2.5 rounded-md bg-[#495057] shadow-[0_2px_12px_0_rgba(0,0,0,0.1)] box-border'
const defaultTextClasses = 'text-sm text-white whitespace-pre-wrap break-words'
const defaultArrowSize = 5
const defaultArrowClasses = 'absolute border-solid border-[#495057]'
const defaultMinArrowOffsetFromTooltipCorner = 6

const SimpleTooltip = (config?: TooltipConfig): Directive => {
    if (config?.defaultPosition) {
        defaultTooltipPosition = config.defaultPosition
    }

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
    const arrowMinOffsetFromTooltipCorner = config?.arrowMinOffsetFromTooltipCorner ?? defaultMinArrowOffsetFromTooltipCorner

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

                // Set Tooltip maxWidth
                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

                // Calculate Tooltip position
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                let tooltipTop = anchorElementRect.top + (anchorElementRect.height / 2) - (tooltipElementRect.height / 2)
                
                if (tooltipTop < tooltipOffsetFromViewport) {
                    tooltipTop = tooltipOffsetFromViewport
                } else if (tooltipTop + tooltipElementRect.height > window.innerHeight - tooltipOffsetFromViewport) {
                    tooltipTop = window.innerHeight - tooltipOffsetFromViewport - tooltipElementRect.height
                }

                const tooltipLeft = anchorElementRect.left - tooltipOffsetFromSource - tooltipElementRect.width

                // Set Tooltip position
                tooltipElement.style.top = `${tooltipTop}px`
                tooltipElement.style.left = `${tooltipLeft}px`

                return true
            }

            function tryMountTooltipOnRight(anchorElementRect: DOMRect) {
                // Check if Tooltip has enough available horizontal space, top and bottom offset from viewport
                const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (anchorElementRect.right + tooltipOffsetFromSource) - tooltipOffsetFromViewport, tooltipMaxWidth)
                const isAnchorElementTopLowerThanOffsetFromViewport = anchorElementRect.top >= tooltipOffsetFromViewport
                const isAnchorElementBottomHigherThanOffsetFromViewport = (window.innerHeight - anchorElementRect.bottom) >= tooltipOffsetFromViewport

                if (tooltipAvailableMaxWidth < tooltipMinWidth || !isAnchorElementTopLowerThanOffsetFromViewport || !isAnchorElementBottomHigherThanOffsetFromViewport) return false
                
                // Set tooltip maxWidth
                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

                // Calculate Tooltip position
                const tooltipElementRect = tooltipElement.getBoundingClientRect()

                let tooltipTop = anchorElementRect.top + (anchorElementRect.height / 2) - (tooltipElementRect.height / 2)
                
                if (tooltipTop < tooltipOffsetFromViewport) {
                    tooltipTop = tooltipOffsetFromViewport
                } else if (tooltipTop + tooltipElementRect.height > window.innerHeight - tooltipOffsetFromViewport) {
                    tooltipTop = window.innerHeight - tooltipOffsetFromViewport - tooltipElementRect.height
                }

                const tooltipLeft = anchorElementRect.right + tooltipOffsetFromSource

                // Set Tooltip position
                tooltipElement.style.top = `${tooltipTop}px`
                tooltipElement.style.left = `${tooltipLeft}px`

                return true
            }

            function tryMountTooltipOnTop(anchorElementRect: DOMRect) {
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
                // Calculate and set Tooltip width
                const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (tooltipOffsetFromViewport * 2), tooltipMaxWidth)
                tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

                // Calculate Tooltip top position
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                let tooltipTop = anchorElementRect.bottom + tooltipOffsetFromSource 

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

            function drawArrow(anchorElementRect: DOMRect, currentTooltipPosition: TooltipPosition) {
                // Create Arrow element
                const arrowElement = document.createElement('div')

                // Calculate Arrow element size, positions and style/angle classes
                const tooltipElementRect = tooltipElement.getBoundingClientRect()
                const arrowHalfLengthOfLongSide = Math.sin(45 * (180 / Math.PI)) * arrowSize

                
                // Arrow top/left 0 is Tooltip top/left 0
                let arrowTop = 0
                let arrowLeft = 0

                let arrowClassForCorrectAngle = ''

                switch (currentTooltipPosition) {
                    case "left": 
                        arrowClassForCorrectAngle = 'border-y-transparent border-r-transparent'
                        arrowTop = anchorElementRect.top - tooltipElementRect.top + (anchorElementRect.height / 2) - arrowHalfLengthOfLongSide
                        arrowLeft = tooltipElementRect.width
                        break;
                    case "top":
                        arrowClassForCorrectAngle = 'border-x-transparent border-b-transparent'
                        arrowTop = tooltipElementRect.height
                        arrowLeft = anchorElementRect.left - tooltipElementRect.left + (anchorElementRect.width / 2) - arrowHalfLengthOfLongSide
                        break;
                    case "right":
                        arrowClassForCorrectAngle = 'border-y-transparent border-l-transparent'
                        arrowTop = anchorElementRect.top - tooltipElementRect.top + (anchorElementRect.height / 2) - arrowHalfLengthOfLongSide
                        if (arrowTop < tooltipElementRect.top + arrowMinOffsetFromTooltipCorner) arrowTop = tooltipElementRect.top + arrowMinOffsetFromTooltipCorner
                        arrowLeft = (-arrowSize * 2)
                        if (arrowLeft < tooltipElementRect.left + arrowMinOffsetFromTooltipCorner) arrowLeft = tooltipElementRect.left + arrowMinOffsetFromTooltipCorner
                        break;
                    case "bottom":
                        arrowClassForCorrectAngle = 'border-x-transparent border-t-transparent'
                        arrowTop = (-arrowSize * 2)
                        arrowLeft = anchorElementRect.left - tooltipElementRect.left + (anchorElementRect.width / 2) - arrowHalfLengthOfLongSide
                        break;
                }               

                if (currentTooltipPosition === 'left' || currentTooltipPosition === 'right') {
                    if (!isArrowPositionWithinLimits(currentTooltipPosition, tooltipElementRect, arrowTop)) {
                        arrowTop = getArrowPositionMinLimit(currentTooltipPosition, tooltipElementRect, arrowTop)
                    }
                } else {
                    if (!isArrowPositionWithinLimits(currentTooltipPosition, tooltipElementRect, arrowLeft)) {
                        arrowLeft = getArrowPositionMinLimit(currentTooltipPosition, tooltipElementRect, arrowLeft)
                    }
                }

                // Set Arrow element id, styling/angle
                const arrowClasses = twMerge(defaultArrowClasses, config?.arrowClasses ?? '', arrowClassForCorrectAngle) 
                arrowElement.id = arrowElementId
                arrowElement.classList.add(...arrowClasses.split(' '))
                
                // Set Arrow element size and position
                arrowElement.style.top = `${arrowTop}px`
                arrowElement.style.left = `${arrowLeft}px`
                arrowElement.style.borderWidth = `${arrowSize}px`

                // Mount Arrow element
                document.querySelector(`#${tooltipElementId}`)?.appendChild(arrowElement)
            }

            function isArrowPositionWithinLimits(currentTooltipPosition: TooltipPosition, tooltipElementRect: DOMRect, arrowPosition: number) {
                switch (currentTooltipPosition) {
                    case "left":
                    case "right":
                        return arrowPosition > arrowMinOffsetFromTooltipCorner 
                                && arrowPosition < tooltipElementRect.height - arrowMinOffsetFromTooltipCorner - (arrowSize * 2)
                    case "top":
                    case "bottom":
                        return arrowPosition > arrowMinOffsetFromTooltipCorner 
                                && arrowPosition < tooltipElementRect.width - arrowMinOffsetFromTooltipCorner - (arrowSize * 2)
                }
            }

            function getArrowPositionMinLimit(currentTooltipPosition: TooltipPosition, tooltipElementRect: DOMRect, arrowPosition: number) {
                switch (currentTooltipPosition) {
                    case "left":
                    case "right":
                        if (arrowPosition < arrowMinOffsetFromTooltipCorner) {
                            // Arrow too close to viewport top
                            return arrowMinOffsetFromTooltipCorner
                        } else {
                            // Arrow too close to viewport bottom
                            return tooltipElementRect.height - arrowMinOffsetFromTooltipCorner - (arrowSize * 2)
                        }
                    case "top":
                    case "bottom":
                        if (arrowPosition < arrowMinOffsetFromTooltipCorner) {
                            // Arrow too close to viewport left
                            return arrowMinOffsetFromTooltipCorner
                        } else {
                            // Arrow too close to viewport right
                            return tooltipElementRect.width - arrowMinOffsetFromTooltipCorner - (arrowSize * 2)
                        }
                }
            }
            
            // Add listener for showing Tooltip element
            anchorElement.addEventListener('mouseenter', () => {
                const anchorElementRect = anchorElement.getBoundingClientRect()

                // Mount Tooltip element to body
                const body = document.querySelector('body')
                body?.appendChild(tooltipElement)

                // Find suitable Tooltip position
                let hasNeededDisplaySpace = false
                let currentTooltipPosition = tooltipPosition
                for (let i = 0; i < 4; i++) {
                    currentTooltipPosition = tooltipPositions[tooltipPosition][i]

                    console.log(currentTooltipPosition)

                    if (currentTooltipPosition === 'left') {
                        hasNeededDisplaySpace = tryMountTooltipOnLeft(anchorElementRect)
                    } else if (currentTooltipPosition === 'top') {
                        hasNeededDisplaySpace = tryMountTooltipOnTop(anchorElementRect)
                    } else if (currentTooltipPosition === 'right') {
                        hasNeededDisplaySpace = tryMountTooltipOnRight(anchorElementRect)
                    } else if (currentTooltipPosition === 'bottom') {
                        hasNeededDisplaySpace = tryMountTooltipOnBottom(anchorElementRect)
                    }

                    console.log(hasNeededDisplaySpace)

                    if (hasNeededDisplaySpace) break
                }

                if (hasNeededDisplaySpace) {
                    drawArrow(anchorElementRect, currentTooltipPosition)
    
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