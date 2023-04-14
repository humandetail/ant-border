import { DraggableResizableSetting, AntBorderOptions, PointStyle, Point } from './types'
import DraggableResizable from './DraggableResizable'
import { union2object } from './utils'

enum DrawingDirection {
  'ltr',
  'ttb',
  'rtl',
  'btt'
}

const defaultOptions: AntBorderOptions = {
  width: 320,
  height: 200,
  fixedRatio: false,
  draggable: true,
  resizable: true,
  animation: true,
  dasharray: [20, 6],
  pointStyle: {
    r: 4,
    stroke: '#333',
    fill: '#fff'
  },
  borderStyle: {
    width: 1,
    stroke: '#333'
  },
  translate: {
    x: 0,
    y: 0
  }
}

export default class AntBorder extends DraggableResizable {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  options: AntBorderOptions

  #width: number = 0
  #height: number = 0

  offset: number = 0

  requestId: number = -1

  constructor (options?: Partial<AntBorderOptions>) {
    const pointStyle = options?.pointStyle
      ? 'r' in Object.keys(options.pointStyle)
        ? union2object(['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'], options.pointStyle)
        : options.pointStyle
      : union2object(['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'], defaultOptions.pointStyle)

    const opts = {
      ...defaultOptions,
      ...options,
      pointStyle
    }

    const canvas = document.createElement('canvas')

    super(canvas, {
      width: opts.width,
      height: opts.height,
      ...opts.translate
    }, {
      draggable: opts.draggable,
      resizable: opts.resizable,
      fixedRatio: opts.fixedRatio,
      pointStyle: opts.pointStyle as PointStyle
    })

    this.options = opts

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    this.init()
  }

  get width (): number {
    return this.#width
  }

  set width (width) {
    this.#width = width

    this.canvas.width = width
  }

  get height (): number {
    return this.#height
  }

  set height (height) {
    this.#height = height
    this.canvas.height = height
  }

  get maxOffset (): number {
    return this.options.dasharray[0] + this.options.dasharray[1]
  }

  init (): void {
    this.setSize(this.options.width, this.options.height)
    this.run()
  }

  setSize (width: number, height: number): void {
    this.width = width
    this.height = height
    this.restoreSetting({
      width,
      height,
      x: 0,
      y: 0
    })
  }

  run () {
    this.draw()

    if (this.options.animation) {
      const offset = this.offset + 1
      this.offset = offset > this.maxOffset
        ? 0
        : offset

      this.requestId = requestAnimationFrame(() => this.run())
    } else {
      this.draw()
    }
  }

  stop () {
    cancelAnimationFrame(this.requestId)
  }

  draw (): void {
    this.clear()

    this.drawBorders()
    this.drawEndpoints()
  }

  drawEndpoints () {
    const {
      endpoints,
      ctx,
      options: {
        fixedRatio
      }
    } = this

    Object.entries(endpoints).forEach(([key, endpoint]) => {
      if (fixedRatio && ['n', 'w', 's', 'e'].includes(key)) {
        return
      }
      if (endpoint.r) {
        ctx.beginPath()
        ctx.fillStyle = endpoint.fill!
        ctx.strokeStyle = endpoint.stroke!
        ctx.arc(endpoint.x, endpoint.y, endpoint.r, 0, Math.PI * 2, true)
        ctx.stroke()
        ctx.fill()
        ctx.closePath()
      }
    })
  }

  drawBorders (): void {
    const {
      endpoints: {
        nw,
        ne,
        sw,
        se
      }
    } = this

    this.drawBorder(nw, ne, DrawingDirection.ltr)
      .drawBorder(ne, se, DrawingDirection.ttb)
      .drawBorder(se, sw, DrawingDirection.rtl)
      .drawBorder(sw, nw, DrawingDirection.btt)
  }

  drawBorder (startPoint: Point, endPoint: Point, dir: DrawingDirection): AntBorder {
    const {
      options: {
        dasharray: [solid, dashed]
      },
      offset
    } = this

    // 绘制 offset 段
    this.drawOffsetLine(startPoint, endPoint, dashed, offset, dir)

    let { x: x1, y: y1 } = startPoint
    const { x: x2, y: y2 } = endPoint

    x1 = dir === DrawingDirection.ltr
      ? x1 + offset
      : dir === DrawingDirection.rtl
        ? x1 - offset
        : x1
    y1 = dir === DrawingDirection.ttb
      ? y1 + offset
      : dir === DrawingDirection.btt
        ? y1 - offset
        : y1

    while (!isEnd({ x: x1, y: y1 }, { x: x2, y: y2 }, dir)) {
      // 实线
      const x = dir === DrawingDirection.ltr
        ? Math.min(x2, x1 + solid)
        : dir === DrawingDirection.rtl
          ? Math.max(endPoint.x, x1 - solid)
          : x1
      const y = dir === DrawingDirection.ttb
        ? Math.min(y2, y1 + solid)
        : dir === DrawingDirection.btt
          ? Math.max(endPoint.y, y1 - solid)
          : y1

      this.drawLine({
        x: x1,
        y: y1
      }, {
        x,
        y
      })

      // 虚线
      x1 = dir === DrawingDirection.ltr
        ? x + dashed
        : dir === DrawingDirection.rtl
          ? x - dashed
          : x
      y1 = dir === DrawingDirection.ttb
        ? y + dashed
        : dir === DrawingDirection.btt
          ? y - dashed
          : y
    }

    return this
  }

  drawOffsetLine (startPoint: Point, endPoint: Point, dashed: number, offset: number, dir: DrawingDirection) {
    if (offset <= dashed) {
      return
    }

    const len = offset - dashed

    const { x: x1, y: y1 } = startPoint
    let { x: x2, y: y2 } = endPoint

    switch (dir) {
      case DrawingDirection.ltr:
        x2 = x1 + len
        break
      case DrawingDirection.ttb:
        y2 = y1 + len
        break
      case DrawingDirection.rtl:
        x2 = x1 - len
        break
      case DrawingDirection.btt:
        y2 = y1 - len
        break
      default:
        break
    }

    this.drawLine({
      x: x1,
      y: y1
    }, {
      x: x2,
      y: y2
    })
  }

  drawLine (startPoint: Point, endPoint: Point) {
    const {
      options: {
        borderStyle
      },
      ctx
    } = this

    ctx.strokeStyle = borderStyle.stroke
    ctx.lineWidth = borderStyle.width

    ctx.beginPath()
    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(endPoint.x, endPoint.y)
    ctx.closePath()
    ctx.stroke()
  }

  clear (): void {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  onResize ({ width, height }: DraggableResizableSetting) {
    this.width = width
    this.height = height
  }
}

function isEnd ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point, dir: DrawingDirection): boolean {
  switch (dir) {
    case DrawingDirection.ltr:
      return x1 >= x2
    case DrawingDirection.rtl:
      return x1 <= x2
    case DrawingDirection.ttb:
      return y1 >= y2
    case DrawingDirection.btt:
      return y1 <= y2
    default:
      return true
  }
}
