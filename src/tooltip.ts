import { Directive, isReactive, watch } from "vue"
import { v4 as uuidv4 } from 'uuid'
import TooltipConfig from "./types/tooltipConfig"
import TooltipPosition from "./types/tooltipPosition"
import TooltipPositions from "./types/tooltipPositions"
import TooltipLocalConfig from "./types/tooltipLocalConfig"
import useHideOnScroll from './composables/useHideOnScroll'
import useHideOnResize from "./composables/useHideOnResize"
import useRepositionOnResize from "./composables/useRepositionOnResize"

const { handleHideOnScroll, removeHideOnScrollListeners } = useHideOnScroll()
const { handleHideOnResize, resetResizeReferences } = useHideOnResize()
const { handleRepositionOnResize, removeRepositionOnResizeHandler } = useRepositionOnResize()

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
const defaultShowDelay = 0
const defaultHideDelay = 0
const defaultAlwaysOn = false
const defaultShowWarnings = true

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
    let appendTo = globalConfig?.appendTo ?? defaultAppendTo
    let tooltipText = getTooltipText(localConfig)
    let tooltipPosition = position ?? globalConfig?.defaultPosition ?? defaultTooltipPosition
    let tooltipPositions: TooltipPositions = {
        left: globalConfig?.positions?.left ?? defaultTooltipPositions.left,
        top: globalConfig?.positions?.top ?? defaultTooltipPositions.top,
        right: globalConfig?.positions?.right ?? defaultTooltipPositions.right,
        bottom: globalConfig?.positions?.bottom ?? defaultTooltipPositions.bottom,
    }
    let tooltipOffsetFromSource = globalConfig?.offsetFromSource ?? defaultTooltipOffsetFromSource
    let tooltipOffsetFromViewport = globalConfig?.offsetFromViewport ?? defaultTooltipOffsetFromViewport
    let tooltipMinWidth = globalConfig?.minWidth ?? defaultTooltipMinWidth
    let tooltipMaxWidth = globalConfig?.maxWidth ?? defaultTooltipMaxWidth
    let tooltipBorderWidth = globalConfig?.tooltipBorderWidth ?? defaultTooltipBorderWidth
    let tooltipClasses = tooltipElementClass + ' ' + defaultTooltipClasses + ' ' + (globalConfig?.tooltipClasses ?? '')
    let textClasses = textElementClass + ' ' + defaultTextClasses + ' ' + (globalConfig?.textClasses ?? '')
    let arrowSize = globalConfig?.arrowSize ?? defaultArrowSize
    let arrowClasses = globalConfig?.arrowClasses ?? ''
    let arrowMinOffsetFromTooltipCorner = globalConfig?.arrowMinOffsetFromTooltipCorner ?? defaultMinArrowOffsetFromTooltipCorner
    let zIndex = globalConfig?.zIndex ?? defaultZIndex
    let shouldShow = defaultShouldShow
    let showDelay = globalConfig?.showDelay ?? defaultShowDelay
    let hideDelay = globalConfig?.hideDelay ?? defaultHideDelay
    let alwaysOn = defaultAlwaysOn
    let showWarnings = globalConfig?.showWarnings ?? defaultShowWarnings

    // Check if local config is defined (it's defined when local config is Object and not a string, because string means that just Tooltip text is given)
    if (typeof(localConfig) !== 'string') {
        if (localConfig.appendTo !== undefined) appendTo = localConfig.appendTo
        if (position === undefined && localConfig.defaultPosition !== undefined) tooltipPosition = localConfig.defaultPosition

        if (localConfig.positions?.left !== undefined) tooltipPositions.left = localConfig.positions.left
        if (localConfig.positions?.top !== undefined) tooltipPositions.top = localConfig.positions.top
        if (localConfig.positions?.right !== undefined) tooltipPositions.right = localConfig.positions.right
        if (localConfig.positions?.bottom !== undefined) tooltipPositions.bottom = localConfig.positions.bottom

        if (localConfig.offsetFromSource !== undefined) tooltipOffsetFromSource = localConfig.offsetFromSource
        if (localConfig.offsetFromViewport !== undefined) tooltipOffsetFromViewport = localConfig.offsetFromViewport
        if (localConfig.minWidth !== undefined) tooltipMinWidth = localConfig.minWidth
        if (localConfig.maxWidth !== undefined) tooltipMaxWidth = localConfig.maxWidth
        if (localConfig.tooltipBorderWidth !== undefined) tooltipBorderWidth = localConfig.tooltipBorderWidth
        if (localConfig.tooltipClasses !== undefined) tooltipClasses = tooltipElementClass + ' ' + defaultTooltipClasses + ' ' + localConfig.tooltipClasses
        if (localConfig.textClasses !== undefined) textClasses = textElementClass + ' ' + defaultTextClasses + ' ' + localConfig.textClasses
        if (localConfig.arrowSize !== undefined) arrowSize = localConfig.arrowSize
        if (localConfig.arrowClasses !== undefined) arrowClasses = localConfig.arrowClasses
        if (localConfig.arrowMinOffsetFromTooltipCorner !== undefined) arrowMinOffsetFromTooltipCorner = localConfig.arrowMinOffsetFromTooltipCorner
        if (localConfig.zIndex !== undefined) zIndex = localConfig.zIndex
        if (localConfig.showDelay !== undefined) showDelay = localConfig.showDelay
        if (localConfig.hideDelay !== undefined) hideDelay = localConfig.hideDelay
        if (localConfig.alwaysOn !== undefined) {
            shouldShow = false
            alwaysOn = localConfig.alwaysOn
        } 

        if (localConfig.show !== undefined) shouldShow = localConfig.show
    }

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
        shouldShow,
        showDelay,
        hideDelay,
        alwaysOn,
        showWarnings,
    }
}

function getTooltipText(localConfig: string | TooltipLocalConfig) {
    if (localConfig === undefined || localConfig === null) {
        return ''
    }

    if (typeof(localConfig) === 'string') {
        return localConfig
    }

    if (Object.hasOwn(localConfig, 'content')) {
        if (localConfig.content === undefined || localConfig.content === null) {
            return ''
        }

        if (typeof(localConfig.content) === 'string') {
            return localConfig.content
        }
    }

    throw new Error("Tooltip text or 'content' option must be defined with correct type")
}

function initTooltip(targetElement: HTMLElement, tooltipConfig: ReturnType<typeof getTooltipConfig>, uuid: string) {
    let anchorElement = targetElement

    // Create Tooltip element
    let tooltipTextElement = createTextElement(tooltipConfig.textClasses, tooltipConfig.tooltipText)
    let tooltipElement = createTooltipContainerElement(tooltipConfig.tooltipClasses, tooltipConfig.tooltipBorderWidth)
    tooltipElement.append(tooltipTextElement)
    tooltipElement.dataset.uuid = uuid

    const mouseEventState = {
        currentInstanceId: Date.now(),
        isHoveringOverAnchorElement: false,
        lastTooltipMouseLeaveTimestamp: 0,
    }

    const mouseEnterEventControllers = {
        anchorElementMouseEnter: new AbortController(),
        anchorElementMouseLeave: new AbortController(),
        tooltipElementMouseEnter: new AbortController(),
        tooltipElementMouseLeave: new AbortController(),
    }

    if (tooltipConfig.tooltipText === '') {
        if (tooltipConfig.shouldShow && tooltipConfig.showWarnings) console.warn('Tooltip text is empty')
    } else if (tooltipConfig.alwaysOn) {
        setTimeout(() => { 
            mountTooltipElement(anchorElement, tooltipConfig, tooltipElement, 'absolute')
            handleRepositionOnResize(uuid, () => repositionTooltipElement(anchorElement, tooltipConfig, tooltipElement, 'absolute'))
        }, 0)
    } else {
        anchorElement.addEventListener('mouseenter', () => onMouseEnter(anchorElement, tooltipConfig, tooltipElement, uuid), { signal: mouseEnterEventControllers.anchorElementMouseEnter.signal })
        anchorElement.addEventListener('mouseleave', () => onMouseLeave(tooltipConfig, uuid), { signal: mouseEnterEventControllers.anchorElementMouseLeave.signal })

        tooltipElement.addEventListener('mouseenter', () => onMouseEnter(anchorElement, tooltipConfig, tooltipElement, uuid, { isTooltip: true }), { signal: mouseEnterEventControllers.tooltipElementMouseEnter.signal })
        tooltipElement.addEventListener('mouseleave', () => onMouseLeave(tooltipConfig, uuid, { isTooltip: true }), { signal: mouseEnterEventControllers.tooltipElementMouseLeave.signal })
    }

    return {
        anchorElement,
        tooltipConfig,
        tooltipElement,
        mouseEnterEventControllers,
        mouseEventState,
    }
}

function createTextElement(textClasses: string, tooltipText: string) {
    let tooltipTextElement = document.createElement('p')
    tooltipTextElement.classList.add(...textClasses.trim().split(' '))
    tooltipTextElement.innerHTML = tooltipText

    return tooltipTextElement
}

function createTooltipContainerElement(tooltipClasses: string, tooltipBorderWidth: number) {
   let tooltipElement = document.createElement('div')
   tooltipElement.classList.add(...tooltipClasses.trim().split(' '))
   tooltipElement.style.borderWidth = `${tooltipBorderWidth}px`

   return tooltipElement
}

async function onMouseEnter(
        anchorElement: HTMLElement, 
        tooltipConfig: ReturnType<typeof getTooltipConfig>, 
        tooltipElement: HTMLDivElement,
        uuid: string,
        options?: { isTooltip?: boolean }
    ) {
    if (!tooltipConfig.shouldShow) return 

    let _showDelay = options?.isTooltip ? 0 : tooltipConfig.showDelay

    // If mouse leaves from Tooltip and enters to Anchor element in short time, show Tooltip immediately
    const mouseLeaveFromTooltipBufferTime = 100
    if (!options?.isTooltip && Date.now() - tooltips[uuid].mouseEventState.lastTooltipMouseLeaveTimestamp <= mouseLeaveFromTooltipBufferTime) {
        _showDelay = 0
    }

    const currentInstanceId = Date.now()
    tooltips[uuid].mouseEventState.currentInstanceId = currentInstanceId
    tooltips[uuid].mouseEventState.isHoveringOverAnchorElement = true

    if (_showDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, _showDelay))

        if (!tooltips[uuid].mouseEventState.isHoveringOverAnchorElement || tooltips[uuid].mouseEventState.currentInstanceId !== currentInstanceId) return
    }

    const didMountTooltip = mountTooltipElement(anchorElement, tooltipConfig, tooltipElement)

    if (didMountTooltip) {
        handleHideOnScroll(anchorElement, () => hideTooltip(uuid))
        handleHideOnResize(uuid, anchorElement, () => hideTooltip(uuid))
    }
}

function mountTooltipElement(
    anchorElement: HTMLElement, 
    tooltipConfig: ReturnType<typeof getTooltipConfig>, 
    tooltipElement: HTMLDivElement,
    positionStrategy?: 'fixed' | 'absolute'
) {
    let scrollOffset = { x: 0, y: 0 }

    if (positionStrategy === 'absolute') {
        tooltipElement.classList.replace('zt-fixed', 'zt-absolute')
        scrollOffset.x = window.scrollX
        scrollOffset.y = window.scrollY
    }

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
            hasNeededDisplaySpace = tryMountTooltipOnLeft(anchorElementRect, tooltipConfig, tooltipElement, scrollOffset)
        } else if (currentTooltipPosition === 'top') {
            hasNeededDisplaySpace = tryMountTooltipOnTop(anchorElementRect, tooltipConfig, tooltipElement, scrollOffset)
        } else if (currentTooltipPosition === 'right') {
            hasNeededDisplaySpace = tryMountTooltipOnRight(anchorElementRect, tooltipConfig, tooltipElement, scrollOffset)
        } else if (currentTooltipPosition === 'bottom') {
            hasNeededDisplaySpace = tryMountTooltipOnBottom(anchorElementRect, tooltipConfig, tooltipElement, scrollOffset)
        }

        if (hasNeededDisplaySpace) break
    }

    if (hasNeededDisplaySpace) {
        drawArrow(anchorElementRect, currentTooltipPosition, tooltipConfig, tooltipElement)

        tooltipElement.style.opacity = '1'
        tooltipElement.style.zIndex = typeof(tooltipConfig.zIndex) === 'string' ? tooltipConfig.zIndex : tooltipConfig.zIndex.toString();

        return true
    }

    return false
}

function repositionTooltipElement(
    anchorElement: HTMLElement, 
    tooltipConfig: ReturnType<typeof getTooltipConfig>, 
    tooltipElement: HTMLDivElement,
    positionStrategy?: 'fixed' | 'absolute'
) {
    // Remove Arrow element from Tooltip, because it needs to be rebuilt every time Tooltip is repositioned
    tooltipElement.querySelector(`.${arrowElementClass}`)?.remove()

    let scrollOffset = { x: 0, y: 0 }

    if (positionStrategy === 'absolute') {
        scrollOffset.x = window.scrollX
        scrollOffset.y = window.scrollY
    }

    const anchorElementRect = anchorElement.getBoundingClientRect()

    // Find suitable Tooltip position
    let hasNeededDisplaySpace = false
    let currentTooltipPosition = tooltipConfig.tooltipPosition
    for (let i = 0; i < 4; i++) {
        currentTooltipPosition = tooltipConfig.tooltipPositions[tooltipConfig.tooltipPosition][i]

        if (currentTooltipPosition === 'left') {
            hasNeededDisplaySpace = tryMountTooltipOnLeft(anchorElementRect, tooltipConfig, tooltipElement, scrollOffset)
        } else if (currentTooltipPosition === 'top') {
            hasNeededDisplaySpace = tryMountTooltipOnTop(anchorElementRect, tooltipConfig, tooltipElement, scrollOffset)
        } else if (currentTooltipPosition === 'right') {
            hasNeededDisplaySpace = tryMountTooltipOnRight(anchorElementRect, tooltipConfig, tooltipElement, scrollOffset)
        } else if (currentTooltipPosition === 'bottom') {
            hasNeededDisplaySpace = tryMountTooltipOnBottom(anchorElementRect, tooltipConfig, tooltipElement, scrollOffset)
        }

        if (hasNeededDisplaySpace) break
    }

    if (hasNeededDisplaySpace) {
        drawArrow(anchorElementRect, currentTooltipPosition, tooltipConfig, tooltipElement)
    }
}

async function onMouseLeave(tooltipConfig: ReturnType<typeof getTooltipConfig>, uuid: string, options?: { isTooltip?: boolean }) {
    if (options?.isTooltip) {
        tooltips[uuid].mouseEventState.lastTooltipMouseLeaveTimestamp = Date.now()
    }

    const currentInstanceId = Date.now()
    tooltips[uuid].mouseEventState.currentInstanceId = currentInstanceId
    tooltips[uuid].mouseEventState.isHoveringOverAnchorElement = false
    
    if (tooltipConfig.hideDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, tooltipConfig.hideDelay))

        if (tooltips[uuid].mouseEventState.isHoveringOverAnchorElement || tooltips[uuid].mouseEventState.currentInstanceId !== currentInstanceId) return
    }

    hideTooltip(uuid)
}

function tryMountTooltipOnLeft(
    anchorElementRect: DOMRect, 
    tooltipConfig: ReturnType<typeof getTooltipConfig>, 
    tooltipElement: HTMLDivElement,
    scrollOffset: { x: number, y: number },
) {
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
    tooltipElement.style.top = `${tooltipTop + scrollOffset.y}px`
    tooltipElement.style.left = `${tooltipLeft + scrollOffset.x}px`

    return true
}

function tryMountTooltipOnRight(
    anchorElementRect: DOMRect, 
    tooltipConfig: ReturnType<typeof getTooltipConfig>, 
    tooltipElement: HTMLDivElement,
    scrollOffset: { x: number, y: number },
) {
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
    tooltipElement.style.top = `${tooltipTop + scrollOffset.y}px`
    tooltipElement.style.left = `${tooltipLeft + scrollOffset.x}px`

    return true
}

function tryMountTooltipOnTop(
    anchorElementRect: DOMRect, 
    tooltipConfig: ReturnType<typeof getTooltipConfig>, 
    tooltipElement: HTMLDivElement,
    scrollOffset: { x: number, y: number },
) {
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
    tooltipElement.style.top = `${tooltipTop + scrollOffset.y}px`
    tooltipElement.style.left = `${tooltipLeft + scrollOffset.x}px`

    return true
}

function tryMountTooltipOnBottom(
    anchorElementRect: DOMRect, 
    tooltipConfig: ReturnType<typeof getTooltipConfig>, 
    tooltipElement: HTMLDivElement,
    scrollOffset: { x: number, y: number },
) {
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
    tooltipElement.style.top = `${tooltipTop + scrollOffset.y}px`
    tooltipElement.style.left = `${tooltipLeft + scrollOffset.x}px`

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
    tooltipElement.appendChild(arrowElement)
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
    const tooltipElement = tooltips[uuid]?.tooltipElement

    resetResizeReferences(uuid)
    removeHideOnScrollListeners()

    // Remove Arrow element from Tooltip, because it needs to be rebuilt every time Tooltip is showed again
    tooltipElement.querySelector(`.${arrowElementClass}`)?.remove()

    // Reset position so that old position does not effect new position (when zooming old position could be off screen)
    tooltipElement.style.left = '0'
    tooltipElement.style.top = '0'

    tooltipElement.remove()
}

function destroyTooltip(tooltip: ReturnType<typeof initTooltip>) {
    const uuid = tooltip.tooltipElement.dataset.uuid

    if (uuid) {
        removeRepositionOnResizeHandler(uuid)
        hideTooltip(uuid)
        delete tooltips[uuid]
    }

    for (const controller of Object.values(tooltip.mouseEnterEventControllers)) {
        controller.abort()
    }
}

export default ZeroTooltip
