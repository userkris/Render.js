# Render.js - UI Library for Web Applications

A small set of functions written in vanilla JavaScript. Designed to run in browsers and can be easily bundled with your application using bundlers like <a href="https://esbuild.github.io/">esbuild</a>. The solution is built with functional programming pattern and greatly relies on recursive functions.

The development of the library is inspired by <a href="https://vuejs.org/" target="_blank" rel="nofollower noopener">Vue.js</a>, <a href="https://react.dev/" target="_blank" rel="nofollower noopener">React</a> and <a href="https://github.com/tsoding/grecha.js/tree/master">Grecha.js</a> 🥣.

To-Do List application created with Render.js: <a href="https://kris.kofler.work/#demo-application-built-with-renderjs" target="_blank">Demo</a> (<a href="https://github.com/userkris/to-do-app-demo-for-Render.js" target="_blank" rel="nofollower noopener">source</a>)

<br />

## Features
- **Virtual DOM**
  
- [**Components**](#node-function)<br />
*Creates HTML elements with a single function. It supports nesting, custom tags, attributes, event listeners, properties, and classes.*
  
- [**State Management**](#state-management-examples)<br />
*Provides global state shared between all components (`$state`) and individual memory allocated per component instance (`$componentState`).*
  
- [**Router**](#router-with-multiple-views)<br />
*Has hash based router.*
  
- [**Element Referencing & On Mount Hook**](#on-mount-hook--element-with-reference)<br />
*Provides `$on_mount` hook to execute JavaScript after render and elements can be accessible via custom reference.*

<br />

## Quick Start

Copy the library in your project. Use any bundler to generate JavaScript for browsers from the snippet below:
```javascript
// app.ts
import { node, hydrate } from 'Render'

const Counter = ({ $refresh, $componentState }) => {
  let count = $componentState.count || 0

  const counter = node('p', count)
  const button = node('button', 'Count++', {
    event: {click: () => {
      count++
      $componentState.count = count
      $refresh()
    }}
  })

  return node(counter, button)
}

hydrate('#app', Counter)
```
<br />

Then load it in html file:
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <script src="./app.js" defer></script>
    <main id="app"></main>
  </body>
</html>
```

<br />

## Examples

### Node Function
#### `<h1>` tag with text node inside:
```javascript
node('h1', 'Hello World')
```
Result:
```html
<h1>Hello World</h1>
```
<br />

#### `<h1>` tag wrapped in a `<div>`:
```javascript
node('div',
  node('h1', 'Hello World')
)
```
Result:
```html
<div>
  <h1>Hello World</h1>
</div>
```
<br />

#### Multiple tags "wrapped" without a `<div>`:
```javascript
node(
  node('h1', 'Hello World'),
  node('p', 'Lorem ipsum...')
)
```
Result:
```html
<h1>Hello World</h1>
<p>Lorem ipsum...</p>
```
<br />

#### `<button>` with an attribute and classes:
```javascript
node('button', 'My Button Text', {
    class: 'text-red-800 rounded text-sm',
    attr: { type: 'button' },
})
```
Result:
```html
<button class="text-red-800 rounded text-sm" type="button">My Button Text</button>
```
<br />

#### or `<button>` with multiple attributes and classes:
```javascript
node('button', 'My Button Text', {
    class: ['text-sm text-red-800', 'rounded'],
    attr: [
      { 'type': 'button' },
      { 'data-attr': 'value' },
    ],
})
```
Result:
```html
<button class="text-red-800 rounded text-sm" type="button" data-attr="value">My Button Text</button>
```
<br />

#### `<form>` with text `<input>` with a value and multiple event listeners and submit `<button>`:
```javascript
node('form',
  node('input', {
    attr: { type: 'text' },
    props: { value: 'my text value' },
    event: [
      'keyup': (event) => console.log(event.target.value),
      'change': (event) => console.log(event.target.value),
    ],
  }),
  node('button', 'Submit', {
    attr: { type: 'submit' },
  })
)
```
Result:
```html
<form>
  <input type="text" value="my text value" />
  <button type="submit">Submit</button>
</form>
```
<br />

### State Management Examples
#### Counter component with individual state:
```javascript
import { node } from 'Library/Render'

// $componentState - is an unique memory reference assigned per each component instance
// $refresh - is a function that re-renders the application view. Like browser refresh, but keeps the state
export default ({ $componentState, $refresh }) => {
  let count = $componentState.count || 0

  const counter = node('p', count)
  const button = node('button', 'count++', {
    event: {click: (event) => {
      count++
      $componentState.count = count
      $refresh()
    }}
  })

  return node(counter, button)
}
```
<br />

#### Counter component with global state:
```javascript
import { node } from 'Library/Render'

// $state - is a global memory reference assigned on application start.
// All components using $state will get an update on $state mutation
// $refresh - is a function that re-renders the application view. Like browser refresh, but keeps the state
export default ({ $state, $refresh }) => {
  let count = $state.count || 0

  const counter = node('p', count)
  const button = node('button', 'count++', {
    event: {click: (event) => {
      count++
      $state.count = count
      $refresh()
    }}
  })

  return node(counter, button)
}
```
<br />


### Parse a Parameter to a Component
#### Component `Link.ts`
```javascript
import { node } from 'Library/Render'

export default (href, text) => () => {
  return node('a', { attr: { href } }, text)
}
```

#### Entry Point `main.ts`
```javascript
import { hydrate } from 'Library/Render'
import Link from 'Link'

hydrate('#app', Link('http://my.href.com', 'My Link Text'))
```
<br />

### Router with Multiple Views
#### View `Views/index.ts`:
```javascript
import { node } from 'Library/Render'

export default () => {
    return node(
        node('h1', 'Home'),
        node('p', 'This is homepage.'),
        node('a', 'Go to About', { attr: { href: '#/about' } })
    )
}
```

#### View `Views/about.ts`:
```javascript
import { node } from 'Library/Render'

export default () => {
    return node(
        node('h1', 'About'),
        node('p', 'This is about page.'),
        node('a', 'Go to Home', { attr: { href: '#/' } })
    )
}
```

#### View `Views/404.ts`:
```javascript
import { node } from 'Library/Render'

export default () => {
    return node(node('h1', '404'), node('p', 'Requested route could not be found.'))
}
```

#### Entry Point `main.ts`:
```javascript
import { hydrate } from 'Library/Render'

import index from 'Views/index'
import about from 'Views/about'
import notFound from 'Views/404'

// hard-coded behaviour:
// if 'hash' value is undefined or empty string, the router uses '/' route
// if 'hash' value exists, but the route doesn't, the router uses '/404'
// basically routes '/' and '/404' are mandatory and should be always declared

// to avoid conflicts with default hash behaviour - all routers must start with '/'
hydrate('#app', {
    '/': index,
    '/about': about,
    '/404': notFound,
})
```
<br />

### On Mount Hook & Element with Reference
```javascript
import { node } from 'Library/Render'

export default ({ $on_mount }) {
    $on_mount.focusInput = ({ element }) => {
        if (element['$ref'] === 'InputToFocus') element.focus()
    }

    return node('input', {
        ref: 'InputToFocus'
        attr: { type: 'text' }
    })
}
```
<br />

### Text Node
```javascript
text('My text.')
```
Result:
```html
My text.
```
<br />

#### a component with text node and without wrapper tag:
```javascript
import { node, text } from 'Library/Render'

export default () => {
  node(text('My text.'), node('p', 'text in paragraph.'))
}
```
Result:
```html
My text.
<p>text in paragraph</p>
```
