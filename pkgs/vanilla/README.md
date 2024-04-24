# @use-tween/vanilla

A simple binding of the [`@tweenjs/tween.js`](https://npmjs.com/package/@tweenjs/tween.js) library for vanilla JavaScript, can be also used with frontend frameworks like React, Vue, Angular, etc.

## Installation

```bash
yarn add @use-tween/vanilla
```

## Usage

```js
const { useTween } = require('@use-tween/vanilla')
```

If you are using ESM or TypeScript, you can import it like this:

```js
import { useTween } from '@use-tween/vanilla'
```

Then you can use the `useTween` function to create a tween instance:

```ts
const { tween, update } = useTween(
  { x: 0 },
  {
    to: [{ x: 100 }, 1000],
    easing: 'Linear.None',
    onUpdate: (object) => {
      console.log(object.x)
    },
    onComplete: () => {
      console.log('Tween completed!')
    }
  },
)

const animate = () => {
  requestAnimationFrame(animate)
  update()
}

animate()
```

The tween instance would start immediately after it is created.
If you want to start the tween later, you can set the `startImmediately` option to `false`,
and then call the `start` method on the tween instance manually:

```ts
const { tween, update } = useTween(
  { x: 0 },
  {
    to: [{ x: 100 }, 1000],
    startImmediately: false,
  },
)

const animate = () => {
  requestAnimationFrame(animate)
  update()
}

tween.start()
animate()
```

## API

### `useTween(initialObject, options)`

The `useTween` function creates a tween instance.

- `initialObject`: The initial object that you want to tween.
- `options`: The options for the tween instance.

Basically the `options` object wraps most of the methods and properties of the [`Tween`](https://github.com/tweenjs/tween.js/blob/main/docs/user_guide.md), they would become an array if there are multiple arguments.

Also we convert the `Easing` functions to strings, so you can use them directly in the options object without tackling the `Easing` object from `Tween.JS`.

For example, in `Tween.JS` you would write:

```ts
const tween = new TWEEN.Tween({ x: 0 })
  .to({ x: 100 }, 1000)
  .easing(TWEEN.Easing.Linear.None)
  .onUpdate((object) => {
    console.log(object.x)
  })
```

But in `@use-tween/vanilla` you can write:

```ts
const { tween } = useTween(
  { x: 0 },
  {
    to: [{ x: 100 }, 1000], // `to` becomes an array since there are multiple arguments.
    easing: 'Linear.None',  // Use strings for `easing` rather than import them from `Tween.JS`
    onUpdate: (object) => { // `onUpdate` takes a function as the argument.
      console.log(object.x)
    },
  },
)
```

## License

This project is licensed under the [MIT License](https://github.com/MaikoTan/use-tween/blob/master/LICENSE).
