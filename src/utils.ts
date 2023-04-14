import { Point } from './types'

export const union2object = <T = any>(arr: Array<string | number | symbol>, value: T) => {
  // eslint-disable-next-line no-unused-vars
  return arr.reduce((prev: { [k in string | number | symbol]: T }, curr: string | number | symbol) => {
    prev[curr] = value
    return prev
  }, {})
}

export const readonlyObject = <T extends Object = any>(input: T): Readonly<T> => {
  if (Object.isFrozen(input) && Object.isSealed(input) && !Object.isExtensible(input)) {
    return input
  }

  Object.values(input).forEach(val => {
    if (typeof val === 'object') {
      readonlyObject(val)
    }
  })

  return Object.freeze(Object.seal(Object.preventExtensions(input)))
}

// 获取滚动条距离
export const getScrollOffset = () => {
  if (window.pageXOffset) {
    return {
      left: window.pageXOffset,
      top: window.pageYOffset
    }
  }
  return {
    left: document.documentElement.scrollLeft + document.body.scrollLeft,
    top: document.documentElement.scrollTop + document.body.scrollTop
  }
}

// 元素到浏览器左上角的距离
export const getElementDocPosition = (el: HTMLElement) => {
  let parentNode = el.offsetParent as HTMLElement
  let left = el.offsetLeft
  let top = el.offsetTop

  while (parentNode) {
    left += parentNode.offsetLeft + parentNode.clientLeft
    top += parentNode.offsetTop + parentNode.clientTop
    parentNode = parentNode.offsetParent as HTMLElement
  }

  return {
    left,
    top
  }
}

// 获取鼠标在元素上的位置
export const getElementMousePos = (e: MouseEvent) => {
  const {
    target,
    clientX,
    clientY
  } = e

  const scrollOffset = getScrollOffset()

  const { left, top } = getElementDocPosition(target as HTMLElement)

  return {
    x: clientX - (left - scrollOffset.left),
    y: clientY - (top - scrollOffset.top)
  }
}

export const isPointInRect = ([leftTop, rightBottom]: [Point, Point], point: Point) => {
  return point.x >= leftTop.x &&
    point.y >= leftTop.y &&
    point.x <= rightBottom.x &&
    point.y <= rightBottom.y
}
