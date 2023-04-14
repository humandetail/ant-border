import { AntBorderInstance, AntBorderOptions } from './types'
import AntBorder from './AntBorder'

export function createAntBorder (options?: Partial<AntBorderOptions>): AntBorderInstance {
  let antBorder: AntBorder | null = new AntBorder(options)
  let listeners: [string, any][] = []

  return {
    _isMounted: false,
    _target: null,

    mount (el) {
      if (this._isMounted) {
        // eslint-disable-next-line no-console
        console.info('component is already mounted.')
        return this
      }
      el.appendChild(antBorder!.canvas)

      this._target = antBorder!.canvas
      this._isMounted = true
      return this
    },

    destroy () {
      if (this._isMounted && this._target) {
        this._target.remove()

        antBorder = null
      }
    },

    setSize (width, height) {
      if (!this._isMounted) {
        // eslint-disable-next-line no-console
        console.warn('Make sure `mount()` is already called.')
        return this
      }
      antBorder!.stop()
      antBorder!.setSize(width, height)
      antBorder!.run()

      return this
    },

    on (name, listener) {
      if (!this._isMounted) {
        // eslint-disable-next-line no-console
        console.warn('Make sure `mount()` is already called.')
        return this
      }
      listeners.push([name, listener])
      antBorder!.emitter.on(name, listener)
      return this
    },

    once (name, listener) {
      if (!this._isMounted) {
        // eslint-disable-next-line no-console
        console.warn('Make sure `mount()` is already called.')
        return this
      }
      antBorder!.emitter.once(name, listener)
      return this
    },

    off (name, listener) {
      if (!this._isMounted) {
        // eslint-disable-next-line no-console
        console.warn('Make sure `mount()` is already called.')
        return this
      }
      listeners = listeners.filter(item => item[0] !== name)
      antBorder!.emitter.off(name, listener)
      return this
    }
  }
}
