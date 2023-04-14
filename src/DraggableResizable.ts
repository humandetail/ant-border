import { CursorPosition, Direction, DraggableResizableSetting, EndPoints, Point, PointStyle, SinglePointStyle } from './types'
import EventEmitter from './EventEmitter'
import { getElementMousePos, isPointInRect, readonlyObject } from './utils'

export default class DraggableResizable {
  #target: HTMLElement
  #initialSetting: DraggableResizableSetting
  #draggable = true
  #resizable = true
  #fixedRatio = false

  emitter = new EventEmitter()

  isMoving = false

  #draggableDirection: Record<Exclude<CursorPosition, Direction>, boolean> = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    inner: true
  }

  #resizableDirection: Record<Direction, boolean> = {
    nw: true,
    n: true,
    ne: true,
    w: true,
    e: true,
    sw: true,
    s: true,
    se: true
  }

  cursorPosition: CursorPosition = 'inner'
  clientX = 0
  clientY = 0

  #currentSetting: DraggableResizableSetting = {
    width: 0,
    height: 0,
    x: 0,
    y: 0
  }

  #pointStyle: PointStyle

  constructor (
    target: HTMLElement,
    setting: DraggableResizableSetting,
    opts: {
      resizable: boolean
      draggable: boolean
      fixedRatio: boolean
      pointStyle: PointStyle
    }
  ) {
    this.#target = target
    this.#initialSetting = setting

    this.currentSetting = setting

    if (!opts.resizable) {
      this.resizableDirection = {
        nw: false,
        n: false,
        ne: false,
        w: false,
        e: false,
        sw: false,
        s: false,
        se: false
      }
    }
    if (!opts.draggable) {
      this.draggableDirection = {
        top: true,
        right: true,
        bottom: true,
        left: true,
        inner: false
      }
    }
    if (opts.fixedRatio) {
      this.resizableDirection = {
        ...this.resizableDirection,
        n: false,
        s: false,
        e: false,
        w: false
      }
    }

    this.#draggable = opts.draggable
    this.#resizable = opts.resizable
    this.#fixedRatio = opts.fixedRatio
    this.#pointStyle = opts.pointStyle

    this.#initEvent()
  }

  get maxPointKey (): keyof SinglePointStyle {
    return Object.entries(this.#pointStyle as SinglePointStyle).reduce((prev: any[], [key, value]) => {
      if (prev.length === 0) {
        return [key, value]
      }

      return value.r > prev[1].r
        ? [key, value]
        : prev
    }, [])[0]
  }

  get maxPoint () {
    const pointStyle = this.#pointStyle as SinglePointStyle
    return pointStyle[this.maxPointKey]!
  }

  get endpoints (): EndPoints {
    const pointStyle = this.#pointStyle as SinglePointStyle

    const {
      currentSetting: { width, height },
      maxPoint
    } = this

    const lx = maxPoint.r + 1
    const mx = width / 2 - 2
    const rx = width - maxPoint.r - 1

    const ty = maxPoint.r + 1
    const my = height / 2 - 2
    const by = height - maxPoint.r - 1

    return {
      nw: { x: lx, y: ty, ...pointStyle.nw },
      n: { x: mx, y: ty, ...pointStyle.n },
      ne: { x: rx, y: ty, ...pointStyle.ne },
      w: { x: lx, y: my, ...pointStyle.w },
      e: { x: rx, y: my, ...pointStyle.e },
      sw: { x: lx, y: by, ...pointStyle.sw },
      s: { x: mx, y: by, ...pointStyle.s },
      se: { x: rx, y: by, ...pointStyle.se }
    }
  }

  get minimumSize () {
    return this.maxPoint.r * 2
  }

  get draggableDirection () {
    return this.#draggableDirection
  }

  set draggableDirection (val: Record<Exclude<CursorPosition, Direction>, boolean>) {
    this.#draggableDirection = val
  }

  get resizableDirection () {
    return this.#resizableDirection
  }

  set resizableDirection (val) {
    this.#resizableDirection = val
  }

  get currentSetting () {
    return this.#currentSetting
  }

  set currentSetting (setting: DraggableResizableSetting) {
    this.#currentSetting = setting
    this.#setStyle(setting)
  }

  get ratio () {
    return this.#initialSetting.width / this.#initialSetting.height
  }

  get changeSetting (): DraggableResizableSetting {
    const {
      width: w1,
      height: h1,
      x: x1,
      y: y1
    } = this.#initialSetting
    const {
      currentSetting: {
        width: w2,
        height: h2,
        x: x2,
        y: y2
      }
    } = this
    return {
      width: w2 - w1,
      height: h2 - h1,
      x: x2 - x1,
      y: y2 - y1
    }
  }

  restoreSetting (setting: DraggableResizableSetting) {
    this.#initialSetting = setting

    this.currentSetting = setting
  }

  getMousePosition (point: Point): CursorPosition {
    const {
      endpoints,
      maxPoint: {
        r
      },
      currentSetting
    } = this

    let endpointKey: string = ''

    Object.entries(endpoints).some(([key, { x, y }]) => {
      if (isPointInRect(
        [
          { x: currentSetting.x + x - r, y: currentSetting.y + y - r },
          { x: currentSetting.x + x + r, y: currentSetting.y + y + r }
        ] as [Point, Point],
        point
      )) {
        endpointKey = key
        return true
      }

      return false
    })

    if (endpointKey) {
      return endpointKey as CursorPosition
    }

    // 检测鼠标是否位于边上
    if (point.y <= currentSetting.y + endpoints.nw.y + r) {
      return 'top'
    }
    if (point.y >= currentSetting.y + endpoints.se.y - r) {
      return 'bottom'
    }
    if (point.x <= currentSetting.x + endpoints.nw.x + r) {
      return 'left'
    }
    if (point.x >= currentSetting.x + endpoints.se.x - r) {
      return 'right'
    }

    return 'inner'
  }

  getCurrentCursorPosition (e: MouseEvent) {
    const point = getElementMousePos(e)
    // get cursor position
    return this.getMousePosition(point)
  }

  onDrag (_setting: DraggableResizableSetting): void {}

  onResize (_setting: DraggableResizableSetting): void {}

  #setStyle (
    {
      width,
      height,
      x,
      y
    }: DraggableResizableSetting
  ) {
    this.#target.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      transform: translate(${x}px, ${y}px);
    `
  }

  #setDocumentCursor (cursor?: string) {
    if (cursor) {
      document.body.style.cursor = cursor
      return
    }
    const cursorMap: Partial<Record<CursorPosition, string>> = {
      nw: 'nwse-resize',
      n: 'ns-resize',
      ne: 'nesw-resize',
      w: 'ew-resize',
      e: 'ew-resize',
      sw: 'nesw-resize',
      s: 'ns-resize',
      se: 'nwse-resize',
      top: 'move',
      right: 'move',
      bottom: 'move',
      left: 'move'
    }

    document.body.style.cursor = cursorMap[this.cursorPosition] || 'default'
  }

  #initEvent (): void {
    this.#target.addEventListener('mousemove', this.handleTargetMousemove.bind(this))
    this.#target.addEventListener('mousedown', this.#handleMousedown.bind(this))
  }

  handleTargetMousemove (e: MouseEvent) {
    if (this.isMoving) {
      return
    }
    // get cursor position
    const pos = this.getCurrentCursorPosition(e)

    const target = e.target as HTMLElement

    const cursorMap: Partial<Record<CursorPosition, string>> = {
      ...(
        this.#resizable
          ? {
              nw: 'nwse-resize',
              ne: 'nesw-resize',
              sw: 'nesw-resize',
              se: 'nwse-resize',
              ...(
                !this.#fixedRatio
                  ? {
                      n: 'ns-resize',
                      w: 'ew-resize',
                      e: 'ew-resize',
                      s: 'ns-resize'
                    }
                  : null
              )
            }
          : null
      ),
      ...(
        this.#draggable
          ? {
              top: 'move',
              right: 'move',
              bottom: 'move',
              left: 'move'
            }
          : null
      ),
      inner: 'default'
    }
    // set cursor style
    target.style.cursor = cursorMap[pos] as string
  }

  #handleMousedown (e: MouseEvent) {
    const cursorPosition = this.getCurrentCursorPosition(e)
    if (cursorPosition === 'inner') {
      return
    }

    this.emitter.emit('dragstart', e)

    const {
      clientX,
      clientY
    } = e

    this.cursorPosition = cursorPosition
    this.clientX = clientX
    this.clientY = clientY

    const handleMousemove = (e: MouseEvent) => {
      this.#handleMove(e)
    }

    const handleMouseup = (e: MouseEvent) => {
      this.#handleMove(e)

      this.emitter.emit('dragend', e)
      this.isMoving = false

      document.removeEventListener('mousemove', handleMousemove)
      document.removeEventListener('mouseup', handleMouseup)

      this.#setDocumentCursor('default')
    }

    document.addEventListener('mousemove', handleMousemove)
    document.addEventListener('mouseup', handleMouseup)
  }

  #handleMove (e: MouseEvent) {
    const {
      cursorPosition,
      currentSetting,
      ratio,
      minimumSize
    } = this

    const resizable = this.#resizable
    // All fixed ratio adjustments are based on 'dx'
    const fixedRatio = this.#fixedRatio

    if (
      cursorPosition === 'inner' ||
      (['top', 'right', 'bottom', 'left'].includes(cursorPosition) && !this.#draggable) ||
      (['n', 'e', 's', 'w'].includes(cursorPosition) && (!resizable || fixedRatio)) ||
      !resizable
    ) {
      return
    }

    let {
      width,
      height,
      x,
      y
    } = currentSetting
    const dx = e.clientX - this.clientX
    const dy = e.clientY - this.clientY

    switch (cursorPosition) {
      case 'top':
      case 'right':
      case 'bottom':
      case 'left':
        x += dx
        y += dy
        break
      case 'n':
        height -= dy
        y += dy
        break
      case 's':
        height += dy
        break
      case 'w':
        width -= dx
        x += dx
        break
      case 'e':
        width += dx
        break
      case 'nw':
        if (fixedRatio) {
          height -= dx
          width = height * ratio
          y += dx
          x += dx * ratio
        } else {
          height -= dy
          width -= dx
          y += dy
          x += dx
        }
        break
      case 'se':
        if (fixedRatio) {
          height += dx
          width = height * ratio
        } else {
          height += dy
          width += dx
        }
        break
      case 'ne':
        if (fixedRatio) {
          height += dx
          width = height * ratio
          y -= dx
        } else {
          height -= dy
          width += dx
          y += dy
        }
        break
      case 'sw':
        if (fixedRatio) {
          width -= dx
          height = width / ratio
          x += dx
        } else {
          height += dy

          width -= dx
          x += dx
        }
        break
      default:
        break
    }

    if (width <= minimumSize || height < minimumSize) {
      return
    }

    this.isMoving = true

    const setting = {
      width,
      height,
      x,
      y
    }
    this.currentSetting = (setting)
    this.clientX = e.clientX
    this.clientY = e.clientY

    this.emitter.emit('drag', e)
    this.#setDocumentCursor()

    this.onDrag(setting)
    this.onResize(setting)

    this.emitter.emit('change', readonlyObject(this.changeSetting), readonlyObject(setting), readonlyObject(this.#initialSetting))
  }
}
