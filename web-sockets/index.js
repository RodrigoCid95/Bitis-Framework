module.exports.On = function On(nameEvent) {
  return (target, propertyKey, descriptor) => {
    if (!target.hasOwnProperty('routes')) {
      target.routes = []
    }
    target.routes.push({ nameEvent, propertyKey })
    return descriptor
  }
}
module.exports.Prefix = function Prefix(prefix) {
  return function (constructor) {
    return class extends constructor {
      prefix = prefix
    }
  }
}
module.exports.initSocketsServer = function initSocketsServer({ http, modelManager, libraryManager, socketsControllers: socketsControllerClasses, bitisSocketsConfig = {}, onError = console.error }) {
  const path = require('path')
  const SocketIO = require('socket.io')
  let io = null
  const {
    port = process.env.PORT ? parseInt(process.env.PORT) : 80,
    events = {}
  } = bitisSocketsConfig
  if (http) {
    io = new SocketIO.Server(http, bitisSocketsConfig)
  } else {
    io = SocketIO(port, bitisSocketsConfig)
  }
  if (events.onBeforeConfig) {
    io = events.onBeforeConfig(io)
  }
  const sRoutes = []
  for (const nameClass in socketsControllerClasses) {
    const socketsControllerClass = socketsControllerClasses[nameClass]
    if (socketsControllerClass.prototype.routes) {
      const routes = socketsControllerClass.prototype.routes
      delete socketsControllerClass.prototype.routes
      let models = []
      if (socketsControllerClass.prototype.models) {
        models = socketsControllerClass.prototype.models.map(({ propertyMod, model }) => ({
          propertyMod,
          model: modelManager.getModel(model)
        }))
        delete socketsControllerClass.prototype.models
      }
      socketsControllerClass.prototype['io'] = io
      for (const { propertyMod, model } of models) {
        socketsControllerClass.prototype[propertyMod] = model
      }
      const instanceSocketsController = new socketsControllerClass()
      let prefix = ''
      if (instanceSocketsController.prefix) {
        prefix = instanceSocketsController.prefix
        delete instanceSocketsController.prefix
      }
      for (let { nameEvent, propertyKey } of routes) {
        nameEvent = prefix !== '' ? `${prefix} ${nameEvent}` : nameEvent
        sRoutes.push({
          nameEvent,
          callback: instanceSocketsController[propertyKey].bind(instanceSocketsController)
        })
      }
    }
  }
  io.on('connect', socket => {
    if (events.onConnect) {
      events.onConnect(socket)
    }
    for (const { nameEvent, callback } of sRoutes) {
      socket.on(nameEvent, (...args) => {
        const end = args.find(arg => typeof arg === 'function')
        let argmnts = args.filter(arg => typeof arg !== 'function')
        const { getLibrary } = libraryManager
        try {
          if (events.onANewRequest) {
            argmnts = events.onANewRequest(argmnts, socket, getLibrary.bind(libraryManager))
          }
          argmnts.push(socket)
          let contentReturn = callback(...argmnts)
          if (contentReturn instanceof Promise) {
            contentReturn.then((response) => {
              if (events.onBeforeToAnswer) {
                response = events.onBeforeToAnswer(response, socket, getLibrary.bind(libraryManager))
              }
              if (end) {
                end(response)
              }
            }).catch(error => {
              error = {
                ...error,
                error: true,
                level: error.code != undefined ? 1 : 0,
                code: error.code != undefined ? error.code : 0,
                message: error.message != undefined ? error.message : error
              }
              if (end) {
                end(end)
              }
              onError(JSON.stringify(end))
            })
          } else {
            if (events.onBeforeToAnswer) {
              contentReturn = events.onBeforeToAnswer(contentReturn, socket, getLibrary.bind(libraryManager))
            }
            if (end) {
              end(contentReturn)
            }
          }
        } catch (error) {
          error = {
            ...error,
            error: true,
            level: 0,
            code: error.code !== undefined ? error.code : 0,
            message: error.message !== undefined ? error.message : error,
            stack: error.stack
          }
          onError(JSON.stringify(end))
          if (events.onBeforeToAnswer) {
            error = events.onBeforeToAnswer(error, socket, getLibrary)
          }
          if (end) {
            end(contentReturn)
          }
        }
      })
    }
  })
}
