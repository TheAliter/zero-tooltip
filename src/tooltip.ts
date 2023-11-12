import { Directive, watch } from "vue"
import TooltipConfig from "./types/tooltipConfig"
import TooltipPosition from "./types/tooltipPosition"
import TooltipPositions from "./types/tooltipPositions"
import TooltipLocalConfig from "./types/tooltipLocalConfig"
import useHideOnScroll from './composables/useHideOnScroll'
import useHideOnResize from "./composables/useHideOnResize"

const { handleHideOnScroll } = useHideOnScroll()
const { handleHideOnResize, resetResizeReferences } = useHideOnResize()

const tooltipElementClass = 'zero-tooltip__container'
const textElementClass = 'zero-tooltip__text'
const arrowElementClass = 'zero-tooltip__arrow'

// For each TooltipPosition define sequence of positions that will be checked when determining where to render Tooltip
// Meant as fallback positions in case Tooltip do not have enough space in originally set position
const defaultTooltipPositions: TooltipPositions = {
    left: ['left', 'right', 'top', 'bottom'],
    top: ['top', 'bottom', 'right', 'left'],
    right: ['right', 'left', 'top', 'bottom'],
    bottom: ['bottom', 'top', 'right', 'left'],
}

const defaultTooltipPosition: TooltipPosition = 'top'
const defaultTooltipOffsetFromSource = 10
const defaultTooltipOffsetFromViewport = 20
const defaultTooltipMinWidth = 100
const defaultTooltipMaxWidth = 250
const defaultTooltipBorderWidth = 0
const defaultTooltipClasses = 'zt-fixed zt-opacity-0 zt-inline-block zt-w-fit zt-py-1.5 zt-px-2.5 zt-rounded-md zt-bg-[#495057] zt-shadow-[0_2px_12px_0_rgba(0,0,0,0.1)] zt-box-border'
const defaultTextClasses = 'zt-text-sm zt-text-white zt-whitespace-pre-wrap zt-break-words'
const defaultArrowSize = 5
const defaultArrowClasses = 'zt-absolute zt-border-solid zt-border-[#495057]'
const defaultMinArrowOffsetFromTooltipCorner = 6
const defaultZIndex = 1
const defaultShouldShow = true

// Tooltip config
let tooltipText: string
let tooltipPosition: TooltipPosition
let tooltipPositions: TooltipPositions
let tooltipOffsetFromSource: number
let tooltipOffsetFromViewport: number
let tooltipMinWidth: number
let tooltipMaxWidth: number
let tooltipBorderWidth: number
let tooltipClasses: string
let textClasses: string
let arrowSize: number
let arrowClasses: string
let arrowMinOffsetFromTooltipCorner: number
let zIndex: number
let shouldShow: boolean

// Tooltip elements
let anchorElement: HTMLElement
let tooltipTextElement: HTMLElement
let tooltipElement: HTMLElement

let isHovered = false

const ZeroTooltip = (globalConfig?: TooltipConfig): Directive => {
    return {
        mounted: (targetElement: HTMLElement, binding) => {
            setTooltipConfig(binding.value, globalConfig, binding.arg as TooltipPosition)
            initTooltip(targetElement)

            if (typeof(binding.value) !== 'string') {
                watch(binding.value, (newBindingValue) => {
                    setTooltipConfig(newBindingValue as string | TooltipLocalConfig, globalConfig, binding.arg as TooltipPosition)
                    initTooltip(targetElement)
                })
            }
        },

        updated: (targetElement: HTMLElement, binding) => {
            if (typeof(binding.value) === 'string') {
                setTooltipConfig(binding.value, globalConfig, binding.arg as TooltipPosition)
                initTooltip(targetElement)
            }
        }
    }
}

function setTooltipConfig(localConfig: string | TooltipLocalConfig, globalConfig?: TooltipConfig, position?: TooltipPosition) {
    tooltipText = getTooltipText(localConfig)

    if (typeof(localConfig) !== 'string') {
        tooltipPosition = position ?? localConfig.defaultPosition ?? globalConfig?.defaultPosition ?? defaultTooltipPosition;
        tooltipPositions =  {
            left: localConfig.positions?.left ?? globalConfig?.positions?.left ?? defaultTooltipPositions.left,
            top: localConfig.positions?.top ?? globalConfig?.positions?.top ?? defaultTooltipPositions.top,
            right: localConfig.positions?.right ?? globalConfig?.positions?.right ?? defaultTooltipPositions.right,
            bottom: localConfig.positions?.bottom ?? globalConfig?.positions?.bottom ?? defaultTooltipPositions.bottom,
        }
        tooltipOffsetFromSource = localConfig.offsetFromSource ?? globalConfig?.offsetFromSource ?? defaultTooltipOffsetFromSource
        tooltipOffsetFromViewport = localConfig.offsetFromViewport ?? globalConfig?.offsetFromViewport ?? defaultTooltipOffsetFromViewport
        tooltipMinWidth = localConfig.minWidth ?? globalConfig?.minWidth ?? defaultTooltipMinWidth
        tooltipMaxWidth = localConfig.maxWidth ?? globalConfig?.maxWidth ?? defaultTooltipMaxWidth
        tooltipBorderWidth = localConfig.tooltipBorderWidth ?? globalConfig?.tooltipBorderWidth ?? defaultTooltipBorderWidth
        tooltipClasses = tooltipElementClass + ' ' + defaultTooltipClasses + ' ' + (localConfig.tooltipClasses ?? globalConfig?.tooltipClasses ?? '')
        textClasses = textElementClass + ' ' + defaultTextClasses + ' ' + (localConfig.textClasses ?? globalConfig?.textClasses ?? '')
        arrowSize = localConfig.arrowSize ?? globalConfig?.arrowSize ?? defaultArrowSize
        arrowClasses = localConfig.arrowClasses ?? globalConfig?.arrowClasses ?? ''
        arrowMinOffsetFromTooltipCorner = localConfig.arrowMinOffsetFromTooltipCorner ?? globalConfig?.arrowMinOffsetFromTooltipCorner ?? defaultMinArrowOffsetFromTooltipCorner
        zIndex = localConfig.zIndex ?? globalConfig?.zIndex ?? defaultZIndex
        shouldShow = localConfig.show ?? defaultShouldShow
    }

    if (tooltipPosition === undefined) tooltipPosition = position ?? globalConfig?.defaultPosition ?? defaultTooltipPosition;
    if (tooltipPositions === undefined) tooltipPositions =  {
        left: globalConfig?.positions?.left ?? defaultTooltipPositions.left,
        top: globalConfig?.positions?.top ?? defaultTooltipPositions.top,
        right: globalConfig?.positions?.right ?? defaultTooltipPositions.right,
        bottom: globalConfig?.positions?.bottom ?? defaultTooltipPositions.bottom,
    }
    if (tooltipOffsetFromSource === undefined) tooltipOffsetFromSource = globalConfig?.offsetFromSource ?? defaultTooltipOffsetFromSource
    if (tooltipOffsetFromViewport === undefined) tooltipOffsetFromViewport = globalConfig?.offsetFromViewport ?? defaultTooltipOffsetFromViewport
    if (tooltipMinWidth === undefined) tooltipMinWidth = globalConfig?.minWidth ?? defaultTooltipMinWidth
    if (tooltipMaxWidth === undefined) tooltipMaxWidth = globalConfig?.maxWidth ?? defaultTooltipMaxWidth
    if (tooltipBorderWidth === undefined) tooltipBorderWidth = globalConfig?.tooltipBorderWidth ?? defaultTooltipBorderWidth
    if (tooltipClasses === undefined) tooltipClasses = tooltipElementClass + ' ' + defaultTooltipClasses + ' ' + globalConfig?.tooltipClasses ?? ''
    if (textClasses === undefined) textClasses = textElementClass + ' ' + defaultTextClasses + ' ' + globalConfig?.textClasses ?? ''
    if (arrowSize === undefined) arrowSize = globalConfig?.arrowSize ?? defaultArrowSize
    if (arrowClasses === undefined) arrowClasses = globalConfig?.arrowClasses ?? ''
    if (arrowMinOffsetFromTooltipCorner === undefined) arrowMinOffsetFromTooltipCorner = globalConfig?.arrowMinOffsetFromTooltipCorner ?? defaultMinArrowOffsetFromTooltipCorner
    if (zIndex === undefined) zIndex = globalConfig?.zIndex ?? defaultZIndex
    if (shouldShow === undefined) shouldShow = defaultShouldShow
}

function getTooltipText(localConfig: string | TooltipLocalConfig) {
    const tooltipText = typeof(localConfig) === 'string' ? localConfig : localConfig.content

    if (!tooltipText) {
        throw new Error("Please enter valid tooltip value");
    }

    return tooltipText
}

function initTooltip(targetElement: HTMLElement) {
    anchorElement = targetElement
    anchorElement.removeEventListener('mouseenter', onMouseEnter)
    anchorElement.removeEventListener('mouseleave', onMouseLeave)

    createTextElement()
    createTooltipElement()

    anchorElement.addEventListener('mouseenter', onMouseEnter)
    anchorElement.addEventListener('mouseleave', onMouseLeave)

    if (isHovered) {
        anchorElement.dispatchEvent(new Event('mouseleave'))
        anchorElement.dispatchEvent(new Event('mouseenter'))
    }
}

function createTextElement() {
    tooltipTextElement = document.createElement('p')
    tooltipTextElement.classList.add(...textClasses.trim().split(' '))
    tooltipTextElement.innerHTML = tooltipText
}

function createTooltipElement() {
   tooltipElement = document.createElement('div')
   tooltipElement.classList.add(...tooltipClasses.trim().split(' '))
   tooltipElement.style.borderWidth = `${tooltipBorderWidth}px`
   tooltipElement.appendChild(tooltipTextElement)
}

function onMouseEnter() {
    isHovered = true

    if (!shouldShow) return 

    const anchorElementRect = anchorElement.getBoundingClientRect()

    // Mount Tooltip element to body
    const body = document.querySelector('body')
    body?.appendChild(tooltipElement)

    // Find suitable Tooltip position
    let hasNeededDisplaySpace = false
    let currentTooltipPosition = tooltipPosition
    for (let i = 0; i < 4; i++) {
        currentTooltipPosition = tooltipPositions[tooltipPosition][i]

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

    if (hasNeededDisplaySpace) {
        drawArrow(anchorElementRect, currentTooltipPosition)

        tooltipElement.style.opacity = '1'
        tooltipElement.style.zIndex = zIndex.toString()

        handleHideOnScroll(anchorElement, () => hideTooltip())
        handleHideOnResize(anchorElement, () => hideTooltip())
    }
}

function onMouseLeave() {
    hideTooltip()
}

function tryMountTooltipOnLeft(anchorElementRect: DOMRect) {
    // Check if Tooltip has enough available horizontal space, top and bottom offset from viewport
    const tooltipAvailableMaxWidth = Math.min(anchorElementRect.left - tooltipOffsetFromSource - tooltipOffsetFromViewport, tooltipMaxWidth)
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

    // Check if anchor element is directly on right of Tooltip
    if (anchorElementRect.bottom < tooltipTop + arrowMinOffsetFromTooltipCorner * 2 
        || anchorElementRect.top > tooltipTop + tooltipElementRect.height - arrowMinOffsetFromTooltipCorner * 2) return false

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

    // Check if anchor element is directly on left of Tooltip
    if (anchorElementRect.bottom < tooltipTop + arrowMinOffsetFromTooltipCorner * 2 
        || anchorElementRect.top > tooltipTop + tooltipElementRect.height - arrowMinOffsetFromTooltipCorner * 2) return false

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

    // Check if anchor element is directly on below of Tooltip
    if (anchorElementRect.left > tooltipLeft + tooltipElementRect.width - arrowMinOffsetFromTooltipCorner * 2 
        || anchorElementRect.right < tooltipLeft + arrowMinOffsetFromTooltipCorner * 2) return false

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

    // Check if anchor element is directly on top of Tooltip
    if (anchorElementRect.left > tooltipLeft + tooltipElementRect.width - arrowMinOffsetFromTooltipCorner * 2 
        || anchorElementRect.right < tooltipLeft + arrowMinOffsetFromTooltipCorner * 2) return false

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

    // Adjusts arrow position by `x` pixels to handle browsers sometimes not rendering border in it's full width, e.g., 4.8px instead of 5px
    const arrowPositionAdjuster = 1;

    // Arrow top/left 0 is Tooltip top/left 0
    let arrowTop = 0
    let arrowLeft = 0

    let arrowClassForCorrectAngle = ''

    switch (currentTooltipPosition) {
        case "left": 
            arrowClassForCorrectAngle = '!zt-border-y-transparent !zt-border-r-transparent'
            arrowTop = anchorElementRect.top - tooltipElementRect.top + (anchorElementRect.height / 2) - arrowHalfLengthOfLongSide - tooltipBorderWidth
            arrowLeft = tooltipElementRect.width - tooltipBorderWidth - arrowPositionAdjuster
            break;
        case "top":
            arrowClassForCorrectAngle = '!zt-border-x-transparent !zt-border-b-transparent'
            arrowTop = tooltipElementRect.height - tooltipBorderWidth - arrowPositionAdjuster
            arrowLeft = anchorElementRect.left - tooltipElementRect.left + (anchorElementRect.width / 2) - arrowHalfLengthOfLongSide - tooltipBorderWidth
            break;
        case "right":
            arrowClassForCorrectAngle = '!zt-border-y-transparent !zt-border-l-transparent'
            arrowTop = anchorElementRect.top - tooltipElementRect.top + (anchorElementRect.height / 2) - arrowHalfLengthOfLongSide - tooltipBorderWidth
            arrowLeft = (-arrowSize * 2) - tooltipBorderWidth + arrowPositionAdjuster
            break;
        case "bottom":
            arrowClassForCorrectAngle = '!zt-border-x-transparent !zt-border-t-transparent'
            arrowTop = (-arrowSize * 2) - tooltipBorderWidth + arrowPositionAdjuster
            arrowLeft = anchorElementRect.left - tooltipElementRect.left + (anchorElementRect.width / 2) - arrowHalfLengthOfLongSide - tooltipBorderWidth
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
    const adjustedArrowClasses = arrowElementClass + ' ' + defaultArrowClasses + ' ' + arrowClassForCorrectAngle + ' ' + arrowClasses

    arrowElement.classList.add(...adjustedArrowClasses.trim().split(' '))
    
    // Set Arrow element size and position
    arrowElement.style.top = `${arrowTop}px`
    arrowElement.style.left = `${arrowLeft}px`
    arrowElement.style.borderWidth = `${arrowSize}px`

    // Mount Arrow element
    document.querySelector(`.${tooltipElementClass}`)?.appendChild(arrowElement)
}

function isArrowPositionWithinLimits(currentTooltipPosition: TooltipPosition, tooltipElementRect: DOMRect, arrowPosition: number) {
    switch (currentTooltipPosition) {
        case "left":
        case "right":
            return arrowPosition > arrowMinOffsetFromTooltipCorner - tooltipBorderWidth
                    && arrowPosition < tooltipElementRect.height + tooltipBorderWidth - arrowMinOffsetFromTooltipCorner - (arrowSize * 2)
        case "top":
        case "bottom":
            return arrowPosition > arrowMinOffsetFromTooltipCorner - tooltipBorderWidth
                    && arrowPosition < tooltipElementRect.width + tooltipBorderWidth - arrowMinOffsetFromTooltipCorner - (arrowSize * 2)
    }
}

function getArrowPositionMinLimit(currentTooltipPosition: TooltipPosition, tooltipElementRect: DOMRect, arrowPosition: number) {
    switch (currentTooltipPosition) {
        case "left":
        case "right":
            if (arrowPosition < arrowMinOffsetFromTooltipCorner - tooltipBorderWidth) {
                // Arrow too close to viewport top
                return arrowMinOffsetFromTooltipCorner - tooltipBorderWidth
            } else {
                // Arrow too close to viewport bottom
                return tooltipElementRect.height - tooltipBorderWidth - arrowMinOffsetFromTooltipCorner - (arrowSize * 2)
            }
        case "top":
        case "bottom":
            if (arrowPosition < arrowMinOffsetFromTooltipCorner - tooltipBorderWidth) {
                // Arrow too close to viewport left
                return arrowMinOffsetFromTooltipCorner - tooltipBorderWidth
            } else {
                // Arrow too close to viewport right
                return tooltipElementRect.width - tooltipBorderWidth - arrowMinOffsetFromTooltipCorner - (arrowSize * 2)
            }
    }
}

function hideTooltip() {
    const tooltipElement = document.querySelector(`.${tooltipElementClass}`)

    if (tooltipElement && tooltipElement instanceof HTMLElement) {
        resetResizeReferences()

        // Remove Arrow element from Tooltip, because it needs to be rebuilt every time Tooltip is showed again
        tooltipElement.querySelector(`.${arrowElementClass}`)?.remove()
    
        // Reset position so that old position does not effect new position (when zooming old position could be off screen)
        tooltipElement.style.left = '0'
        tooltipElement.style.top = '0'
    
        tooltipElement.remove()
    }

    isHovered = false
}

export default ZeroTooltip