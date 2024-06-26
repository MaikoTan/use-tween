import * as TWEEN from '@tweenjs/tween.js'

export * from '@tweenjs/tween.js'

type TweenSetterProperties =
  // | 'to'  // Handled separately
  | 'duration'
  | 'duration'
  | 'dynamic'
  | 'group'
  | 'delay'
  | 'repeat'
  | 'repeatDelay'
  | 'yoyo'
  // | 'easing' // Handled separately so we can use string values
  | 'interpolation'
  | 'chain'
  | 'onStart'
  | 'onEveryStart'
  | 'onUpdate'
  | 'onRepeat'
  | 'onComplete'
  | 'onStop'

type Leaves<T> = T extends object
  ? { [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}` }[keyof T]
  : never
// Sadly Tween didn't export the EasingFunction type
type EasingFunction = typeof TWEEN.Easing.Linear.None

// generatePow is a normal function, not an easing function
export type EasingFunctions = Exclude<Leaves<typeof TWEEN.Easing>, 'generatePow'>

// FIXME: Not a good way to flatten the parameters, but it works for now
// since we have many methods with only one required parameter.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlattenParams<T extends any[]> = T[0] | T

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TweenSetters<T extends Record<string, any>> = {
  to?: [Partial<T>, number]
  easing?: EasingFunction | EasingFunctions // Easing functions in strings.
  /** Start animation immediately when created the {@link TWEEN.Tween} instance. */
  startImmediately?: boolean
  /** Group to be added in. */
  group?: TWEEN.Group | false
} & {
  [key in TweenSetterProperties]?: key extends keyof InstanceType<typeof TWEEN.Tween<T>>
    ? FlattenParams<Parameters<InstanceType<typeof TWEEN.Tween<T>>[key]>>
    : never
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTween<T extends Record<string, any>>(obj: T, _setter: TweenSetters<T> = {}) {
  const tween = new TWEEN.Tween<T>(obj, _setter.group)

  const setter = {
    startImmediately: true,
    ..._setter,
  }

  if (setter.group !== undefined) {
    delete setter.group
  }

  Object.entries(setter).forEach(([key, value]) => {
    if (key in tween) {
      if (key === 'easing' && typeof value === 'string') {
        const paths = value.split('.')
        let fns: unknown = TWEEN.Easing
        while (paths.length) {
          fns = (fns as typeof TWEEN.Easing)[paths.shift() as keyof typeof fns]
        }
        tween.easing(fns as EasingFunction)
      } else {
        // @ts-expect-error It is safe to assume that the key exists in the tween object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tween[key as keyof typeof tween](...(Array.isArray(value) ? value : ([value] as any)))
      }
    }
  })

  if (setter.startImmediately) {
    tween.start()
  }

  return {
    tween,
    // Control methods from tween
    update: tween.update.bind(tween) as typeof TWEEN.Tween.prototype.update,
    start: tween.start.bind(tween) as typeof TWEEN.Tween.prototype.start,
    stop: tween.stop.bind(tween) as typeof TWEEN.Tween.prototype.stop,
    pause: tween.pause.bind(tween) as typeof TWEEN.Tween.prototype.pause,
    resume: tween.resume.bind(tween) as typeof TWEEN.Tween.prototype.resume,
    isPlaying: tween.isPlaying.bind(tween) as typeof TWEEN.Tween.prototype.isPlaying,
    isPaused: tween.isPaused.bind(tween) as typeof TWEEN.Tween.prototype.isPaused,
  }
}

export type ChainedTweenSetters<T extends Record<string, any>> = Omit<TweenSetters<T>, 'to'> & {
  to: [Partial<T>, number][]
  /** The delay before the first tween starts. */
  delayBeforeStart?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useChainedTween<T extends Record<string, any>>(obj: T, setters: ChainedTweenSetters<T>) {
  const tweens: ReturnType<typeof useTween>[] = []
  setters.to.forEach(([to, duration], index) => {
    const _obj = index === 0 ? obj : setters.to[index - 1][0]
    const _setter = {
      ...setters,
      to: [to, duration] as [Partial<T>, number],
      startImmediately: index === 0 && setters.startImmediately !== false,
    }

    // Delay the first tween
    if (index === 0 && setters.delayBeforeStart) {
      _setter.delay = setters.delayBeforeStart
    }
    // onStart should only be called on the first tween
    if (index !== 0 && _setter.onStart) {
      delete _setter.onStart
    }
    // onComplete should only be called on the last tween
    if (index !== setters.to.length - 1 && _setter.onComplete) {
      delete _setter.onComplete
    }

    tweens.push(useTween(_obj, _setter))
  })

  // Chain the tweens
  for (let i = 0; i < tweens.length - 1; i++) {
    tweens[i].tween.chain(tweens[i + 1].tween)
  }

  return {
    tweens,
    // Control methods from tween
    ...tweens[0],
  }
}
