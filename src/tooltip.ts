import { Directive, isReactive, watch } from "vue"
import { v4 as uuidv4 } from 'uuid'
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

const defaultAppendTo: string = 'body'
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

const tooltips: {[key: string]: ReturnType<typeof initTooltip>} = {}

const ZeroTooltip = (globalConfig?: TooltipConfig): Directive => {
    return {
        created: (targetElement: HTMLElement, binding, vnode) => {
            const uuid = uuidv4()
            vnode.el.$_tooltip = { uuid: uuid } 

            buildTooltip(binding.value, globalConfig, binding.arg, targetElement, uuid)

            if (typeof(binding.value) !== 'string' && isReactive(binding.value)) {
                watch(binding.value, (newBindingValue) => {
                    if (tooltips[uuid]) {
                        destroyTooltip(tooltips[uuid])
                    }

                    buildTooltip(newBindingValue, globalConfig, binding.arg, targetElement, uuid)
                })
            }
        },

        updated: (targetElement: HTMLElement, binding, vnode) => {
            const uuid = vnode.el.$_tooltip.uuid

            if (tooltips[uuid]) {
                destroyTooltip(tooltips[uuid])
            }

            buildTooltip(binding.value, globalConfig, binding.arg, targetElement, uuid)
        },

        beforeUnmount: (_, __, vnode) => {
            const uuid = vnode.el.$_tooltip.uuid

            if (tooltips[uuid]) {
                destroyTooltip(tooltips[uuid])
            }
        }
    }
}

function buildTooltip(bindingValue: any, globalConfig: TooltipConfig | undefined, bindingArgument: string | undefined, targetElement: HTMLElement, uuid: string) {
    let tooltipConfig = getTooltipConfig(bindingValue as string | TooltipLocalConfig, globalConfig, bindingArgument as TooltipPosition)
    const tooltip = initTooltip(targetElement, tooltipConfig, uuid)

    tooltips[uuid] = tooltip

    if (targetElement.matches(':hover')) {
        targetElement.dispatchEvent(new Event('mouseenter'))
    }
}

function getTooltipConfig(localConfig: string | TooltipLocalConfig, globalConfig?: TooltipConfig, position?: TooltipPosition) {
    // Tooltip config
    let appendTo: string | undefined
    let tooltipText: string | undefined
    let tooltipPosition: TooltipPosition | undefined
    let tooltipPositions: TooltipPositions | undefined
    let tooltipOffsetFromSource: number | undefined
    let tooltipOffsetFromViewport: number | undefined
    let tooltipMinWidth: number | undefined
    let tooltipMaxWidth: number | undefined
    let tooltipBorderWidth: number | undefined
    let tooltipClasses: string | undefined
    let textClasses: string | undefined
    let arrowSize: number | undefined
    let arrowClasses: string | undefined
    let arrowMinOffsetFromTooltipCorner: number | undefined
    let zIndex: number | undefined
    let shouldShow: boolean | undefined

    tooltipText = getTooltipText(localConfig)

    // Check if local config is defined
    if (typeof(localConfig) !== 'string') {
        appendTo = localConfig.appendTo ?? globalConfig?.appendTo ?? defaultAppendTo;
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

    // If values were not not defined by localConfig, assign either globalConfig or default value
    if (appendTo === undefined) appendTo = globalConfig?.appendTo ?? defaultAppendTo;
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
    if (tooltipClasses === undefined) tooltipClasses = tooltipElementClass + ' ' + defaultTooltipClasses + ' ' + (globalConfig?.tooltipClasses ?? '')
    if (textClasses === undefined) textClasses = textElementClass + ' ' + defaultTextClasses + ' ' + (globalConfig?.textClasses ?? '')
    if (arrowSize === undefined) arrowSize = globalConfig?.arrowSize ?? defaultArrowSize
    if (arrowClasses === undefined) arrowClasses = globalConfig?.arrowClasses ?? ''
    if (arrowMinOffsetFromTooltipCorner === undefined) arrowMinOffsetFromTooltipCorner = globalConfig?.arrowMinOffsetFromTooltipCorner ?? defaultMinArrowOffsetFromTooltipCorner
    if (zIndex === undefined) zIndex = globalConfig?.zIndex ?? defaultZIndex
    if (shouldShow === undefined) shouldShow = defaultShouldShow

    return {
        appendTo,
        tooltipText,
        tooltipPosition,
        tooltipPositions,
        tooltipOffsetFromSource,
        tooltipOffsetFromViewport,
        tooltipMinWidth,
        tooltipMaxWidth,
        tooltipBorderWidth,
        tooltipClasses,
        textClasses,
        arrowSize,
        arrowClasses,
        arrowMinOffsetFromTooltipCorner,
        zIndex,
        shouldShow
    }
}

function getTooltipText(localConfig: string | TooltipLocalConfig) {
    const tooltipText = typeof(localConfig) === 'string' ? localConfig : localConfig.content

    if (!tooltipText) {
        throw new Error("Please enter valid tooltip value");
    }

    return tooltipText
}

function initTooltip(targetElement: HTMLElement, tooltipConfig: ReturnType<typeof getTooltipConfig>, uuid: string) {
    let anchorElement = targetElement

    let tooltipTextElement = createTextElement(tooltipConfig.textClasses, tooltipConfig.tooltipText)
    let tooltipElement = createTooltipElement(tooltipConfig.tooltipClasses, tooltipConfig.tooltipBorderWidth)
    tooltipElement.append(tooltipTextElement)
    tooltipElement.dataset.uuid = uuid

    const mouseEnterEventController = new AbortController()
    const mouseLeaveEventController = new AbortController()

    anchorElement.addEventListener('mouseenter', () => onMouseEnter(anchorElement, tooltipConfig, tooltipElement, uuid), { signal: mouseEnterEventController.signal})
    anchorElement.addEventListener('mouseleave', () => onMouseLeave(uuid), { signal: mouseLeaveEventController.signal})

    return {
        anchorElement,
        tooltipConfig,
        tooltipElement,
        mouseEnterEventController,
        mouseLeaveEventController
    }
}

function createTextElement(textClasses: string, tooltipText: string) {
    let tooltipTextElement = document.createElement('p')
    tooltipTextElement.classList.add(...textClasses.trim().split(' '))
    tooltipTextElement.innerHTML = tooltipText

    return tooltipTextElement
}

function createTooltipElement(tooltipClasses: string, tooltipBorderWidth: number) {
   let tooltipElement = document.createElement('div')
   tooltipElement.classList.add(...tooltipClasses.trim().split(' '))
   tooltipElement.style.borderWidth = `${tooltipBorderWidth}px`

   return tooltipElement
}

function onMouseEnter(
        anchorElement: HTMLElement, 
        tooltipConfig: ReturnType<typeof getTooltipConfig>, 
        tooltipElement: HTMLDivElement,
        uuid: string
    ) {
    if (!tooltipConfig.shouldShow) return 

    const anchorElementRect = anchorElement.getBoundingClientRect()

    // Mount Tooltip element to target element (default is `body`)
    const appendToTarget = document.querySelector(tooltipConfig.appendTo)
    appendToTarget?.appendChild(tooltipElement)

    // Find suitable Tooltip position
    let hasNeededDisplaySpace = false
    let currentTooltipPosition = tooltipConfig.tooltipPosition
    for (let i = 0; i < 4; i++) {
        currentTooltipPosition = tooltipConfig.tooltipPositions[tooltipConfig.tooltipPosition][i]

        if (currentTooltipPosition === 'left') {
            hasNeededDisplaySpace = tryMountTooltipOnLeft(anchorElementRect, tooltipConfig, tooltipElement)
        } else if (currentTooltipPosition === 'top') {
            hasNeededDisplaySpace = tryMountTooltipOnTop(anchorElementRect, tooltipConfig, tooltipElement)
        } else if (currentTooltipPosition === 'right') {
            hasNeededDisplaySpace = tryMountTooltipOnRight(anchorElementRect, tooltipConfig, tooltipElement)
        } else if (currentTooltipPosition === 'bottom') {
            hasNeededDisplaySpace = tryMountTooltipOnBottom(anchorElementRect, tooltipConfig, tooltipElement)
        }

        if (hasNeededDisplaySpace) break
    }

    if (hasNeededDisplaySpace) {
        drawArrow(anchorElementRect, currentTooltipPosition, tooltipConfig, tooltipElement)

        tooltipElement.style.opacity = '1'
        tooltipElement.style.zIndex = tooltipConfig.zIndex.toString()

        handleHideOnScroll(anchorElement, () => hideTooltip(uuid))
        handleHideOnResize(anchorElement, () => hideTooltip(uuid))
    }
}

function onMouseLeave(uuid: string) {
    hideTooltip(uuid)
}

function tryMountTooltipOnLeft(anchorElementRect: DOMRect, tooltipConfig: ReturnType<typeof getTooltipConfig>, tooltipElement: HTMLDivElement) {
    // Check if Tooltip has enough available horizontal space, top and bottom offset from viewport
    const tooltipAvailableMaxWidth = Math.min(anchorElementRect.left - tooltipConfig.tooltipOffsetFromSource - tooltipConfig.tooltipOffsetFromViewport, tooltipConfig.tooltipMaxWidth)
    const isAnchorElementTopLowerThanOffsetFromViewport = anchorElementRect.top >= tooltipConfig.tooltipOffsetFromViewport
    const isAnchorElementBottomHigherThanOffsetFromViewport = (window.innerHeight - anchorElementRect.bottom) >= tooltipConfig.tooltipOffsetFromViewport

    if (tooltipAvailableMaxWidth < tooltipConfig.tooltipMinWidth || !isAnchorElementTopLowerThanOffsetFromViewport || !isAnchorElementBottomHigherThanOffsetFromViewport) return false

    // Set Tooltip maxWidth
    tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

    // Calculate Tooltip position
    const tooltipElementRect = tooltipElement.getBoundingClientRect()
    let tooltipTop = anchorElementRect.top + (anchorElementRect.height / 2) - (tooltipElementRect.height / 2)
    
    if (tooltipTop < tooltipConfig.tooltipOffsetFromViewport) {
        tooltipTop = tooltipConfig.tooltipOffsetFromViewport
    } else if (tooltipTop + tooltipElementRect.height > window.innerHeight - tooltipConfig.tooltipOffsetFromViewport) {
        tooltipTop = window.innerHeight - tooltipConfig.tooltipOffsetFromViewport - tooltipElementRect.height
    }

    const tooltipLeft = anchorElementRect.left - tooltipConfig.tooltipOffsetFromSource - tooltipElementRect.width

    // Check if anchor element is directly on right of Tooltip
    if (anchorElementRect.bottom < tooltipTop + tooltipConfig.arrowMinOffsetFromTooltipCorner * 2 
        || anchorElementRect.top > tooltipTop + tooltipElementRect.height - tooltipConfig.arrowMinOffsetFromTooltipCorner * 2) return false

    // Set Tooltip position
    tooltipElement.style.top = `${tooltipTop}px`
    tooltipElement.style.left = `${tooltipLeft}px`

    return true
}

function tryMountTooltipOnRight(anchorElementRect: DOMRect, tooltipConfig: ReturnType<typeof getTooltipConfig>, tooltipElement: HTMLDivElement) {
    // Check if Tooltip has enough available horizontal space, top and bottom offset from viewport
    const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (anchorElementRect.right + tooltipConfig.tooltipOffsetFromSource) - tooltipConfig.tooltipOffsetFromViewport, tooltipConfig.tooltipMaxWidth)
    const isAnchorElementTopLowerThanOffsetFromViewport = anchorElementRect.top >= tooltipConfig.tooltipOffsetFromViewport
    const isAnchorElementBottomHigherThanOffsetFromViewport = (window.innerHeight - anchorElementRect.bottom) >= tooltipConfig.tooltipOffsetFromViewport

    if (tooltipAvailableMaxWidth < tooltipConfig.tooltipMinWidth || !isAnchorElementTopLowerThanOffsetFromViewport || !isAnchorElementBottomHigherThanOffsetFromViewport) return false
    
    // Set tooltip maxWidth
    tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

    // Calculate Tooltip position
    const tooltipElementRect = tooltipElement.getBoundingClientRect()

    let tooltipTop = anchorElementRect.top + (anchorElementRect.height / 2) - (tooltipElementRect.height / 2)
    
    if (tooltipTop < tooltipConfig.tooltipOffsetFromViewport) {
        tooltipTop = tooltipConfig.tooltipOffsetFromViewport
    } else if (tooltipTop + tooltipElementRect.height > window.innerHeight - tooltipConfig.tooltipOffsetFromViewport) {
        tooltipTop = window.innerHeight - tooltipConfig.tooltipOffsetFromViewport - tooltipElementRect.height
    }

    const tooltipLeft = anchorElementRect.right + tooltipConfig.tooltipOffsetFromSource

    // Check if anchor element is directly on left of Tooltip
    if (anchorElementRect.bottom < tooltipTop + tooltipConfig.arrowMinOffsetFromTooltipCorner * 2 
        || anchorElementRect.top > tooltipTop + tooltipElementRect.height - tooltipConfig.arrowMinOffsetFromTooltipCorner * 2) return false

    // Set Tooltip position
    tooltipElement.style.top = `${tooltipTop}px`
    tooltipElement.style.left = `${tooltipLeft}px`

    return true
}

function tryMountTooltipOnTop(anchorElementRect: DOMRect, tooltipConfig: ReturnType<typeof getTooltipConfig>, tooltipElement: HTMLDivElement) {
    // Calculate and set Tooltip width
    const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (tooltipConfig.tooltipOffsetFromViewport * 2), tooltipConfig.tooltipMaxWidth)
    tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

    // Calculate Tooltip top position
    const tooltipElementRect = tooltipElement.getBoundingClientRect()
    let tooltipTop = anchorElementRect.top - tooltipConfig.tooltipOffsetFromSource - tooltipElementRect.height

    // Check if Tooltip has enough available on top 
    if (tooltipTop < tooltipConfig.tooltipOffsetFromViewport) return false

    // Calculate Tooltip left position
    let tooltipLeft = anchorElementRect.left + (anchorElementRect.width / 2) - (tooltipElementRect.width / 2)

    if (tooltipLeft < tooltipConfig.tooltipOffsetFromViewport) {
        tooltipLeft = tooltipConfig.tooltipOffsetFromViewport
    } else if (tooltipLeft + tooltipElementRect.width > window.innerWidth - tooltipConfig.tooltipOffsetFromViewport) {
        tooltipLeft = window.innerWidth - tooltipConfig.tooltipOffsetFromViewport - tooltipElementRect.width
    }

    // Check if anchor element is directly on below of Tooltip
    if (anchorElementRect.left > tooltipLeft + tooltipElementRect.width - tooltipConfig.arrowMinOffsetFromTooltipCorner * 2 
        || anchorElementRect.right < tooltipLeft + tooltipConfig.arrowMinOffsetFromTooltipCorner * 2) return false

    // Set Tooltip position
    tooltipElement.style.top = `${tooltipTop}px`
    tooltipElement.style.left = `${tooltipLeft}px`

    return true
}

function tryMountTooltipOnBottom(anchorElementRect: DOMRect, tooltipConfig: ReturnType<typeof getTooltipConfig>, tooltipElement: HTMLDivElement) {
    // Calculate and set Tooltip width
    const tooltipAvailableMaxWidth = Math.min(window.innerWidth - (tooltipConfig.tooltipOffsetFromViewport * 2), tooltipConfig.tooltipMaxWidth)
    tooltipElement.style.maxWidth = `${tooltipAvailableMaxWidth}px`

    // Calculate Tooltip top position
    const tooltipElementRect = tooltipElement.getBoundingClientRect()
    let tooltipTop = anchorElementRect.bottom + tooltipConfig.tooltipOffsetFromSource 

    // Check if Tooltip has enough available on bottom 
    if (tooltipTop + tooltipElementRect.height > window.innerHeight - tooltipConfig.tooltipOffsetFromViewport) return false
    
    // Calculate Tooltip left position
    let tooltipLeft = anchorElementRect.left + (anchorElementRect.width / 2) - (tooltipElementRect.width / 2)

    if (tooltipLeft < tooltipConfig.tooltipOffsetFromViewport) {
        tooltipLeft = tooltipConfig.tooltipOffsetFromViewport
    } else if (tooltipLeft + tooltipElementRect.width > window.innerWidth - tooltipConfig.tooltipOffsetFromViewport) {
        tooltipLeft = window.innerWidth - tooltipConfig.tooltipOffsetFromViewport - tooltipElementRect.width
    }

    // Check if anchor element is directly on top of Tooltip
    if (anchorElementRect.left > tooltipLeft + tooltipElementRect.width - tooltipConfig.arrowMinOffsetFromTooltipCorner * 2 
        || anchorElementRect.right < tooltipLeft + tooltipConfig.arrowMinOffsetFromTooltipCorner * 2) return false

    // Set Tooltip position
    tooltipElement.style.top = `${tooltipTop}px`
    tooltipElement.style.left = `${tooltipLeft}px`

    return true
}

function drawArrow(anchorElementRect: DOMRect, currentTooltipPosition: TooltipPosition, tooltipConfig: ReturnType<typeof getTooltipConfig>, tooltipElement: HTMLDivElement) {
    // Create Arrow element
    const arrowElement = document.createElement('div')

    // Calculate Arrow element size, positions and style/angle classes
    const tooltipElementRect = tooltipElement.getBoundingClientRect()
    const arrowHalfLengthOfLongSide = Math.sin(45 * (180 / Math.PI)) * tooltipConfig.arrowSize

    // Adjusts arrow position by `x` pixels to handle browsers sometimes not rendering border in it's full width, e.g., 4.8px instead of 5px
    const arrowPositionAdjuster = 1;

    // Arrow top/left 0 is Tooltip top/left 0
    let arrowTop = 0
    let arrowLeft = 0

    let arrowClassForCorrectAngle = ''

    switch (currentTooltipPosition) {
        case "left": 
            arrowClassForCorrectAngle = '!zt-border-y-transparent !zt-border-r-transparent'
            arrowTop = anchorElementRect.top - tooltipElementRect.top + (anchorElementRect.height / 2) - arrowHalfLengthOfLongSide - tooltipConfig.tooltipBorderWidth
            arrowLeft = tooltipElementRect.width - tooltipConfig.tooltipBorderWidth - arrowPositionAdjuster
            break;
        case "top":
            arrowClassForCorrectAngle = '!zt-border-x-transparent !zt-border-b-transparent'
            arrowTop = tooltipElementRect.height - tooltipConfig.tooltipBorderWidth - arrowPositionAdjuster
            arrowLeft = anchorElementRect.left - tooltipElementRect.left + (anchorElementRect.width / 2) - arrowHalfLengthOfLongSide - tooltipConfig.tooltipBorderWidth
            break;
        case "right":
            arrowClassForCorrectAngle = '!zt-border-y-transparent !zt-border-l-transparent'
            arrowTop = anchorElementRect.top - tooltipElementRect.top + (anchorElementRect.height / 2) - arrowHalfLengthOfLongSide - tooltipConfig.tooltipBorderWidth
            arrowLeft = (-tooltipConfig.arrowSize * 2) - tooltipConfig.tooltipBorderWidth + arrowPositionAdjuster
            break;
        case "bottom":
            arrowClassForCorrectAngle = '!zt-border-x-transparent !zt-border-t-transparent'
            arrowTop = (-tooltipConfig.arrowSize * 2) - tooltipConfig.tooltipBorderWidth + arrowPositionAdjuster
            arrowLeft = anchorElementRect.left - tooltipElementRect.left + (anchorElementRect.width / 2) - arrowHalfLengthOfLongSide - tooltipConfig.tooltipBorderWidth
            break;
    }               

    if (currentTooltipPosition === 'left' || currentTooltipPosition === 'right') {
        if (!isArrowPositionWithinLimits(currentTooltipPosition, tooltipElementRect, arrowTop, tooltipConfig)) {
            arrowTop = getArrowPositionMinLimit(currentTooltipPosition, tooltipElementRect, arrowTop, tooltipConfig)
        }
    } else {
        if (!isArrowPositionWithinLimits(currentTooltipPosition, tooltipElementRect, arrowLeft, tooltipConfig)) {
            arrowLeft = getArrowPositionMinLimit(currentTooltipPosition, tooltipElementRect, arrowLeft, tooltipConfig)
        }
    }

    // Set Arrow element id, styling/angle
    const adjustedArrowClasses = arrowElementClass + ' ' + defaultArrowClasses + ' ' + arrowClassForCorrectAngle + ' ' + tooltipConfig.arrowClasses

    arrowElement.classList.add(...adjustedArrowClasses.trim().split(' '))
    
    // Set Arrow element size and position
    arrowElement.style.top = `${arrowTop}px`
    arrowElement.style.left = `${arrowLeft}px`
    arrowElement.style.borderWidth = `${tooltipConfig.arrowSize}px`

    // Mount Arrow element
    document.querySelector(`.${tooltipElementClass}`)?.appendChild(arrowElement)
}

function isArrowPositionWithinLimits(currentTooltipPosition: TooltipPosition, tooltipElementRect: DOMRect, arrowPosition: number, tooltipConfig: ReturnType<typeof getTooltipConfig>) {
    switch (currentTooltipPosition) {
        case "left":
        case "right":
            return arrowPosition > tooltipConfig.arrowMinOffsetFromTooltipCorner - tooltipConfig.tooltipBorderWidth
                    && arrowPosition < tooltipElementRect.height + tooltipConfig.tooltipBorderWidth - tooltipConfig.arrowMinOffsetFromTooltipCorner - (tooltipConfig.arrowSize * 2)
        case "top":
        case "bottom":
            return arrowPosition > tooltipConfig.arrowMinOffsetFromTooltipCorner - tooltipConfig.tooltipBorderWidth
                    && arrowPosition < tooltipElementRect.width + tooltipConfig.tooltipBorderWidth - tooltipConfig.arrowMinOffsetFromTooltipCorner - (tooltipConfig.arrowSize * 2)
    }
}

function getArrowPositionMinLimit(currentTooltipPosition: TooltipPosition, tooltipElementRect: DOMRect, arrowPosition: number, tooltipConfig: ReturnType<typeof getTooltipConfig>) {
    switch (currentTooltipPosition) {
        case "left":
        case "right":
            if (arrowPosition < tooltipConfig.arrowMinOffsetFromTooltipCorner - tooltipConfig.tooltipBorderWidth) {
                // Arrow too close to viewport top
                return tooltipConfig.arrowMinOffsetFromTooltipCorner - tooltipConfig.tooltipBorderWidth
            } else {
                // Arrow too close to viewport bottom
                return tooltipElementRect.height - tooltipConfig.tooltipBorderWidth - tooltipConfig.arrowMinOffsetFromTooltipCorner - (tooltipConfig.arrowSize * 2)
            }
        case "top":
        case "bottom":
            if (arrowPosition < tooltipConfig.arrowMinOffsetFromTooltipCorner - tooltipConfig.tooltipBorderWidth) {
                // Arrow too close to viewport left
                return tooltipConfig.arrowMinOffsetFromTooltipCorner - tooltipConfig.tooltipBorderWidth
            } else {
                // Arrow too close to viewport right
                return tooltipElementRect.width - tooltipConfig.tooltipBorderWidth - tooltipConfig.arrowMinOffsetFromTooltipCorner - (tooltipConfig.arrowSize * 2)
            }
    }
}

function hideTooltip(uuid: string) {
    const shownTooltipElement = document.querySelector(`.${tooltipElementClass}`)
    const currentTooltipElement = tooltips[uuid]?.tooltipElement

    if (currentTooltipElement && shownTooltipElement && shownTooltipElement instanceof HTMLElement && shownTooltipElement === currentTooltipElement) {
        resetResizeReferences()

        // Remove Arrow element from Tooltip, because it needs to be rebuilt every time Tooltip is showed again
        shownTooltipElement.querySelector(`.${arrowElementClass}`)?.remove()
    
        // Reset position so that old position does not effect new position (when zooming old position could be off screen)
        shownTooltipElement.style.left = '0'
        shownTooltipElement.style.top = '0'
    
        shownTooltipElement.remove()
    }
}

function destroyTooltip(tooltip: ReturnType<typeof initTooltip>) {
    const uuid = tooltip.tooltipElement.dataset.uuid

    if (uuid) {
        hideTooltip(uuid)
        delete tooltips[uuid]
    }

    tooltip.mouseEnterEventController.abort()
    tooltip.mouseLeaveEventController.abort()
}

export default ZeroTooltip
