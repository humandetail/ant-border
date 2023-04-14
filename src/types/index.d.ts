export type UnionToObject<T = unknown, P extends Array<string | number | symbol> = []> = {
  // eslint-disable-next-line no-unused-vars
  [K in P[number]]?: T
}

/**
 * UnionToFunc<1 | 2> => ((arg: 1) => void | (arg: 2) => void)
 */
type UnionToFunc<T> = T extends unknown ? (arg: T) => void : never

/**
 * UnionToIntersection<1 | 2> = 1 & 2
 */
type UnionToIntersection<U> = UnionToFunc<U> extends (arg: infer Arg) => void
  ? Arg
  : never

/**
 * LastInUnion<1 | 2> = 2
 */
type LastInUnion<U> = UnionToIntersection<UnionToFunc<U>> extends (x: infer L) => void
  ? L
  : never

export type UnionToTuple<T, L = LastInUnion<T>> = [L] extends [never]
  ? []
  : [...UnionToTuple<Exclude<T, L>>, L]

export type Direction =
  | 'nw' | 'n' | 'ne'
  | 'w' | 'e'
  | 'sw' | 's' | 'se'

export type CursorPosition =
  | Direction
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'inner'

export interface DraggableResizableSetting {
  width: number
  height: number
  x: number
  y: number
}

interface EmitterHanlder {
  // eslint-disable-next-line no-use-before-define
  (name: 'dragstart', listener: (e: MouseEvent) => void): AntBorderInstance
  // eslint-disable-next-line no-use-before-define
  (name: 'drag', listener: (e: MouseEvent) => void): AntBorderInstance
  // eslint-disable-next-line no-use-before-define
  (name: 'dragend', listener: (e: MouseEvent) => void): AntBorderInstance
  // eslint-disable-next-line no-use-before-define
  (name: 'change', listener: (change: Readonly<DraggableResizableSetting>, newSetting: Readonly<DraggableResizableSetting>, defaultSetting: Readonly<DraggableResizableSetting>) => void): AntBorderInstance
}

export interface AntBorderInstance {
  _isMounted: boolean
  _target: HTMLElement | null
  mount: (el: Element) => AntBorderInstance
  destroy: () => void
  setSize: (width: number, height: number) => AntBorderInstance
  on: EmitterHanlder
  once: EmitterHanlder
  off: EmitterHanlder
}

export type Dasharray = [number, number]

export interface BorderStyle {
  width: number
  stroke: string
}

export interface PointStyle {
  r: number
  stroke: string
  fill: string
}

export interface Point extends Partial<PointStyle> {
  x: number
  y: number
}

export type EndPoints = Required<UnionToObject<Point, UnionToTuple<Direction>>>

export type SinglePointStyle = UnionToObject<PointStyle, UnionToTuple<Direction>>

export interface AntBorderOptions {
  width: number
  height: number
  fixedRatio: boolean
  draggable: boolean
  resizable: boolean
  animation: boolean
  /**
   * [solid,dashed]
   */
  dasharray: Dasharray
  pointStyle: PointStyle | SinglePointStyle
  borderStyle: BorderStyle
  translate: {
    x: number,
    y: number
  }
}
