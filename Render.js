const ROUTE_NOT_FOUND = '/404'

export function hydrate (elementOrSelector, ...nodes) {
  const root = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector
  if (!root) throw Error('Root element does not exist.')
 
  // router mode
  if (nodes[0] !== undefined && (typeof nodes[0] === 'object' && !Array.isArray(nodes[0]))) {
    const routes = nodes[0]
    let state = {}

    function sync (routes) {
      let hash = document.location.hash.split('#')[1]
      if (!hash || !hash.startsWith('/')) hash = '/'

      let route
      if (!Object.hasOwn(routes, hash)) {
        // 404
        if (Object.hasOwn(routes, ROUTE_NOT_FOUND)) {
          route = routes[ROUTE_NOT_FOUND]
        } else {
          throw Error('404 - route not found.')
        }
      } else {
        route = routes[hash]
      }
      state = refresh(root, [ route ], state)
    }
    window.addEventListener('hashchange', () => sync(routes))
    sync(routes)
  } else {
    refresh(root, nodes)
  }
}

let componentId = -1
const componentStates = []
const hydratedCallbacks = []

export function refresh (root, nodes, state = {}) {
  componentId = -1
  const $root = root
  const $nodes = nodes
  const $state = state

  // CONSIDER LATER
  const $refresh = (options = { afterRefreshCallback: undefined }) => {

    refresh(root, nodes, state)
    if (typeof options.afterRefreshCallback === 'function') {
      options.afterRefreshCallback()
    }

  }

  const $r = { $refresh, $state, $root }

  const prepareList = []
  for (let componentFunc of nodes) {
    while (typeof componentFunc === 'function') componentFunc = componentFunc($r)
    prepareList.push(componentFunc)
  }

  const renderList = prepareList.flat(Infinity)

  root.replaceChildren(...renderList)

  for (const onMount of hydratedCallbacks) {
    for (const callback of Object.values(onMount)) {
      if (typeof callback === 'function') {
        callback({ element: getElementsWithReference(renderList), findElementByReference: (ref) => getElementByReference(ref, renderList) })
      }
    }
  }

  return state
}

export function node (...children) {
  const id = ++componentId
  if (!componentStates[id]) componentStates[id] = {}
  if (!hydratedCallbacks[id]) hydratedCallbacks[id] = {}

  return ($r = {}) => {
    let parentNode
    $r['$componentState'] = componentStates[id]
    $r['$on_mount'] = hydratedCallbacks[id]
    
    // parent
    if (children[0] !== undefined && typeof children[0] === 'string') {
      parentNode = document.createElement(children[0])
      let options
      
      for (const [index, childNode] of children.entries()) {
        if (index > 0) {
          if (typeof childNode === 'object' && !Array.isArray(childNode)) {
            childNode['$is_options'] = true
            const { ref, attr, class: classList, event, props } = childNode
            options = { ref, attr, classList, event, props }
          }
          if (typeof options === 'object' && !Array.isArray(options)) buildParentNode(parentNode, options)

          switch (typeof childNode) {
            case 'function':
              let elements = childNode
              while (typeof elements === 'function') elements = elements($r)
              if (Array.isArray(elements)) {
                elements = elements.flat(Infinity)
                parentNode.append(...elements)
              } else {
                parentNode.appendChild(elements)
              }
              break
            case 'object':
              if (!childNode['$is_options']) {
                parentNode.appendChild(childNode)
              }
              break
            default:
              parentNode.appendChild(document.createTextNode(childNode))
          }
        }
      }
      return parentNode

    // list
    } else {
      return children.map((childNode) => {
        if (typeof childNode === 'function') {
          let elements = childNode
          while (typeof elements === 'function') elements = elements($r)
          return elements
        }
        return childNode
      })
    }

  }
}

export function text (value) {
  return () => document.createTextNode(value)
}

function buildParentNode (element, { ref, attr, classList, event, props }) {
  if (ref) element['$ref'] = ref

  if (classList) {
    const classes = prepareClasses(classList)
    for (const className of classList) {
      if (className && typeof className === 'string' && !className.includes(' ')) {
        element.classList.add(className.trim())
      }
    }
  }
  if (attr) applyProperties(element, 'setAttribute', attr)
  if (event) applyProperties(element, 'addEventListener', event)
  if (props) applyProperties(element, null, props)
  return element
}

function prepareClasses (classList, classes = []) {
  if (typeof classList === 'string' && classList.includes(' ')) {
    classes = classes.concat(classList.split(' '))
  } else if (typeof classList === 'string' && !classList.includes(' ')) {
    classes.push(classList)
  } else if (Array.isArray(classList)) {
    for (const className of classList) {
      classes = prepareClasses(className, classes)
    }
  }
  return classes
}

function applyProperties (element, method, arrayOrObject) {
  if (Array.isArray(arrayOrObject)) {
    for (const item of arrayOrObject) {
      for (const [key, value] of Object.entries(item)) {
        if (method) {
          element[method](key, value)
        } else {
          element[key] = value
        }
      }
    }
  } else if (!Array.isArray(arrayOrObject) && typeof arrayOrObject === 'object') {
    for (const [key, value] of Object.entries(arrayOrObject)) {
      if (method) {
        element[method](key, value)
      } else {
        element[key] = value
      }
    }
  }
}

function getElementByReference (reference = '', renderList = []) {
  if (!reference) return

  let element
  for (const el of renderList) {
    if (el['$ref'] === reference) {
      element = el
      break
    } else {
      element = getElementByReference(reference, el.children)
    }
  }
  return element
}

function getElementsWithReference (renderList, elementsWithReference = {}) {
  for (const el of renderList) {
    if (el['$ref'] && typeof el['$ref'] === 'string') {
      elementsWithReference[el['$ref']] = el
    }
    elementsWithReference = getElementsWithReference(el.children, elementsWithReference)
  }
  return elementsWithReference
}
