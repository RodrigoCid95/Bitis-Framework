module.exports.On = function On(methods, args) {
  return (target, propertyKey, descriptor) => {
    if (!target.hasOwnProperty('routes')) {
      target.routes = []
    }
    methods = Array.isArray(methods) ? methods : [methods]
    const fun = propertyKey
    const middlewares = [propertyKey]
    if (typeof args === 'object') {
      if (args.beforeMiddlewares) {
        for (const middleware of args.beforeMiddlewares) {
          if (typeof middleware === 'string' && !target.hasOwnProperty(middleware)) {
            console.error(`\n${target.constructor.name}: El middelware ${middleware} no está declarado!`)
            process.exit()
          } else {
            middlewares.unshift(middleware)
          }
        }
      }
      if (args.afterMiddlewares) {
        for (const middleware of args.afterMiddlewares) {
          if (typeof middleware === 'string' && !target.hasOwnProperty(middleware)) {
            console.error(`\n${target.constructor.name}: El middelware ${middleware} no está declarado!`)
            process.exit()
          } else {
            middlewares.push(middleware)
          }
        }
      }
    }
    methods.forEach(method => target.routes.push({
      path: typeof args === 'string' ? args : args.path,
      method: method,
      func: fun,
      middlewares,
    }))
    return descriptor
  }
}
module.exports.Prefix = function Prefix(pre) {
  return function (constructor) {
    return class extends constructor {
      prefix = pre
    }
  }
}
module.exports.Methods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete'
}
module.exports.initHttpServer = function initHttpServer({ returnInstance = false, modelManager, httpControllers: httpControllersClasses, bitisHttpConfig = {}, onMessage = console.log }) {
  const Path = require('path')
  const express = require('express')
  let app = express()
  const http = require('http')
  const server = http.createServer(app)
  const routers = []
  for (const nameClass in httpControllersClasses) {
    const httpControllerClass = httpControllersClasses[nameClass]
    if (httpControllerClass.prototype.routes) {
      const routes = httpControllerClass.prototype.routes
      delete httpControllerClass.prototype.routes
      let models = []
      if (httpControllerClass.prototype.models) {
        models = httpControllerClass.prototype.models.map(({ propertyMod, model }) => ({ propertyMod, model: modelManager.getModel(model) }))
        delete httpControllerClass.prototype.models
      }
      for (const { propertyMod, model } of models) {
        httpControllerClass.prototype[propertyMod] = model
      }
      const instanceHttpController = new httpControllerClass()
      let prefix = ''
      if (instanceHttpController.prefix) {
        prefix = `/${instanceHttpController.prefix}`
        delete instanceHttpController.prefix
      }
      const router = express.Router()
      for (let { path, middlewares, method, func } of routes) {
        path = prefix + path
        if (middlewares) {
          const midd = middlewares.map(middleware => (typeof middleware === 'string') ? instanceHttpController[middleware].bind(instanceHttpController) : middleware)
          router[method](path, midd)
        } else {
          const fn = instanceHttpController[func].bind(instanceHttpController)
          router[method](path, fn)
        }
      }
      routers.push(router)
    }
  }
  const {
    port = (process.env.PORT ? parseInt(process.env.PORT) : 3001),
    dev,
    events = {},
    middlewares = [],
    pathsPublic,
    engineTemplates,
    optionsUrlencoded
  } = bitisHttpConfig
  app.set('port', port)
  let externalIp = null
  if (dev && dev.showExternalIp) {
    const interfaces = require("os").networkInterfaces()
    if (dev.interfaceNetwork) {
      const inter = interfaces[dev.interfaceNetwork]
      if (inter) {
        externalIp = inter.find(item => item.family == 'IPv4').address
      } else {
        console.error(`\nLa interfáz de red "${dev.interfaceNetwork}" no existe!.\nSe pueden usar las isguientes interfaces:\n${Object.keys(interfaces).join(', ')}`)
      }
    } else {
      console.error('\nNo se definió una interfaz de red.\nSe pueden usar las isguientes interfaces:\n' + Object.keys(interfaces).join(', '))
    }
  }
  if (events.beforeConfig) {
    events.beforeConfig(app)
  }
  if (optionsUrlencoded) {
    app.use(express.urlencoded(optionsUrlencoded))
  }
  for (const middleware of middlewares) {
    app.use(middleware)
  }
  if (pathsPublic) {
    pathsPublic.forEach(({ route, dir }) => app.use(route, express.static(dir)))
  }
  if (engineTemplates) {
    app.engine(engineTemplates.ext, engineTemplates.callback)
    app.set('views', engineTemplates.dirViews)
    app.set('view engine', engineTemplates.name)
  }
  if (events.afterConfig) {
    events.afterConfig(app)
  }
  app.use(express.json())
  for (const router of routers) {
    app.use(router)
  }
  if (events.onError) {
    app.use(events.onError)
  }
  server.listen(port, () => {
    onMessage(`Servidor corriendo en: http://localhost:${port}${externalIp ? ` y http://${externalIp}:${port}` : ''}`)
  })
  if (events.beforeStarting) {
    events.beforeStarting(app)
  }
  if (returnInstance) {
    return server
  }
}
